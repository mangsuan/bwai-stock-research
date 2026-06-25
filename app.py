from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
import httpx
import json
import os
import asyncio
import time
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
from authlib.integrations.starlette_client import OAuth
from database import (
    init_db, get_cached_research, cache_research,
    save_agent_result, get_agent_results, save_final_synthesis, get_final_synthesis,
    create_user, get_user_by_username, get_user_by_id, get_or_create_oauth_user,
    add_to_watchlist, remove_from_watchlist, get_watchlist, is_in_watchlist,
    update_user_profile, update_user_avatar, get_user_full,
    add_points, get_member_points, get_point_history,
)

load_dotenv()

app = FastAPI(title="BWAI Stock Research API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory for avatars
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads", "avatars")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "uploads")), name="uploads")


# ---------- Auth Configuration ----------

JWT_SECRET = os.getenv("JWT_SECRET", "bwai-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# OAuth Configuration
oauth = OAuth()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

if FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET:
    oauth.register(
        name="facebook",
        client_id=FACEBOOK_CLIENT_ID,
        client_secret=FACEBOOK_CLIENT_SECRET,
        authorize_url="https://www.facebook.com/v18.0/dialog/oauth",
        access_token_url="https://graph.facebook.com/v18.0/oauth/access_token",
        api_base_url="https://graph.facebook.com/v18.0/",
        client_kwargs={"scope": "email"},
    )


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict | None:
    """Extract user from JWT token. Returns None if no token or invalid."""
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return await get_user_by_id(int(user_id))
    except JWTError:
        return None


async def require_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Require a valid JWT token. Raises 401 if invalid."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await get_user_by_id(int(user_id))
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.on_event("startup")
async def startup():
    await init_db()

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart"
YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v10/finance/quoteSummary"
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}

# AI API base config
AI_API_URL = os.getenv("AI_API_URL", "https://proxy.vibecode.tours/v1/chat/completions")
AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")

# Multi-agent configuration
AGENTS = [
    {
        "name": "deepseek",
        "model": "deepseek-flash",
        "role": "Quick analysis — fast, cost-effective first pass",
    },
    {
        "name": "mimo",
        "model": "mimo-v2.5",
        "role": "Deep analysis — nuanced reasoning, catches subtle risks",
    },
    {
        "name": "mimo-pro",
        "model": "mimo-v2.5-pro",
        "role": "Validation — second opinion, flags contradictions",
    },
]

JUDGE_MODEL = os.getenv("JUDGE_MODEL", "mimo-v2.5-pro")


# ---------- Response Models ----------


class StockQuote(BaseModel):
    ticker: str
    company_name: str
    sector: str
    price: float | None
    change_pct: float | None
    market_cap: str | None
    pe_ratio: float | None
    fifty_two_week_high: float | None
    fifty_two_week_low: float | None
    dividend_yield: float | None
    beta: float | None
    summary: str


class AgentAnalysis(BaseModel):
    agent_name: str
    model_id: str
    summary: str
    bull_factors: list[str]
    bear_factors: list[str]
    risks: list[str]
    conclusion: str
    confidence: float | None
    response_time_ms: int | None


class StockResearch(BaseModel):
    ticker: str
    company_name: str
    sector: str
    summary: str
    bull_factors: list[str]
    bear_factors: list[str]
    risks: list[str]
    conclusion: str
    agents_used: list[str]
    agent_analyses: list[AgentAnalysis]


# ---------- Helpers ----------


def _format_market_cap(cap) -> str | None:
    if cap is None:
        return None
    if cap >= 1e12:
        return f"${cap / 1e12:.2f}T"
    if cap >= 1e9:
        return f"${cap / 1e9:.2f}B"
    if cap >= 1e6:
        return f"${cap / 1e6:.2f}M"
    return f"${cap:,.0f}"


async def _yahoo_chart(ticker: str) -> dict:
    async with httpx.AsyncClient(headers=HEADERS) as client:
        resp = await client.get(
            f"{YAHOO_CHART_URL}/{ticker}",
            params={"interval": "1d", "range": "5d"},
            timeout=10,
        )
        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Yahoo Finance error: HTTP {resp.status_code}")
        data = resp.json()
        results = data.get("chart", {}).get("result", [])
        if not results:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")
        return results[0].get("meta", {})


async def _yahoo_quote_summary(ticker: str, modules: str) -> dict | None:
    try:
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True) as client:
            await client.get("https://finance.yahoo.com/", timeout=5)
            crumb_resp = await client.get("https://query2.finance.yahoo.com/v1/test/getcrumb", timeout=5)
            if crumb_resp.status_code != 200 or len(crumb_resp.text) > 100:
                return None
            resp = await client.get(
                f"{YAHOO_QUOTE_URL}/{ticker}",
                params={"modules": modules, "crumb": crumb_resp.text},
                timeout=10,
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            results = data.get("quoteSummary", {}).get("result", [])
            return results[0] if results else None
    except Exception:
        return None


# ---------- Stock List (SEC EDGAR) ----------

SEC_EDGAR_URL = "https://www.sec.gov/files/company_tickers.json"
SEC_HEADERS = {"User-Agent": "BWAI Stock Research bot@bwai.app"}

# In-memory cache
_stock_list_cache: list[dict] = []
_stock_list_cache_time: float = 0
STOCK_CACHE_TTL = 86400  # 24 hours

# Fallback popular stocks
POPULAR_STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
    {"symbol": "BRK.B", "name": "Berkshire Hathaway Inc.", "exchange": "NYSE"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
    {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
    {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
    {"symbol": "WMT", "name": "Walmart Inc.", "exchange": "NYSE"},
    {"symbol": "PG", "name": "Procter & Gamble Co.", "exchange": "NYSE"},
    {"symbol": "MA", "name": "Mastercard Inc.", "exchange": "NYSE"},
    {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "exchange": "NYSE"},
    {"symbol": "HD", "name": "Home Depot Inc.", "exchange": "NYSE"},
    {"symbol": "DIS", "name": "Walt Disney Co.", "exchange": "NYSE"},
    {"symbol": "BAC", "name": "Bank of America Corp.", "exchange": "NYSE"},
    {"symbol": "XOM", "name": "Exxon Mobil Corp.", "exchange": "NYSE"},
    {"symbol": "KO", "name": "Coca-Cola Co.", "exchange": "NYSE"},
]


async def _fetch_stock_list() -> list[dict]:
    """Fetch stock list from SEC EDGAR, cached for 24h."""
    global _stock_list_cache, _stock_list_cache_time
    now = time.time()

    if _stock_list_cache and (now - _stock_list_cache_time) < STOCK_CACHE_TTL:
        return _stock_list_cache

    try:
        async with httpx.AsyncClient(headers=SEC_HEADERS) as client:
            resp = await client.get(SEC_EDGAR_URL, timeout=15)
            if resp.status_code != 200:
                print(f"SEC EDGAR error: HTTP {resp.status_code}")
                return _stock_list_cache if _stock_list_cache else POPULAR_STOCKS

            data = resp.json()
            stocks = []
            for entry in data.values():
                stocks.append({
                    "symbol": entry.get("ticker", "").upper(),
                    "name": entry.get("title", ""),
                    "exchange": "SEC",
                })

            # Sort by symbol
            stocks.sort(key=lambda s: s["symbol"])
            _stock_list_cache = stocks
            _stock_list_cache_time = now
            print(f"Loaded {len(stocks)} stocks from SEC EDGAR")
            return stocks
    except Exception as e:
        print(f"Failed to fetch SEC EDGAR stock list: {e}")
        return _stock_list_cache if _stock_list_cache else POPULAR_STOCKS


@app.get("/stocks/popular")
async def get_popular_stocks():
    """Return popular stock tickers for quick access."""
    return {"stocks": POPULAR_STOCKS}


@app.get("/stocks")
async def list_stocks(q: str = "", page: int = 1, per_page: int = 50):
    """List stocks with optional search and pagination.

    Query params:
        q: Search term (matches symbol or company name)
        page: Page number (1-based)
        per_page: Items per page (default 50, max 200)
    """
    per_page = min(per_page, 200)
    page = max(page, 1)

    stocks = await _fetch_stock_list()

    # Filter by search query
    if q:
        query = q.upper().strip()
        stocks = [
            s for s in stocks
            if query in s["symbol"].upper() or query in s["name"].upper()
        ]

    total = len(stocks)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
    end = start + per_page

    return {
        "stocks": stocks[start:end],
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
    }


# ---------- Routes ----------


@app.get("/")
def root():
    return {"message": "BWAI Stock Research API"}


@app.get("/quote/{ticker}", response_model=StockQuote)
async def get_stock_quote(ticker: str):
    ticker = ticker.upper()
    data = await fetch_stock_data(ticker)
    return StockQuote(
        ticker=ticker, company_name=data["company_name"], sector=data["sector"],
        price=data["price"], change_pct=data["change_pct"], market_cap=data["market_cap"],
        pe_ratio=data["pe_ratio"], fifty_two_week_high=data["fifty_two_week_high"],
        fifty_two_week_low=data["fifty_two_week_low"], dividend_yield=data["dividend_yield"],
        beta=data["beta"], summary=data["business_summary"],
    )


@app.get("/research/{ticker}", response_model=StockResearch)
async def get_stock_research(ticker: str):
    """Multi-agent stock research.

    1. Check cache for final synthesis
    2. Fetch stock data from Yahoo Finance
    3. Fan out to all AI agents in parallel
    4. Synthesize results with judge AI
    5. Cache and return
    """
    ticker = ticker.upper()

    # Step 1: Check cache
    cached = await get_cached_research(ticker)
    if cached:
        agent_results = await get_agent_results(ticker)
        return StockResearch(
            ticker=cached["ticker"], company_name=cached["company_name"],
            sector=cached["sector"], summary=cached["summary"],
            bull_factors=json.loads(cached["bull_factors"]),
            bear_factors=json.loads(cached["bear_factors"]),
            risks=json.loads(cached["risks"]),
            conclusion=cached["conclusion"],
            agents_used=[a["agent_name"] for a in agent_results],
            agent_analyses=[AgentAnalysis(**a) for a in agent_results],
        )

    # Step 2: Fetch stock data
    stock_data = await fetch_stock_data(ticker)
    stock_data["ticker"] = ticker

    # Step 3: Fan out to all agents in parallel
    agent_analyses = await _run_agents(stock_data)

    # Step 4: Synthesize with judge AI
    synthesis = await _synthesize_analyses(stock_data, agent_analyses)

    # Step 5: Cache results
    synthesis["company_name"] = stock_data["company_name"]
    synthesis["sector"] = stock_data["sector"]
    await cache_research(ticker, synthesis, stock_data.get("price"))
    await save_final_synthesis(ticker, synthesis, [a.agent_name for a in agent_analyses])

    return StockResearch(
        ticker=ticker, company_name=stock_data["company_name"],
        sector=stock_data["sector"],
        summary=synthesis["summary"],
        bull_factors=synthesis["bull_factors"],
        bear_factors=synthesis["bear_factors"],
        risks=synthesis["risks"],
        conclusion=synthesis["conclusion"],
        agents_used=[a.agent_name for a in agent_analyses],
        agent_analyses=agent_analyses,
    )


@app.get("/cache/{ticker}")
async def get_cache_status(ticker: str):
    ticker = ticker.upper()
    cached = await get_cached_research(ticker)
    if not cached:
        return {"ticker": ticker, "cached": False}
    return {"ticker": ticker, "cached": True, "cached_at": cached["cached_at"], "price_at_time": cached["price_at_time"]}


@app.get("/agents")
async def list_agents():
    """List available AI agents and their roles."""
    return {"agents": AGENTS, "judge_model": JUDGE_MODEL}


# ---------- Auth Endpoints ----------


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: str | None = None
    theme: str = "light"
    avatar_url: str | None = None
    member_level: str = "entry"
    total_points: int = 0


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    theme: str | None = None


class PointsEarnRequest(BaseModel):
    amount: int
    description: str | None = None


@app.post("/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    """Register a new user."""
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    hashed = pwd_context.hash(req.password)
    try:
        user = await create_user(req.username, req.email, hashed)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user["id"], username=user["username"], email=user["email"]),
    )


@app.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with username and password."""
    user = await get_user_by_username(req.username)
    if user is None or not pwd_context.verify(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Get full profile
    full = await get_user_full(user["id"])
    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"], username=user["username"], email=user["email"],
            display_name=full.get("display_name") if full else None,
            theme=full.get("theme", "light") if full else "light",
            avatar_url=full.get("avatar_url") if full else None,
            member_level=full.get("member_level", "entry") if full else "entry",
            total_points=full.get("total_points", 0) if full else 0,
        ),
    )


@app.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_user)):
    """Get current user info with profile and member data."""
    full = await get_user_full(user["id"])
    if full is None:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=full["id"],
        username=full["username"],
        email=full["email"],
        display_name=full.get("display_name"),
        theme=full.get("theme", "light"),
        avatar_url=full.get("avatar_url"),
        member_level=full.get("member_level", "entry"),
        total_points=full.get("total_points", 0),
    )


