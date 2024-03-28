import React, { useState } from 'react';
import { Table, Space, Button, Modal } from 'antd';
import AddUserForm from './EditUser';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import { setDoc, doc ,getDoc,deleteDoc} from 'firebase/firestore';
import ChangePassword from './ChangePassword';
import { EditFilled, InfoCircleFilled, LockFilled, DeleteFilled, CloseCircleFilled } from '@ant-design/icons';

const EmployeeTable = ({ employee, setEmployees }) => {
  const [visible, setVisible] = useState(false);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [visiblechange, setVisibleChange] = useState(false);
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
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      sorter: (a, b) => a.employeeType.localeCompare(b.employeeType),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<InfoCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
            onClick={() => handleDetail(record)}
          >
            Detail
          </Button>
          <Button
            icon={<EditFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            icon={<LockFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
            onClick={() => handleChangepassword(record)}
          >
            Change Password
          </Button>
          <Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirm(record)}
          >
            Delete
          </Button>
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

  const handleChangepassword = (record) => {
    setSelectedEmployee(record);
    setVisibleChange(true);
  };

  const showDeleteConfirm = (record) => {
    setSelectedEmployee(record);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm =async () => {
    try{

      const refemp=doc(db,"Users",selectedEmployee.username);
      await deleteDoc(refemp);
      let temp=[...employee];
      const index = temp.findIndex((user) => user.username === selectedEmployee.username);

      temp.splice(index,1)
      setEmployees(temp)
    }catch(e){
      alert(e.message)
    }
    // Close the confirmation modal
    setDeleteConfirmVisible(false);
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
      <Table dataSource={employee} columns={columns} rowKey="id"
      
      scroll={{ x: true }} // Enable horizontal scrolling
      responsive={true} // Enable responsive behavior
      />
      <Modal title="Employee Details" visible={visibledetail} onCancel={handleClose} footer={null}>
        {/* Render details of selectedEmployee here */}
        {selectedEmployee && (
          <div>
            <p>Name: {selectedEmployee.name}</p>
            <p>Username: {selectedEmployee.username}</p>
            <p>Password: {selectedEmployee.password}</p>
            <h4>Accesses</h4>
            {selectedEmployee.accesses.map((element, index) => {
              return <p key={index}>{element}</p>;
            })}
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
        title="Change Password"
        visible={visiblechange}
        onCancel={() => setVisibleChange(false)}
        footer={null}
      >
        <ChangePassword
          initialValues={selectedEmployee}
          onCancel={() => setVisibleChange(false)}
          setEmployees={setEmployees}
          employee={employee}
        />
      </Modal>
      <Modal
        title="Delete Employee"
        visible={deleteConfirmVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        footer={[
          <Button
          icon={<CloseCircleFilled/>}
            key="cancel"
            onClick={handleDeleteCancel}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="danger"
            onClick={handleDeleteConfirm}
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </>
  );
};

export default EmployeeTable;
