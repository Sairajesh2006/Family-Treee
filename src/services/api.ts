import { FamilyTreeData } from '../types';
import { INITIAL_FAMILY_TREE_DATA } from '../data/initialTreeData';

const LOCAL_STORAGE_KEY = 'amrutapu_family_tree_local_cache';
const AUTH_TOKEN_KEY = 'amrutapu_family_auth_token';
const OWNER_EMAIL = 'sairajeshamrutapu@gmail.com';

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  removeToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export async function fetchFamilyTree(): Promise<FamilyTreeData> {
  function mergeCanonical(data: Partial<FamilyTreeData>): FamilyTreeData {
    const existingMembers = Array.isArray(data.members) ? [...data.members] : [];
    const memberIdSet = new Set(existingMembers.map((m) => m.id));

    // Ensure all canonical initial members (including sindhu_father & sindhu_mother) are included
    for (const initMember of INITIAL_FAMILY_TREE_DATA.members) {
      if (!memberIdSet.has(initMember.id)) {
        existingMembers.push(initMember);
        memberIdSet.add(initMember.id);
      }
    }

    const existingRels = Array.isArray(data.relationships) ? [...data.relationships] : [];
    const relIdSet = new Set(existingRels.map((r) => r.id));

    // Ensure all canonical relationships are included
    for (const initRel of INITIAL_FAMILY_TREE_DATA.relationships) {
      if (!relIdSet.has(initRel.id)) {
        existingRels.push(initRel);
        relIdSet.add(initRel.id);
      }
    }

    return {
      title: data.title || INITIAL_FAMILY_TREE_DATA.title,
      creator: data.creator || INITIAL_FAMILY_TREE_DATA.creator,
      subtitle: data.subtitle || INITIAL_FAMILY_TREE_DATA.subtitle,
      version: Math.max(data.version || 1, INITIAL_FAMILY_TREE_DATA.version),
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      members: existingMembers,
      relationships: existingRels,
    };
  }

  try {
    const res = await fetch('/api/tree', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (res.ok) {
      const data: FamilyTreeData = await res.json();
      const merged = mergeCanonical(data);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Backend /api/tree unreachable, checking local cache:', err);
  }

  // Fallback to localStorage cache or default initial data
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const merged = mergeCanonical(parsed);
      return merged;
    } catch {
      // ignore
    }
  }
  return INITIAL_FAMILY_TREE_DATA;
}

export async function saveFamilyTree(data: FamilyTreeData): Promise<{ success: boolean; message: string }> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('You must be logged in as Amrutapu Sai Rajesh to save changes.');
  }

  try {
    const res = await fetch('/api/tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Save failed with status ${res.status}`);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    const result = await res.json();
    return { success: true, message: result.message || 'Family tree updated successfully' };
  } catch (err: any) {
    // If backend offline, save locally
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    throw err;
  }
}

export async function resetFamilyTree(): Promise<FamilyTreeData> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Authentication required to reset diagram');
  }

  const res = await fetch('/api/tree/reset', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Reset failed');
  }

  const result = await res.json();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.data));
  return result.data;
}

export async function uploadMemberPhoto(personId: string, imageBase64: string): Promise<string> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Authentication required to upload photos');
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ personId, imageBase64 }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload photo');
  }

  const result = await res.json();
  return result.photoUrl;
}

export async function deleteMemberPhoto(personId: string): Promise<void> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Authentication required to delete photos');
  }

  const res = await fetch(`/api/upload/${personId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to remove photo');
  }
}

export async function checkSession(): Promise<{ isAuthenticated: boolean; role: 'owner' | 'visitor'; email?: string }> {
  const token = authStorage.getToken();
  if (!token) {
    return { isAuthenticated: false, role: 'visitor' };
  }

  try {
    const res = await fetch('/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isAuthenticated: data.isAuthenticated,
        role: data.role || 'visitor',
        email: data.ownerEmail || OWNER_EMAIL,
      };
    }
  } catch (err) {
    console.warn('Session check failed:', err);
  }

  return { isAuthenticated: false, role: 'visitor' };
}

export async function loginOwner(email: string, passcode: string): Promise<{ token: string; email: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, passcode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid credentials');
  }

  const data = await res.json();
  authStorage.setToken(data.token);
  return { token: data.token, email: data.email };
}

export async function logoutOwner(): Promise<void> {
  const token = authStorage.getToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // ignore
    }
  }
  authStorage.removeToken();
}

export async function updateOwnerPasscode(newPasscode: string): Promise<void> {
  const token = authStorage.getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/auth/update-passcode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPasscode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update passcode');
  }
}

export interface StorageStatusResponse {
  isConfigured: boolean;
  provider: 'supabase' | 'local-disk';
  bucket: string;
  hasServiceRoleKey: boolean;
  urlProvided: boolean;
  instructions?: string;
}

export async function fetchStorageStatus(): Promise<StorageStatusResponse> {
  try {
    const res = await fetch('/api/storage/status', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Storage status check failed:', err);
  }
  return {
    isConfigured: false,
    provider: 'local-disk',
    bucket: 'family-photos',
    hasServiceRoleKey: false,
    urlProvided: false,
  };
}

