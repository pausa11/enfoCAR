"use client";

import { useState, useEffect } from "react";
import Hyperspeed from "./Hyperspeed";

export default function HyperspeedClient() {
    const getOptions = (isMobile) => ({
        onSpeedUp: () => { },
        onSlowDown: () => { },
        distortion: 'turbulentDistortion',
        length: 400,
        roadWidth: isMobile ? 5 : 10,
        islandWidth: isMobile ? 1 : 2,
        lanesPerRoad: isMobile ? 2 : 3,
        fov: isMobile ? 60 : 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 50,
        lightPairsPerRoadWay: 50,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,
        lightStickWidth: [0.12, 0.5],
        lightStickHeight: [1.3, 1.7],
        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],
        carLightsLength: [400 * 0.05, 400 * 0.15],
        carLightsRadius: [0.05, 0.14],
        carWidthPercentage: [0.3, 0.5],
        carShiftX: [-0.2, 0.2],
        carFloorSeparation: [0.05, 1],
        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            leftCars: [0x10b981, 0x14b8a6, 0x06b6d4],
            rightCars: [0x0ea5e9, 0x3b82f6, 0x06b6d4],
            sticks: 0x14b8a6
        }
    });

    const [options, setOptions] = useState(getOptions(false));

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setOptions(getOptions(isMobile));
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <Hyperspeed effectOptions={options} />;
}
