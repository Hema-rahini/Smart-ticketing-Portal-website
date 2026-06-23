from fastapi import APIRouter, HTTPException, status
from database import supabase
from schemas import UserCreate, UserUpdate, UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def get_users():
    try:
        response = supabase.from_("users").select("*").order("joined_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    try:
        response = supabase.from_("users").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate):
    try:
        # Check if user already exists
        check = supabase.from_("users").select("*").eq("email", user_data.email).execute()
        if check.data:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # If a password is provided, we would sign them up in Supabase Auth first,
        # but here we'll insert into the users table directly (which maps to db schema)
        data = {
            "name": user_data.name,
            "email": user_data.email,
            "role": user_data.role,
            "avatar": user_data.avatar,
            "department": user_data.department,
            "manager_id": user_data.manager_id
        }
        
        response = supabase.from_("users").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create user record")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, updates: UserUpdate):
    try:
        # Prepare updates payload
        db_updates = {}
        if updates.name is not None:
            db_updates["name"] = updates.name
        if updates.email is not None:
            db_updates["email"] = updates.email
        if updates.role is not None:
            db_updates["role"] = updates.role
        if updates.avatar is not None:
            db_updates["avatar"] = updates.avatar
        if updates.department is not None:
            db_updates["department"] = updates.department
        if updates.manager_id is not None:
            db_updates["manager_id"] = updates.manager_id

        if not db_updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        response = supabase.from_("users").update(db_updates).eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found or update failed")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
