import React, { useRef, useState, useEffect } from 'react';
import { Camera, Edit3, Move, User, Upload, Trash2, Check, RefreshCw } from 'lucide-react';
import { PersonNode } from '../types';
import { getCoupleThemeByMemberId } from '../utils/coupleColors';

interface PersonCardProps {
  member: PersonNode;
  isEditMode: boolean;
  isOwner?: boolean;
  isSelected?: boolean;
  onEditClick: (member: PersonNode) => void;
  onUploadPhotoDirect?: (personId: string, base64: string) => Promise<string>;
  onDeletePhotoDirect?: (personId: string) => Promise<void>;
  onRequireAuth?: () => void;
  onSelect?: (member: PersonNode) => void;
  onPointerDownDrag?: (e: React.PointerEvent, member: PersonNode) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  member,
  isEditMode,
  isOwner,
  isSelected,
  onEditClick,
  onUploadPhotoDirect,
  onDeletePhotoDirect,
  onRequireAuth,
  onSelect,
  onPointerDownDrag,
}) => {
  const isMe = member.id === 'rajesh';
  const isFutureWife = member.id === 'sindhu_triveni';
  const coupleTheme = getCoupleThemeByMemberId(member.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(member.photoUrl);

  // Sync photoUrl when member prop updates
  useEffect(() => {
    setPhotoUrl(member.photoUrl);
  }, [member.photoUrl]);

  // Handle direct photo selection for this specific member
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be under 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Instant preview
        setPhotoUrl(base64);

        if (onUploadPhotoDirect) {
          try {
            const savedUrl = await onUploadPhotoDirect(member.id, base64);
            setPhotoUrl(savedUrl);
          } catch (err: any) {
            alert(err.message || 'Failed to save photo to database.');
            setPhotoUrl(member.photoUrl);
          } finally {
            setIsUploading(false);
          }
        } else {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    } finally {
      // Clear value so the same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file picker
  const handlePhotoAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If owner or edit mode, open file picker
    if (isOwner || isEditMode) {
      fileInputRef.current?.click();
    } else if (onRequireAuth) {
      // Prompt visitor that owner login is required to upload photos permanently
      onRequireAuth();
    } else if (onSelect) {
      onSelect(member);
    }
  };

  // Remove photo
  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Remove photo for ${member.name}?`)) return;

    if (onDeletePhotoDirect) {
      setIsUploading(true);
      try {
        await onDeletePhotoDirect(member.id);
        setPhotoUrl(undefined);
      } catch (err: any) {
        alert(err.message || 'Failed to remove photo.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      style={{
        transform: `translate(${member.x}px, ${member.y}px)`,
        width: `${member.width}px`,
        height: `${member.height}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(member);
      }}
      onPointerDown={(e) => {
        // Prevent background canvas from starting a pan when clicking inside a card
        e.stopPropagation();
      }}
      className={`person-card pointer-events-auto absolute select-none transition-all duration-150 rounded-xl p-3 flex flex-col justify-between ${
        isMe
          ? 'border-2 border-[#FF6B6B] shadow-[0_8px_28px_rgba(255,107,107,0.28)] ring-2 ring-[#FB7185]/60 bg-gradient-to-br from-[#FFFDF9] via-[#FFF5F5] to-[#FFFDF9]'
          : isFutureWife
          ? 'border-dashed border-2 border-[#FF6B6B] shadow-[0_8px_24px_rgba(255,107,107,0.25)] ring-1.5 ring-[#FB7185]/50 bg-gradient-to-br from-[#FFFDFD] via-[#FFF8F8] to-[#FCFBF8]'
          : coupleTheme
          ? `border-2 ${coupleTheme.cardBorderClass} ${coupleTheme.cardRingClass} ${coupleTheme.cardShadowClass} bg-[#FCFBF8]/98 backdrop-blur-sm`
          : 'border border-[#26543D] bg-[#FCFBF8]/98 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.4),0_1px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)] hover:border-[#408261]'
      } ${isSelected ? 'ring-2 ring-white border-white shadow-2xl scale-[1.02]' : ''} ${
        isEditMode ? 'cursor-grab active:cursor-grabbing hover:shadow-lg' : 'cursor-pointer'
      }`}
    >
      {/* Hidden file input for direct photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Card Body: Photo on Left + Prominent Name & Subtitle on Right */}
      <div className="flex items-start gap-3">
        {/* Photo Box Area */}
        <div
          onClick={handlePhotoAreaClick}
          title={photoUrl ? 'Click to change photo' : 'Click to upload photo'}
          className="relative group shrink-0 cursor-pointer"
        >
          <div
            className={`w-16 h-16 rounded-xl overflow-hidden flex flex-col items-center justify-center border transition-all ${
              isMe
                ? 'border-[#FB7185]/80 bg-[#FFF5F5] text-rose-950 shadow-inner'
                : isFutureWife
                ? 'border-[#FB7185]/80 bg-[#FFF5F5] text-rose-800'
                : coupleTheme
                ? `${coupleTheme.photoBorderClass} ${coupleTheme.photoBgClass} shadow-xs`
                : 'border-[#CFD9CE] bg-[#F4F7F2]/90 text-[#3F5444] shadow-xs'
            } hover:shadow-xs`}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              /* Clear "Upload Photo" Placeholder with couple-matching color accents */
              <div className="flex flex-col items-center justify-center text-center p-1">
                <Upload
                  className={`w-4 h-4 ${
                    isMe || isFutureWife
                      ? 'text-[#E11D48]'
                      : coupleTheme
                      ? coupleTheme.photoIconColorClass
                      : 'text-[#5F7A65]'
                  } group-hover:scale-110 transition-transform`}
                />
                <span
                  className={`text-[10px] font-semibold mt-1 leading-tight ${
                    isMe || isFutureWife
                      ? 'text-[#9F1239]'
                      : coupleTheme
                      ? coupleTheme.accentBadgeText
                      : 'text-[#445A49]'
                  }`}
                >
                  Upload Photo
                </span>
              </div>
            )}

            {/* Uploading loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#1C261F]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[9px] gap-1 z-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E2C78A]" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          {/* Quick Hover Action Badge when photo exists */}
          {photoUrl && (isOwner || isEditMode) && (
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title="Change Photo"
                onClick={handlePhotoAreaClick}
                className="w-5 h-5 rounded-full bg-[#233026] text-white flex items-center justify-center shadow hover:bg-[#B89354] transition-colors"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                title="Remove Photo"
                onClick={handleRemovePhoto}
                className="w-5 h-5 rounded-full bg-rose-700 text-white flex items-center justify-center shadow hover:bg-rose-800 transition-colors"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Text Area: Prominent Full Name + Relationship Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Actual Full Name */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4
              className={`text-[13px] font-bold leading-tight font-serif text-[#1C1F1D] break-words ${
                isMe ? 'text-[#3E2B10] font-bold' : ''
              }`}
              title={member.name}
            >
              {member.name}
            </h4>
            {isMe && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FFE4E6] text-[#9F1239] border border-[#FDA4AF] shrink-0">
                Me
              </span>
            )}
          </div>

          {/* Relationship Subtitle Underneath Name */}
          <p
            className={`text-xs mt-1 leading-snug line-clamp-2 ${
              isFutureWife
                ? 'text-[#BE123C] font-semibold'
                : isMe
                ? 'text-[#9F1239] font-medium'
                : coupleTheme
                ? `${coupleTheme.accentBadgeText} font-medium`
                : 'text-[#4A5D4E] font-medium'
            }`}
          >
            {member.labelOverride || member.relationToMe}
          </p>

          {isFutureWife && (
            <span className="inline-block text-[10px] text-[#BE123C] font-semibold italic mt-0.5">
              (Future Wife Placeholder — Not Married)
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Generation category + Couple color indicator + Actions */}
      <div className="mt-2 pt-1.5 border-t border-[#ECE6DA] flex items-center justify-between text-[11px] text-[#6E7C70]">
        <div className="flex items-center gap-1 truncate">
          {member.generation === 1 && <span>Grandparent</span>}
          {member.generation === 2 && <span>Parent</span>}
          {member.generation === 3 && <span>Lineage</span>}
          {member.generation === 4 && <span>Next Gen</span>}
          {coupleTheme && (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${coupleTheme.accentBadgeBg} ${coupleTheme.accentBadgeText} border ${coupleTheme.accentBadgeBorder} ml-1 shrink-0`}
              title={`Couple color: ${coupleTheme.colorName}`}
            >
              {coupleTheme.colorName}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <>
              <button
                type="button"
                title="Edit Details"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(member);
                }}
                className="p-1 hover:text-stone-900 text-stone-600 hover:bg-stone-100 rounded transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <div
                title="Drag to reposition box"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPointerDownDrag && onPointerDownDrag(e, member);
                }}
                className="p-1 cursor-grab active:cursor-grabbing text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
              >
                <Move className="w-3.5 h-3.5" />
              </div>
            </>
          ) : (
            <button
              type="button"
              title="View Details"
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(member);
              }}
              className="text-[11px] text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 hover:underline"
            >
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
