import { createClient } from "@/lib/supabase/client";

const BUCKET = "journal-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Uploads an image File to Supabase Storage under the current user's folder
 * and returns its public URL. Throws with a friendly message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be attached.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 8 MB).");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload images.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });

  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "Image storage isn't set up yet. Run the latest schema.sql in Supabase."
        : error.message,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
