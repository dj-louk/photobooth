from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import httpx
import qrcode
import io
import base64
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="DJ LOUK Photobooth System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str
    closed_at: Optional[datetime] = None

class EventCreate(BaseModel):
    name: str

class EventUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    group_id: str = Field(default_factory=lambda: f"grp_{uuid.uuid4().hex[:12]}")
    event_id: str
    name: str
    email: Optional[str] = None
    consent: bool = True
    photo_count: int = 0
    photos: List[str] = []
    qr_code: Optional[str] = None
    download_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GroupCreate(BaseModel):
    event_id: str
    name: str
    email: Optional[str] = None
    consent: bool = True

class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    photo_id: str = Field(default_factory=lambda: f"pht_{uuid.uuid4().hex[:12]}")
    group_id: str
    event_id: str
    filename: str
    data: str  # Base64 encoded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    settings_id: str = "global_settings"
    # Photo settings
    photo_count: int = 3
    delay_between_photos: int = 2
    enable_gif: bool = False
    enable_filters: bool = False
    # Interface settings
    welcome_message: str = "Bienvenue au Photobooth"
    end_message: str = "Merci ! Vos photos sont prêtes."
    theme: str = "dark"  # dark, light, louk_party
    custom_logo: Optional[str] = None
    # Sound settings
    enable_sounds: bool = True
    # Storage settings
    enable_cloud_backup: bool = False
    auto_delete_days: int = 30
    # Email settings
    enable_email: bool = False
    email_text: str = "Voici vos photos du photobooth DJ LOUK!"
    hashtag: str = "#DJLoukPhotobooth"
    # Security settings
    require_consent: bool = True
    enable_moderation: bool = False
    hide_group_after_minutes: int = 60

class SettingsUpdate(BaseModel):
    photo_count: Optional[int] = None
    delay_between_photos: Optional[int] = None
    enable_gif: Optional[bool] = None
    enable_filters: Optional[bool] = None
    welcome_message: Optional[str] = None
    end_message: Optional[str] = None
    theme: Optional[str] = None
    custom_logo: Optional[str] = None
    enable_sounds: Optional[bool] = None
    enable_cloud_backup: Optional[bool] = None
    auto_delete_days: Optional[int] = None
    enable_email: Optional[bool] = None
    email_text: Optional[str] = None
    hashtag: Optional[str] = None
    require_consent: Optional[bool] = None
    enable_moderation: Optional[bool] = None
    hide_group_after_minutes: Optional[int] = None

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return user

# ============ AUTH ROUTES ============

@api_router.get("/auth/session")
async def exchange_session(session_id: str, response: Response):
    """Exchange session_id for session data from Emergent Auth"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try:
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Session invalide")
            
            data = resp.json()
            
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            
            # Check if user exists
            existing_user = await db.users.find_one(
                {"email": data["email"]},
                {"_id": 0}
            )
            
            if existing_user:
                user_id = existing_user["user_id"]
                # Update user info
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "name": data["name"],
                        "picture": data.get("picture"),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
            else:
                # Create new user
                new_user = {
                    "user_id": user_id,
                    "email": data["email"],
                    "name": data["name"],
                    "picture": data.get("picture"),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(new_user)
            
            # Create session
            session_token = data.get("session_token", str(uuid.uuid4()))
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            
            session_doc = {
                "session_id": str(uuid.uuid4()),
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_sessions.insert_one(session_doc)
            
            # Set cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                path="/",
                max_age=7 * 24 * 60 * 60
            )
            
            return {
                "user_id": user_id,
                "email": data["email"],
                "name": data["name"],
                "picture": data.get("picture")
            }
            
    except httpx.HTTPError as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail="Erreur d'authentification")

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    """Get current user info"""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Déconnecté"}

# ============ EVENTS ROUTES ============

@api_router.post("/events", response_model=Dict[str, Any])
async def create_event(event_data: EventCreate, user: User = Depends(require_auth)):
    """Create a new event"""
    event = Event(
        name=event_data.name,
        created_by=user.user_id
    )
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    
    return {
        "event_id": event.event_id,
        "name": event.name,
        "is_active": event.is_active,
        "created_at": doc['created_at']
    }

@api_router.get("/events", response_model=List[Dict[str, Any]])
async def get_events(user: User = Depends(require_auth)):
    """Get all events"""
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    return events

@api_router.get("/events/active", response_model=Optional[Dict[str, Any]])
async def get_active_event():
    """Get the currently active event (public endpoint for photobooth)"""
    event = await db.events.find_one({"is_active": True}, {"_id": 0})
    return event

@api_router.get("/events/{event_id}", response_model=Dict[str, Any])
async def get_event(event_id: str):
    """Get a specific event"""
    event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return event

@api_router.put("/events/{event_id}", response_model=Dict[str, Any])
async def update_event(event_id: str, event_data: EventUpdate, user: User = Depends(require_auth)):
    """Update an event"""
    update_doc = {}
    if event_data.name is not None:
        update_doc["name"] = event_data.name
    if event_data.is_active is not None:
        update_doc["is_active"] = event_data.is_active
        if not event_data.is_active:
            update_doc["closed_at"] = datetime.now(timezone.utc).isoformat()
    
    if update_doc:
        await db.events.update_one(
            {"event_id": event_id},
            {"$set": update_doc}
        )
    
    event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return event

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: User = Depends(require_auth)):
    """Delete an event"""
    result = await db.events.delete_one({"event_id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Also delete associated groups and photos
    await db.groups.delete_many({"event_id": event_id})
    await db.photos.delete_many({"event_id": event_id})
    
    return {"message": "Événement supprimé"}

# ============ GROUPS ROUTES ============

def generate_qr_code(url: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

@api_router.post("/groups", response_model=Dict[str, Any])
async def create_group(group_data: GroupCreate):
    """Create a new group (public endpoint for photobooth)"""
    # Check if event exists
    event = await db.events.find_one({"event_id": group_data.event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    group = Group(
        event_id=group_data.event_id,
        name=group_data.name,
        email=group_data.email,
        consent=group_data.consent
    )
    
    # Generate QR code URL
    frontend_url = os.environ.get('FRONTEND_URL', 'https://booth-capture-system.preview.emergentagent.com')
    qr_url = f"{frontend_url}/gallery/{group.group_id}"
    group.qr_code = generate_qr_code(qr_url)
    
    doc = group.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.groups.insert_one(doc)
    
    return {
        "group_id": group.group_id,
        "name": group.name,
        "qr_code": group.qr_code,
        "created_at": doc['created_at']
    }

@api_router.get("/groups", response_model=List[Dict[str, Any]])
async def get_groups(event_id: Optional[str] = None):
    """Get all groups, optionally filtered by event"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    
    groups = await db.groups.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return groups

@api_router.get("/groups/{group_id}", response_model=Dict[str, Any])
async def get_group(group_id: str):
    """Get a specific group"""
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    return group

