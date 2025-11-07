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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="focus:outline-none"
        aria-label="Toggle dropdown menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 bg-background border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-max",
            align === "left" ? "left-0" : "right-0"
          )}
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
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        className
      )}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
