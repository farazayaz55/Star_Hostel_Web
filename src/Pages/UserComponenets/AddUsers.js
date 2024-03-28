import React, { useState } from 'react';
import { Form, Input, Button, TreeSelect, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { SHOW_PARENT } = TreeSelect;

const accessesTreeData = [
  {
    title: 'Dail Diary',
    value: 'dailydiary',
    children: [
      { title: 'Add Income', value: 'dailydiary-addincome' },
      { title: 'Add Outgoing', value: 'dailydiary-addoutgoing' },
      { title: 'Delete', value: 'dailydiary-delete' },
      { title: 'Edit', value: 'dailydiary-edit' },
      { title: 'Stats', value: 'dailydiary-stats' },
    ],
  },
  {
    title: 'Customers',
    value: 'customers',
    children: [
      { title: 'Detail', value: 'customers-detail' },
      { title: 'Add', value: 'customers-add' },
      { title: 'Edit', value: 'customers-edit' },
      { title: 'Security Stats', value: 'customers-stats' },
      { title: 'Archive', value: 'customers-archive' },
    ],
  },
  {
    title: 'Dashboard',
    value: 'dashboard',
    children: [
      { title: 'Graph', value: 'dashboard-graph' },
      { title: 'Stats', value: 'dashboard-stats' },
      { title: 'Record Table', value: 'dashboard-recordtable' },
    ],
  },
  
  {
    title: 'Employees',
    value: 'employees',
    children: [
      { title: 'Add', value: 'employees-add' },
      { title: 'Edit', value: 'employees-edit' },
      { title: 'Delete', value: 'employees-delete' },
    ],
  },
  
  
  {
    title: 'Pay',
    value: 'pay',
    children: [
      { title: 'Manage', value: 'pay-manage' },
      { title: 'Detail', value: 'pay-detail' },
    ],
  },
  {
    title: 'Manage Hostel',
    value: 'hostel',
    children: [
      { title: 'Add Room', value: 'hostel-add' },
      { title: 'Edit Room', value: 'hostel-edit' },
      { title: 'Detail', value: 'hostel-detail' },
      { title: 'Delete Room', value: 'hostel-delete' },
    ],
  },
  {
    title: 'Fees',
    value: 'fees',
    children: [
      { title: 'Add Month', value: 'fees-addmonth' },
      { title: 'Delete Month', value: 'fees-deletemonth' },
      { title: 'Add Payment', value: 'fees-addpayment' },
      { title: 'Get Slip', value: 'fees-slip' },
      { title: 'Edit Payment', value: 'fees-editpayment' },
      { title: 'Edit Fees', value: 'fees-editfees' },
      { title: 'Delete Payment', value: 'fees-deletepayment' },
      { title: 'Increase Fees', value: 'fees-increment' },
      { title: 'Decrease Fees', value: 'fees-decrement' },
      { title: 'Detail', value: 'fees-detail' },
      { title: 'Stats', value: 'fees-stats' },
    ],
  },
  {
    title: 'Digi Khatta',
    value: 'digikhatta',
    children: [
      { title: 'Add', value: 'digikhatta-add' },
      { title: 'Edit', value: 'digikhatta-edit' },
      { title: 'Delete', value: 'digikhatta-delete' },
      { title: 'Detail', value: 'digikhatta-detail' },
      { title: 'Add Record', value: 'digikhatta-addrecord' },
      { title: 'Edit Record', value: 'digikhatta-editrecord' },
      { title: 'Delete Record', value: 'digikhatta-deleterecord' },
      { title: 'Overall Stats', value: 'digikhatta-overallstats' },
      { title: 'Record Stats', value: 'digikhatta-recordstats' },
    ],
  },
  {
    title: 'Banks',
    value: 'accounts',
    children: [
      { title: 'Add', value: 'accounts-add' },
      { title: 'Edit', value: 'accounts-edit' },
      { title: 'Delete', value: 'accounts-delete' },
      { title: 'Detail', value: 'accounts-detail' },
      { title: 'Overall Stats', value: 'accounts-overallstats' },
    ],
  },
  {
    title: 'Archive',
    value: 'archivedcustomers',
    children: [
      { title: 'Detail', value: 'archivedcustomers-detail' },
      { title: 'Delete', value: 'archivedcustomers-delete' },
    ],
  },
];

const AddUserForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  function generateRandomPassword() {
    const length = 8;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&*+=";
    let password = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }
  
  function isValidPassword(password) {
    // Check for the absence of special characters and spaces
    const specialCharsAndSpacesRegex = /[^a-zA-Z0-9]/;
    return !specialCharsAndSpacesRegex.test(password);
  }
 
  const generateEmployeeId = () => {
    return uuidv4();
  };


  const onFinish = async (values) => {
    const employeeId = generateEmployeeId();
    const randomPassword = generateRandomPassword();
    // console.log(randomPassword);
    if(isValidPassword(values.username)){
      try {
        const empRef = doc(db, 'Users',values.username );
        const querySnapshot=await getDoc(empRef)
        if(querySnapshot.exists()){
          alert("This username already exists. Choose another username.")
        }
        else{
          await setDoc(empRef, {
            ...values,
            password:randomPassword,
            newpassword:"",
            id: employeeId,
            role:"User",
          });
          // Reset the form to its default state
          let temp=[...props.employee];
          temp.push( {
            ...values,
            password:randomPassword,
            newpassword:"",
            id: employeeId,
            role:"User",
          })
          props.setEmployees(temp)
          form.resetFields();
          // Show success modal
          setSuccessModalVisible(true);
        }
       
      } catch (e) {
        // Show error modal
        setErrorModalVisible(true);
        console.error('Error adding employee:', e.message);
      }
    }else{
      alert("There should not be special characters or spaces in username")
    }
  
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };

  return (
    <>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          name="username"
          label="User Name"
          rules={[{ required: true, message: 'Please enter a user name' }]}
        >
          <Input placeholder="Enter user name" />
        </Form.Item>
        <Form.Item
          name="accesses"
          label="Accesses"
          rules={[{ required: true, message: 'Please select accesses' }]}
        >
          <TreeSelect
            treeData={accessesTreeData}
            placeholder="Select accesses"
            treeCheckable={true}
            showCheckedStrategy={SHOW_PARENT}
          />
        </Form.Item>
        <Form.Item>
          <Button
            icon={<PlusCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
            htmlType="submit"
          >
            Add User
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Success"
        visible={successModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
        footer={[
        
          <Button
            key="Close"
            type="danger"
            onClick={handleSuccessModalOk}
            icon={<CloseCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
          >
            Close
          </Button>,
        ]}
      >
        User added successfully!
      </Modal>

      <Modal
        title="Error"
        visible={errorModalVisible}
        onOk={handleErrorModalOk}
        onCancel={handleErrorModalOk}
        footer={[
        
          <Button
            key="Close"
            type="danger"
            onClick={handleErrorModalOk}
            icon={<CloseCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
          >
            Close
          </Button>,
        ]}
      >
        Error adding user. Please try again.
      </Modal>
    </>
  );
};

export default AddUserForm;
