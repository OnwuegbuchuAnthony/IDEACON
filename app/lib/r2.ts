import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID ?? "";
const bucket = process.env.R2_BUCKET ?? "ideacon-private";

export const r2 =
  accountId !== ""
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        },
      })
    : null;

/** Short-lived download link. Full-detail files are NEVER public. */
export async function r2GetUrl(key: string, ttlSeconds = 300): Promise<string> {
  if (!r2) throw new Error("R2 is not configured (R2_ACCOUNT_ID missing)");
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: ttlSeconds,
  });
}

/** Short-lived upload link for direct browser → R2 uploads. */
export async function r2PutUrl(
  key: string,
  contentType: string,
  ttlSeconds = 300,
): Promise<string> {
  if (!r2) throw new Error("R2 is not configured (R2_ACCOUNT_ID missing)");
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: ttlSeconds },
  );
}
