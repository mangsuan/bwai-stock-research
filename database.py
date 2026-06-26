"""Async database layer for caching stock research results.

Uses PostgreSQL in production, SQLite for local dev.
Configure via DATABASE_URL env var:
  - PostgreSQL: postgresql+asyncpg://user:pass@host:5432/dbname
  - SQLite:     sqlite+aiosqlite:///./bwai.db  (default)
"""

import os
from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, ForeignKey, UniqueConstraint, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./bwai.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    """User account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=True)  # NULL for OAuth users
    oauth_provider = Column(String(20), nullable=True)    # "google", "facebook", or NULL
    oauth_id = Column(String(100), nullable=True)         # Provider's user ID
    avatar_url = Column(String(500), nullable=True)
    display_name = Column(String(100), nullable=True)     # Custom display name
    theme = Column(String(10), nullable=False, server_default="light")  # "light" or "dark"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Watchlist(Base):
    """User's stock watchlist."""
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ticker = Column(String(10), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "ticker", name="uq_user_ticker"),
    )


class ResearchCache(Base):
    """Cached final research results."""
    __tablename__ = "research_cache"

    ticker = Column(String(10), primary_key=True)
    company_name = Column(String(200), nullable=False)
    sector = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    bull_factors = Column(Text, nullable=False)      # JSON array
    bear_factors = Column(Text, nullable=False)      # JSON array
    risks = Column(Text, nullable=False)             # JSON array
    conclusion = Column(Text, nullable=False)
    price_at_time = Column(Float, nullable=True)
    cached_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)


class AgentResult(Base):
    """Individual AI agent analysis results."""
    __tablename__ = "agent_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String(10), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False)  # e.g. "deepseek", "claude"
    model_id = Column(String(100), nullable=False)    # e.g. "deepseek-chat"
    summary = Column(Text, nullable=False)
    bull_factors = Column(Text, nullable=False)       # JSON array
    bear_factors = Column(Text, nullable=False)       # JSON array
    risks = Column(Text, nullable=False)              # JSON array
    conclusion = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)         # 0-1 score if available
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinalSynthesis(Base):
    """Final synthesis from the judge AI."""
    __tablename__ = "final_synthesis"

    ticker = Column(String(10), primary_key=True)
    summary = Column(Text, nullable=False)
    bull_factors = Column(Text, nullable=False)       # JSON array
    bear_factors = Column(Text, nullable=False)       # JSON array
    risks = Column(Text, nullable=False)              # JSON array
    conclusion = Column(Text, nullable=False)
    agents_used = Column(Text, nullable=False)        # JSON array of agent names
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)


# Member level thresholds
MEMBER_LEVELS = [
    (0, "entry"),
    (100, "bronze"),
    (200, "silver"),
    (300, "gold"),
    (400, "platinum"),
    (500, "diamond"),
    (1000, "master"),
]


def calculate_member_level(points: int) -> str:
    """Calculate member level from total points."""
    level = "entry"
    for threshold, name in MEMBER_LEVELS:
        if points >= threshold:
            level = name
    return level


def get_level_progress(points: int) -> dict:
    """Get current level and progress to next level."""
    current_level = "entry"
    current_threshold = 0
    next_threshold = 100

    for i, (threshold, name) in enumerate(MEMBER_LEVELS):
        if points >= threshold:
            current_level = name
            current_threshold = threshold
            if i + 1 < len(MEMBER_LEVELS):
                next_threshold = MEMBER_LEVELS[i + 1][0]
            else:
                next_threshold = threshold  # master = max

    if current_level == "master":
        progress_pct = 100
        points_to_next = 0
    else:
        range_size = next_threshold - current_threshold
        progress_in_range = points - current_threshold
        progress_pct = round(progress_in_range / range_size * 100, 1) if range_size > 0 else 0
        points_to_next = next_threshold - points

    return {
        "level": current_level,
        "points": points,
        "current_threshold": current_threshold,
        "next_threshold": next_threshold,
        "progress_pct": progress_pct,
        "points_to_next": points_to_next,
    }


class MemberPoints(Base):
    """User's member points balance."""
    __tablename__ = "member_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    total_points = Column(Integer, nullable=False, server_default="0")
    member_level = Column(String(20), nullable=False, server_default="entry")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PointTransaction(Base):
    """Individual point transaction record."""
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # positive = earn, negative = spend
    source = Column(String(20), nullable=False)  # "ad_reward" or "purchase"
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------- Potential Stocks ----------


