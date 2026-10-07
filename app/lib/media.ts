import { r2GetUrl } from "./r2";

/** Resolve a company logo to a viewable URL (presigned R2) or null. */
export async function logoUrl(logoKey: string | null): Promise<string | null> {
  if (!logoKey) return null;
  try {
    return await r2GetUrl(logoKey, 3600);
  } catch {
    return null;
  }
}

/** Resolve a user photo: uploaded R2 key first, else external image URL. */
export async function avatarUrl(input: {
  avatarKey: string | null;
  image: string | null;
}): Promise<string | null> {
  if (input.avatarKey) {
    try {
      return await r2GetUrl(input.avatarKey, 3600);
    } catch {
      /* fall through to image URL */
    }
  }
  return input.image;
}
