import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  saveTreeToSupabase,
  loadTreeFromSupabase,
  getStorageStatus,
} from './src/server/supabaseStorage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const TREE_DATA_FILE = path.join(DATA_DIR, 'tree-data.json');
const AUTH_CONFIG_FILE = path.join(DATA_DIR, 'auth-config.json');

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default tree data
const DEFAULT_TREE_DATA = {
  title: 'Amrutapu Family',
  creator: 'Created by Amrutapu Sai Rajesh',
  subtitle: 'Handcrafted Heritage & Lineage Record',
  version: 3,
  lastUpdated: new Date().toISOString(),
  members: [
    {
      id: 'paternal_grandfather',
      name: 'Narasayya',
      relationToMe: 'Paternal Grandfather',
      labelOverride: 'Paternal Grandfather',
      gender: 'male',
      generation: 1,
      x: 480,
      y: 70,
      width: 230,
      height: 140,
      notes: 'Paternal Grandfather (Father’s Father) Narasayya',
    },
    {
      id: 'paternal_grandmother',
      name: 'Koteswaramma',
      relationToMe: 'Paternal Grandmother',
      labelOverride: 'Paternal Grandmother',
      gender: 'female',
      generation: 1,
      x: 740,
      y: 70,
      width: 230,
      height: 140,
      notes: 'Paternal Grandmother (Father’s Mother) Koteswaramma',
    },
    {
      id: 'maternal_grandfather',
      name: 'Sitaramayya',
      relationToMe: 'Maternal Grandfather',
      labelOverride: 'Maternal Grandfather',
      gender: 'male',
      generation: 1,
      x: 1060,
      y: 70,
      width: 230,
      height: 140,
      notes: 'Maternal Grandfather (Mother’s Father) Sitaramayya',
    },
    {
      id: 'maternal_grandmother',
      name: 'Venkayamma',
      relationToMe: 'Maternal Grandmother',
      labelOverride: 'Maternal Grandmother',
      gender: 'female',
      generation: 1,
      x: 1320,
      y: 70,
      width: 230,
      height: 140,
      notes: 'Maternal Grandmother (Mother’s Mother) Venkayamma',
    },
    {
      id: 'father',
      name: 'Srinivasa Rao',
      relationToMe: 'Father',
      labelOverride: 'Father',
      gender: 'male',
      generation: 2,
      x: 610,
      y: 300,
      width: 230,
      height: 140,
      notes: 'Father of Amrutapu Sai Rajesh & Aswini Priya',
    },
    {
      id: 'mother',
      name: 'Pushpa Latha',
      relationToMe: 'Mother',
      labelOverride: 'Mother',
      gender: 'female',
      generation: 2,
      x: 1190,
      y: 300,
      width: 230,
      height: 140,
      notes: 'Mother of Amrutapu Sai Rajesh & Aswini Priya',
    },
    {
      id: 'sindhu_father',
      name: 'Madhu Sudhan',
      relationToMe: 'Father of Sindhu Triveni',
      labelOverride: 'Father of Sindhu Triveni',
      gender: 'male',
      generation: 2,
      x: 1450,
      y: 300,
      width: 230,
      height: 140,
      notes: 'Father of Sindhu Triveni & Vamsi',
    },
    {
      id: 'sindhu_mother',
      name: 'Venkata Lakshmi',
      relationToMe: 'Mother of Sindhu Triveni',
      labelOverride: 'Mother of Sindhu Triveni',
      gender: 'female',
      generation: 2,
      x: 1720,
      y: 300,
      width: 230,
      height: 140,
      notes: 'Mother of Sindhu Triveni & Vamsi',
    },
    {
      id: 'pradeep',
      name: 'Pradeep',
      relationToMe: 'Brother-in-law',
      labelOverride: 'Brother-in-law (Sister’s Husband)',
      gender: 'male',
      generation: 3,
      x: 150,
      y: 560,
      width: 230,
      height: 140,
      notes: 'Husband of Aswini Priya, Father of Darshika',
    },
    {
      id: 'aswini_priya',
      name: 'Aswini Priya',
      relationToMe: 'Sister',
      labelOverride: 'Sister',
      gender: 'female',
      generation: 3,
      x: 430,
      y: 560,
      width: 230,
      height: 140,
      notes: 'Sister of Amrutapu Sai Rajesh, Mother of Darshika',
    },
    {
      id: 'rajesh',
      name: 'Amrutapu Sai Rajesh',
      relationToMe: 'Me (Central Person)',
      labelOverride: 'Me — Central Person',
      gender: 'male',
      generation: 3,
      x: 850,
      y: 560,
      width: 250,
      height: 150,
      notes: 'Creator and central focus of the Amrutapu family tree',
    },
    {
      id: 'sindhu_triveni',
      name: 'Sindhu Triveni',
      relationToMe: 'Future Wife — Sindhu Triveni',
      labelOverride: 'Future Wife — Sindhu Triveni',
      gender: 'female',
      generation: 3,
      isPlaceholder: true,
      x: 1250,
      y: 560,
      width: 240,
      height: 140,
      notes: 'Future-wife placeholder (not a current spouse)',
    },
    {
      id: 'vamsi',
      name: 'Vamsi',
      relationToMe: 'Brother-in-law',
      labelOverride: 'Brother-in-law (Vamsi)',
      gender: 'male',
      generation: 3,
      x: 1550,
      y: 560,
      width: 230,
      height: 140,
      notes: 'Brother of Sindhu Triveni / Brother-in-law',
    },
    {
      id: 'darshika',
      name: 'Darshika',
      relationToMe: 'Niece',
      labelOverride: 'Niece (Sister’s Daughter)',
      gender: 'female',
      generation: 4,
      x: 290,
      y: 820,
      width: 230,
      height: 140,
      notes: 'Daughter of Pradeep & Aswini Priya, Niece of Sai Rajesh',
    },
  ],
  relationships: [
    {
      id: 'rel_paternal_grandparents',
      type: 'spouse',
      fromId: 'paternal_grandfather',
      toId: 'paternal_grandmother',
      symbol: '<=>',
      label: 'Husband & Wife',
    },
    {
      id: 'rel_paternal_to_father',
      type: 'parent-child',
      fromId: 'paternal_grandfather',
      toId: 'father',
      symbol: '->',
      label: 'Son',
    },
    {
      id: 'rel_maternal_grandparents',
      type: 'spouse',
      fromId: 'maternal_grandfather',
      toId: 'maternal_grandmother',
      symbol: '<=>',
      label: 'Husband & Wife',
    },
    {
      id: 'rel_maternal_to_mother',
      type: 'parent-child',
      fromId: 'maternal_grandmother',
      toId: 'mother',
      symbol: '->',
      label: 'Daughter',
    },
    {
      id: 'rel_parents',
      type: 'spouse',
      fromId: 'father',
      toId: 'mother',
      symbol: '<=>',
      label: 'Husband & Wife',
    },
    {
      id: 'rel_parents_to_rajesh',
      type: 'parent-child',
      fromId: 'father',
      toId: 'rajesh',
      symbol: '->',
      label: 'Son',
    },
    {
      id: 'rel_parents_to_aswini',
      type: 'parent-child',
      fromId: 'father',
      toId: 'aswini_priya',
      symbol: '->',
      label: 'Daughter',
    },
    {
      id: 'rel_sibling_aswini_rajesh',
      type: 'sibling',
      fromId: 'aswini_priya',
      toId: 'rajesh',
      symbol: '<->',
      label: 'Siblings',
    },
    {
      id: 'rel_sister_marriage',
      type: 'spouse',
      fromId: 'pradeep',
      toId: 'aswini_priya',
      symbol: '<=>',
      label: 'Husband & Wife',
    },
    {
      id: 'rel_aswini_pradeep_to_darshika',
      type: 'parent-child',
      fromId: 'aswini_priya',
      toId: 'darshika',
      symbol: '->',
      label: 'Daughter',
    },
    {
      id: 'rel_future_wife',
      type: 'future-spouse',
      fromId: 'rajesh',
      toId: 'sindhu_triveni',
      symbol: '<...>',
      label: 'Future Wife Placeholder',
      dashed: true,
    },
    {
      id: 'rel_sindhu_vamsi_sibling',
      type: 'sibling',
      fromId: 'sindhu_triveni',
      toId: 'vamsi',
      symbol: '<->',
      label: 'Siblings',
    },
    {
      id: 'rel_sindhu_parents',
      type: 'spouse',
      fromId: 'sindhu_father',
      toId: 'sindhu_mother',
      symbol: '<=>',
      label: 'Husband & Wife',
    },
    {
      id: 'rel_sindhu_parents_to_sindhu',
      type: 'parent-child',
      fromId: 'sindhu_father',
      toId: 'sindhu_triveni',
      symbol: '->',
      label: 'Daughter',
    },
  ],
};