class PotentialStockRun(Base):
    """A daily potential stocks discovery run."""
    __tablename__ = "potential_stock_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_date = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(20), nullable=False, server_default="running")  # running, completed, failed
    stocks_analyzed = Column(Integer, server_default="0")
    picks_generated = Column(Integer, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PotentialStockPick(Base):
    """An individual stock pick from a discovery run."""
    __tablename__ = "potential_stock_picks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("potential_stock_runs.id"), nullable=False, index=True)
    ticker = Column(String(10), nullable=False, index=True)
    company_name = Column(String(200), nullable=True)
    sector = Column(String(100), nullable=True)
    price_at_pick = Column(Float, nullable=True)
    potential_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=True)
    category = Column(String(30), nullable=True)  # Exceptional, High Conviction, Strong, Watchlist
    ai_summary = Column(Text, nullable=True)
    why_hidden = Column(Text, nullable=True)
    what_changed = Column(Text, nullable=True)
    growth_drivers = Column(Text, nullable=True)  # JSON array
    catalysts = Column(Text, nullable=True)  # JSON array
    risks = Column(Text, nullable=True)  # JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PotentialStockAgentScore(Base):
    """Per-agent score breakdown for a pick."""
    __tablename__ = "potential_stock_agent_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pick_id = Column(Integer, ForeignKey("potential_stock_picks.id"), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Cache TTL in hours
CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", "4"))


async def init_db():
    """Create tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ---------- Research Cache ----------


async def get_cached_research(ticker: str) -> dict | None:
    """Return cached research if it exists and hasn't expired."""
    async with async_session() as session:
        result = await session.get(ResearchCache, ticker)
        if result is None:
            return None

        expires = result.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            await session.delete(result)
            await session.commit()
            return None

        cached_at = result.cached_at
        if cached_at and cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=timezone.utc)

        return {
            "ticker": result.ticker,
            "company_name": result.company_name,
            "sector": result.sector,
            "summary": result.summary,
            "bull_factors": result.bull_factors,
            "bear_factors": result.bear_factors,
            "risks": result.risks,
            "conclusion": result.conclusion,
            "price_at_time": result.price_at_time,
            "cached_at": cached_at.isoformat() if cached_at else None,
        }


async def cache_research(ticker: str, data: dict, price: float | None):
    """Store research result in cache."""
    import json

    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=CACHE_TTL_HOURS)

    async with async_session() as session:
        existing = await session.get(ResearchCache, ticker)
        if existing:
            await session.delete(existing)
            await session.commit()

        entry = ResearchCache(
            ticker=ticker,
            company_name=data["company_name"],
            sector=data["sector"],
            summary=data["summary"],
            bull_factors=json.dumps(data["bull_factors"]),
            bear_factors=json.dumps(data["bear_factors"]),
            risks=json.dumps(data["risks"]),
            conclusion=data["conclusion"],
            price_at_time=price,
            expires_at=expires,
        )
        session.add(entry)
        await session.commit()


# ---------- Agent Results ----------


async def save_agent_result(ticker: str, agent_name: str, model_id: str,
                            result: dict, response_time_ms: int | None = None):
    """Save an individual agent's analysis result."""
    import json

    async with async_session() as session:
        entry = AgentResult(
            ticker=ticker,
            agent_name=agent_name,
            model_id=model_id,
            summary=result.get("summary", ""),
            bull_factors=json.dumps(result.get("bull_factors", [])),
            bear_factors=json.dumps(result.get("bear_factors", [])),
            risks=json.dumps(result.get("risks", [])),
            conclusion=result.get("conclusion", ""),
            confidence=result.get("confidence"),
            response_time_ms=response_time_ms,
        )
        session.add(entry)
        await session.commit()


async def get_agent_results(ticker: str) -> list[dict]:
    """Get all agent results for a ticker."""
    import json
    from sqlalchemy import select

    async with async_session() as session:
        stmt = (
            select(AgentResult)
            .where(AgentResult.ticker == ticker)
            .order_by(AgentResult.created_at.desc())
        )
        results = await session.execute(stmt)
        rows = results.scalars().all()

        return [
            {
                "agent_name": r.agent_name,
                "model_id": r.model_id,
                "summary": r.summary,
                "bull_factors": json.loads(r.bull_factors),
                "bear_factors": json.loads(r.bear_factors),
                "risks": json.loads(r.risks),
                "conclusion": r.conclusion,
                "confidence": r.confidence,
                "response_time_ms": r.response_time_ms,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]


# ---------- Final Synthesis ----------


async def save_final_synthesis(ticker: str, result: dict, agents_used: list[str]):
    """Save the final synthesis result."""
    import json

    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=CACHE_TTL_HOURS)

    async with async_session() as session:
        existing = await session.get(FinalSynthesis, ticker)
        if existing:
            await session.delete(existing)
            await session.commit()

        entry = FinalSynthesis(
            ticker=ticker,
            summary=result.get("summary", ""),
            bull_factors=json.dumps(result.get("bull_factors", [])),
            bear_factors=json.dumps(result.get("bear_factors", [])),
            risks=json.dumps(result.get("risks", [])),
            conclusion=result.get("conclusion", ""),
            agents_used=json.dumps(agents_used),
            expires_at=expires,
        )
        session.add(entry)
        await session.commit()


