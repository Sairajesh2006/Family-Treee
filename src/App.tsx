/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchFamilyTree,
  saveFamilyTree,
  resetFamilyTree,
  uploadMemberPhoto,
  deleteMemberPhoto,
  checkSession,
  logoutOwner,
  fetchStorageStatus,
  StorageStatusResponse,
} from './services/api';
import { FamilyTreeData, PersonNode, AuthSession } from './types';
import { INITIAL_FAMILY_TREE_DATA } from './data/initialTreeData';
import { Header } from './components/Header';
import { FamilyCanvas } from './components/FamilyCanvas';
import { EditMemberModal } from './components/EditMemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { AuthModal } from './components/AuthModal';
import { LegendModal } from './components/LegendModal';
import { DirectoryModal } from './components/DirectoryModal';
import { StorageStatusModal } from './components/StorageStatusModal';
import { Check, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [treeData, setTreeData] = useState<FamilyTreeData>(INITIAL_FAMILY_TREE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatusResponse | null>(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Authentication State
  const [authSession, setAuthSession] = useState<AuthSession>({
    isAuthenticated: false,
    role: 'visitor',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Modals & Panels
  const [selectedMember, setSelectedMember] = useState<PersonNode | null>(null);
  const [editingMember, setEditingMember] = useState<PersonNode | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load Tree Data & Check Auth on Mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [loadedTree, session, status] = await Promise.all([
          fetchFamilyTree(),
          checkSession(),
          fetchStorageStatus(),
        ]);
        if (isMounted) {
          setTreeData(loadedTree);
          setStorageStatus(status);
          setAuthSession({
            isAuthenticated: session.isAuthenticated,
            role: session.role,
            userEmail: session.email,
          });
          if (session.isAuthenticated) {
            setIsEditMode(true);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update member coordinates during drag or manual positioning
  const handleUpdateMemberPosition = useCallback((id: string, x: number, y: number) => {
    setTreeData((prev) => {
      const updatedMembers = prev.members.map((m) => (m.id === id ? { ...m, x, y } : m));
      return {
        ...prev,
        members: updatedMembers,
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save modified member details (name, label, notes, etc.)
  const handleSaveMember = useCallback((updatedMember: PersonNode) => {
    setTreeData((prev) => {
      const updatedMembers = prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
      return {
        ...prev,
        members: updatedMembers,
      };
    });
    setHasUnsavedChanges(true);
    showToast(`Updated details for ${updatedMember.name}`);
  }, []);

  // Photo upload handler
  const handleUploadPhoto = useCallback(async (personId: string, base64: string): Promise<string> => {
    const photoUrl = await uploadMemberPhoto(personId, base64);
    setTreeData((prev) => {
      const updatedMembers = prev.members.map((m) => (m.id === personId ? { ...m, photoUrl } : m));
      return {
        ...prev,
        members: updatedMembers,
      };
    });
    setHasUnsavedChanges(true);
    showToast('Photo uploaded successfully to persistent storage!');
    return photoUrl;
  }, []);

  // Photo delete handler
  const handleDeletePhoto = useCallback(async (personId: string) => {
    await deleteMemberPhoto(personId);
    setTreeData((prev) => {
      const updatedMembers = prev.members.map((m) => (m.id === personId ? { ...m, photoUrl: undefined } : m));
      return {
        ...prev,
        members: updatedMembers,
      };
    });
    setHasUnsavedChanges(true);
    showToast('Photo removed successfully');
  }, []);

  // Commit all changes to persistent server database
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await saveFamilyTree(treeData);
      setHasUnsavedChanges(false);
      showToast('All changes and coordinates saved to database!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset layout back to original diagram
  const handleResetLayout = async () => {
    if (!window.confirm('Reset family diagram layout back to the original reference drawing?')) {
      return;
    }
    try {
      const reset = await resetFamilyTree();
      setTreeData(reset);
      setHasUnsavedChanges(false);
      showToast('Diagram restored to original layout');
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (!authSession.isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsEditMode(!isEditMode);
  };

  // Owner login callback
  const handleLoginSuccess = (email: string, _token: string) => {
    setAuthSession({
      isAuthenticated: true,
      role: 'owner',
      userEmail: email,
    });
    setIsEditMode(true);
    showToast(`Logged in as Amrutapu Sai Rajesh (${email})`);
  };

  // Owner logout callback
  const handleLogout = async () => {
    await logoutOwner();
    setAuthSession({
      isAuthenticated: false,
      role: 'visitor',
    });
    setIsEditMode(false);
    showToast('Logged out. Public read-only view active.', 'info');
  };

  return (
    <div className="h-screen flex flex-col bg-[#061a12] text-[#e8f0ea] select-none overflow-hidden">
      {/* Top Header & Operational Utility Strip */}
      <Header
        authSession={authSession}
        isEditMode={isEditMode}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        memberCount={treeData.members.length}
        storageStatus={storageStatus}
        onOpenStorageStatus={() => setIsStorageModalOpen(true)}
        onToggleEditMode={handleToggleEditMode}
        onSaveChanges={handleSaveChanges}
        onResetLayout={handleResetLayout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDirectory={() => setIsDirectoryModalOpen(true)}
        onOpenLegend={() => setIsLegendModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Interactive Diagram Canvas */}
      <main className="flex-1 relative flex flex-col overflow-hidden min-h-0 w-full">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-stone-500 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
              <span>Loading Amrutapu Family tree...</span>
            </div>
          </div>
        ) : (
          <FamilyCanvas
            members={treeData.members}
            relationships={treeData.relationships}
            isEditMode={isEditMode}
            isOwner={authSession.isAuthenticated}
            selectedMemberId={selectedMember?.id}
            onSelectMember={(m) => setSelectedMember(m)}
            onEditMember={(m) => setEditingMember(m)}
            onUploadPhotoDirect={handleUploadPhoto}
            onDeletePhotoDirect={handleDeletePhoto}
            onRequireAuth={() => setIsAuthModalOpen(true)}
            onUpdateMemberPosition={handleUpdateMemberPosition}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-stone-900 text-white border-stone-800'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-stone-800 text-white border-stone-700'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember && !editingMember}
        isOwner={authSession.isAuthenticated}
        relationships={treeData.relationships}
        allMembers={treeData.members}
        onClose={() => setSelectedMember(null)}
        onEditClick={(m) => {
          setSelectedMember(null);
          setEditingMember(m);
        }}
        onSelectMember={(m) => setSelectedMember(m)}
      />

      <EditMemberModal
        member={editingMember}
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSaveMember={handleSaveMember}
        onUploadPhoto={handleUploadPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <LegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
      />

      <DirectoryModal
        isOpen={isDirectoryModalOpen}
        members={treeData.members}
        onClose={() => setIsDirectoryModalOpen(false)}
        onSelectMember={(m) => setSelectedMember(m)}
      />

      <StorageStatusModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        status={storageStatus}
        onRefresh={() => fetchStorageStatus().then(setStorageStatus)}
      />
    </div>
  );
}
