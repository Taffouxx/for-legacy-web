import dayjs from "dayjs";
import { Text } from "preact-i18n";
import { useMemo, useState } from "preact/hooks";

import { CategoryButton, Column, Modal } from "@revoltchat/ui";
import { X as CloseIcon } from "@styled-icons/boxicons-regular/X";

import { changelogEntries } from "../../../assets/changelogs";
import Markdown from "../../../components/markdown/Markdown";
import { useTranslation } from "../../../lib/i18n";
import { ModalProps } from "../types";

import styles from "./Changelog.module.scss";

/**
 * Changelog modal
 */
export default function Changelog({
    initial,
    onClose,
}: ModalProps<"changelog">) {
    // Determine the initially selected log index.
    // If 'initial' is provided, we use it (assuming it's a 1-based index for backward compat or just newest).
    // Usually 'initial' is the log number. If not set, we show the first entry (newest).
    const [logIndex, setLogIndex] = useState<number | undefined>(initial ? initial - 1 : 0);
    const t = useTranslation();

    const entry = useMemo(
        () => (typeof logIndex === 'number' ? changelogEntries[logIndex] : undefined),
        [logIndex],
    );

    return (
        <Modal
            onClose={onClose}
            disableDirectRendering // We handle the layout ourselves
            className={styles.modal}>
            <div className={styles.header}>
                <div className={styles.closeButton} onClick={onClose}>
                    <CloseIcon size={24} />
                </div>
                {entry ? (
                    <>
                        <h1><Text id="app.special.modals.changelogs.title" /></h1>
                        <div className={styles.date}>
                            {dayjs(entry.date).format("D MMMM YYYY [г.]")}
                        </div>
                    </>
                ) : (
                    <h1><Text id="app.special.modals.changelogs.title" /></h1>
                )}
            </div>

            <div className={styles.scrollArea}>
                {entry ? (
                    <div className={styles.content}>
                        {entry.banner && (
                            <img src={entry.banner} className={styles.banner} alt="Changelog banner" />
                        )}
                        <Column>
                            {entry.content.map((entryItem, idx) => {
                                if (typeof entryItem === "string") {
                                    if (entryItem === "") return <div style={{ height: '8px' }} />;

                                    // Localize the string key
                                    const localizedContent = t(`app.special.modals.changelogs.entries.${entry.title}.${entryItem}`);

                                    let contentClass = "";
                                    if (entryItem.startsWith("section_features")) contentClass = styles.categoryNew;
                                    else if (entryItem.startsWith("section_design")) contentClass = styles.categoryImproved;
                                    else if (entryItem.startsWith("section_fixed")) contentClass = styles.categoryFixed;

                                    return (
                                        <div className={contentClass} key={`${entryItem}-${idx}`}>
                                            <Markdown
                                                content={localizedContent || entryItem}
                                            />
                                        </div>
                                    );
                                } else if (entryItem.type === "element") {
                                    return entryItem.element;
                                } else {
                                    return (
                                        <img
                                            key={idx}
                                            src={entryItem.src}
                                            style={{
                                                borderRadius: '8px',
                                                boxShadow: entryItem.shadow ? '0 4px 12px rgba(0,0,0,0.5)' : 'none'
                                            }}
                                        />
                                    );
                                }
                            })}
                        </Column>
                    </div>
                ) : (
                    <Column>
                        {changelogEntries.map((entry, index) => (
                            <CategoryButton
                                key={index}
                                onClick={() => setLogIndex(index)}>
                                <Text id={`app.special.modals.changelogs.entries.${entry.title}.title`} />
                            </CategoryButton>
                        ))}
                    </Column>
                )}
            </div>

            {/* User requested removal of the "Subscribe" footer section */}
        </Modal>
    );
}
