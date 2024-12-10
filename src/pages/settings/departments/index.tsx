import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import api, { getDepartmentsWorkflow, setToken } from '@/services/api.service';
import { NextApiRequest } from 'next';
import { jwtDecode } from 'jwt-decode';
import { Button } from 'primereact/button';
import { Tree } from 'primereact/tree';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';
import { ToastContainer, toast } from 'react-toastify';
import { RadioButton } from 'primereact/radiobutton';
import { TreeSelect } from 'primereact/treeselect';
import { Skeleton } from 'primereact/skeleton';
import { AddMemberDialog } from '@/components/Modals/AddMember';
import router from 'next/router';
import AccountsWorkflow from '@/components/Workflow/accountsWorkflow';
import 'react-toastify/dist/ReactToastify.css';

// import { Dropdown } from 'primereact/dropdown';


// const DepartmentType = {
//   DEPARTMENT: 'department',
//   EXECUTIVE: 'executive',
//   HUMAN_RESOURCES: 'human-resources',
//   FINANCE: 'finance', 
//   ACCOUNTING: 'accounting',
//   OPERATIONS: 'operations',
//   ENGINEERING: 'engineering',
//   MARKETING: 'marketing',
//   SALES: 'sales',
//   PRODUCT_DEVELOPMENT: 'product-development',
//   LEGAL: 'legal',
//   ADMINISTRATION: 'administration',

// }

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  try {
    setToken(req);
    const cookie = req.cookies.talency_id_token;
    if (!cookie) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
    const decoded: any = jwtDecode(cookie);
    const orgId = decoded.org._id;
    const data = await api.getOrgByID(orgId)
    const businessUnits = await api.getDepartmentTree(orgId, 'department')
    const internalRecruiters = await api.getDepartmentTree(orgId, 'recruitment')

    return {
      props: {
        initialOrgData: data || [],
        initialBusinessUnits: businessUnits || [],
        initialInternalRecruiters: internalRecruiters || []
      },
    };
  } catch (error) {
    console.error('Error fetching org details', error.message);
    return {
      props: {
        initialOrgData: [],
        initialBusinessUnits: [],
        initialInternalRecruiters: []
      },
    };
  }
}