@app.put("/auth/profile", response_model=UserResponse)
async def update_profile(req: ProfileUpdateRequest, user: dict = Depends(require_user)):
    """Update user profile (display name, theme)."""
    try:
        await update_user_profile(user["id"], display_name=req.display_name, theme=req.theme)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    full = await get_user_full(user["id"])
    return UserResponse(
        id=full["id"], username=full["username"], email=full["email"],
        display_name=full.get("display_name"), theme=full.get("theme", "light"),
        avatar_url=full.get("avatar_url"), member_level=full.get("member_level", "entry"),
        total_points=full.get("total_points", 0),
    )


@app.post("/auth/avatar", response_model=UserResponse)
async def upload_avatar(file: UploadFile = File(...), user: dict = Depends(require_user)):
    """Upload profile picture."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{user['id']}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    with open(filepath, "wb") as f:
        f.write(content)

    avatar_url = f"/uploads/avatars/{filename}"
    try:
        await update_user_avatar(user["id"], avatar_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    full = await get_user_full(user["id"])
    return UserResponse(
        id=full["id"], username=full["username"], email=full["email"],
        display_name=full.get("display_name"), theme=full.get("theme", "light"),
        avatar_url=full.get("avatar_url"), member_level=full.get("member_level", "entry"),
        total_points=full.get("total_points", 0),
    )


# ---------- Member Endpoints ----------


class MemberPointsResponse(BaseModel):
    level: str
    points: int
    current_threshold: int
    next_threshold: int
    progress_pct: float
    points_to_next: int


@app.get("/member/points", response_model=MemberPointsResponse)
async def get_my_points(user: dict = Depends(require_user)):
    """Get current user's member points and level."""
    return await get_member_points(user["id"])


