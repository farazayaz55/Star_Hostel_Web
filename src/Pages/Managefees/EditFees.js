import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message,Row,Col ,DatePicker} from 'antd';
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
  const [newdate,setNewdate]=useState(null)
  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);
  const onFinish = async (values) => {
    try {
      await runTransaction(db, async (transaction) => {
      if (newdate) {
        values.date = newdate.format('DD/MM/YYYY');
      } else {
        values.date = props.initialValues.date;
      }
  
      const productRef = doc(db, 'Khatta', String(props.products.code));
      const toaddpayment=await transaction.get(productRef);
if(!(toaddpayment.exists())){
  alert("This month record does not exist anymore now!")
  props.onCancel();
  return;
}
      let temptimeLine = [...toaddpayment.data().customers];
      const indextochange=temptimeLine.findIndex((obj)=>obj.code===props.initialValues.code);
      if(indextochange===-1){
        alert("This record does not exist anymore")
        props.onCancel();
        return;
      }
      temptimeLine[indextochange] = {
        ...toaddpayment.data().customers[indextochange],
        ...values,
      };
  
      let obj = {
        ...toaddpayment.data(),
        customers: temptimeLine,
      };
  
      transaction.set(productRef, {
        ...obj,
      });
      let tempallmonth=[...props.allmonthsavailable];
      const tempmonthindex=tempallmonth.findIndex((obj)=>obj.month===props.products.month);
      let temp = { ...obj};
      tempallmonth[tempmonthindex]=temp
      props.setMonthsAvailable(tempallmonth)
      props.setProducts(temp);
  
      // Reset the form to its default state
      form.resetFields();
      props.onCancel();
      // Show success modal
      setSuccessModalVisible(true);
    })
    } catch (e) {
      setErrorModalVisible(true);
      console.error('Error editing record:', e.message);
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
            name="feeamount"
            label="Fee Amount"
            rules={[{ required: true, message: 'Please enter a Fee Amount' }]}
          >
            <Input type={"number"} placeholder="Enter Fee Amount" />
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
        Record Edited successfully!
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
        Error editing record. Please try again.
      </Modal>
    </Form>
  );
};

export default EditProductForm;
