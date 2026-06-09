import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '../../config';
import { httpMethods } from '../../services/httpMethods';
import { API_ENDPOINTS } from '../../services/httpEndpoint';
import Breadcrumb from '../../components/shared/Breadcrumb';

const PORTFOLIO_LS_KEY = 'admin_portfolio_items';

const INITIAL = {
  title: '',
  shortDescription: '',
  projectOverview: '',
  location: '',
  type: '',
  area: '',
  duration: '',
  budget: '',
  features: '',
};

const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'SINGLE_FAMILY_HOME', label: 'Single Family Home' },
  { value: 'TOWNHOMES', label: 'Townhomes' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const mapPortfolioResponseToItem = (portfolio) => ({
  id: portfolio.id,
  title: portfolio.title,
  shortDescription: portfolio.description,
  projectOverview: portfolio.projectOverview,
  location: portfolio.location,
  type: portfolio.propertyType,
  area: portfolio.area,
  duration: portfolio.duration,
  budget: portfolio.budget,
  image: portfolio.gallery?.[0]?.url || '',
  gallery: portfolio.gallery ?? [],
});

const Field = ({ label, children }) => (
  <div className='flex flex-col gap-1.5'>
    <label className='text-sm font-medium text-gray-700'>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-200 rounded-md px-3.5 py-2.5 text-base text-gray-700 placeholder:text-gray-400 focus:outline-hidden focus:border-orange-400 transition-colors ${
      props.className ?? ''
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`border border-gray-200 rounded-md px-3.5 py-2.5 text-base text-gray-700 placeholder:text-gray-400 focus:outline-hidden focus:border-orange-400 transition-colors min-h-24 ${
      props.className ?? ''
    }`}
  />
);

const UploadBox = ({
  title = 'Drag and drop photos here',
  buttonLabel = 'Upload Photos',
  accept = 'image/*',
  onFileSelect,
}) => {
  const inputRef = React.useRef(null);
  return (
    <div className='border border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center gap-2 bg-gray-50/40'>
      <div className='w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center'>
        <UploadCloud size={20} className='text-gray-500' aria-hidden='true' />
      </div>
      <p className='text-base font-semibold text-gray-800'>{title}</p>
      <p className='text-sm text-gray-500'>
        Or click to browse from your computer
      </p>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple
        className='hidden'
        onChange={(e) => onFileSelect && onFileSelect(e.target.files)}
      />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        className='mt-2 bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-orange-600 transition-colors cursor-pointer'
      >
        {buttonLabel}
      </button>
      <p className='text-xs text-gray-400 mt-1'>
        JPEG, PNG • Max 20 photos • 1920×1080px recommended
      </p>
    </div>
  );
};

const Gallery = ({ images, onRemove }) => (
  <div>
    <p className='text-sm font-medium text-gray-800 mb-2'>
      Uploaded Gallery ({images.length})
    </p>
    <div className='flex gap-3 flex-wrap'>
      {images.map((src, i) => (
        <div
          key={src}
          className='relative w-40 h-28 rounded-md overflow-hidden border border-gray-200'
        >
          <img src={src} alt='' className='w-full h-full object-cover' />
          <button
            type='button'
            aria-label='Remove image'
            onClick={() => onRemove(i)}
            className='absolute top-1 right-1 w-5 h-5 rounded-sm bg-red-500 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer'
          >
            <Trash2 size={12} />
          </button>
          {i === 0 && (
            <span className='absolute bottom-0 left-0 right-0 bg-navy text-white text-xs font-semibold text-center py-0.5'>
              MAIN IMAGE
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const AddPortfolio = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [gallery, setGallery] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhotoUpload = (files) => {
    const fileArr = Array.from(files || []);
    const urls = fileArr.map((f) => URL.createObjectURL(f));
    setGallery((prev) => [...prev, ...urls]);
    setGalleryFiles((prev) => [...prev, ...fileArr]);
  };

  const handleRemovePhoto = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a portfolio title.');
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('description', form.shortDescription.trim());
    payload.append('projectOverview', form.projectOverview.trim());
    payload.append('location', form.location.trim());
    payload.append('propertyType', form.type.trim());
    payload.append('area', form.area.trim());
    payload.append('duration', form.duration.trim());
    payload.append('featuredHighlight', form.features.trim());
    payload.append('budget', form.budget.trim());

    galleryFiles.forEach((file) => payload.append('images', file));

    const { data, error } = await httpMethods.post(
      API_ENDPOINTS.PORTFOLIOS.CREATE,
      payload,
      { headers: { 'Content-Type': undefined } },
    );

    setIsSubmitting(false);

    if (error || !data?.data) {
      const backendMsg = error?.data?.message || error?.message;
      toast.error(backendMsg || 'Failed to create portfolio. Please try again.');
      return;
    }

    const createdPortfolio = data.data;
    const newItem = mapPortfolioResponseToItem(createdPortfolio);

    try {
      const stored = localStorage.getItem(PORTFOLIO_LS_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(
        PORTFOLIO_LS_KEY,
        JSON.stringify([newItem, ...existing]),
      );
    } catch {
      // ignore
    }

    toast.success('Portfolio added successfully!');
    navigate(ROUTES.ADMIN_PORTFOLIO);
  };

  return (
    <div className='space-y-5'>
      <Breadcrumb
        items={[
          { label: 'Portfolio', to: ROUTES.ADMIN_PORTFOLIO },
          { label: 'Add Portfolio' },
        ]}
      />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Add Portfolio
          </h1>
          <p className='text-gray-500 text-base mt-1'>Add new portfolio</p>
        </div>
        <button
          type='button'
          className='bg-orange-500 text-white text-sm sm:text-base font-semibold px-5 py-2.5 rounded-md hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto'
        >
          Add New Portfolio
        </button>
      </div>

      {/* Row 1 -- Title & Short Description */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <Field label='Portfolio Title'>
          <Input
            placeholder='The Skyline Penthouse'
            value={form.title}
            onChange={onChange('title')}
          />
        </Field>
        <Field label='Short description'>
          <Input
            placeholder='A premium renovation project that transformed a dated 1950s...'
            value={form.shortDescription}
            onChange={onChange('shortDescription')}
          />
        </Field>
      </div>

      {/* Project Overview */}
      <Field label='Project Overview'>
        <Textarea
          placeholder='Describe the overall project scope and goals...'
          value={form.projectOverview}
          onChange={onChange('projectOverview')}
        />
      </Field>

      {/* Location / Type / Area */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <Field label='Location'>
          <Input
            placeholder='Highland Lake'
            value={form.location}
            onChange={onChange('location')}
          />
        </Field>
        <Field label='Type'>
          <select
            value={form.type}
            onChange={onChange('type')}
            className='border border-gray-200 rounded-md px-3.5 py-2.5 text-base text-gray-700 bg-white focus:outline-hidden focus:border-orange-400 transition-colors cursor-pointer w-full'
          >
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'placeholder'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label='Area'>
          <Input
            placeholder='e.g. 3,400 sqft'
            value={form.area}
            onChange={onChange('area')}
          />
        </Field>
      </div>

      {/* Duration / Budget */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <Field label='Duration'>
          <Input
            placeholder='e.g. 6 Months'
            value={form.duration}
            onChange={onChange('duration')}
          />
        </Field>
        <Field label='Budget'>
          <Input
            placeholder='e.g. $280,000'
            value={form.budget}
            onChange={onChange('budget')}
          />
        </Field>
      </div>

      {/* Features */}
      <Field label='Features'>
        <Textarea
          placeholder='e.g. Open floor plan, marble countertops, rooftop terrace...'
          value={form.features}
          onChange={onChange('features')}
        />
      </Field>

      {/* Project Gallery */}
      <div className='bg-white border border-gray-200 rounded-lg p-5'>
        <h2 className='font-serif text-lg sm:text-xl font-bold text-gray-900 mb-1'>
          Project Gallery
        </h2>
        <p className='text-sm text-gray-500 mb-4'>
          High-quality photos increase your chances of selling by 40%.
        </p>
        <UploadBox onFileSelect={handlePhotoUpload} />
      </div>

      <Gallery images={gallery} onRemove={handleRemovePhoto} />

      {/* Actions */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2'>
        <button
          type='button'
          onClick={() => navigate(ROUTES.ADMIN_PORTFOLIO)}
          className='bg-navy text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-full hover:bg-navy-hover transition-colors cursor-pointer'
        >
          Cancel
        </button>
        <button
          type='button'
          disabled={isSubmitting}
          className='bg-orange-500 text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          onClick={handleSave}
        >
          {isSubmitting ? 'Saving...' : 'Save Change'}
        </button>
      </div>
    </div>
  );
};
export default AddPortfolio;
