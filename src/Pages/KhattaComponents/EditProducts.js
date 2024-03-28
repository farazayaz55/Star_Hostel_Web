import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message,Row,Col ,DatePicker} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc, runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';
import { CloseCircleFilled, EditFilled, SaveFilled } from '@ant-design/icons';

const { Option } = Select;

const EditProductForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [product, setProduct] = useState(props.products);
  const [newdate,setNewdate]=useState(null)
  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

 

 
  // const onFinish = async (values) => {
  //   try {
  // if(newdate){
  //   values.date =(newdate).format('DD/MM/YYYY');
  // }
  // else{
  //   values.date=props.initialValues.date;
  // }

  //     const productRef = doc(db, 'Khatta', String(product.code));
  //     let temptimeLine=[...product.timeLine]
  //     temptimeLine[props.index]={
  //       ...values
  //     }
  //     let updatedTotal=0;
  //     let updatedOutgoing=0;
  //     for(let i=0;i<temptimeLine.length;i++){
  //       if(temptimeLine[i].type==="Income"){
  //         updatedTotal+=Number(temptimeLine[i].amount)
  //       }else if(temptimeLine[i].type==="Outgoing"){
  //         updatedOutgoing+=Number(temptimeLine[i].amount)
  //       }
  //     }
  
  //   let obj={
  //     month:product.month,
  //     total:updatedTotal,
  //     outgoing:updatedOutgoing,
  //     timeLine:temptimeLine,
  //     code: product.code,
  //   }
    
  //   await setDoc(productRef, {
  //     ...obj
       
  //    });
  //    let temp={...props.products}
  //    temp={
  //      ...obj
       
  //    };
  //    props.setProducts(temp);
 
  //    // Reset the form to its default state
  //    form.resetFields();
  //    props.onCancel();
  //    // Show success modal
  //    setSuccessModalVisible(true);

    
  //   } catch (e) {
  //     setErrorModalVisible(true);
  //     console.error('Error editing expense:', e.message);
  //   }
  // };


  const onFinish = async (values) => {
    try {
      await runTransaction(db,async(transaction)=>{

   
      if (newdate) {
        values.date = newdate.format('DD/MM/YYYY');
      } else {
        values.date = props.initialValues.date;
      }
  
      const productRef = doc(db, 'Khatta', String(props.products.code));
      const response=await transaction.get(productRef);
      if(!(response.exists())){
        alert("This month record does not exist anymore")
        props.onCancel();
        return;
      }
      let temptimeLine = [...response.data().timeLine];
      const indextoedit=temptimeLine.findIndex((obj)=>obj.code===props.initialValues.code)
      if(indextoedit===-1){
        alert("This record does not exist anymore")
        props.onCancel();
        return ;
      }
      temptimeLine[indextoedit] = {
        ...temptimeLine[indextoedit],
        ...values,
      };
  
      let obj = {
        ...response.data(),
        timeLine: temptimeLine,
      };
  
      await setDoc(productRef, {
        ...obj,
      });
  
      let temp = { ...obj};
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
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter a Amount' }]}
          >
            <Input type={"number"} placeholder="Enter Expense Amount" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
        <Form.Item
        label={"Date"}
                        >
                          <DatePicker onChange={(e)=>setNewdate(e)} placeholder=" Date" style={{ width: '100%' }} />
                        </Form.Item>
        </Col>
        </Row>
        <Row gutter={16}>
        {/* <Col xs={24} sm={12}>
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
        </Col> */}
        <Col xs={24} sm={12}>
        <Form.Item
        label="Type"
                    name={ 'type'}
                      rules={[{ required: true, message: 'Please select type' }]}
                      className="flex-item"
                      fieldKey={'type'}
                    >
                      <Select placeholder="Select  type" >
                        <Option value="Income">Incoming</Option>
                        <Option value="Outgoing">Outgoing</Option>
                      </Select>
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
