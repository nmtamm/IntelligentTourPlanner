import { useState, React } from "react";
import { X } from "lucide-react";

interface DayChipProps {
  dayNumber: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  label: string;
  readOnly?: boolean;
}

export function DayChip({ dayNumber, isSelected, onClick, onDelete, label, readOnly }: DayChipProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate box shadow for glow effect
  const getGlowShadow = () => {
    if (!isSelected) return 'none';

    // Two-layer glow system
    const innerGlow = '0 0 28px rgba(59, 130, 246, 0.40)'; // Primary glow layer
    const outerGlow = '0 0 70px rgba(59, 130, 246, 0.20)'; // Soft ambient glow

    return `${innerGlow}, ${outerGlow}`;
  };

  return (
    <div className="relative shrink-0" style={{ padding: '4px' }}>
      {/* Main Chip Button */}
      <button
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsPressed(false);
          setIsHovered(false);
        }}
        className={`
          relative shrink-0 rounded-2xl px-3 group
          transition-all
          ${isSelected
            ? 'bg-[#1D4ED8] text-white'
            : 'bg-[#DBEAFE] text-[#64748B] hover:bg-[#BFDBFE]'
          }
        `}
        style={{
          height: '27px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: getGlowShadow(),
          transform: isPressed
            ? 'scale(0.97)'
            : (isHovered && isSelected ? 'scale(1.03)' : 'scale(1.00)'),
          transitionDuration: isSelected
            ? (isPressed ? '120ms' : '180ms')
            : '160ms',
          transitionTimingFunction: isSelected
            ? (isPressed ? 'ease-out' : 'cubic-bezier(0.16, 1, 0.3, 1)')
            : 'ease-in',
          zIndex: 1,
          position: 'relative',
        }}
      >
        {/* Dot Icon */}
        <span
          className={`transition-all duration-160 ${isSelected ? 'text-white' : 'text-[#3B82F6]'}`}
          style={{
            fontSize: '10px',
            lineHeight: 1,
          }}
        >
          ●
        </span>

        {/* Day Label */}
        <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {label} {dayNumber}
        </span>

        {/* Delete Button */}
        {!readOnly && onDelete && (
          <span
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1 hover:scale-125 active:scale-90 hover:rotate-90"
            style={{
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onDelete(e as any);
              }
            }}
          >
            <X className="w-3 h-3 text-red-500 transition-transform duration-200" style={{ strokeWidth: '4px' }} />
          </span>
        )}
      </button>
    </div>
  );
}