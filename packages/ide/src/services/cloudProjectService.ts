/**
 * Cloud Project Service
 * Database (zhcode_projects): Stores project metadata and file list (references)
 * Storage (zhcode_files): Stores actual file contents
 */

import { Client, Databases, Storage, Query, ID } from 'appwrite';

// Get environment variables
const getEnv = (key: string, defaultValue: string) => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(getEnv('VITE_APPWRITE_ENDPOINT', 'https://sgp.cloud.appwrite.io/v1'))
  .setProject(getEnv('VITE_APPWRITE_PROJECT_ID', 'default'));

const databases = new Databases(client);
const storage = new Storage(client);

// Configuration
const DATABASE_ID = getEnv('VITE_APPWRITE_DATABASE_ID', 'zhcode_db');
const COLLECTION_ID = 'zhcode_projects';
const BUCKET_ID = getEnv('VITE_APPWRITE_BUCKET_ID', 'zhcode_files');

// Local storage keys for caching/fallback
const PROJECTS_CACHE_KEY = 'zhcode_projects_cache';
const CURRENT_PROJECT_KEY = 'zhcode_current_project';

// File reference stored in database
// This links a filename in the project to its content in Storage
export interface FileReference {
  filename: string;      // e.g., "main.zhc"
  storageId: string;     // Appwrite Storage file ID
  userId: string;        // Owner user ID (for tracing)
  projectId: string;     // Parent project ID (for tracing)
  size: number;          // File size in bytes
  createdAt: string;     // When file was first uploaded
  updatedAt: string;     // When file was last updated
}

export interface CloudProject {
  $id?: string;
  id: string;
  name: string;
  files: Record<string, string>;  // In-memory: filename -> content
  fileRefs: FileReference[];      // Database: file references
  userId: string;
  mainFile: string;
  language: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  userId: string;
  updatedAt: string;
  mainFile?: string;
  fileCount?: number;
}

/**
 * Save project to local cache
 */
function cacheProject(project: CloudProject): void {
  try {
    const cache = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY) || '{}');
    cache[project.id] = project;
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to cache project:', e);
  }
}

/**
 * Get project from local cache
 */
function getCachedProject(projectId: string): CloudProject | null {
  try {
    const cache = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY) || '{}');
    return cache[projectId] || null;
  } catch {
    return null;
  }
}

/**
 * Get all cached projects
 */
function getAllCachedProjects(): CloudProject[] {
  try {
    const cache = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY) || '{}');
    return Object.values(cache);
  } catch {
    return [];
  }
}

/**
 * Remove project from cache
 */
function removeCachedProject(projectId: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY) || '{}');
    delete cache[projectId];
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to remove cached project:', e);
  }
}

/**
 * Upload file content to Appwrite Storage
 * Filename format: {userId}_{projectId}_{filename} - allows tracing back to owner
 * Returns the storage file ID
 */
async function uploadFileToStorage(
  filename: string, 
  content: string, 
  projectId: string,
  userId: string
): Promise<string | null> {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    // Include userId and projectId in storage filename for easy identification
    const safeFilename = filename.replace(/\//g, '_').replace(/\\/g, '_');
    const storageFilename = `${userId}_${projectId}_${safeFilename}`;
    const file = new File([blob], storageFilename, { type: 'text/plain' });
    
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    console.log('File uploaded to storage:', filename, '->', response.$id, '(', storageFilename, ')');
    return response.$id;
  } catch (error) {
    console.error('Failed to upload file to storage:', error);
    return null;
  }
}

/**
 * Download file content from Appwrite Storage
 */
async function downloadFileFromStorage(storageId: string): Promise<string | null> {
  try {
    const url = storage.getFileDownload(BUCKET_ID, storageId);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Failed to download file from storage:', error);
    return null;
  }
}

/**
 * Delete file from Appwrite Storage
 */
async function deleteFileFromStorage(storageId: string): Promise<boolean> {
  try {
    await storage.deleteFile(BUCKET_ID, storageId);
    console.log('File deleted from storage:', storageId);
    return true;
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
    return false;
  }
}

/**
 * Update file in storage (delete old, upload new)
 */
async function updateFileInStorage(
  oldStorageId: string | null, 
  filename: string, 
  content: string, 
  projectId: string,
  userId: string
): Promise<string | null> {
  // Delete old file if exists
  if (oldStorageId) {
    await deleteFileFromStorage(oldStorageId);
  }
  // Upload new file
  return await uploadFileToStorage(filename, content, projectId, userId);
}

