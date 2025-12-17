# 🔐 ZhCode IDE - User Authentication Integration Guide

## ✅ What's Been Done

Your ZhCode IDE now has **complete user authentication** with:

- ✅ User registration (signup) with validation
- ✅ User login with email/password
- ✅ Automatic session management
- ✅ User profile with avatar and settings
- ✅ Logout functionality
- ✅ Integration with Appwrite
- ✅ React Context for global state

## 📁 Files Created

### Services
- **[src/services/authService.ts](../packages/ide/src/services/authService.ts)** - Authentication logic

### Context
- **[src/context/AuthContext.tsx](../packages/ide/src/context/AuthContext.tsx)** - Global auth state

### Components
- **[src/components/Login.tsx](../packages/ide/src/components/Login.tsx)** - Login form
- **[src/components/Signup.tsx](../packages/ide/src/components/Signup.tsx)** - Registration form
- **[src/components/UserMenu.tsx](../packages/ide/src/components/UserMenu.tsx)** - User profile menu
- **[src/components/AuthPage.tsx](../packages/ide/src/components/AuthPage.tsx)** - Auth page selector
- **[src/components/Auth.css](../packages/ide/src/components/Auth.css)** - Login/signup styling
- **[src/components/UserMenu.css](../packages/ide/src/components/UserMenu.css)** - Menu styling

### Root Setup
- **[src/Root.tsx](../packages/ide/src/Root.tsx)** - App wrapper with auth provider
- **[src/main.tsx](../packages/ide/src/main.tsx)** - Updated entry point

### Data Schema
- **[appwrite/users_schema.json](../appwrite/users_schema.json)** - User collection schema

### Updated Scripts
- **[appwrite/setup-collections.ps1](../appwrite/setup-collections.ps1)** - Now includes users
- **[appwrite/setup-collections.js](../appwrite/setup-collections.js)** - Now includes users

### Documentation
- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Complete auth setup guide

## 🚀 Getting Started (5 Steps)

### Step 1: Create Users Collection in Appwrite

```bash
# Navigate to appwrite directory
cd c:\Users\mjtan\Desktop\wencode\appwrite

# Set API key (from Appwrite Console Settings → API Keys)
# Create a key with: users.write, users.read, collections.write, collections.read, databases.write, databases.read

# Option A: PowerShell (Windows)
$env:APPWRITE_API_KEY = "your_api_key_here"
.\setup-collections.ps1

# Option B: Node.js (All platforms)
set APPWRITE_API_KEY=your_api_key_here
node setup-collections.js
```

✅ If successful, you'll see:
```
✅ All collections created successfully!
Collections ready to use:
  • ai_operations
  • zhcode_projects
  • users
```

### Step 2: Start the IDE

```bash
cd packages/ide
npm install
npm run dev
```

Visit: **http://localhost:3001**

### Step 3: Create Your Account

1. On the login page, click **"Sign up here"**
2. Enter:
   - **Email**: your@email.com
   - **Username**: your_username (3+ chars)
   - **Display Name**: Your Name (optional)
   - **Password**: At least 8 characters
3. Click **Sign Up**

### Step 4: Login

1. Enter your **email** and **password**
2. Click **Login**
3. You're now authenticated! ✅

### Step 5: Use the IDE

Your user profile appears in the top-right header:
- Click to see profile menu
- Click **Settings** to change preferences
- Click **Logout** to sign out

## 🎯 Features

### User Registration
✅ Email validation (unique)  
✅ Username validation (3+ chars, alphanumeric only)  
✅ Password confirmation  
✅ Auto-generated avatar  
✅ Error messages  

### User Login
✅ Email/password authentication  
✅ Session persistence (survives refresh)  
✅ Error handling  
✅ Automatic session restoration  

### User Profile
✅ Avatar display  
✅ Username/email display  
✅ Premium status indicator  
✅ Logout button  
✅ Expandable menu  

## 🔐 Security

- **Passwords**: Hashed by Appwrite (never stored plain text)
- **Sessions**: Secure tokens in HTTP-only cookies
- **Validation**: Client-side + server-side
- **Unique Constraints**: Email and username uniqueness enforced
- **Permissions**: Users can only access their own data

## 📊 Data Model

