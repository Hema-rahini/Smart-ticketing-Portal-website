import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import users, tickets, announcements

app = FastAPI(
    title="Smart Ticketing API Backend",
    description="Python API Backend for Smart Ticketing Portal built with FastAPI and Supabase",
    version="1.0.0"
)

# Configure CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to match frontend url
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Smart Ticketing API Backend",
        "docs_url": "/docs",
        "status": "healthy"
    }

# Include routers
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(announcements.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
