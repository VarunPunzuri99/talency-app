import styles from '@/styles/shared/list_page.module.scss';
import intrnlStyles from './index.module.scss';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import TitleBar from '@/components/TitleBar';
import React, { useEffect, useState } from 'react';
import { bulkDeleteEmailTemplates, createEmailTemplateWithPlacholders, getAllPlaceholders, getEmailTemplateById, getEmailTemplates, getEmailTemplatesCount, setToken, updateEmailTemplate } from '@/services/api.service';
import Pagination from '@/components/Pagination';
import CustomDialog from '@/utils/Dialog';
import { Dropdown } from 'primereact/dropdown';
import { toast } from 'react-toastify';
import EmailTemplateBuilder from '@/components/EmailTemplateBuilder';
import { Dialog } from '@/primereact';
import { useDebounce } from 'primereact/hooks';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import EmailTemplateSchema from '@/validations/EmailTemplateSchema';
import DynamicFields from '@/utils/DynamicComponents';
import TiptapEditor from '@/utils/TiptapEditor';

export async function getServerSideProps({ req, query }) {
    try {
        setToken(req);
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;

        const [data, count, defaultPlaceholders] = await Promise.all([
            await getEmailTemplates({ page, limit }),
            await getEmailTemplatesCount(),
            await getAllPlaceholders({ isDefault: true })
        ]);
        console.log(defaultPlaceholders)
        return {
            props: {
                initialData: data || [],
                currentPage: page,
                limit: limit,
                totalRecords: count,
                defaultPlaceholders: defaultPlaceholders || []
            }
        };
    } catch (error) {
        console.error(error?.message);
        return {
            props: {
                error: error?.message,
            },
        };
    }
}

