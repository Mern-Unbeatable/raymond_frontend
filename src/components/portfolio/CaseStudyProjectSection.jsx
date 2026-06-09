import React, { memo } from 'react';
import {
  MapPin,
  Home,
  Maximize2,
  CalendarDays,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const OVERVIEW_PARAGRAPHS = [
  'The Skyline Penthouse project was designed to completely redefine urban luxury living. The existing structure was outdated and lacked functionality, but with a clear vision and expert planning, we transformed it into a contemporary masterpiece.',
  'Our team focused on maximizing natural light, creating open spaces, and integrating modern materials to deliver a high-end lifestyle experience.',
];

const DetailItem = memo(({ icon: Icon, label, value }) => (
  <div className='flex flex-col items-center gap-2 text-white min-w-0'>
    <Icon size={24} aria-hidden='true' className='text-white/80 shrink-0' />
    <div className='flex flex-col items-center text-center gap-1'>
      <span className='font-inter font-normal text-xs sm:text-sm text-white/70 tracking-wide uppercase'>
        {label}
      </span>
      <span className='font-inter font-semibold text-base sm:text-lg leading-snug'>
        {value}
      </span>
    </div>
  </div>
));
DetailItem.displayName = 'DetailItem';

const CaseStudyProjectSection = memo(({ portfolio }) => {
  const overview = portfolio?.projectOverview
    ? portfolio.projectOverview.split('\n').filter(p => p.trim() !== '')
    : OVERVIEW_PARAGRAPHS;

  const details = [
    { icon: MapPin, label: 'Location', value: portfolio?.location || 'Lagos, NG' },
    { icon: Home, label: 'Type', value: portfolio?.propertyType || 'Penthouse' },
    { icon: Maximize2, label: 'Area', value: portfolio?.area || '3,200 sqft' },
    { icon: CalendarDays, label: 'Duration', value: portfolio?.duration || '6 Months' },
    { icon: DollarSign, label: 'Budget', value: portfolio?.budget || '$850,000' },
  ];
  
  if (portfolio?.roi) {
    details.push({ icon: TrendingUp, label: 'ROI', value: portfolio.roi });
  } else if (!portfolio) {
    details.push({ icon: TrendingUp, label: 'ROI', value: '35%' });
  }

  return (
    <>
      <section className='bg-white py-10 lg:py-14'>
        <div className='max-w-384 mx-auto px-4 sm:px-8 lg:px-12'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-16 items-start'>
            <div className='flex flex-col gap-2 shrink-0 lg:w-64 xl:w-72'>
              <p className='font-inter font-medium text-orange-warm text-sm lg:text-base'>
                The Vision
              </p>
              <div className='flex flex-col gap-2'>
                <h2 className='font-playfair font-bold text-slate-900 text-2xl lg:text-3xl leading-tight'>
                  Project Overview
                </h2>
                <div className='h-0.5 w-20 bg-orange-500' aria-hidden='true' />
              </div>
            </div>
            <div className='flex flex-col gap-4 flex-1 min-w-0'>
              {overview.map((para, i) => (
                <p
                  key={i}
                  className='font-inter text-slate-700 text-sm lg:text-base leading-relaxed'
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className='bg-panel-navy py-8 lg:py-10'
        aria-label='Project details'
      >
        <div className='max-w-384 mx-auto px-4 sm:px-8 lg:px-12'>
          <div className='flex flex-wrap justify-center gap-8 sm:gap-12 lg:gap-16'>
            {details.map((detail) => (
              <div key={detail.label} className='flex-1 min-w-[130px] max-w-[180px] flex justify-center'>
                <DetailItem {...detail} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
});

CaseStudyProjectSection.displayName = 'CaseStudyProjectSection';

export default CaseStudyProjectSection;
