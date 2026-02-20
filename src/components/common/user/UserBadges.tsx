import { Shield } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import Tooltip from "../Tooltip";

enum Badges {
    Developer = 1,
    Translator = 2,
    Supporter = 4,
    ResponsibleDisclosure = 8,
    Founder = 16,
    PlatformModeration = 32,
    ActiveSupporter = 64,
    Paw = 128,
    EarlyAdopter = 256,
    Partner1 = 512,
    Partner2 = 1024,
    Partner3 = 2048,
    Designer = 4096,

}

const BadgesBase = styled.div`
    gap: 8px;
    display: flex;
    flex-direction: row;

    img {
        width: 24px;
        height: 24px;
    }
`;

interface Props {
    badges: number;
    uid?: string;
}

export default function UserBadges({ badges, uid }: Props) {
    return (
        <BadgesBase>
            {badges & Badges.Founder ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.founder" />
                    }>
                    <img src="/assets/badges/founder.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Developer ? (
                <Tooltip content={<Text id="app.navigation.tabs.dev" />}>
                    <img src="/assets/badges/developer.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Translator ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.translator" />
                    }>
                    <img
                        src="/assets/badges/translator.svg"
                        style={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            window.open(
                                "https://weblate.insrt.uk/projects/revolt/web-app/",
                                "_blank",
                            );
                        }}
                    />
                </Tooltip>
            ) : null}
            {badges & Badges.EarlyAdopter ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.early_adopter" />
                    }>
                    <img src="/assets/badges/early_adopter.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.PlatformModeration ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.moderation" />
                    }>
                    <img src="/assets/badges/moderation.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.ResponsibleDisclosure ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.responsible_disclosure" />
                    }>
                    <Shield size={24} color="gray" />
                </Tooltip>
            ) : null}
            {badges & Badges.Supporter ? (
                <Tooltip
                    content={
                        <Text id="app.special.popovers.user_profile.badges.supporter" />
                    }>
                    <img
                        src="/assets/badges/supporter.svg"
                        style={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            window.open(
                                "https://wiki.revolt.chat/notes/project/financial-support/",
                                "_blank",
                            );
                        }}
                    />
                </Tooltip>
            ) : null}

            {badges & Badges.Paw ? (
                <Tooltip content="🦊">
                    <img src="/assets/badges/paw.svg" />
                </Tooltip>
            ) : null}
            {uid === "01EX2NCWQ0CHS3QJF0FEQS1GR4" ? (
                <Tooltip content="🦝">
                    <img src="/assets/badges/raccoon.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Designer ? (
                <Tooltip content={<Text id="app.special.popovers.user_profile.badges.designer" />}>
                    <img src="/assets/badges/designer.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Partner1 ? (
                <Tooltip content={<Text id="app.special.popovers.user_profile.badges.partner1" />}>
                    <img src="/assets/badges/partner1.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Partner2 ? (
                <Tooltip content={<Text id="app.special.popovers.user_profile.badges.partner2" />}>
                    <img src="/assets/badges/partner2.svg" />
                </Tooltip>
            ) : null}
            {badges & Badges.Partner3 ? (
                <Tooltip content={<Text id="app.special.popovers.user_profile.badges.partner3" />}>
                    <img src="/assets/badges/partner3.svg" />
                </Tooltip>
            ) : null}
        </BadgesBase>
    );
}
