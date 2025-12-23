/**
 * File System Service
 * Supports both local file system (via File System Access API) and Appwrite Storage
 */

import { Storage, ID } from 'appwrite';
import { Client } from 'appwrite';

// Appwrite client setup
const getEnv = (key: string, defaultValue: string) => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

const client = new Client()
  .setEndpoint(getEnv('VITE_APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
  .setProject(getEnv('VITE_APPWRITE_PROJECT_ID', 'default'));

const storage = new Storage(client);
const BUCKET_ID = getEnv('VITE_APPWRITE_BUCKET_ID', 'zhcode_files');

// LocalStorage keys for cloud fallback
const CLOUD_PROJECTS_KEY = 'zhcode_cloud_projects_data';
const CLOUD_PROJECTS_LIST_KEY = 'zhcode_cloud_projects';

// Check if Appwrite is properly configured
const isAppwriteConfigured = () => {
  const projectId = getEnv('VITE_APPWRITE_PROJECT_ID', 'default');
  const bucketId = getEnv('VITE_APPWRITE_BUCKET_ID', '');
  return projectId !== 'default' && projectId !== '' && bucketId !== '';
};

// Storage mode type
export type StorageMode = 'local' | 'cloud';

// File entry interface
export interface FileEntry {
  name: string;
  path: string;
  content: string;
  isDirectory: boolean;
  lastModified?: number;
}

// Session state interface for persistence
export interface SessionState {
  files: Record<string, string>;
  activeFile: string;
  storageMode: StorageMode;
  localFolderName?: string;
  projectName?: string;
  lastSaved: string;
}

// Local storage keys
const SESSION_STATE_KEY = 'zhcode_session_state';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

/**
 * Save session state to localStorage
 */
export function saveSessionState(state: SessionState): void {
  try {
    const stateWithTimestamp = {
      ...state,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Failed to save session state:', error);
  }
}

/**
 * Load session state from localStorage
 */
export function loadSessionState(): SessionState | null {
  try {
    const saved = localStorage.getItem(SESSION_STATE_KEY);
    if (saved) {
      return JSON.parse(saved) as SessionState;
    }
  } catch (error) {
    console.error('Failed to load session state:', error);
  }
  return null;
}

/**
 * Clear session state
 */
export function clearSessionState(): void {
  localStorage.removeItem(SESSION_STATE_KEY);
}

// File handle storage for local file system
let directoryHandle: FileSystemDirectoryHandle | null = null;
const fileHandles = new Map<string, FileSystemFileHandle>();

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

/**
 * Open a local folder using File System Access API
 */
export async function openLocalFolder(): Promise<{
  folderName: string;
  files: Record<string, string>;
} | null> {
  if (!isFileSystemAccessSupported()) {
    alert('您的浏览器不支持本地文件系统访问。请使用 Chrome、Edge 或 Opera 浏览器。');
    return null;
  }

  try {
    // @ts-expect-error - File System Access API types
    directoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });

    if (!directoryHandle) return null;

    const files: Record<string, string> = {};
    fileHandles.clear();

    // Recursively read all files
    await readDirectory(directoryHandle, '', files);

    return {
      folderName: directoryHandle.name,
      files
    };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to open folder:', error);
    }
    return null;
  }
}

/**
 * Recursively read directory contents
 */
