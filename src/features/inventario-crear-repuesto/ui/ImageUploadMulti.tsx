import { useState, useRef } from "react";
import { Upload, Camera, X, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, useIsMobile } from "@/shared/lib";
import { toast } from "sonner";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploadMultiProps {
  onImagesChange?: (files: File[]) => void;
  maxImages?: number;
  accept?: string;
}

export function ImageUploadMulti({
  onImagesChange,
  maxImages = 10,
  accept = "image/*",
}: ImageUploadMultiProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Por favor selecciona archivos de imagen válidos");
      return;
    }

    setImages((prev) => {
      const remainingSlots = maxImages - prev.length;
      if (remainingSlots <= 0) {
        toast.error(`Máximo ${maxImages} imágenes permitidas`);
        return prev;
      }

      const filesToAdd = imageFiles.slice(0, remainingSlots);
      const newImages: ImageFile[] = filesToAdd.map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
      }));

      const updatedImages = [...prev, ...newImages];
      
      // Notify parent
      if (onImagesChange) {
        onImagesChange(updatedImages.map((img) => img.file));
      }
      
      // Mostrar la primera de las nuevas imágenes
      if (prev.length > 0) {
        setCurrentIndex(prev.length);
      }
      
      return updatedImages;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      
      // Actualizar índice
      if (newImages.length === 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prevIdx) => Math.min(prevIdx, newImages.length - 1));
      }
      
      // Notificar al padre
      if (onImagesChange) {
        onImagesChange(newImages.map((img) => img.file));
      }
      
      return newImages;
    });
  };

  const clearAll = () => {
    setImages([]);
    setCurrentIndex(0);
    if (onImagesChange) {
      onImagesChange([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const scrollPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (canAddMore) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          !canAddMore && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={true}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        
        {isMobile && (
          <input
            type="file"
            accept={accept}
            capture="environment"
            multiple={true}
            ref={cameraInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        )}

        <div className="flex flex-col items-center justify-center gap-3">
          <div className={cn(
            "p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
            isDragging && "bg-primary/20 border-primary/40 scale-110"
          )}>
            <Upload className={cn(
              "h-8 w-8 text-primary transition-transform",
              isDragging && "scale-110"
            )} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? "Suelta las imágenes aquí" : "Arrastra y suelta imágenes"}
            </p>
            <p className="text-sm text-muted-foreground">
              o haz clic para seleccionar
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ImageIcon className="h-3 w-3" />
            <span>PNG, JPG, WEBP hasta {maxImages} imágenes</span>
          </div>
        </div>
      </div>

      {/* Mobile Buttons */}
      {isMobile && canAddMore && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            Galería
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Cámara
          </button>
        </div>
      )}

      {/* Image Carousel Preview */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Imágenes seleccionadas ({images.length}/{maxImages})
            </h3>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-colors"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar todo
            </button>
          </div>

          {/* Carousel */}
          <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border">
            {/* Main Image */}
            <div className="relative aspect-video max-h-[300px] mx-auto rounded-lg overflow-hidden bg-background/50">
              {images[currentIndex] && (
                <img
                  src={images[currentIndex].preview}
                  alt={`Imagen ${currentIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Image Counter Badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                className="absolute top-3 left-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border-0 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (images[currentIndex]) {
                    removeImage(images[currentIndex].id);
                  }
                }}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border-0 transition-colors",
                      currentIndex === 0 && "opacity-30 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollPrev();
                    }}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border-0 transition-colors",
                      currentIndex === images.length - 1 && "opacity-30 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollNext();
                    }}
                    disabled={currentIndex === images.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentIndex
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-muted-foreground/30"
                    )}
                  >
                    <img
                      src={img.preview}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
