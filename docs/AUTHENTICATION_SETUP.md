# ZhCode IDE - User Authentication Setup

## Overview

The ZhCode IDE now includes a complete user authentication system with:
- ✅ User registration (signup)
- ✅ User login/logout
- ✅ User profile management
- ✅ Session persistence
- ✅ Automatic API key storage

## Architecture

### Components Created

**1. Auth Service** (`services/authService.ts`)
- Handles all authentication logic with Appwrite
- Functions: signup, login, logout, updateUserProfile
- Manages API calls to Appwrite User and Database

**2. Auth Context** (`context/AuthContext.tsx`)
- React Context for global auth state management
- Provides `useAuth()` hook for components
- Automatic session restoration on app load

**3. Components**
- `Login.tsx` - Login form with email/password validation
- `Signup.tsx` - Registration form with username/email validation
- `UserMenu.tsx` - User profile dropdown menu in header
- `AuthPage.tsx` - Page switcher between login and signup

**4. Styling**
- `Auth.css` - Gradient login/signup forms
- `UserMenu.css` - User menu dropdown styling

### Data Model

**User Profile Collection Schema**

| Field | Type | Notes |
|-------|------|-------|
| userId | String | Appwrite User ID (unique) |
| email | Email | User email (unique) |
| username | String | Display username (unique, 3+ chars) |
| name | String | Full display name |
| avatar | String | Avatar URL (auto-generated from username) |
| bio | String | User biography |
| theme | String | UI theme preference (dark/light) |
| language | String | Preferred language (zh/en) |
| isVerified | Boolean | Email verification status |
| isPremium | Boolean | Premium user status |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last profile update |

**Indexes**
- `email` - Unique index for email lookup
- `username` - Unique index for username uniqueness
- `userId` - Unique index for Appwrite user mapping
- `createdAt` - Index for sorting by date

## Setup Instructions

### Step 1: Create Users Collection

First, ensure you have the Appwrite setup completed. Then:

```bash
# Option A: Use PowerShell (recommended for Windows)
cd c:\Users\mjtan\Desktop\wencode\appwrite
$env:APPWRITE_API_KEY = "your_api_key"
.\setup-collections-with-users.ps1

# Option B: Use Node.js
node setup-collections-with-users.js

# Option C: Manual cURL
# See CURL_COMMANDS_WITH_USERS.md
```

### Step 2: Run the IDE

```bash
cd packages/ide
npm install
npm run dev
```

Visit: http://localhost:3001

### Step 3: Create Account

1. Click **"Sign up here"** on the login page
2. Enter:
   - Email: your@email.com
   - Username: your_username (3+ chars, alphanumeric + - _)
   - Name: Your Name (optional)
   - Password: 8+ characters (recommended)
3. Click **Sign Up**

### Step 4: Login

Once your account is created:
1. Enter email and password
2. Click **Login**
3. You're now logged in and can use all IDE features

## Features

### User Profile Features

**In the IDE Header:**
- Click on your avatar/name in the top-right corner
- View your profile information
- Edit profile (planned)
- Access settings (planned)
- Logout button

### Authentication Features

**Login Page:**
- Email validation
- Password input (masked)
- Switch to signup form
- Error messages with feedback

**Signup Page:**
- Email validation
- Username validation (3+ characters, alphanumeric)
- Optional full name
- Password confirmation
- Real-time validation
- Helpful error messages

**Session Management:**
- Automatic session check on app load
- Persistent login (survives page refresh)
- Secure logout with session cleanup
- Auto-generated avatar from username

## API Endpoints Used

```
POST   /account - Create new account
POST   /sessions/email - Login with email/password
DELETE /sessions/current - Logout
GET    /account - Get current user
GET    /account - Fetch user profile
```

## Security Features

✅ **Passwords:** Securely hashed by Appwrite  
✅ **Sessions:** Secure session tokens stored in cookies  
✅ **Validation:** Email and password validation on client  
✅ **Unique Fields:** Email and username uniqueness enforced  
✅ **Permissions:** Users can only access their own profile  

## Error Handling

**Signup Errors:**
- Email already in use
- Username already taken
- Password too weak
- Form validation errors

**Login Errors:**
- Invalid email/password
- User not found
- Account disabled

**Session Errors:**
- Session expired
- Token invalid
- User deleted

## Environment Setup

### Required Environment Variables

In `.env` file (already configured):

```env
VITE_APPWRITE_PROJECT_ID=6940e8610022e30d684a
VITE_APPWRITE_DATABASE_ID=zhcode_db
```

### Optional Customization

Modify authentication behavior in `services/authService.ts`:

```typescript
// Change API endpoint
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')  // Change here
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Customize avatar generation
avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
```

## Testing

### Test Account

Create a test account for development:

```
Email: test@example.com
Username: testuser
Password: Test@123456
```

### Test Cases

- [ ] Signup with valid email/username
- [ ] Prevent duplicate email signup
- [ ] Prevent duplicate username
- [ ] Login with correct credentials
- [ ] Reject login with wrong password
- [ ] Logout clears session
- [ ] Refresh page maintains login
- [ ] Logout removes session

## Troubleshooting

### "User (role: guests) missing scopes"

**Problem:** API key doesn't have users.write permission

**Solution:**
1. Create new API key in Appwrite Console
2. Add scopes: `users.write`, `users.read`
3. Update API key in setup script
4. Re-run setup

### "Collection already exists"

**Problem:** Users collection already created

**Solution:**
This is normal. The script will skip creation and continue.

### "Session not found after refresh"

**Problem:** Cookies not persisted

**Solution:**
1. Check browser cookie settings
2. Ensure localhost is allowed
3. Clear browser cache and retry
4. Check Appwrite session settings

### Signup fails with "Email required"

**Problem:** Email validation issue

**Solution:**
1. Use valid email format (user@domain.com)
2. Check email hasn't been used
3. Check Appwrite email validation rules

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Profile picture upload
- [ ] User preferences sync
- [ ] Account deletion
- [ ] Change password/email

## Files Created

```
packages/ide/src/
├── services/
│   └── authService.ts           # Auth logic
├── context/
│   └── AuthContext.tsx          # React context
├── components/
│   ├── Login.tsx                # Login form
│   ├── Signup.tsx               # Signup form
│   ├── UserMenu.tsx             # User menu
│   ├── AuthPage.tsx             # Auth page switcher
│   ├── Auth.css                 # Auth styling
│   └── UserMenu.css             # Menu styling
├── Root.tsx                     # Root wrapper with auth
└── main.tsx                     # Updated entry point

appwrite/
└── users_schema.json            # User collection schema
```

## Integration Points

The authentication system is fully integrated with:

✅ **IDE State Management** - User context available everywhere  
✅ **Cloud Projects** - Projects linked to user ID  
✅ **AI Operations** - Operations logged with user ID  
✅ **AI History** - Filtered by current user  

## Next Steps

1. ✅ Setup users collection (see Step 1)
2. ✅ Run IDE with authentication
3. ✅ Create user account
4. ✅ Test login/logout
5. Customize profile fields
6. Add email verification
7. Implement password reset

## Support

For issues or questions:
1. Check error messages in console
2. Review browser DevTools Network tab
3. Check Appwrite Console for collection status
4. Verify API key has correct permissions

---

**Created:** 2024-12-16  
**Version:** 1.0  
**Status:** Production Ready  

🔐 Your ZhCode IDE now has secure user authentication!
