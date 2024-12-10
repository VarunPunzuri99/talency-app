import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import styles from './styles.module.scss';
import Image from 'next/image';
import AddWorkflow from '@/components/Workflow/AddWorkflow';
import EditWorkflow from '@/components/Workflow/EditWorkflow';
import { filterWorkflowsByOrgId, setToken } from '@/services/api.service';
import TitleBar from '@/components/TitleBar';
import { Button } from 'primereact/button';

export async function getServerSideProps({ req }) {
  try {
    setToken(req);
    const workflows = await filterWorkflowsByOrgId('66fd0f3aa4c31cbc93b364db');

    return {
      props: {
        workflows: workflows || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error.message);

    return {
      props: {
        error: error.message || 'An error occurred while fetching the data.',
      },
    };
  }
}

const Workflow = ({ workflows }) => {
  const [visibleRightEdit, setVisibleRightEdit] = useState(false);
  const [visibleRightNew, setVisibleRightNew] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const handleEditClick = (workflow) => {
    setSelectedWorkflow(workflow);
    setVisibleRightEdit(true);
  };

  // Find the default workflow
  const defaultWorkflow = workflows?.find(workflow => workflow.isDefault);
  
  // Filter out the default workflow for the "Your Workflows" section
  const nonDefaultWorkflows = workflows?.filter(workflow => !workflow.isDefault);

  return (
    <>
     <TitleBar title="Workflow">
        <Button
          label="Add Workflow"
          onClick={() => setVisibleRightNew(true)}
        />
      </TitleBar>
      <div className={styles.workflow}>
        <ul className={styles.main}>
          {/* Display stages of the default workflow */}
          {defaultWorkflow && (
            <li className={styles.listItem}>
              <header className={styles.header}>
                <h4>{defaultWorkflow.name}</h4>
                <p onClick={() => handleEditClick(defaultWorkflow)}>
                  <i className="pi pi-pencil"></i> Edit
                </p>
              </header>
              <ul className={styles.content}>
                {defaultWorkflow?.stages?.map((stage) => (
                  <li key={stage._id}>
                    <Image height="40" width="40" src="/assets/login/mail.svg" alt="img" />
                    <p>{stage.name}</p>
                  </li>
                ))}
              </ul>
            </li>
          )}
          <h4 className={styles.heading}>Your Workflows</h4>
          {/* Display stages of each non-default workflow */}
          {nonDefaultWorkflows?.map((workflow) => (
            <li className={styles.listItem} key={workflow._id}>
              <header className={styles.header}>
                <h4>{workflow.name}</h4>
                <p onClick={() => handleEditClick(workflow)}>
                  <i className="pi pi-pencil"></i> Edit
                </p>
              </header>
              <ul className={styles.content}>
                {workflow.stages.map((stage) => (
                  <li key={stage._id}>
                    <Image height="40" width="40" src="/assets/login/mail.svg" alt="img" />
                    <p>{stage.name}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <Sidebar
        visible={visibleRightEdit}
        position="right"
        className={styles.sidebar}
        onHide={() => setVisibleRightEdit(false)}
      >
        {selectedWorkflow && (
          <EditWorkflow
            workflow={selectedWorkflow}
            edit={true} type={undefined}            // onClose={() => setVisibleRightEdit(false)}
          />
        )}
      </Sidebar>

      <Sidebar
        visible={visibleRightNew}
        position="right"
        className={styles.sidebar}
        onHide={() => setVisibleRightNew(false)}
      >
        <AddWorkflow
          onClose={() => setVisibleRightNew(false)}
          orgId={'66fd0f3aa4c31cbc93b364db'} fetchWorkflows={undefined} workflows={undefined} type={undefined} setWorkFlowVisible={undefined} getSelectedData={undefined}        />
      </Sidebar>
    </>
  );
};

export default Workflow;
