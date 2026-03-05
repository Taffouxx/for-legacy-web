// Простые заглушки для @revoltchat/ui компонентов

import styled from "styled-components";
import { ComponentChildren } from "preact";

// Интерфейсы для компонентов
interface ButtonProps {
    children?: ComponentChildren;
    palette?: string;
    disabled?: boolean;
    onClick?: () => void;
}

interface CategoryProps {
    children?: ComponentChildren;
    palette?: string;
}

interface InputBoxProps {
    value?: string;
    onChange?: (e: any) => void;
    placeholder?: string;
    type?: string;
    palette?: string;
    disabled?: boolean;
}

interface CheckboxProps {
    checked?: boolean;
    onChange?: (e: any) => void;
}

// Button
export const Button = styled.button<ButtonProps>`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: ${props => {
        switch (props.palette) {
            case "primary": return "#3f51b5";
            case "secondary": return "#f50057";
            case "success": return "#4caf50";
            case "warning": return "#ff9800";
            case "error": return "#f44336";
            default: return "#3f51b5";
        }
    }};
    color: white;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// CategoryButton
export const CategoryButton = styled(Button)`
    background: transparent;
    color: inherit;
    padding: 12px;
    
    &:hover {
        background: rgba(0, 0, 0, 0.1);
    }
`;

// LineDivider
export const LineDivider = styled.hr`
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 16px 0;
`;

// Tip
export const Tip = styled.div`
    background: #f5f5f5;
    border-left: 4px solid #2196f3;
    padding: 12px;
    margin: 8px 0;
    font-size: 14px;
`;

// InputBox
export const InputBox = styled.input<InputBoxProps>`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3f51b5;
    }
`;

// Checkbox
export const Checkbox = styled.input.attrs<CheckboxProps>({ type: "checkbox" })`
    margin-right: 8px;
`;

// Category
export const Category = styled.div<CategoryProps>`
    margin-bottom: 16px;
    
    h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
    }
`;

// Centred
export const Centred = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

// Column
export const Column = styled.div<{ grow?: number }>`
    display: flex;
    flex-direction: column;
    flex: ${props => props.grow || 0};
`;

// Row
export const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

// Modal
export const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

// Message
export const Message = styled.div`
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
`;