export default function Lists({ initialData, error, currentPage, limit, totalRecords, defaultPlaceholders }) {
    const router = useRouter();
    const [data, setData] = useState(initialData || null);
    const [page, setPage] = useState(currentPage || 1);
    const [itemsPerPage, setItemsPerPage] = useState(limit);
    const [selectedIds, setSelectedIds] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedBulkAction, setSelectedBulkAction] = useState(null);
    const [editDialog, setEditDialog] = useState(false);
    const [templateId, setTemplateId] = useState(null);
    const [view, setView] = useState(false)
    const [placeholders, setPlaceholders] = useState(defaultPlaceholders)

    const defaultEmailTemplateValues = {
        templateName: '',
        eventName: '',
        templateHTMLContent: ''
    };

    const { handleSubmit, control, formState: { errors }, reset, getValues } = useForm({
        resolver: yupResolver(EmailTemplateSchema),
        mode: 'onChange',
        defaultValues: defaultEmailTemplateValues,
    });
    console.log(getValues())


    const EmailTemplateEvents = [
        { label: 'Workflow Sourcing (Pre-Consent)', value: 'workflow.sourcing.pre_consent' },
        { label: 'Workflow Sourcing (Post-Consent)', value: 'workflow.sourcing.post_consent' },
        { label: 'Workflow Screening', value: 'workflow.screening' },
        { label: 'Workflow Assessment', value: 'workflow.assessment' },
        { label: 'Workflow Interview (Telephonic)', value: 'workflow.interview.telephonic' },
        { label: 'Workflow Interview (Video)', value: 'workflow.interview.video' },
        { label: 'Workflow Interview (In Person)', value: 'workflow.interview.inperson' },
        { label: 'Workflow Interview Cancellation', value: 'workflow.interview.cancellation' },
        { label: 'Workflow Interview Rescheduling', value: 'workflow.interview.rescheduling' },
        { label: 'Workflow Interview Reminder', value: 'workflow.interview.reminder' },
        { label: 'Workflow Documentation Collection Request', value: 'workflow.documentation.collection.request' },
        { label: 'Workflow Offer', value: 'workflow.offer' },
        { label: 'Workflow Offer Acceptance Reminder', value: 'workflow.offer.acceptance.reminder' },
        { label: 'Workflow Rejection', value: 'workflow.rejection' },
        { label: 'New Job Opportunity', value: 'new.job.opportunity' },
        { label: 'Workflow tracker', value: 'workflow.tracker' },
        {label:'Signature',value:'signature'}
    ];

    const emailTemplate = [
        {
            title: "Template Name",
            name: "templateName",
            type: 'text',
            className: "w-full",
            placeholder: "Enter template name",
            isRequired: true
        },
        {
            title: "Event name",
            name: "eventName",
            type: 'dropdown',
            options: EmailTemplateEvents,
            className: "w-full",
            isRequired: true
        },
        {
            title: "Template content",
            name: "templateHTMLContent",
            type: 'tiptap',
            className: "w-full",
            isRequired: true,
            suggestions: placeholders,
            maxLength: 3000
        }
    ];
    const onSubmit = async (data) => {
        try {

            if (templateId) {
                await updateEmailTemplate(templateId, data);
                toast.success("Template updated successfully!");
                setEditDialog(false);
            }
            else {
                await createEmailTemplateWithPlacholders(data);
                toast.success("Template created successfully!");
                setEditDialog(false);
                setTimeout(() => {
                    router.reload();
                }, 1000);
            }

        } catch (error) {
            console.error('Error creating/updating email template:', error);
            toast.error("Error creating/updating email template");
        }
    };

    const handleSaveAs = async () => {
        try {
            const formData = getValues();

            if (!formData.templateName || !formData.eventName || !formData.templateHTMLContent) {
                toast.error("Please fill all required fields.");
                return;
            }
            await createEmailTemplateWithPlacholders(formData);

            toast.success("Template saved as new!");
            setTimeout(() => {
                router.reload();
            }, 2000);
        } catch (error) {
            toast.error("An error occurred while saving the template.");
            console.error(error);
        }
    };

    useEffect(() => {
        if (templateId) {
            const fetchEmailTemplate = async () => {
                try {
                    const templateData = await getEmailTemplateById(templateId);

                    const placeholders = await getAllPlaceholders({
                        emailTemplateId: templateData._id
                    });

                    setPlaceholders(placeholders)

                    const mergedValues = {
                        ...defaultEmailTemplateValues,
                        ...templateData,
                    }

                    const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', '__v', '_id'];

                    unwantedFields.forEach(field => delete mergedValues[field]);

                    // console.log(mergedValues)

                    reset(mergedValues);

                } catch (error) {
                    console.error('Error fetching email template:', error);
                }
            };

            fetchEmailTemplate();
        }
    }, [templateId, editDialog, view]);

    const [inputValue, debouncedValue, setInputValue] = useDebounce('', 1000);

    useEffect(() => {
        const fetch = async () => {
            if (inputValue && inputValue.trim() !== "") {
                try {
                    const filteredTemplates = await getEmailTemplates({ page, limit, templateName: debouncedValue });
                    setData(filteredTemplates);
                } catch {
                    toast.error('Error fetching email templates:');
                }
            } else {
                setData(initialData);
            }
        };
        if (inputValue != null) {
            fetch();
        }
    }, [debouncedValue, inputValue]);

    const handleBulkDelete = async () => {

        try {
            await bulkDeleteEmailTemplates(selectedIds); // Call your bulk delete API function
            const response = await getEmailTemplates({ page, limit: itemsPerPage })
            setData(response || []);
            setSelectedIds([]); // Clear selection
            setDialogVisible(false);
        } catch (error) {
            toast.error("Error during bulk delete:", error);
        }
    };

    const handleApplyBulkAction = () => {
        if (!selectedBulkAction) {
            toast.error("Please select a bulk action.");
            return;
        }
        if (selectedIds.length === 0) {
            toast.error("No email templates selected for deletion.");
            return;
        }

        switch (selectedBulkAction) {
            case 'bulkDelete':
                setDialogVisible(true); // Show bulk delete confirmation dialog
                break;
            default:
                break;
        }
    };

    if (error) {
        return <div>Something Went Wrong!!!</div>;
    }

    const onPageChange = (event) => {
        const newPage = event.page + 1; // Page index starts from 0
        setPage(newPage);
        // Ensure viewMode remains in the URL query params during page navigation
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        });
    };


    const onItemsPerPageChange = (e) => {
        const value = e.value;
        setItemsPerPage(value);
        setPage(1); // Reset to the first page when items per page changes
        router.push({
            pathname: router.pathname,
            query: { ...router.query, limit: value, page: 1 },
        });
    };

    return (
        <>
            <TitleBar title={'Email template builder'}>
                <Button label="Create new template" onClick={() => setEditDialog(true)} />
            </TitleBar>
            <div className={styles.filters}>
                <div className={styles.left_section}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            type="text"
                            value={inputValue}
                            placeholder="Search by template title"
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </span>
                </div>
                <div className={styles.right_section}>
                    <Dropdown
                        value={selectedBulkAction}
                        options={[
                            { label: 'Bulk Delete', value: 'bulkDelete' },
                        ]}
                        onChange={(e) => setSelectedBulkAction(e.value)}
                        placeholder="Select Bulk Action"
                        disabled={selectedIds.length === 0}
                    />
                    <Button label="Apply" onClick={handleApplyBulkAction} />
                </div>

            </div>

            <EmailTemplateBuilder data={data} selectedIds={selectedIds} setSelectedIds={setSelectedIds} setTemplateId={setTemplateId} setEditDialog={setEditDialog} setView={setView} />

            <div className={styles.paginationContainer}>
                <Pagination
                    page={page}
                    itemsPerPage={itemsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            </div>

            <Dialog
                header={!editDialog ? 'Edit email template' : 'Create email template'}
                visible={editDialog}
                onHide={() => {
                    setEditDialog(false)
                    setTemplateId(null)
                    reset(defaultEmailTemplateValues);
                }}
                className={intrnlStyles.emailTemplateDialog}
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>

                    {emailTemplate.map((item, index) => (
                        <React.Fragment key={index}>
                            <DynamicFields
                                item={item}
                                control={control}
                                errors={errors}
                                edit={templateId}
                                getValues={getValues}
                                disbaled={null}
                            />
                        </React.Fragment>
                    ))}

                    <div className="flex justify-content-end mt-2 gap-2">
                        {templateId && (
                            <Button
                                label="Save as"
                                severity="secondary"
                                type="button" // Prevent form submission immediately
                                onClick={handleSaveAs}
                            />
                        )}
                        <Button
                            label={templateId ? 'Update template' : 'Create email template'}
                            severity="secondary"
                            type="submit"
                        />
                    </div>
                </form>
            </Dialog>

            <Dialog
                header={'View Template'}
                visible={view}
                onHide={() => {
                    setView(false);
                    setTemplateId(null);
                    reset(defaultEmailTemplateValues);
                }}
                className={intrnlStyles.emailTemplateDialog}
            >

                <div style={{ padding: '20px' }}>
                    <div className="p-field">
                        <label htmlFor="templateName" ><strong>Template Name:</strong></label>
                        <InputText
                            id="templateName"
                            value={getValues('templateName')}
                            readOnly
                            className="p-inputtext-readonly"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="eventName"><strong>Event Name:</strong></label>
                        <InputText
                            id="eventName"
                            value={getValues('eventName')}
                            readOnly
                            className="p-inputtext-readonly"
                        />
                    </div>

                    <div className="p-field">
                        <label><strong>Content:</strong></label>
                        {getValues('templateHTMLContent') ? (<TiptapEditor
                            id="templateHTMLContent"
                            onContentChange
                            name="templateHTMLContent"
                            content={getValues('templateHTMLContent')}
                            readOnly={true}
                        />) : null}
                    </div>
                </div>

            </Dialog>

            <CustomDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header="Confirm bulk delete"
                content={(
                    <div className={styles.dialogContent}>
                        <p className={styles.dialogHeader}>Are you sure you want to delete ?</p>
                        <p className={styles.dialogBody}>
                            Currently, you have <strong className={styles.highlight}>{selectedIds.length}</strong> email templates are selected.
                        </p>
                    </div>
                )}
                onConfirm={handleBulkDelete}
                onCancel={() => setDialogVisible(false)}
            />

        </>
    );
}