/**
 * Create a new project in Appwrite
 * 1. Upload files to Storage (with userId and projectId in filename)
 * 2. Create project document with file references
 */
export async function createProject(
  name: string, 
  userId: string, 
  initialFiles?: Record<string, string>
): Promise<CloudProject | null> {
  const now = new Date().toISOString();
  const files = initialFiles || { 'main.zhc': '// 新项目\n// New Project\n\n' };
  const mainFile = Object.keys(files)[0] || 'main.zhc';
  
  // Generate a temporary project ID for file naming (will be replaced with actual ID)
  const tempProjectId = `proj_${Date.now()}`;
  
  try {
    // 1. Upload all files to Storage
    const fileRefs: FileReference[] = [];
    for (const [filename, content] of Object.entries(files)) {
      const storageId = await uploadFileToStorage(filename, content, tempProjectId, userId);
      if (storageId) {
        fileRefs.push({
          filename,
          storageId,
          userId,              // Track which user owns this file
          projectId: tempProjectId,  // Will be updated after project creation
          size: content.length,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    // 2. Create document in database with file references
    const docData = {
      userId,
      projectName: name,
      description: '',
      files: '{}',  // Legacy field - kept empty, actual files stored in Storage
      fileRefs: JSON.stringify(fileRefs),  // Store file references as JSON
      mainFile,
      language: 'zh',
      tags: [],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      docData
    );

    const project: CloudProject = {
      $id: response.$id,
      id: response.$id,
      name,
      files,  // In-memory content
      fileRefs,
      userId,
      mainFile,
      language: 'zh',
      createdAt: now,
      updatedAt: now,
    };

    // Cache locally
    cacheProject(project);
    setCurrentProjectId(project.id);

    console.log('Project created:', project.id, 'with', fileRefs.length, 'files');
    return project;
  } catch (error) {
    console.error('Failed to create project in Appwrite:', error);
    
    // Fallback to local storage
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const project: CloudProject = {
      id: localId,
      name,
      files,
      fileRefs: [],
      userId,
      mainFile,
      language: 'zh',
      createdAt: now,
      updatedAt: now,
    };
    
    cacheProject(project);
    setCurrentProjectId(project.id);
    console.log('Project created locally (fallback):', project.id);
    return project;
  }
}

/**
 * Save/Update a project in Appwrite
 * 1. Compare files to find changes
 * 2. Upload new/changed files to Storage
 * 3. Delete removed files from Storage
 * 4. Update project document with new file references
 */
export async function saveProject(
  projectId: string, 
  files: Record<string, string>, 
  name?: string
): Promise<CloudProject | null> {
  const now = new Date().toISOString();
  
  // Get existing project
  let existingProject = getCachedProject(projectId);
  
  try {
    // Try to get from Appwrite if not in cache
    if (!existingProject && !projectId.startsWith('local_')) {
      try {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId);
        const fileRefs = JSON.parse((doc as unknown as { fileRefs: string }).fileRefs || '[]');
        existingProject = {
          $id: doc.$id,
          id: doc.$id,
          name: (doc as unknown as { projectName: string }).projectName,
          files: {},  // Will be loaded separately
          fileRefs,
          userId: (doc as unknown as { userId: string }).userId,
          mainFile: (doc as unknown as { mainFile: string }).mainFile,
          language: (doc as unknown as { language: string }).language,
          createdAt: (doc as unknown as { createdAt: string }).createdAt,
          updatedAt: (doc as unknown as { updatedAt: string }).updatedAt,
        };
      } catch {
        console.warn('Project not found in Appwrite:', projectId);
      }
    }

    if (!existingProject) {
      console.error('Project not found:', projectId);
      return null;
    }

    // For local projects, just update cache
    if (projectId.startsWith('local_')) {
      const updatedProject: CloudProject = {
        ...existingProject,
        files,
        updatedAt: now,
        name: name || existingProject.name,
      };
      cacheProject(updatedProject);
      return updatedProject;
    }

    // Build maps for comparison
    const oldFileRefs = existingProject.fileRefs || [];
    const oldRefMap = new Map(oldFileRefs.map(ref => [ref.filename, ref]));
    const newFileRefs: FileReference[] = [];
    const projectUserId = existingProject.userId;

    // Process each file
    for (const [filename, content] of Object.entries(files)) {
      const oldRef = oldRefMap.get(filename);
      const oldContent = existingProject.files[filename];
      
      // Check if content changed (or if we don't have old content, assume changed)
      const contentChanged = oldContent !== content;
      
      if (oldRef && !contentChanged) {
        // File unchanged, keep old reference (but ensure userId/projectId are set)
        newFileRefs.push({
          ...oldRef,
          userId: projectUserId,
          projectId: projectId
        });
      } else {
        // File is new or changed, upload to storage
        const storageId = await updateFileInStorage(
          oldRef?.storageId || null,
          filename,
          content,
          projectId,
          projectUserId
        );
        
        if (storageId) {
          newFileRefs.push({
            filename,
            storageId,
            userId: projectUserId,       // Track which user owns this file
            projectId: projectId,        // Track which project this file belongs to
            size: content.length,
            createdAt: oldRef?.createdAt || now,  // Keep original creation time if exists
            updatedAt: now
          });
        }
      }
      
      // Remove from old map (remaining items will be deleted)
      oldRefMap.delete(filename);
    }

    // Delete files that were removed
    for (const [, ref] of oldRefMap) {
      await deleteFileFromStorage(ref.storageId);
    }

    // Update database document
    const updateData: Record<string, unknown> = {
      files: '{}',  // Legacy field - kept empty, actual files stored in Storage
      fileRefs: JSON.stringify(newFileRefs),
      updatedAt: now,
    };
    
    if (name) {
      updateData.projectName = name;
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      projectId,
      updateData
    );
    
    console.log('Project saved:', projectId, 'with', newFileRefs.length, 'files');

    // Update local cache
    const updatedProject: CloudProject = {
      ...existingProject,
      files,
      fileRefs: newFileRefs,
      updatedAt: now,
      name: name || existingProject.name,
    };
    
    cacheProject(updatedProject);
    return updatedProject;
  } catch (error) {
    console.error('Failed to save project to Appwrite:', error);
    
    // Update local cache anyway
    if (existingProject) {
      const updatedProject: CloudProject = {
        ...existingProject,
        files,
        updatedAt: now,
        name: name || existingProject.name,
      };
      cacheProject(updatedProject);
      return updatedProject;
    }
    
    return null;
  }
}

/**
 * Load a project by ID from Appwrite
 * 1. Get project document with file references
 * 2. Download file contents from Storage
 */
export async function loadProject(projectId: string): Promise<CloudProject | null> {
  // Check cache first for faster loading
  const cached = getCachedProject(projectId);
  
  // If it's a local project, just return from cache
  if (projectId.startsWith('local_')) {
    if (cached) {
      setCurrentProjectId(projectId);
      return cached;
    }
    return null;
  }

  try {
    // 1. Get project document
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId);
    const fileRefs: FileReference[] = JSON.parse((doc as unknown as { fileRefs: string }).fileRefs || '[]');
    
    // 2. Download all file contents from Storage
    const files: Record<string, string> = {};
    for (const ref of fileRefs) {
      const content = await downloadFileFromStorage(ref.storageId);
      if (content !== null) {
        files[ref.filename] = content;
      } else {
        // Fallback to cached content if download fails
        if (cached?.files[ref.filename]) {
          files[ref.filename] = cached.files[ref.filename];
        }
      }
    }
    
    const project: CloudProject = {
      $id: doc.$id,
      id: doc.$id,
      name: (doc as unknown as { projectName: string }).projectName,
      files,
      fileRefs,
      userId: (doc as unknown as { userId: string }).userId,
      mainFile: (doc as unknown as { mainFile: string }).mainFile,
      language: (doc as unknown as { language: string }).language || 'zh',
      description: (doc as unknown as { description?: string }).description,
      createdAt: (doc as unknown as { createdAt: string }).createdAt,
      updatedAt: (doc as unknown as { updatedAt: string }).updatedAt,
    };

    // Update cache
    cacheProject(project);
    setCurrentProjectId(project.id);
    
    console.log('Project loaded:', project.id, 'with', Object.keys(files).length, 'files');
    return project;
  } catch (error) {
    console.error('Failed to load project from Appwrite:', error);
    
    // Try cache as fallback
    if (cached) {
      setCurrentProjectId(projectId);
      console.log('Project loaded from cache (fallback):', cached.id);
      return cached;
    }
    
    return null;
  }
}

/**
 * Get current project ID
 */
export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

/**
 * Set current project ID
 */
export function setCurrentProjectId(projectId: string | null): void {
  if (projectId) {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }
}

/**
 * List all projects for a user from Appwrite
 */
export async function listProjects(userId: string): Promise<ProjectListItem[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('updatedAt'),
        Query.limit(100),
      ]
    );

    const projects: ProjectListItem[] = response.documents.map((doc) => {
      const fileRefs = JSON.parse((doc as unknown as { fileRefs?: string }).fileRefs || '[]');
      return {
        id: doc.$id,
        name: (doc as unknown as { projectName: string }).projectName,
        userId: (doc as unknown as { userId: string }).userId,
        updatedAt: (doc as unknown as { updatedAt: string }).updatedAt,
        mainFile: (doc as unknown as { mainFile: string }).mainFile,
        fileCount: fileRefs.length,
      };
    });

    console.log('Projects loaded from Appwrite:', projects.length);
    return projects;
  } catch (error) {
    console.error('Failed to list projects from Appwrite:', error);
    
    // Fallback to cached projects
    const cached = getAllCachedProjects().filter(p => p.userId === userId);
    return cached.map(p => ({
      id: p.id,
      name: p.name,
      userId: p.userId,
      updatedAt: p.updatedAt,
      mainFile: p.mainFile,
      fileCount: Object.keys(p.files).length,
    }));
  }
}

