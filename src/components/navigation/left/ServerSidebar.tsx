import { observer } from "mobx-react-lite";
import { Redirect, useParams } from "react-router";
import styled, { css } from "styled-components/macro";

import { useTriggerEvents } from "preact-context-menu";
import { useEffect, useState, useMemo } from "preact/hooks";
import { DragDropContext } from "react-beautiful-dnd";

import { Category } from "@revoltchat/ui";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { internalEmit } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../../mobx/State";

import { useClient } from "../../../controllers/client/ClientController";
import CollapsibleSection from "../../common/CollapsibleSection";
import ServerHeader from "../../common/ServerHeader";
import { ChannelButton } from "../items/ButtonItem";
import ConnectionStatus from "../items/ConnectionStatus";
import { Droppable, Draggable } from "../../../lib/dnd";
import { Permission } from "revolt.js";

const ServerBase = styled.div`
    height: 100%;
    width: 232px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);
    border-start-start-radius: 8px;
    border-end-start-radius: 8px;
    overflow: hidden;

    ${isTouchscreenDevice &&
    css`
        padding-bottom: 50px;
    `}
`;

const ServerList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > svg {
        width: 100%;
    }

    [data-rbd-droppable-id] {
        min-height: 2px;
    }
`;

const DraggableWrapper = styled.div<{ isDragging?: boolean; isDraggingOver?: boolean }>`
    ${(props) =>
        props.isDragging &&
        css`
            opacity: 0.5;
        `}
    
    ${(props) =>
        props.isDraggingOver &&
        css`
            background: var(--background-modifier-hover);
            border-radius: 4px;
        `}
`;

const CategoryWrapper = styled.div<{ isDraggingOver?: boolean }>`
    margin-bottom: 8px;
    transition: background 0.2s ease;
    
    ${(props) =>
        props.isDraggingOver &&
        css`
            background: var(--background-modifier-hover);
            border-radius: 4px;
        `}
`;

const DropZone = styled.div<{ isDraggingOver?: boolean; active?: boolean }>`
    min-height: ${(props) => (props.active ? '20px' : '0')};
    height: ${(props) => (props.active ? 'auto' : '0')};
    transition: min-height 0.2s ease, background 0.2s ease;
    margin-bottom: ${(props) => (props.active ? '8px' : '0')};
    background: ${(props) => (props.isDraggingOver ? 'var(--background-modifier-hover)' : 'transparent')};
    border-radius: 4px;
    overflow: hidden;
