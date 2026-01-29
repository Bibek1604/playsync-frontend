import React from "react";
import HeroSection from "./(home)/HeroSection";
import BenefitSection from "./(home)/BenefitSection";
import FeatureSection from "./(home)/FeatureSection";
import Header from "./layout/Header";

function Page() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeatureSection />
      <BenefitSection />
    </div>
  );
}

export default Page;
