from fastapi import APIRouter, HTTPException, status
from database import supabase
from schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from typing import List

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=List[AnnouncementResponse])
def get_announcements():
    try:
        response = supabase.from_("announcements").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch announcements: {str(e)}"
        )

@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(announcement_id: str):
    try:
        response = supabase.from_("announcements").select("*").eq("id", announcement_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch announcement: {str(e)}"
        )

@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(announcement_data: AnnouncementCreate):
    try:
        data = {
            "title": announcement_data.title,
            "content": announcement_data.content,
            "author_id": announcement_data.author_id,
            "is_pinned": announcement_data.is_pinned,
            "target_roles": announcement_data.target_roles or []
        }
        response = supabase.from_("announcements").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create announcement")
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create announcement: {str(e)}"
        )

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(announcement_id: str, updates: AnnouncementUpdate):
    try:
        db_updates = {}
        if updates.title is not None:
            db_updates["title"] = updates.title
        if updates.content is not None:
            db_updates["content"] = updates.content
        if updates.is_pinned is not None:
            db_updates["is_pinned"] = updates.is_pinned
        if updates.target_roles is not None:
            db_updates["target_roles"] = updates.target_roles

        if not db_updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        response = supabase.from_("announcements").update(db_updates).eq("id", announcement_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Announcement not found or update failed")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update announcement: {str(e)}"
        )

@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(announcement_id: str):
    try:
        supabase.from_("announcements").delete().eq("id", announcement_id).execute()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete announcement: {str(e)}"
        )
