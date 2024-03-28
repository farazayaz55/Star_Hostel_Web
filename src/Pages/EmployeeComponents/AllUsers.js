import React, { useState } from 'react';
import { Table, Space, Button, Modal } from 'antd';
import AddUserForm from './EditUsers';
import { ClockCircleFilled, DeleteFilled, EditFilled, InfoCircleFilled } from '@ant-design/icons';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import { setDoc, doc,deleteDoc, writeBatch } from 'firebase/firestore';

const EmployeeTable = ({ employee, setEmployees,userdata }) => {
  const [visible, setVisible] = useState(false);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Pay',
      dataIndex: 'pay',
      key: 'pay',
      sorter: (a, b) => a.pay - b.pay,
    },
    {
      title: 'Employee Contact',
      dataIndex: 'employeeContact',
      key: 'employeeContact',
      sorter: (a, b) => a.employeeType.localeCompare(b.employeeType),
    },
    
    {
      title: 'Employee CNIC',
      dataIndex: 'employeeCnic',
      key: 'employeeCnic',
      sorter: (a, b) => a.employeeType.localeCompare(b.employeeType),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
         { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="employees"||obj==="employees-edit")!==-1))&&     <Button
            icon={<EditFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>}
     
          { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="employees"||obj==="employees-delete")!==-1))&&   <Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirm(record)}
          >
            Delete
          </Button>}
        </Space>
      ),
    },
  ];

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setVisible(true);
  };

  const handleDetail = (record) => {
    setSelectedEmployee(record);
    setVisibleDetail(true);
  };

  const showDeleteConfirm = (record) => {
    setSelectedEmployee(record);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm =async () => {
try{
  const empref=doc(db,"Employee",selectedEmployee.id);
  const batch=writeBatch(db)
  batch.delete(empref);
  await batch.commit();
  let temp=[...employee];
  const index = temp.findIndex((user) => user.id === selectedEmployee.id);

  temp.splice(index,1)
  setEmployees(temp)
      // Close the confirmation modal
      setDeleteConfirmVisible(false);
}catch(e){
  alert(e.message)
}
  };

  const handleDeleteCancel = () => {
    // Close the confirmation modal
    setDeleteConfirmVisible(false);
  };

  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedEmployee(null);
  };

  return (
    <>
      <Table dataSource={employee} columns={columns} rowKey="id" />
      <Modal title="Employee Details" visible={visibledetail} onCancel={handleClose} footer={null}>
        {/* Render details of selectedEmployee here */}
        {selectedEmployee && (
          <div>
            <p>Name: {selectedEmployee.name}</p>
            <p>Pay: {selectedEmployee.pay}</p>
            <p>Employee Type: {selectedEmployee.employeeType}</p>
            {/* Add more details as needed */}
          </div>
        )}
      </Modal>
      <Modal
        title="Edit Employee"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <AddUserForm
          initialValues={selectedEmployee}
          onCancel={() => setVisible(false)}
          setEmployees={setEmployees}
          employee={employee}
        />
      </Modal>
      <Modal
  title="Delete Employee"
  visible={deleteConfirmVisible}
  onCancel={handleDeleteCancel}
  footer={[
    <Button 
    icon={<ClockCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
    key="cancel" onClick={handleDeleteCancel}>
      Cancel
    </Button>,
    <Button 
    icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
    key="delete" danger onClick={handleDeleteConfirm}>
      Delete
    </Button>,
  ]}
>
  <p>Are you sure you want to delete this employee?</p>
</Modal>

    </>
  );
};

export default EmployeeTable;
