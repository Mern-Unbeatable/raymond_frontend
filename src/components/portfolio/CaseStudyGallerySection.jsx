import React, { memo } from "react";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80",
];

const CaseStudyGallerySection = memo(({ portfolio }) => {
  const images = portfolio?.gallery?.length > 0
    ? portfolio.gallery.map(g => g.url)
    : GALLERY_IMAGES;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-384 mx-auto px-4 sm:px-8 lg:px-12">
        <h2 className="font-playfair text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-6 lg:mb-10">
          Project Gallery
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1 rounded-2xl overflow-hidden">
          {images.map((src, i) => (
            <div
              key={i}
              className="overflow-hidden"
              style={{ aspectRatio: "1 / 1" }}
            >
              <img
                src={src}
                alt={`Project gallery image ${i + 1}`}
                className="size-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CaseStudyGallerySection.displayName = "CaseStudyGallerySection";

export default CaseStudyGallerySection;