@app.post("/member/points/earn", response_model=MemberPointsResponse)
async def earn_points(req: PointsEarnRequest, user: dict = Depends(require_user)):
    """Earn points (e.g., from watching ads)."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    try:
        return await add_points(user["id"], req.amount, "ad_reward", req.description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/member/points/purchase", response_model=MemberPointsResponse)
async def purchase_points(req: PointsEarnRequest, user: dict = Depends(require_user)):
    """Purchase points manually."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    try:
        return await add_points(user["id"], req.amount, "purchase", "Manual purchase")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/member/history")
async def get_my_point_history(user: dict = Depends(require_user)):
    """Get point transaction history."""
    return await get_point_history(user["id"])


# ---------- OAuth Endpoints ----------


@app.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth login."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    redirect_uri = f"{FRONTEND_URL}/auth/callback/google"
    return await oauth.google.authorize_redirect(redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request):
    """Handle Google OAuth callback."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")

    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")

    user = await get_or_create_oauth_user(
        provider="google",
        oauth_id=user_info["sub"],
        email=user_info["email"],
        name=user_info.get("name", user_info["email"].split("@")[0]),
        avatar_url=user_info.get("picture"),
    )

    jwt_token = create_access_token({"sub": str(user["id"])})
    return {"access_token": jwt_token, "token_type": "bearer", "user": user}


@app.get("/auth/facebook")
async def facebook_login():
    """Redirect to Facebook OAuth login."""
    if not FACEBOOK_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Facebook OAuth not configured")
    redirect_uri = f"{FRONTEND_URL}/auth/callback/facebook"
    return await oauth.facebook.authorize_redirect(redirect_uri)


@app.get("/auth/facebook/callback")
async def facebook_callback(request):
    """Handle Facebook OAuth callback."""
    if not FACEBOOK_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Facebook OAuth not configured")

    token = await oauth.facebook.authorize_access_token(request)
    resp = await oauth.facebook.get("me?fields=id,name,email,picture", token=token)
    user_info = resp.json()

    if not user_info.get("id"):
        raise HTTPException(status_code=400, detail="Failed to get user info from Facebook")

    avatar_url = None
    if user_info.get("picture", {}).get("data", {}).get("url"):
        avatar_url = user_info["picture"]["data"]["url"]

    user = await get_or_create_oauth_user(
        provider="facebook",
        oauth_id=user_info["id"],
        email=user_info.get("email", f"{user_info['id']}@facebook.com"),
        name=user_info.get("name", "Facebook User"),
        avatar_url=avatar_url,
    )

    jwt_token = create_access_token({"sub": str(user["id"])})
    return {"access_token": jwt_token, "token_type": "bearer", "user": user}


@app.get("/auth/providers")
async def get_auth_providers():
    """List available OAuth providers."""
    providers = []
    if GOOGLE_CLIENT_ID:
        providers.append({"name": "google", "label": "Google"})
    if FACEBOOK_CLIENT_ID:
        providers.append({"name": "facebook", "label": "Facebook"})
    return {"providers": providers}


# ---------- Watchlist Endpoints ----------


class WatchlistAddRequest(BaseModel):
    ticker: str


class WatchlistItem(BaseModel):
    ticker: str
    added_at: str | None


@app.get("/watchlist", response_model=list[WatchlistItem])
async def get_my_watchlist(user: dict = Depends(require_user)):
    """Get current user's watchlist."""
    return await get_watchlist(user["id"])


