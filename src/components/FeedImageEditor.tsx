
import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Download, Upload, ZoomIn, ZoomOut, RotateCcw 
} from "lucide-react";
import { Slider } from "./ui/slider";
import {
  composeImage,
  downloadImage,
  optimizeForInstagram,
  FEED_CANVAS_DIMENSIONS,
  SAFE_ZONES,
  validateImageFile,
  stripExifData
} from "../utils/feedImageProcessing";

interface FeedImageEditorProps {
  overlayImage: string;
}

const ImageEditor: React.FC<FeedImageEditorProps> = ({ overlayImage: overlayImageSrc }) => {
  // State for the uploaded image
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image scale
  const [scale, setScale] = useState(1);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load the overlay image on component mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOverlayImage(img);
      
      // Initially display just the overlay
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = FEED_CANVAS_DIMENSIONS.width;
          canvasRef.current.height = FEED_CANVAS_DIMENSIONS.height;
          ctx.drawImage(img, 0, 0, FEED_CANVAS_DIMENSIONS.width, FEED_CANVAS_DIMENSIONS.height);
          setComposedImage(canvasRef.current.toDataURL("image/png"));
        }
      }
    };
    img.onerror = () => toast.error("Failed to load overlay image");
    img.src = import.meta.env.BASE_URL + overlayImageSrc;
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
    if (!canvasRef.current || !overlayImage) return;
    
    try {
      if (img) {
        // If user image exists, compose it with the overlay
        const dataUrl = await composeImage(
          canvasRef.current,
          img,
          overlayImage,
          scale,
          0, // No X offset - image is always centered
          0  // No Y offset - image is always centered
        );
        setComposedImage(dataUrl);
      } else {
        // If no user image, just show the overlay
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = FEED_CANVAS_DIMENSIONS.width;
          canvasRef.current.height = FEED_CANVAS_DIMENSIONS.height;
          ctx.drawImage(overlayImage, 0, 0, FEED_CANVAS_DIMENSIONS.width, FEED_CANVAS_DIMENSIONS.height);
          setComposedImage(canvasRef.current.toDataURL("image/png"));
        }
      }
    } catch (error) {
      toast.error("Failed to update preview");
    }
  };
  
  // Update canvas when state changes
  useEffect(() => {
    if (overlayImage) {
      updateCanvas();
    }
  }, [userImage, overlayImage, scale]);
  
  // Handle download
  const handleDownload = async () => {
    if (!canvasRef.current || !composedImage) return;
    
    setIsProcessing(true);
    try {
      // Optimize for Instagram
      await optimizeForInstagram(canvasRef.current);
      
      // Download the image
      downloadImage(composedImage);
      toast.success("Imagem guardada com sucesso");
    } catch (error) {
      toast.error("Falha ao descarregar a imagem");
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
  
  // Reset zoom
  const handleReset = () => {
    setScale(1);
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Preview Area */}
        <div 
          ref={containerRef}
          className={`relative w-full max-w-sm mx-auto lg:mx-0 aspect-[4/5] border rounded-2xl overflow-hidden
                      bg-secondary/30 shadow-lg transition-all duration-300`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Canvas for compositing */}
          <canvas 
            ref={canvasRef}
            className="hidden"
            width={FEED_CANVAS_DIMENSIONS.width}
            height={FEED_CANVAS_DIMENSIONS.height}
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
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-2 border-primary rounded-full border-t-transparent"></div>
                <p>A carregar pré-visualização...</p>
              </div>
            </div>
          )}
          
          {/* Upload indicator overlay */}
          {!userImage && !isProcessing && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-all duration-300 hover:bg-black/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground">Solte a sua foto aqui</p>
                <p className="text-sm text-muted-foreground">ou clique para procurar</p>
              </div>
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Gerador de Imagens para Feed</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:px-0">
              Crie imagens para o Feed do Instagram posicionando a sua foto dentro do frame do evento Saia do Caixão.
            </p>
          </div>
          
          {userImage ? (
            <div className="space-y-6 animate-fade-in">
              {/* Zoom Controls */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Tamanho da Imagem
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
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    className="flex-1"
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
              
              {/* Reset zoom button */}
              <div className="rounded-lg p-4 bg-secondary/50">
                <button 
                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Repor zoom
                </button>
              </div>
              
              {/* Download Button */}
              <button
                className="btn-primary w-full mt-4 py-4"
                onClick={handleDownload}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    A processar...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Descarregar Imagem para Feed
                  </span>
                )}
              </button>
              
              {/* Upload Another */}
              <div className="text-center">
                <button
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Carregar outra foto
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 border border-dashed rounded-lg bg-secondary/30">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Carregue uma imagem para criar a sua confirmação para Instagram Feed.
                  </p>
                  <button
                    className="btn-primary w-full mt-4" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      Selecionar Imagem
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Requisitos:</h3>
                <ul className="text-sm space-y-1.5 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Formato de imagem JPG ou PNG</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Tamanho do ficheiro inferior a 10MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Melhores resultados com fotos em formato retrato</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
