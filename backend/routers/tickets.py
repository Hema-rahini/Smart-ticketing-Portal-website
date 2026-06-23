from fastapi import APIRouter, HTTPException, status
from database import supabase
from schemas import TicketCreate, TicketUpdate, TicketResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/", response_model=List[TicketResponse])
def get_tickets():
    try:
        response = supabase.from_("tickets").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tickets: {str(e)}"
        )

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str):
    try:
        response = supabase.from_("tickets").select("*").eq("id", ticket_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch ticket: {str(e)}"
        )

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_data: TicketCreate):
    try:
        data = {
            "title": ticket_data.title,
            "description": ticket_data.description,
            "status": ticket_data.status,
            "priority": ticket_data.priority,
            "created_by": ticket_data.created_by,
            "assigned_to": ticket_data.assigned_to or [],
            "department": ticket_data.department,
            "due_date": ticket_data.due_date.isoformat() if ticket_data.due_date else None,
            "tags": ticket_data.tags or []
        }
        response = supabase.from_("tickets").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create ticket")
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )

@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: str, updates: TicketUpdate):
    try:
        db_updates = {"updated_at": datetime.utcnow().isoformat()}
        if updates.title is not None:
            db_updates["title"] = updates.title
        if updates.description is not None:
            db_updates["description"] = updates.description
        if updates.status is not None:
            db_updates["status"] = updates.status
        if updates.priority is not None:
            db_updates["priority"] = updates.priority
        if updates.assigned_to is not None:
            db_updates["assigned_to"] = updates.assigned_to
        if updates.department is not None:
            db_updates["department"] = updates.department
        if updates.due_date is not None:
            db_updates["due_date"] = updates.due_date.isoformat()
        if updates.tags is not None:
            db_updates["tags"] = updates.tags

        response = supabase.from_("tickets").update(db_updates).eq("id", ticket_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Ticket not found or update failed")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update ticket: {str(e)}"
        )

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: str):
    try:
        response = supabase.from_("tickets").delete().eq("id", ticket_id).execute()
        # Supabase py returns deleted items, if list empty it means it wasn't there or delete done
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete ticket: {str(e)}"
        )