@app.post("/watchlist")
async def add_ticker_to_watchlist(
    req: WatchlistAddRequest,
    user: dict = Depends(require_user),
):
    """Add a ticker to watchlist."""
    result = await add_to_watchlist(user["id"], req.ticker)
    return result


@app.delete("/watchlist/{ticker}")
async def remove_ticker_from_watchlist(
    ticker: str,
    user: dict = Depends(require_user),
):
    """Remove a ticker from watchlist."""
    removed = await remove_from_watchlist(user["id"], ticker)
    if not removed:
        raise HTTPException(status_code=404, detail="Ticker not in watchlist")
    return {"ticker": ticker.upper(), "status": "removed"}


@app.get("/watchlist/{ticker}/check")
async def check_watchlist(
    ticker: str,
    user: dict = Depends(require_user),
):
    """Check if a ticker is in watchlist."""
    in_list = await is_in_watchlist(user["id"], ticker)
    return {"ticker": ticker.upper(), "in_watchlist": in_list}


# ---------- Data Fetching ----------


async def fetch_stock_data(ticker: str) -> dict:
    chart_meta = await _yahoo_chart(ticker)
    summary_data = await _yahoo_quote_summary(ticker, "price,summaryProfile,defaultKeyStatistics")

    price = chart_meta.get("regularMarketPrice")
    prev_close = chart_meta.get("chartPreviousClose")
    change_pct = round((price - prev_close) / prev_close * 100, 2) if price and prev_close else None

    result = {
        "company_name": chart_meta.get("longName") or chart_meta.get("shortName", ticker),
        "sector": "Unknown", "industry": "Unknown",
        "price": round(price, 2) if price else None,
        "change_pct": change_pct,
        "market_cap": None, "pe_ratio": None,
        "fifty_two_week_high": chart_meta.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": chart_meta.get("fiftyTwoWeekLow"),
        "dividend_yield": None, "beta": None,
        "business_summary": f"{chart_meta.get('longName', ticker)} is traded on {chart_meta.get('fullExchangeName', chart_meta.get('exchangeName', 'N/A'))}.",
    }

    if summary_data:
        price_data = summary_data.get("price", {})
        profile = summary_data.get("summaryProfile", {})
        stats = summary_data.get("defaultKeyStatistics", {})
        result["sector"] = profile.get("sector") or result["sector"]
        result["industry"] = profile.get("industry") or result["industry"]
        mc = price_data.get("marketCap", {})
        raw_mc = mc.get("raw") if isinstance(mc, dict) else mc
        if raw_mc:
            result["market_cap"] = _format_market_cap(raw_mc)
        pe = stats.get("trailingPE", {})
        result["pe_ratio"] = pe.get("raw") if isinstance(pe, dict) else pe
        beta = stats.get("beta", {})
        result["beta"] = beta.get("raw") if isinstance(beta, dict) else beta
        div = stats.get("yield", {})
        raw_div = div.get("raw") if isinstance(div, dict) else div
        if raw_div:
            result["dividend_yield"] = round(raw_div * 100, 2)
        long_summary = profile.get("longBusinessSummary", "")
        if long_summary:
            result["business_summary"] = long_summary

    return result


