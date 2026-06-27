from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator
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
    create_potential_run, complete_potential_run, fail_potential_run,
    save_potential_pick, get_todays_picks, get_pick_by_ticker, get_potential_history,
    create_timeline_snapshot, get_timeline_snapshots, get_pending_snapshot_tickers,
    get_all_users, admin_create_user, admin_update_user, admin_delete_user,
    get_all_transactions, get_pending_purchases, approve_purchase, reject_purchase,
    update_user_page_visibility, add_points_pending,
)

load_dotenv()
load_dotenv("vibe-key.env")  # Load additional config including DATABASE_URL

app = FastAPI(title="BWAI Stock Research API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
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
        if user.get("status") == "suspended":
            raise HTTPException(status_code=403, detail="Account suspended")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(require_user)) -> dict:
    """Require admin role. Raises 403 if not admin."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


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


SECTOR_MAP = {
    "AAPL": ("Technology", "Consumer Electronics", 3.0e12),
    "MSFT": ("Technology", "Software", 2.8e12),
    "GOOGL": ("Technology", "Internet Services", 1.9e12),
    "AMZN": ("Consumer Cyclical", "E-Commerce", 1.8e12),
    "NVDA": ("Technology", "Semiconductors", 2.7e12),
    "META": ("Technology", "Social Media", 1.3e12),
    "TSLA": ("Consumer Cyclical", "Electric Vehicles", 0.8e12),
    "BRK.B": ("Financial", "Conglomerate", 0.9e12),
    "JPM": ("Financial", "Banking", 0.6e12),
    "V": ("Financial", "Payment Services", 0.5e12),
    "JNJ": ("Healthcare", "Pharmaceuticals", 0.4e12),
    "WMT": ("Consumer Defensive", "Retail", 0.5e12),
    "PG": ("Consumer Defensive", "Household Products", 0.4e12),
    "MA": ("Financial", "Payment Services", 0.4e12),
    "UNH": ("Healthcare", "Health Insurance", 0.5e12),
    "HD": ("Consumer Cyclical", "Home Improvement Retail", 0.4e12),
    "DIS": ("Communication Services", "Entertainment", 0.2e12),
    "BAC": ("Financial", "Banking", 0.3e12),
    "XOM": ("Energy", "Oil & Gas", 0.5e12),
    "KO": ("Consumer Defensive", "Beverages", 0.3e12),
}


@app.get("/stocks/sectors")
async def get_stocks_by_sector():
    """Return popular stocks grouped by industry sector with market cap data."""

    async def _enrich_stock(stock: dict) -> dict:
        """Fetch live price for a stock and combine with sector data."""
        sector, industry, est_mc = SECTOR_MAP.get(stock["symbol"], ("Unknown", "Unknown", 0))
        try:
            chart_meta = await _yahoo_chart(stock["symbol"])
            price = chart_meta.get("regularMarketPrice")
            prev_close = chart_meta.get("chartPreviousClose")
            change_pct = round((price - prev_close) / prev_close * 100, 2) if price and prev_close else None
        except Exception:
            price = None
            change_pct = None
        return {
            "symbol": stock["symbol"],
            "name": stock["name"],
            "exchange": stock["exchange"],
            "sector": sector,
            "industry": industry,
            "price": round(price, 2) if price else None,
            "change_pct": change_pct,
            "market_cap": _format_market_cap(est_mc),
            "market_cap_raw": est_mc,
        }

    # Fetch all popular stocks in parallel
    results = await asyncio.gather(*[_enrich_stock(s) for s in POPULAR_STOCKS])

    # Group by sector
    sectors: dict[str, list] = {}
    for stock in results:
        sector = stock["sector"]
        if sector not in sectors:
            sectors[sector] = []
        sectors[sector].append(stock)

    # Sort stocks within each sector by market cap (descending)
    for sector in sectors:
        sectors[sector].sort(key=lambda s: s["market_cap_raw"], reverse=True)

    # Sort sectors by total market cap (descending)
    sorted_sectors = sorted(
        sectors.items(),
        key=lambda kv: sum(s["market_cap_raw"] for s in kv[1]),
        reverse=True,
    )

    return {
        "sectors": [
            {
                "name": sector,
                "stocks": stocks,
                "total_market_cap": _format_market_cap(sum(s["market_cap_raw"] for s in stocks)),
                "count": len(stocks),
            }
            for sector, stocks in sorted_sectors
        ]
    }


@app.get("/stocks")
async def list_stocks(q: str = "", page: int = 1, per_page: int = 50):
    """List stocks with optional search and pagination.

    Query params:
        q: Search term (matches symbol or company name)
        page: Page number (1-based)
        per_page: Items per page (default 50, max 200)
    """
    per_page = max(1, min(per_page, 200))
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

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        import re
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", v):
            raise ValueError("Invalid email format")
        return v


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
    role: str = "user"
    status: str = "active"


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
            role=full.get("role", "user") if full else "user",
            status=full.get("status", "active") if full else "active",
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
        role=full.get("role", "user"),
        status=full.get("status", "active"),
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

    ALLOWED_AVATAR_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    if ext not in ALLOWED_AVATAR_EXTENSIONS:
        ext = "jpg"
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
    if req.amount <= 0 or req.amount > 10000:
        raise HTTPException(status_code=400, detail="Amount must be between 1 and 10000")
    try:
        return await add_points(user["id"], req.amount, "ad_reward", req.description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/member/points/purchase")
async def purchase_points(req: PointsEarnRequest, user: dict = Depends(require_user)):
    """Purchase points (requires admin approval)."""
    if req.amount <= 0 or req.amount > 100000:
        raise HTTPException(status_code=400, detail="Amount must be between 1 and 100000")
    try:
        result = await add_points_pending(user["id"], req.amount, "purchase", req.description or "Point purchase")
        return {"message": "Purchase submitted for admin approval", "transaction_id": result["id"], "status": "pending"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/member/history")
async def get_my_point_history(user: dict = Depends(require_user)):
    """Get point transaction history."""
    return await get_point_history(user["id"])


# ---------- Admin Endpoints ----------


@app.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    """Get admin dashboard stats."""
    from sqlalchemy import select, func as sql_func

    users = await get_all_users()
    pending = await get_pending_purchases()
    transactions = await get_all_transactions(limit=1000)

    return {
        "total_users": len(users),
        "active_users": len([u for u in users if u["status"] == "active"]),
        "suspended_users": len([u for u in users if u["status"] == "suspended"]),
        "admin_users": len([u for u in users if u["role"] == "admin"]),
        "pending_purchases": len(pending),
        "total_transactions": len(transactions),
        "total_points_distributed": sum(t["amount"] for t in transactions if t["approval_status"] == "approved" and t["amount"] > 0),
    }


@app.get("/admin/users")
async def admin_list_users(admin: dict = Depends(require_admin)):
    """List all users."""
    return await get_all_users()


@app.post("/admin/users")
async def admin_create_user_endpoint(
    username: str = "",
    email: str = "",
    password: str = "",
    role: str = "user",
    admin: dict = Depends(require_admin),
):
    """Create a new user."""
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="username, email, and password required")
    try:
        hashed = pwd_context.hash(password)
        return await admin_create_user(username, email, hashed, role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class AdminUserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    display_name: str | None = None
    role: str | None = None
    status: str | None = None
    theme: str | None = None

class AdminVisibilityUpdate(BaseModel):
    visibility: dict | None = None

@app.put("/admin/users/{user_id}")
async def admin_update_user_endpoint(user_id: int, req: AdminUserUpdate, admin: dict = Depends(require_admin)):
    """Update a user."""
    try:
        kwargs = {k: v for k, v in req.model_dump().items() if v is not None}
        return await admin_update_user(user_id, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/admin/users/{user_id}")
async def admin_delete_user_endpoint(user_id: int, admin: dict = Depends(require_admin)):
    """Delete a user."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    success = await admin_delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@app.post("/admin/users/{user_id}/suspend")
