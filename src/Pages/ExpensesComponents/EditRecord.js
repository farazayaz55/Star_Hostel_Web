import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message,Row,Col,DatePicker } from 'antd';
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
  const [newdate, setNewdate] = useState(null);
  const [product, setProduct] = useState({...props.selectedProduct});
  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);

 

 
  const onFinish = async (values) => {
    try {
      await runTransaction(db, async (transaction) => {
            const formattedDate = newdate ? newdate.$d.toLocaleDateString('en-GB',  { year: 'numeric', month: '2-digit', day: '2-digit' }):  props.selectedProduct.timeLine[props.index].date;
            const productRef = doc(db, 'Expenses', String(props.selectedProduct.code));
            const temprecordtoedit=await transaction.get(productRef)
            if(!(temprecordtoedit.exists())){

              alert("This account record does not exist now or removed by anyone.")
              props.onCancel();
              return;
            }
                let temprecord=temprecordtoedit.data();
                if(props.selectedProduct.timeLine[props.index].recordType==="toGive"){
                    temprecord.toGive-=temprecord.timeLine[props.index].amount;
                    
                }else if(props.selectedProduct.timeLine[props.index].recordType==="toTake"){
                    temprecord.toTake-=temprecord.timeLine[props.index].amount;

                }
                if(values.recordType==="toGive"){
                    temprecord.toGive+=Number(values.amount);
                    
                }else if(values.recordType==="toTake"){
                    temprecord.toTake+=Number(values.amount);

                }

                    const indextoedit=temprecord.timeLine.findIndex((obj=>obj.code===props.initialValues.code))
                   if(temprecord===-1){
                    alert("This record is been already removed by anyone");
                    props.onCancel();
                    return;
                   }
                    temprecord.timeLine[indextoedit]={...values,date:formattedDate};
                      transaction.set(productRef, {
                        ...temprecord
                      });
                      let timeLinetemp=[...temprecord.timeLine]
                      temprecord.timeLine=timeLinetemp
                props.setSelectedProduct({...temprecord})
                      let updatedProducts = [...props.products];
                      const index = updatedProducts.findIndex((item) => item.code === temprecord.code);
                      updatedProducts[index] = temprecord;
                      let tempupdatedProducts=[...updatedProducts]
                      props.setProducts(tempupdatedProducts);
                      let statobj={toGive:0,toTake:0}
                      for(let i=0;i<tempupdatedProducts.length;i++){
                        statobj.toGive+=tempupdatedProducts[i].toGive;
                        statobj.toTake+=tempupdatedProducts[i].toTake;
                      }
                      props.setProductsstats(statobj)
                      form.resetFields();
                      setSuccessModalVisible(true);
                      props.onCancel();
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
          }]}
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
     {props.selectedProduct&&props.selectedProduct.timeLine&& <Col xs={24} sm={24}>
      <Form.Item
            label={"Date : " + props.selectedProduct.timeLine[props.index].date}
          >
            <DatePicker onChange={(event)=>{
              setNewdate(event)}} style={{ width: '100%' }} />
          </Form.Item>
                      </Col>}
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
        icon={<SaveFilled />}
        style={{
          background: COLORS.primarygradient,
          color: 'white',
          borderRadius: 10,
        }}
        htmlType="submit"
      >
        Save Record
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
