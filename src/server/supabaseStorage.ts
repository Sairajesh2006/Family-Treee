import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
// Prioritize SUPABASE_SERVICE_ROLE_KEY for administrative uploads on the server side (never exposed to browser),
// or fallback to SUPABASE_ANON_KEY if service role key is not provided.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'family-photos';

export interface StorageStatus {
  isConfigured: boolean;
  provider: 'supabase' | 'local-disk';
  bucket: string;
  hasServiceRoleKey: boolean;
  urlProvided: boolean;
  instructions?: string;
}

export function getStorageStatus(): StorageStatus {
  const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
  return {
    isConfigured,
    provider: isConfigured ? 'supabase' : 'local-disk',
    bucket: SUPABASE_BUCKET,
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    urlProvided: Boolean(SUPABASE_URL),
    instructions: isConfigured
      ? 'Supabase Storage is configured for persistent online storage.'
      : 'Currently running in local-disk mode. For Vercel deployment, configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
}

/**
 * Uploads an image Buffer directly to Supabase Storage.
 * Returns the permanent public CDN URL.
 */
export async function uploadToSupabaseStorage(
  personId: string,
  buffer: Buffer,
  mimeType: string,
  ext: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const filename = `${personId}_${Date.now()}.${ext}`;
  const filePath = `members/${filename}`;

  const { data: _data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Retrieve public URL from Supabase CDN
  const { data: publicData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  if (!publicData || !publicData.publicUrl) {
    throw new Error('Failed to retrieve public URL from Supabase Storage.');
  }

  return publicData.publicUrl;
}

/**
 * Deletes a photo from Supabase Storage if it exists.
 */
export async function deleteFromSupabaseStorage(photoUrl: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !photoUrl) return false;

  try {
    // Check if the URL points to our Supabase bucket
    if (photoUrl.includes(SUPABASE_BUCKET)) {
      const parts = photoUrl.split(`${SUPABASE_BUCKET}/`);
      if (parts.length > 1) {
        const filePath = parts[1].split('?')[0];
        const { error } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([filePath]);
        if (error) {
          console.warn('Could not remove file from Supabase bucket:', error.message);
          return false;
        }
        return true;
      }
    }
  } catch (err) {
    console.warn('Error during Supabase file deletion:', err);
  }
  return false;
}

/**
 * Persists the entire family tree data state into Supabase Storage.
 */
export async function saveTreeToSupabase(treeData: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const jsonString = JSON.stringify(treeData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload('state/tree-data.json', buffer, {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) {
      console.warn('Could not persist tree-data.json to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('saveTreeToSupabase error:', err);
    return false;
  }
}

/**
 * Fetches the persisted family tree data state from Supabase Storage.
 */
export async function loadTreeFromSupabase(): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download('state/tree-data.json');

    if (error || !data) {
      return null;
    }

    const text = await data.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn('loadTreeFromSupabase error:', err);
    return null;
  }
}
