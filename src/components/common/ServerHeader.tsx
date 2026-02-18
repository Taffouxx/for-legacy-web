import { ChevronDown, Check, UserPlus } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";
import { openContextMenu } from "preact-context-menu";
import { modalController } from "../../controllers/modals/ModalController";

import Tooltip from "./Tooltip";

interface Props {
    server: Server;
    background?: boolean;
}

const Wrapper = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    user-select: none;
`;

const BannerBackground = styled.div<{ $url?: string }>`
    height: 120px;
    background-size: cover;
    background-position: center;
    background-image: ${props => props.$url ? `url('${props.$url}')` : "none"};
    background-color: var(--secondary-header);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60%;
        background: linear-gradient(to top, var(--secondary-background), transparent);
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: rgba(0, 0, 0, 0.1); /* Subtle darkening */
    }
`;

const HeaderContainer = styled.div<{ $hasBanner: boolean }>`
    position: relative;
    z-index: 2;
    height: var(--header-height);
    display: flex;
    align-items: center;
    padding: 0 10px 0 16px;
    font-weight: 700;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    ${props => props.$hasBanner && css`
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
    `}

    &:hover {
        background: ${props => props.$hasBanner ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.05)"};
        
        ${props => props.$hasBanner && css`
            backdrop-filter: blur(12px) saturate(180%);
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        `}
    }
`;

const ServerName = styled.div`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    color: white;
    letter-spacing: -0.2px;
    display: flex;
    align-items: center;
    gap: 6px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ActionButton = styled.div`
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: white;
    opacity: 0.7;
    transition: all 0.1s ease;
    flex-shrink: 0;

    &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.12);
    }

    &:active {
        transform: scale(0.9);
    }
`;

const PlaceholderSpacer = styled.div<{ $hasBanner: boolean }>`
    height: ${props => props.$hasBanner ? "120px" : "var(--header-height)"};
    flex-shrink: 0;
`;

export default observer(({ server }: Props) => {
    const bannerURL = server.generateBannerURL({ width: 480 });
    const hasBanner = typeof bannerURL !== "undefined";

    const openMenu = (e: any) => {
        openContextMenu("Menu", { server_list: server._id }, e);
    };

    const openInvite = (e: any) => {
        e.stopPropagation();
        const client = server.client;
        const channelId = server.channel_ids.find(id => {
            const chan = client.channels.get(id);
            return chan && chan.channel_type === "TextChannel";
        });

        if (channelId) {
            modalController.push({
                type: "create_invite",
                target: client.channels.get(channelId)! as any
            });
        }
    };

    return (
        <Wrapper>
            <BannerBackground $url={bannerURL} />
            <HeaderContainer
                $hasBanner={hasBanner}
                onClick={openMenu}
            >
                <ServerName>
                    {server.flags && server.flags & 1 ? (
                        <Tooltip
                            content={
                                <Text id="app.special.server-badges.official" />
                            }
                            placement={"bottom-start"}>
                            <svg width="18" height="18" style={{ flexShrink: 0 }}>
                                <image
                                    xlinkHref="/assets/badges/verified.svg"
                                    height="18"
                                    width="18"
                                />
                                <image
                                    xlinkHref="/assets/badges/revolt_r.svg"
                                    height="14"
                                    width="14"
                                    x="2"
                                    y="2.5"
                                    style={{
                                        filter: "brightness(0)",
                                    }}
                                />
                            </svg>
                        </Tooltip>
                    ) : undefined}
                    {server.flags && server.flags & 2 ? (
                        <Tooltip
                            content={
                                <Text id="app.special.server-badges.verified" />
                            }
                            placement={"bottom-start"}>
                            <svg width="18" height="18" style={{ flexShrink: 0 }}>
                                <image
                                    xlinkHref="/assets/badges/verified.svg"
                                    height="18"
                                    width="18"
                                />
                                <foreignObject x="2.5" y="2" width="13" height="13">
                                    <Check
                                        size={13}
                                        color="black"
                                        strokeWidth={10}
                                    />
                                </foreignObject>
                            </svg>
                        </Tooltip>
                    ) : undefined}
                    {server.name}
                    <ChevronDown size={14} style={{ opacity: 0.6, marginLeft: 'auto' }} />
                </ServerName>

                <Tooltip content={<Text id="app.context_menu.create_invite" />} placement="bottom">
                    <ActionButton onClick={openInvite}>
                        <UserPlus size={18} />
                    </ActionButton>
                </Tooltip>
            </HeaderContainer>
            <PlaceholderSpacer $hasBanner={hasBanner} />
        </Wrapper>
    );
});
