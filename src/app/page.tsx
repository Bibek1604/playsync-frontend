import React from "react";
import HeroSection from "./(home)/HeroSection";
import BenefitSection from "./(home)/BenefitSection";
import FeatureSection from "./(home)/FeatureSection";
import Header from "./layout/Header";
import { Footer } from "./layout/Footer";

function Page() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeatureSection />
      <BenefitSection />
      <Footer />
    </div>
  );
}

export default Page;
