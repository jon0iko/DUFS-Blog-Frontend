'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFontClass } from '@/lib/fonts';

interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryDropdownProps {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
}

// Helper function to parse label and return bn and en parts
function parseCategoryLabel(label: string): { bn: string; en: string } {
  // Match: "Bengali (English)" format
  const match = label.match(/^(.+?)\s+\((.+?)\)$/);
  if (match) {
    return { bn: match[1], en: `(${match[2]})` };
  }
  return { bn: label, en: '' };
}

export default function CategoryDropdown({
  options,
  value,
  onChange,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || 'All Categories';
  const { bn, en } = parseCategoryLabel(selectedLabel);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  return (
    <div ref={dropdownRef} className="relative w-full big:w-auto big:min-w-[370px]">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-full appearance-none rounded-[4px] border border-[#BDB2AB] bg-[#C9C0BC] px-4 text-[1.1rem] big:text-[1.2rem] font-black text-[#29211D] outline-none transition-all focus:border-[#84786F] dark:border-[#3A3431] dark:bg-[#302A27] dark:text-[#F3E7DD] cursor-pointer flex items-center justify-between"
        )}
      >
        {value === "all" ? (
          <span className={cn("flex-1 text-left", getFontClass(selectedLabel))}>{selectedLabel}</span>
        ) : (
          <span className="flex items-center gap-1 flex-1 text-left">
            {bn && <span className={cn(getFontClass(bn))}>{bn}</span>}
            {en && <span className={cn(getFontClass(en))}>{en}</span>}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#29211D] dark:text-[#AFA39B] transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[9999] rounded-[4px] border border-[#BDB2AB] bg-[#C9C0BC] shadow-xl overflow-visible dark:border-[#3A3431] dark:bg-[#302A27]">
          <div className="max-h-[300px] overflow-y-auto">
            {options.map((option) => {
              const { bn: optBn, en: optEn } = parseCategoryLabel(option.label);
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-[1rem] big:text-[1.1rem] font-black transition-colors flex items-center gap-1 hover:opacity-90",
                    isSelected
                      ? "bg-[#6A635E] text-white dark:bg-[#4C433E] dark:text-[#F3E7DD]"
                      : "text-[#29211D] hover:bg-[#DDD3CD] dark:text-[#F3E7DD] dark:hover:bg-[#3A3431]"
                  )}
                >
                  {option.value === "all" ? (
                    <span className={cn(getFontClass(option.label))}>{option.label}</span>
                  ) : (
                    <>
                      {optBn && <span className={cn(getFontClass(optBn))}>{optBn}</span>}
                      {optEn && <span className={cn(getFontClass(optEn))}>{optEn}</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
