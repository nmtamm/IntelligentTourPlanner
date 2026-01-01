import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format, addDays } from "date-fns";
import { CalendarFlipIcon } from "./CalendarFlipIcon";

interface DateSelectorProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder: string;
  disabled?: (date: Date) => boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function DateSelector({ 
  date, 
  onSelect, 
  placeholder, 
  disabled,
  onIncrement,
  onDecrement 
}: DateSelectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isFilled = !!date;
  
  // Keep focused style when calendar popup is open
  const showFocusedStyle = isFocused || isOpen;

  return (
    <div className="relative flex-1 min-w-0">
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        setIsFocused(open); // Sync isFocused with isOpen
      }}>
        <PopoverTrigger asChild>
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full transition-all"
            style={{
              height: '40px',
              paddingLeft: '16px',
              paddingRight: '80px',
              borderRadius: '16px',
              border: showFocusedStyle 
                ? '1px solid #2563EB' 
                : (isHovered ? '1px solid #C7D2FE' : '1px solid #E2E8F0'),
              background: showFocusedStyle 
                ? 'white' 
                : (isFilled 
                    ? '#E0EAFF' 
                    : (isHovered ? '#E5EDFF' : '#F1F5FF')),
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
              boxShadow: showFocusedStyle ? '0 0 0 3px rgba(37,99,235,0.25)' : 'none',
              transform: showFocusedStyle ? 'scale(1.01)' : 'scale(1.00)',
              transitionDuration: '160ms',
              transitionTimingFunction: 'ease-out',
            }}
          >
            {/* Calendar Icon - always visible */}
            <CalendarFlipIcon 
              isActive={isOpen}
              size={16}
              color={showFocusedStyle ? '#2563EB' : '#6B7280'}
              className="shrink-0"
            />

            {/* Date Display */}
            <div className="flex flex-col min-w-0 flex-1">
              {date ? (
                <span 
                  className="text-gray-900" 
                  style={{ 
                    fontSize: '14px',
                    fontWeight: isFilled ? 500 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {format(date, "MMM dd, yyyy")}
                </span>
              ) : (
                <span className="text-[#6B7280]" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {placeholder}
                </span>
              )}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onSelect(newDate);
              // Don't close calendar - let user click outside to close
            }}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Increment/Decrement Buttons */}
      {(onIncrement && onDecrement) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            onClick={onIncrement}
            className="bg-white hover:bg-[#3B82F6] hover:text-white border border-gray-300 border-b-0 rounded-t-lg px-1.5 py-0.5 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-sm group"
          >
            <ChevronUp className="w-2 h-2 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>

          <button
            onClick={onDecrement}
            className="bg-white hover:bg-[#3B82F6] hover:text-white border border-gray-300 rounded-b-lg px-1.5 py-0.5 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-sm group"
          >
            <ChevronDown className="w-2 h-2 transition-transform duration-200 group-hover:translate-y-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}