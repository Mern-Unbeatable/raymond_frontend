import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config";
import { httpMethods } from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";

const HERO_BG = "/hero.webp";
const HERO_BG_MOBILE = "/homeBgPhone.webp";

const FALLBACK_MIN_PRICES = [
  "$50,000",
  "$150,000",
  "$250,000",
  "$350,000",
  "$450,000",
];
const FALLBACK_MAX_PRICES = [
  "$500,000",
  "$750,000",
  "$1,000,000",
  "$2,500,000",
  "$5,000,000+",
];
const FALLBACK_BED_OPTIONS = ["1+", "2+", "3+", "4+", "5+"];
const FALLBACK_BATH_OPTIONS = ["1+", "2+", "3+", "4+", "5+"];

const parseCurrency = (value) =>
  Number(String(value).replace(/[^\d]/g, "")) || 0;

const formatCurrency = (value) =>
  `$${Number(value).toLocaleString("en-US")}`;

const RadioOption = memo(({ value, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-text-dim">
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-orange-500" : "border-border-light"
      }`}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-orange-500" />}
    </span>
    <input
      type="radio"
      className="sr-only"
      value={value}
      checked={checked}
      onChange={onChange}
    />
    {value}
  </label>
));
RadioOption.displayName = "RadioOption";

const HeroSection = memo(() => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    beds: "",
    bathrooms: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    minPrices: FALLBACK_MIN_PRICES,
    maxPrices: FALLBACK_MAX_PRICES,
    beds: FALLBACK_BED_OPTIONS,
    bathrooms: FALLBACK_BATH_OPTIONS,
  });
  const [openKey, setOpenKey] = useState(null);
  const [dropDirection, setDropDirection] = useState("down");
  const panelRef = useRef(null); 

  const filtersConfig = useMemo(
    () => [
      {
        key: "minPrice",
        label: "Min Price",
        options: filterOptions.minPrices,
        mobileAlign: "left",
      },
      {
        key: "maxPrice",
        label: "Max Price",
        options: filterOptions.maxPrices,
        mobileAlign: "right",
      },
      {
        key: "beds",
        label: "Bedrooms",
        options: filterOptions.beds,
        mobileAlign: "left",
      },
      {
        key: "bathrooms",
        label: "Bathrooms",
        options: filterOptions.bathrooms,
        mobileAlign: "right",
      },
    ],
    [filterOptions],
  );

  useEffect(() => {
    if (!openKey) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpenKey(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchFilterOptions = async () => {
      const { data, error } = await httpMethods.get(API_ENDPOINTS.PROPERTIES.LIST, {
        params: { page: 1, limit: 200, listingType: "REGULAR" },
      });

      if (cancelled || error) return;

      const payload = data?.data ?? data ?? {};
      const properties = Array.isArray(payload?.properties) ? payload.properties : [];

      const prices = [
        ...new Set(
          properties
            .map((p) => Number(p?.askingPrice))
            .filter((p) => Number.isFinite(p) && p > 0),
        ),
      ].sort((a, b) => a - b);

      const bedrooms = [
        ...new Set(
          properties
            .map((p) => Number(p?.bedrooms))
            .filter((v) => Number.isFinite(v) && v > 0),
        ),
      ]
        .sort((a, b) => a - b)
        .map((v) => `${v}+`);

      const bathrooms = [
        ...new Set(
          properties
            .map((p) => Number(p?.bathrooms))
            .filter((v) => Number.isFinite(v) && v > 0),
        ),
      ]
        .sort((a, b) => a - b)
        .map((v) => `${v}+`);

      const derivedMin = prices.slice(0, 8).map(formatCurrency);
      const derivedMax = prices.slice(-8).map(formatCurrency);

      setFilterOptions({
        minPrices: derivedMin.length > 0 ? derivedMin : FALLBACK_MIN_PRICES,
        maxPrices: derivedMax.length > 0 ? derivedMax : FALLBACK_MAX_PRICES,
        beds: bedrooms.length > 0 ? bedrooms : FALLBACK_BED_OPTIONS,
        bathrooms: bathrooms.length > 0 ? bathrooms : FALLBACK_BATH_OPTIONS,
      });
    };

    fetchFilterOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const setFilter = useCallback(
    (key, val) => setFilters((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const toggleKey = useCallback(
    (key, e) => {
      if (openKey === key) {
        setOpenKey(null);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropDirection(spaceBelow < 240 ? "up" : "down");
      setOpenKey(key);
    },
    [openKey],
  );

  const handleSearchSubmit = useCallback(() => {
    const location = search.trim();

    const query = new URLSearchParams();
    if (location) query.set("location", location);
    if (filters.minPrice) query.set("minPrice", String(parseCurrency(filters.minPrice)));
    if (filters.maxPrice) query.set("maxPrice", String(parseCurrency(filters.maxPrice)));
    if (filters.beds) query.set("beds", String(parseCurrency(filters.beds)));
    if (filters.bathrooms)
      query.set("bathrooms", String(parseCurrency(filters.bathrooms)));

    const queryString = query.toString();
    if (queryString) {
      navigate(`${ROUTES.BUY}?${queryString}`);
    } else {
      navigate(ROUTES.BUY);
    }
  }, [filters, navigate, search]);

  return (
    <section className="relative z-10 flex flex-1 flex-col">
      {/* flex-1 fills remaining height inside h-[calc(100vh-5rem)] wrapper in HomeContent */}
      <div className="relative flex-1 w-full flex flex-col">
        {/* BG image -- mobile uses homeBgPhone.png, desktop uses hero.png */}
        <div
          className="absolute inset-0 sm:hidden"
          role="img"
          aria-label="Global real estate investment opportunities"
          style={{
            backgroundImage: `url(${HERO_BG_MOBILE})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/35 pointer-events-none"
          aria-hidden="true"
        />

        {/* Text content -- same container as Navbar */}
        <div className="relative z-10 mx-auto max-w-384 w-full px-4 pt-6 pb-32 flex-1 sm:px-8 sm:pt-12 sm:pb-32 lg:px-12 lg:pt-24 lg:pb-36">
          <div className="max-w-195 space-y-4">
            <div className="inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-xs font-medium text-ink-soft sm:text-sm">
              <MapPin
                className="h-4 w-4 shrink-0 text-navy"
                aria-hidden="true"
              />
              <span>SERVING SEATTLE, KING COUNTY &amp; GREATER WASHINGTON</span>
            </div>

            <h1 className="font-playfair text-[30px] leading-tight text-white sm:text-[42px] lg:text-[56px]">
              Global Real Estate Investment Opportunities and Strategic
              Development
            </h1>

            <p className="font-inter text-lg font-medium leading-relaxed text-white">
              We partner With investors, developers, and property owners to
              acquire, renovate, and unlock value across high-growth markets.
            </p>
          </div>
        </div>

        {/* Search bar -- absolute on all breakpoints, half-straddles the section below */}
        <div className="absolute bottom-6 left-0 right-0 z-20 translate-y-1/2 sm:bottom-14">
          <div className="mx-auto max-w-384 px-4 sm:px-8 lg:px-12">
            {/* Wrapper for relative positioning of floating dropdown */}
            <div ref={panelRef} className="relative">
              {/* Main search card */}
              <div className="rounded-xl bg-white p-3 shadow-[0px_10px_30px_rgba(0,0,0,0.12)] sm:rounded-lg sm:p-6 sm:shadow-[7px_7px_15px_rgba(0,0,0,0.25)]">
                {/* Row 1: Search box + SEARCH button */}
                <form
                  className="flex items-center gap-3 sm:gap-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmit();
                  }}
                >
                  {/* Search box — plain on mobile, #FAFAFA styled box on desktop */}
                  <div className="flex flex-1 items-center gap-3 sm:rounded-lg sm:border sm:border-[#F3F3F3] sm:bg-[#FAFAFA] sm:px-4 sm:py-3">
                    <Search
                      className="h-4 w-4 shrink-0 text-icon-muted"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by city, neighborhood, Zip code or address"
                      className="h-10 flex-1 bg-transparent text-sm text-text-dim placeholder:text-muted-input focus:outline-none sm:h-auto sm:text-base sm:text-[#727272] sm:placeholder:text-[#ADADAD]"
                    />
                  </div>
                  {/* SEARCH button */}
                  <button
                    type="submit"
                    className="h-10 cursor-pointer rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 sm:h-12 sm:px-6 sm:text-base sm:font-normal"
                  >
                    SEARCH
                  </button>
                </form>

                {/* Divider — border on mobile, spacing-only on desktop */}
                <div className="my-2 border-t border-border-soft sm:mb-0 sm:mt-3.5 sm:border-0" />

                {/* Row 2: Filter dropdowns */}
                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-4.5">
                  {filtersConfig.map(
                    ({ key, label, options, mobileAlign }) => (
                      <div key={key} className="relative sm:flex-1">
                        <button
                          type="button"
                          onClick={(e) => toggleKey(key, e)}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-2 py-2 text-xs transition-colors sm:bg-[#FAFAFA] sm:border-[#F3F3F3] sm:px-4 sm:py-3 sm:text-base ${
                            openKey === key
                              ? "border-orange-400 text-orange-500"
                              : "border-border-soft text-icon-mid hover:text-orange-500 sm:text-black"
                          }`}
                        >
                          <span className="truncate">
                            {filters[key] || label}
                          </span>
                          <ChevronDown
                            className={`ml-1 h-3.5 w-3.5 shrink-0 transition-transform duration-200 sm:h-5 sm:w-5 ${
                              openKey === key
                                ? "rotate-180 text-orange-500"
                                : "text-icon-muted sm:text-black"
                            }`}
                            aria-hidden="true"
                          />
                        </button>

                        {openKey === key && (
                          <div
                            className={`absolute z-30 min-w-40 sm:min-w-45 rounded-xl bg-white p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.15)] ${dropDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"} ${mobileAlign === "right" ? "right-0" : "left-0"}`}
                          >
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-icon-muted">
                              {label}
                            </p>
                            {options.map((opt) => (
                              <RadioOption
                                key={opt}
                                value={opt}
                                checked={filters[key] === opt}
                                onChange={() => setFilter(key, opt)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