async def get_final_synthesis(ticker: str) -> dict | None:
    """Get the final synthesis for a ticker."""
    import json
    from sqlalchemy import select

    async with async_session() as session:
        stmt = select(FinalSynthesis).where(FinalSynthesis.ticker == ticker)
        result = await session.execute(stmt)
        row = result.scalar_one_or_none()

        if row is None:
            return None

        expires = row.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            await session.delete(row)
            await session.commit()
            return None

        return {
            "ticker": ticker,
            "summary": row.summary,
            "bull_factors": json.loads(row.bull_factors),
            "bear_factors": json.loads(row.bear_factors),
            "risks": json.loads(row.risks),
            "conclusion": row.conclusion,
            "agents_used": json.loads(row.agents_used),
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }


# ---------- Users ----------


async def create_user(username: str, email: str, hashed_password: str) -> dict:
    """Create a new user."""
    from sqlalchemy import select

    async with async_session() as session:
        # Check if username or email already exists
        stmt = select(User).where((User.username == username) | (User.email == email))
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            if existing.username == username:
                raise ValueError("Username already taken")
            raise ValueError("Email already registered")

        user = User(username=username, email=email, hashed_password=hashed_password)
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }


async def get_user_by_username(username: str) -> dict | None:
    """Get user by username."""
    from sqlalchemy import select

    async with async_session() as session:
        stmt = select(User).where(User.username == username)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            return None

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }


async def get_user_by_id(user_id: int) -> dict | None:
    """Get user by ID."""
    async with async_session() as session:
        user = await session.get(User, user_id)
        if user is None:
            return None

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "oauth_provider": user.oauth_provider,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }


async def get_or_create_oauth_user(provider: str, oauth_id: str, email: str, name: str, avatar_url: str | None = None) -> dict:
    """Get existing OAuth user or create a new one."""
    from sqlalchemy import select

    async with async_session() as session:
        # First, try to find by OAuth provider + ID
        stmt = select(User).where(User.oauth_provider == provider, User.oauth_id == oauth_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "oauth_provider": user.oauth_provider,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }

        # Try to find by email (link accounts)
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            # Link OAuth to existing account
            user.oauth_provider = provider
            user.oauth_id = oauth_id
            if avatar_url:
                user.avatar_url = avatar_url
            await session.commit()
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "oauth_provider": user.oauth_provider,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }

        # Create new user
        # Generate unique username from name
        base_username = name.lower().replace(" ", "")[:30]
        username = base_username
        counter = 1
        while True:
            check = select(User).where(User.username == username)
            exists = await session.execute(check)
            if exists.scalar_one_or_none() is None:
                break
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            hashed_password=None,  # OAuth users don't have a password
            oauth_provider=provider,
            oauth_id=oauth_id,
            avatar_url=avatar_url,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "oauth_provider": user.oauth_provider,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }


# ---------- Watchlist ----------


async def add_to_watchlist(user_id: int, ticker: str) -> dict:
    """Add a ticker to user's watchlist."""
    async with async_session() as session:
        entry = Watchlist(user_id=user_id, ticker=ticker.upper())
        session.add(entry)
        try:
            await session.commit()
        except Exception:
            # Already exists
            await session.rollback()
            return {"ticker": ticker.upper(), "status": "already_exists"}

        return {"ticker": ticker.upper(), "status": "added"}


