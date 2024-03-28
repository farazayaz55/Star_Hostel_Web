import React, { useState ,useEffect} from 'react';
import { Form, Input, Button, Select,Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import { setDoc, doc,runTransaction } from 'firebase/firestore';
import {  CloseCircleFilled, SaveFilled } from '@ant-design/icons';
const { Option } = Select;

const AddUserForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [employees, setEmployees] = useState(props.employee);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [obj, setObj] = useState(props.initialValues);

  useEffect(() => {
    // Set the form values when props.initialValues changes
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

  function getStringLength(inputString) {
    return inputString.length;
  }
  
  function hasSpaces(inputString) {
    // Use a regular expression to check for spaces
    const spaceRegex = /\s/;
    return spaceRegex.test(inputString);
  }
 
 
  const onFinish = async (values) => {
if(getStringLength(values.password)>7&&(!(hasSpaces(values.password)))){


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
        password:values.password,
        newpassword:obj.password,
        username:obj.username,
        accesses:obj.accesses,
        name:obj.name,
        id:obj.id,
        role:obj.role
      });
      let tempobj={
        ...values,
        password:values.password,
        newpassword:obj.password,
        username:obj.username,
        accesses:obj.accesses,
        role:obj.role,
        name:obj.name,
        id:obj.id
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
  }else{
    alert("The length of password should be atleast 8 and should not have spaces")
  }
}


  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
    props.onCancel()
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
    props.onCancel()
  };

  return (
    <>
    <Form form={form} onFinish={onFinish} layout="vertical">
      <div className="flex-container">
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter a password' }]}
          className="flex-item"
        >
          <Input placeholder="Enter new password" />
        </Form.Item>
      
      </div>


      <Form.Item>
        <Button 
        icon={<SaveFilled/>}
          style={{
            borderRadius: 10,
            background: COLORS.primarygradient,
            color: "white"
          }}
        htmlType="submit">
          Change Password
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
        User updated successfully!
      </Modal>

      {/* Error Modal */}
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
        Error updating user. Please try again.
      </Modal>
    </>
  );
};

export default AddUserForm;