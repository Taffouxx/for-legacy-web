import {
    Menu,
    Plus,
} from "@styled-icons/boxicons-regular";
import {
    Envelope,
    Edit,
    UserPlus,
    Group,
    InfoCircle,
    Calendar,
    User as UserIconSolid,
    CheckCircle,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { UserPermission, API } from "revolt.js";

import styles from "./UserProfile.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useLayoutEffect, useState, useCallback, useMemo } from "preact/hooks";

import {
    Button,
    Modal,
} from "@revoltchat/ui";

import { noop } from "../../../../lib/js";

import UserBadges from "../../../../components/common/user/UserBadges";
import UserIcon from "../../../../components/common/user/UserIcon";
import { useSession } from "../../../../controllers/client/ClientController";
import { modalController } from "../../../../controllers/modals/ModalController";
import { ModalProps } from "../../types";
import { useApplicationState } from "../../../../mobx/State";

export const UserProfile = observer(
    ({
        user_id,
        isPlaceholder,
        placeholderProfile,
        forceGlobal,
        serverId: propsServerId,
        compact,
        ...props
    }: ModalProps<"user_profile">) => {
        const [profile, setProfile] = useState<
            undefined | null | API.UserProfile
        >(undefined);
        const [mutual, setMutual] = useState<
            undefined | null | API.MutualResponse
        >(undefined);
        const [showMenu, setShowMenu] = useState(false);
        const [copied, setCopied] = useState(false);

        const history = useHistory();
        const session = useSession()!;
        const client = session.client!;
        const state = useApplicationState();

        const user = client.users.get(user_id);

        const [tab, setTab] = useState("dashboard");

        if (!user) {
            if (props.onClose) useEffect(props.onClose, []);
            return null;
        }

        // Logic for Server Context
        const lastSection = state.layout.getLastSection();
        const contextServerId = useMemo(() => {
            if (propsServerId) return propsServerId;
            if (lastSection && lastSection !== "home" && lastSection !== "discover") {
                return lastSection;
            }
            return null;
        }, [propsServerId, lastSection]);

        const viewingGlobal = forceGlobal === true;
        const activeServerId = viewingGlobal ? null : contextServerId;
        const server = activeServerId ? client.servers.get(activeServerId) : null;
        const member = (server && user) ? client.members.getKey({ server: server._id, user: user._id }) : null;

        const mutualGroups = [...client.channels.values()].filter(
            (channel) =>
                channel?.channel_type === "Group" &&
                channel.recipient_ids!.includes(user_id),
        );

        useLayoutEffect(() => {
            if (!user_id) return;
            if (typeof profile !== "undefined") setProfile(undefined);
            if (typeof mutual !== "undefined") setMutual(undefined);
        }, [user_id]);

        useEffect(() => {
            if (isPlaceholder) {
                setProfile(placeholderProfile);
            }
        }, [isPlaceholder, placeholderProfile]);

        useEffect(() => {
            if (isPlaceholder) return;
            if (session.state === "Online" && typeof mutual === "undefined") {
                setMutual(null);
                user.fetchMutual().then(setMutual);
            }
        }, [mutual, session.state, isPlaceholder, user]);

        useEffect(() => {
            if (isPlaceholder) return;
            if (session.state === "Online" && typeof profile === "undefined") {
                setProfile(null);
                if (user.permission & UserPermission.ViewProfile) {
                    user.fetchProfile().then(setProfile).catch(noop);
                }
            }
        }, [profile, session.state, isPlaceholder, user]);

        const bannerURL = profile && client.generateFileURL(
            profile.background as any,
            { width: 1000 },
            true,
        );

        const registrationDate = new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(user.createdAt));

        const memberJoinDate = member?.joined_at ? new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(member.joined_at)) : null;

        const handleCopyId = useCallback(() => {
            navigator.clipboard.writeText(user._id);
            setCopied(true);
            setShowMenu(false);
            setTimeout(() => setCopied(false), 2000);
        }, [user._id]);

        const handleViewMainProfile = useCallback(() => {
            setShowMenu(false);
            props.onClose?.();
            setTimeout(() => {
                modalController.push({
                    type: 'user_profile',
                    user_id: user._id,
                    forceGlobal: true,
                    serverId: contextServerId || undefined
                });
            }, 50);
        }, [user._id, props.onClose, contextServerId]);

        const handleViewServerProfile = useCallback(() => {
            setShowMenu(false);
            props.onClose?.();
            setTimeout(() => {
                modalController.push({
                    type: 'user_profile',
                    user_id: user._id,
                    forceGlobal: false,
                    serverId: contextServerId || undefined
                });
            }, 50);
        }, [user._id, props.onClose, contextServerId]);

        const leftPanel = (
            <div className={styles.leftColumn}>
                <div
                    className={styles.miniBanner}
                    style={{ backgroundImage: bannerURL ? `url(${bannerURL})` : 'none' }}
                />

                <div className={styles.avatarWrapper}>
                    <UserIcon
                        size={100}
                        target={user}
                        status
                        animate
                        hover={typeof user.avatar !== "undefined"}
                        override={member?.avatarURL}
                    />
                </div>

                <div className={styles.body}>
                    <div className={styles.identity}>
                        <div className={styles.details}>
                            <span className={styles.displayname}>
                                {member?.nickname ?? (user as any).display_name ?? user.username}
                            </span>
                            <div className={styles.nameRow}>
                                <span className={styles.username}>
                                    {user.username}#{(user as any).discriminator}
                                </span>
                                {user.badges && user.badges > 0 && (
                                    <div className={styles.badges}>
                                        <UserBadges badges={user.badges} uid={user._id} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            {user.relationship === "User" && !isPlaceholder ? (
                                <Button
                                    palette="accent"
                                    onClick={() => {
                                        props.onClose?.();
                                        history.push(`/settings/profile`);
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Edit size={18} />
                                        <span><Text id="app.special.popovers.user_profile.edit_profile" /></span>
                                    </div>
                                </Button>
                            ) : (
                                !user.bot && (user.relationship === "Incoming" || user.relationship === "None" || user.relationship === null) && (
                                    <Button palette="accent" onClick={() => user.addFriend()}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <UserPlus size={18} />
                                            <span><Text id="app.special.popovers.user_profile.add_friend" /></span>
                                        </div>
                                    </Button>
                                )
                            )}

                            <div className={styles.menuWrapper}>
                                <div className={styles.iconButton} onClick={() => setShowMenu(!showMenu)}>
                                    <Menu size={24} />
                                </div>
                                {showMenu && (
                                    <div className={styles.dropdown}>
                                        {!viewingGlobal && contextServerId && (
                                            <div onClick={handleViewMainProfile}>
                                                <Text id="app.special.popovers.user_profile.view_main" />
                                            </div>
                                        )}
                                        {viewingGlobal && contextServerId && (
                                            <div onClick={handleViewServerProfile}>
                                                <Text id="app.special.popovers.user_profile.view_server" />
                                            </div>
                                        )}
                                        <div onClick={handleCopyId}>
                                            <Text id="app.special.popovers.user_profile.copy_id" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {copied && (
                            <div className={styles.copyToast}>
                                <CheckCircle size={14} />
                                <span><Text id="app.special.popovers.user_profile.copied" /></span>
                            </div>
                        )}

                        {user.status?.text && (
                            <div className={styles.statusText}>
                                {user.status.text}
                            </div>
                        )}

                        <div className={styles.divider} />

                        <div className={styles.section}>
                            <div className={styles.category}><Text id="app.special.popovers.user_profile.member_since" /></div>
                            <div className={styles.infoRow}>
                                <UserIconSolid size={18} />
                                <span>{registrationDate}</span>
                            </div>
                            {memberJoinDate && (
                                <div className={styles.infoRow}>
                                    <Group size={18} />
                                    <span>{memberJoinDate}</span>
                                </div>
                            )}
                        </div>

                        {server && member && member.roles && member.roles.length > 0 && (
                            <div className={styles.section}>
                                <div className={styles.category}><Text id="app.special.popovers.user_profile.roles" /></div>
                                <div className={styles.roles}>
                                    {member.roles.map(roleId => {
                                        const role = (server?.roles as any)?.[roleId];
                                        if (!role) return null;
                                        return (
                                            <div key={roleId} className={styles.role}>
                                                <div
                                                    className={styles.dot}
                                                    style={{ background: role.colour ?? 'var(--accent)' }}
                                                />
                                                <span>{role.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

        const rightPanel = (
            <div className={styles.rightColumn}>
                <div className={styles.tabs}>
                    <div
                        data-active={tab === "dashboard"}
                        onClick={() => setTab("dashboard")}>
                        <Text id="app.special.popovers.user_profile.tabs.dashboard" />
                    </div>
                    <div
                        data-active={tab === "activity"}
                        onClick={() => setTab("activity")}>
                        <Text id="app.special.popovers.user_profile.tabs.activity" />
                    </div>
                    <div
                        data-active={tab === "wishlist"}
                        onClick={() => setTab("wishlist")}>
                        <Text id="app.special.popovers.user_profile.tabs.wishlist" />
                    </div>
                </div>
                <div className={styles.content}>
                    {tab === "dashboard" && (
                        <div className={styles.emptyState}>
                            <InfoCircle size={64} />
                            <div><Text id="app.special.popovers.user_profile.widgets_soon" /></div>
                        </div>
                    )}
                </div>
            </div>
        );

        const content = (
            <div
                className={`${styles.modal} ${compact ? styles.compact : ""}`}
                style={isPlaceholder ? {
                    position: 'relative',
                    width: '100%',
                    height: compact ? 'auto' : '100%',
                    minHeight: compact ? '500px' : '600px',
                    borderRadius: '24px',
                    overflow: 'hidden'
                } : {}}>
                <div
                    className={styles.modalBanner}
                    style={{ backgroundImage: bannerURL ? `url(${bannerURL})` : 'none' }}
                />
                <div className={styles.container} style={compact ? { padding: '16px' } : {}}>
                    {leftPanel as any}
                    {!compact && (rightPanel as any)}
                </div>
            </div>
        );

        if (isPlaceholder) return content;

        return (
            <Modal
                {...props}
                transparent
                className={styles.modal}
                maxWidth="900px">
                {content}
            </Modal>
        );
    },
);