async def remove_from_watchlist(user_id: int, ticker: str) -> bool:
    """Remove a ticker from user's watchlist."""
    from sqlalchemy import select, delete

    async with async_session() as session:
        stmt = delete(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.ticker == ticker.upper(),
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount > 0


async def get_watchlist(user_id: int) -> list[dict]:
    """Get user's watchlist."""
    from sqlalchemy import select

    async with async_session() as session:
        stmt = (
            select(Watchlist)
            .where(Watchlist.user_id == user_id)
            .order_by(Watchlist.added_at.desc())
        )
        result = await session.execute(stmt)
        rows = result.scalars().all()

        return [
            {
                "ticker": r.ticker,
                "added_at": r.added_at.isoformat() if r.added_at else None,
            }
            for r in rows
        ]


async def is_in_watchlist(user_id: int, ticker: str) -> bool:
    """Check if a ticker is in user's watchlist."""
    from sqlalchemy import select

    async with async_session() as session:
        stmt = select(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.ticker == ticker.upper(),
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none() is not None


# ---------- User Profile ----------


async def update_user_profile(user_id: int, display_name: str | None = None, theme: str | None = None) -> dict:
    """Update user display name and/or theme."""
    async with async_session() as session:
        user = await session.get(User, user_id)
        if user is None:
            raise ValueError("User not found")

        if display_name is not None:
            user.display_name = display_name
        if theme is not None:
            if theme not in ("light", "dark"):
                raise ValueError("Theme must be 'light' or 'dark'")
            user.theme = theme

        await session.commit()
        await session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "theme": user.theme,
            "avatar_url": user.avatar_url,
        }


async def update_user_avatar(user_id: int, avatar_url: str) -> dict:
    """Update user's avatar URL."""
    async with async_session() as session:
        user = await session.get(User, user_id)
        if user is None:
            raise ValueError("User not found")

        user.avatar_url = avatar_url
        await session.commit()
        await session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "theme": user.theme,
            "avatar_url": user.avatar_url,
        }


async def get_user_full(user_id: int) -> dict | None:
    """Get user with all profile fields and member info."""
    async with async_session() as session:
        user = await session.get(User, user_id)
        if user is None:
            return None

        # Get member points
        from sqlalchemy import select as sel
        stmt = sel(MemberPoints).where(MemberPoints.user_id == user_id)
        result = await session.execute(stmt)
        mp = result.scalar_one_or_none()

        points = mp.total_points if mp else 0
        level = mp.member_level if mp else "entry"

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "theme": user.theme,
            "avatar_url": user.avatar_url,
            "oauth_provider": user.oauth_provider,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "total_points": points,
            "member_level": level,
        }


# ---------- Member Points ----------


async def get_member_points(user_id: int) -> dict:
    """Get member points and level info for a user."""
    async with async_session() as session:
        from sqlalchemy import select
        stmt = select(MemberPoints).where(MemberPoints.user_id == user_id)
        result = await session.execute(stmt)
        mp = result.scalar_one_or_none()

        if mp is None:
            return get_level_progress(0)

        return get_level_progress(mp.total_points)


async def add_points(user_id: int, amount: int, source: str, description: str | None = None) -> dict:
    """Add points to user's balance and record the transaction."""
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if source not in ("ad_reward", "purchase"):
        raise ValueError("Source must be 'ad_reward' or 'purchase'")

    async with async_session() as session:
        # Get or create member points record
        from sqlalchemy import select
        stmt = select(MemberPoints).where(MemberPoints.user_id == user_id)
        result = await session.execute(stmt)
        mp = result.scalar_one_or_none()

        if mp is None:
            mp = MemberPoints(user_id=user_id, total_points=0, member_level="entry")
            session.add(mp)

        mp.total_points += amount
        mp.member_level = calculate_member_level(mp.total_points)

        # Record transaction
        txn = PointTransaction(
            user_id=user_id,
            amount=amount,
            source=source,
            description=description,
        )
        session.add(txn)

        await session.commit()

        return get_level_progress(mp.total_points)


