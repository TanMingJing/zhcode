import { Client, Databases, Query } from 'appwrite';

// 获取环境变量
const getEnv = (key: string, defaultValue: string) => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

const client = new Client()
  .setEndpoint(getEnv('VITE_APPWRITE_ENDPOINT', 'https://sgp.cloud.appwrite.io/v1'))
  .setProject(getEnv('VITE_APPWRITE_PROJECT_ID', 'default'));

const databases = new Databases(client);

const DATABASE_ID = getEnv('VITE_APPWRITE_DATABASE_ID', 'zhcode_db');
const COLLECTION_ID = getEnv('VITE_APPWRITE_COLLECTION_ID', 'ai_operations');
const PROJECT_COLLECTION_ID = 'zhcode_projects';

export interface AIOperation {
  $id?: string;
  userId: string;
  actionType: 'generate' | 'explain-code' | 'explain-error' | 'suggest-refactor';
  input: string;
  output: string;
  language: 'zh' | 'en';
  framework: string;
  status: 'success' | 'error';
  errorMessage?: string;
  timestamp: string;
  code?: string;
  fileId?: string;
}

export interface ZhCodeProject {
  $id?: string;
  userId: string;
  projectName: string;
  description?: string;
  files: Record<string, string>;
  mainFile: string;
  language: 'zh' | 'en';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

/**
 * 记录 AI 操作到 Appwrite
 */
export async function logAIOperation(operation: Omit<AIOperation, '$id' | 'timestamp'>): Promise<AIOperation | null> {
  try {
    const apiKey = localStorage.getItem('zhcode_api_key');
    if (!apiKey) {
      console.warn('No API key found, skipping Appwrite logging');
      return null;
    }

    const operationData = {
      ...operation,
      timestamp: new Date().toISOString(),
    };

    // Generate a unique ID based on timestamp
    const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      docId,
      operationData
    );

    return response as unknown as AIOperation;
  } catch (error) {
    console.error('Failed to log AI operation to Appwrite:', error);
    // Gracefully fail - don't break the app if Appwrite is unavailable
    return null;
  }
}

/**
 * 获取 AI 操作历史
 */
export async function getAIOperationHistory(userId: string, limit: number = 50): Promise<AIOperation[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('timestamp'),
        Query.limit(limit),
      ]
    );

    return response.documents as unknown as AIOperation[];
  } catch (error) {
    console.error('Failed to fetch AI operation history:', error);
    return [];
  }
}

/**
 * 获取特定操作类型的历史
 */
export async function getOperationsByType(userId: string, actionType: AIOperation['actionType']): Promise<AIOperation[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('actionType', actionType),
        Query.orderDesc('timestamp'),
      ]
    );

    return response.documents as unknown as AIOperation[];
  } catch (error) {
    console.error('Failed to fetch operations by type:', error);
    return [];
  }
}

/**
 * 删除操作记录
 */
export async function deleteAIOperation(operationId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, operationId);
    return true;
  } catch (error) {
    console.error('Failed to delete AI operation:', error);
    return false;
  }
}

/**
 * 获取统计信息
 */
export async function getOperationStats(userId: string): Promise<Record<string, number>> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('userId', userId)]
    );

    const stats: Record<string, number> = {
      total: response.total,
      generate: 0,
      'explain-code': 0,
      'explain-error': 0,
      'suggest-refactor': 0,
      success: 0,
      error: 0,
    };

    response.documents.forEach((doc: unknown) => {
      const operation = doc as AIOperation;
      if (operation.actionType) {
        stats[operation.actionType] = (stats[operation.actionType] || 0) + 1;
      }
      if (operation.status === 'success') {
        stats.success += 1;
      } else if (operation.status === 'error') {
        stats.error += 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Failed to get operation stats:', error);
    return { total: 0 };
  }
}

/**
 * 保存项目到云端
 */
export async function saveProjectToCloud(project: Omit<ZhCodeProject, '$id' | 'createdAt' | 'updatedAt'>): Promise<ZhCodeProject | null> {
  try {
    const now = new Date().toISOString();
    const projectData = {
      ...project,
      createdAt: now,
      updatedAt: now,
    };

    const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await databases.createDocument(
      DATABASE_ID,
      PROJECT_COLLECTION_ID,
      docId,
      projectData
    );

    return response as unknown as ZhCodeProject;
  } catch (error) {
    console.error('Failed to save project to cloud:', error);
    return null;
  }
}

/**
 * 更新云端项目
 */
export async function updateProjectInCloud(projectId: string, updates: Partial<ZhCodeProject>): Promise<ZhCodeProject | null> {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      PROJECT_COLLECTION_ID,
      projectId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return response as unknown as ZhCodeProject;
  } catch (error) {
    console.error('Failed to update project in cloud:', error);
    return null;
  }
}

/**
 * 获取用户的所有项目
 */
export async function getUserProjects(userId: string): Promise<ZhCodeProject[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PROJECT_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('updatedAt'),
      ]
    );

    return response.documents as unknown as ZhCodeProject[];
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    return [];
  }
}

/**
 * 获取单个项目
 */
export async function getProject(projectId: string): Promise<ZhCodeProject | null> {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      PROJECT_COLLECTION_ID,
      projectId
    );

    return response as unknown as ZhCodeProject;
  } catch (error) {
    console.error('Failed to get project:', error);
    return null;
  }
}

/**
 * 删除项目
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(DATABASE_ID, PROJECT_COLLECTION_ID, projectId);
    return true;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return false;
  }
}