async function readDirectory(
  handle: FileSystemDirectoryHandle,
  path: string,
  files: Record<string, string>
): Promise<void> {
  // @ts-expect-error - File System Access API
  for await (const entry of handle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === 'file') {
      // Skip certain files
      const skipPatterns = [
        'node_modules', '.git', '.DS_Store', 'Thumbs.db',
        '.env.local', '.env', 'package-lock.json', 'pnpm-lock.yaml',
        '.next', 'dist', 'build', '.cache'
      ];
      
      const shouldSkip = skipPatterns.some(pattern => 
        entryPath.includes(pattern) || entry.name.startsWith('.')
      );

      if (!shouldSkip) {
        try {
          const file = await entry.getFile();
          // Only read text files (skip binary files)
          const textExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.zhc', '.zh',
            '.json', '.md', '.txt', '.css', '.scss', '.html',
            '.xml', '.yaml', '.yml', '.toml', '.ini', '.env',
            '.gitignore', '.prettierrc', '.eslintrc'
          ];
          
          const isTextFile = textExtensions.some(ext => 
            entry.name.toLowerCase().endsWith(ext)
          ) || !entry.name.includes('.');

          if (isTextFile && file.size < 1024 * 1024) { // Skip files > 1MB
            const content = await file.text();
            files[entryPath] = content;
            fileHandles.set(entryPath, entry);
          }
        } catch (e) {
          console.warn(`Could not read file: ${entryPath}`, e);
        }
      }
    } else if (entry.kind === 'directory') {
      // Skip certain directories
      const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.cache', '__pycache__'];
      if (!skipDirs.includes(entry.name) && !entry.name.startsWith('.')) {
        await readDirectory(entry, entryPath, files);
      }
    }
  }
}

/**
 * Save a file to the local file system
 */
export async function saveLocalFile(path: string, content: string): Promise<boolean> {
  if (!directoryHandle) {
    console.error('No directory handle available');
    return false;
  }

  try {
    // Get or create file handle
    let fileHandle = fileHandles.get(path);
    
    if (!fileHandle) {
      // Create new file
      const pathParts = path.split('/');
      const fileName = pathParts.pop()!;
      let currentDir = directoryHandle;

      // Create directories if needed
      for (const part of pathParts) {
        try {
          currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        } catch (e) {
          console.error(`Failed to create directory: ${part}`, e);
          return false;
        }
      }

      fileHandle = await currentDir.getFileHandle(fileName, { create: true });
      fileHandles.set(path, fileHandle);
    }

    // Write content
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    return true;
  } catch (error) {
    console.error('Failed to save file:', error);
    return false;
  }
}

/**
 * Create a new file in the local file system
 */
export async function createLocalFile(path: string, content: string = ''): Promise<boolean> {
  return saveLocalFile(path, content);
}

/**
 * Delete a file from the local file system
 */
export async function deleteLocalFile(path: string): Promise<boolean> {
  if (!directoryHandle) return false;

  try {
    const pathParts = path.split('/');
    const fileName = pathParts.pop()!;
    let currentDir = directoryHandle;

    // Navigate to the file's directory
    for (const part of pathParts) {
      currentDir = await currentDir.getDirectoryHandle(part);
    }

    await currentDir.removeEntry(fileName);
    fileHandles.delete(path);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

// ============ Appwrite Storage Functions ============

/**
 * Upload a file to Appwrite Storage
 */
export async function uploadToCloud(
  fileName: string,
  content: string,
  userId: string
): Promise<string | null> {
  try {
    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], fileName);

    // Generate unique file ID
    const fileId = ID.unique();

    // Upload to Appwrite
    const response = await storage.createFile(
      BUCKET_ID,
      fileId,
      file
    );

    // Store metadata
    const metadata = {
      fileId: response.$id,
      fileName,
      userId,
      uploadedAt: new Date().toISOString()
    };
    
    // Save file metadata to localStorage for tracking
    const existingMetadata = JSON.parse(localStorage.getItem('zhcode_cloud_files') || '[]');
    existingMetadata.push(metadata);
    localStorage.setItem('zhcode_cloud_files', JSON.stringify(existingMetadata));

    return response.$id;
  } catch (error) {
    console.error('Failed to upload to cloud:', error);
    return null;
  }
}

/**
 * Download a file from Appwrite Storage
 */
