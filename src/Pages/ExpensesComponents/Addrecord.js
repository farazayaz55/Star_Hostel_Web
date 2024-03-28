import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc ,runTransaction} from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,initialValues,onCancel,setProductsstats }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [type,setType]=useState(null)
  const [record,setRecord]=useState(initialValues)

 
  const generateProductCode = () => {
    return `RECORD-${uuidv4()}`;
  };
 

  const onFinish = async (values) => {

    try {
      
      await runTransaction(db, async (transaction) => {
        const formattedDate =values.date.$d.toLocaleDateString('en-GB',  { year: 'numeric', month: '2-digit', day: '2-digit' });
      const productRef = doc(db, 'Expenses', initialValues.code);
        const tempexptoadd=await transaction.get(productRef);
        if(!(tempexptoadd.exists())){

          alert("This account record does not exist now or removed by anyone.")
          onCancel();
          return;
        }
      let temprecord=tempexptoadd.data();
        temprecord.timeLine.unshift({
            ...values,
            code:generateProductCode(),
            date:formattedDate,
        })
        if(values.recordType==="toGive"){
            temprecord.toGive=Number(temprecord.toGive)+Number(values.amount)
        }else if(values.recordType==="toTake"){
            temprecord.toTake=Number(temprecord.toTake)+Number(values.amount)
        }
   
      transaction.set(productRef, {
        title:initialValues.title,
        toGive:temprecord.toGive,
        toTake:temprecord.toTake,
        timeLine:temprecord.timeLine,
        code: initialValues.code,
      });

      let temp = [...employees];
      const index=temp.findIndex((obj)=>obj.code===initialValues.code);
      temp[index]={
        title:initialValues.title,
        toGive:temprecord.toGive,
        toTake:temprecord.toTake,
        timeLine:temprecord.timeLine,
        code: initialValues.code,
      };
      setEmployees(temp);
      let statobj={toGive:0,toTake:0}
      for(let i=0;i<temp.length;i++){
        statobj.toGive+=temp[i].toGive;
        statobj.toTake+=temp[i].toTake;
      }
      setProductsstats(statobj)

      // Reset the form to its default state
      form.resetFields();
      onCancel();
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
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter a Amount' },
            {
              validator(_, value) {
                if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                  return Promise.resolve();
                }
        
                return Promise.reject(new Error('Please enter a non-negative whole number'));
              },
            },]}
          >
            <Input type={"number"} placeholder="Enter Expense Amount" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
        <Form.Item
        label="Record Type"
                    name={ 'recordType'}
                      rules={[{ required: true, message: 'Please select record type' }]}
                      className="flex-item"
                      fieldKey={'recordType'}
                    >
                      <Select placeholder="Select record type" >
                        <Option value="toGive">Udhaar</Option>
                        <Option value="toTake">Payment</Option>
                      </Select>
                    </Form.Item>
        </Col>
        <Col xs={24} sm={24}>
        <Form.Item
        label={"Date"}
                          name={ 'date'}
                          fieldKey={'date'}
                          rules={[{ required: true, message: 'Please select a date' }]}
                        >
                          <DatePicker placeholder=" Date" style={{ width: '100%' }} />
                        </Form.Item>
                        </Col>
        <Col xs={24} sm={24}>
        <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter a description' }]}
      >
        <Input.TextArea placeholder="Enter description" />
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
          Add Record
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
        Record added successfully!
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
        Error adding record. Please try again.
      </Modal>
    </Form>
  );
};

export default AddProductForm;
