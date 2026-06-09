import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import AnimatedButton from '../shared/AnimatedButton';
import { ROUTES } from '../../config';
import httpMethods from '../../services/httpMethods';
import { API_ENDPOINTS } from '../../services/httpEndpoint';

const ASSETS = {
  beforeImg: '/Portfolio/beforeImg.webp',
  afterImg: '/Portfolio/afterImg.webp',
  featuredImg: '/Portfolio/featuredImg.webp',
  img1: '/Portfolio/img1.webp',
  img2: '/Portfolio/img2.webp',
  img3: '/Portfolio/img3.webp',
  img4: '/Portfolio/img4.webp',
  img5: '/Portfolio/img5.webp',
  img6: '/Portfolio/img6.webp',
};

const CASE_STUDIES = [
  {
    id: 1,
    primaryTag: 'The SkyLine Penthouse',
    secondaryTag: 'Coastal Modern Estate',
    categoryTag: 'Luxury Residential',
    title: 'The Skyline Penthouse',
    description:
      'A complete transformation of a dated 1980s penthouse into a modern masterpiece. We focused on open-concept living and premium materials.',
    images: [
      { src: ASSETS.featuredImg, label: 'After' },
      { src: ASSETS.beforeImg, label: 'Before' },
      { src: ASSETS.afterImg, label: 'After' },
      { src: ASSETS.img1, label: 'Interior' },
      { src: ASSETS.img2, label: 'Living Room' },
      { src: ASSETS.img3, label: 'Exterior' },
    ],
    bgColor: 'bg-blue-tint',
    reverse: false,
  },
  {
    id: 2,
    primaryTag: 'Oceanfront Luxury',
    secondaryTag: 'Modern Living',
    categoryTag: 'Luxury Residential',
    title: 'The Ocean View Residence',
    description:
      'A stunning beachfront property designed with open spaces, natural lighting, and panoramic ocean views. This project blends modern architecture with a calm coastal lifestyle.',
    images: [
      { src: ASSETS.featuredImg, label: 'After' },
      { src: ASSETS.beforeImg, label: 'Before' },
      { src: ASSETS.afterImg, label: 'After' },
      { src: ASSETS.img4, label: 'Pool Area' },
      { src: ASSETS.img5, label: 'Bedroom' },
      { src: ASSETS.img6, label: 'Terrace' },
    ],
    bgColor: 'bg-violet-tint',
    reverse: true,
  },
];

const AUTO_SLIDE_INTERVAL = 4000;