// Initialize file if missing
if (!fs.existsSync(TREE_DATA_FILE)) {
  fs.writeFileSync(TREE_DATA_FILE, JSON.stringify(DEFAULT_TREE_DATA, null, 2), 'utf-8');
}

// Authentication & Owner Config
const OWNER_EMAIL = 'sairajeshamrutapu@gmail.com';
const DEFAULT_PASSCODE = 'Rajesh@Family2026';

interface AuthConfig {
  ownerEmail: string;
  passcodeHash: string;
  passcodeSalt: string;
  activeSessions: Record<string, { email: string; createdAt: number }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function getAuthConfig(): AuthConfig {
  if (!fs.existsSync(AUTH_CONFIG_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(DEFAULT_PASSCODE, salt);
    const initialConfig: AuthConfig = {
      ownerEmail: OWNER_EMAIL,
      passcodeHash: hash,
      passcodeSalt: salt,
      activeSessions: {},
    };
    fs.writeFileSync(AUTH_CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf-8');
    return initialConfig;
  }
  try {
    const raw = fs.readFileSync(AUTH_CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(DEFAULT_PASSCODE, salt);
    const fallbackConfig: AuthConfig = {
      ownerEmail: OWNER_EMAIL,
      passcodeHash: hash,
      passcodeSalt: salt,
      activeSessions: {},
    };
    return fallbackConfig;
  }
}

function saveAuthConfig(config: AuthConfig) {
  fs.writeFileSync(AUTH_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

function verifyAuthToken(token?: string): boolean {
  if (!token) return false;
  const config = getAuthConfig();
  const session = config.activeSessions[token];
  if (!session) return false;
  // Session expires in 30 days
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > THIRTY_DAYS) {
    delete config.activeSessions[token];
    saveAuthConfig(config);
    return false;
  }
  return session.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

// Effective Tree Data Helpers (Supabase Storage Cloud + Local Disk Fallback)
async function getEffectiveTreeData() {
  // 1. Try Supabase Storage first if configured
  const supabaseData = await loadTreeFromSupabase();
  let data = supabaseData;

  // 2. Fallback to local disk file if Supabase not configured or file not yet in bucket
  if (!data && fs.existsSync(TREE_DATA_FILE)) {
    try {
      const raw = fs.readFileSync(TREE_DATA_FILE, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading local tree file:', e);
    }
  }

  // 3. Fallback to DEFAULT_TREE_DATA
  if (!data) {
    data = JSON.parse(JSON.stringify(DEFAULT_TREE_DATA));
  }

  // Ensure all canonical default members (14 members) are present and deduplicated
  let changed = false;
  if (!Array.isArray(data.members)) {
    data.members = [...DEFAULT_TREE_DATA.members];
    changed = true;
  } else {
    for (const defMember of DEFAULT_TREE_DATA.members) {
      if (!data.members.some((m: any) => m.id === defMember.id)) {
        data.members.push(defMember);
        changed = true;
      }
    }
  }

  // Ensure all canonical default relationships are present and deduplicated
  if (!Array.isArray(data.relationships)) {
    data.relationships = [...DEFAULT_TREE_DATA.relationships];
    changed = true;
  } else {
    for (const defRel of DEFAULT_TREE_DATA.relationships) {
      if (!data.relationships.some((r: any) => r.id === defRel.id)) {
        data.relationships.push(defRel);
        changed = true;
      }
    }
  }

  if (changed) {
    data.version = Math.max(data.version || 1, 3);
    await persistTreeData(data);
  }

  return data;
}

async function persistTreeData(data: any) {
  data.lastUpdated = new Date().toISOString();

  // 1. Persist to Supabase Storage if configured
  await saveTreeToSupabase(data);

  // 2. Persist to local disk if directory exists & writable
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(TREE_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Could not write to local file (expected in read-only serverless environment):', err);
  }
}

// Instantiate Express App
const app = express();

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads (for local development fallback)
app.use('/uploads', express.static(UPLOADS_DIR));

// --- API Routes ---

// Storage Status & Diagnostic Endpoint
app.get('/api/storage/status', (_req, res) => {
  return res.json(getStorageStatus());
});

// Public Tree Data GET
app.get('/api/tree', async (_req, res) => {
  try {
    const data = await getEffectiveTreeData();
    return res.json(data);
  } catch (err) {
    console.error('Error reading tree data:', err);
    return res.status(500).json({ error: 'Failed to read family tree data' });
  }
});

// Owner Tree Data UPDATE (Protected)
app.post('/api/tree', async (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (!verifyAuthToken(token)) {
    return res.status(403).json({ error: 'Unauthorized: Owner privileges required to modify tree data' });
  }

  try {
    const updatedData = req.body;
    if (!updatedData || !Array.isArray(updatedData.members)) {
      return res.status(400).json({ error: 'Invalid tree data structure' });
    }

    await persistTreeData(updatedData);
    return res.json({ success: true, message: 'Family tree saved successfully', data: updatedData });
  } catch (err) {
    console.error('Error updating tree data:', err);
    return res.status(500).json({ error: 'Failed to save family tree' });
  }
});

// Reset Tree Data to Original Layout (Protected)
app.post('/api/tree/reset', async (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (!verifyAuthToken(token)) {
    return res.status(403).json({ error: 'Unauthorized: Owner privileges required to reset tree data' });
  }

  try {
    const resetData = JSON.parse(JSON.stringify(DEFAULT_TREE_DATA));
    await persistTreeData(resetData);
    return res.json({ success: true, message: 'Family tree reset to original diagram', data: resetData });
  } catch (err) {
    console.error('Error resetting tree data:', err);
    return res.status(500).json({ error: 'Failed to reset family tree' });
  }
});

// Photo Upload Endpoint (Protected - Saves to Supabase Storage in production or disk locally)
app.post('/api/upload', async (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (!verifyAuthToken(token)) {
    return res.status(403).json({ error: 'Unauthorized: Owner privileges required to upload photos' });
  }

  try {
    const { personId, imageBase64 } = req.body;
    if (!personId || !imageBase64) {
      return res.status(400).json({ error: 'Missing personId or image data' });
    }

    // Extract base64 payload & extension / mime
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'jpg';
    let mimeType = 'image/jpeg';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const storageStatus = getStorageStatus();
    let publicUrl: string;

    if (storageStatus.isConfigured) {
      // 1. Upload to Supabase Cloud Storage (Permanent CDN URL for Vercel)
      publicUrl = await uploadToSupabaseStorage(personId, buffer, mimeType, ext);
    } else {
      // 2. Fallback to Local Disk Storage (for local dev)
      const filename = `${personId}_${Date.now()}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      publicUrl = `/uploads/${filename}`;
    }

    // Update the member's photoUrl in tree data and persist
    const treeData = await getEffectiveTreeData();
    const member = treeData.members?.find((m: any) => m.id === personId);
    if (member) {
      member.photoUrl = publicUrl;
      await persistTreeData(treeData);
    }

    return res.json({
      success: true,
      photoUrl: publicUrl,
      provider: storageStatus.provider,
      message: storageStatus.isConfigured
        ? 'Photo uploaded to Supabase Storage and saved to database!'
        : 'Photo saved locally. Configure Supabase Storage environment variables for Vercel deployment.',
    });
  } catch (err: any) {
    console.error('Error saving uploaded photo:', err);
    return res.status(500).json({ error: err.message || 'Failed to save photo' });
  }
});

// Photo Delete Endpoint (Protected)
app.delete('/api/upload/:personId', async (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (!verifyAuthToken(token)) {
    return res.status(403).json({ error: 'Unauthorized: Owner privileges required to delete photos' });
  }

  try {
    const personId = req.params.personId;
    const treeData = await getEffectiveTreeData();
    const member = treeData.members?.find((m: any) => m.id === personId);

    if (member) {
      if (member.photoUrl) {
        // Attempt cloud deletion if it was hosted on Supabase
        await deleteFromSupabaseStorage(member.photoUrl);
      }
      member.photoUrl = undefined;
      await persistTreeData(treeData);
    }

    return res.json({ success: true, message: 'Photo removed successfully' });
  } catch (err: any) {
    console.error('Error removing photo:', err);
    return res.status(500).json({ error: err.message || 'Failed to remove photo' });
  }
});

// Auth: Check Session
app.get('/api/auth/session', (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  const isValid = verifyAuthToken(token);
  return res.json({
    isAuthenticated: isValid,
    role: isValid ? 'owner' : 'visitor',
    ownerEmail: OWNER_EMAIL,
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, passcode } = req.body;
  if (!email || !passcode) {
    return res.status(400).json({ error: 'Email and passcode are required' });
  }

  if (email.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid owner email address' });
  }

  const config = getAuthConfig();
  const hash = hashPassword(passcode, config.passcodeSalt);

  // Also accept default passcode if configured
  const isMatch = hash === config.passcodeHash || passcode === DEFAULT_PASSCODE;

  if (!isMatch) {
    return res.status(401).json({ error: 'Incorrect owner passcode' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  config.activeSessions[token] = {
    email: OWNER_EMAIL,
    createdAt: Date.now(),
  };
  saveAuthConfig(config);

  return res.json({
    success: true,
    token,
    email: OWNER_EMAIL,
    role: 'owner',
    message: 'Welcome back, Amrutapu Sai Rajesh!',
  });
});

// Auth: Update Passcode (Protected)
app.post('/api/auth/update-passcode', (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (!verifyAuthToken(token)) {
    return res.status(403).json({ error: 'Unauthorized: Owner session required to change passcode' });
  }

  const { newPasscode } = req.body;
  if (!newPasscode || newPasscode.length < 6) {
    return res.status(400).json({ error: 'New passcode must be at least 6 characters' });
  }

  const config = getAuthConfig();
  const newSalt = crypto.randomBytes(16).toString('hex');
  config.passcodeSalt = newSalt;
  config.passcodeHash = hashPassword(newPasscode, newSalt);
  saveAuthConfig(config);

  return res.json({ success: true, message: 'Passcode successfully updated' });
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || (req.headers['x-auth-token'] as string);
  if (token) {
    const config = getAuthConfig();
    delete config.activeSessions[token];
    saveAuthConfig(config);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Export Express app for Vercel Serverless Function
export default app;

// In standalone / container runtime, mount Vite or static dist and listen on PORT
async function startStandaloneServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Amrutapu Family Server running on port ${PORT}`);
    const status = getStorageStatus();
    console.log(`Storage engine: ${status.provider.toUpperCase()} (${status.isConfigured ? 'Connected' : 'Local Fallback'})`);
  });
}

if (process.env.VERCEL !== '1') {
  startStandaloneServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
