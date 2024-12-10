import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import React, { useRef, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { FormError } from '@/utils/constant';
// import ChatBox from '../../Modals/Chatbox';
import { candidateOffer } from '@/services/types';
import { submitOffer } from '@/services/api.service';
import ComposeModal from '@/components/Modals/Compose';
import { InputNumber } from 'primereact/inputnumber';

export default function Offer({ visible, setVisible, applicantData, getStageId, fetchJobData, setOfferVisible }) {
  const [emailVisible, setEmailVisible] = useState(false);
  const [emailConetnt, setEmailContent] = useState('')
  const { control, register, handleSubmit, formState: { errors, isSubmitting, isValid }, setValue, clearErrors, watch } = useForm<candidateOffer>({
    mode: 'onChange',
    defaultValues: {
      jobApplication: applicantData?._id || '',
      dateOfJoining: undefined,
      salaryPerAnnum: null,
    },
  });

  const calendarRef = useRef<Calendar>(null);

  const dateOfJoining = watch("dateOfJoining");
  // const salaryPerAnnum = watch("salaryPerAnnum");

  const footerTemplate = () => (
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

  React.useEffect(() => {
    if (applicantData?._id) {
      setValue("jobApplication", applicantData._id);
    }
  }, [applicantData, setValue]);

  const onSubmit: SubmitHandler<candidateOffer> = async (data) => {
    console.log(data);
    try {
      const response = await submitOffer(data);
      console.log(response);
      setEmailContent(response)
      // setVisible(false); // Close the dialog on success
      setEmailVisible(true)
    } catch (error) {
      console.error('Error submitting offer:', error);
    }
  };

  return (
    <div>
      <Dialog visible={visible} style={{ width: '90vw' }} onHide={() => setVisible(false)} header="Offer Details">
        <Panel style={{ marginBottom: "20px" }} header="Details of Joining Date">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid'>
              <div className='col-8'>
                <div className="flex flex-column gap-6 pt-4">
                  <div className='grid align-items-center'>
                    <label className='col-4' htmlFor="dateOfJoining">
                      Date of Joining: <span className="text-red-500"> *</span>
                    </label>
                    <Calendar
                      {...register("dateOfJoining", { required: "Date of Joining is required" })}
                      className='col-4 p-0 mr-1'
                      placeholder={(new Date()).toDateString()}
                      showIcon
                      minDate={new Date()} // Sets the minimum date to today
                      maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                      onChange={(e) => {
                        clearErrors("dateOfJoining");
                        setValue("dateOfJoining", e.value);
                      }}
                      value={dateOfJoining || null}
                      showTime={true}
                      ref={calendarRef}
                      footerTemplate={footerTemplate}
                    />
                    {FormError(errors, 'dateOfJoining')}
                  </div>
                  <div className='grid align-items-center'>
                    <label className='col-4' htmlFor="salaryPerAnnum">
                      Salary: <span className="text-red-500"> *</span>
                    </label>
                    {/* <InputNumber
                      // {...register("salaryPerAnnum", {
                      //   required: "Salary is required",
                      //   valueAsNumber: true,
                      //   min: { value: 0, message: "Salary must be a positive number" }
                      // })}
                      {...register("salaryPerAnnum", {
                        required: "Salary is required",
                        valueAsNumber: true,
                        min: { value: 0, message: "Salary must be a positive number" },
                    })}
                      id='salaryPerAnnum'
                      className='col-4 py-2 mr-2'
                      placeholder='per annum'
                      min={100000}
                      max={10000000}
                      value={salaryPerAnnum || null}
                      onChange={(e) => {
                        clearErrors("salaryPerAnnum");
                        setValue("salaryPerAnnum", e.value);
                      }}
                      inputMode="numeric"
                    />
                    {FormError(errors, 'salaryPerAnnum')} */}

                    <Controller
                      name="salaryPerAnnum"
                      control={control}
                    //   rules={{
                    //     required: 'Number is required',
                    //     min: { value: 100000, message: 'Minimum value is 100,000' },
                    //     max: { value: 10000000, message: 'Maximum value is 10,000,000' },
                    // }}
                      render={({ field  }) => (
                        <InputNumber
                          id="salaryPerAnnum"
                          value={field.value}
                          onValueChange={(e) => field.onChange(e.value)} // Update the form state
                          mode="decimal"
                          // min={100000}
                          // max={10000000}
                          // showButtons
                          useGrouping
                        />
                      
                      )}
                    />
                  </div>
                  <input type="hidden" {...register("jobApplication")} />
                  <div className="flex justify-content-start">
                    <Button
                      type="submit"
                      label="Submit Offer"
                      style={{ background: "#31BA02", border: "1px solid #31BA02" }}
                      severity="success"
                      disabled={!isValid || isSubmitting}
                    />
                  </div>
                </div>
              </div>
              <div className='col-4'>
                {/* <ChatBox /> */}
              </div>
            </div>
          </form>
        </Panel>
      </Dialog>
      <ComposeModal visible={emailVisible} setVisible={setEmailVisible} emailContent={emailConetnt} jobApplicationEmail={applicantData.contactDetails.contactEmail} applicantData={applicantData} getStageId={getStageId} fetchJobData={fetchJobData} setOfferVisible={setOfferVisible} />
    </div>
  );
}
