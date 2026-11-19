import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export interface StorageUploadResult {
  url: string;
  key: string;
  storageType: 'local' | 'r2';
  sizeBytes?: number;
}

class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string = '';
  private publicUrlBase: string = '';
  private useR2: boolean = false;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME || 'cricmotion-user-data';
    const publicUrl = process.env.R2_PUBLIC_URL || '';

    if (endpoint && accessKeyId && secretAccessKey) {
      try {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
        this.bucketName = bucket;
        this.publicUrlBase = publicUrl.replace(/\/$/, '');
        this.useR2 = true;
        console.log('☁️ StorageService initialized with Cloudflare R2 / S3 client.');
      } catch (err: any) {
        console.warn('⚠️ Failed to initialize R2 client, defaulting to local disk:', err.message);
        this.useR2 = false;
      }
    } else {
      console.log('📁 StorageService: Using local disk storage (/uploads).');
    }
  }

  /**
   * Generates a multi-tenant isolated object key path: /{tenant_userId}/projects/{projectId}/{filename}
   */
  public generateTenantKey(tenantUserId: string, projectId: string, filename: string): string {
    const cleanFilename = path.basename(filename);
    return `${tenantUserId}/projects/${projectId}/${Date.now()}_${cleanFilename}`;
  }

  /**
   * Upload a local file to storage (Cloudflare R2 if configured, or local static uploads)
   */
  public async uploadFile(
    localFilePath: string,
    tenantUserId: string,
    projectId: string,
    contentType: string = 'video/mp4'
  ): Promise<StorageUploadResult> {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found at path: ${localFilePath}`);
    }

    const filename = path.basename(localFilePath);
    const key = this.generateTenantKey(tenantUserId, projectId, filename);
    const fileStats = fs.statSync(localFilePath);

    if (this.useR2 && this.s3Client) {
      try {
        const fileStream = fs.createReadStream(localFilePath);
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
          })
        );

        const r2Url = this.publicUrlBase ? `${this.publicUrlBase}/${key}` : `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
        console.log(`☁️ Uploaded ${filename} to Cloudflare R2: ${r2Url}`);
        return {
          url: r2Url,
          key,
          storageType: 'r2',
          sizeBytes: fileStats.size,
        };
      } catch (err: any) {
        console.warn('⚠️ R2 upload failed, falling back to local storage URL:', err.message);
      }
    }

    // Local Storage Serving: Relative URL mapped to public /uploads directory
    const uploadsDir = path.resolve(__dirname, '../../public/uploads');
    let relativeUrl = `/uploads/${filename}`;

    // If file is inside a subfolder like /uploads/videos/
    if (localFilePath.includes('uploads')) {
      const parts = localFilePath.split(/uploads[/\\]/);
      if (parts.length > 1) {
        relativeUrl = `/uploads/${parts[1].replace(/\\/g, '/')}`;
      }
    }

    return {
      url: relativeUrl,
      key,
      storageType: 'local',
      sizeBytes: fileStats.size,
    };
  }
}

export const storageService = new StorageService();
