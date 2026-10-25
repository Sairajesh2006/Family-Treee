import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Crosshair,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { PersonNode, Relationship } from '../types';
import { PersonCard } from './PersonCard';
import { SvgConnections } from './SvgConnections';
import { BotanicalBackground } from './BotanicalBackground';
import { getCoupleThemeByMemberId } from '../utils/coupleColors';

interface FamilyCanvasProps {
  members: PersonNode[];
  relationships: Relationship[];
  isEditMode: boolean;
  isOwner?: boolean;
  selectedMemberId?: string;
  onSelectMember: (member: PersonNode) => void;
  onEditMember: (member: PersonNode) => void;
  onUploadPhotoDirect?: (personId: string, base64: string) => Promise<string>;
  onDeletePhotoDirect?: (personId: string) => Promise<void>;
  onRequireAuth?: () => void;
  onUpdateMemberPosition: (id: string, x: number, y: number) => void;
}

export const FamilyCanvas: React.FC<FamilyCanvasProps> = ({
  members,
  relationships,
  isEditMode,
  isOwner,
  selectedMemberId,
  onSelectMember,
  onEditMember,
  onUploadPhotoDirect,
  onDeletePhotoDirect,
  onRequireAuth,
  onUpdateMemberPosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom Transform State: X and Y are position, scale is zoom level
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 0.75,
  });

  // Keep a ref of transform to always read the freshest position in event handlers
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Active dragging state
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartCanvasRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging a specific person card in Edit Mode
  const draggingMemberRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    boxStartX: number;
    boxStartY: number;
  } | null>(null);

  // Minimap visibility
  const [showMinimap, setShowMinimap] = useState(true);

  // Touch tracking for pinch-to-zoom on mobile
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const pinchStartMidRef = useRef<{ x: number; y: number } | null>(null);

  // Track if initial automatic fit has completed
  const hasInitiallyFittedRef = useRef(false);

  // Fit all elements into view with comfortable margins and perfect centering
  const fitToView = useCallback(() => {
    if (!containerRef.current || members.length === 0) return;

    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    if (cW <= 0 || cH <= 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    members.forEach((m) => {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + m.width);
      maxY = Math.max(maxY, m.y + m.height);
    });

    const treeW = maxX - minX;
    const treeH = maxY - minY;
    const treeCenterX = minX + treeW / 2;
    const treeCenterY = minY + treeH / 2;

    // Viewport padding
    const paddingX = cW < 640 ? 30 : 60;
    const paddingY = cH < 640 ? 30 : 60;

    const availW = Math.max(cW - paddingX * 2, 100);
    const availH = Math.max(cH - paddingY * 2, 100);

    // Compute scale so all boxes and connecting lines fit inside view
    const scaleX = availW / treeW;
    const scaleY = availH / treeH;
    let fitScale = Math.min(scaleX, scaleY);

    // Keep scale readable and prevent extreme shrinking
    fitScale = Math.max(0.42, Math.min(fitScale, 1.05));
    fitScale = Number(fitScale.toFixed(3));

    // Center the tree perfectly in the viewport
    const targetX = Math.round(cW / 2 - treeCenterX * fitScale);
    const targetY = Math.round(cH / 2 - treeCenterY * fitScale);

    setTransform({
      x: targetX,
      y: targetY,
      scale: fitScale,
    });
  }, [members]);

  // Reset View: sets scale to 1.0 (100%) and centers the tree
  const resetView = useCallback(() => {
    if (!containerRef.current || members.length === 0) return;
    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    members.forEach((m) => {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + m.width);
      maxY = Math.max(maxY, m.y + m.height);
    });

    const treeCenterX = minX + (maxX - minX) / 2;
    const treeCenterY = minY + (maxY - minY) / 2;

    setTransform({
      x: Math.round(cW / 2 - treeCenterX * 1.0),
      y: Math.round(cH / 2 - treeCenterY * 1.0),
      scale: 1.0,
    });
  }, [members]);

  // Focus specifically on central person: Amrutapu Sai Rajesh
  const focusOnMe = useCallback(() => {
    const me = members.find((m) => m.id === 'rajesh');
    if (!me || !containerRef.current) return;

    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    const targetScale = 0.95;

    const meCenterX = me.x + me.width / 2;
    const meCenterY = me.y + me.height / 2;

    const targetX = Math.round(cW / 2 - meCenterX * targetScale);
    const targetY = Math.round(cH / 2 - meCenterY * targetScale);

    setTransform({
      x: targetX,
      y: targetY,
      scale: targetScale,
    });
  }, [members]);

  // Directional Pan Nudge: Moves entire tree up, down, left, right by changing only X and Y
  const panBy = (dx: number, dy: number) => {
    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  // Zoom controls: changes ONLY the scale factor around the viewport center
  const handleZoom = (delta: number) => {
    setTransform((prev) => {
      const newScale = Number(Math.min(Math.max(prev.scale + delta, 0.35), 2.2).toFixed(2));
      if (!containerRef.current) return { ...prev, scale: newScale };

      const cW = containerRef.current.clientWidth / 2;
      const cH = containerRef.current.clientHeight / 2;
      const scaleRatio = newScale / prev.scale;

      const newX = cW - (cW - prev.x) * scaleRatio;
      const newY = cH - (cH - prev.y) * scaleRatio;

      return {
        x: Math.round(newX),
        y: Math.round(newY),
        scale: newScale,
      };
    });
  };

  // Mouse wheel / trackpad scroll handler:
  // - Regular wheel / trackpad scrolling PANS the canvas (moves X and Y, NEVER zooms)
  // - Only zooms if Ctrl/Cmd key is pressed (standard browser zoom convention)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // If Ctrl or Meta is pressed (pinch-to-zoom on trackpad or Ctrl+wheel), perform zoom
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setTransform((prev) => {
        const newScale = Number(Math.min(Math.max(prev.scale * zoomFactor, 0.35), 2.2).toFixed(3));
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { ...prev, scale: newScale };

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleRatio = newScale / prev.scale;

        const newX = mouseX - (mouseX - prev.x) * scaleRatio;
        const newY = mouseY - (mouseY - prev.y) * scaleRatio;

        return {
          x: Math.round(newX),
          y: Math.round(newY),
          scale: newScale,
        };
      });
      return;
    }

    // Default wheel action: PAN the canvas (change ONLY X and Y, NEVER scale)
    setTransform((prev) => ({
      ...prev,
      x: Math.round(prev.x - e.deltaX),
      y: Math.round(prev.y - e.deltaY),
    }));
  };

  // Setup ResizeObserver to automatically fit on initial mount and viewport size changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (!hasInitiallyFittedRef.current) {
            hasInitiallyFittedRef.current = true;
            fitToView();
          }
        }
      }
    });

    observer.observe(el);

    const timer = setTimeout(() => {
      fitToView();
    }, 80);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [fitToView]);

  // Window-level Pointer Move and Up listeners for completely reliable dragging
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      // 1. If dragging an individual member card in edit mode
      if (draggingMemberRef.current) {
        const { id, startX, startY, boxStartX, boxStartY } = draggingMemberRef.current;
        const dx = (e.clientX - startX) / transformRef.current.scale;
        const dy = (e.clientY - startY) / transformRef.current.scale;
        const newX = Math.round(Math.max(10, boxStartX + dx));
        const newY = Math.round(Math.max(10, boxStartY + dy));
        onUpdateMemberPosition(id, newX, newY);
        return;
      }

      // 2. If dragging the background canvas -> PAN the entire diagram
      if (isDraggingRef.current) {
        // Delta between current mouse position and initial click point
        const dx = e.clientX - dragStartMouseRef.current.x;
        const dy = e.clientY - dragStartMouseRef.current.y;

        // Move the canvas by exactly the pointer delta:
        // Mouse moved DOWN (dy > 0) -> tree moves DOWN
        // Mouse moved UP (dy < 0) -> tree moves UP
        // Mouse moved RIGHT (dx > 0) -> tree moves RIGHT
        // Mouse moved LEFT (dx < 0) -> tree moves LEFT
        setTransform((prev) => ({
          ...prev,
          x: Math.round(dragStartCanvasRef.current.x + dx),
          y: Math.round(dragStartCanvasRef.current.y + dy),
          // Scale is strictly untouched during dragging!
        }));
      }
    };

    const handleWindowPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      if (draggingMemberRef.current) {
        draggingMemberRef.current = null;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [onUpdateMemberPosition]);

  // Pointer Down on canvas background: initiates left-click dragging
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    // Only accept left mouse button (button === 0) or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Ignore if clicking on a card or button/input
    const target = e.target as HTMLElement;
    if (
      target.closest('.person-card') ||
      target.closest('.canvas-control') ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }

    // Prevent default browser text selection or image ghosting
    e.preventDefault();

    // Start canvas panning
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
    dragStartCanvasRef.current = { x: transformRef.current.x, y: transformRef.current.y };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // Card Drag handle in Edit Mode
  const handlePointerDownDragCard = (e: React.PointerEvent, member: PersonNode) => {
    if (!isEditMode) return;
    e.stopPropagation();
    draggingMemberRef.current = {
      id: member.id,
      startX: e.clientX,
      startY: e.clientY,
      boxStartX: member.x,
      boxStartY: member.y,
    };
  };

  // Mobile Touch Gestures: Pinch to Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch start: cancel canvas drag
      isDraggingRef.current = false;
      setIsDragging(false);

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = transformRef.current.scale;
      pinchStartMidRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault(); // Prevent page zooming
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scaleMultiplier = currentDist / pinchStartDistRef.current;
      const newScale = Number(
        Math.min(Math.max(pinchStartScaleRef.current * scaleMultiplier, 0.35), 2.2).toFixed(2)
      );

      const mid = pinchStartMidRef.current || { x: 0, y: 0 };
      const currentTransform = transformRef.current;
      const scaleRatio = newScale / currentTransform.scale;
      const newX = mid.x - (mid.x - currentTransform.x) * scaleRatio;
      const newY = mid.y - (mid.y - currentTransform.y) * scaleRatio;

      setTransform({
        x: Math.round(newX),
        y: Math.round(newY),
        scale: newScale,
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    pinchStartMidRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDownCanvas}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full flex-1 overflow-hidden bg-canvas-pattern touch-none select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Nature-inspired Botanical Corner Foliage (Watercolor Greenery & Leaves - pointer-events-none) */}
      <BotanicalBackground />

      {/* Floating Couple Color Legend Key (Top-Left, non-blocking) */}
      <div className="canvas-control absolute top-4 left-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#092218]/90 backdrop-blur-md border border-[#1B4D36] rounded-xl shadow-lg text-[11px] text-[#E0EFE5] pointer-events-auto">
        <span className="font-semibold text-[#74C69D] pr-1 border-r border-[#1B4D36]">Couple Colors:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5C365] ring-1 ring-white/30" />
          <span className="text-[#F3C969] font-medium">Gold</span>
        </span>
        <span className="text-[#1B4D36]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38B000] ring-1 ring-white/30" />
          <span className="text-[#74C69D] font-medium">Emerald</span>
        </span>
        <span className="text-[#1B4D36]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-1 ring-white/30" />
          <span className="text-[#93C5FD] font-medium">Blue</span>
        </span>
        <span className="text-[#1B4D36]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] ring-1 ring-white/30" />
          <span className="text-[#D8B4FE] font-medium">Purple</span>
        </span>
        <span className="text-[#1B4D36]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C] ring-1 ring-white/30" />
          <span className="text-[#FED7AA] font-medium">Amber</span>
        </span>
        <span className="text-[#1B4D36]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] ring-1 ring-white/30 border border-dashed border-white" />
          <span className="text-[#FDA4AF] font-medium">Coral</span>
          <span className="text-[10px] text-stone-400 italic">(Future Wife)</span>
        </span>
      </div>

      {/* Canvas Viewport Transformer: SVG and Boxes move & scale together in lockstep */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
        className="absolute top-0 left-0 pointer-events-none will-change-transform z-[1]"
      >
        {/* SVG Connections & Arrows */}
        <SvgConnections members={members} relationships={relationships} />

        {/* Member Boxes Container (pointer-events-none; cards handle their own clicks) */}
        <div className="absolute top-0 left-0 pointer-events-none">
          {members.map((member) => (
            <PersonCard
              key={member.id}
              member={member}
              isEditMode={isEditMode}
              isOwner={isOwner}
              isSelected={selectedMemberId === member.id}
              onSelect={onSelectMember}
              onEditClick={onEditMember}
              onUploadPhotoDirect={onUploadPhotoDirect}
              onDeletePhotoDirect={onDeletePhotoDirect}
              onRequireAuth={onRequireAuth}
              onPointerDownDrag={handlePointerDownDragCard}
            />
          ))}
        </div>
      </div>

      {/* Floating Canvas Navigation & Movement Toolbar (Dark Emerald Theme) */}
      <div className="canvas-control absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2 p-1.5 bg-[#092218]/92 backdrop-blur-md border border-[#1B4D36] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
        {/* Movement Directional Pad */}
        <div className="flex items-center gap-0.5 bg-[#061A12] p-1 rounded-xl border border-[#143B29]">
          <button
            type="button"
            onClick={() => panBy(100, 0)}
            title="Move Canvas Left (Pan View Right)"
            className="p-1.5 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => panBy(0, 100)}
              title="Move Canvas Up (Pan View Down)"
              className="p-1 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-md transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => panBy(0, -100)}
              title="Move Canvas Down (Pan View Up)"
              className="p-1 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-md transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => panBy(-100, 0)}
            title="Move Canvas Right (Pan View Left)"
            className="p-1.5 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-lg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-6 w-px bg-[#1B4D36] mx-0.5" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            title="Zoom In"
            className="p-2 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-xl transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-mono font-semibold text-[#74C69D] tabular-nums">
            {Math.round(transform.scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            title="Zoom Out"
            className="p-2 text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-xl transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-[#1B4D36] mx-0.5" />

        {/* View Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fitToView}
            title="Fit Entire Tree Inside View"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#E8F5ED] bg-[#123826] hover:bg-[#194D35] border border-[#1E573C] rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Fit Tree</span>
          </button>

          <button
            type="button"
            onClick={resetView}
            title="Reset Zoom to 100% (1:1)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#A7DFC0] hover:text-white hover:bg-[#113826] rounded-xl transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3 text-[#74C69D]" />
            <span>1:1</span>
          </button>

          <button
            type="button"
            onClick={focusOnMe}
            title="Center on Amrutapu Sai Rajesh"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#261E0A] to-[#362B0E] text-[#F3C969] border border-[#8C6D1F] hover:border-[#D4AF37] rounded-xl hover:bg-[#433512] transition-colors whitespace-nowrap shadow-xs"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Center Rajesh</span>
          </button>
        </div>
      </div>

      {/* Mini-Map Indicator (Bottom Right) */}
      <div className="canvas-control absolute bottom-6 right-6 z-20 hidden md:block">
        <div className="bg-[#092218]/95 backdrop-blur-md border border-[#1B4D36] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-200">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#061A12] border-b border-[#143B29] text-xs font-medium text-[#A7DFC0]">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <MapIcon className="w-3 h-3 text-[#52B788]" />
              Diagram Map
            </span>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className="text-[#74C69D] hover:text-white p-0.5"
            >
              {showMinimap ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showMinimap && (
            <div className="p-2 relative w-48 h-32 bg-[#071F15]">
              {/* Scaled Mini representation of members */}
              {members.map((m) => {
                const miniX = (m.x / 2000) * 165;
                const miniY = (m.y / 1200) * 105;
                const coupleTheme = getCoupleThemeByMemberId(m.id);
                let miniClasses = 'bg-[#FCFBF8] border-[#386B52]';
                if (coupleTheme?.id === 'paternal_grandparents') {
                  miniClasses = 'bg-[#E5C365] border-[#F3C969]';
                } else if (coupleTheme?.id === 'maternal_grandparents') {
                  miniClasses = 'bg-[#38B000] border-[#52B788]';
                } else if (coupleTheme?.id === 'parents') {
                  miniClasses = 'bg-[#3B82F6] border-[#60A5FA]';
                } else if (coupleTheme?.id === 'sister_marriage') {
                  miniClasses = 'bg-[#A855F7] border-[#C084FC]';
                } else if (coupleTheme?.id === 'sindhu_parents') {
                  miniClasses = 'bg-[#FB923C] border-[#F97316]';
                } else if (coupleTheme?.id === 'rajesh_future') {
                  miniClasses = 'bg-[#FF6B6B] border-[#FB7185]';
                }

                return (
                  <div
                    key={m.id}
                    style={{
                      left: `${miniX + 6}px`,
                      top: `${miniY + 6}px`,
                      width: '18px',
                      height: '11px',
                    }}
                    className={`absolute rounded-[2px] border ${miniClasses}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
