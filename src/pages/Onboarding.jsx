import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    emoji: "🛍️",
    title: "Save anything,\nfrom anywhere",
    sub: "Paste any product URL and Stashd automatically extracts the name, price, and image.",
  },
  {
    emoji: "📉",
    title: "Never miss\na price drop",
    sub: "Set alerts and get notified the moment prices fall. We track prices across all major stores.",
  },
  {
    emoji: "💰",
    title: "Always buy at\nthe best price",
    sub: "Stashd compares prices across retailers in real time so you always pay less.",
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const slide = slides[step];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: step === 0
            ? 'radial-gradient(ellipse, rgba(212,168,83,0.08) 0%, transparent 70%)'
            : step === 1
            ? 'radial-gradient(ellipse, rgba(46,204,113,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(232,101,43,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transition: 'background 0.5s ease',
        }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-16 pb-8">
        <div className="mb-auto">
          <p style={{ color: '#D4A853', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.12em', marginBottom: '48px' }}>
            STASHD
          </p>

          <div className="mb-8">
            <span style={{ fontSize: '72px', lineHeight: 1 }}>{slide.emoji}</span>
          </div>

          <h1 className="mb-4" style={{
            color: '#F5F0E8',
            fontSize: '38px',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            lineHeight: 1.15,
            whiteSpace: 'pre-line',
          }}>
            {slide.title}
          </h1>

          <p style={{ color: '#6B6B6B', fontSize: '16px', fontFamily: 'Inter', lineHeight: 1.6 }}>
            {slide.sub}
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-8">
          {slides.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: i === step ? '24px' : '6px',
                height: '6px',
                background: i === step ? '#D4A853' : '#2E2E2E',
              }} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (step < slides.length - 1) {
              setStep(s => s + 1);
            } else {
              onComplete();
            }
          }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{ background: '#E8652B', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: '16px' }}
        >
          {step < slides.length - 1 ? 'Continue' : "Let's Go"}
          <ArrowRight size={18} />
        </button>

        {step === 0 && (
          <button type="button" onClick={onComplete} className="mt-4 text-center w-full"
            style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter' }}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
