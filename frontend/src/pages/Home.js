import React from 'react';
import { Page, Marquee } from '../components/ui';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import Why from '../sections/Why';
import How from '../sections/How';
import Industries from '../sections/Industries';
import Pricing from '../sections/Pricing';
import Faq from '../sections/Faq';
import Cta from '../sections/Cta';
import Contact from '../sections/Contact';

const WORDS = ['Admin support', 'Customer care', 'Digital marketing', 'Creative', 'E-commerce', 'Operations', 'Bookkeeping'];

export default function Home() {
  return (
    <Page scene="film" path="/" title="Virtual Assistant Services & Remote Business Support"
      description="Reliable virtual assistant services: administrative support, customer service, digital marketing, e-commerce assistance, bookkeeping and remote business solutions.">
      <Hero />
      <div className="after-film">
        <Marquee items={WORDS} className="marquee--mid" />
        <About />
        <Services />
        <Why />
        <How />
        <Industries />
        <Pricing />
        <Faq />
        <Cta />
        <Contact />
      </div>
    </Page>
  );
}
