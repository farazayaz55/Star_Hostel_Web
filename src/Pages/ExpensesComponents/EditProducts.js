import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message,Row,Col } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc,runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';
import { CloseCircleFilled, EditFilled, SaveFilled } from '@ant-design/icons';

const { Option } = Select;

const EditProductForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

 

 
  const onFinish = async (values) => {
    try {
  
      await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'Expenses', String(props.initialValues.code));
      const tempproduct=await transaction.get(productRef)
      if(!(tempproduct.exists())){
        alert("This acount does not exist anymore or is deleted")
        return;
      }
      transaction.set(productRef, {
        ...tempproduct.data(),
        ...values,
      });

      let updatedProducts = [...props.products];
      const index = updatedProducts.findIndex((item) => item.code === props.initialValues.code);
      updatedProducts[index] = { ...tempproduct.data(),...values};
      props.setProducts(updatedProducts);

      form.resetFields();
      setSuccessModalVisible(true);
    })
    } catch (e) {
      setErrorModalVisible(true);
      console.error('Error editing expense:', e.message);
    }
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };

 
  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
       <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            name="title"
            label="Name"
            rules={[{ required: true, message: 'Please enter a Name' }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button 
        icon={<SaveFilled/>}
         style={{
          background:COLORS.primarygradient,
          color:'white',
          borderRadius:10
        }} 
        htmlType="submit">
          Save Changes
        </Button>
      </Form.Item>

      {/* Success Modal */}
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
        Name Edited successfully!
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
        Error editing name. Please try again.
      </Modal>
    </Form>
  );
};

export default EditProductForm;
