/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { ControlledInputText } from '../InputText';
import { FileUpload } from 'primereact/fileupload';
import FileUploadPreview from '../Fileupload'
import { ControlledDropdown } from '../Dropdown';
import { Editor } from 'primereact/editor';
import { Chips } from 'primereact/chips';
import { ControlledMultiSelect } from '../Multiselect';
import { ControlledCalendar } from '@/utils/Calander';
import moment from 'moment';
import { uploadFile } from '@/services/api.service';
import { ControlledTreeSelect } from '../TreeSelect';
import TiptapEditor from '@/utils/TiptapEditor';
import { Checkbox } from 'primereact/checkbox';

const DynamicFields = ({ item, control, disbaled = false, errors, getValues = (name: any) => name, setValue = (_name: string, _value: any) => { }, edit = null }) => {
    const { title, type, name, placeholder, className, options, onFileSelect, keyfilter, parentClassName, labelClassName, maximumLength, comValidation, onChange, isRequired, dropDownFilter, readOnly, suggestions } = item || {};

    const [uploadedFiles, setUploadedFiles] = useState({
        logo: undefined,
        thumbnail: undefined,
    });

    const [, setFilePreviewUrl] = useState(null);
    const fileUploadRef = useRef(null);

    // const {  watch } = control;

    const uploadHandler = async ({ files }, fieldName) => {
        try {

            console.log(files);
            const fileToUpload = files[0];

            const formData = new FormData();
            formData.append('file', fileToUpload);
            const response = await uploadFile(formData);
            const { _id, locationUrl } = response

            console.log(response)

            setUploadedFiles((prev) => ({ ...prev, [fieldName]: locationUrl }));// Example: storing the uploaded file URL

            console.log(uploadedFiles)

            if (fieldName === 'logo') {
                setValue('logo', _id); // Update form state with logo file ID
                console.log("Logo ID set:", _id);
            } else if (fieldName === 'thumbnail') {
                setValue('thumbnail', _id); // Update form state with thumbnail file ID
                console.log("Thumbnail ID set:", _id);
            }

            setFilePreviewUrl(locationUrl)

            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
            }

            console.log('File uploaded successfully:', response.locationUrl);
        } catch (error) {
            console.error('File upload failed:', error.message);
        }
    };

    const handleFileRemove = (fieldName) => {
        console.log('fieldName', fieldName)
        setUploadedFiles((prev) => ({ ...prev, [fieldName]: undefined }));
        setFilePreviewUrl(null);
        setValue(fieldName, null);
    };

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={parentClassName || "flex flex-column gap-2"}>
            <label htmlFor={name} className={labelClassName || ""}>
                {title}
                {isRequired && <span className="text-red-500"> *</span>}
            </label>
            <Controller
                name={name}
                control={control}
                disabled={disbaled}
                render={({ field }) => {
                    switch (type) {
                        case 'text':
                        case 'number':
                        case 'password':
                            return (
                                <div className="relative w-full">
                                    <ControlledInputText
                                        value={typeof field.value === 'string' || typeof field.value === 'number' ? field.value : ''}

                                        onChange={onChange ? onChange : (e) => {
                                            const inputValue = e.target.value;
                                            if (type === 'number') {
                                                field.onChange(isNaN(Number(inputValue)) ? inputValue : Number(inputValue));
                                            } else {
                                                field.onChange(inputValue);
                                            }
                                        }}
                                        placeholder={placeholder}
                                        // type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                                        type={(type === 'password' && (field.value || showPassword)) ? (showPassword ? 'text' : 'password') : type}

                                        className={`${className} ${type === 'password' ? 'pr-12' : ' '}`
                                        }
                                        id={name}
                                        name={name}
                                        keyfilter={type == 'text' && keyfilter ? 'int' : undefined}
                                        maxLength={maximumLength && type === 'text' ? maximumLength : 50}
                                        max={type === 'number' ? 100 : undefined}
                                        min={type === 'number' ? 0 : undefined}
                                        // disabled={name === 'email' || disbaled}
                                    />

                                    {type === 'password' && (
                                        <span
                                            className="cursor-pointer absolute"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 1,
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} />

                                        </span>
                                    )}
                                </div>
                            );
                        case 'file':
                            return (
                                <FileUpload
                                    mode="basic"
                                    accept=".pdf,.doc,.docx"
                                    maxFileSize={1000000}
                                    customUpload
                                    onSelect={onFileSelect}
                                    chooseLabel="Upload"
                                />
                            );
                        case 'file-preview':
                            return (
                                <FileUploadPreview
                                    defaultImage="/assets/login/mail.svg"
                                    uploadedFileUrl={getValues(name)} // Pass the existing file URL if already uploaded
                                    onUpload={(file) => uploadHandler({ files: [file] }, name)}
                                    onRemove={() => handleFileRemove(name)}
                                    accept="image/jpeg, image/png"
                                    setFilePreviewUrl={setFilePreviewUrl}
                                />
                            );
                        case 'dropdown':
                            return (
                                <ControlledDropdown
                                    value={field.value}
                                    id={name}
                                    onChange={(e) => field.onChange(e.value)}
                                    options={options}
                                    className={className}
                                    filter={dropDownFilter}
                                />
                            );
                        case 'editor':
                            console.log('edit', edit)
                            console.log('name', getValues(name))
                            return (
                                edit ? ((<Editor
                                    id={name}
                                    style={{ height: '200px' }}
                                    value={`${getValues(name)}`}
                                    name={name}
                                    onLoad={(q) => { console.log(q, 'onLoad') }}
                                    onTextChange={(e) => field.onChange(e.htmlValue)}
                                    maxLength={maximumLength ?? 1500}
                                    className={className}
                                />)) : (
                                    <Editor
                                        id={name}
                                        style={{ height: '200px' }}
                                        name={name}
                                        onTextChange={(e) => field.onChange(e.htmlValue)}
                                        maxLength={maximumLength ?? 1500}
                                        className={className}
                                    />
                                )
                            );
                        case 'tiptap':
                            return (
                                edit ? (getValues(name) ? (<TiptapEditor
                                    onContentChange={(e) => field.onChange(e)}
                                    id={name}
                                    name={name}
                                    content={`${getValues(name)}`}
                                    maxLength={maximumLength ?? 3500}
                                    placeholders={suggestions}
                                />) : null) : (
                                    <TiptapEditor
                                        onContentChange={(e) => field.onChange(e)}
                                        id={name}
                                        name={name}
                                        maxLength={maximumLength ?? 3500}
                                        readOnly={readOnly}
                                        placeholders={suggestions}
                                    />)
                            );
                        case 'chips':
                            return (
                                <Chips
                                    id={name}
                                    value={field.value as string[]}
                                    onChange={(e) => {
                                        const validSkills = e.value
                                            .map(skill => skill.length > 20 ? skill.slice(0, 20) : skill) // Truncate to 50 characters
                                            .slice(0, 10); // Limit to a maximum of 5 chips

                                        field.onChange(validSkills);
                                    }}
                                    placeholder={placeholder}
                                    maxLength={10} // This should be the max length of each individual skill, not the total number of skills
                                    className={className}
                                />
                            );
                        case 'multiselect':
                            return (
                                <ControlledMultiSelect
                                    value={Array.isArray(field.value) ? field.value : []}  // Ensure it's always an array
                                    options={options}
                                    onChange={(e) => field.onChange(e.value)}
                                    filter
                                    className={className}
                                />
                            );
                        case 'Calendar':
                            return (
                                <ControlledCalendar
                                    showIcon
                                    className={className}
                                    value={field.value ? new Date(field.value) : null}
                                    // value={field.value ? new Date(field.value) : (item.maxDate ? new Date(item.maxDate) : null)}
                                    onChange={(e) => field.onChange(e.value ? moment(e.value).toISOString() : null)}
                                    minDate={item.minDate ? new Date(item.minDate) : undefined}
                                    maxDate={item.maxDate ? new Date(item.maxDate) : undefined}
                                    showTime={item.showTime ? true : false}
                                />
                            );
                        case 'tree-select':
                            return (
                                <ControlledTreeSelect
                                    value={field.value || []}
                                    onChange={(e) => field.onChange(e)}
                                    options={options}
                                    placeholder={placeholder || 'Select option'}
                                    className={className || 'w-full'}
                                    selectionMode="checkbox"
                                    filter={true}
                                    showClear={true}
                                />
                            );
                        case 'checkbox':
                            return (
                                <Controller
                                    name={name}
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            inputId={`${name}_checkbox`}
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.checked)}
                                        />
                                    )}
                                />
                            );
                        default:
                            return null;
                    }
                }}
            />
            {(comValidation || errors[name]) && (
                <small className="p-error">
                    {(comValidation || errors[name]?.message) || 'Error message'}
                </small>
            )}
        </div>
    );
};

export default DynamicFields;
