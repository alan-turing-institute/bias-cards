interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  parents?: string[];
}

interface SaveOptions {
  fileName: string;
  content: string;
  folderId?: string;
  mimeType?: string;
}

interface LoadOptions {
  fileId?: string;
  fileName?: string;
  folderId?: string;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private accessToken: string | null = null;
  private readonly APP_FOLDER_NAME = 'BiasCards';
  private readonly BASE_URL = 'https://www.googleapis.com/drive/v3';
  private readonly UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please login first.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API error: ${error}`);
    }

    return response;
  }

  async getOrCreateAppFolder(): Promise<string> {
    // Search for existing app folder
    const searchResponse = await this.makeRequest(
      `${this.BASE_URL}/files?q=name='${this.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`
    );
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create new folder if it doesn't exist
    const createResponse = await this.makeRequest(`${this.BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const newFolder = await createResponse.json();
    return newFolder.id;
  }

  async saveFile({
    fileName,
    content,
    folderId,
    mimeType = 'application/json',
  }: SaveOptions): Promise<string> {
    // Get or create app folder if no folder ID provided
    const parentFolderId = folderId || (await this.getOrCreateAppFolder());

    // Check if file already exists
    const searchResponse = await this.makeRequest(
      `${this.BASE_URL}/files?q=name='${fileName}' and '${parentFolderId}' in parents and trashed=false&fields=files(id)`
    );
    const searchData = await searchResponse.json();

    const metadata = {
      name: fileName,
      parents: [parentFolderId],
      mimeType,
    };

    const boundary = '-------BiasCardsDataBoundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let multipartRequestBody = '';

    if (searchData.files && searchData.files.length > 0) {
      // Update existing file
      const fileId = searchData.files[0].id;

      multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify({ name: fileName, mimeType }) +
        delimiter +
        `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
        content +
        closeDelimiter;

      const updateResponse = await this.makeRequest(
        `${this.UPLOAD_URL}/files/${fileId}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body: multipartRequestBody,
        }
      );

      const updatedFile = await updateResponse.json();
      return updatedFile.id;
    }
    // Create new file
    multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelimiter;

    const createResponse = await this.makeRequest(
      `${this.UPLOAD_URL}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartRequestBody,
      }
    );

    const newFile = await createResponse.json();
    return newFile.id;
  }

  async loadFile({ fileId, fileName, folderId }: LoadOptions): Promise<string> {
    let targetFileId = fileId;

    if (!targetFileId && fileName) {
      // Search for file by name
      const parentFolderId = folderId || (await this.getOrCreateAppFolder());
      const searchResponse = await this.makeRequest(
        `${this.BASE_URL}/files?q=name='${fileName}' and '${parentFolderId}' in parents and trashed=false&fields=files(id)`
      );
      const searchData = await searchResponse.json();

      if (!searchData.files || searchData.files.length === 0) {
        throw new Error(`File '${fileName}' not found in Google Drive`);
      }

      targetFileId = searchData.files[0].id;
    }

    if (!targetFileId) {
      throw new Error('No file ID or file name provided');
    }

    // Download file content
    const contentResponse = await this.makeRequest(
      `${this.BASE_URL}/files/${targetFileId}?alt=media`
    );

    return await contentResponse.text();
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    const parentFolderId = folderId || (await this.getOrCreateAppFolder());

    const response = await this.makeRequest(
      `${this.BASE_URL}/files?q='${parentFolderId}' in parents and trashed=false&fields=files(id,name,mimeType,modifiedTime,size)`
    );

    const data = await response.json();
    return data.files || [];
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.makeRequest(`${this.BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async createFolder(folderName: string, parentId?: string): Promise<string> {
    const parentFolderId = parentId || (await this.getOrCreateAppFolder());

    const response = await this.makeRequest(`${this.BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });

    const folder = await response.json();
    return folder.id;
  }
}

// Export singleton instance
export const googleDriveService = GoogleDriveService.getInstance();