export async function downloadFromCloud(fileId: string): Promise<string | null> {
  try {
    const result = await storage.getFileDownload(BUCKET_ID, fileId);
    
    // getFileDownload returns a URL string in newer Appwrite versions
    const url = typeof result === 'string' ? result : (result as unknown as { href: string }).href;
    const response = await fetch(url);
    const text = await response.text();
    
    return text;
  } catch (error) {
    console.error('Failed to download from cloud:', error);
    return null;
  }
}

/**
 * List files in cloud storage for a user
 */
export async function listCloudFiles(userId: string): Promise<Array<{
  id: string;
  name: string;
  size: number;
  createdAt: string;
}>> {
  try {
    // Get from localStorage tracking (since Appwrite doesn't filter by user easily)
    const metadata = JSON.parse(localStorage.getItem('zhcode_cloud_files') || '[]');
    const userFiles = metadata.filter((m: { userId: string }) => m.userId === userId);
    
    return userFiles.map((m: { fileId: string; fileName: string; uploadedAt: string }) => ({
      id: m.fileId,
      name: m.fileName,
      size: 0,
      createdAt: m.uploadedAt
    }));
  } catch (error) {
    console.error('Failed to list cloud files:', error);
    return [];
  }
}

/**
 * Delete a file from cloud storage
 */
export async function deleteFromCloud(fileId: string): Promise<boolean> {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
    
    // Remove from localStorage tracking
    const metadata = JSON.parse(localStorage.getItem('zhcode_cloud_files') || '[]');
    const filtered = metadata.filter((m: { fileId: string }) => m.fileId !== fileId);
    localStorage.setItem('zhcode_cloud_files', JSON.stringify(filtered));
    
    return true;
  } catch (error) {
    console.error('Failed to delete from cloud:', error);
    return false;
  }
}

/**
 * Save all files to cloud as a project
 * Uses localStorage as fallback if Appwrite is not configured
 */
