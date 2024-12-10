import React from 'react';
import { InputText, InputTextProps } from 'primereact/inputtext';

export interface ControlledInputTextProps extends Omit<InputTextProps, 'value' | 'onChange'> {
    value: string | number; // The value of the input, could be a string or number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Change handler function
    maxLength?: number;
    placeholder?: string;
    className?: string;
}

export const ControlledInputText: React.FC<ControlledInputTextProps> = ({
    value,
    onChange,
    placeholder = '',
    className = 'md:w-5', // Default className
    ...rest
}) => {
    return (
        <InputText
            value={String(value)} // Ensure the value is treated as a string
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            {...rest}
        />
    );
};