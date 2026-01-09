"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { getHighQualityWasiImage, getThumbnailWasiImage } from "@/lib/utils/image-quality";
import { downloadImage } from "@/lib/utils/copy-download";

interface PropertyImageSliderProps {
  images: string[];
  title: string;
}

export default function PropertyImageSlider({
  images,
  title,
}: PropertyImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [downloading, setDownloading] = useState(false);
  const [downloadedIndex, setDownloadedIndex] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Precargar imágenes adyacentes para mejor rendimiento
  useEffect(() => {
    const preloadIndexes = [
      (currentIndex - 1 + images.length) % images.length,
      (currentIndex + 1) % images.length,
    ];
    
    preloadIndexes.forEach((index) => {
      if (!loadedImages.has(index)) {
        const img = new Image();
        img.src = images[index];
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, index]));
        };
      }
    });
  }, [currentIndex, images, loadedImages]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Navegación con teclado en pantalla completa
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, nextImage, prevImage]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    setDownloading(true);
    try {
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg';
      const filename = `${sanitizedTitle}_${index + 1}.${extension}`;
      
      await downloadImage(getHighQualityWasiImage(imageUrl), filename);
      setDownloadedIndex(index);
      setTimeout(() => setDownloadedIndex(null), 2000);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative w-full">
        {/* Slider Principal */}
        <div
          className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          {/* Imagen Principal */}
          <div className="relative w-full h-full">
            <img
              src={getHighQualityWasiImage(images[currentIndex])}
              alt={`${title} - Imagen ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading={currentIndex === 0 ? "eager" : "lazy"}
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
              }}
            />

            {/* Overlay con controles - visible en móvil, hover en desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity">
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevImage}
                  className="bg-white/90 active:bg-white p-1.5 sm:p-2"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="text-white text-xs sm:text-sm font-medium bg-black/50 px-2 sm:px-3 py-1 rounded">
                  {currentIndex + 1} / {images.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextImage}
                  className="bg-white/90 active:bg-white p-1.5 sm:p-2"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(images[currentIndex], currentIndex);
                }}
                disabled={downloading}
                className="p-1.5 sm:p-2 bg-black/50 active:bg-black/70 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Descargar imagen"
                title="Descargar imagen"
              >
                {downloadedIndex === currentIndex ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ) : (
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 sm:p-2 bg-black/50 active:bg-black/70 rounded-lg transition-colors"
                aria-label="Ver en pantalla completa"
                title="Ver en pantalla completa"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Indicadores de posición (siempre visibles en móvil) */}
            {images.length > 1 && images.length <= 10 && (
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`h-1 sm:h-1.5 rounded-full transition-all active:scale-110 ${
                      index === currentIndex
                        ? "w-5 sm:w-6 bg-white"
                        : "w-1 sm:w-1.5 bg-white/50"
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Botones de navegación (solo desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all active:scale-95"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-slate-900" />
              </button>
              <button
                onClick={nextImage}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all active:scale-95"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5 text-slate-900" />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas (solo si hay más de 1 imagen) - Optimizado para móvil */}
        {images.length > 1 && (
          <div className="mt-3 sm:mt-4 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4 md:mx-0 md:px-0">
            <div className="flex gap-1.5 sm:gap-2 pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                    index === currentIndex
                      ? "border-slate-900 scale-105 shadow-md"
                      : "border-slate-200 opacity-60 active:opacity-100"
                  }`}
                >
                  <img
                    src={getThumbnailWasiImage(image)}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index < 5 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de pantalla completa */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadImage(images[currentIndex], currentIndex);
              }}
              disabled={downloading}
              className="p-2 bg-white/20 active:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Descargar imagen"
              title="Descargar imagen"
            >
              {downloadedIndex === currentIndex ? (
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              ) : (
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-white/20 active:bg-white/30 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          <div
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getHighQualityWasiImage(images[currentIndex])}
              alt={`${title} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Controles en pantalla completa */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 active:bg-white/30 rounded-full transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 active:bg-white/30 rounded-full transition-colors"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm bg-black/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </>
  );
}

