import React, { useState ,useEffect} from 'react';
import { Form, Input, Button, TreeSelect, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import { setDoc, doc, getDoc,runTransaction } from 'firebase/firestore';
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
      { title: 'Edit Payment', value: 'fees-editpayment' },
      { title: 'Edit Fees', value: 'fees-editfees' },
      { title: 'Get Slip', value: 'fees-slip' },
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
  const [obj, setObj] = useState(props.initialValues);
  

  const onFinish = async (values) => {

    try {
      await runTransaction(db, async (transaction) => {
      const empRef = doc(db, 'Users', String(obj.username));
      const tempcustedit=await transaction.get(empRef);
      if(!(tempcustedit.exists())){
        alert("This customer does not exist anymore!");
        let temp=[...props.employee];
        const index = temp.findIndex((user) => user.id === obj.id);
        temp.splice(index,1)
        props.setEmployees(temp)
        props.onCancel();
        return;
      }
      transaction.set(empRef, {
        ...values,
        password:obj.password,
        newpassword:obj.newpassword,
        username:obj.username,
        id:obj.id,
        role:"User",
      });
      let tempobj={
        ...values,
        password:obj.password,
        newpassword:obj.newpassword,
        username:obj.username,
        id:obj.id,
        role:"User",
      }
      // Reset the form to its default state
      let temp=[...props.employee];
      const index = temp.findIndex((user) => user.id === obj.id);

      temp[index]=tempobj
      props.setEmployees(temp)
      form.resetFields();
      // Show success modal
      setSuccessModalVisible(true);})
    } catch (e) {
      // Show error modal
      setErrorModalVisible(true);
      console.error('Error updating user:', e.message);
    }
    // Show success modal
    setSuccessModalVisible(true);
  };


  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };
  useEffect(() => {
    // Set the form values when props.initialValues changes
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

  return (
    <>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
          <Input placeholder="Enter name" />
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
