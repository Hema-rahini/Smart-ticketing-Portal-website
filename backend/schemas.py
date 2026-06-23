from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime

# User schemas
UserRole = Literal['admin', 'manager', 'employee', 'intern']

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    avatar: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    avatar: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Ticket schemas
TicketStatus = Literal['open', 'in-progress', 'pending-review', 'completed', 'closed']
TicketPriority = Literal['high', 'medium', 'low']

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TicketStatus = "open"
    priority: TicketPriority = "medium"
    created_by: str
    assigned_to: Optional[List[str]] = None
    department: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[List[str]] = None
    department: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None

class TicketResponse(TicketBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Announcement schemas
class AnnouncementBase(BaseModel):
    title: str
    content: str
    author_id: str
    is_pinned: bool = False
    target_roles: Optional[List[UserRole]] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    target_roles: Optional[List[UserRole]] = None

class AnnouncementResponse(AnnouncementBase):
    id: str
    created_at: datetime
    reactions: Optional[Dict[str, List[str]]] = None

    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    content: str
    sender_id: str
    receiver_id: Optional[str] = None
    channel_id: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    created_at: datetime
    read_by: Optional[List[str]] = None

    class Config:
        from_attributes = True