const DepartmentTree = ({ initialBusinessUnits, initialOrgData, initialInternalRecruiters }) => {
  const [departments, setDepartments] = useState(initialBusinessUnits)
  const [recruiters, setRecruiters] = useState(initialInternalRecruiters)
  const [deptMembers, setDeptMembers] = useState([])

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const [hoveredNodeKey, setHoveredNodeKey] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [editingParent, setEditingParent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading] = useState(false);

  const [moveDialogVisible, setMoveDialogVisible] = useState(false);
  const [selectedDepartmentForMove, setSelectedDepartmentForMove] = useState(null);
  const [destinationDepartment, setDestinationDepartment] = useState(null);
  const [isMoveToTopLevel, setIsMoveToTopLevel] = useState(false);
  const [isMergeOperation, setIsMergeOperation] = useState(false);
  const [selectedDepartmentA, setSelectedDepartmentA] = useState(null);
  const [loadingNodes, setLoadingNodes] = useState([]);
  const [memberDialogVisible, setMemberDialogVisible] = useState(false);
  const [getSelectedNodeData, setSelectedNode] = useState<any>([]);

  const [loadingBusinessUnits, setLoadingBusinessUnits] = useState(false);
  const [isRecruitment, setIsrecruitment] = useState(false)

  const [workFlowvisible, setWorkFlowVisible] = useState(false);
  const [getSelectedData, setSelectedData] = useState<any>({});

  console.log("getSelectedNode", getSelectedNodeData);
  console.log("getSelectedData", getSelectedData);

  const getDeptWorkflowsData = async (node: any) => {
    const response = await getDepartmentsWorkflow(node.org, node._id)
    if (response) {
      setSelectedNode(response)
    }
  }

  // useEffect(()=>{
  //   setSelectedNode(getSelectedNodeData)
  // },[getSelectedNodeData])




  const viewWorkflow = async (node: any) => {
    setWorkFlowVisible(true)
    getDeptWorkflowsData(node)
    setSelectedData(node)

  }

  const createBusinessUnitMap = (units, map = new Map()) => {
    units.forEach((unit) => {
      map.set(unit.key, unit._id);
      if (unit.children && unit.children.length > 0) {
        createBusinessUnitMap(unit.children, map);
      }
    });
    return map;
  };

  const departmentMap = createBusinessUnitMap(departments);
  const recruiterMap = createBusinessUnitMap(recruiters);


  const handleAddMember = async (memberData) => {
    memberData = { ...memberData, businessUnit: editingDepartment._id }
    try {
      await api.addMember(initialOrgData._id, memberData);

      setMemberDialogVisible(false);

      toast.success(`Member added successfully to: ${editingDepartment.label}`);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error?.response?.data?.message);
    }

  };

  const onHide = () => {
    setDialogVisible(false);
    setNewDepartmentName('');
    setEditingDepartment(null);
    setEditingParent(null);
    setIsDeleting(false);
  };

  const handleDeleteDepartment = async () => {
    if (!editingDepartment) return;

    try {
      await api.deleteDepartment(editingDepartment._id);

      if (!isRecruitment) {
        await fetchUpdatedTree();
        toast.success(`Department deleted successfully: ${editingDepartment.label}`);
      } else {
        await fetchUpdatedRecruitmentTree();
        toast.success(`Recruitment Team deleted successfully: ${editingDepartment.label}`);
      }

    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('An error occurred while deleting the department.');
    }

    onHide();
  };

  const onDragDrop = (event) => {

    setIsrecruitment(event.dragNode.type === 'recruitment')

    setSelectedDepartmentForMove(event.dragNode);
    setDestinationDepartment(event.dropNode.key);
    setMoveDialogVisible(true);
  };

  const addDepartmentToTree = (treeData, parentKey, newDepartment) => {
    return treeData.map((dept) => {
      if (dept.key === parentKey) {
        return {
          ...dept,
          children: [...(dept.children || []), newDepartment],
        };
      }

      if (dept.children) {
        return {
          ...dept,
          children: addDepartmentToTree(dept.children, parentKey, newDepartment),
        };
      }

      return dept;
    });
  };

  const handleEditOrAddDepartment = async () => {
    if (newDepartmentName.trim() === '') {
      toast.error('Department name cannot be empty.');
      return;
    }

    if (newDepartmentName.length > 50) {
      toast.error('Department name cannot exceed 50 characters.');
      return;
    }


    if (!editingParent && !editingDepartment) {

      if (isRecruitment) {
        const existingRecruitmentTeam = recruiters.find(
          (recruiterTeam) =>
            recruiterTeam.label.toLowerCase() === newDepartmentName.toLowerCase() &&
            !recruiterTeam.parentBusinessUnit
        );
        if (existingRecruitmentTeam) {
          toast.error('A root-level recruitment team with the same name already exists.');
          return;
        }

      }
      else {
        const existingDepartment = departments.find(
          (dept) =>
            dept.label.toLowerCase() === newDepartmentName.toLowerCase() &&
            !dept.parentBusinessUnit
        );
        if (existingDepartment) {
          toast.error('A root-level department with the same name already exists.');
          return;
        }
      }

      // if (!isRecruitment && !departmentType && !editingDepartment   ) {
      //   toast.error('Please select a department type.');
      //   return;
      // }
    }

    let newDepartmentKey;
    let level;

    if (editingDepartment && editingDepartment.label !== newDepartmentName) {
      const updatedDepartment = {
        label: newDepartmentName,
      };

      try {
        await api.editDepartment(editingDepartment._id, updatedDepartment);
        setLoadingNodes([editingDepartment.key])
        setIsrecruitment(editingDepartment.type === "recruitment");

        if (isRecruitment) {
          setRecruiters((prevRecruiters) =>
            updateDepartmentLabel(prevRecruiters, editingDepartment._id, newDepartmentName)
          );
        } else {
          setDepartments((prevDepartments) =>
            updateDepartmentLabel(prevDepartments, editingDepartment._id, newDepartmentName)
          );
        }

        toast.success(`${isRecruitment ? "Recruitment Team" : "Department"} updated successfully: ${newDepartmentName}`);

      } catch (error) {
        console.error('Error updating department:', error);
        toast.error('An error occurred while updating the department.');
      } finally {
        setLoadingNodes([])
      }
    } else {
      if (editingParent) {
        if (isRecruitment)
          newDepartmentKey = generateChildKey(editingParent, recruiters);
        else
          newDepartmentKey = generateChildKey(editingParent, departments);
        level = editingParent.level + 1;
        setLoadingNodes([newDepartmentKey]);
      } else {
        if (isRecruitment)
          newDepartmentKey = `${recruiters.length}`;
        else
          newDepartmentKey = `${departments.length}`;
        level = 1
        setLoadingNodes([newDepartmentKey]);
      }

      const newDepartment = {
        key: newDepartmentKey,
        label: newDepartmentName,
        org: initialOrgData._id,
        children: [],
        level,
        type: isRecruitment
          ? 'recruitment'
          : editingParent
            ? editingParent.type
            : 'department',
        ...(editingParent && { parentBusinessUnit: editingParent._id }),
      };


      try {
        const resultedDepartment = await api.addDepartment(newDepartment);
        // setDepartments((prevDepartments) => {
        //   if (editingParent) {
        //     return addDepartmentToTree(prevDepartments, editingParent.key, resultedDepartment);
        //   } else {
        //     return [...prevDepartments, resultedDepartment];
        //   }
        // });
        // if (isRecruitment) {
        //   await fetchUpdatedRecruitmentTree();
        //   toast.success(`Recruitment Team created successfully: ${newDepartmentName}`);
        // } else {
        //   await fetchUpdatedTree();
        //   toast.success(`Department created successfully: ${newDepartmentName}`);
        // }
        if (isRecruitment) {
          setRecruiters((prevRecruiters) => {
            if (editingParent) {
              return addDepartmentToTree(prevRecruiters, editingParent.key, resultedDepartment);
            } else {
              return [...prevRecruiters, resultedDepartment];
            }
          });
          toast.success(`Recruitment Team created successfully: ${newDepartmentName}`);
        } else {
          setDepartments((prevDepartments) => {
            if (editingParent) {
              return addDepartmentToTree(prevDepartments, editingParent.key, resultedDepartment);
            } else {
              return [...prevDepartments, resultedDepartment];
            }
          });
          toast.success(`Department created successfully: ${newDepartmentName}`);
        }
      } catch (error) {
        console.error('Error adding department:', error);
        toast.error(error?.response?.data?.message);
      } finally {
        setLoadingNodes([]);
      }
    }
    onHide();
  };

  const updateDepartmentLabel = (treeData, departmentId, newLabel) => {
    return treeData.map((dept) => {
      if (dept._id === departmentId) {
        return { ...dept, label: newLabel };
      }

      if (dept.children && dept.children.length > 0) {
        return {
          ...dept,
          children: updateDepartmentLabel(dept.children, departmentId, newLabel),
        };
      }

      return dept;
    });
  };

  const openMoveDialog = async (node, isMerge) => {

    setLoadingBusinessUnits(true);

    try {
      // Fetch business units data
      if (isRecruitment) {
        const recruiters = await api.getDepartmentTree(initialOrgData._id, 'recruitment');
        setRecruiters(recruiters)
      } else {
        const departments = await api.getDepartmentTree(initialOrgData._id, 'department');
        setDepartments(departments);
      }

    } catch (error) {
      console.error("Error fetching business units:", error);
    } finally {
      setLoadingBusinessUnits(false);
    }

    setSelectedDepartmentForMove(node);
    setMoveDialogVisible(true);
    setIsMergeOperation(isMerge);
  };


  const nodeTemplate = ((node) => {
    const isHovered = hoveredNodeKey === node.key;
    const isLoading = loadingNodes.includes(node.key);

    return (
      <div
        onMouseEnter={() => setHoveredNodeKey(node.key)}
        onMouseLeave={() => setHoveredNodeKey(null)}
        className={styles.department_node}
      >
        {isLoading ? (
          <Skeleton width="100%" height="2rem" />
        ) : (
          <>
            <span>{node.label}</span>
            {isHovered && (
              <span className={styles.node_actions}>
                <Button
                  icon="pi pi-sitemap"
                  className={`p-button-outlined ${styles.button_sm} ${styles.addButton}`}
                  onClick={() => viewWorkflow(node)}
                  tooltip="View Workflow"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-eye"
                  className={`p-button-outlined ${styles.button_sm} ${styles.addButton}`}
                  onClick={() => router.push(`departments/${node._id}`)}
                  tooltip="View Department"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-plus"
                  className={`p-button-outlined ${styles.button_sm} ${styles.addButton}`}
                  onClick={() => {
                    addSubDepartment(node)
                    setIsrecruitment(node.type === 'recruitment')
                  }}
                  tooltip="Add Sub-Department"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-pencil"
                  className={`p-button-outlined ${styles.button_sm} ${styles.renameButton}`}
                  onClick={() => {
                    renameDepartment(node)
                    setIsrecruitment(node.type === 'recruitment')
                  }}
                  tooltip="Rename"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-user-plus"
                  className={`p-button-outlined ${styles.button_sm} ${styles.renameButton}`}
                  onClick={() => addMember(node)}
                  tooltip="Add Member"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-arrow-right"
                  className={`p-button-outlined ${styles.button_sm} ${styles.moveButton}`}
                  onClick={() => {
                    openMoveDialog(node, false);
                    setIsrecruitment(node.type === 'recruitment')
                  }}
                  tooltip="Move Department"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-sync"
                  className={`p-button-outlined ${styles.button_sm} ${styles.mergeButton}`}
                  onClick={() => {
                    openMoveDialog(node, true);
                    setIsrecruitment(node.type === 'recruitment')
                  }}
                  tooltip="Merge Department"
                  tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                  icon="pi pi-trash"
                  className={`p-button-outlined ${styles.button_sm} ${styles.deleteButton}`}
                  onClick={() => {
                    deleteDepartment(node);
                    setIsrecruitment(node.type === 'recruitment')
                  }}
                  tooltip="Delete"
                  tooltipOptions={{ position: 'bottom' }}
                />
              </span>
            )}
          </>
        )}
      </div>
    );
  });

  const generateChildKey = (parentNode, departments) => {
    const findParentNode = (nodes, parentKey) => {
      for (const node of nodes) {
        if (node.key === parentKey) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findParentNode(node.children, parentKey);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findParentNode(departments, parentNode.key);

    const numberOfChildren = parent && parent.children ? parent.children.length : 0;

    const newChildKey = `${parentNode.key}-${numberOfChildren}`;

    return newChildKey;
  };

  const addMember = async (node) => {
    setEditingDepartment(node);
    setMemberDialogVisible(true);
    try {
      const fetchedMembers: any = await api.getDepartmentMembers(initialOrgData._id, node._id); // Assuming node.key is the department ID
      setDeptMembers(fetchedMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };


  const addSubDepartment = (parentNode) => {
    setNewDepartmentName('')
    setEditingParent(parentNode);
    setDialogVisible(true);
  };

  const renameDepartment = (node) => {
    setNewDepartmentName(node.label);
    setEditingDepartment(node);
    setDialogVisible(true);
  };

  const deleteDepartment = (department) => {
    setIsDeleting(true);
    setEditingDepartment(department);
    setDialogVisible(true);
  };

  const handleMoveDepartment = async () => {
    try {
      if (isMoveToTopLevel) {
        setLoadingNodes([selectedDepartmentForMove.key]);
        await api.moveDepartmentToRoot(selectedDepartmentForMove._id, initialOrgData._id);
        if (isRecruitment) {
          await fetchUpdatedRecruitmentTree();
        } else {
          await fetchUpdatedTree();
        }

      } else {
        if (!destinationDepartment) {
          toast.error('Please select a destination department.');
          return;
        }
        if (selectedDepartmentForMove.key === destinationDepartment) {
          toast.error('The department cannot be moved to the existing location');
          return;
        }


        let destinationId;
        if (isRecruitment) {
          destinationId = recruiterMap.get(destinationDepartment)
        } else {
          destinationId = departmentMap.get(destinationDepartment)
        }
        setLoadingNodes([selectedDepartmentForMove.key, destinationDepartment]);
        await api.moveDepartmentToDestination(selectedDepartmentForMove._id, destinationId);
        setMoveDialogVisible(false);
        // await fetchUpdatedTree()
        if (isRecruitment) {
          await fetchUpdatedRecruitmentTree();
        } else {
          await fetchUpdatedTree();
        }
      }
    } catch (error) {
      toast.error(`Failed to move department. Please try again. ${error?.message}`);
    } finally {
      setMoveDialogVisible(false);
      setSelectedDepartmentForMove(null);
      setDestinationDepartment('');
      setIsMoveToTopLevel(false);
      setLoadingNodes([]);

    }

  };

  const handleMergeDepartment = async () => {
    try {

      if (selectedDepartmentForMove.key === selectedDepartmentA) {
        toast.error('Department cannot be merged with itself');
        return;
      }

      let destinationId;
      if (isRecruitment) {
        destinationId = recruiterMap.get(selectedDepartmentA)
      } else {
        destinationId = departmentMap.get(selectedDepartmentA)
      }

      await api.mergeDepartment(selectedDepartmentForMove._id, destinationId)
      setLoadingNodes([selectedDepartmentForMove.key, destinationDepartment]);

      if (isRecruitment) {
        await fetchUpdatedRecruitmentTree();
      } else {
        await fetchUpdatedTree();
      }
    } catch (error) {
      console.error("Failed to merge departments:", error);
    } finally {
      setMoveDialogVisible(false);
      setSelectedDepartmentForMove(null);
      setSelectedDepartmentA('')
      setLoadingNodes([]);
    }

  };

  const fetchUpdatedTree = async () => {
    try {
      const updatedDepartments = await api.getDepartmentTree(initialOrgData._id, 'department');
      setDepartments(updatedDepartments)
    } catch (error) {
      console.error("Failed to fetch the updated department tree:", error);
    }
  }

  const fetchUpdatedRecruitmentTree = async () => {
    try {
      const updatedRecruitments = await api.getDepartmentTree(initialOrgData._id, 'recruitment');
      setRecruiters(updatedRecruitments)
    } catch (error) {
      console.error("Failed to fetch the updated department tree:", error);
    }
  }

  return (
    <>
      {/* <ToastContainer /> */}
      <div className={styles.departmentContainer}>
        <div className={styles.addDepartmentContainer}>
          <h3 className={styles.careersPageTitle}>DEPARTMENTS</h3>
          <div className={styles.addDepartmentText} onClick={() => {
            setDialogVisible(true)
            setIsrecruitment(false);
          }}>
            <i className="pi pi-plus"></i>
            Add a new top-level department
          </div>
        </div>

        <Tree
          value={departments}
          className={styles.departmentTree}
          nodeTemplate={nodeTemplate}
          loading={loading}
          dragdropScope="move"
          onDragDrop={onDragDrop}
          filter
          filterMode="lenient"
          filterPlaceholder="Search Departments"
          emptyMessage="No Departments Found"
        />

      </div>

      <div className={styles.departmentContainer}>
        <div className={styles.addDepartmentContainer}>
          <h3 className={styles.careersPageTitle}>INTERNAL RECRUITMENT</h3>
          <div className={styles.addDepartmentText} onClick={() => {
            setDialogVisible(true);
            setIsrecruitment(true);
          }}>
            <i className="pi pi-plus"></i>
            Add a new top-level recruitment team
          </div>
        </div>

        <Tree
          value={recruiters}
          className={styles.departmentTree}
          nodeTemplate={nodeTemplate}
          loading={loading}
          dragdropScope="move"
          onDragDrop={onDragDrop}
          filter
          filterMode="lenient"
          filterPlaceholder="Search Recruitment Teams"
          emptyMessage="No Teams Found"
        />

      </div>

      <Dialog
        header={
          isDeleting
            ? "Do you really want to delete this department?"
            : editingDepartment
              ? "Edit Department"
              : editingParent
                ? "New Child Department"
                : isRecruitment
                  ? "New Recruitment Team"
                  : "New Root Level Department"
        }
        visible={dialogVisible}
        onHide={onHide}
        className={styles.dialog}
      >

        {isDeleting ? (
          <div className={styles.deleteConfirmation}>
            <p>
              Are you sure you want to delete the {isRecruitment ? `recruitment-team` : `department`}:{" "}
              {editingDepartment?.label}?
            </p>
            <div className={styles.dialogFooter}>
              <Button
                label="Delete"
                onClick={handleDeleteDepartment}
                className={styles.deleteButton}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.departmentField}>
              <label htmlFor="newDepartmentName" className={styles.label}>
                {isRecruitment ? 'Team Name' : 'Department Name'} <span style={{ color: "red" }}> *</span>
              </label>
              <InputText
                id="newDepartmentName"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.dialogFooter}>
              <Button
                label={
                  editingDepartment
                    ? "Update"
                    : editingParent
                      ? "Add Child"
                      : "Add"
                }
                onClick={handleEditOrAddDepartment}
                className={styles.addButton}
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={isMergeOperation ? `Merge ${selectedDepartmentForMove?.label}` : `Move ${selectedDepartmentForMove?.label}`}
        visible={moveDialogVisible}
        onHide={() => setMoveDialogVisible(false)}
        className={styles.moveMergeDialog}
      >
        {loadingBusinessUnits ? (
          <Skeleton width="100%" height="2rem" /> // Show loader while fetching
        ) : (
          <div className={styles.moveDepartmentDialog}>
            {isMergeOperation ? (
              <>
                <p className={styles.mergeTitleText}>Destination Department will absorb {selectedDepartmentForMove?.label}. Select the department below</p>
                <div className={styles.mergeOptions}>
                  <TreeSelect
                    value={selectedDepartmentA}
                    options={isRecruitment ? recruiters : departments}  // Use fetched business units data here
                    onChange={(e) => setSelectedDepartmentA(e.value)}
                    placeholder="Select Destination Department"
                    className={styles.treeSelect}
                    filter
                    showClear
                  />
                  <InputText
                    value={selectedDepartmentForMove?.label}
                    className={styles.inputText}
                    disabled
                  />
                </div>
              </>
            ) : (
              <>
                <p className={styles.dialogText}>By moving a department, all its sub-departments will be moved as well.</p>
                <div className={styles.moveOptions}>
                  <div className={styles.inlineRadio}>
                    <RadioButton
                      inputId="moveUnderDepartment"
                      name="moveOption"
                      value="department"
                      onChange={() => setIsMoveToTopLevel(false)}
                      checked={!isMoveToTopLevel}
                    />
                    <label htmlFor="moveUnderDepartment" className={styles.radioText}>Move under the following department:</label>
                  </div>
                  <TreeSelect
                    value={destinationDepartment}
                    options={isRecruitment ? recruiters : departments} // Use fetched business units data here
                    onChange={(e) => setDestinationDepartment(e.value)}
                    placeholder="Select destination department"
                    className={styles.treeSelect}
                    disabled={isMoveToTopLevel}
                    filter
                    showClear
                  />

                  <div className={`${styles.inlineRadio} ${isMoveToTopLevel ? styles.inlineRadioExpanded : ''}`}>
                    <RadioButton
                      inputId="moveToTopLevel"
                      name="moveOption"
                      value="top-level"
                      onChange={() => setIsMoveToTopLevel(true)}
                      checked={isMoveToTopLevel}
                    />
                    <label htmlFor="moveToTopLevel" className={styles.radioText}>Move to top-level</label>


                  </div>
                </div>
              </>
            )}
            <div className={styles.dialogFooter}>
              <Button
                label={isMergeOperation ? "Merge" : "Move"}
                onClick={isMergeOperation ? handleMergeDepartment : handleMoveDepartment}
                className={styles.addButton}
              />
            </div>
          </div>
        )}
      </Dialog>

      <AddMemberDialog
        visible={memberDialogVisible}
        onHide={() => setMemberDialogVisible(false)}
        onSave={(data) => handleAddMember(data)}
        initialBusinessUnits={initialBusinessUnits}
        initialOrgUsers={deptMembers}
      />

      {getSelectedNodeData &&
        <Dialog header={getSelectedData.label ? getSelectedData.label : ''} visible={workFlowvisible} style={{ width: '50vw' }} onHide={() => { if (!workFlowvisible) return; setWorkFlowVisible(false); }}>
          <AccountsWorkflow workflows={getSelectedNodeData} orgId={undefined} fetchWorkflows={getDeptWorkflowsData} type={'departments'} setWorkFlowVisible={setWorkFlowVisible} getSelectedData ={getSelectedData}/>
        </Dialog>
      }

    </>
  );
};

export default DepartmentTree;