async def admin_suspend_user(user_id: int, admin: dict = Depends(require_admin)):
    """Suspend a user."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")
    try:
        return await admin_update_user(user_id, status="suspended")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/admin/users/{user_id}/activate")
async def admin_activate_user(user_id: int, admin: dict = Depends(require_admin)):
    """Activate a suspended user."""
    try:
        return await admin_update_user(user_id, status="active")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/admin/transactions")
async def admin_list_transactions(limit: int = 100, offset: int = 0, admin: dict = Depends(require_admin)):
    """List all point transactions."""
    return await get_all_transactions(limit, offset)


@app.get("/admin/purchases/pending")
async def admin_pending_purchases(admin: dict = Depends(require_admin)):
    """List pending purchase approvals."""
    return await get_pending_purchases()


@app.post("/admin/purchases/{transaction_id}/approve")
async def admin_approve_purchase(transaction_id: int, admin: dict = Depends(require_admin)):
    """Approve a pending purchase."""
    success = await approve_purchase(transaction_id, admin["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found or not pending")
    return {"message": "Purchase approved and points credited"}


@app.post("/admin/purchases/{transaction_id}/reject")
async def admin_reject_purchase(transaction_id: int, admin: dict = Depends(require_admin)):
    """Reject a pending purchase."""
    success = await reject_purchase(transaction_id, admin["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found or not pending")
    return {"message": "Purchase rejected"}


@app.put("/admin/users/{user_id}/visibility")
async def admin_set_visibility(user_id: int, req: AdminVisibilityUpdate, admin: dict = Depends(require_admin)):
    """Set page visibility for a user."""
    try:
        return await update_user_page_visibility(user_id, req.visibility)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- OAuth Endpoints ----------


@app.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth login."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    redirect_uri = f"{FRONTEND_URL}/auth/callback/google"
    return await oauth.google.authorize_redirect(redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request):
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
async def facebook_callback(request: Request):
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

    @field_validator("ticker")
    @classmethod
    def validate_ticker(cls, v: str) -> str:
        v = v.strip().upper()
        if not v or len(v) > 10:
            raise ValueError("Ticker must be 1-10 characters")
        return v


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


# ---------- Potential Stocks Discovery ----------


POTENTIAL_AGENTS = [
    {
        "name": "fundamental",
        "model": "deepseek-flash",
        "role": "Analyze revenue growth, margins, cash flow, debt, balance sheet strength.",
        "prompt": (
            "Analyze the stock's fundamentals. Return ONLY valid JSON:\n"
            '{"score": <0-100>, "explanation": "<1-2 sentences>"}\n'
            "Score based on: revenue growth, profit margins, cash flow, debt levels, balance sheet health."
        ),
    },
    {
        "name": "growth",
        "model": "mimo-v2.5",
        "role": "Analyze industry growth, expansion opportunities, competitive advantage.",
        "prompt": (
            "Analyze the stock's growth potential. Return ONLY valid JSON:\n"
            '{"score": <0-100>, "explanation": "<1-2 sentences>"}\n'
            "Score based on: industry growth rate, market expansion opportunities, product innovation, competitive moat."
        ),
    },
    {
        "name": "valuation",
        "model": "mimo-v2.5",
        "role": "Analyze PE, PB, EV/EBITDA, price-to-sales relative to peers.",
        "prompt": (
            "Analyze the stock's valuation. Return ONLY valid JSON:\n"
            '{"score": <0-100>, "explanation": "<1-2 sentences>"}\n'
            "Score HIGH if undervalued relative to peers and growth. Score LOW if overvalued."
        ),
    },
    {
        "name": "hidden_gem",
        "model": "mimo-v2.5-pro",
        "role": "Determine why this stock is not yet popular and what makes it hidden.",
        "prompt": (
            "Determine if this is a hidden gem stock. Return ONLY valid JSON:\n"
            '{"score": <0-100>, "explanation": "<1-2 sentences>", "why_hidden": "<1-2 sentences explaining why the market has not noticed this stock>"}\n'
            "Score HIGH if: low analyst coverage, low institutional ownership, operates in niche industry, recently listed, market attention focused elsewhere, ignored due to temporary sector weakness.\n"
            "The why_hidden field MUST explain specifically why this stock is underfollowed or overlooked."
        ),
    },
    {
        "name": "change",
        "model": "mimo-v2.5-pro",
        "role": "Detect what recently changed that could be a catalyst.",
        "prompt": (
            "Detect recent positive changes for this stock. Return ONLY valid JSON:\n"
            '{"score": <0-100>, "explanation": "<1-2 sentences>", "what_changed": "<1-2 sentences describing the most important recent change>"}\n'
            "Look for: revenue acceleration, profitability improvement, debt reduction, new contracts, management changes, guidance raises, product launches.\n"
            "The what_changed field MUST describe a specific recent positive change."
        ),
    },
]


async def _call_potential_agent(agent: dict, stock_context: str, company_name: str) -> dict | None:
    """Call a single potential stocks agent. Returns parsed result or None."""
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                AI_API_URL,
                headers={"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": agent["model"],
                    "messages": [
                        {"role": "system", "content": "You are a stock analyst. Respond with ONLY valid JSON. No markdown, no code fences."},
                        {"role": "user", "content": f"Stock data: {stock_context}\n\n{agent['prompt']}"},
                    ],
                    "max_tokens": 1024,
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = _parse_ai_response(content)
            parsed["agent_name"] = agent["name"]
            return parsed
    except Exception as e:
        print(f"Potential agent {agent['name']} error: {e}")
        return None


def _calculate_potential_score(agent_results: list[dict]) -> tuple[float, float]:
    """Calculate weighted potential score and confidence from agent results."""
    weights = {
        "fundamental": 0.25,
        "growth": 0.20,
        "valuation": 0.15,
        "hidden_gem": 0.20,
        "change": 0.20,
    }
    total_weight = 0
    weighted_sum = 0
    for r in agent_results:
        name = r.get("agent_name", "")
        score = r.get("score", 0)
        if isinstance(score, (int, float)) and 0 <= score <= 100:
            w = weights.get(name, 0.1)
            weighted_sum += score * w
            total_weight += w

    if total_weight == 0:
        return 0, 0

    potential_score = round(weighted_sum / total_weight, 1)

    # Confidence based on response rate and score consistency
    response_rate = total_weight  # 1.0 if all agents responded
    scores = [r.get("score", 0) for r in agent_results if isinstance(r.get("score"), (int, float))]
    if len(scores) >= 2:
        avg = sum(scores) / len(scores)
        variance = sum((s - avg) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5
        consistency = max(0, 1 - std_dev / 50)  # Normalize: 0 if std_dev=50, 1 if std_dev=0
    else:
        consistency = 0.5

    confidence = round(min(100, (response_rate * 60 + consistency * 40)), 1)
    return potential_score, confidence


def _get_category(score: float) -> str:
    """Get category label from potential score."""
    if score >= 95:
        return "Exceptional Opportunity"
    elif score >= 90:
        return "High Conviction"
    elif score >= 80:
        return "Strong Opportunity"
    elif score >= 70:
        return "Watchlist Candidate"
    return "Below Threshold"


async def _analyze_single_stock(stock_data: dict) -> dict | None:
    """Run all potential agents on a single stock. Returns pick dict or None."""
    context = _build_stock_context(stock_data)
    company_name = stock_data.get("company_name", "Unknown")

    # Run all agents in parallel
    tasks = [_call_potential_agent(agent, context, company_name) for agent in POTENTIAL_AGENTS]
    results = await asyncio.gather(*tasks)
    agent_results = [r for r in results if r is not None]

    if len(agent_results) < 2:
        return None  # Need at least 2 agents to proceed

    potential_score, confidence = _calculate_potential_score(agent_results)
    if potential_score < 70:
        return None  # Below threshold

    # Extract key fields from specific agents
    why_hidden = ""
    what_changed = ""
    growth_drivers = []
    catalysts = []
    risks = []

    for r in agent_results:
        if r.get("agent_name") == "hidden_gem":
            why_hidden = r.get("why_hidden", r.get("explanation", ""))
        if r.get("agent_name") == "change":
            what_changed = r.get("what_changed", r.get("explanation", ""))
            if r.get("explanation"):
                catalysts.append(r["explanation"])
        if r.get("agent_name") == "growth" and r.get("explanation"):
            growth_drivers.append(r["explanation"])
        if r.get("agent_name") == "fundamental" and r.get("explanation"):
            # Extract risk signals from fundamental analysis
            explanation = r["explanation"].lower()
            if any(word in explanation for word in ["risk", "debt", "concern", "challenge", "weakness"]):
                risks.append(r["explanation"])
        if r.get("agent_name") == "valuation" and r.get("explanation"):
            # Extract risk signals from valuation analysis
            explanation = r["explanation"].lower()
            if any(word in explanation for word in ["overvalued", "expensive", "high", "premium", "stretched"]):
                risks.append(r["explanation"])

    # If no growth drivers extracted, use highest-scoring agent
    if not growth_drivers:
        sorted_agents = sorted(agent_results, key=lambda x: x.get("score", 0), reverse=True)
        if sorted_agents:
            growth_drivers = [sorted_agents[0].get("explanation", "")]

    # Default catalyst if none found
    if not catalysts:
        catalysts = [what_changed] if what_changed else ["Recent positive developments"]

    return {
        "ticker": stock_data.get("ticker", ""),
        "company_name": company_name,
        "sector": stock_data.get("sector", "Unknown"),
        "price": stock_data.get("price"),
        "market_cap": stock_data.get("market_cap"),
        "potential_score": potential_score,
        "confidence": confidence,
        "category": _get_category(potential_score),
        "ai_summary": "",  # Will be filled by judge
        "why_hidden": why_hidden or "Low market awareness and limited analyst coverage.",
        "what_changed": what_changed or "Recent positive developments in fundamentals.",
        "growth_drivers": growth_drivers,
        "catalysts": catalysts,
        "risks": risks,
        "agent_scores": [
            {"agent_name": r.get("agent_name", ""), "score": r.get("score", 0), "explanation": r.get("explanation", "")}
            for r in agent_results
        ],
    }


async def _generate_pick_summary(pick: dict, stock_data: dict) -> str:
    """Use judge AI to generate a summary for a pick."""
    try:
        context = _build_stock_context(stock_data)
        prompt = (
            f"Stock: {pick['company_name']} ({pick['ticker']})\n"
            f"Data: {context}\n"
            f"Potential Score: {pick['potential_score']}/100\n"
            f"Why Hidden: {pick['why_hidden']}\n"
            f"What Changed: {pick['what_changed']}\n\n"
            "Write a 2-3 sentence investment thesis explaining why this stock has potential. "
            "Be specific and factual. Return ONLY the text, no JSON, no markdown."
        )
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                AI_API_URL,
                headers={"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": JUDGE_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a senior stock analyst. Write concise, factual investment summaries."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 512,
                    "temperature": 0.2,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return pick.get("ai_summary", f"{pick['company_name']} shows strong potential based on AI analysis.")


async def run_potential_stocks_discovery(max_stocks: int = 30) -> dict:
    """Run the full potential stocks discovery pipeline."""
    run = await create_potential_run()
    run_id = run["id"]

    try:
        # 1. Fetch stock universe
        stock_list = await _fetch_stock_list()
        if not stock_list:
            await fail_potential_run(run_id)
            return {"status": "failed", "error": "Could not fetch stock list"}

        # 2. Sample candidates (diverse selection)
        import random
        candidates = random.sample(stock_list, min(max_stocks, len(stock_list)))

        # 3. Fetch market data for candidates
        stock_data_map = {}
        for c in candidates:
            ticker = c.get("symbol", "")
            if not ticker:
                continue
            try:
                data = await fetch_stock_data(ticker)
                if data and data.get("price"):
                    data["ticker"] = ticker
                    stock_data_map[ticker] = data
            except Exception:
                continue

        # 4. Analyze each stock
        picks = []
        for ticker, data in stock_data_map.items():
            pick = await _analyze_single_stock(data)
            if pick:
                # Generate summary
                pick["ai_summary"] = await _generate_pick_summary(pick, data)
                picks.append(pick)

        # 5. Sort by score and take top 10
        picks.sort(key=lambda x: x["potential_score"], reverse=True)
        top_picks = picks[:10]

        # 6. Save to database and create Day 0 timeline snapshots
        for pick in top_picks:
            pick_id = await save_potential_pick(run_id, pick)
            # Create Day 0 snapshot for journey timeline
            try:
                stock_data = stock_data_map.get(pick["ticker"], {})
                await create_timeline_snapshot(
                    pick_id=pick_id,
                    ticker=pick["ticker"],
                    day_label="0",
                    snapshot_date=datetime.now(timezone.utc),
                    price=pick.get("price"),
                    potential_score=pick.get("potential_score"),
                    ai_summary=pick.get("ai_summary"),
                    market_cap=stock_data.get("market_cap"),
                    performance_pct=0.0,
                    events=["AI discovered this stock"],
                )
            except Exception:
                pass  # Don't fail the run if snapshot creation fails

        await complete_potential_run(run_id, len(stock_data_map), len(top_picks))

        return {
            "status": "completed",
            "run_id": run_id,
            "stocks_analyzed": len(stock_data_map),
            "picks_generated": len(top_picks),
            "picks": top_picks,
        }

    except Exception as e:
        await fail_potential_run(run_id)
        return {"status": "failed", "error": str(e)}


# ---------- Potential Stocks Endpoints ----------


class PotentialPickResponse(BaseModel):
    id: int
    ticker: str
    company_name: str | None = None
    sector: str | None = None
    price_at_pick: float | None = None
    potential_score: float
    confidence: float | None = None
    category: str | None = None
    ai_summary: str | None = None
    why_hidden: str | None = None
    what_changed: str | None = None
    growth_drivers: list[str] = []
    catalysts: list[str] = []
    risks: list[str] = []
    agent_scores: list[dict] = []
    created_at: str | None = None


@app.get("/potential-stocks/today", response_model=list[PotentialPickResponse])
async def get_todays_potential_stocks():
    """Get today's potential stock picks (or most recent run)."""
    return await get_todays_picks()


