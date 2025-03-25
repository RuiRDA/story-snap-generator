
/**
 * Utility functions for image processing
 */

// Safe zone coordinates - these define where user photos can appear
export const SAFE_ZONES = {
  center: {
    x: 136, // starting x position
    y: 134, // starting y position
    width: 810, // width of the safe zone
    height: 922, // height of the safe zone
  }
};

// Image overlay dimensions
export const FEED_CANVAS_DIMENSIONS = {
  width: 1080,
  height: 1350,
};


// Strip EXIF data from image by redrawing it on a canvas
export const stripExifData = (
  file: File
): Promise<{ blob: Blob; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Create canvas with same dimensions as image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas (this strips EXIF data)
        ctx.drawImage(img, 0, 0);
        
        // Get data URL and blob
        const dataUrl = canvas.toDataURL("image/png");
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          resolve({ blob, dataUrl });
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = event.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

// Validate file is an image and under size limit
export const validateImageFile = (file: File): string | null => {
  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    return "File must be an image (jpg, png)";
  }

  // Check if file is too large (10MB limit)
  const TEN_MB = 10 * 1024 * 1024;
  if (file.size > TEN_MB) {
    return "Image must be under 10MB";
  }

  return null;
};

// Compose the final image with user photo and overlay
export const composeImage = (
  canvas: HTMLCanvasElement,
  userImage: HTMLImageElement,
  overlay: HTMLImageElement,
  scale: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas dimensions to match Instagram story dimensions
      canvas.width = FEED_CANVAS_DIMENSIONS.width;
      canvas.height = FEED_CANVAS_DIMENSIONS.height;

      // Get safe zone dimensions
      const safeZone = SAFE_ZONES.center;
      
      // Save the current context state
      ctx.save();
      
      // Create a clipping path for the safe zone
      ctx.beginPath();
      ctx.rect(safeZone.x, safeZone.y, safeZone.width, safeZone.height);
      ctx.clip();
      
      // Calculate dimensions to cover the safe zone while maintaining aspect ratio
      const aspectRatio = userImage.width / userImage.height;
      let drawWidth, drawHeight;
      
      if (safeZone.width / safeZone.height > aspectRatio) {
        // Safe zone is wider than image (relative to heights)
        // In this case, we need to match the width and let height overflow
        drawWidth = safeZone.width;
        drawHeight = drawWidth / aspectRatio;
      } else {
        // Safe zone is taller than image (relative to widths)
        // In this case, we need to match the height and let width overflow
        drawHeight = safeZone.height;
        drawWidth = drawHeight * aspectRatio;
      }
      
      // Apply scaling
      drawWidth *= scale;
      drawHeight *= scale;
      
      // Calculate the center position of the safe zone
      const centerX = safeZone.x + safeZone.width / 2;
      const centerY = safeZone.y + safeZone.height / 2;
      
      // Draw the image centered in the safe zone
      // No offset is applied as we're centering the image at specific coordinates
      ctx.drawImage(
        userImage,
        centerX - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
      );
      
      // Restore the context to remove clipping
      ctx.restore();
      
      // Draw the overlay
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
      
      // Return the data URL
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

// Download the composed image
export const downloadImage = (dataUrl: string, filename: string = "MetodoIP_Confirmation.png") => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Optimize the final image for Instagram (ensure it's under 3MB)
export const optimizeForInstagram = (
  canvas: HTMLCanvasElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Start with high quality
    let quality = 0.9;
    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          
          // If size is under 3MB, resolve
          const THREE_MB = 3 * 1024 * 1024;
          if (blob.size <= THREE_MB) {
            resolve(blob);
            return;
          }
          
          // If quality is already very low, give up and return what we have
          if (quality < 0.5) {
            resolve(blob);
            return;
          }
          
          // Reduce quality and try again
          quality -= 0.1;
          tryCompress();
        },
        "image/png",
        quality
      );
    };
    
    tryCompress();
  });
};
