import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { TheMaelstrom } from './components/TheMaelstrom';
import { AuthLayer } from './components/AuthLayer';
import { Onboarding } from './components/Onboarding';
import { DevMenu } from './components/DevMenu';
import { Dithering } from '@paper-design/shaders-react';
import { AnimatePresence } from 'framer-motion';

// Lazy load TidePool - only loads when user scrolls to depths
const TidePool = lazy(() => import('./components/TidePool').then(m => ({ default: m.TidePool })));

// Loading fallback for TidePool
const TidePoolLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 h-8 bg-ocean-500/60 rounded-full"
            style={{
              animation: `wave 1s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-ocean-400/60 text-sm tracking-wider">Descending...</p>
    </div>
  </div>
);

const ONBOARDING_KEY = 'maelstrom_onboarding_complete';

function App() {
  const [view, setView] = useState<'surface' | 'depths'>('surface');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const depthsRef = useRef<HTMLDivElement>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const handleReplayOnboarding = () => {
    setShowOnboarding(true);
  };

  // Use IntersectionObserver for performant view detection (only fires on visibility changes)
  useEffect(() => {
    const surfaceEl = surfaceRef.current;
    const depthsEl = depthsRef.current;
    if (!surfaceEl || !depthsEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (entry.target === surfaceEl) {
              setView('surface');
            } else if (entry.target === depthsEl) {
              setView('depths');
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.5,
      }
    );

    observer.observe(surfaceEl);
    observer.observe(depthsEl);

    return () => observer.disconnect();
  }, []);

  // Programmatic navigation
  const scrollToSurface = useCallback(() => {
    surfaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToDepths = useCallback(() => {
    depthsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-black relative font-sans overflow-hidden">
      {/* Dev Menu Toggle (always visible) */}
      <button
        onClick={() => setShowDevMenu(prev => !prev)}
        className="fixed bottom-4 left-4 z-[90] p-2 text-ocean-500/40 hover:text-ocean-300 transition-colors bg-black/50 backdrop-blur-sm border border-ocean-900/30 rounded-lg hover:border-ocean-500/50"
        title="Toggle Dev Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dev Menu */}
      <DevMenu isVisible={showDevMenu} onClose={() => setShowDevMenu(false)} />

      {/* Replay Onboarding Button (only on Deep Ocean page) */}
      {view === 'depths' && (
        <button
          onClick={handleReplayOnboarding}
          className="fixed top-4 left-4 z-[60] p-2 text-ocean-500/40 hover:text-ocean-300 transition-colors bg-black/30 backdrop-blur-sm border border-ocean-900/20 rounded-lg hover:border-ocean-700/40"
          title="Replay onboarding"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Fixed Dithering Background */}
      <div className="fixed inset-0 z-0">
        <Dithering
          speed={-1}
          shape="swirl"
          type="8x8"
          size={2}
          scale={2.24}
          frame={53891.56899999998}
          colorBack="#00000000"
          colorFront="#0E405C"
          style={{
            backgroundColor: '#000000',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>

      {/* Scroll Snap Container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 h-screen w-full overflow-y-auto snap-y snap-mandatory"
      >
        <AuthLayer>
          {/* Surface Page */}
          <section ref={surfaceRef} className="h-screen w-full snap-start snap-always">
            <TheMaelstrom onDive={scrollToDepths} />
          </section>

          {/* Depths Page */}
          <section
            ref={depthsRef}
            className="min-h-screen w-full snap-start snap-always"
          >
            <Suspense fallback={<TidePoolLoader />}>
              <TidePool onSurface={scrollToSurface} />
            </Suspense>
          </section>
        </AuthLayer>
      </div>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
