import React from 'react';
import { MultiSelect, MultiSelectProps } from 'primereact/multiselect';


// Props interface for the ControlledMultiSelect component
export interface ControlledMultiSelectProps extends Omit<MultiSelectProps, 'value' | 'onChange'> {
    value: any[]; 
    onChange: (e: any) => void; 
    options: any[]; 
    placeholder?: string; 
    className?: string;
    display?: 'chip' | 'comma'; // Optional display type for selected items (chip or comma-separated)
}

// ControlledMultiSelect component: A reusable multi-select component with controlled values and change handling
export const ControlledMultiSelect: React.FC<ControlledMultiSelectProps> = ({
    value = [],
    onChange,
    options,
    placeholder = 'Select options', // Default placeholder text, If they want custom placeholder 
    className = 'w-full md:w-5', // Default CSS class for styling; can be overridden by props
    display = 'chip', // Default display style for selected items; can be overridden by props
    ...rest
}) => {
    return (
        <MultiSelect
            value={value} 
            onChange={onChange} 
            options={options} // List of options for the MultiSelect
            placeholder={placeholder} 
            className={className} 
            display={display} // Type of display for selected items (chip or comma-separated)
            {...rest} // Spread any additional props to the MultiSelect component
        />
    );
};