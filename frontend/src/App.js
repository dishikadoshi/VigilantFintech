import React, { useEffect, useRef } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { initSmoothScroll } from './lib/smooth';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { FabStack as Fab } from './components/Fab';
import PageTransition from './components/PageTransition';
import Scene3D from './three/Scene3D';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { PrivacyPolicy, Terms, CookiePolicy } from './pages/Legal';

const ROUTES = {
  '/': Home,
  '/privacy-policy': PrivacyPolicy,
  '/terms-and-conditions': Terms,
  '/cookie-policy': CookiePolicy,
};

function Shell({ transitionRef }) {
  const { path } = useRouter();
  const View = ROUTES[path] || NotFound;

  useEffect(() => {
    initSmoothScroll();
    const t = transitionRef.current;
    const hash = window.location.hash;
    (async () => {
      await new Promise((r) => setTimeout(r, 900));
      window.__introDone = true;
      if (hash && path === '/') {
        const { scrollToHash } = await import('./lib/smooth');
        scrollToHash(hash, true);
      }
      if (t) await t.reveal();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Scene3D />
      <Cursor />
      <Nav />
      <main id="main"><View key={path} /></main>
      <Footer />
      <Fab />
    </>
  );
}

export default function App() {
  const transitionRef = useRef(null);
  return (
    <RouterProvider transitionRef={transitionRef}>
      <PageTransition ref={transitionRef} />
      <Shell transitionRef={transitionRef} />
    </RouterProvider>
  );
}
