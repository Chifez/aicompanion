import { useEffect } from 'react';
import { Navbar } from './components/navbar';
import { CTASection } from './components/cta-section';
import { ExperienceSection } from './components/experience-section';
import { HeroSection } from './components/hero-section';
import { HighlightsSection } from './components/highlights-section';
import { TestimonialSection } from './components/testimonial-section';

export function Landing() {
  useEffect(() => {
    document.body.classList.add('has-fixed-nav');
    return () => {
      document.body.classList.remove('has-fixed-nav');
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <HighlightsSection />
      <ExperienceSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
}
