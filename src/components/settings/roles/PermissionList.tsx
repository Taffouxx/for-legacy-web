import Long from "long";
import { API, Channel, Permission, Server } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { Checkbox, OverrideSwitch } from "@revoltchat/ui";

import { PermissionSelect } from "./PermissionSelect";

interface Props {
    value: API.OverrideField | number;
    onChange: (v: API.OverrideField | number) => void;

    target?: Channel | Server;
    filter?: (keyof typeof Permission)[];
}

/**
 * All permissions that should be granted when "Administrator" is enabled.
 */
const ADMIN_PERMISSIONS: (keyof typeof Permission)[] =
    (Object.keys(Permission) as (keyof typeof Permission)[])
        .filter((key) => key !== "GrantAllSafe");

const AdminEntry = styled.label<{ active?: boolean }>`
    gap: 8px;
    width: 100%;
    margin: 8px 0;
    padding: 12px;
    display: flex;
    align-items: center;
    background: var(--secondary-background);
    border-radius: var(--border-radius);
    border: 2px solid ${(props) => (props.active ? "var(--accent)" : "transparent")};
    transition: border-color 0.2s;

    .title {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .name {
        font-weight: 700;
        color: var(--accent);
    }

    .description {
        font-size: 0.8em;
        color: var(--secondary-foreground);
    }
`;

/**
 * Compute the combined bitmask for all admin permissions.
 */
function getAdminBitmask(): number {
    let mask = Long.fromNumber(0);
    for (const key of ADMIN_PERMISSIONS) {
        mask = mask.or(Permission[key]);
    }
    return mask.toNumber();
}

/**
 * Check if all admin permission bits are set in the given value.
 */
function isAdminEnabled(value: API.OverrideField | number): boolean {
    const mask = Long.fromNumber(getAdminBitmask());
    if (typeof value === "object") {
        const allow = Long.fromNumber(value.a);
        return allow.and(mask).eq(mask);
    }
    const val = Long.fromNumber(value);
    return val.and(mask).eq(mask);
}

/**
 * Toggle all admin permissions on or off.
 */
function toggleAdmin(
    value: API.OverrideField | number,
    enable: boolean,
): API.OverrideField | number {
    const mask = Long.fromNumber(getAdminBitmask());

    if (typeof value === "object") {
        let allow = Long.fromNumber(value.a);
        let deny = Long.fromNumber(value.d);

        if (enable) {
            // Set all admin permissions to Allow, clear from Deny
            allow = allow.or(mask);
            deny = deny.and(mask.not());
        } else {
            // Clear all admin permissions from Allow
            allow = allow.and(mask.not());
        }

        return { a: allow.toNumber(), d: deny.toNumber() };
    }

    const val = Long.fromNumber(value, false);
    if (enable) {
        return val.or(mask).toNumber();
    }
    return val.and(mask.not()).toNumber();
}

export function PermissionList({ value, onChange, filter, target }: Props) {
    const adminEnabled = isAdminEnabled(value);

    // Only show the Admin toggle when editing server roles (not channel-specific filters)
    const showAdminToggle = !filter;

    return (
        <div>
            {showAdminToggle && (
                <AdminEntry active={adminEnabled}>
                    <span className="title">
                        <span className="name">
                            <Text id="permissions.Administrator.t">Administrator</Text>
                        </span>
                        <span className="description">
                            <Text id="permissions.Administrator.d" />
                        </span>
                    </span>
                    {typeof value === "object" ? (
                        <OverrideSwitch
                            state={adminEnabled ? "Allow" : "Neutral"}
                            onChange={(state) =>
                                onChange(toggleAdmin(value, state === "Allow"))
                            }
                        />
                    ) : (
                        <Checkbox
                            value={adminEnabled}
                            onChange={() =>
                                onChange(toggleAdmin(value, !adminEnabled))
                            }
                        />
                    )}
                </AdminEntry>
            )}
            {(Object.keys(Permission) as (keyof typeof Permission)[])
                .filter(
                    (key) =>
                        ![
                            "GrantAllSafe",
                            "ReadMessageHistory",
                            "Speak",
                            "Video",
                            "MuteMembers",
                            "DeafenMembers",
                            "MoveMembers",
                            "ManageWebhooks",
                        ].includes(key) &&
                        (!filter || filter.includes(key)),
                )
                .map((x) => (
                    <PermissionSelect
                        id={x}
                        key={x}
                        permission={Permission[x]}
                        value={value}
                        onChange={onChange}
                        target={target}
                    />
                ))}
        </div>
    );
}
