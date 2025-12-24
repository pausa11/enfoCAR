'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
    useEffect(() => {
        // Initialize Lenis with premium settings
        const lenis = new Lenis({
            duration: 1.2,        // Slower scroll duration for heavier feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,  // Reduce wheel sensitivity for heavier feel
            touchMultiplier: 1.5,  // Slightly increase touch sensitivity
            infinite: false,
            autoResize: true,
        });

        // Animation frame loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Cleanup
        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
}
