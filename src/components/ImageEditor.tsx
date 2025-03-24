import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Download, Upload, ZoomIn, ZoomOut, Move, RotateCcw, Image
} from "lucide-react";
import {
  composeImage,
  downloadImage,
  optimizeForInstagram,
  CANVAS_DIMENSIONS,
  SAFE_ZONES,
  validateImageFile,
  stripExifData
} from "../utils/imageProcessing";
import PreviewModal from "./PreviewModal";

const ImageEditor: React.FC = () => {
  // State for the uploaded image
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Image position and scale
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load the overlay image on component mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOverlayImage(img);
    img.onerror = () => toast.error("Failed to load overlay image");
    img.src = "/lovable-uploads/e77661f0-ee92-47aa-ba3b-055b36b8a166.png";
  }, []);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Validate file
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Strip EXIF data
      const { dataUrl } = await stripExifData(file);
      
      // Create image element
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        updateCanvas(img);
        setIsProcessing(false);
      };
      img.onerror = () => {
        toast.error("Failed to load image");
        setIsProcessing(false);
      };
      img.src = dataUrl;
    } catch (error) {
      toast.error("Failed to process image");
      setIsProcessing(false);
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Update canvas with current settings
  const updateCanvas = async (img = userImage) => {
    if (!canvasRef.current || !img || !overlayImage) return;
    
    try {
      const dataUrl = await composeImage(
        canvasRef.current,
        img,
        overlayImage,
        scale,
        offset.x,
        offset.y
      );
      setComposedImage(dataUrl);
    } catch (error) {
      toast.error("Failed to update preview");
    }
  };
  
  // Update canvas when state changes
  useEffect(() => {
    if (userImage && overlayImage) {
      updateCanvas();
    }
  }, [userImage, overlayImage, scale, offset]);
  
  // Handle download
  const handleDownload = async () => {
    if (!canvasRef.current || !composedImage) return;
    
    setIsProcessing(true);
    try {
      // Optimize for Instagram
      await optimizeForInstagram(canvasRef.current);
      
      // Download the image
      downloadImage(composedImage);
      toast.success("Image saved successfully");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Handle image dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartPos({ 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    
    // Get container dimensions to calculate movement ratio
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate ratio between container and actual canvas size
    const ratioX = CANVAS_DIMENSIONS.width / container.clientWidth;
    const ratioY = CANVAS_DIMENSIONS.height / container.clientHeight;
    
    setOffset(prev => ({
      x: prev.x + (dx / ratioX),
      y: prev.y + (dy / ratioY)
    }));
    
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dx = e.touches[0].clientX - dragStartPos.x;
    const dy = e.touches[0].clientY - dragStartPos.y;
    
    // Get container dimensions to calculate movement ratio
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate ratio between container and actual canvas size
    const ratioX = CANVAS_DIMENSIONS.width / container.clientWidth;
    const ratioY = CANVAS_DIMENSIONS.height / container.clientHeight;
    
    setOffset(prev => ({
      x: prev.x + (dx / ratioX),
      y: prev.y + (dy / ratioY)
    }));
    
    setDragStartPos({ 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Reset editing
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  
  // Handle preview
  const handleOpenPreview = () => {
    if (composedImage) {
      setIsPreviewOpen(true);
    } else {
      toast.error("No image to preview");
    }
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Preview Area */}
        <div 
          ref={containerRef}
          className={`relative w-full max-w-sm mx-auto lg:mx-0 aspect-[9/16] border rounded-2xl overflow-hidden
                      bg-secondary/30 shadow-lg transition-all duration-300
                      ${isDragging ? 'cursor-grabbing' : userImage ? 'cursor-grab' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseDown={userImage ? handleMouseDown : undefined}
          onMouseMove={userImage ? handleMouseMove : undefined}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={userImage ? handleTouchStart : undefined}
          onTouchMove={userImage ? handleTouchMove : undefined}
          onTouchEnd={handleDragEnd}
        >
          {/* Canvas for compositing */}
          <canvas 
            ref={canvasRef}
            className="hidden"
            width={CANVAS_DIMENSIONS.width}
            height={CANVAS_DIMENSIONS.height}
          />
          
          {/* Preview image */}
          {composedImage ? (
            <img
              src={composedImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin w-8 h-8 border-2 border-primary rounded-full border-t-transparent"></div>
                  <p>Processing image...</p>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center gap-4 p-6 text-center transition-all duration-300 hover:opacity-80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Drop image here</p>
                    <p className="text-sm">or click to browse</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
          />
        </div>
        
        {/* Controls */}
        <div className="w-full lg:flex-1 space-y-8">
          <div className="text-center lg:text-left animate-slide-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Story Image Generator</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:px-0">
              Create Instagram Story images by positioning your photo within the Método IP event frame.
            </p>
          </div>
          
          {userImage ? (
            <div className="space-y-6 animate-fade-in">
              {/* Zoom Controls */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Image Size
                  </label>
                  <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="btn-icon" 
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={e => setScale(parseFloat(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                  />
                  <button 
                    className="btn-icon" 
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Position info */}
              <div className="rounded-lg p-4 bg-secondary/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Move className="w-4 h-4" />
                  <span>Drag the image to adjust position</span>
                </div>
                <button 
                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset position and zoom
                </button>
              </div>
              
              {/* Preview Button (new) */}
              <button
                className="btn-secondary w-full"
                onClick={handleOpenPreview}
              >
                <span className="flex items-center justify-center gap-2">
                  <Image className="w-5 h-5" />
                  Preview at full size
                </span>
              </button>
              
              {/* Download Button */}
              <button
                className="btn-primary w-full py-4"
                onClick={handleDownload}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Story Image
                  </span>
                )}
              </button>
              
              {/* Upload Another */}
              <div className="text-center">
                <button
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload a different photo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 border border-dashed rounded-lg bg-secondary/30">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Upload an image to create your Instagram Story confirmation.
                  </p>
                  <button
                    className="btn-primary w-full mt-4" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      Select Image
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Requirements:</h3>
                <ul className="text-sm space-y-1.5 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>JPG or PNG image format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>File size under 10MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Best results with portrait-oriented photos</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Modal */}
      <PreviewModal 
        imageUrl={composedImage}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default ImageEditor;
