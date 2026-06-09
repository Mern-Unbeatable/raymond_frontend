import React, { memo, useState, useCallback } from "react";
import { MapPin, Play, Home, BedDouble, Bath } from "lucide-react";
import toast from "react-hot-toast";
import { httpMethods } from "../../services/httpMethods";
import { API_ENDPOINTS } from "../../services/httpEndpoint";
import PropertiesCTA from "../shared/PropertiesCTA";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const ASSETS = {
  videoThumbnail:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
};

const PROPERTY = {
  title: "5 Bedroom Detached Duplex in Lekki Phase 1",
  address: "9 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
  listPrice: "$250,000,000",
  purchasePrice: "$850k",
  renovationCost: "50k",
  arv: "$1.1m",
  propertyType: "Semi detached",
  beds: 5,
  Bathrooms: 2,
  area: "1,800",
  description: [
    "Spacious loft in the heart of Chelsea. Exposed brick, high ceilings, and top-of-the-line appliances. Experience luxury living at its finest in this meticulously designed property. Every detail has been curated to provide the ultimate comfort and style. From the high-end finishes to the thoughtful layout, this home is perfect for both entertaining and quiet relaxation.",
    "The property features a sprawling open-plan living and dining area, adorned with premium marble flooring and bespoke light fixtures. The gourmet kitchen is a chef's dream, fully equipped with top-of-the-line integrated appliances, high-gloss cabinetry, and a spacious center island.",
    "Each of the five bedrooms is generously sized and features en-suite facilities with luxury fittings. The master suite is a private sanctuary, boasting a walk-in closet, a private balcony with scenic views, and a spa-like bathroom with a freestanding tub and walk-in rain shower.",
    "Additional features include a dedicated home office, a private cinema room, a swimming pool with an outdoor lounge area, a fully equipped gym, and automated gate systems with 24/7 security. Located within a secure gated community, this home provides both privacy and proximity to Lagos's finest dining and entertainment hubs.",
  ],
};

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  message: "",
};

// ---------------------------------------------------------------------------
// FeatureItem
// ---------------------------------------------------------------------------
const FeatureItem = memo(({ icon, value, label }) => (
  <div className="min-w-0 h-full bg-[rgba(0,31,61,0.05)] border border-[rgba(0,31,61,0.05)] rounded-xl flex flex-col items-center justify-center gap-1.5 py-4 px-3">
    {icon}
    <span className="font-inter font-bold text-blue-950 text-sm sm:text-base md:text-lg leading-5 md:leading-6 text-center wrap-break-word w-full">
      {value}
    </span>
    <span className="font-inter font-medium text-xs uppercase tracking-wide text-[rgba(0,31,61,0.6)] text-center wrap-break-word w-full">
      {label}
    </span>
  </div>
));
FeatureItem.displayName = "FeatureItem";