/**
 * List all projects (no user filter) from Appwrite
 */
export async function listAllProjects(): Promise<ProjectListItem[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc('updatedAt'),
        Query.limit(100),
      ]
    );

    const projects: ProjectListItem[] = response.documents.map((doc) => {
      const fileRefs = JSON.parse((doc as unknown as { fileRefs?: string }).fileRefs || '[]');
      return {
        id: doc.$id,
        name: (doc as unknown as { projectName: string }).projectName,
        userId: (doc as unknown as { userId: string }).userId,
        updatedAt: (doc as unknown as { updatedAt: string }).updatedAt,
        mainFile: (doc as unknown as { mainFile: string }).mainFile,
        fileCount: fileRefs.length,
      };
    });

    console.log('All projects loaded from Appwrite:', projects.length);
    return projects;
  } catch (error) {
    console.error('Failed to list all projects from Appwrite:', error);
    
    // Fallback to cached projects
    const cached = getAllCachedProjects();
    return cached.map(p => ({
      id: p.id,
      name: p.name,
      userId: p.userId,
      updatedAt: p.updatedAt,
      mainFile: p.mainFile,
      fileCount: Object.keys(p.files).length,
    }));
  }
}

/**
 * Delete a project from Appwrite
 * 1. Get file references
 * 2. Delete all files from Storage
 * 3. Delete project document
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    if (!projectId.startsWith('local_')) {
      // 1. Get project to find file references
      try {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId);
        const fileRefs: FileReference[] = JSON.parse((doc as unknown as { fileRefs?: string }).fileRefs || '[]');
        
        // 2. Delete all files from Storage
        for (const ref of fileRefs) {
          await deleteFileFromStorage(ref.storageId);
        }
      } catch (e) {
        console.warn('Could not get project files for deletion:', e);
      }
      
      // 3. Delete project document
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, projectId);
      console.log('Project deleted from Appwrite:', projectId);
    }

    // Remove from cache
    removeCachedProject(projectId);

    // Clear current project if it was deleted
    if (getCurrentProjectId() === projectId) {
      setCurrentProjectId(null);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete project from Appwrite:', error);
    
    // Still remove from cache
    removeCachedProject(projectId);
    if (getCurrentProjectId() === projectId) {
      setCurrentProjectId(null);
    }
    
    return false;
  }
}

/**
 * Get project by ID (without setting as current)
 */