@api_router.get("/groups/search/{query}")
async def search_groups(query: str, event_id: Optional[str] = None):
    """Search groups by name"""
    search_query = {"name": {"$regex": query, "$options": "i"}}
    if event_id:
        search_query["event_id"] = event_id
    
    groups = await db.groups.find(search_query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return groups

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str, user: User = Depends(require_auth)):
    """Delete a group"""
    result = await db.groups.delete_one({"group_id": group_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    
    await db.photos.delete_many({"group_id": group_id})
    return {"message": "Groupe supprimé"}

@api_router.post("/groups/{group_id}/regenerate-qr")
async def regenerate_qr(group_id: str, user: User = Depends(require_auth)):
    """Regenerate QR code for a group"""
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    
    frontend_url = os.environ.get('FRONTEND_URL', 'https://booth-capture-system.preview.emergentagent.com')
    qr_url = f"{frontend_url}/gallery/{group_id}"
    new_qr = generate_qr_code(qr_url)
    
    await db.groups.update_one(
        {"group_id": group_id},
        {"$set": {"qr_code": new_qr}}
    )
    
    return {"qr_code": new_qr}

@api_router.post("/groups/{group_id}/increment-download")
async def increment_download(group_id: str):
    """Increment download count for a group"""
    result = await db.groups.update_one(
        {"group_id": group_id},
        {"$inc": {"download_count": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    return {"message": "Compteur incrémenté"}

# ============ PHOTOS ROUTES ============

class PhotoUploadRequest(BaseModel):
    photo_data: str

class PhotoBatchRequest(BaseModel):
    photos: List[str]

@api_router.post("/photos")
async def upload_photo(group_id: str, request: PhotoUploadRequest):
    """Upload a photo (base64 encoded)"""
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    
    photo = Photo(
        group_id=group_id,
        event_id=group["event_id"],
        filename=f"photo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg",
        data=request.photo_data
    )
    
    doc = photo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.photos.insert_one(doc)
    
    # Update group photo count and photos list
    await db.groups.update_one(
        {"group_id": group_id},
        {
            "$inc": {"photo_count": 1},
            "$push": {"photos": photo.photo_id}
        }
    )
    
    return {"photo_id": photo.photo_id, "filename": photo.filename}

@api_router.post("/photos/batch")
async def upload_photos_batch(group_id: str, request: PhotoBatchRequest):
    """Upload multiple photos at once"""
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    
    photo_ids = []
    for i, photo_data in enumerate(request.photos):
        photo = Photo(
            group_id=group_id,
            event_id=group["event_id"],
            filename=f"photo_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i+1}.jpg",
            data=photo_data
        )
        
        doc = photo.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.photos.insert_one(doc)
        photo_ids.append(photo.photo_id)
    
    # Update group
    await db.groups.update_one(
        {"group_id": group_id},
        {
            "$inc": {"photo_count": len(request.photos)},
            "$push": {"photos": {"$each": photo_ids}}
        }
    )
    
    return {"photo_ids": photo_ids}

@api_router.get("/photos/{group_id}")
async def get_photos(group_id: str):
    """Get all photos for a group"""
    photos = await db.photos.find({"group_id": group_id}, {"_id": 0}).to_list(100)
    return photos

# ============ SETTINGS ROUTES ============

@api_router.get("/settings")
async def get_settings():
    """Get global settings (public for photobooth)"""
    settings = await db.settings.find_one({"settings_id": "global_settings"}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = Settings()
        doc = default_settings.model_dump()
        await db.settings.insert_one(doc)
        return doc
    return settings

@api_router.put("/settings")
async def update_settings(settings_data: SettingsUpdate, user: User = Depends(require_auth)):
    """Update global settings"""
    update_doc = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    
    if update_doc:
        await db.settings.update_one(
            {"settings_id": "global_settings"},
            {"$set": update_doc},
            upsert=True
        )
    
    settings = await db.settings.find_one({"settings_id": "global_settings"}, {"_id": 0})
    return settings

# ============ STATISTICS ROUTES ============

@api_router.get("/stats")
async def get_statistics(user: User = Depends(require_auth)):
    """Get dashboard statistics"""
    # Total counts
    total_events = await db.events.count_documents({})
    total_groups = await db.groups.count_documents({})
    total_photos = await db.photos.count_documents({})
    
    # Active event stats
    active_event = await db.events.find_one({"is_active": True}, {"_id": 0})
    active_event_groups = 0
    active_event_photos = 0
    if active_event:
        active_event_groups = await db.groups.count_documents({"event_id": active_event["event_id"]})
        active_event_photos = await db.photos.count_documents({"event_id": active_event["event_id"]})
    
    # Last group
    last_group = await db.groups.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    
    # Photos per hour (last 24 hours)
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(hours=24)
    
    # Get hourly distribution
    pipeline = [
        {"$match": {"created_at": {"$gte": yesterday.isoformat()}}},
        {"$group": {
            "_id": {"$hour": {"$dateFromString": {"dateString": "$created_at"}}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    hourly_stats = await db.groups.aggregate(pipeline).to_list(24)
    
    # Total downloads
    downloads_pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$download_count"}}}
    ]
    downloads_result = await db.groups.aggregate(downloads_pipeline).to_list(1)
    total_downloads = downloads_result[0]["total"] if downloads_result else 0
    
    return {
        "total_events": total_events,
        "total_groups": total_groups,
        "total_photos": total_photos,
        "total_downloads": total_downloads,
        "active_event": active_event,
        "active_event_groups": active_event_groups,
        "active_event_photos": active_event_photos,
        "last_group": last_group,
        "hourly_stats": hourly_stats,
        "avg_photos_per_group": round(total_photos / total_groups, 1) if total_groups > 0 else 0
    }

# ============ HEALTH CHECK ============

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "DJ LOUK Photobooth API"}

@api_router.get("/")
async def root():
    return {"message": "DJ LOUK Photobooth API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
