# Password Authentication Implementation Guide

## Summary of Changes

The authentication system has been updated to properly validate passwords. Previously, any password would allow login. Now passwords are securely hashed and validated.

## What Was Fixed

✅ **Password Storage** - Passwords are now hashed using scrypt algorithm  
✅ **Password Validation** - Login now requires correct password  
✅ **Secure Implementation** - Uses timing-safe comparison to prevent timing attacks  
✅ **New User Creation** - Passwords are hashed when users sign up  
✅ **Admin User Creation** - Admin-created users get a temporary password

## Database Changes Required

You need to add a `password_hash` column to your Supabase `users` table.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
```

### Option 2: Using Database Migrations

If you have a migration system, add this migration:

```sql
-- Migration: add_password_hash_to_users
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

-- Then drop the default after backfilling
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
```

## Code Changes Made

### 1. New File: `lib/password.ts`
- `hashPassword(password)` - Hashes a password with random salt
- `verifyPassword(password, hash)` - Verifies a password against stored hash
- Uses Node.js built-in crypto (scrypt) for security
- Prevents timing attacks with `timingSafeEqual`

### 2. Updated: `lib/store.ts`
- **login() function** - Now validates passwords:
  - New users: Password is hashed on signup
  - Existing users: Password is verified before login
  - Wrong password returns `false`
  - Backwards compatible with old accounts (auto-migrates on first login)

- **addUser() function** - Admin-created users get temporary password `TempPassword123!`

### 3. Updated: `components/auth/auth-screen.tsx`
- Better error messages for wrong password
- Password validation (minimum 6 characters for signup)
- Proper async/await for login/signup
- Error display in both tabs
- Password hint about minimum length

## Testing

### Test 1: New User Signup
1. Go to login page
2. Click "Sign Up"
3. Enter email, password (must be 6+ characters), name
4. Should create account and log in

### Test 2: Wrong Password
1. Create a user with email: `test@company.com`, password: `MyPassword123`
2. Try to login with same email but wrong password: `WrongPassword`
3. Should see error: "Invalid email or password. Please try again."

### Test 3: Correct Password
1. Create user with email: `test@company.com`, password: `MyPassword123`
2. Log out
3. Log in with correct email and password
4. Should successfully log in

### Test 4: No Password
1. Try to login without entering password
2. Should see error: "Password is required"

## Backwards Compatibility

Old user accounts without passwords are auto-migrated on first login:
- When user logs in, if no `password_hash` exists, one is created
- User can now log in with their first-login password going forward
- This ensures existing users don't get locked out

## Security Notes

✅ Passwords are hashed using scrypt (industry standard)  
✅ Each password gets a unique random salt  
✅ Password verification uses timing-safe comparison  
✅ No plaintext passwords are stored  
✅ Password is never logged or exposed  

## Troubleshooting

### "Cannot read property 'password_hash' of undefined"
- The users table doesn't have the `password_hash` column yet
- Run the SQL migration above in Supabase SQL Editor

### Users can still login with wrong password
- Clear browser cache/localStorage
- Verify the `password_hash` column exists in database
- Check that store.ts has been updated with new code

### "Cannot find module '@/lib/password'"
- Make sure `lib/password.ts` file exists
- Restart dev server: `npm run dev`

## Migration Path from Old System

If you had previous authentication logic:

1. **Old system**: Any password worked ❌
2. **New system**: Password must match the hash ✅
3. **Existing users**: Auto-migrated on first login with new password

## Next Steps

1. Add `password_hash` column to database
2. Restart your development server
3. Test the flows above
4. All new passwords will be properly secured

## Files Modified

- `lib/password.ts` - **NEW** password utilities
- `lib/store.ts` - Updated login/addUser functions
- `components/auth/auth-screen.tsx` - Improved error handling and validation

---

For questions or issues, check the error messages in browser console and verify the database schema.