@app.get("/potential-stocks/history")
async def get_potential_stocks_history(limit: int = 20, offset: int = 0):
    """Browse past discovery runs."""
    limit = max(1, min(limit, 100))
    return await get_potential_history(limit=limit, offset=offset)


@app.get("/potential-stocks/timeline/{ticker}")
async def get_potential_stock_timeline(ticker: str):
    """Get timeline snapshots for a hidden gem's journey."""
    snapshots = await get_timeline_snapshots(ticker.upper())
    if not snapshots:
        raise HTTPException(status_code=404, detail="No timeline data found for this ticker")
    return snapshots


@app.get("/potential-stocks/{ticker}", response_model=PotentialPickResponse)
async def get_potential_stock_detail(ticker: str):
    """Get detailed potential stock analysis for a ticker."""
    pick = await get_pick_by_ticker(ticker)
    if not pick:
        raise HTTPException(status_code=404, detail="No potential stock data found for this ticker")
    return pick


@app.post("/potential-stocks/run")
async def trigger_potential_stocks_run(max_stocks: int = 30):
    """Manually trigger a potential stocks discovery run."""
    max_stocks = max(5, min(max_stocks, 100))
    result = await run_potential_stocks_discovery(max_stocks=max_stocks)

    # Also check and create any pending timeline snapshots
    try:
        pending = await get_pending_snapshot_tickers()
        for item in pending:
            try:
                data = await fetch_stock_data(item["ticker"])
                if not data:
                    continue
                current_price = data.get("price")
                price_at_pick = item.get("price_at_pick")
                performance_pct = None
                if current_price and price_at_pick and price_at_pick > 0:
                    performance_pct = round(((current_price - price_at_pick) / price_at_pick) * 100, 2)
                await create_timeline_snapshot(
                    pick_id=item["pick_id"],
                    ticker=item["ticker"],
                    day_label=item["day_label"],
                    snapshot_date=item["snapshot_date"],
                    price=current_price,
                    market_cap=data.get("market_cap"),
                    performance_pct=performance_pct,
                    events=[f"Day {item['day_label']} snapshot"],
                )
            except Exception:
                pass
    except Exception:
        pass

    return result


@app.post("/potential-stocks/snapshots/check")
async def check_timeline_snapshots():
    """Check and create missing timeline snapshots for past discoveries."""
    pending = await get_pending_snapshot_tickers()
    created = 0
    errors = 0

    for item in pending:
        try:
            data = await fetch_stock_data(item["ticker"])
            if not data:
                continue

            current_price = data.get("price")
            price_at_pick = item.get("price_at_pick")

            # Calculate performance %
            performance_pct = None
            if current_price and price_at_pick and price_at_pick > 0:
                performance_pct = round(((current_price - price_at_pick) / price_at_pick) * 100, 2)

            await create_timeline_snapshot(
                pick_id=item["pick_id"],
                ticker=item["ticker"],
                day_label=item["day_label"],
                snapshot_date=item["snapshot_date"],
                price=current_price,
                market_cap=data.get("market_cap"),
                performance_pct=performance_pct,
                events=[f"Day {item['day_label']} snapshot"],
            )
            created += 1
        except Exception:
            errors += 1

    return {
        "status": "completed",
        "pending_count": len(pending),
        "snapshots_created": created,
        "errors": errors,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
