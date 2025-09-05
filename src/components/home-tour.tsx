
"use client";

import { useEffect, useState } from "react";
import Joyride, { type CallBackProps, type Step } from "react-joyride";

interface HomeTourProps {
  run: boolean;
  onComplete: () => void;
}

export function HomeTour({ run, onComplete }: HomeTourProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  const steps: Step[] = [
    {
      target: "#programs",
      content: "See the amazing work we're doing! This section highlights our latest community programs and initiatives.",
      placement: "top",
      title: "Our Programs",
    },
    {
      target: "#nav-courses",
      content: "Ready to learn new skills? Our interactive courses are the perfect place to start your journey.",
      placement: "bottom",
      title: "Start Learning",
    },
    {
      target: "#nav-donate",
      content: "Your support can make a huge difference. Consider donating to help us empower the community.",
      placement: "bottom",
      title: "Support Our Mission",
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#90EE90',
          textColor: '#0a0a0a',
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
        },
        tooltip: {
          borderRadius: '0.5rem',
          fontFamily: 'PT Sans, sans-serif',
        },
        tooltipTitle: {
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 'bold',
        },
        buttonNext: {
            backgroundColor: '#90EE90',
            color: 'black',
            borderRadius: '0.5rem',
        },
        buttonBack: {
            color: '#6b7280',
        },
      }}
    />
  );
}
