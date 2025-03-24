
import React from "react";
import { X } from "lucide-react";

interface PreviewModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close preview"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={imageUrl} 
          alt="Instagram Story Preview" 
          className="max-h-[90vh] w-auto"
        />
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <p className="px-4 py-2 rounded-full text-sm bg-black/50 text-white">
            1080×1920px (Instagram Story size)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
