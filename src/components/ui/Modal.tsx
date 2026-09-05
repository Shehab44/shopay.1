"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-shopay-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-shopay-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-shopay-gray-light">
          <h2 className="text-xl font-bold text-shopay-black">
            {title && title}
          </h2>
          <button
            onClick={onClose}
            className="text-shopay-black/50 hover:text-shopay-purple transition-colors p-1"
            aria-label="إغلاق النافذة"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
