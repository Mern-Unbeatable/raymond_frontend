import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '../../config';
import { httpMethods } from '../../services/httpMethods';
import { API_ENDPOINTS } from '../../services/httpEndpoint';
import Breadcrumb from '../../components/shared/Breadcrumb';

const PORTFOLIO_LS_KEY = 'admin_portfolio_items';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=60',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=60',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=60',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=300&q=60',
];

const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'SINGLE_FAMILY_HOME', label: 'Single Family Home' },
  { value: 'TOWNHOMES', label: 'Townhomes' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

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

const EditPortfolio = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gallery, setGallery] = useState(GALLERY_IMAGES);
  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhotoUpload = (files) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setGallery((prev) => [...prev, ...urls]);
  };

  const handleRemovePhoto = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a portfolio title.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.shortDescription.trim(),
      projectOverview: form.projectOverview.trim(),
      location: form.location.trim(),
      propertyType: form.type.trim(),
      area: form.area.trim(),
      duration: form.duration.trim(),
      featuredHighlight: form.features.trim(),
      budget: form.budget.trim(),
    };

    setIsSubmitting(true);
    (async () => {
      const { data, error } = await httpMethods.put(
        API_ENDPOINTS.PORTFOLIOS.UPDATE(id),
        payload,
      );
      setIsSubmitting(false);
      if (error || !data) {
        const msg = error?.data?.message || error?.message || 'Update failed';
        toast.error(msg);
        return;
      }
      toast.success('Portfolio updated successfully!');
      navigate(ROUTES.ADMIN_PORTFOLIO);
    })();
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    (async () => {
      const { data, error } = await httpMethods.get(API_ENDPOINTS.PORTFOLIOS.BY_ID(id));
      if (!mounted) return;
      setIsLoading(false);
      if (error || !data?.data) {
        const msg = error?.data?.message || error?.message || 'Failed to load portfolio';
        toast.error(msg);
        return;
      }
      const p = data.data;
      setForm({
        title: p.title || '',
        shortDescription: p.description || '',
        projectOverview: p.projectOverview || '',
        location: p.location || '',
        type: p.propertyType || '',
        area: p.area || '',
        duration: p.duration || '',
        budget: p.budget || '',
        features: p.featuredHighlight || '',
      });
      setGallery((p.gallery || []).map((g) => g.url || g));
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className='space-y-5'>
      <Breadcrumb
        items={[
          { label: 'Portfolio', to: ROUTES.ADMIN_PORTFOLIO },
          { label: 'Edit Portfolio' },
        ]}
      />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Edit Portfolio
          </h1>
          <p className='text-gray-500 text-base mt-1'>
            View, edit, and update your portfolio case study.
          </p>
        </div>
      </div>

      {/* Row 1 -- Title & Short Description */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <Field label='Portfolio Title'>
          <Input value={form.title} onChange={onChange('title')} />
        </Field>
        <Field label='Short description'>
          <Input
            value={form.shortDescription}
            onChange={onChange('shortDescription')}
          />
        </Field>
      </div>

      {/* Project Overview */}
      <Field label='Project Overview'>
        <Textarea
          value={form.projectOverview}
          onChange={onChange('projectOverview')}
        />
      </Field>

      {/* Location / Type / Area */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <Field label='Location'>
          <Input value={form.location} onChange={onChange('location')} />
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
          <Input value={form.area} onChange={onChange('area')} />
        </Field>
      </div>

      {/* Duration / Budget */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <Field label='Duration'>
          <Input value={form.duration} onChange={onChange('duration')} />
        </Field>
        <Field label='Budget'>
          <Input value={form.budget} onChange={onChange('budget')} />
        </Field>
      </div>

      {/* Features */}
      <Field label='Features'>
        <Textarea value={form.features} onChange={onChange('features')} />
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
          onClick={handleSave}
          className='bg-orange-500 text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors cursor-pointer'
        >
          Save Change
        </button>
      </div>
    </div>
  );
};

export default EditPortfolio;
