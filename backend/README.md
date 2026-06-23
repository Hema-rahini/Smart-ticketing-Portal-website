# Smart Ticketing Python API Backend

A high-performance backend built with **FastAPI** and **Supabase** for the Smart Ticketing application.

## Prerequisites

- Python 3.8 or higher installed on your system.

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows (Command Prompt):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the FastAPI Development Server:**
   ```bash
   python main.py
   ```
   Or run using Uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once the server starts:
- Interactive Swagger UI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative API documentation (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Endpoint Overview

- **Users Router** (`/users`):
  - `GET /users/` - Retrieve all users.
  - `GET /users/{id}` - Retrieve a specific user.
  - `POST /users/` - Register/create a user.
  - `PUT /users/{id}` - Update user profile.
- **Tickets Router** (`/tickets`):
  - `GET /tickets/` - Retrieve all tickets.
  - `GET /tickets/{id}` - Retrieve a specific ticket.
  - `POST /tickets/` - Open a new ticket.
  - `PUT /tickets/{id}` - Update ticket details.
  - `DELETE /tickets/{id}` - Delete a ticket.
- **Announcements Router** (`/announcements`):
  - `GET /announcements/` - Fetch announcements list.
  - `POST /announcements/` - Publish announcement.
  - `PUT /announcements/{id}` - Update announcement details.
  - `DELETE /announcements/{id}` - Delete announcement.