# ---------- Multi-Agent Analysis ----------


def _build_stock_context(stock_data: dict) -> str:
    """Build a concise one-line data summary for AI prompts."""
    parts = [f"{stock_data['company_name']} ({stock_data.get('ticker', 'N/A')})"]
    if stock_data.get("price"):
        parts.append(f"price ${stock_data['price']:.2f}")
    if stock_data.get("change_pct") is not None:
        parts.append(f"change {stock_data['change_pct']:+.2f}%")
    if stock_data.get("market_cap"):
        parts.append(f"mkt cap {stock_data['market_cap']}")
    if stock_data.get("pe_ratio"):
        parts.append(f"P/E {stock_data['pe_ratio']:.1f}")
    if stock_data.get("fifty_two_week_high"):
        parts.append(f"52w high ${stock_data['fifty_two_week_high']:.2f}")
    if stock_data.get("fifty_two_week_low"):
        parts.append(f"52w low ${stock_data['fifty_two_week_low']:.2f}")
    if stock_data.get("dividend_yield"):
        parts.append(f"div {stock_data['dividend_yield']:.2f}%")
    if stock_data.get("beta"):
        parts.append(f"beta {stock_data['beta']:.2f}")
    parts.append(f"sector: {stock_data['sector']}")
    return ", ".join(parts)