**User Collection:**
```
userId       → Appwrite User ID (unique)
email        → User email (unique)
username     → Display username (unique, 3+ chars)
name         → Full display name
avatar       → Auto-generated avatar URL
bio          → User bio
theme        → UI theme (dark/light)
language     → Preferred language (zh/en)
isVerified   → Email verification status
isPremium    → Premium user flag
createdAt    → Account creation date
updatedAt    → Last update date
```

## 🧪 Test Account

Create a test account for development:

```
Email:    test@example.com
Username: testuser
Name:     Test User
Password: TestPass123
```

## 🛠️ How It Works

### Flow Diagram

```
User Visits IDE
       ↓
AuthProvider Wrapper
       ↓
Check if Logged In?
       ├─ YES → Show IDE + UserMenu
       └─ NO  → Show AuthPage (Login/Signup)

On Signup:
  Email/Username/Password → Appwrite.Account.create()
  → Create User Profile → Appwrite.Database
  → Auto-login user → Show IDE

On Login:
  Email/Password → Appwrite.Account.createEmailPasswordSession()
  → Fetch User Profile → Appwrite.Database
  → Store in Context → Show IDE

On Logout:
  Click Logout → Appwrite.Account.deleteSession()
  → Clear Context → Show Login Page
```

### Component Architecture

```
main.tsx
   ↓
Root.tsx (wraps with AuthProvider)
   ↓
AppWithAuth (conditional rendering)
   ├─ If loading → Loading spinner
   ├─ If not logged in → AuthPage
   │                  ├─ Login component
   │                  └─ Signup component
   └─ If logged in → App + UserMenu
                      ├─ IDE interface
                      └─ User menu (top-right)

useAuth Hook (available everywhere):
   ├─ user          → Current user object
   ├─ isLoading    → Loading state
   ├─ error        → Error messages
   ├─ signup()     → Create account
   ├─ login()      → Login user
   ├─ logout()     → Logout user
   └─ updateProfile() → Update user profile
```

## 📝 Environment Variables

Already configured in `.env`:

```env
VITE_APPWRITE_PROJECT_ID=6940e8610022e30d684a
VITE_APPWRITE_DATABASE_ID=zhcode_db
```

## 🐛 Troubleshooting

### "Collection 'users' not found"

**Solution**: Run the setup script to create collections:
```bash
cd appwrite
set APPWRITE_API_KEY=your_key
node setup-collections.js
```

### "Invalid API key"

**Solution**: 
1. Go to Appwrite Console → Settings → API Keys
2. Create new key with proper scopes:
   - ✅ users.write
   - ✅ users.read
   - ✅ collections.write
   - ✅ databases.write
3. Copy and use in setup script

### "Email already registered"

**Solution**: Use a different email address

### "Username already taken"

**Solution**: Use a unique username (3+ characters)

### "Session lost after refresh"

**Solution**: 
1. Clear browser cookies
2. Logout and login again
3. Check Appwrite session timeout settings

## 📚 Next Steps

1. ✅ Setup collections (Step 1 above)
2. ✅ Start IDE and create account (Steps 2-4)
3. ✅ Test login/logout
4. 🔜 **Customize profile fields** (edit Profile.tsx)
5. 🔜 **Add email verification**
6. 🔜 **Implement password reset**
7. 🔜 **Add social login (Google, GitHub)**
8. 🔜 **Enable profile picture upload**

## 🎓 Code Examples

### Using Auth in Components

```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Accessing User Profile

```tsx
const { user } = useAuth();

console.log(user?.email);      // user@example.com
console.log(user?.username);   // user_name
console.log(user?.avatar);     // Avatar URL
console.log(user?.isPremium);  // true/false
```

### Updating User Profile

```tsx
const { updateProfile } = useAuth();

await updateProfile({
  name: 'New Name',
  theme: 'light',
  language: 'en'
});
```

## 📞 Support

For issues:
1. Check [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed guide
2. Review console errors (F12 → Console)
3. Check Appwrite Console for collection status
4. Verify API key permissions

---

**Status**: ✅ Complete & Ready  
**Version**: 1.0  
**Last Updated**: 2024-12-16  

🚀 Your ZhCode IDE now has enterprise-grade authentication!