export async function getProject(projectId: string): Promise<CloudProject | null> {
  const cached = getCachedProject(projectId);
  
  if (projectId.startsWith('local_')) {
    return cached;
  }

  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId);
    const fileRefs: FileReference[] = JSON.parse((doc as unknown as { fileRefs: string }).fileRefs || '[]');
    
    // Use cached files if available, otherwise leave empty (will be loaded on full load)
    const files = cached?.files || {};
    
    const project: CloudProject = {
      $id: doc.$id,
      id: doc.$id,
      name: (doc as unknown as { projectName: string }).projectName,
      files,
      fileRefs,
      userId: (doc as unknown as { userId: string }).userId,
      mainFile: (doc as unknown as { mainFile: string }).mainFile,
      language: (doc as unknown as { language: string }).language || 'zh',
      createdAt: (doc as unknown as { createdAt: string }).createdAt,
      updatedAt: (doc as unknown as { updatedAt: string }).updatedAt,
    };

    return project;
  } catch (error) {
    console.error('Failed to get project from Appwrite:', error);
    return cached;
  }
}

/**
 * Check if project exists
 */
export async function projectExists(projectId: string): Promise<boolean> {
  if (projectId.startsWith('local_')) {
    return getCachedProject(projectId) !== null;
  }

  try {
    await databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId);
    return true;
  } catch {
    return getCachedProject(projectId) !== null;
  }
}
