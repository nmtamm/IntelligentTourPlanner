import { useState } from "react";
import { Plus } from "lucide-react";

interface AddDayButtonProps {
  onClick: () => void;
  label: string;
}

export function AddDayButton({ onClick, label }: AddDayButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className="shrink-0 transition-all"
      data-tutorial="add-day-btn"
      style={{
        height: '27px',
        paddingLeft: '18px',
        paddingRight: '18px',
        borderRadius: '999px',
        border: isHovered ? '1px solid #CBD5FF' : '1px solid #E0E7FF',
        background: isPressed ? '#E5ECFF' : (isHovered ? '#F3F6FF' : 'white'),
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: isPressed 
          ? '0 2px 6px rgba(15,23,42,0.2)' 
          : (isHovered ? '0 4px 12px rgba(15,23,42,0.12)' : 'none'),
        transform: isPressed ? 'scale(0.97)' : (isHovered ? 'scale(1.02)' : 'scale(1.00)'),
        transitionDuration: isPressed ? '120ms' : '150ms',
        transitionTimingFunction: isPressed ? 'ease-out' : (isHovered ? 'ease-out' : 'cubic-bezier(0.16,1,0.3,1)'),
      }}
    >
      <Plus 
        className="w-4 h-4 transition-transform" 
        style={{
          transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
          transitionDuration: '150ms',
          transitionTimingFunction: 'ease-out',
        }}
      />
      <span className="transition-transform" style={{
        transform: isHovered ? 'translateX(1px)' : 'translateX(0px)',
        transitionDuration: '150ms',
      }}>
        {label}
      </span>
    </button>
  );
}