import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc } from 'firebase/firestore';
import COLORS from '../../colors';
import { PlusOutlined } from '@ant-design/icons';
const { Option } = Select;


const AddUserForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [employees, setEmployees] = useState(props.employees);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const generateEmployeeId = () => {
    return uuidv4();
  };

  const onFinish = async (values) => {
    console.log('Submitted values:', values);
    const employeeId = generateEmployeeId();
    try {
      const empRef = doc(db, 'Employee', String(employeeId));
      await setDoc(empRef, {
        ...values,
        id: employeeId,
      });
      // Reset the form to its default state
      let temp=[...employees];
      temp.push( {
        ...values,
        id: employeeId,
      })
      props.setEmployees(temp)
      form.resetFields();
      // Show success modal
      setSuccessModalVisible(true);
    } catch (e) {
      // Show error modal
      setErrorModalVisible(true);
      console.error('Error adding employee:', e.message);
    }
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };
  const validatePay = (_, value) => {
    if (value < 0) {
      return Promise.reject('Pay cannot be negative');
    }
    return Promise.resolve();
  };
  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      {/* Your form fields here */}
      <div className="flex-container">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
          className="flex-item"
        >
          <Input placeholder="Enter name" />
        </Form.Item>

        
        <Form.Item
          name="pay"
          label="Pay"
          rules={[
            { required: true, message: 'Please enter pay' },
            { validator: validatePay },
          ]}
          className="flex-item"
        >
          <Input type="number" placeholder="Enter pay" />
        </Form.Item>
      </div>

      <div className="flex-container">
        <Form.Item
          name="payMethod"
          label="Pay Method"
          rules={[{ required: true, message: 'Please select pay method' }]}
          className="flex-item"
        >
          <Select placeholder="Select pay method">
            <Option value="monthly">Monthly</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="daily">Daily</Option>
            <Option value="hourly">Hourly</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="employeeType"
          label="Employee Type"
          rules={[{ required: true, message: 'Please select employee type' }]}
          className="flex-item"
        >
          <Select placeholder="Select employee type">
            <Option value="regular">Regular</Option>
            <Option value="contract">Contract Based</Option>
            <Option value="order">Order Based</Option>
            <Option value="dailyWager">Daily Wager</Option>
          </Select>
        </Form.Item>
      </div>

      <Form.Item>
        <Button  htmlType="submit"
          style={{
           borderRadius:10,
               background: COLORS.primarygradient,
               color:"white"
                     }}
                     icon={<PlusOutlined/>}
       >
         Add Employee
       </Button>
      </Form.Item>

      {/* Success Modal */}
      <Modal
        title="Success"
        visible={successModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
      >
        Employee added successfully!
      </Modal>

      {/* Error Modal */}
      <Modal
        title="Error"
        visible={errorModalVisible}
        onOk={handleErrorModalOk}
        onCancel={handleErrorModalOk}
      >
        Error adding employee. Please try again.
      </Modal>
    </Form>
  );
};

export default AddUserForm;
