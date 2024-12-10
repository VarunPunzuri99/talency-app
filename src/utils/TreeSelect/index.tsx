import React from 'react';
import { TreeSelect, TreeSelectProps } from 'primereact/treeselect';

export interface ControlledTreeSelectProps extends Omit<TreeSelectProps, 'value' | 'onChange'> {
    value: any[];
    onChange: (e: any) => void;
    options: any[];
    placeholder?: string;
    className?: string;
    filter?: boolean;
    showClear?: boolean;
}

export const ControlledTreeSelect: React.FC<ControlledTreeSelectProps> = ({
    value = [],
    onChange,
    options,
    placeholder = 'Select option',
    className = 'w-full',
    filter = true,
    showClear = true,
}) => {
    return (
        <TreeSelect
            value={value}
            options={options}
            onChange={(e) => onChange(e.value)}
            placeholder={placeholder}
            className={className}
            filter={filter}
            showClear={showClear}
        />
    );
};
