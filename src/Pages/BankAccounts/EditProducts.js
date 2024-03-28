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
  const [product, setProduct] = useState(props.initialValues);
  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

 

 
  const onFinish = async (values) => {
    try {
      await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'Accounts', String(props.initialValues.code));
      let tempaccobj=await transaction.get(productRef)
      transaction.set(productRef, {
        ...tempaccobj.data(),
        ...values,
      });
      let updatedProducts = [...props.products];
      const index = updatedProducts.findIndex((item) => item.code === props.initialValues.code);
      updatedProducts[index] = { ...tempaccobj.data(),...props.initialValues,...values};
      props.setProducts(updatedProducts);
      form.resetFields();
      setSuccessModalVisible(true);
    })
    }catch (e) {
      setErrorModalVisible(true);
      console.error('Error editing account:', e.message);
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
        <Col xs={24} sm={12}>
          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter a Bank Name' }]}
          >
            <Input placeholder="Enter Bank Name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="accountOwner"
            label="Account Owner"
            rules={[{ required: true, message: 'Please enter a Account Owner name' }]}
          >
            <Input placeholder="Enter  Account Owner" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
        <Form.Item
            name="IBAN"
            label="IBAN"
            rules={[{ required: true, message: 'Please enter a IBAN' }]}
          >
            <Input placeholder="Enter IBAN" />
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
        Account Edited successfully!
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
        Error editing account. Please try again.
      </Modal>
    </Form>
  );
};

export default EditProductForm;
