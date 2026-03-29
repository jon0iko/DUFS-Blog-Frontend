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
  isActive?: boolean;
}

interface Position {
  top: number;
  left?: number;
  right?: number;
  transform?: string;
}

const DropdownMenu = ({ children, trigger, align = "left" }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ top: 0 });
  const [constrainedWidth, setConstrainedWidth] = useState<number | null>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  // Initial positioning - just position relative to trigger
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const animationFrameId = requestAnimationFrame(() => {
        const triggerButton = dropdownRef.current?.querySelector('[role="button"]') as HTMLElement;
        if (triggerButton) {
          const triggerRect = triggerButton.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          const newPosition: Position = {
            top: Math.max(triggerRect.bottom + 6, 0),
          };

          // Determine alignment based on trigger position
          if (align === "left") {
            newPosition.left = triggerRect.left;
          } else {
            newPosition.right = viewportWidth - triggerRect.right;
          }

          setPosition(newPosition);
          setIsPositioned(true);
        }
      });
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      setIsPositioned(false);
      setConstrainedWidth(null);
    }
  }, [isOpen, align]);

  // Second effect: Check if dropdown overflows and adjust
  useEffect(() => {
    if (isOpen && isPositioned && dropdownContentRef.current && dropdownRef.current) {
      const timeoutId = setTimeout(() => {
        const dropdownRect = dropdownContentRef.current?.getBoundingClientRect();
        const triggerButton = dropdownRef.current?.querySelector('[role="button"]') as HTMLElement;
        const triggerRect = triggerButton?.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 12;
        
        if (dropdownRect && triggerRect) {
          const newPosition: Position = { ...position };
          
          // Check if dropdown overflows right edge
          if (dropdownRect.right > viewportWidth - padding) {
            if (viewportWidth < 768) {
              const maxWidth = viewportWidth - 2 * padding;
              setConstrainedWidth(maxWidth);
              newPosition.left = padding;
              delete newPosition.right;
            } else {
              newPosition.right = padding;
              delete newPosition.left;
            }
          }
          
          // Check if dropdown overflows left edge
          if (dropdownRect.left < padding) {
            if (viewportWidth < 768) {
              const maxWidth = viewportWidth - 2 * padding;
              setConstrainedWidth(maxWidth);
              newPosition.left = padding;
              delete newPosition.right;
            } else {
              newPosition.left = padding;
              delete newPosition.right;
            }
          }

          // Check if dropdown overflows bottom edge
          if (dropdownRect.bottom > viewportHeight - padding) {
            // Position above the trigger instead of below
            newPosition.top = Math.max(triggerRect.top - dropdownRect.height - 6, padding);
          }
          
          setPosition(newPosition);
        }
      }, 0); // Use setTimeout to let the DOM render first
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, isPositioned]);

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
          ref={dropdownContentRef}
          className="fixed bg-background dark:bg-brand-black-100 border border-border rounded-md shadow-md w-max"
          style={{
            top: `${position.top}px`,
            ...(position.left !== undefined && { left: `${position.left}px` }),
            ...(position.right !== undefined && { right: `${position.right}px` }),
            ...(constrainedWidth && { maxWidth: `${constrainedWidth}px` }),
            zIndex: 9999,
            overflow: constrainedWidth ? 'hidden' : 'visible',
          }}
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
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

const DropdownMenuItem = ({ children, onClick, className, isActive = false }: DropdownMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full text-left px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer whitespace-nowrap",
        "text-foreground dark:text-white",
        "hover:bg-secondary dark:hover:bg-brand-black-90",
        "active:bg-secondary dark:active:bg-brand-black-90",
        isActive && "bg-secondary dark:bg-brand-black-90 font-medium",
        className
      )}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
