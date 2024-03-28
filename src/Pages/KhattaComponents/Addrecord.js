import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc, runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClockCircleFilled, CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,initialValues,onCancel,type,allmonthsavailable,setMonthsAvailable }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [record,setRecord]=useState(initialValues)

 
  const generateProductCode = () => {
    return `REC-${uuidv4()}`;
  };

  const onFinish = async (values) => {

    try {
      await runTransaction(db,async(transaction)=>{
        const formattedDate =(values.date).format('DD/MM/YYYY');
        const productRef = doc(db, 'Khatta', initialValues.code);
      const response=await transaction.get(productRef);
      if(!(response.exists())){
        alert("This month record does not exist anymore!")
        onCancel();
        return;
      }
        let temprecord=response.data();

        let temptimeLine=[...response.data().timeLine]
        const code=generateProductCode();
        temptimeLine.unshift({
              ...values,
              PaymentTypeof:"Cash",
              date:formattedDate,
              type:type,
              code:code,
          })
        let tempallmonth=[...allmonthsavailable];
          const tempmonthindex=tempallmonth.findIndex((obj)=>obj.month===initialValues.month);
        transaction.set(productRef, {
          ...response.data(),
          timeLine:temptimeLine,
          
        });
      
      let temp={
        ...response.data(),
        timeLine:temptimeLine,
        };
        tempallmonth[tempmonthindex]=temp
        setMonthsAvailable(tempallmonth)
        setEmployees(temp);
      
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
        label={"Date"}
                          name={ 'date'}
                          fieldKey={'date'}
                          rules={[{ required: true, message: 'Please select a date' }]}
                        >
                          <DatePicker placeholder=" Date" style={{ width: '100%' }} />
                        </Form.Item>
        </Col>

         {/*   <Col xs={24} sm={24}>
        <Form.Item
        label="Record Type"
                    name={ 'recordType'}
                      rules={[{ required: true, message: 'Please select record type' }]}
                      className="flex-item"
                      fieldKey={'recordType'}
                    >
                      <Select placeholder="Select record type" >
                     <Option value="Installment">Installment</Option> 
                        <Option value="Shop expenses">Shop Expenses</Option>
                        <Option value="Loan">Loan</Option>
                        <Option value="Online">Online</Option>
                        <Option value="Others">Others...</Option>
                      </Select>
                    </Form.Item>
        </Col>*/}
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