// ---------------------------------------------------------------------------
// ImageCarousel
// ---------------------------------------------------------------------------
const ImageCarousel = memo(({ images }) => {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const centerRef = useRef(null);
  const autoSlideRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const startAutoSlide = useCallback(() => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, AUTO_SLIDE_INTERVAL);
  }, [images.length]);

  const stopAutoSlide = useCallback(() => {
    clearInterval(autoSlideRef.current);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide]);

  useEffect(() => {
    if (!centerRef.current) return;
    gsap.fromTo(
      centerRef.current,
      { opacity: 0, scale: 0.94, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out' },
    );
    gsap.fromTo(
      centerRef.current,
      { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      {
        boxShadow: '5px 8px 17px 0px rgba(0,0,0,0.25)',
        duration: 1.4,
        ease: 'power2.out',
      },
    );
    if (leftRef.current)
      gsap.fromTo(
        leftRef.current,
        { opacity: 0.4, x: -20 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.15 },
      );
    if (rightRef.current)
      gsap.fromTo(
        rightRef.current,
        { opacity: 0.4, x: 20 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.15 },
      );
  }, [active]);

  const handleSideClick = useCallback(
    (index, sideRef) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      stopAutoSlide();
      const otherSideRef = sideRef === leftRef ? rightRef : leftRef;
      const tl = gsap.timeline({
        onComplete: () => {
          setActive(index);
          gsap.set(sideRef.current, {
            scale: 1,
            zIndex: 0,
            x: 0,
            y: 0,
            opacity: 1,
          });
          if (otherSideRef.current)
            gsap.set(otherSideRef.current, {
              scale: 1,
              x: 0,
              y: 0,
              opacity: 1,
            });
          isAnimatingRef.current = false;
          startAutoSlide();
        },
      });
      tl.to(sideRef.current, {
        scale: 1.04,
        zIndex: 20,
        boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
        duration: 0.9,
        ease: 'expo.inOut',
      });
      tl.to(
        centerRef.current,
        { opacity: 0, scale: 0.96, y: 10, duration: 0.8, ease: 'expo.inOut' },
        '<0.1',
      );
      tl.to(
        otherSideRef.current,
        { opacity: 0.2, scale: 0.97, duration: 0.7, ease: 'power2.inOut' },
        '<',
      );
      tl.to(sideRef.current, {
        scale: 1,
        zIndex: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    },
    [startAutoSlide, stopAutoSlide],
  );

  const goTo = useCallback(
    (i) => {
      if (isAnimatingRef.current || i === active) return;
      isAnimatingRef.current = true;
      stopAutoSlide();
      const targets = [
        centerRef.current,
        leftRef.current,
        rightRef.current,
      ].filter(Boolean);
      gsap.to(targets, {
        opacity: 0,
        scale: 0.95,
        y: 6,
        duration: 0.45,
        ease: 'power2.inOut',
        stagger: 0.04,
        onComplete: () => {
          setActive(i);
          gsap.set(targets, { opacity: 1, scale: 1, y: 0 });
          isAnimatingRef.current = false;
          startAutoSlide();
        },
      });
    },
    [active, startAutoSlide, stopAutoSlide],
  );

  const leftIndex = active === 0 ? images.length - 1 : active - 1;
  const rightIndex = (active + 1) % images.length;

  return (
    <div
      ref={containerRef}
      className='relative w-full'
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      {/* Desktop */}
      <div className='hidden lg:block'>
        <div className='relative h-125 xl:h-135'>
          <div
            ref={leftRef}
            onClick={() => handleSideClick(leftIndex, leftRef)}
            className='absolute left-0 top-8 w-[42%] h-[85%] rounded-2xl overflow-hidden shadow-md z-0 cursor-pointer hover:shadow-lg transition-shadow'
          >
            <img
              src={images[leftIndex].src}
              alt={`Property -- ${images[leftIndex].label}`}
              className='size-full object-cover'
              loading='lazy'
            />
            <div className='absolute top-3 left-3 bg-white/80 px-4 py-1 rounded-full'>
              <span className='font-inter text-xs text-black'>
                {images[leftIndex].label}
              </span>
            </div>
          </div>
          <div
            ref={rightRef}
            onClick={() => handleSideClick(rightIndex, rightRef)}
            className='absolute right-0 top-8 w-[42%] h-[85%] rounded-2xl overflow-hidden shadow-md z-0 cursor-pointer hover:shadow-lg transition-shadow'
          >
            <img
              src={images[rightIndex].src}
              alt={`Property -- ${images[rightIndex].label}`}
              className='size-full object-cover'
              loading='lazy'
            />
            <div className='absolute top-3 right-3 bg-white/80 px-4 py-1 rounded-full'>
              <span className='font-inter text-xs text-black'>
                {images[rightIndex].label}
              </span>
            </div>
          </div>
          <div
            ref={centerRef}
            className='absolute left-1/2 -translate-x-1/2 top-0 w-[58%] h-full rounded-2xl overflow-hidden shadow-[5px_8px_17px_0px_rgba(0,0,0,0.25)] z-10'
          >
            <img
              src={images[active].src}
              alt={`Property -- ${images[active].label}`}
              className='size-full object-cover'
              loading='lazy'
            />
            <div className='absolute top-3 right-3 bg-white/80 px-4 py-1 rounded-full'>
              <span className='font-inter text-xs text-black'>
                {images[active].label}
              </span>
            </div>
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
              {images.map((_, i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === active ? 'true' : undefined}
                  className={`rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-white ${i === active ? 'bg-dot-inactive w-10.75 h-3.25' : 'bg-white size-3'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className='lg:hidden'>
        <div className='relative rounded-2xl overflow-hidden aspect-video w-full shadow-md'>
          <img
            src={images[active].src}
            alt={`Property -- ${images[active].label}`}
            className='size-full object-cover'
            loading='lazy'
          />
          <div className='absolute top-3 left-3 bg-white/80 px-4 py-1 rounded-full'>
            <span className='font-inter text-xs text-black'>
              {images[active].label}
            </span>
          </div>
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
                className={`rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-white ${i === active ? 'bg-dot-inactive w-10.75 h-3.25' : 'bg-white size-3'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
ImageCarousel.displayName = 'ImageCarousel';

// ---------------------------------------------------------------------------
// Tag variants
// ---------------------------------------------------------------------------
const DarkTag = memo(({ label }) => (
  <span className='bg-slate-800 text-white font-inter text-sm leading-normal px-5 py-2.5 rounded-full whitespace-nowrap'>
    {label}
  </span>
));
DarkTag.displayName = 'DarkTag';

// ---------------------------------------------------------------------------
// CaseStudyCard
// ---------------------------------------------------------------------------
const CaseStudyCard = memo(
  ({
    id,
    primaryTag,
    secondaryTag,
    categoryTag,
    title,
    description,
    images,
    bgColor,
    reverse,
  }) => {
    const textBlock = (
      <div className='flex flex-col gap-8 w-full lg:w-[45%] xl:w-[40%] shrink-0'>
        <div className='flex flex-wrap gap-3 items-center'>
          <DarkTag label={primaryTag} />
          <DarkTag label={secondaryTag} />
          <DarkTag label={categoryTag} />
        </div>
        <h2 className='font-playfair text-black text-3xl lg:text-4xl xl:text-[40px] font-normal leading-tight'>
          {title}
        </h2>
        <p className='font-inter text-gray-500 text-base lg:text-lg leading-relaxed'>
          {description}
        </p>
        <div>
          <AnimatedButton
            to={ROUTES.CASE_STUDY_DETAIL.replace(':id', id)}
            className='inline-flex items-center gap-2.5 bg-orange-500 text-white font-inter text-base font-normal px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-orange-500'
          >
            View Full Case Study
            <ArrowUpRight size={18} aria-hidden='true' />
          </AnimatedButton>
        </div>
      </div>
    );

    const carouselBlock = (
      <div className='flex-1 min-w-0 w-full'>
        <ImageCarousel images={images} />
      </div>
    );

    return (
      <section className={`${bgColor} py-14 lg:py-20`}>
        <div className='max-w-384 mx-auto px-4 sm:px-8 lg:px-12'>
          <div className='flex flex-col lg:flex-row gap-10 xl:gap-14 items-center'>
            {reverse ? (
              <>
                {carouselBlock}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {carouselBlock}
              </>
            )}
          </div>
        </div>
      </section>
    );
  },
);
CaseStudyCard.displayName = 'CaseStudyCard';

// ---------------------------------------------------------------------------
// CaseStudiesSection
// ---------------------------------------------------------------------------
const CaseStudiesSection = memo(() => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const { data, error } = await httpMethods.get(API_ENDPOINTS.PORTFOLIOS.LIST);
        if (!error && data?.success && data?.data?.portfolios) {
          const apiPortfolios = data.data.portfolios.map((item, index) => ({
            id: item.id,
            primaryTag: item.propertyType || 'Portfolio',
            secondaryTag: item.location || 'Location',
            categoryTag: item.area || 'Area',
            title: item.title,
            description: item.description,
            images: item.gallery?.length > 0
              ? item.gallery.map((g, i) => ({ src: g.url, label: `Image ${i + 1}` }))
              : [{ src: ASSETS.featuredImg, label: 'Default Image' }],
            bgColor: index % 2 === 0 ? 'bg-blue-tint' : 'bg-violet-tint',
            reverse: index % 2 !== 0,
          }));
          setPortfolios(apiPortfolios);
        } else {
          setPortfolios(CASE_STUDIES);
        }
      } catch (err) {
        console.error("Failed to fetch portfolios:", err);
        setPortfolios(CASE_STUDIES);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      {portfolios.length > 0 ? (
        portfolios.map((cs) => <CaseStudyCard key={cs.id} {...cs} />)
      ) : (
        <div className="text-center py-20 text-gray-500">No portfolios available.</div>
      )}
    </>
  );
});
CaseStudiesSection.displayName = 'CaseStudiesSection';

export default CaseStudiesSection;
