// @ts-nocheck
import {
    HelpCircle,
    ChevronUp,
    ChevronDown,
    Search,
    Edit,
    DotsHorizontalRounded,
} from "@styled-icons/boxicons-regular";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";
import styled from "styled-components/macro";

import { IntlContext } from "preact-i18n";
import { Text } from "preact-i18n";
import { useMemo, useState, useEffect, useContext } from "preact/hooks";

import {
    Button,
    SpaceBetween,
    H1,
    Checkbox,
    ColourSwatches,
    InputBox,
    Category,
    Row,
} from "@revoltchat/ui";

import Tooltip from "../../../components/common/Tooltip";
import { PermissionList } from "../../../components/settings/roles/PermissionList";
import { RoleOrDefault } from "../../../components/settings/roles/RoleSelection";
import { useSession, useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";
interface Props {
    server: Server;
}

const RoleReorderContainer = styled.div`
    margin: 16px 0;
`;

const RoleItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin: 12px 0;
    background: var(--secondary-background);
    border-radius: var(--border-radius);
`;

const RoleInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const RoleName = styled.div`
    font-weight: 600;
    color: var(--foreground);
`;

const RoleRank = styled.div`
    font-size: 12px;
    color: var(--secondary-foreground);
`;

const RoleControls = styled.div`
    display: flex;
    gap: 4px;
`;

const RoleReorderPanelWrapper = styled.div``;

/**
 * Hook to memo-ize role information with proper ordering
 * @param server Target server
 * @returns Role array with default at bottom
 */
export function useRolesForReorder(server: Server) {
    return useMemo(() => {
        const roles = [...server.orderedRoles] as RoleOrDefault[];

        roles.push({
            id: "default",
            name: "Default",
            permissions: server.default_permissions,
        });

        return roles;
    }, [server.roles, server.default_permissions]);
}

/**
 * Role reordering component
 */
const RoleReorderPanel = observer(
    ({ server, onExit }: Props & { onExit: () => void }) => {
        const initialRoles = useRolesForReorder(server);
        const [roles, setRoles] = useState(initialRoles);
        const [isReordering, setIsReordering] = useState(false);

        // Update local state when server roles change
        useMemo(() => {
            setRoles(useRolesForReorder(server));
        }, [server.roles, server.default_permissions]);

        const moveRoleUp = (index: number) => {
            if (index === 0 || roles[index].id === "default") return;

            const newRoles = [...roles];
            [newRoles[index - 1], newRoles[index]] = [
                newRoles[index],
                newRoles[index - 1],
            ];
            setRoles(newRoles);
        };

        const moveRoleDown = (index: number) => {
            // Can't move down if it's the last non-default role or if it's default
            if (index >= roles.length - 2 || roles[index].id === "default")
                return;

            const newRoles = [...roles];
            [newRoles[index], newRoles[index + 1]] = [
                newRoles[index + 1],
                newRoles[index],
            ];
            setRoles(newRoles);
        };

        const saveReorder = async () => {
            setIsReordering(true);
            try {
                const nonDefaultRoles = roles.filter(
                    (role) => role.id !== "default",
                );
                const roleIds = nonDefaultRoles.map((role) => role.id);

                const session = useSession()!;
                const client = session.client!;

                // Make direct API request since it's not in r.js as of writing
                // @ts-expect-error property does not exist in old SDK typings
                await client.api.patch(`/servers/${server._id}/roles/ranks`, {
                    ranks: roleIds,
                });

                console.log("Roles reordered successfully");
            } catch (error) {
                console.error("Failed to reorder roles:", error);
                setRoles(initialRoles);
            } finally {
                setIsReordering(false);
            }
        };

        const hasChanges = !isEqual(
            roles.filter((r) => r.id !== "default").map((r) => r.id),
            initialRoles.filter((r) => r.id !== "default").map((r) => r.id),
        );

        return (
            <RoleReorderPanelWrapper>
                <SpaceBetween>
                    <H1>
                        <Text id="app.settings.permissions.role_ranking" />
                    </H1>
                    <Row>
                        <Button
                            palette="secondary"
                            onClick={onExit}
                            style={{ marginBottom: "16px" }}>
                            <Text id="app.special.modals.actions.back" />
                        </Button>
                        <Button
                            palette="secondary"
                            disabled={!hasChanges || isReordering}
                            onClick={saveReorder}>
                            <Text id="app.special.modals.actions.save" />
                        </Button>
                    </Row>
                </SpaceBetween>

                <RoleReorderContainer>
                    {roles.map((role, index) => (
                        <RoleItem key={role.id}>
                            <RoleInfo>
                                <RoleName>{role.name}</RoleName>
                                <RoleRank>
                                    {role.id === "default" ? (
                                        <Text id="app.settings.permissions.default_desc" />
                                    ) : (
                                        <>
                                            <Text id="app.settings.permissions.role_ranking" />{" "}
                                            {index}
                                        </>
                                    )}
                                </RoleRank>
                            </RoleInfo>

                            {role.id !== "default" && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <Button
                                        palette="secondary"
                                        disabled={index === 0}
                                        onClick={() => moveRoleUp(index)}
                                        style={{ padding: '4px 8px', minWidth: 'auto' }}>
                                        <ChevronUp size={16} />
                                    </Button>
                                    <Button
                                        palette="secondary"
                                        disabled={index >= roles.length - 2}
                                        onClick={() => moveRoleDown(index)}
                                        style={{ padding: '4px 8px', minWidth: 'auto' }}>
                                        <ChevronDown size={16} />
                                    </Button>
                                </div>
                            )}
                        </RoleItem>
                    ))}
                </RoleReorderContainer>
            </RoleReorderPanelWrapper>
        );
    },
);

/**
 * Hook to memo-ize role information.
 * @param server Target server
 * @returns Role array
 */
export function useRoles(server: Server) {
    return useMemo(
        () =>
            [
                // Pull in known server roles.
                ...server.orderedRoles,
                // Include the default server permissions.
                {
                    id: "default",
                    name: "Default",
                    permissions: server.default_permissions,
                },
            ] as RoleOrDefault[],
        [server.roles, server.default_permissions],
    );
}

// -- STYLED COMPONENTS FOR THE LIST VIEW --
const RoleContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const RoleColor = styled.div<{ color?: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color || 'var(--foreground)'};
`;

/**
 * Updated Roles settings menu with reordering panel
 */
export const Roles = observer(({ server }: Props) => {
    const client = useClient();
    const { intl } = useContext(IntlContext) as any;
    const [showReorderPanel, setShowReorderPanel] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const currentRoles = useRoles(server);
    const customRoles = currentRoles.filter(r => r.id !== "default");

    // Recalculate editing state safely
    const currentEditingRole = editingRoleId 
        ? currentRoles.find(r => r.id === editingRoleId) 
        : null;

    useEffect(() => {
        // If the role we were editing gets deleted externally, go back
        if (editingRoleId && !currentEditingRole) {
            setEditingRoleId(null);
        }
    }, [currentRoles, editingRoleId]);


    // @ts-expect-error bypass styled component defaultProps recursion issue in Preact
    const DeleteRoleButton = styled.div`
        margin: 16px 0;
    `;

    // @ts-expect-error bypass styled component defaultProps recursion issue in Preact
    const ReorderButton = styled.div`
        margin-inline: auto 8px;
    `;

    if (showReorderPanel) {
        return (
            <div>
                <RoleReorderPanel
                    server={server}
                    onExit={() => setShowReorderPanel(false)}
                />
            </div>
        );
    }

    const onCreateRoleClick = () => {
        modalController.push({
            type: "create_role",
            server,
            callback: (roleId) => {
                setEditingRoleId(roleId);
            }
        });
    };

    if (editingRoleId && currentEditingRole) {
        // --- EDITOR VIEW ---
        const [value, setValue] = useState<Partial<RoleOrDefault>>({});
        const currentRoleValue = { ...currentEditingRole, ...value };

        function save() {
            const { permissions: permsCurrent, ...current } = currentEditingRole!;
            const { permissions: permsValue, ...newValue } = currentRoleValue;

            if (!isEqual(permsCurrent, permsValue)) {
                server.setPermissions(
                    editingRoleId!,
                    typeof permsValue === "number"
                        ? permsValue
                        : { allow: permsValue.a, deny: permsValue.d }
                );
            }

            if (!isEqual(current, newValue)) {
                server.editRole(editingRoleId!, newValue as any);
            }
            
            // Re-sync local overrides
            setValue({});
        }

        function deleteRole() {
            server.deleteRole(editingRoleId!);
            setEditingRoleId(null);
        }

        return (
            <div>
                <Button palette="secondary" onClick={() => { setEditingRoleId(null); setValue({}); }} style={{ marginBottom: "16px" }}>
                    <Text id="app.special.modals.actions.back" />
                </Button>
                <SpaceBetween>
                    <H1>
                        <Text
                            id="app.settings.actions.edit"
                            fields={{ name: currentEditingRole.name }}
                        />
                    </H1>
                    <ReorderButton>
                        <Button
                            palette="secondary"
                            onClick={() => setShowReorderPanel(true)}>
                            <Text id="app.settings.permissions.role_ranking" />
                        </Button>
                    </ReorderButton>
                    <Button
                        palette="secondary"
                        disabled={isEqual(currentEditingRole, currentRoleValue)}
                        onClick={save}>
                        <Text id="app.special.modals.actions.save" />
                    </Button>
                </SpaceBetween>
                <hr />
                {editingRoleId !== "default" && (
                    <>
                        <section>
                            <Category>
                                <Text id="app.settings.permissions.role_name" />
                            </Category>
                            <p>
                                <InputBox
                                    value={currentRoleValue.name}
                                    onChange={(e) =>
                                        setValue({
                                            ...value,
                                            name: e.currentTarget.value,
                                        })
                                    }
                                    palette="secondary"
                                />
                            </p>
                        </section>
                        <section>
                            <Category>{"Role ID"}</Category>
                            <div style={{ gap: '4px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--tertiary-foreground)' }}>
                                <Tooltip content={"This is a unique identifier for this role." as any}>
                                    {<HelpCircle size={16} /> as any}
                                </Tooltip>
                                <Tooltip content={<Text id="app.special.copy" /> as any}>
                                    {<a onClick={() => modalController.writeText(currentEditingRole.id)} style={{ color: 'var(--tertiary-foreground)' }}>
                                        {currentEditingRole.id}
                                    </a> as any}
                                </Tooltip>
                            </div>
                        </section>
                        <section>
                            <Category>
                                <Text id="app.settings.permissions.role_colour" />
                            </Category>
                            <p>
                                <ColourSwatches
                                    value={currentRoleValue.colour ?? "gray"}
                                    onChange={(colour) => setValue({ ...value, colour })}
                                />
                            </p>
                        </section>
                        <section>
                            <Category>
                                <Text id="app.settings.permissions.role_options" />
                            </Category>
                            <p>
                                <Checkbox
                                    value={currentRoleValue.hoist ?? false}
                                    onChange={(hoist) => setValue({ ...value, hoist })}
                                    title={<Text id="app.settings.permissions.hoist_role" />}
                                    description={<Text id="app.settings.permissions.hoist_desc" />}
                                />
                            </p>
                        </section>
                    </>
                )}
                <h1>
                    <Text id="app.settings.permissions.edit_title" />
                </h1>
                <PermissionList
                    value={currentRoleValue.permissions}
                    onChange={(permissions) =>
                        setValue({ ...value, permissions } as RoleOrDefault)
                    }
                    target={server}
                />
                {editingRoleId !== "default" && (
                    <>
                        <hr />
                        <h1>
                            <Text id="app.settings.categories.danger_zone" />
                        </h1>
                        <DeleteRoleButton>
                            <Button
                                palette="error"
                                compact
                                onClick={deleteRole}>
                                <Text id="app.settings.permissions.delete_role" />
                            </Button>
                        </DeleteRoleButton>
                    </>
                )}
            </div>
        );
    }

    // --- LIST VIEW ---
    const isEditingDefault = editingRoleId === "default";
    const filteredRoles = customRoles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <H1>Роли</H1>
            
            {customRoles.length === 0 ? (
                <>
                    <div style={{ background: 'linear-gradient(135deg, #AABCFF 0%, #D4E1FF 100%)', borderRadius: '8px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--secondary-background)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', zIndex: 2 }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#5A6EF4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>G</div>
                            <div style={{ fontWeight: 600 }}>Graggle#0000</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                                {['#5A6EF4', '#9B51E0', '#27AE60', '#EB5757', '#F2994A', '#2D9CDB'].map((color, i) => (
                                    <span key={i} style={{ background: 'var(--tertiary-background)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', color: 'var(--secondary-foreground)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                                        {['D&D', 'FFXIV', 'WoW', 'танк', 'дпс', 'поддержка'][i]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>
                            <Text id="app.settings.permissions.roles_empty_title" />
                        </h2>
                        <p style={{ color: 'var(--secondary-foreground)', fontSize: '14px', marginBottom: '16px' }}>
                            <Text id="app.settings.permissions.roles_empty_description" />
                        </p>
                        <Button onClick={onCreateRoleClick}>
                            <Text id="app.settings.permissions.create_role" />
                        </Button>
                    </div>
                </>
            ) : (
                <div style={{ color: 'var(--secondary-foreground)', fontSize: '14px', marginBottom: '8px' }}>
                    Используйте роли для создания групп с участниками сервера и настройки их прав.
                </div>
            )}

            <div 
                style={{ background: 'var(--secondary-background)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setEditingRoleId("default")}
            >
                <div style={{ opacity: 0.6, display: 'flex' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                </div>
                <div style={{ flex: 1, marginLeft: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                        <Text id="app.settings.permissions.default_role" />
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--secondary-foreground)', margin: 0 }}>
                        <Text id="app.settings.permissions.default_role_desc" />
                    </p>
                </div>
                <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', opacity: 0.5 }} />
            </div>

            {customRoles.length > 0 && (
                <>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'center' }}>
                        <InputBox 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            placeholder={intl.dictionary["app.settings.permissions.search_role"] as string || "Search roles"}
                            style={{ flex: 1 }}
                        />
                        <Button onClick={onCreateRoleClick}>
                            <Text id="app.settings.permissions.create_role" />
                        </Button>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)', marginTop: '8px' }}>
                        <Text id="app.settings.permissions.role_color_info" />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', padding: '0 16px 8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-foreground)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ flex: 2 }}>
                                <Text id="app.settings.permissions.roles_title" /> — {customRoles.length}
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text id="app.settings.permissions.roles_members" />
                            </div>
                        </div>
                        
                        {filteredRoles.map(role => {
                            // Counting members with this role
                            const memberCount = Array.from(client.members.values()).filter(m => m._id.server === server._id && m.roles?.includes(role.id)).length;
                            
                            return (
                                <div key={role.id} onClick={() => setEditingRoleId(role.id)} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground)', fontWeight: 500 }}>
                                        <div style={{ backgroundColor: role.colour || 'var(--foreground)', width: '12px', height: '12px', borderRadius: '50%' }} />
                                        {role.name}
                                    </div>
                                    <div style={{ flex: 1, color: 'var(--secondary-foreground)', fontSize: '14px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px', opacity: 0.7 }}>
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        {memberCount}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button palette="secondary" compact onClick={(e) => { e.stopPropagation(); setEditingRoleId(role.id); }}>
                                            <Edit size={16} />
                                        </Button>
                                        <Button palette="secondary" compact onClick={(e) => { e.stopPropagation(); /* TODO: contextual menu */ }}>
                                            <DotsHorizontalRounded size={16} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
});
