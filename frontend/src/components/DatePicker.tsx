'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DatePickerProps {
  onApply: (range: { start: string; end: string } | null) => void;
  initialRange?: { start: string; end: string } | null;
}

export default function DatePicker({ onApply, initialRange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [tempRange, setTempRange] = useState<DateRange>({
    start: initialRange?.start ? new Date(initialRange.start) : null,
    end: initialRange?.end ? new Date(initialRange.end) : null,
  });

  const [appliedRange, setAppliedRange] = useState<{ start: string; end: string } | null>(initialRange || null);

  // Sync initial range when it changes externally
  useEffect(() => {
    if (initialRange) {
      setAppliedRange(initialRange);
      setTempRange({
        start: new Date(initialRange.start),
        end: new Date(initialRange.end),
      });
    } else {
      setAppliedRange(null);
      setTempRange({ start: null, end: null });
    }
  }, [initialRange]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: clickedDate, end: null });
    } else {
      if (clickedDate < tempRange.start) {
        setTempRange({ start: clickedDate, end: tempRange.start });
      } else {
        setTempRange({ ...tempRange, end: clickedDate });
      }
    }
  };

  const handleQuickSelect = (type: 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'today') {
      setTempRange({ start: today, end: today });
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTempRange({ start: tomorrow, end: tomorrow });
    } else if (type === 'thisWeek') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      setTempRange({ start: startOfWeek, end: endOfWeek });
    } else if (type === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setTempRange({ start: startOfMonth, end: endOfMonth });
    }
  };

  const handleCancel = () => {
    setTempRange({
      start: appliedRange ? new Date(appliedRange.start) : null,
      end: appliedRange ? new Date(appliedRange.end) : null,
    });
    setIsOpen(false);
  };

  const handleApply = () => {
    if (tempRange.start && tempRange.end) {
      const rangeStr = {
        start: tempRange.start.toISOString(),
        end: tempRange.end.toISOString(),
      };
      setAppliedRange(rangeStr);
      onApply(rangeStr);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppliedRange(null);
    setTempRange({ start: null, end: null });
    onApply(null);
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (tempRange.start && tempRange.end) {
      return date >= tempRange.start && date <= tempRange.end;
    }
    if (tempRange.start) {
      return date.getTime() === tempRange.start.getTime();
    }
    return false;
  };

  const isRangeEnd = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return tempRange.end && date.getTime() === tempRange.end.getTime();
  };

  const isRangeStart = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return tempRange.start && date.getTime() === tempRange.start.getTime();
  };

  const daysDiff = tempRange.start && tempRange.end 
    ? Math.round((tempRange.end.getTime() - tempRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-md px-3 py-2 cursor-pointer transition-colors"
      >
        <div className="flex items-center text-sm text-zinc-300">
          <CalendarIcon className="w-4 h-4 mr-2 text-zinc-400" />
          {appliedRange ? (
            <span>{formatDateShort(appliedRange.start)} – {formatDateShort(appliedRange.end)}</span>
          ) : (
            <span>Select Dates</span>
          )}
        </div>
        {appliedRange && (
          <button onClick={handleClear} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={handleCancel} />
          <div className="fixed md:absolute top-1/2 left-1/2 md:top-[calc(100%+8px)] md:left-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 z-50 w-[320px] md:w-[360px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 flex flex-col gap-4">
            
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">Custom Date Range</h3>
              <button onClick={handleCancel} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleQuickSelect('today')} className="py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">Today</button>
              <button onClick={() => handleQuickSelect('tomorrow')} className="py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">Tomorrow</button>
              <button onClick={() => handleQuickSelect('thisWeek')} className="py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">This Week</button>
              <button onClick={() => handleQuickSelect('thisMonth')} className="py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">This Month</button>
            </div>

            <div className="flex justify-between items-center px-1">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-zinc-800 rounded text-zinc-400">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-medium text-sm text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={handleNextMonth} className="p-1 hover:bg-zinc-800 rounded text-zinc-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs text-zinc-500 py-1">{day}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isSelected(day);
                const start = isRangeStart(day);
                const end = isRangeEnd(day);
                
                let baseClasses = "text-sm py-1.5 cursor-pointer transition-colors relative z-10 ";
                let wrapperClasses = "relative ";

                if (selected) {
                  if (start && end) {
                    baseClasses += "bg-white text-black rounded-full font-medium ";
                  } else if (start) {
                    baseClasses += "bg-white text-black rounded-l-full font-medium ";
                    wrapperClasses += "bg-zinc-800 ";
                  } else if (end) {
                    baseClasses += "bg-white text-black rounded-r-full font-medium ";
                    wrapperClasses += "bg-zinc-800 ";
                  } else {
                    baseClasses += "bg-zinc-800 text-white ";
                    wrapperClasses += "bg-zinc-800 ";
                  }
                } else {
                  baseClasses += "text-zinc-300 hover:bg-zinc-800 hover:rounded-full ";
                }

                return (
                  <div key={day} className={wrapperClasses}>
                    <div onClick={() => handleDateClick(day)} className={baseClasses}>
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-800 mt-2">
              <div className="text-xs text-zinc-400">
                {daysDiff > 0 ? `${daysDiff} days selected` : 'Select range'}
              </div>
              <div className="flex gap-2">
                <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleApply} 
                  disabled={!tempRange.start || !tempRange.end}
                  className="px-3 py-1.5 text-sm bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
