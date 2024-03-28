import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal,Row,Col } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc } from 'firebase/firestore';
import COLORS from '../../colors';
import { PlusCircleFilled } from '@ant-design/icons';
const { Option } = Select;

const AddUserForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const generateEmployeeId = () => {
    return uuidv4();
  };

  const onFinish = async (values) => {
    const employeeId = generateEmployeeId();
    try {
      const empRef = doc(db, 'Employee', String(employeeId));
      await setDoc(empRef, {
        ...values,
        advance:0,
        id: employeeId,
      });
      // Reset the form to its default state
      let temp=[...props.employees];
      temp.push( {
        ...values,
        advance:0,
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
       <Row gutter={16}>
       
       <Col xs={24} sm={12}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
          className="flex-item"
        >
          <Input placeholder="Enter name" />
        </Form.Item>
</Col>
<Col xs={24} sm={12}>
        <Form.Item
          name="pay"
          label="Pay"
          rules={[
            { required: true, message: 'Please enter pay' },
            {
              validator(_, value) {
                if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                  return Promise.resolve();
                }
        
                return Promise.reject(new Error('Please enter a non-negative whole number'));
              },
            },
          ]}
          className="flex-item"
        >
          <Input type="number" placeholder="Enter pay" />
        </Form.Item>
</Col>
   
</Row>
<Row gutter={16}>
       
       <Col xs={24} sm={12}>
        <Form.Item
          name="employeeCnic"
          label="Employee CNIC"
          rules={[{ required: true, message: 'Please enter a cnic' }]}
          className="flex-item"
        >
          <Input placeholder="Enter cnic" />
        </Form.Item>
</Col>
<Col xs={24} sm={12}>
        <Form.Item
          name="employeeContact"
          label="Employee Contact"
          rules={[
            { required: true, message: 'Please enter contact' },
          ]}
          className="flex-item"
        >
          <Input  placeholder="Enter contact" />
        </Form.Item>
</Col>
   
</Row>
       
      <Form.Item>
        <Button 
        icon={<PlusCircleFilled/>}
        style={{
          borderRadius: 10,
          background: COLORS.primarygradient,
          color: "white"
        }}
        htmlType="submit">
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
