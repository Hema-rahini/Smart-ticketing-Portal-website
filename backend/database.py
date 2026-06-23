from supabase import create_client, Client
from config import settings

if not settings.supabase_url or not settings.supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environmental variables or .env file.")

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
