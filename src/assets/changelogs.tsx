import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { JSX } from "preact";

import usernameAnim from "../controllers/modals/components/legacy/usernameUpdateLottie.json";

type Element =
    | string
    | {
        type: "image";
        src: string;
        shadow?: boolean;
    }
    | { type: "element"; element: JSX.Element };

export interface ChangelogPost {
    date: Date;
    title: string;
    content: Element[];
}

export const changelogEntries: Record<number, ChangelogPost> = {

    1: {
        date: new Date("2025-02-15T18:00:00.000Z"),
        title: "Welcome to Zeelo! 🎉",
        content: [
            "We're excited to introduce Zeelo - your new modern chat application built on the solid foundation of Revolt Chat!",
            "✨ **New Features:**",
            "• Completely redesigned user interface with smooth animations and modern design",
            "• Enhanced home page with beautiful transitions and seasonal effects",
            "• Redesigned server sidebar with compact, minimalist layout",
            "• Modernized settings panel with rounded corners and clean aesthetics",
            "• Improved hover effects and micro-interactions throughout the app",
            "",
            "🎨 **Design Improvements:**",
            "• Smoother animations without bouncing effects",
            "• Rounded corners and minimalist design language",
            "• Better visual hierarchy and spacing",
            "• Enhanced accessibility with keyboard navigation",
            "",
            "🔧 **Technical Updates:**",
            "• Updated branding from Revolt to Zeelo across all interfaces",
            "• Improved TypeScript compatibility and error handling",
            "• Enhanced mobile responsiveness",
            "• Performance optimizations for faster loading",
            "",
            "💝 **Special Thanks:**",
            "Zeelo is built on the open-source core of Revolt Chat (Stoat). Huge thanks to the Revolt team for their amazing work and foundation that made this possible.",
            "",
            "We hope you enjoy the new Zeelo experience! Feel free to share your feedback and help us improve.",
        ],
    },
};

export const changelogEntryArray = Object.keys(changelogEntries).map(
    (index) => changelogEntries[index as unknown as number],
);

export const latestChangelog = changelogEntryArray.length;
