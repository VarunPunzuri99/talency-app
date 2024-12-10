import React from 'react';
import { Dropdown, DropdownProps } from 'primereact/dropdown';

// Props interface for the ControlledDropdown component
export interface ControlledDropdownProps extends Omit<DropdownProps, 'value' | 'onChange'> {
    value: any; 
    onChange: (e: any) => void; 
    options: any[];
    placeholder?: string; 
    className?: string; // Optional CSS class to apply custom styles
}

// ControlledDropdown component: A reusable dropdown component with controlled value and change handling
export const ControlledDropdown: React.FC<ControlledDropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select an option', // Default placeholder text if none is provided 
    className = "md:w-5", // Default CSS class for styling; can be overridden by props
    ...rest
}) => {
    return (
        <Dropdown
            value={value} 
            onChange={onChange} 
            options={options} // List of options for the dropdown
            placeholder={placeholder} 
            className={className} 
            {...rest} // Spread any additional props to the Dropdown component
            filter
            showClear 
        />
    );
};


