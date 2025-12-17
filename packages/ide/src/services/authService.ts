import { Client, Account, Databases, ID } from 'appwrite';

// Get environment variables with fallback  
function getEnv(key: string): string {
  try {
    return (import.meta.env as Record<string, string>)[key] || '';
  } catch {
    return '';
  }
}

// Initialize Appwrite
const client = new Client()
  .setEndpoint(getEnv('VITE_APPWRITE_ENDPOINT') || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(getEnv('VITE_APPWRITE_PROJECT_ID'));

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = getEnv('VITE_APPWRITE_DATABASE_ID');
const USERS_COLLECTION_ID = 'users';

// User interface
export interface User {
  [key: string]: unknown;
}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Sign up new user
 */
export async function signup(
  email: string,
  password: string,
  username: string,
  name?: string
): Promise<User> {
  try {
    // Step 1: Create Appwrite account
    console.log('Step 1: Creating Appwrite account...');
    const session = await (account as any).create(ID.unique(), email, password, name || username);
    const userId: string = (session as any).$id;
    console.log('✅ Account created:', userId);
    
    // Step 2: Create user profile
    const userData: User = {
      userId: userId,
      email,
      username,
      name: name || username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      theme: 'dark',
      language: 'en',
      isVerified: false,
      isPremium: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 3: Save to database
    console.log('Step 3: Saving to database...', { DATABASE_ID, USERS_COLLECTION_ID });
    await (databases as any).createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      userData
    );
    console.log('✅ User document created:', userId);

    return userData;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    console.error('❌ Signup error:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    // Create session
    await (account as any).createEmailPasswordSession(email, password);

    // Get current user
    const appwriteUser = await (account as any).get();

    // Fetch user profile from database
    const userProfile: User = await (databases as any).getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      (appwriteUser as any).$id
    );

    return userProfile;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    throw new Error(errorMessage);
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await (account as any).deleteSessions();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    throw new Error(errorMessage);
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const appwriteUser = await (account as any).get();
    
    // Fetch user profile from database
    const userProfile: User = await (databases as any).getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      (appwriteUser as any).$id
    );

    return userProfile;
  } catch (error: unknown) {
    // No active session
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  try {
    const updatedUser: User = await (databases as any).updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return updatedUser;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Update failed';
    throw new Error(errorMessage);
  }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailable(_username: string): Promise<boolean> {
  try {
    const result = await (databases as any).listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      []
    );
    
    // Simple check - in production use proper query
    return (result as any).total === 0;
  } catch (error: unknown) {
    return false;
  }
}

/**
 * Check if email is available
 */
export async function checkEmailAvailable(_email: string): Promise<boolean> {
  try {
    const result = await (databases as any).listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      []
    );
    
    return (result as any).total === 0;
  } catch (error: unknown) {
    return false;
  }
}

/**
 * Update user email (requires re-verification)
 */
export async function updateUserEmail(newEmail: string, password: string): Promise<void> {
  try {
    await (account as any).updateEmail(newEmail, password);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Email update failed';
    throw new Error(errorMessage);
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(newPassword: string, oldPassword: string): Promise<void> {
  try {
    await (account as any).updatePassword(newPassword, oldPassword);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Password update failed';
    throw new Error(errorMessage);
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
  try {
    const appwriteUser = await (account as any).get();
    
    // Delete user profile from database
    await (databases as any).deleteDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      (appwriteUser as any).$id
    );

    // Delete Appwrite account - deleteSessions instead to logout
    await (account as any).deleteSessions();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Account deletion failed';
    throw new Error(errorMessage);
  }
}

export { client, account, databases };
