import React, { useState } from 'react';
import { X, Upload, Trash2, Camera, User, Check, AlertCircle } from 'lucide-react';
import { PersonNode } from '../types';

interface EditMemberModalProps {
  member: PersonNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMember: (updated: PersonNode) => void;
  onUploadPhoto: (personId: string, base64: string) => Promise<string>;
  onDeletePhoto: (personId: string) => Promise<void>;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSaveMember,
  onUploadPhoto,
  onDeletePhoto,
}) => {
  if (!isOpen || !member) return null;

  const [name, setName] = useState(member.name);
  const [relationLabel, setRelationLabel] = useState(member.labelOverride || member.relationToMe);
  const [notes, setNotes] = useState(member.notes || '');
  const [gender, setGender] = useState<string>(member.gender || 'male');
  const [posX, setPosX] = useState(member.x);
  const [posY, setPosY] = useState(member.y);

  const [photoPreview, setPhotoPreview] = useState<string | undefined>(member.photoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMe = member.id === 'rajesh';
  const isFutureWife = member.id === 'sindhu_triveni';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setPhotoPreview(base64);
        try {
          const publicUrl = await onUploadPhoto(member.id, base64);
          setPhotoPreview(publicUrl);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to upload photo to server.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg('Error reading file.');
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm(`Are you sure you want to remove the photo for ${name}?`)) return;
    setIsUploading(true);
    try {
      await onDeletePhoto(member.id);
      setPhotoPreview(undefined);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMember({
      ...member,
      name: name.trim(),
      labelOverride: relationLabel.trim(),
      notes: notes.trim(),
      gender: gender as any,
      x: Number(posX),
      y: Number(posY),
      photoUrl: photoPreview,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div>
            <h3 className="text-base font-semibold text-stone-900 font-serif">
              Edit Family Member Details
            </h3>
            <p className="text-xs text-stone-500">
              Update information, coordinates, and photograph for {member.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Section */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Personal Photograph
            </label>
            <div className="flex items-center gap-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="relative w-20 h-20 rounded-xl border border-stone-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-stone-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px]">
                    Uploading...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-white border border-stone-300 rounded-lg shadow-xs hover:bg-stone-50 cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5 text-stone-600" />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Real Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}

                <p className="text-[11px] text-stone-500 leading-tight">
                  Upload a real personal photograph. Stored persistently on server.
                </p>
              </div>
            </div>
          </div>

          {/* Name & Relation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Relationship Display Label
              </label>
              <input
                type="text"
                required
                value={relationLabel}
                onChange={(e) => setRelationLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {isFutureWife && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Note:</strong> Sindhu Triveni is designated as a future-wife placeholder in accordance with your specifications.
            </div>
          )}

          {/* Notes / Bio */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Personal Notes / Biography / Dates
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, birth dates, native place, or family memories..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Exact Diagram Coordinates */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="block text-xs font-semibold text-stone-700 mb-2">
              Diagram Box Coordinates (px)
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">X Position</label>
                <input
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Y Position</label>
                <input
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
