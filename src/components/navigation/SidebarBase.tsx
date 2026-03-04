import styled, { css } from "styled-components/macro";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

export default styled.div`
    height: 100%;
    display: flex;
    user-select: none;
    flex-direction: row;
    align-items: stretch;

    background-color: rgba(
        var(--background-rgb),
        max(var(--min-opacity), 0.75)
    );
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255, 255, 255, 0.055);
`;

export const GenericSidebarBase = styled.div<{
    mobilePadding?: boolean;
}>`
    height: 100%;
    width: 232px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: #1b1b1b;
    border-right: 1px solid rgba(255, 255, 255, 0.055);

    ${(props) =>
        props.mobilePadding &&
        isTouchscreenDevice &&
        css`
            padding-bottom: 50px;
        `}
`;

export const GenericSidebarList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > img {
        width: 100%;
    }
`;
