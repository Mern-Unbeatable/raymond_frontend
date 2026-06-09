import React, { memo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Static assets
// ---------------------------------------------------------------------------
const ASSETS = {
  mainImage:
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  interior1:
    "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=600&q=80",
  interior2:
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=600&q=80",
  interior3:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
};

// ---------------------------------------------------------------------------
// PhotoGalleryRow -- 1 large image (left) + 2×2 small grid (right)
// ---------------------------------------------------------------------------
const PhotoGalleryRow = memo(({ showBadge = false, mainImage, gridImages }) => {
  const grid = gridImages ?? [
    ASSETS.interior1,
    ASSETS.interior2,
    ASSETS.interior3,
    ASSETS.interior3,
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="relative bg-slate-200 rounded-xl overflow-hidden h-64 sm:h-80 md:h-full md:min-h-80 lg:min-h-90 xl:min-h-115">
        <img
          src={mainImage || ASSETS.mainImage}
          alt="Property exterior"
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
        {showBadge && (
          <div className="absolute top-0 left-0 bg-red-500 px-4 py-2 rounded-tl-xl">
            <span className="font-inter font-medium text-base text-white tracking-tight">
              15% Off
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-3 h-64 sm:h-80 md:h-full md:min-h-80 lg:min-h-90 xl:min-h-115">
        {grid.map((src, i) => (
          <div
            key={i}
            className="relative bg-slate-200 rounded-xl overflow-hidden h-full"
          >
            <img
              src={src}
              alt="Interior view"
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
PhotoGalleryRow.displayName = "PhotoGalleryRow";

// ---------------------------------------------------------------------------
// PhotoGallerySection -- shows only uploaded API images, no static fillers
// ---------------------------------------------------------------------------
const PhotoGallerySection = memo(({ images, showBadge = false }) => {
  const safeImages = Array.isArray(images) ? images : [];
  const mainImage = safeImages[0]?.url ?? null;
  // all other uploaded images for the right grid
  const gridImages = safeImages.slice(1);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIndex(
      (prev) => (prev - 1 + safeImages.length) % safeImages.length,
    );
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  return (
    <section className="py-8 lg:py-10 bg-white">
      <div className="max-w-384 mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:h-[400px] lg:h-[500px]">
          {/* Main image */}
          <div
            className="relative bg-slate-200 rounded-xl overflow-hidden h-64 sm:h-80 md:h-full cursor-pointer"
            onClick={() => mainImage && setSelectedIndex(0)}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt="Property exterior"
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-inter">
                No image uploaded
              </div>
            )}
            {showBadge && (
              <div className="absolute top-0 left-0 bg-red-500 px-4 py-2 rounded-tl-xl">
                <span className="font-inter font-medium text-base text-white tracking-tight">
                  15% Off
                </span>
              </div>
            )}
          </div>

          {/* Right grid — only rendered when there are extra uploaded images */}
          {gridImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3 h-64 sm:h-80 md:h-full overflow-y-auto pr-1">
              {gridImages.map((img, i) => (
                <div
                  key={img.id ?? i}
                  className="relative bg-slate-200 rounded-xl overflow-hidden min-h-[120px] sm:min-h-[160px] md:min-h-[180px] cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setSelectedIndex(i + 1)}
                >
                  <img
                    src={img.url}
                    alt="Property interior view"
                    className="absolute inset-0 size-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && safeImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={handleClose}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
            onClick={handleClose}
          >
            <X size={24} />
          </button>

          {safeImages.length > 1 && (
            <button
              className="absolute left-4 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
              onClick={handlePrev}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div
            className="relative max-w-5xl w-full max-h-[85vh] px-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[selectedIndex]?.url}
              alt="Property fullscreen view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-10 left-0 right-0 text-center text-white/70 font-inter text-sm">
              {selectedIndex + 1} / {safeImages.length}
            </div>
          </div>

          {safeImages.length > 1 && (
            <button
              className="absolute right-4 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
              onClick={handleNext}
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </section>
  );
});

PhotoGallerySection.displayName = "PhotoGallerySection";

export default PhotoGallerySection;
