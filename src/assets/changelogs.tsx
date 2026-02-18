export interface ChangelogPost {
    date: Date;
    /** Title i18n key suffix (e.g. 'welcome') */
    title: string;
    banner?: string;
    /** Content keys (e.g. ['intro', 'section_features', 'feature_ui']) */
    content: (string | { type: "image"; src: string; shadow?: boolean } | { type: "element"; element: JSX.Element })[];
}

/**
 * List of changelog entries.
 * Add new entries to the top of the array for them to appear first.
 */
export const changelogEntries: ChangelogPost[] = [
    {
        date: new Date("2025-02-15T18:00:00.000Z"),
        title: "welcome",
        content: [
            "intro",
            "section_features",
            "feature_ui",
            "feature_home",
            "feature_sidebar",
            "feature_settings",
            "feature_hover",
            "",
            "section_design",
            "design_animations",
            "design_rounded",
            "design_hierarchy",
            "design_accessibility",
            "",
            "outro",
        ],
    },
];
