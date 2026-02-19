import { Markdown } from "@styled-icons/boxicons-logos";
import { UserCircle, ChevronRight } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation } from "react-router-dom";
import { API } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import { Button, LineDivider, Tip, CategoryButton, InputBox } from "@revoltchat/ui";
import { useApplicationState } from "../../../mobx/State";

import { noop } from "../../../lib/js";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { useTranslation } from "../../../lib/i18n";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import { useSession } from "../../../controllers/client/ClientController";
import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";
import { modalController } from "../../../controllers/modals/ModalController";
import { UserProfile } from "../../../controllers/modals/components/legacy/UserProfile";

export const Profile = observer(() => {
    const translate = useTranslation();
    const session = useSession()!;
    const client = session.client!;
    const state = useApplicationState();
    const location = useLocation();

    const [profile, setProfile] = useState<undefined | API.UserProfile>(
        undefined,
    );

    const query = new URLSearchParams(location.search);
    const serverIdQuery = query.get("server");

    const [mode, setMode] = useState<"user" | "server">(serverIdQuery ? "server" : "user");
    const [selectedServer, setSelectedServer] = useState<string | undefined>(serverIdQuery ?? undefined);
    const [serverNickname, setServerNickname] = useState<string | undefined>(undefined);
    const [serverNicknameChanged, setServerNicknameChanged] = useState(false);

    useEffect(() => {
        if (selectedServer) {
            const member = client.members.getKey({ server: selectedServer, user: client.user!._id });
            setServerNickname(member?.nickname ?? "");
            setServerNicknameChanged(false);
        }
    }, [selectedServer, client.members]);

    const refreshProfile = useCallback(() => {
        client
            .user!.fetchProfile()
            .then((profile) => setProfile(profile ?? {}));
    }, [client.user, setProfile]);

    useEffect(() => {
        if (profile === undefined && session.state === "Online") {
            refreshProfile();
        }
    }, [profile, session.state, refreshProfile]);

    const [changed, setChanged] = useState(false);
    function setContent(content?: string) {
        setProfile({ ...profile, content });
        if (!changed) setChanged(true);
    }

    function switchPage(to: string) {
        (history as any).replace(`/settings/${to}`);
    }

    const {
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur,
        ...autoCompleteProps
    } = useAutoComplete(setContent, {
        users: { type: "all" },
    });

    return (
        <div className={styles.user}>
            <div className={styles.profileSwitcher}>
                <div
                    data-active={mode === "user"}
                    onClick={() => setMode("user")}>
                    <Text id="app.settings.pages.profile.main_profile" />
                </div>
                <div
                    data-active={mode === "server"}
                    onClick={() => setMode("server")}>
                    <Text id="app.settings.pages.profile.server_profiles" />
                </div>
            </div>

            <div className={styles.profileGrid}>
                <div className={styles.profileFields}>
                    {mode === "user" ? (
                        <div key="user-profile">
                            <div className={styles.section}>
                                <h3><Text id="app.settings.pages.profile.display_name" /></h3>
                                <InputBox
                                    value={client.user!.username}
                                    onChange={() => modalController.push({ type: "modify_displayname" })}
                                    readOnly
                                />
                                <Tip>{translate("app.settings.pages.profile.display_name_tip")}</Tip>
                            </div>

                            <hr />

                            <div className={styles.row}>
                                <div className={styles.pfp}>
                                    <h3>
                                        <Text id="app.settings.pages.profile.profile_picture" />
                                    </h3>
                                    <FileUploader
                                        width={92}
                                        height={92}
                                        style="icon"
                                        fileType="avatars"
                                        behaviour="upload"
                                        maxFileSize={4_000_000}
                                        onUpload={(avatar) => client.users.edit({ avatar })}
                                        remove={() => client.users.edit({ remove: ["Avatar"] })}
                                        defaultPreview={client.user!.generateAvatarURL(
                                            { max_side: 256 },
                                            true,
                                        )}
                                        previewURL={client.user!.generateAvatarURL(
                                            { max_side: 256 },
                                            true,
                                        )}
                                    />
                                </div>
                                <div className={styles.background}>
                                    <h3>
                                        <Text id="app.settings.pages.profile.custom_background" />
                                    </h3>
                                    <FileUploader
                                        height={92}
                                        style="banner"
                                        behaviour="upload"
                                        fileType="backgrounds"
                                        maxFileSize={6_000_000}
                                        onUpload={async (background) => {
                                            await client.users.edit({
                                                profile: { background },
                                            });
                                            refreshProfile();
                                        }}
                                        remove={async () => {
                                            await client.users.edit({
                                                remove: ["ProfileBackground"],
                                            });
                                            setProfile({ ...profile, background: undefined });
                                        }}
                                        previewURL={
                                            profile?.background
                                                ? client.generateFileURL(
                                                    profile.background,
                                                    { width: 1000 },
                                                    true,
                                                )
                                                : undefined
                                        }
                                    />
                                </div>
                            </div>

                            <hr />

                            <div className={styles.section}>
                                <h3>
                                    <Text id="app.settings.pages.profile.info" />
                                </h3>
                                <AutoComplete detached {...autoCompleteProps} />
                                <TextAreaAutoSize
                                    maxRows={10}
                                    minHeight={120}
                                    maxLength={2000}
                                    value={profile?.content ?? ""}
                                    disabled={typeof profile === "undefined"}
                                    onChange={(ev) => {
                                        onChange(ev);
                                        setContent(ev.currentTarget.value);
                                    }}
                                    placeholder={translate(
                                        `app.settings.pages.profile.${typeof profile === "undefined"
                                            ? "fetching"
                                            : "placeholder"
                                        }`,
                                    )}
                                    onKeyUp={onKeyUp}
                                    onKeyDown={onKeyDown}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                                <div className={styles.markdown}>
                                    <Markdown size="16" />
                                    <h5>
                                        {translate("app.settings.pages.profile.markdown_tip")}
                                    </h5>
                                </div>
                            </div>

                            <p>
                                <Button
                                    palette="secondary"
                                    onClick={() => {
                                        setChanged(false);
                                        client.users.edit({
                                            profile: { content: profile?.content },
                                        });
                                    }}
                                    disabled={!changed}>
                                    <Text id="app.special.modals.actions.save" />
                                </Button>
                            </p>

                            <LineDivider />
                            <Tip>
                                {
                                    (
                                        <span>
                                            {translate("app.settings.pages.profile.username_tip")}{" "}
                                            <a onClick={() => switchPage("account")}>
                                                {translate("app.settings.pages.profile.username_tip_link")}
                                            </a>
                                        </span>
                                    ) as any
                                }
                            </Tip>
                        </div>
                    ) : selectedServer ? (
                        <div className={styles.serverProfileEditor}>
                            <Button palette="secondary" onClick={() => setSelectedServer(undefined)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ChevronRight style={{ transform: 'rotate(180deg)', display: 'inline-block' }} size={18} />
                                    {translate("app.settings.pages.profile.back_to_list")}
                                </div>
                            </Button>

                            <hr style={{ margin: '24px 0', opacity: 0.1 }} />

                            {(() => {
                                const server = client.servers.get(selectedServer);
                                const member = client.members.getKey({ server: selectedServer, user: client.user!._id });
                                if (!server || !member) return <div>{translate("app.settings.pages.profile.not_found")}</div>;

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img src={server.generateIconURL({ max_side: 64 })} style={{ borderRadius: '50%', width: 32, height: 32 }} />
                                            <h2 style={{ margin: 0 }}>{translate("app.settings.pages.profile.server_profile_title", { name: server.name })}</h2>
                                        </div>

                                        <div className={styles.section}>
                                            <h3><Text id="app.settings.pages.profile.nickname" /></h3>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <InputBox
                                                        value={serverNickname ?? ""}
                                                        placeholder={client.user!.username}
                                                        onChange={(e: any) => {
                                                            setServerNickname(e.currentTarget.value);
                                                            setServerNicknameChanged(true);
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    palette="accent"
                                                    disabled={!serverNicknameChanged}
                                                    onClick={() => {
                                                        member.edit({ nickname: serverNickname });
                                                        setServerNicknameChanged(false);
                                                    }}>
                                                    {translate("app.special.modals.actions.save")}
                                                </Button>
                                                <Button
                                                    palette="secondary"
                                                    disabled={!member.nickname}
                                                    onClick={() => {
                                                        member.edit({ remove: ["Nickname"] });
                                                        setServerNickname("");
                                                        setServerNicknameChanged(false);
                                                    }}>
                                                    {translate("app.special.modals.actions.reset")}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className={styles.section}>
                                            <h3><Text id="app.settings.pages.profile.server_avatar" /></h3>
                                            <FileUploader
                                                width={92}
                                                height={92}
                                                style="icon"
                                                fileType="avatars"
                                                behaviour="upload"
                                                maxFileSize={4_000_000}
                                                onUpload={(avatar) => member.edit({ avatar }).then(noop)}
                                                remove={() => member.edit({ remove: ["Avatar"] }).then(noop)}
                                                defaultPreview={client.user!.generateAvatarURL({ max_side: 256 })}
                                                previewURL={member.avatarURL}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className={styles.serverProfiles}>
                            <h3><Text id="app.settings.pages.profile.select_server" /></h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {(state as any).ordering.orderedServers.map((sid: any) => {
                                    const id = typeof sid === 'string' ? sid : sid._id;
                                    const server = client.servers.get(id);
                                    if (!server) return null;
                                    return (
                                        <CategoryButton
                                            key={id}
                                            onClick={() => setSelectedServer(id)}
                                            icon={(<img src={server.generateIconURL({ max_side: 32 })} style={{ borderRadius: '50%', width: 24, height: 24, objectFit: 'cover' }} />) as any}
                                            action="chevron">
                                            <div style={{ fontWeight: 600 }}>{server.name}</div>
                                        </CategoryButton>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.profilePreviewColumn}>
                    <h3><Text id="app.special.modals.actions.preview" /></h3>
                    <div className={styles.preview}>
                        <UserProfile
                            user_id={client.user!._id}
                            isPlaceholder={true}
                            placeholderProfile={profile}
                            compact={true}
                            serverId={selectedServer}
                            {...({} as any)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