export async function saveProjectToCloudStorage(
  files: Record<string, string>,
  projectName: string,
  userId: string,
  existingFileId?: string
): Promise<string | null> {
  // Use existing ID if updating, otherwise create new one
  const fileId = existingFileId || `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const projectBundle = {
    id: fileId,
    name: projectName,
    files,
    savedAt: new Date().toISOString(),
    userId
  };
  
  console.log('saveProjectToCloudStorage:', { fileId, projectName, filesCount: Object.keys(files).length, existingFileId, isConfigured: isAppwriteConfigured() });

  // Try Appwrite first if configured
  if (isAppwriteConfigured()) {
    try {
      const blob = new Blob([JSON.stringify(projectBundle, null, 2)], { type: 'application/json' });
      const file = new File([blob], `${projectName}.zhcode-project`);
      console.log('Creating file blob, size:', blob.size);
      
      let fileIdToUse = fileId;
      
      // If updating existing file, delete old one first
      if (existingFileId) {
        try {
          await storage.deleteFile(BUCKET_ID, existingFileId);
          console.log('Deleted old file:', existingFileId);
        } catch (e) {
          console.warn('Failed to delete old file:', e);
        }
      }
      
      // Create new file with the same ID (or new ID if first save)
      const response = await storage.createFile(BUCKET_ID, fileId, file);
      fileIdToUse = response.$id;
      console.log('Saved file with ID:', fileIdToUse);

      // Track the project - update if exists, add if new
      const projects = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_LIST_KEY) || '[]');
      const existingIndex = projects.findIndex((p: { fileId: string }) => p.fileId === existingFileId);
      
      const projectMetadata = {
        fileId: fileIdToUse,
        projectName,
        userId,
        savedAt: new Date().toISOString(),
        source: 'appwrite'
      };
      
      if (existingIndex >= 0) {
        projects[existingIndex] = projectMetadata;
      } else {
        projects.push(projectMetadata);
      }
      
      localStorage.setItem(CLOUD_PROJECTS_LIST_KEY, JSON.stringify(projects));
      return fileIdToUse;
    } catch (error) {
      console.warn('Appwrite storage failed, using localStorage fallback:', error);
      // Fall through to localStorage
    }
  }

  // Fallback: Save to localStorage
  try {
    // Save project data
    const projectsData = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_KEY) || '{}');
    projectsData[fileId] = projectBundle;
    localStorage.setItem(CLOUD_PROJECTS_KEY, JSON.stringify(projectsData));

    // Update projects list - update if exists, add if new
    const projects = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_LIST_KEY) || '[]');
    const existingIndex = projects.findIndex((p: { fileId: string }) => p.fileId === existingFileId);
    
    const projectMetadata = {
      fileId,
      projectName,
      userId,
      savedAt: new Date().toISOString(),
      source: 'localStorage'
    };
    
    if (existingIndex >= 0) {
      projects[existingIndex] = projectMetadata;
    } else {
      projects.push(projectMetadata);
    }
    
    localStorage.setItem(CLOUD_PROJECTS_LIST_KEY, JSON.stringify(projects));
    return fileId;
  } catch (error) {
    console.error('Failed to save project:', error);
    return null;
  }
}

/**
 * Load a project from cloud storage
 * Uses localStorage as fallback if Appwrite is not configured
 */
export async function loadProjectFromCloudStorage(fileId: string): Promise<{
  name: string;
  files: Record<string, string>;
} | null> {
  // Check localStorage first (for localStorage-saved projects)
  try {
    const projectsData = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_KEY) || '{}');
    if (projectsData[fileId]) {
      const project = projectsData[fileId];
      return {
        name: project.name,
        files: project.files
      };
    }
  } catch (e) {
    console.warn('localStorage load failed:', e);
  }

  // Try Appwrite if configured
  if (isAppwriteConfigured()) {
    try {
      // Get file download URL
      const fileDownloadUrl = await storage.getFileDownload(BUCKET_ID, fileId);
      
      // Fetch the file content
      const response = await fetch(fileDownloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }
      
      const projectData = await response.json();
      
      return {
        name: projectData.name || 'Untitled',
        files: projectData.files || {}
      };
    } catch (error) {
      console.error('Failed to load project from Appwrite:', error);
    }
  }

  return null;
}

/**
 * List user's cloud projects
 */
export function listCloudProjects(userId: string): Array<{
  fileId: string;
  projectName: string;
  savedAt: string;
  source?: string;
}> {
  const projects = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_LIST_KEY) || '[]');
  return projects.filter((p: { userId: string }) => p.userId === userId);
}

/**
 * Delete a cloud project
 */
export function deleteCloudProject(fileId: string): boolean {
  try {
    // Remove from projects list
    const projects = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_LIST_KEY) || '[]');
    const filtered = projects.filter((p: { fileId: string }) => p.fileId !== fileId);
    localStorage.setItem(CLOUD_PROJECTS_LIST_KEY, JSON.stringify(filtered));

    // Remove project data
    const projectsData = JSON.parse(localStorage.getItem(CLOUD_PROJECTS_KEY) || '{}');
    delete projectsData[fileId];
    localStorage.setItem(CLOUD_PROJECTS_KEY, JSON.stringify(projectsData));

    return true;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return false;
  }
}

// ============ Auto-save functionality ============

let autoSaveTimer: NodeJS.Timeout | null = null;

/**
 * Start auto-save timer
 */
export function startAutoSave(
  getState: () => SessionState,
  onSave?: (state: SessionState) => void
): void {
  stopAutoSave();
  
  autoSaveTimer = setInterval(() => {
    const state = getState();
    saveSessionState(state);
    onSave?.(state);
  }, AUTO_SAVE_INTERVAL);
}

/**
 * Stop auto-save timer
 */
export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

/**
 * Check if we have a directory handle (local mode active)
 */
export function hasLocalDirectory(): boolean {
  return directoryHandle !== null;
}

/**
 * Get the current directory name
 */
export function getLocalDirectoryName(): string | null {
  return directoryHandle?.name || null;
}

// ============ File Watcher / Sync functionality ============

let fileWatcherTimer: NodeJS.Timeout | null = null;
const FILE_WATCH_INTERVAL = 2000; // Check for changes every 2 seconds

// Callback for when files change
type FileChangeCallback = (changes: {
  added: string[];
  modified: string[];
  deleted: string[];
  newFiles: Record<string, string>;
}) => void;

let fileChangeCallback: FileChangeCallback | null = null;
let lastKnownFiles: Record<string, string> = {};

/**
 * Re-read all files from the local directory
 * Returns the current state of files
 */
export async function refreshLocalFiles(): Promise<Record<string, string> | null> {
  if (!directoryHandle) return null;

  try {
    const files: Record<string, string> = {};
    fileHandles.clear();
    await readDirectory(directoryHandle, '', files);
    return files;
  } catch (error) {
    console.error('Failed to refresh local files:', error);
    return null;
  }
}

/**
 * Detect file changes between old and new file states
 */
function detectFileChanges(
  oldFiles: Record<string, string>,
  newFiles: Record<string, string>
): { added: string[]; modified: string[]; deleted: string[] } {
  const added: string[] = [];
  const modified: string[] = [];
  const deleted: string[] = [];

  // Check for new and modified files
  for (const [path, content] of Object.entries(newFiles)) {
    if (!(path in oldFiles)) {
      added.push(path);
    } else if (oldFiles[path] !== content) {
      modified.push(path);
    }
  }

  // Check for deleted files
  for (const path of Object.keys(oldFiles)) {
    if (!(path in newFiles)) {
      deleted.push(path);
    }
  }

  return { added, modified, deleted };
}

/**
 * Start watching for file changes in the local directory
 * This periodically re-reads the directory and detects changes
 */
export function startFileWatcher(
  currentFiles: Record<string, string>,
  onFilesChanged: FileChangeCallback
): void {
  stopFileWatcher();
  
  lastKnownFiles = { ...currentFiles };
  fileChangeCallback = onFilesChanged;

  fileWatcherTimer = setInterval(async () => {
    if (!directoryHandle || !fileChangeCallback) return;

    try {
      const newFiles = await refreshLocalFiles();
      if (!newFiles) return;

      const changes = detectFileChanges(lastKnownFiles, newFiles);
      
      // Only notify if there are actual changes
      if (changes.added.length > 0 || changes.modified.length > 0 || changes.deleted.length > 0) {
        console.log('File changes detected:', changes);
        lastKnownFiles = { ...newFiles };
        fileChangeCallback({
          ...changes,
          newFiles
        });
      }
    } catch (error) {
      console.error('File watcher error:', error);
    }
  }, FILE_WATCH_INTERVAL);
}

/**
 * Stop the file watcher
 */
export function stopFileWatcher(): void {
  if (fileWatcherTimer) {
    clearInterval(fileWatcherTimer);
    fileWatcherTimer = null;
  }
  fileChangeCallback = null;
}

/**
 * Update the last known files state (call after IDE changes)
 */
export function updateWatcherState(files: Record<string, string>): void {
  lastKnownFiles = { ...files };
}

/**
 * Sync a single file to local filesystem immediately
 * Call this when a file is created/modified in the IDE
 */
export async function syncFileToLocal(path: string, content: string): Promise<boolean> {
  if (!directoryHandle) return false;
  
  const success = await saveLocalFile(path, content);
  if (success) {
    // Update watcher state so it doesn't trigger a change notification
    lastKnownFiles[path] = content;
  }
  return success;
}

/**
 * Delete a file from local filesystem and update watcher state
 */
export async function syncDeleteFileFromLocal(path: string): Promise<boolean> {
  const success = await deleteLocalFile(path);
  if (success) {
    delete lastKnownFiles[path];
  }
  return success;
}
