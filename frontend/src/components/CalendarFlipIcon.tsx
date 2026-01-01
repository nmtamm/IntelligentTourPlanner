import { useState, useEffect } from "react";
import { Calendar, CalendarFold } from "lucide-react";

interface CalendarFlipIconProps {
  isActive: boolean;
  className?: string;
  color?: string;
  size?: number;
}

export function CalendarFlipIcon({ 
  isActive, 
  className = "", 
  color = "currentColor",
  size = 16 
}: CalendarFlipIconProps) {
  const [showFold, setShowFold] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Start spinning immediately
      setRotation(360);
      
      // Start showing fold earlier (during the spin) for smoother transition
      const timer = setTimeout(() => {
        setShowFold(true);
      }, 90); // Start crossfade at 50% of spin (90ms of 180ms)
      
      return () => clearTimeout(timer);
    } else {
      // Reset to default state
      setRotation(0);
      setShowFold(false);
    }
  }, [isActive]);

  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Calendar Icon - spins and fades out */}
      <Calendar
        size={size}
        color={color}
        strokeWidth={2}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `rotate(${rotation}deg)`,
          opacity: showFold ? 0 : 1,
          transition: 'transform 180ms ease-out, opacity 200ms ease-out',
        }}
      />

      {/* CalendarFold Icon - fades in after spin */}
      <CalendarFold
        size={size}
        color={color}
        strokeWidth={2}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: showFold ? 1 : 0,
          transform: showFold ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        }}
      />
    </div>
  );
}