import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc, getDoc,runTransaction, collection, getDocs } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,setProductsstats,allaccounts,setAllaccounts }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [type,setType]=useState(null)

  const generateProductCode = () => {
    return `ACCOUNTS-${uuidv4()}`;
  };
 

  const onFinish = async (values) => {

    try {
      const generatecode=generateProductCode();
      await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'Accounts', generatecode);
      const accref=collection(db,"Accounts")
      const resultofacc=await getDocs(accref);
      let temparrresult=[]
      resultofacc.forEach((obj)=>{
        temparrresult.push(obj.data())
      })
      // const timelineref=doc(db,"AccountsTimeLine",generatecode)
      // const querySnapshot=await transaction.get(productRef);
      let findrecord
      findrecord=temparrresult.find((obj)=>obj.IBAN===values.IBAN)
      if(findrecord){
        alert("A same account with this IBAN already exists");
      }else{
    
        transaction.set(productRef, {
          code:generatecode,
          totalamount:0,
          ...values,
        });
    
        let temp = [...temparrresult];
        let tempobjtoadd={
          ...values,
          totalamount:0,
          code:generatecode,
          timeLine:[]
        }
        temp.push({...tempobjtoadd});
        let tempacc=[...temp]
        tempacc.push({...tempobjtoadd})
        setAllaccounts(tempacc)
        // setEmployees(temp);
  
      }
    
      // Reset the form to its default state
      form.resetFields();
      // Show success modal
      setSuccessModalVisible(true);
    })
    } catch (e) {
      // Show error modal
      setErrorModalVisible(true);
      console.error('Error adding product:', e.message);
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
            label="IBAN/Account Number"
            rules={[{ required: true, message: 'Please enter a IBAN' }]}
          >
            <Input placeholder="Enter IBAN" />
          </Form.Item>
          </Col>
          {/* <Col xs={24} sm={12}>
        <Form.Item
            name="Balance"
            label="Starting Balance"
            rules={[{ required: true, message: 'Please enter a Starting Balance' },
            {
              validator(_, value) {
                if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                  return Promise.resolve();
                }
        
                return Promise.reject(new Error('Please enter a non-negative whole number'));
              },
            },]}
          >
            <Input type="number" placeholder="Enter Starting Balance" />
          </Form.Item>
          </Col> */}
          </Row>

      <Form.Item>
        <Button
          icon={<PlusCircleFilled />}
          style={{
            background: COLORS.primarygradient,
            color: 'white',
            borderRadius: 10,
          }}
          htmlType="submit"
        >
          Add Account
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
          </Button>
        ]}
      >
        Account added successfully!
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
        Error adding Account. Please try again.
      </Modal>
    </Form>
  );
};

export default AddProductForm;
