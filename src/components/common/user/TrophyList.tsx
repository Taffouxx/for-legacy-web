import { Text } from "preact-i18n";
import styles from "./TrophyList.module.scss";

export interface Trophy {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    date?: string;
}

interface TrophyListProps {
    trophies: Trophy[];
}

function formatDate(dateStr: string): string {
    try {
        return new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

export function TrophyList({ trophies }: TrophyListProps) {
    if (!trophies || trophies.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🏆</span>
                <span className={styles.emptyTitle}>
                    <Text id="app.special.popovers.user_profile.trophies.empty_title" />
                </span>
                <span className={styles.emptyDesc}>
                    <Text id="app.special.popovers.user_profile.trophies.empty_desc" />
                </span>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {trophies.map((trophy) => (
                <div key={trophy.id} className={styles.card}>
                    <div className={styles.icon}>{trophy.icon ?? "🏆"}</div>
                    <div className={styles.title}>{trophy.title}</div>
                    {trophy.description && (
                        <div className={styles.description}>{trophy.description}</div>
                    )}
                    {trophy.date && (
                        <div className={styles.date}>
                            ✦&nbsp;
                            <Text id="app.special.popovers.user_profile.trophies.earned_on" />
                            &nbsp;{formatDate(trophy.date)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}