def _parse_ai_response(text: str) -> dict:
    """Parse JSON from AI response, handling markdown fences."""
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    return json.loads(text)


async def _call_ai_agent(agent_name: str, model: str, stock_context: str, company_name: str) -> tuple[dict, int]:
    """Call a single AI agent and return (parsed_result, response_time_ms)."""
    start = time.time()

    system_prompt = (
        "You are a stock research analyst. Respond with ONLY valid JSON. "
        "No markdown, no code fences, no extra text. "
        "Keep each bullet to 1 sentence max. Be concise."
    )
    user_prompt = (
        f"Analyze {company_name}. Data: {stock_context}.\n\n"
        'Return JSON: {"summary":"1-2 sentences","bull_factors":["f1","f2","f3"],'
        '"bear_factors":["f1","f2"],"risks":["r1","r2"],"conclusion":"1-2 sentences"}'
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 2048,
        "temperature": 0.3,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            AI_API_URL,
            headers={"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=60,
        )
        if resp.status_code != 200:
            raise Exception(f"AI API error: HTTP {resp.status_code}")

        result = resp.json()
        response_text = result["choices"][0]["message"]["content"].strip()

    elapsed = int((time.time() - start) * 1000)
    return _parse_ai_response(response_text), elapsed


async def _run_agents(stock_data: dict) -> list[AgentAnalysis]:
    """Run all AI agents in parallel and collect results."""
    stock_context = _build_stock_context(stock_data)
    ticker = stock_data["ticker"]
    company_name = stock_data["company_name"]

    async def run_one(agent: dict) -> AgentAnalysis | None:
        try:
            result, elapsed = await _call_ai_agent(
                agent["name"], agent["model"], stock_context, company_name
            )
            # Save to database
            await save_agent_result(ticker, agent["name"], agent["model"], result, elapsed)
            return AgentAnalysis(
                agent_name=agent["name"],
                model_id=agent["model"],
                summary=result.get("summary", ""),
                bull_factors=result.get("bull_factors", []),
                bear_factors=result.get("bear_factors", []),
                risks=result.get("risks", []),
                conclusion=result.get("conclusion", ""),
                confidence=result.get("confidence"),
                response_time_ms=elapsed,
            )
        except Exception as e:
            # Log but don't fail — other agents may succeed
            print(f"Agent {agent['name']} failed: {e}")
            return None

    # Run all agents in parallel
    tasks = [run_one(agent) for agent in AGENTS]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]


