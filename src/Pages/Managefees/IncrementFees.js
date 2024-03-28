import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc, getDoc, collection, getDocs ,runTransaction} from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import moment from "moment"
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClockCircleFilled, CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,allmonthsavailable,setMonthsAvailable,allcollections,setAllcollections }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [type,setType]=useState(null)



  const onFinish = async (values) => {
    try {
      await runTransaction(db, async (transaction) => {
      const empref1=collection(db,"Customer");
      const querySnapshot1=await getDocs(empref1)
      let tempemplyees=[]
      querySnapshot1.forEach((element,index)=>{
          tempemplyees.push(element.data())
          let temptras=element.data();
          for(let i=0;i<temptras.allobjects.length;i++){
            temptras.allobjects[i].feeamount=Number(temptras.allobjects[i].feeamount)+Number(values.feeamount)
          }
          transaction.set(doc(db,"Customer",element.data().code),{...temptras})
      })
      
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
      <Col xs={24} sm={8}>
                    <Form.Item
                    label={"Increase Fee Amount"}
                      name={ 'feeamount'}
                      fieldKey={ 'feeamount'}
                      rules={[{ required: true, message: 'Please enter a fee amount' },
                      {
                        validator(_, value) {
                          if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                            return Promise.resolve();
                          }
                  
                          return Promise.reject(new Error('Please enter a non-negative whole number'));
                        },
                      },
                    ]}
                    >
                      <Input type="number" placeholder="Fee Amount" />
                    </Form.Item>
                    </Col>
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
          Increment Fees
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
           Fees Updated successfully!
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
          </Button>
        ]}
      >
        Error updating fees. Please try again.
      </Modal>
    </Form>
  );
};

export default AddProductForm;
