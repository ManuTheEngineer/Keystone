"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Circle,
  Square,
  Type,
  Undo2,
  Trash2,
  Save,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Annotation {
  id: string;
  type: "circle" | "rect" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

type Tool = "circle" | "rect" | "text";

export interface PhotoAnnotatorProps {
  imageUrl: string;
  onSave: (annotations: Annotation[]) => void;
  onClose: () => void;
  existingAnnotations?: Annotation[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLORS = [
  { name: "Red", value: "#9B2226" },
  { name: "Yellow", value: "#BC6C25" },
  { name: "Blue", value: "#1B4965" },
] as const;

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Convert a pointer / touch event to coordinates relative to the SVG element. */
function pointerToSvg(
  e: React.PointerEvent<SVGSVGElement>,
  svg: SVGSVGElement
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`p-2 rounded-md transition-colors ${
        active
          ? "bg-[#D4A574] text-[#2C1810]"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function ColorSwatch({
  color,
  active,
  onClick,
  label,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-7 h-7 rounded-full border-2 transition-transform ${
        active ? "border-white scale-110" : "border-transparent"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

/** Renders a single annotation inside the SVG overlay. */
function AnnotationShape({ a }: { a: Annotation }) {
  const stroke = a.color;
  const strokeWidth = 2.5;

  if (a.type === "rect") {
    return (
      <rect
        x={a.x}
        y={a.y}
        width={a.width ?? 0}
        height={a.height ?? 0}
        fill="transparent"
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={3}
      />
    );
  }

  if (a.type === "circle") {
    const rx = (a.width ?? 0) / 2;
    const ry = (a.height ?? 0) / 2;
    return (
      <ellipse
        cx={a.x + rx}
        cy={a.y + ry}
        rx={Math.abs(rx)}
        ry={Math.abs(ry)}
        fill="transparent"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  // text
  return (
    <g>
      {/* Background pill for readability */}
      <rect
        x={a.x - 4}
        y={a.y - 16}
        width={(a.text?.length ?? 0) * 8 + 12}
        height={24}
        rx={4}
        fill="rgba(0,0,0,0.6)"
      />
      <text
        x={a.x + 2}
        y={a.y}
        fill={stroke}
        fontSize={14}
        fontFamily="DM Sans, sans-serif"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {a.text}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PhotoAnnotator({
  imageUrl,
  onSave,
  onClose,
  existingAnnotations,
}: PhotoAnnotatorProps) {
  // State ----------------------------------------------------------------
  const [annotations, setAnnotations] = useState<Annotation[]>(
    existingAnnotations ?? []
  );
  const [activeTool, setActiveTool] = useState<Tool>("rect");
  const [activeColor, setActiveColor] = useState<string>(COLORS[0].value);
  const [drawing, setDrawing] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<Annotation | null>(null);
  const [textPromptPos, setTextPromptPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [textInput, setTextInput] = useState("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);

  // Lock body scroll while mounted -----------------------------------------
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard shortcuts (Escape to close, Ctrl+Z to undo) -------------------
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (textPromptPos) {
          setTextPromptPos(null);
          setTextInput("");
        } else {
          onClose();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textPromptPos]);

  // Focus the inline text input when it appears ----------------------------
  useEffect(() => {
    if (textPromptPos && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textPromptPos]);

  // Drawing handlers -------------------------------------------------------

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const pos = pointerToSvg(e, svgRef.current);

      if (activeTool === "text") {
        setTextPromptPos(pos);
        setTextInput("");
        return;
      }

      setDrawing(true);
      setOrigin(pos);
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [activeTool]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing || !origin || !svgRef.current) return;
      const pos = pointerToSvg(e, svgRef.current);

      const x = Math.min(origin.x, pos.x);
      const y = Math.min(origin.y, pos.y);
      const w = Math.abs(pos.x - origin.x);
      const h = Math.abs(pos.y - origin.y);

      setPreview({
        id: "__preview",
        type: activeTool as "circle" | "rect",
        x,
        y,
        width: w,
        height: h,
        color: activeColor,
      });
    },
    [drawing, origin, activeTool, activeColor]
  );

  const handlePointerUp = useCallback(() => {
    if (!drawing || !preview) {
      setDrawing(false);
      return;
    }

    // Only commit shapes with a minimum size (avoids accidental taps)
    const minSize = 6;
    if ((preview.width ?? 0) > minSize || (preview.height ?? 0) > minSize) {
      setAnnotations((prev) => [...prev, { ...preview, id: uid() }]);
    }

    setDrawing(false);
    setOrigin(null);
    setPreview(null);
  }, [drawing, preview]);

  // Text confirm -----------------------------------------------------------

  const commitText = useCallback(() => {
    if (!textPromptPos || !textInput.trim()) {
      setTextPromptPos(null);
      setTextInput("");
      return;
    }
    setAnnotations((prev) => [
      ...prev,
      {
        id: uid(),
        type: "text" as const,
        x: textPromptPos.x,
        y: textPromptPos.y,
        text: textInput.trim(),
        color: activeColor,
      },
    ]);
    setTextPromptPos(null);
    setTextInput("");
  }, [textPromptPos, textInput, activeColor]);

  // Actions ----------------------------------------------------------------

  const handleUndo = useCallback(() => {
    setAnnotations((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnnotations([]);
  }, []);

  const handleSave = useCallback(() => {
    onSave(annotations);
  }, [annotations, onSave]);

  // Render -----------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 select-none">
      {/* ---- Toolbar ---- */}
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-[#2C1810] border-b border-[#8B4513]/40 overflow-x-auto shrink-0">
        {/* Shape tools */}
        <ToolButton
          active={activeTool === "circle"}
          onClick={() => setActiveTool("circle")}
          label="Circle tool"
        >
          <Circle size={18} />
        </ToolButton>
        <ToolButton
          active={activeTool === "rect"}
          onClick={() => setActiveTool("rect")}
          label="Rectangle tool"
        >
          <Square size={18} />
        </ToolButton>
        <ToolButton
          active={activeTool === "text"}
          onClick={() => setActiveTool("text")}
          label="Text tool"
        >
          <Type size={18} />
        </ToolButton>

        {/* Separator */}
        <div className="w-px h-6 bg-white/20 mx-1 shrink-0" />

        {/* Color picker */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <ColorSwatch
              key={c.value}
              color={c.value}
              active={activeColor === c.value}
              onClick={() => setActiveColor(c.value)}
              label={`${c.name} color`}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/20 mx-1 shrink-0" />

        {/* Undo / Clear */}
        <ToolButton onClick={handleUndo} label="Undo last annotation">
          <Undo2 size={18} />
        </ToolButton>
        <ToolButton onClick={handleClear} label="Clear all annotations">
          <Trash2 size={18} />
        </ToolButton>

        {/* Spacer pushes save/close to the right */}
        <div className="flex-1" />

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2D6A4F] text-white text-sm font-medium hover:bg-[#2D6A4F]/80 transition-colors"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close annotator"
          className="p-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* ---- Canvas area ---- */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* The image */}
        <img
          src={imageUrl}
          alt="Construction photo to annotate"
          draggable={false}
          className="max-w-full max-h-full object-contain pointer-events-none"
          // We use the image to size the SVG overlay via onLoad
          onLoad={(e) => {
            const img = e.currentTarget;
            if (svgRef.current) {
              svgRef.current.setAttribute(
                "width",
                String(img.clientWidth)
              );
              svgRef.current.setAttribute(
                "height",
                String(img.clientHeight)
              );
            }
          }}
        />

        {/* SVG overlay — positioned exactly over the image */}
        <svg
          ref={svgRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 touch-none"
          style={{ cursor: activeTool === "text" ? "text" : "crosshair" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Committed annotations */}
          {annotations.map((a) => (
            <AnnotationShape key={a.id} a={a} />
          ))}

          {/* Live preview while drawing */}
          {preview && <AnnotationShape a={preview} />}
        </svg>

        {/* Inline text input (positioned at click location) */}
        {textPromptPos && (
          <div
            className="absolute flex items-center gap-1"
            style={{
              left: `calc(50% - ${
                (svgRef.current?.clientWidth ?? 0) / 2
              }px + ${textPromptPos.x}px)`,
              top: `calc(50% - ${
                (svgRef.current?.clientHeight ?? 0) / 2
              }px + ${textPromptPos.y}px)`,
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitText();
                if (e.key === "Escape") {
                  setTextPromptPos(null);
                  setTextInput("");
                }
              }}
              placeholder="Type note..."
              className="w-48 px-2 py-1 text-sm rounded bg-black/70 border border-[#D4A574] text-white placeholder-white/40 outline-none focus:border-[#8B4513]"
            />
            <button
              type="button"
              onClick={commitText}
              className="px-2 py-1 text-xs rounded bg-[#D4A574] text-[#2C1810] font-medium hover:bg-[#D4A574]/80 transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* ---- Hint bar ---- */}
      <div className="shrink-0 px-3 py-1.5 text-center text-xs text-white/40 bg-[#2C1810]/60">
        {activeTool === "text"
          ? "Click on the image to place a text note"
          : "Click and drag on the image to draw a shape"}
        {" | Ctrl+Z to undo | Esc to close"}
      </div>
    </div>
  );
}
