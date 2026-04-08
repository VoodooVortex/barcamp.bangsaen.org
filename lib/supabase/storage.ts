import { createClient } from "@supabase/supabase-js";

const BUCKET = "event-photos";

// Service role client — server-side only, never expose to browser
function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return createClient(url, serviceKey, {
        auth: { persistSession: false },
    });
}

export async function uploadEventPhoto(
    slug: string,
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<{ imageUrl: string; storagePath: string }> {
    const client = getServiceClient();
    const ext = fileName.split(".").pop() ?? "jpg";
    const storagePath = `${slug}/${crypto.randomUUID()}.${ext}`;

    const { error } = await client.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType, upsert: false });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath);
    return { imageUrl: data.publicUrl, storagePath };
}

export async function deleteEventPhoto(storagePath: string): Promise<void> {
    const client = getServiceClient();
    const { error } = await client.storage
        .from(BUCKET)
        .remove([storagePath]);
    if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