// ---------------------------------------------------------------------------
// ContactForm -- sticky agent card
// ---------------------------------------------------------------------------
const ContactForm = memo(({ propertyId }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) {
      next.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!form.phoneNumber.trim())
      next.phoneNumber = "Phone number is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    return next;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!propertyId) {
        toast.error("Property information is unavailable. Please try again.");
        return;
      }

      const next = validate();
      if (Object.keys(next).length > 0) {
        setErrors(next);
        return;
      }

      setIsSubmitting(true);
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        message: form.message.trim(),
      };

      const { error } = await httpMethods.post(
        API_ENDPOINTS.INQUIRIES.SEND(propertyId),
        payload,
      );

      setIsSubmitting(false);

      if (error) {
        toast.error(
          error.message || "Failed to send inquiry. Please try again.",
        );
        return;
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
      setErrors({});
      toast.success("Your inquiry has been sent successfully.");
    },
    [
      form.email,
      form.fullName,
      form.message,
      form.phoneNumber,
      propertyId,
      validate,
    ],
  );

  return (
    <aside className="w-full lg:w-96 xl:w-120 shrink-0 lg:sticky lg:top-24 self-start">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
        {submitted ? (
          <p
            role="status"
            className="text-green-600 text-sm font-inter text-center py-4"
          >
            Thank you! Your message has been sent.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {[
              {
                id: "fullName",
                label: "Full Name",
                type: "text",
                placeholder: "enter your full name",
              },
              {
                id: "email",
                label: "Email",
                type: "email",
                placeholder: "write your email address",
              },
              {
                id: "phoneNumber",
                label: "Phone Number",
                type: "tel",
                placeholder: "phone number",
              },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={id}
                  className="font-inter text-sm text-slate-900 font-medium"
                >
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={form[id]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  aria-describedby={errors[id] ? `${id}-err` : undefined}
                  aria-invalid={!!errors[id]}
                  className="border border-slate-200 rounded-lg h-12 px-3 text-sm text-slate-800 font-inter placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
                {errors[id] && (
                  <span
                    id={`${id}-err`}
                    role="alert"
                    className="text-xs text-red-600 font-inter"
                  >
                    {errors[id]}
                  </span>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="font-inter text-sm text-slate-900 font-medium"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="write your message"
                rows={4}
                aria-describedby={errors.message ? "message-err" : undefined}
                aria-invalid={!!errors.message}
                className="border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-800 font-inter placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
              {errors.message && (
                <span
                  id="message-err"
                  role="alert"
                  className="text-xs text-red-600 font-inter"
                >
                  {errors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white font-inter font-medium text-base py-3 rounded-lg hover:bg-orange-600 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
});
ContactForm.displayName = "ContactForm";

// ---------------------------------------------------------------------------
// PropertyInfoSection -- title/pricing/features/description/video + agent form
// ---------------------------------------------------------------------------
const formatPrice = (val) => {
  if (val == null || val === "") return null;
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  if (n >= 1000000) return `$${+(n / 1000000).toFixed(1)}m`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
};

const PropertyInfoSection = memo(({ property, isOffer = false }) => {
  const propertyId =
    property?.id ?? property?._id ?? property?.propertyId ?? null;
  const prop = {
    title: property?.title ?? property?.name ?? PROPERTY.title,
    address:
      property?.address ||
      [property?.streetAddress, property?.city, property?.state]
        .filter(Boolean)
        .join(", ") ||
      PROPERTY.address,
    listPrice:
      property?.askingPrice != null
        ? formatPrice(property.askingPrice)
        : property?.purchasePrice != null
          ? formatPrice(property.purchasePrice)
          : property?.price || null,
    purchasePrice:
      formatPrice(property?.purchasePrice) ?? PROPERTY.purchasePrice,
    renovationCost:
      formatPrice(
        property?.estimatedRenovationCost ?? property?.renovationCost,
      ) ?? PROPERTY.renovationCost,
    arv: formatPrice(property?.arv) ?? PROPERTY.arv,
    propertyType: property?.propertyType ?? PROPERTY.propertyType,
    beds: property?.bedrooms ?? property?.beds ?? PROPERTY.beds,
    Bathrooms: property?.bathrooms ?? property?.Bathrooms ?? PROPERTY.Bathrooms,
    area: property?.area ?? PROPERTY.area,
    description: property?.description
      ? Array.isArray(property.description)
        ? property.description
        : [property.description]
      : PROPERTY.description,
    video: (typeof property?.video === 'string' && property.video.trim() !== '' && property.video !== 'null' && property.video !== 'undefined') ? property.video : null,
  };

  return (
    <>
      <section className="pt-4 pb-8 lg:pt-5 lg:pb-10 bg-white">
        <div className="max-w-384 mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-12">
            {/* Left column -- property info */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <h1 className="font-playfair text-slate-900 text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight">
                    {prop.title}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <MapPin
                      size={14}
                      className="text-slate-800 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-inter font-medium text-slate-800 text-sm leading-5">
                      {prop.address}
                    </span>
                  </div>
                </div>

                {isOffer ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-inter font-normal text-slate-900 text-sm lg:text-base tracking-tight">
                      Purchase price:{" "}
                      <span className="font-medium">{prop.purchasePrice}</span>
                    </p>
                    <p className="font-inter font-normal text-slate-900 text-sm lg:text-base tracking-tight">
                      Estimated renovation cost:{" "}
                      <span className="font-medium">{prop.renovationCost}</span>
                    </p>
                    <p className="font-inter font-medium text-orange-500 text-base lg:text-lg tracking-tight">
                      ARV (after renovation value): {prop.arv}
                    </p>
                  </div>
                ) : prop.listPrice ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-inter font-medium text-slate-900 text-sm uppercase tracking-widest">
                      Price
                    </span>
                    <p className="font-inter font-bold text-primary text-2xl lg:text-3xl xl:text-4xl tracking-tight">
                      {prop.listPrice}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Features bar */}
              <div className="border-y border-[rgba(0,31,61,0.1)] py-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
                  <FeatureItem
                    icon={
                      <Home
                        className="size-6 shrink-0 text-slate-700"
                        aria-hidden="true"
                      />
                    }
                    value={prop.propertyType}
                    label="Property Type"
                  />
                  <FeatureItem
                    icon={
                      <BedDouble
                        className="size-5 shrink-0 text-slate-700"
                        aria-hidden="true"
                      />
                    }
                    value={String(prop.beds)}
                    label="Bedrooms"
                  />
                  <FeatureItem
                    icon={
                      <Bath
                        className="size-5 shrink-0 text-slate-700"
                        aria-hidden="true"
                      />
                    }
                    value={String(prop.Bathrooms)}
                    label="Bathrooms"
                  />
                  <FeatureItem
                    icon={
                      <div
                        className="border border-blue-950 rounded-sm size-5 shrink-0"
                        aria-hidden="true"
                      />
                    }
                    value={prop.area}
                    label="Square Ft"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-4">
                <h2 className="font-playfair text-blue-950 text-3xl lg:text-4xl font-bold">
                  Description
                </h2>
                <div className="flex flex-col gap-4">
                  {prop.description.map((para, i) => (
                    <p
                      key={i}
                      className="font-inter text-slate-800 text-base leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Video tour */}
              <div className="flex flex-col gap-4">
                <h2 className="font-inter font-semibold text-slate-900 text-xl lg:text-2xl">
                  Video Tour
                </h2>
                <div className="relative bg-slate-200 rounded-xl overflow-hidden aspect-video border border-slate-200">
                  {prop.video ? (
                    <video
                      src={prop.video}
                      controls
                      className="absolute inset-0 size-full object-cover"
                      poster={ASSETS.videoThumbnail}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-500 font-inter text-base sm:text-lg">
                      No video available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column -- sticky agent form */}
            <ContactForm propertyId={propertyId} />
          </div>
        </div>
      </section>

      <PropertiesCTA />
    </>
  );
});

PropertyInfoSection.displayName = "PropertyInfoSection";

export default PropertyInfoSection;