async def get_point_history(user_id: int) -> list[dict]:
    """Get point transaction history for a user."""
    from sqlalchemy import select

    async with async_session() as session:
        stmt = (
            select(PointTransaction)
            .where(PointTransaction.user_id == user_id)
            .order_by(PointTransaction.created_at.desc())
        )
        result = await session.execute(stmt)
        rows = result.scalars().all()

        return [
            {
                "id": r.id,
                "amount": r.amount,
                "source": r.source,
                "description": r.description,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]


# ---------- Potential Stocks CRUD ----------


async def create_potential_run() -> dict:
    """Create a new discovery run and return it."""
    async with async_session() as session:
        run = PotentialStockRun(
            run_date=datetime.now(timezone.utc),
            status="running",
        )
        session.add(run)
        await session.commit()
        await session.refresh(run)
        return {"id": run.id, "run_date": run.run_date.isoformat(), "status": run.status}


async def complete_potential_run(run_id: int, stocks_analyzed: int, picks_generated: int):
    """Mark a discovery run as completed."""
    async with async_session() as session:
        run = await session.get(PotentialStockRun, run_id)
        if run:
            run.status = "completed"
            run.stocks_analyzed = stocks_analyzed
            run.picks_generated = picks_generated
            await session.commit()


async def fail_potential_run(run_id: int):
    """Mark a discovery run as failed."""
    async with async_session() as session:
        run = await session.get(PotentialStockRun, run_id)
        if run:
            run.status = "failed"
            await session.commit()


async def save_potential_pick(run_id: int, pick: dict) -> int:
    """Save a stock pick and its agent scores. Returns pick id."""
    import json

    async with async_session() as session:
        p = PotentialStockPick(
            run_id=run_id,
            ticker=pick["ticker"],
            company_name=pick.get("company_name"),
            sector=pick.get("sector"),
            price_at_pick=pick.get("price"),
            potential_score=pick["potential_score"],
            confidence=pick.get("confidence"),
            category=pick.get("category"),
            ai_summary=pick.get("ai_summary"),
            why_hidden=pick.get("why_hidden"),
            what_changed=pick.get("what_changed"),
            growth_drivers=json.dumps(pick.get("growth_drivers", [])),
            catalysts=json.dumps(pick.get("catalysts", [])),
            risks=json.dumps(pick.get("risks", [])),
        )
        session.add(p)
        await session.commit()
        await session.refresh(p)

        # Save agent scores
        for agent in pick.get("agent_scores", []):
            s = PotentialStockAgentScore(
                pick_id=p.id,
                agent_name=agent["agent_name"],
                score=agent["score"],
                explanation=agent.get("explanation"),
            )
            session.add(s)
        await session.commit()
        return p.id


async def get_todays_picks() -> list[dict]:
    """Get the most recent run's picks."""
    from sqlalchemy import select
    import json

    async with async_session() as session:
        # Get most recent completed run
        stmt = (
            select(PotentialStockRun)
            .where(PotentialStockRun.status == "completed")
            .order_by(PotentialStockRun.created_at.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        run = result.scalars().first()
        if not run:
            return []

        # Get picks for this run
        stmt = (
            select(PotentialStockPick)
            .where(PotentialStockPick.run_id == run.id)
            .order_by(PotentialStockPick.potential_score.desc())
        )
        result = await session.execute(stmt)
        picks = result.scalars().all()

        return [_pick_to_dict(p, json) for p in picks]


async def get_pick_by_ticker(ticker: str) -> dict | None:
    """Get the most recent pick for a specific ticker."""
    from sqlalchemy import select
    import json

    async with async_session() as session:
        stmt = (
            select(PotentialStockPick)
            .where(PotentialStockPick.ticker == ticker.upper())
            .order_by(PotentialStockPick.created_at.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        pick = result.scalars().first()
        if not pick:
            return None

        # Get agent scores
        stmt = (
            select(PotentialStockAgentScore)
            .where(PotentialStockAgentScore.pick_id == pick.id)
        )
        result = await session.execute(stmt)
        scores = result.scalars().all()

        d = _pick_to_dict(pick, json)
        d["agent_scores"] = [
            {
                "agent_name": s.agent_name,
                "score": s.score,
                "explanation": s.explanation,
            }
            for s in scores
        ]
        return d


async def get_potential_history(limit: int = 20, offset: int = 0) -> list[dict]:
    """Get past discovery runs."""
    from sqlalchemy import select

    async with async_session() as session:
        stmt = (
            select(PotentialStockRun)
            .where(PotentialStockRun.status == "completed")
            .order_by(PotentialStockRun.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await session.execute(stmt)
        runs = result.scalars().all()

        return [
            {
                "id": r.id,
                "run_date": r.run_date.isoformat() if r.run_date else None,
                "status": r.status,
                "stocks_analyzed": r.stocks_analyzed,
                "picks_generated": r.picks_generated,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in runs
        ]


def _pick_to_dict(p, json_module) -> dict:
    """Convert a PotentialStockPick to a dict."""
    return {
        "id": p.id,
        "ticker": p.ticker,
        "company_name": p.company_name,
        "sector": p.sector,
        "price_at_pick": p.price_at_pick,
        "potential_score": p.potential_score,
        "confidence": p.confidence,
        "category": p.category,
        "ai_summary": p.ai_summary,
        "why_hidden": p.why_hidden,
        "what_changed": p.what_changed,
        "growth_drivers": json_module.loads(p.growth_drivers) if p.growth_drivers else [],
        "catalysts": json_module.loads(p.catalysts) if p.catalysts else [],
        "risks": json_module.loads(p.risks) if p.risks else [],
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }
