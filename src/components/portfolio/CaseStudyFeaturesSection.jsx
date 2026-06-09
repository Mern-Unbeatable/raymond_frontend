import React, { memo } from "react";
import { CheckCircle2, DollarSign } from "lucide-react";

const ASSETS = {
  featMain:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
  featOverlay1:
    "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=600&q=80",
  featOverlay2:
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80",
};

const HIGHLIGHTS = [
  "Open-concept living and dining area",
  "Floor-to-ceiling windows for natural light",
  "Premium marble kitchen design",
  "Spacious master bedroom with modern finish",
  "Private balcony with panoramic skyline view",
];

const RESULTS = [
  { value: "$850k", label: "Purchase price" },
  { value: "$50k", label: "Estimated renovation cost" },
  { value: "$1.1m", label: "ARV (after renovation value)" },
];

const ResultCard = memo(({ value, label }) => {
  const valStr = String(value);
  const hasDollar = valStr.startsWith("$");
  const numPart = hasDollar ? valStr.slice(1) : valStr;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-8 flex flex-col gap-3 items-center text-center flex-1 min-w-0">
      <div className="flex items-center gap-1 font-playfair text-slate-900 text-3xl sm:text-4xl font-semibold leading-tight">
        {hasDollar && (
          <DollarSign
            size={28}
            strokeWidth={2.5}
            className="text-slate-900 shrink-0"
            aria-hidden="true"
          />
        )}
        <span>{numPart}</span>
      </div>
      <p className="font-inter text-slate-600 text-sm sm:text-base leading-normal">
        {label}
      </p>
    </div>
  );
});
ResultCard.displayName = "ResultCard";

const CaseStudyFeaturesSection = memo(({ portfolio }) => {
  const highlights = portfolio?.featuredHighlight
    ? portfolio.featuredHighlight.split(/\n|\./).map(h => h.trim()).filter(Boolean)
    : HIGHLIGHTS;

  if (portfolio?.featuredHighlight && highlights.length === 0) {
    highlights.push(portfolio.featuredHighlight);
  }

  const featMain = portfolio?.gallery?.[0]?.url || ASSETS.featMain;
  const featOverlay1 = portfolio?.gallery?.[1]?.url || ASSETS.featOverlay1;
  const featOverlay2 = portfolio?.gallery?.[2]?.url || ASSETS.featOverlay2;

  let resultsToDisplay = RESULTS;
  if (portfolio) {
    resultsToDisplay = [];
    if (portfolio.budget) resultsToDisplay.push({ value: portfolio.budget, label: "Budget" });
    if (portfolio.roi) resultsToDisplay.push({ value: portfolio.roi, label: "ROI" });
    if (portfolio.area) resultsToDisplay.push({ value: portfolio.area, label: "Area" });
    if (resultsToDisplay.length === 0) resultsToDisplay = RESULTS; // fallback
  }

  return (
    <>
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-384 mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-center">
            <div
              className="relative shrink-0 w-full lg:w-[54%] xl:w-[52%]"
              style={{ height: "clamp(300px, 36vw, 460px)" }}
              aria-hidden="true"
            >
              <div
                className="absolute rounded-2xl overflow-hidden shadow-xl bg-slate-100"
                style={{ left: "0%", top: "0%", width: "78.3%", height: "79.6%" }}
              >
                <img
                  src={featMain}
                  alt="Feature property main view"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute rounded-2xl overflow-hidden border-[3px] border-white shadow-xl bg-slate-100"
                style={{
                  left: "57.8%",
                  top: "31.9%",
                  width: "42.2%",
                  height: "42.8%",
                }}
              >
                <img
                  src={featOverlay1}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute rounded-2xl overflow-hidden border-[3px] border-white shadow-xl bg-slate-100"
                style={{
                  left: "45.4%",
                  top: "65.8%",
                  width: "39.1%",
                  height: "34.2%",
                }}
              >
                <img
                  src={featOverlay2}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 flex-1 min-w-0 mt-8 sm:mt-0 lg:mt-0">
              <div className="flex flex-col gap-4">
                <p className="font-inter font-normal text-orange-600 text-lg lg:text-xl">
                  Key Details
                </p>
                <h2 className="font-playfair text-slate-900 text-3xl lg:text-[44px] leading-tight">
                  Features &amp; Highlights
                </h2>
              </div>
              <ul
                className="flex flex-col gap-4"
                aria-label="Project features list"
              >
                {highlights.map((item, index) => (
                  <li key={index} className="flex gap-3 items-center">
                    <CheckCircle2
                      size={20}
                      className="text-orange-500 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-inter text-slate-700 text-base lg:text-xl leading-normal">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {resultsToDisplay.length > 0 && (
        <section
          className="bg-blue-tint py-14 lg:py-20"
          aria-label="Project results"
        >
          <div className="max-w-384 mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-8 items-center text-center">
              <div className="flex flex-col gap-2 max-w-md">
                <h2 className="font-playfair text-slate-900 text-2xl sm:text-3xl font-bold uppercase tracking-widest leading-tight">
                  Project Results
                </h2>
                <p className="font-inter text-slate-500 text-sm sm:text-base leading-relaxed">
                  The project significantly increased both the visual appeal and
                  market value of the property.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {resultsToDisplay.map((result) => (
                  <ResultCard key={result.label} {...result} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
});

CaseStudyFeaturesSection.displayName = "CaseStudyFeaturesSection";

export default CaseStudyFeaturesSection;
