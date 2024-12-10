import React, { useRef } from 'react';
import { Calendar, CalendarProps } from 'primereact/calendar';
import { Button } from 'primereact/button';

export interface ControlledCalendarProps extends Omit<CalendarProps, 'value' | 'onChange'> {
    value: Date | null;  // Accept Date or null
    onChange: (e: { value: Date | null }) => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    showTime?: boolean;
}

export const ControlledCalendar: React.FC<ControlledCalendarProps> = ({
    value,
    onChange,
    placeholder = 'Select a date',
    className = "md:w-3",
    minDate,
    maxDate,
    disabled,
    showTime = false,
}) => {
    const calendarRef = useRef<Calendar>(null);

    const footerTemplate = () => {
        return (
            <div className="flex justify-end w-full">
                <Button
                    label="OK"
                    onClick={() => {
                        // Close the calendar overlay
                        if (calendarRef.current) {
                            calendarRef.current.hide();
                        }
                    }}
                />
            </div>
        );
    };

    return (
        <Calendar
            ref={calendarRef}
            showIcon
            disabled={disabled}
            className={className}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            minDate={minDate}
            maxDate={maxDate}
            showTime={showTime}
            footerTemplate={footerTemplate}
        />
    );
};