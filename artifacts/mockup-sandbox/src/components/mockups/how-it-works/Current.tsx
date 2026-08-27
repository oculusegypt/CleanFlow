import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react";
import "./_group.css";

type Step = {
  number: string;
  title: string;
  description: string;
  subtitle?: string;
};

function useSiteSettings() {
  return {
    homepageContent: {
      how: {
        eyebrow: "How it works",
        title: "A clear, simple process from request to completion",
        description:
          "Choose a service, submit your request, and let the team take care of the rest with fast coordination and reliable follow-through.",
        ctaText: "Request a Service",
        footnote: "Response times depend on service availability and location.",
        steps: [
          {
            number: "01",
            title: "Choose your service",
            subtitle: "Start with the cleaning support you need.",
            description:
              "Browse the available cleaning options and pick the one that best matches your home, office, or facility.",
          },
          {
            number: "02",
            title: "Share the details",
            subtitle: "Tell us when and where.",
            description:
              "Send your preferred date, location, and any special notes so the team can prepare the right plan for the job.",
          },
          {
            number: "03",
            title: "Get it done",
            subtitle: "Professional service delivered on time.",
            description:
              "Once your request is confirmed, the team coordinates the work and completes it with care, speed, and attention to detail.",
          },
        ] satisfies Step[],
      },
    },
  };
}

function useServiceRequest() {
  return {
    openModal: () => {},
  };
}

export function Current() {
  const { homepageContent } = useSiteSettings();
  const content = homepageContent.how;
  const steps = content?.steps?.filter(step => step.number && step.title && step.description) ?? [];
  const [activeStep, setActiveStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { openModal } = useServiceRequest();

  useEffect(() => {
    if (steps.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveStep(current => (current + 1) % steps.length);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [steps.length]);

  if (!content || steps.length === 0) return null;
  const step = steps[Math.min(activeStep, steps.length - 1)];

  const selectStep = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveStep(index);
  };

  return (
    <section className="min-h-screen py-14 md:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          {content.eyebrow && (
            <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Play size={11} className="fill-secondary" />
              {content.eyebrow}
            </span>
          )}
          {content.title && <h2 className="text-2xl md:text-4xl font-black text-primary mb-4">{content.title}</h2>}
          <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full mb-4" />
          {content.description && <p className="text-gray-500 text-base md:text-lg leading-relaxed">{content.description}</p>}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 justify-center">
            {steps.map((item, index) => (
              <button
                key={`${item.number}-${index}`}
                type="button"
                onClick={() => selectStep(index)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  activeStep === index ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
                }`}
              >
                {item.number}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${step.number}-${activeStep}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-6 items-stretch"
            >
              <div className="rounded-3xl bg-primary p-8 text-white flex flex-col justify-between min-h-64">
                <div>
                  <span className="text-secondary font-black text-sm">{step.number}</span>
                  <h3 className="text-2xl font-black mt-3">{step.title}</h3>
                  {step.subtitle && <p className="text-white/70 text-sm mt-2">{step.subtitle}</p>}
                </div>
                <CheckCircle className="text-secondary mt-8" size={34} />
              </div>
              <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-8 flex items-center">
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => selectStep((activeStep - 1 + steps.length) % steps.length)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary"
            >
              <ChevronRight size={17} />
              {content.eyebrow}
            </button>
            {content.ctaText && (
              <button
                type="button"
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 bg-secondary text-white font-black px-5 py-3 rounded-xl shadow-lg"
              >
                <Zap size={17} />
                {content.ctaText}
              </button>
            )}
            <button
              type="button"
              onClick={() => selectStep((activeStep + 1) % steps.length)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary"
            >
              {content.title}
              <ChevronLeft size={17} />
            </button>
          </div>
          {content.footnote && <p className="text-center text-xs text-gray-400 mt-4">{content.footnote}</p>}
        </div>
      </div>
    </section>
  );
}