"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  align?: "left" | "right";
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenu = ({ children, trigger, align = "right" }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Use requestAnimationFrame to ensure position is calculated after the dropdown is rendered
      const animationFrameId = requestAnimationFrame(() => {
        const triggerButton = dropdownRef.current?.querySelector('[role="button"]') as HTMLElement;
        if (triggerButton) {
          const rect = triggerButton.getBoundingClientRect();
          setPosition({
            top: rect.bottom + window.scrollY + 8,
            left: align === "left" ? rect.left + window.scrollX : rect.right + window.scrollX,
          });
          setIsPositioned(true);
        }
      });
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      setIsPositioned(false);
    }
  }, [isOpen, align]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div 
        onClick={toggleDropdown}
        className="inline-block"
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>

      {isOpen && isPositioned && (
        <div
          className={cn(
            "fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px] animate-in fade-in zoom-in-95 duration-200",
            align === "left" ? "" : ""
          )}
          style={{
            top: `${position.top}px`,
            left: align === "left" ? `${position.left}px` : `${position.left}px`,
            zIndex: 9999,
            transformOrigin: align === "right" ? "top right" : "top left",
            transform: align === "right" ? "translateX(-100%)" : "translateX(0)",
          }}
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              const element = child as React.ReactElement<DropdownMenuItemProps>;
              return React.cloneElement(element, {
                onClick: () => {
                  element.props.onClick?.();
                  setIsOpen(false);
                },
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className }: DropdownMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
