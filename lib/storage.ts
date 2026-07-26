import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Staff-level S3 Blob Storage configuration for Railway Object Storage (MinIO / S3).
 * Connects to Railway's S3-compatible service using environment variables.
 */

const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL;
const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

export const bucketName = process.env.S3_BUCKET || process.env.AWS_BUCKET_NAME || 'auminds-uploads';
export const publicBaseUrl = process.env.S3_PUBLIC_URL || (endpoint ? `${endpoint}/${bucketName}` : '');

const isConfigured = Boolean(endpoint && accessKeyId && secretAccessKey);

export const s3Client = isConfigured
  ? new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for Railway MinIO & custom S3 endpoints
    })
  : null;

export interface UploadOptions {
  filename: string;
  buffer: Buffer;
  contentType: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Uploads a file buffer to Railway S3 Blob Store.
 */
export async function uploadToBlobStore(options: UploadOptions): Promise<UploadResult> {
  const { filename, buffer, contentType, folder = 'uploads' } = options;
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${timestamp}-${cleanFilename}`;

  if (!s3Client) {
    console.warn('[BlobStorage] S3 storage client not configured. Returning data URL placeholder.');
    const base64 = buffer.toString('base64');
    return {
      url: `data:${contentType};base64,${base64}`,
      key,
      bucket: bucketName,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const fileUrl = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, '')}/${key}`
    : `${endpoint}/${bucketName}/${key}`;

  return {
    url: fileUrl,
    key,
    bucket: bucketName,
  };
}

/**
 * Deletes an object from Railway S3 Blob Store.
 */
export async function deleteFromBlobStore(key: string): Promise<boolean> {
  if (!s3Client) {
    console.warn('[BlobStorage] S3 storage client not configured.');
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('[BlobStorage] Failed to delete object:', error);
    return false;
  }
}
