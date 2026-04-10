"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  left: number;
}

const DropdownMenu = ({ children, trigger, align = "left" }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !dropdownContentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = dropdownContentRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 12;
    const gap = 8;

    // Responsive menu width for small screens
    const responsiveMenuWidth = viewportWidth < 420 ? viewportWidth - 2 * padding : null;
    const constrainedMenuWidth = responsiveMenuWidth || Math.min(menuRect.width, 320);

    // Calculate horizontal position with better collision detection
    let nextLeft = align === "left"
      ? triggerRect.left
      : triggerRect.right - constrainedMenuWidth;
    
    // Ensure menu doesn't overflow left or right edges
    nextLeft = Math.max(padding, Math.min(nextLeft, viewportWidth - constrainedMenuWidth - padding));

    // Calculate vertical position with collision detection
    let nextTop = triggerRect.bottom + gap;
    if (nextTop + menuRect.height > viewportHeight - padding) {
      // Try to position above trigger
      nextTop = triggerRect.top - menuRect.height - gap;
      // If still doesn't fit, position below with reduced height
      if (nextTop < padding) {
        nextTop = triggerRect.bottom + gap;
      }
    }

    setPosition({ top: nextTop, left: nextLeft });
    setMenuWidth(responsiveMenuWidth);
    setIsReady(true);
  };

  // Close dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedMenu = dropdownContentRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
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

  // Position as soon as the menu is mounted and keep it aligned during viewport changes.
  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      setMenuWidth(null);
      return;
    }

    const animationFrameId = requestAnimationFrame(updatePosition);
    const handleViewportChange = () => updatePosition();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, align]);

  const toggleDropdown = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleDropdown(e);
    }
  };

  const menu = isOpen ? (
    <div
      ref={dropdownContentRef}
      className="fixed bg-background dark:bg-brand-black-100 border border-border rounded-md shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: menuWidth ? `${menuWidth}px` : "auto",
        minWidth: "160px",
        maxWidth: menuWidth ? `${menuWidth}px` : "320px",
        zIndex: 9999,
        overflow: "auto",
        maxHeight: "80vh",
        visibility: isReady ? "visible" : "hidden",
      }}
      role="menu"
      aria-hidden={!isOpen}
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
  ) : null;

  return (
    <div className="relative inline-flex items-center">
      <div 
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center leading-none"
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </div>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className, isActive = false }: DropdownMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full text-left px-4 py-2.5 text-sm md:text-sm transition-colors duration-150 cursor-pointer",
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
