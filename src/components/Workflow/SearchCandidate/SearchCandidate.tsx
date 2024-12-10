import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar'
import React, {  useState } from 'react'
import { FormError } from '@/utils/constant';
import styles from "./searchCandidate.module.scss"
import { InputText } from 'primereact/inputtext'
import { useForm } from 'react-hook-form'
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
const SearchCandidates = () => {
    const [visibleRight, setVisibleRight] = useState(false);
 
   
    const {
        reset,
        
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const searchCandidate = (e) => {
        console.log("data", e);
    }
    return (
        <div className={styles.candidate_search}>
            <Button icon="pi pi-arrow-left" label="Search Candidate" onClick={() => setVisibleRight(true)} />
            <Sidebar style={{ width: "60vw" }} onHide={() => setVisibleRight(false)} visible={visibleRight} position="right" content={() => (
                <div className={styles.sideBar}>
                    <header >
                        <h5>Search Candidates</h5>
                        {/* <Button type="button" ref={closeIconRef} onClick={() => setVisibleRight(false)} icon="pi pi-times" rounded outlined className="h-2rem w-2rem"></Button> */}
                    </header>
                    <form onSubmit={handleSubmit(searchCandidate)}>
                        <div className={`grid ${styles.form}`}>
                            <div className="col-12">
                                <label>Candidate Name</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('name', { required: true })}
                                    placeholder="Enter account name"
                                />
                                {FormError(errors, 'name')}
                            </div>
                            <div className="col-12">
                                <label>Current location of candidate</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('location', { required: true })}
                                    placeholder="Enter account name"
                                />
                                <div className="flex align-items mt-2">
                                    <Checkbox  checked={false}  {...register('relocateCheckbox', { required: false })} inputId="relocateCheckbox" name="relocateCheckbox" />
                                    <label htmlFor="relocateCheckbox" className="ml-2">Include candidates who prefer to relocate to above locations</label>
                                </div>
                                {FormError(errors, 'location')}
                            </div>
                            <div className="col-12">
                                <label>Keywords</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('keywords', { required: false })}
                                    placeholder="Enter account name"
                                />
                                <div className="flex align-items mt-2">
                                    <Checkbox checked={false}   {...register('keywordCheckbox', { required: false })} inputId="keywordCheckbox" name="keywordCheckbox" />
                                    <label htmlFor="keywordCheckbox" className="ml-2">Mark all keywords as mandatory</label>
                                </div>
                                {FormError(errors, 'keywords')}
                            </div>
                            <div className="col-12">
                                <label>Exclude Keyword</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('excludeKeyword', { required: true })}
                                    placeholder="Enter account excludeKeyword"
                                />
                                {FormError(errors, 'excludeKeyword')}
                            </div>
                            <div className={`col-12 px-2 my-4 ${styles.headline}`}>
                                <h4>Experince</h4>
                                <span></span>
                            </div>
                            <div className="col-12">
                                <label>Years of experience</label>
                                <div className='flex gap-2 mt-1'>
                                    <InputText
                                        type="number"
                                        {...register('min_experince', { required: true })}
                                        placeholder="Minimum years"
                                    />
                                    {FormError(errors, 'min_experince')}
                                    <p className='font-semibold'>to</p>
                                    <InputText
                                        type="number"
                                        {...register('max_experince', { required: true })}
                                        placeholder="Maximum years"
                                    />
                                    {FormError(errors, 'max_experince')}
                                </div>
                            </div>
                            <div className="col-12">
                                <label>Current Salary</label>
                                <div className='flex gap-2 mt-1'>
                                    <Dropdown
                                        {...register('current_salary_in_currency', { required: false })}
                                        options={[{ name: "INR" }, { name: "USD" }]} optionLabel="name"
                                        placeholder="Select Currency" className="w-full md:w-14rem" />
                                    {FormError(errors, 'current_salary_in_currency')}
                                    <InputText
                                        type="number"
                                        {...register('current_min_salary', { required: false })}
                                        placeholder="Minimum salary in Lacs"
                                    />
                                    {FormError(errors, 'current_min_salary')}
                                    <InputText
                                        type="number"
                                        {...register('current_max_salary', { required: false })}
                                        placeholder="Minimum salary in Lacs"
                                    />
                                    {FormError(errors, 'current_max_salary')}
                                </div>
                            </div>
                            <div className="col-12">
                                <label>Expected Salary</label>
                                <div className='flex gap-2 mt-1'>
                                    <Dropdown
                                        {...register('expected_salary_in_currency', { required: false })}
                                        options={[{ name: "INR" }, { name: "USD" }]} optionLabel="name"
                                        placeholder="Select Currency" className="w-full md:w-14rem" />
                                    {FormError(errors, 'expected_salary_in_currency')}
                                    <InputText
                                        type="number"
                                        {...register('expected_min_salary', { required: false })}
                                        placeholder="Minimum salary in Lacs"
                                    />
                                    {FormError(errors, 'expected_min_salary')}
                                    <InputText
                                        type="number"
                                        {...register('expected_max_salary', { required: false })}
                                        placeholder="Minimum salary in Lacs"
                                    />
                                    {FormError(errors, 'expected_max_salary')}
                                </div>
                            </div>
                            <div className={`col-12 px-2 my-4 ${styles.headline}`}>
                                <h4>Employment</h4>
                                <span></span>
                            </div>
                            <div className="col-12">
                                <label>Industry</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('industry', { required: true })}
                                    placeholder="Enter industry name"
                                />
                                {FormError(errors, 'industry')}
                            </div>
                            <div className="col-12">
                                <label>Company</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('company', { required: true })}
                                    placeholder="Enter company name"
                                />
                                {FormError(errors, 'company')}
                            </div>
                            <div className="col-12">
                                <label> Exclude Company</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('exclude_company', { required: true })}
                                    placeholder="Enter exclude company name"
                                />
                                {FormError(errors, 'exclude_company')}
                            </div>
                            <div className="col-12">
                                <label>Designation</label>
                                <InputText className='mt-1'
                                    type="text"
                                    {...register('designation', { required: true })}
                                    placeholder="Enter designation name"
                                />
                                {FormError(errors, 'designation')}
                            </div>
                            <div className={`col-12 px-2 my-4 ${styles.headline}`}>
                                <h4>Notice Period</h4>
                                <span></span>
                            </div>
                            <div className="col-12">
                                <label>No. of days of notice</label>
                                <div className='flex gap-2 mt-1'>
                                    <InputText
                                        type="number"
                                        {...register('min_notice_days', { required: false })}
                                        placeholder="Enter no. of days"
                                    />
                                    {FormError(errors, 'min_notice_days')}
                                    <p className='font-semibold'>Between</p>
                                    <InputText
                                        type="number"
                                        {...register('max_notice_days', { required: false })}
                                        placeholder="Enter no. of days"
                                    />
                                    {FormError(errors, 'max_notice_days')}
                                </div>
                            </div>
                            <div className="col-12">
                                <label className='mb-1'>Date of Joining</label>
                                <Calendar className='w-6' showIcon {...register('date_of_joining', { required: false })} />
                                {FormError(errors, 'date_of_joining')}
                            </div>
                            <div className='col-12 flex justify-content-center gap-4'>
                                <Button onClick={() => reset()} type="button" label={'Clear All'} severity='danger' />
                                <Button type="submit" label={'Apply Filter'} severity='secondary' />
                            </div>
                        </div>
                    </form>
                </div>
            )}
            >
            </Sidebar>

        </div>
    )
}

export default SearchCandidates