`;

export default observer(() => {
    const client = useClient();
    const state = useApplicationState();
    const { server: server_id, channel: channel_id } = useParams<{
        server: string;
        channel?: string;
    }>();

    const server = client.servers.get(server_id);
    if (!server) return <Redirect to="/" />;

    const channel = channel_id ? client.channels.get(channel_id) : undefined;
    const [categories, setCategories] = useState(server.categories ?? []);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isSaving) {
            setCategories(server.categories ?? []);
        }
    }, [server.categories, isSaving]);

    // Track which channel the user was last on.
    useEffect(() => {
        if (!channel_id) return;
        if (!server_id) return;

        state.layout.setLastOpened(server_id, channel_id);
    }, [channel_id, server_id]);

    const uncategorisedIds = useMemo(() => {
        const set = new Set(server.channel_ids);
        for (const cat of categories) {
            for (const id of cat.channels) {
                set.delete(id);
            }
        }
        return Array.from(set);
    }, [server.channel_ids, categories]);

    const permissions = server.permission || 0;
    const canManageChannels = (permissions & Permission.ManageChannel) || server.owner === client.user?._id;

    function renderChannel(id: string, index: number) {
        const entry = client.channels.get(id);
        if (!entry) return null;

        const active = channel?._id === entry._id;
        const isUnread = entry.isUnread(state.notifications);
        const mentionCount = entry.getMentions(state.notifications);

        return (
            <Draggable key={id} draggableId={id} index={index} isDragDisabled={!canManageChannels}>
                {(provided, snapshot) => (
                    <DraggableWrapper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}>
                        <ConditionalLink
                            onClick={(e) => {
                                if (e.shiftKey) {
                                    internalEmit(
                                        "MessageBox",
                                        "append",
                                        `<#${entry._id}>`,
                                        "channel_mention",
                                    );
                                    e.preventDefault();
                                }
                            }}
                            active={active}
                            to={`/server/${server!._id}/channel/${entry._id}`}>
                            <ChannelButton
                                channel={entry}
                                active={active}
                                alert={
                                    mentionCount.length > 0
                                        ? "mention"
                                        : isUnread
                                            ? "unread"
                                            : undefined
                                }
                                compact
                                muted={state.notifications.isMuted(entry)}
                            />
                        </ConditionalLink>
                    </DraggableWrapper>
                )}
            </Draggable>
        );
    }

    return (
        <ServerBase>
            <ServerHeader server={server} />
            <ConnectionStatus />
            <DragDropContext
                onDragStart={() => internalEmit("Sidebar", "dragStart")}
                onDragEnd={async (result) => {
                    const { destination, source, draggableId, type } = result;
                    if (!destination) return;
                    if (
                        destination.droppableId === source.droppableId &&
                        destination.index === source.index
                    )
                        return;

                    setIsSaving(true);
                    try {
                        if (type === "category") {
                            const newCategories = [...categories];
                            const [moved] = newCategories.splice(source.index, 1);
                            newCategories.splice(destination.index, 0, moved);

                            const cleanCategories = newCategories.map(c => ({
                                id: c.id,
                                title: c.title,
                                channels: c.channels
                            }));

                            setCategories(newCategories);
                            await server.edit({ categories: cleanCategories });
                        } else {
                            // Channel reordering or movement
                            let newCategories = categories.map((cat) => ({
                                ...cat,
                                channels: [...cat.channels],
                            }));

                            const sourceCat = newCategories.find(c => c.id === source.droppableId);
                            const destCat = newCategories.find(c => c.id === destination.droppableId);

                            if (sourceCat) {
                                sourceCat.channels.splice(source.index, 1);
                            }
                            if (destCat) {
                                destCat.channels.splice(destination.index, 0, draggableId);
                            }

                            // If we are moving within/between uncategorized, we might need to update global order.
                            // But for now, let's focus on category persistence.
                            const cleanCategories = newCategories.map(c => ({
                                id: c.id,
                                title: c.title,
                                channels: c.channels
                            }));

                            // If dropped into uncategorized, and it was in a category, it is now removed from that category.
                            // The server will treat it as uncategorized.

                            setCategories(newCategories);

                            // Reorder global channel_ids logic for uncategorized
                            let newChannelIds = [...server.channel_ids];
                            if (destination.droppableId === "uncategorized" || source.droppableId === "uncategorized") {
                                // Remove from master if it moved or is being reordered
                                const actualSourceIndex = newChannelIds.indexOf(draggableId);
                                if (actualSourceIndex !== -1) {
                                    newChannelIds.splice(actualSourceIndex, 1);
                                }

                                if (destination.droppableId === "uncategorized") {
                                    // Calculate where it should go among OTHER uncategorized channels
                                    const currentUncategorized = newChannelIds.filter(id => !newCategories.some(c => c.channels.includes(id)));
                                    const targetId = currentUncategorized[destination.index];
                                    const actualDestIndex = targetId ? newChannelIds.indexOf(targetId) : newChannelIds.length;
                                    newChannelIds.splice(actualDestIndex, 0, draggableId);
                                }

                                await server.edit({ categories: cleanCategories, channels: newChannelIds });
                            } else {
                                await server.edit({ categories: cleanCategories });
                            }
                        }
                    } catch (e) {
                        console.error("Failed to save sidebar order:", e);
                        // Revert local state on error
                        setCategories(server.categories ?? []);
                    } finally {
                        setIsSaving(false);
                    }
                }}>
                <ServerList
                    {...useTriggerEvents("Menu", {
                        server_list: server._id,
                    })}>
                    <Droppable droppableId="categories" type="category">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <Droppable droppableId="uncategorized" type="channel">
                                    {(provided, snapshot) => (
                                        <DropZone
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            isDraggingOver={snapshot.isDraggingOver}
                                            active={uncategorisedIds.length > 0 || snapshot.isDraggingOver}
                                        >
                                            {uncategorisedIds.map((id, index) => renderChannel(id, index))}
                                            {provided.placeholder}
                                        </DropZone>
                                    )}
                                </Droppable>

                                {categories.map((category, index) => (
                                    <Draggable key={category.id} draggableId={category.id} index={index} isDragDisabled={!canManageChannels}>
                                        {(provided, snapshot) => (
                                            <DraggableWrapper
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                isDragging={snapshot.isDragging}>
                                                <Droppable droppableId={category.id} type="channel">
                                                    {(provided, dropSnapshot) => (
                                                        <CategoryWrapper
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            isDraggingOver={dropSnapshot.isDraggingOver}
                                                        >
                                                            <CollapsibleSection
                                                                id={`category_${category.id}`}
                                                                defaultValue
                                                                summary={
                                                                    <div {...provided.dragHandleProps} style={{ width: '100%' }}>
                                                                        <Category>{category.title}</Category>
                                                                    </div>
                                                                }>
                                                                {category.channels.map((id, chIndex) => renderChannel(id, chIndex))}
                                                            </CollapsibleSection>
                                                            {provided.placeholder}
                                                        </CategoryWrapper>
                                                    )}
                                                </Droppable>
                                            </DraggableWrapper>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </ServerList>
            </DragDropContext>
            <PaintCounter small />
        </ServerBase>
    );
});
