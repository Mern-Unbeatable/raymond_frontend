import React, { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import PropertiesCTA from "../components/shared/PropertiesCTA";
import CaseStudyHeroSection from "../components/portfolio/CaseStudyHeroSection";
import CaseStudyProjectSection from "../components/portfolio/CaseStudyProjectSection";
import CaseStudyGallerySection from "../components/portfolio/CaseStudyGallerySection";
import CaseStudyFeaturesSection from "../components/portfolio/CaseStudyFeaturesSection";
import httpMethods from "../services/httpMethods";
import { API_ENDPOINTS } from "../services/httpEndpoint";

const CaseStudy = memo(() => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await httpMethods.get(API_ENDPOINTS.PORTFOLIOS.BY_ID(id));
        if (!error && data?.success && data?.data) {
          setPortfolio(data.data);
        } else {
          setPortfolio(null);
        }
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }
  }, [id]);

  useSEO({
    title: portfolio ? `Case Study -- ${portfolio.title} | Skyridge Group` : "Case Study | Skyridge Group",
    description: portfolio?.description || "A premium renovation project by Skyridge Group.",
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-primary-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-50">
        <h2 className="text-2xl font-semibold text-gray-700">Portfolio not found</h2>
        <p className="text-gray-500 mt-2">The case study you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-14 lg:pb-20">
      <CaseStudyHeroSection portfolio={portfolio} />
      <CaseStudyProjectSection portfolio={portfolio} />
      <CaseStudyGallerySection portfolio={portfolio} />
      <CaseStudyFeaturesSection portfolio={portfolio} />
      <div className="mt-14 lg:mt-20">
        <PropertiesCTA />
      </div>
    </div>
  );
});

CaseStudy.displayName = "CaseStudy";

export default CaseStudy;
