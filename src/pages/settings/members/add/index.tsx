/* eslint-disable @typescript-eslint/no-unused-vars */
import api,{ getDepartmentMembers, getDepartmentTree, getMember, setToken } from '@/services/api.service';
import styles from './styles.module.scss';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import TitleBar from '@/components/TitleBar'
import { ToastContainer,toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import DynamicFields from '@/utils/DynamicComponents';
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import memberSchema from '@/validations/memberSchema';
import { memberFields } from '@/components/Fields/Settings/members';
import { Checkbox } from 'primereact/checkbox';

const fetchData = async (apiCall) => {
    try {
        return { data: await apiCall(), error: '' };
    }catch (error: unknown) {
        return { data: null, error: (error as Error).message };
      }
};

export const getServerSideProps = async ({ req, query: { id } }) => {
    setToken(req)
    const cookie = req.cookies.talency_id_token;
    if (!cookie) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }

    const decoded:any= jwtDecode(cookie);
        const orgId = decoded.org._id;

    const [ memberData] = await Promise.all([
        id ? fetchData(() => getMember(orgId,id)) : { data: {}, error: '' }
    ]);

    
    let departments;
    let allUsers;

    if (id && memberData.data?.businessUnit) {
        // If in edit mode and member has a businessUnit
        if (memberData.data.businessUnit.type === 'department') {
            departments = await getDepartmentTree(orgId,'department');
        } else {
            departments = await getDepartmentTree(orgId, 'recruitment');
        }
        allUsers = await getDepartmentMembers(orgId, memberData.data.businessUnit._id);
    } else {
        // If in create mode, set default departments and empty allUsers
        departments = await getDepartmentTree(orgId,'department');
        allUsers = [];
    }


    return {
        props: {
            edit: !!id,
            allUsers: allUsers,
            memberDetails: memberData.data,
            departments: departments,
            orgId,
            errors: {
                memberDetailsError: memberData.error
            },
        },
    };
};


export default function AddMember({
    edit, allUsers, memberDetails, departments, orgId
}) {

    const router = useRouter();
    console.log('memberDetails',memberDetails);

    const defaultValues = {
        email: '',
        firstName: '',
        lastName: '',
        businessUnit: '',
        roles: [],
        reportingTo: undefined,
    }

    const { handleSubmit, control, reset, watch, setValue, getValues, formState: { errors, isValid } } = useForm<any>({
        resolver: yupResolver(memberSchema),
        mode:'onChange',
        defaultValues
    });

    const [isInternalRecruitmentChecked, setIsInternalRecruitmentChecked] = useState(() => {
        return edit && memberDetails?.businessUnit?.type === 'recruitment';
    });
    const [departmentTree, setDepartmentTree] = useState(departments);

    const [deptUsers, setDeptUsers] = useState(allUsers);
    const businessUnit = watch("businessUnit");

    

    type FormValues = typeof defaultValues;

    const createBusinessUnitMap = (units, map = new Map()) => {
        units.forEach((unit) => {
          map.set(unit.key, unit._id);
          if (unit.children && unit.children.length > 0) {
            createBusinessUnitMap(unit.children, map);
          }
        });
        return map;
    };
    
    const businessUnitMap = createBusinessUnitMap(departmentTree || []);

    useEffect(() => {
        if (memberDetails) {
            const mergedValues = {
                email: memberDetails?.email || '',
                firstName: memberDetails?.firstName || '',
                lastName: memberDetails?.lastName || '',
                businessUnit: memberDetails?.businessUnit?.key || '',
                roles: memberDetails?.roles || [],
                reportingTo: memberDetails?.reportingTo || '',
            };
    
            const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', '__v']; // Update if necessary
            console.log(mergedValues)
            unwantedFields.forEach(field => delete mergedValues[field]);
    
            Object.keys(mergedValues).forEach((key) => {
                setValue(key as keyof FormValues, mergedValues[key]);
            });
            // Reset the form with merged values
            reset(mergedValues);
        } else {
            // If no memberDetails are present, reset to default values
            reset(defaultValues);
        }
    }, [memberDetails]);

    useEffect(() => {
        const fetchUsersForDepartment = async () => {
            if (businessUnit) {
                try {
                    const newUsers = await getDepartmentMembers(orgId, businessUnitMap.get(businessUnit));
                    setDeptUsers(newUsers);
                    console.log('newUsers',newUsers)
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            }
        };

        fetchUsersForDepartment();
    }, [businessUnit, orgId]);
    

    const handleDiscard = () => {
        router.push('/settings/members');
    };

    const handleGoBack = () => {
        router.push('/settings/members');
    };

    async function handleProceed(data: any, event: any) {
        event.preventDefault();
        console.log('formData',data);
        try {
            // Extract data from form values
            const {
                email,
                firstName,
                lastName,
                businessUnit,
                roles,
                reportingTo,
            } = data;
            
            // Prepare the payload
            const payload = {
                email,
                firstName,
                lastName,
                businessUnit: businessUnitMap.get(businessUnit),
                roles,
                reportingTo: reportingTo || undefined,
            };
    
            console.log('request payload', payload)
            console.log('edit',edit)

            if (edit) {
                // Update member if edit mode is active
                if (!memberDetails || !memberDetails._id) {
                    throw new Error("Invalid member details for update.");
                }
                await (api as any).updateMember(orgId, memberDetails._id, payload);
                console.log("Member updated successfully!");
                toast.success("Member updated successfully")
            } else {
                // Add a new member if not in edit mode
                await (api as any).addMember(orgId, payload);
                console.log("Member added successfully!");
                toast.success("Member added successfully")
            }
    
            // Optionally, reset the form or perform any further actions
            // reset();

            handleDiscard();
            // Discard changes and possibly close modal/dialog
    
        } catch (error) {
            console.error("Error handling member operation:", error.message);
            // Handle errors, possibly showing a notification to the user
            toast.error(`${error?.response?.data?.message}`)
        }
    }

    const updateDepartmentTree = async (isRecruitment) => {
        const newDepartments = await getDepartmentTree(orgId, isRecruitment ? 'recruitment' : 'department');
        setDepartmentTree(newDepartments);
        setValue("businessUnit", "", { shouldValidate: true });
        // const updatedBusinessUnitMap = createBusinessUnitMap(newDepartments);
        setDeptUsers([]);

    };
    
    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setIsInternalRecruitmentChecked(checked);
        updateDepartmentTree(checked);
    };

    return (
        <>
            <ToastContainer />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={edit ? 'Edit Member' : 'Add Member'} />
            <form onSubmit={handleSubmit(handleProceed)}>
                <div className={`grid ${styles.form}`}>
                    <div className={styles.checkBox}>
                        <div className="flex align-items-center gap-2">
                        <Checkbox onChange={handleCheckboxChange} checked={isInternalRecruitmentChecked}></Checkbox>
                            <label htmlFor="internalRecruitment" className={styles.checkboxLabel}>
                                Internal Recruitment
                            </label>
                        </div>
                    </div>

                    {memberFields(errors,departmentTree, deptUsers)?.map((item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <DynamicFields item={item} control={control} errors={errors} edit={edit} setValue={setValue} getValues={getValues} disbaled={null} />
                                        </React.Fragment>
                                    )
                        }
                        )}
                    <div className={`col-12 ${styles.buttons}`}>
                        <Button className="secondary" label="Discard" onClick={handleDiscard} />
                        <Button type="submit" label="Submit"  />
                    </div>
                </div>
            </form>
        </>
    );
}
