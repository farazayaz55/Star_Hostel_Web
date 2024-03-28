import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal,Row,Col } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc ,runTransaction} from 'firebase/firestore';
import COLORS from '../../colors';
import { EditFilled, SaveFilled } from '@ant-design/icons';

const { Option } = Select;

const AddUserForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [obj, setObj] = useState(props.initialValues);

  useEffect(() => {
    // Set the form values when props.initialValues changes
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);


  const onFinish = async (values) => {
    try {
      
      await runTransaction(db, async (transaction) => {
      const empRef = doc(db, 'Employee', String(obj.id));
      const getemp=await transaction.get(empRef);
      if(!(getemp.exists())){
        alert("This employee does not exists anymore");
        props.onCancel();
        return;
      }
      transaction.set(empRef, {
        ...values,
        id:obj.id
      });
      // Reset the form to its default state
      let temp=[...props.employee];
      const index = temp.findIndex((user) => user.id === obj.id);

      temp[index]=values
      props.setEmployees(temp)
      form.resetFields();
      props.onCancel();
      // Show success modal
      setSuccessModalVisible(true);})
    } catch (e) {
      // Show error modal
      setErrorModalVisible(true);
      console.error('Error adding employee:', e.message);
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
       <Input placeholder="Enter contact" />
     </Form.Item>
</Col>

</Row>



      <Form.Item>
        <Button 
        icon={<SaveFilled/>}
        style={{
          borderRadius: 10,
          background: COLORS.primarygradient,
          color: "white"
        }}
        htmlType="submit">
          Save Employee
        </Button>
      </Form.Item>

      {/* Success Modal */}
      <Modal
        title="Success"
        visible={successModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
      >
        Employee Edited successfully!
      </Modal>

      {/* Error Modal */}
      <Modal
        title="Error"
        visible={errorModalVisible}
        onOk={handleErrorModalOk}
        onCancel={handleErrorModalOk}
      >
        Error editing employee. Please try again.
      </Modal>
    </Form>
  );
};

export default AddUserForm;
