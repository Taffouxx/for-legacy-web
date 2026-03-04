import { observer } from "mobx-react-lite";
// @ts-ignore
import { User } from "revolt.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { createPortal } from "preact/compat";
import { Text } from "preact-i18n";

import { useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";
import { internalEmit } from "../../../lib/eventEmitter";
import UserIcon from "./UserIcon";
import UserBadges from "./UserBadges";
import styles from "./MiniProfile.module.scss";

interface MiniProfileProps {
    userId: string;
    serverId?: string;
    position: { x: number; y: number };
    onClose: () => void;
}

const CARD_WIDTH = 320;
const CARD_MIN_HEIGHT = 280;

const MiniProfile = observer(({ userId, serverId, position, onClose }: MiniProfileProps) => {
    const client = useClient();
    const cardRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<any>(undefined);
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const user: User | undefined = client?.users.get(userId);

    useEffect(() => {
        if (!user) return;
        user.fetchProfile()
            .then((p: any) => setProfile(p))
            .catch(() => setProfile(null));
    }, [userId]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler, true);
        return () => document.removeEventListener("mousedown", handler, true);
    }, [onClose]);

    if (!user) return null;

    // Trophies
    const trophies: any[] = (user as any).trophies ?? [];
    const previewTrophies = trophies.slice(0, 3);

    // Server + member
    const server = serverId ? client?.servers.get(serverId) : undefined;
    const member = serverId ? client?.members.getKey({ server: serverId, user: userId }) : undefined;
    const isSelf = client?.user?._id === userId;

    // All server roles (non-default)
    const allRoles = server
        ? Object.entries((server as any).roles ?? {}).map(([id, r]: [string, any]) => ({
              id,
              name: r.name as string,
              colour: r.colour as string | undefined,
          }))
        : [];

    // Current member role IDs
    const currentRoleIds: string[] = member?.roles ?? [];
    const memberRoles = allRoles.filter(r => currentRoleIds.includes(r.id));

    // Can this client user manage roles on this server?
    const me = serverId ? client?.members.getKey({ server: serverId, user: client.user?._id ?? "" }) : undefined;
    const canManageRoles = !!(server && me) && (() => {
        try {
            return (server as any).permission & (1 << 4); // ManageRoles bit
        } catch { return false; }
    })();

    const updateRoles = async (newRoleIds: string[]) => {
        if (!serverId || !client) return;
        setSaving(true);
        try {
            // @ts-ignore
            await client.api.patch(`/servers/${serverId}/members/${userId}`, { roles: newRoleIds });
            // Optimistically update member in store if possible
            if (member) {
                (member as any).roles = newRoleIds;
            }
        } catch (e) {
            console.error("Failed to update roles", e);
        } finally {
            setSaving(false);
        }
    };

    const removeRole = (roleId: string) => {
        updateRoles(currentRoleIds.filter(id => id !== roleId));
    };

    const addRole = (roleId: string) => {
        if (currentRoleIds.includes(roleId)) return;
        updateRoles([...currentRoleIds, roleId]);
        setShowRolePicker(false);
        setRoleSearch("");
    };

    // Banner
    const bannerURL = profile?.background
        ? client?.generateFileURL(profile.background, { width: 640 }, true)
        : null;

    // Card position
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let left = position.x + 12;
    let top = position.y - 100;
    
    // Horizontal positioning
    if (left + CARD_WIDTH > vw - 8) left = position.x - CARD_WIDTH - 12;
    if (left < 8) left = 8;
    
    // Vertical positioning - simple check if card would go below screen
    if (top + CARD_MIN_HEIGHT > vh - 8) {
        // Position above avatar if too close to bottom
        top = position.y - CARD_MIN_HEIGHT - 20;
    }
    if (top < 8) top = 8;

    const openFullProfile = () => {
        onClose();
        setTimeout(() => {
            modalController.push({ type: "user_profile", user_id: userId, serverId });
        }, 50);
    };

    const openDM = () => {
        onClose();
        (user as any).openDM?.().then((channel: any) => {
            internalEmit("Navigate", channel._id);
        }).catch(() => {});
    };

    const displayName = (user as any).display_name ?? user.username;
    const discriminator = (user as any).discriminator;
    const statusText = user.status?.text;
    const statusEmoji = (user as any).status?.emoji;

    // Filtered roles for picker (not yet assigned)
    const unassignedRoles = allRoles.filter(
        r => !currentRoleIds.includes(r.id) && r.name.toLowerCase().includes(roleSearch.toLowerCase())
    );

    const card = (
        <div
            ref={cardRef}
            className={styles.card}
            style={{ left: `${left}px`, top: `${top}px` }}
        >
            {/* Banner */}
            <div
                className={styles.banner}
                style={bannerURL ? { backgroundImage: `url(${bannerURL})` } : {}}
            >
                <div className={styles.bannerActions}>
                    <button
                        className={styles.bannerAction}
                        title="Open full profile"
                        onClick={openFullProfile}
                    >
                        ↗
                    </button>
                    <button className={styles.bannerAction} title="More options">
                        ···
                    </button>
                </div>
            </div>

            {/* Avatar overlapping banner */}
            <div className={styles.avatarRow}>
                <div
                    className={styles.avatarWrapper}
                    title="Open full profile"
                    onClick={openFullProfile}
                >
                    <div className={styles.avatarBorder}>
                        <UserIcon target={user} size={72} status animate />
                    </div>
                    <div className={styles.avatarHint} />
                </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
                <div className={styles.displayName}>
                    {displayName}
                    {statusEmoji && (
                        <span className={styles.statusEmoji} title={statusText ?? ""}>{statusEmoji}</span>
                    )}
                </div>

                <div className={styles.usernameRow}>
                    <span className={styles.username}>
                        {user.username}{discriminator ? `#${discriminator}` : ""}
                    </span>
                </div>

                {(statusText || profile?.content) && (
                    <div className={styles.statusText}>
                        {statusEmoji && `${statusEmoji} `}{statusText ?? profile?.content}
                    </div>
                )}

                {!!user.badges && (
                    <div className={styles.badges}>
                        <UserBadges badges={user.badges} uid={user._id} />
                    </div>
                )}

                {/* Roles section */}
                {server && (
                    <div>
                        <div className={styles.divider} />
                        <div className={styles.rolesSection}>
                            <div className={styles.rolesSectionHeader}>
                                <span className={styles.rolesSectionTitle}>
                                    <Text id="app.special.popovers.user_profile.roles" />
                                </span>
                                {canManageRoles && !isSelf && (
                                    <button
                                        className={styles.addRoleBtn}
                                        onClick={() => { setShowRolePicker(v => !v); setRoleSearch(""); }}
                                        title="Add role"
                                    >
                                        +
                                    </button>
                                )}
                            </div>

                            {/* Role picker dropdown */}
                            {showRolePicker && (
                                <div className={styles.rolePicker}>
                                    <input
                                        className={styles.roleSearchInput}
                                        placeholder="Search role…"
                                        value={roleSearch}
                                        onInput={(e: any) => setRoleSearch(e.target.value)}
                                        autoFocus
                                    />
                                    <div className={styles.rolePickerList}>
                                        {unassignedRoles.length === 0 ? (
                                            <div className={styles.rolePickerEmpty}>No roles available</div>
                                        ) : unassignedRoles.map(role => (
                                            <div
                                                key={role.id}
                                                className={styles.rolePickerItem}
                                                onClick={() => addRole(role.id)}
                                            >
                                                <div
                                                    className={styles.roleDot}
                                                    style={{ background: role.colour ?? '#888' }}
                                                />
                                                <span>{role.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.rolesList}>
                                {memberRoles.length === 0 ? (
                                    <span className={styles.rolesEmpty}>No roles</span>
                                ) : memberRoles.map(role => (
                                    <div key={role.id} className={styles.roleChip}>
                                        <div
                                            className={styles.roleDot}
                                            style={{ background: role.colour ?? '#888' }}
                                        />
                                        <span>{role.name}</span>
                                        {canManageRoles && !isSelf && (
                                            <button
                                                className={styles.removeRoleBtn}
                                                onClick={(e) => { e.stopPropagation(); removeRole(role.id); }}
                                                disabled={saving}
                                                title="Remove role"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Hall of Fame */}
                <div className={styles.divider} />
                <div className={styles.trophySection} onClick={openFullProfile}>
                    <div className={styles.trophySectionTitle}>
                        🏆 <Text id="app.special.popovers.user_profile.tabs.hall_of_fame" />
                        <span className={styles.trophyArrow}>›</span>
                    </div>
                    {previewTrophies.length > 0 ? (
                        <div className={styles.trophyStrip}>
                            {previewTrophies.map((t: any) => (
                                <div key={t.id} className={styles.trophyItem}>
                                    <span className={styles.trophyIcon}>{t.icon ?? "🏆"}</span>
                                    <span className={styles.trophyTitle}>{t.title}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.trophyEmpty}>
                            <Text id="app.special.popovers.user_profile.trophies.empty_title" />
                        </div>
                    )}
                </div>

                <span className={styles.fullProfileLink} onClick={openFullProfile}>
                    <Text id="app.special.popovers.user_profile.view_full_profile" />
                </span>
            </div>

            {/* Message area */}
            {!isSelf && (
                <div className={styles.messageArea} onClick={openDM}>
                    <span className={styles.messagePlaceholder}>
                        Сообщение для @{displayName}…
                    </span>
                    <span className={styles.messageEmoji}>😊</span>
                </div>
            )}
        </div>
    );

    return createPortal(card, document.body);
});

export default MiniProfile;