async def _synthesize_analyses(stock_data: dict, agent_analyses: list[AgentAnalysis]) -> dict:
    """Use a judge AI to synthesize all agent analyses into a final result."""
    if not agent_analyses:
        return _generate_heuristic_research(stock_data).model_dump()

    # Build the synthesis prompt with all agent analyses
    agent_summaries = []
    for a in agent_analyses:
        agent_summaries.append(
            f"--- {a.agent_name} ({a.model_id}) ---\n"
            f"Summary: {a.summary}\n"
            f"Bull: {', '.join(a.bull_factors)}\n"
            f"Bear: {', '.join(a.bear_factors)}\n"
            f"Risks: {', '.join(a.risks)}\n"
            f"Conclusion: {a.conclusion}"
        )

    all_analyses = "\n\n".join(agent_summaries)

    system_prompt = (
        "You are a senior stock research analyst. You will receive analyses from multiple AI agents. "
        "Your job is to synthesize them into a single, balanced, high-quality analysis. "
        "Identify consensus points (mentioned by multiple agents), resolve contradictions, "
        "and produce the most accurate final assessment. "
        "Respond with ONLY valid JSON. No markdown, no code fences."
    )
    user_prompt = (
        f"Stock: {stock_data['company_name']} ({stock_data.get('ticker', 'N/A')})\n"
        f"Data: {_build_stock_context(stock_data)}\n\n"
        f"Agent Analyses:\n{all_analyses}\n\n"
        'Synthesize into JSON: {"summary":"2-3 sentences","bull_factors":["f1","f2","f3"],'
        '"bear_factors":["f1","f2"],"risks":["r1","r2"],"conclusion":"2-3 sentences"}'
    )

    payload = {
        "model": JUDGE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                AI_API_URL,
                headers={"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"},
                json=payload,
                timeout=60,
            )
            if resp.status_code != 200:
                raise Exception(f"Judge AI error: HTTP {resp.status_code}")

            result = resp.json()
            response_text = result["choices"][0]["message"]["content"].strip()

        return _parse_ai_response(response_text)
    except Exception as e:
        print(f"Judge synthesis failed: {e}, using first agent result")
        # Fallback: use the first agent's result
        first = agent_analyses[0]
        return {
            "summary": first.summary,
            "bull_factors": first.bull_factors,
            "bear_factors": first.bear_factors,
            "risks": first.risks,
            "conclusion": first.conclusion,
        }


def _generate_heuristic_research(stock_data: dict) -> StockResearch:
    """Fallback heuristic research."""
    name = stock_data["company_name"]
    sector = stock_data["sector"]
    bull_factors, bear_factors, risks = [], [], []

    pe = stock_data.get("pe_ratio")
    if pe and pe < 25:
        bull_factors.append(f"Reasonable valuation with P/E of {pe:.1f}")
    elif pe and pe > 40:
        bear_factors.append(f"High valuation with P/E of {pe:.1f}")

    beta = stock_data.get("beta")
    if beta and beta > 1.5:
        risks.append(f"High volatility (beta {beta:.2f})")
    elif beta and beta < 0.8:
        bull_factors.append(f"Lower volatility (beta {beta:.2f})")

    price = stock_data.get("price")
    high_52w = stock_data.get("fifty_two_week_high")
    low_52w = stock_data.get("fifty_two_week_low")
    if price and high_52w:
        off_high = (1 - price / high_52w) * 100
        if off_high > 20:
            bear_factors.append(f"Down {off_high:.0f}% from 52-week high")
    if price and low_52w:
        above_low = (price / low_52w - 1) * 100
        if above_low < 10:
            bear_factors.append(f"Trading near 52-week low")

    if not bull_factors:
        bull_factors.append("Established market presence")
    if not bear_factors:
        bear_factors.append("Valuation requires further analysis")
    if not risks:
        risks.append("General market volatility")

    return StockResearch(
        ticker=stock_data.get("ticker", "UNKNOWN"), company_name=name, sector=sector,
        summary=f"{name} operates in the {sector} sector.",
        bull_factors=bull_factors, bear_factors=bear_factors, risks=risks,
        conclusion="Automated snapshot. Further research recommended.",
        agents_used=["heuristic"], agent_analyses=[],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
