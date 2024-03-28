import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message, Col, Row, DatePicker,Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc ,runTransaction, collection,getDocs} from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { CheckCircleFilled, CloseCircleFilled, EditFilled, SaveFilled } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const EditProductForm = (props) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [product, setProduct] = useState(props.initialValues);
  const [newdate, setNewdate] = useState(null);


  useEffect(() => {
    const initialValues = {
      ...props.initialValues,
      buyingDate: props.initialValues.buyingDate ? moment(props.initialValues.buyingDate) : null,
    };

    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);


  const onFinish = async (values) => {
    setLoading(true)
    try {
      await runTransaction(db, async (transaction) => {
        const toaddroomcheck=props.products.findIndex((obj) => obj.buildingid === values.buildingid && obj.floorid === values.floorid && obj.roomid === values.roomid && obj.code!==props.initialValues.code );
        if(toaddroomcheck===-1){
        const productCode= values.buildingid+"-"+values.floorid+"-"+values.roomid;
      let updatedValues = {
        ...props.initialValues,
        ...values,
      };
      let tempallcollections=[...props.allcollections]
      const productRef = doc(db, 'Rooms', String(props.initialValues.collectioncode));
      const tempinfoofdoc=await transaction.get(productRef);
      const tempcollectiontoeditindex=tempallcollections.findIndex((obj)=>obj.code===props.initialValues.collectioncode);
      let tempcollectiontoedit=tempinfoofdoc.data()
      //  tempcollectiontoedit=tempallcollections[tempcollectiontoeditindex];
      const indexinarraytoupdate=tempcollectiontoedit.allobjects.findIndex((obj)=>obj.code===props.initialValues.code);
      if(indexinarraytoupdate===-1){
        alert("This room does not exist anymore now!");
        props.onCancel();
        return;
      }
      if((values.noofseats!==props.initialValues.noofseats&&Number(values.noofseats)<(Number(props.initialValues.noofseats)-Number(props.initialValues.capacityleft)))||productCode!==props.initialValues.roomcode){
        tempcollectiontoedit.allobjects[indexinarraytoupdate]={...props.initialValues,...values,roomcode:productCode,capacityleft:Number(values.noofseats)}
        updatedValues={...props.initialValues,...values,roomcode:productCode,capacityleft:Number(values.noofseats)}
        const empref=collection(db,"Customer");
        const querySnapshot=await getDocs(empref)
        let tempemplyees=[]
        querySnapshot.forEach((element,index)=>{
          let toupdate=false;
          tempemplyees=element.data()
            element.data().allobjects.forEach((obj,index1)=>{
              if(productCode!==props.initialValues.roomcode){
                if(obj.roomcode===props.initialValues.roomcode){
                  tempemplyees.allobjects[index1].roomcode=productCode;
                  toupdate=true;
                }
              }
              if(values.noofseats!==props.initialValues.noofseats){
                if(obj.roomcode===props.initialValues.roomcode){
                  tempemplyees.allobjects[index1].roomcode="";
                  toupdate=true;
                }
              }
             
            })
            if(toupdate){
              transaction.set(doc(db,"Customer",element.data().code),{...tempemplyees})
            }
            // tempemplyees.push(element.data())
        })
        
      } else{
        updatedValues={...props.initialValues,...values,roomcode:productCode,capacityleft:Number(values.noofseats)-(Number(props.initialValues.noofseats)-Number(props.initialValues.capacityleft))}
        tempcollectiontoedit.allobjects[indexinarraytoupdate]={...props.initialValues,...values,roomcode:productCode,capacityleft:Number(values.noofseats)-(Number(props.initialValues.noofseats)-Number(props.initialValues.capacityleft))}
      }
      transaction.set(productRef, {
        ...tempcollectiontoedit
      });
      let updatedProducts = [...props.products];
      const index = updatedProducts.findIndex((item) => item.code === props.initialValues.code);
      updatedProducts[index] = { ...updatedValues,
        roomcode:productCode};
        tempallcollections[tempcollectiontoeditindex]=tempcollectiontoedit
        props.setAllcollections(tempallcollections)
      props.setProducts(updatedProducts);
      // form.resetFields();
      form.setFieldsValue(updatedValues)
      setNewdate(null);
      setProduct({...updatedValues,code: props.initialValues.code})
      props.onCancel();
      setSuccessModalVisible(true);
    }else{
      alert("A room with these credentials also exist.")
      setLoading(false)
    }
      })
    
    } catch (e) {
      setErrorModalVisible(true);
      console.error('Error editing product:', e.message);
    }
    setLoading(false)
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };

  const validatePrice = (_, value) => {
    if (value < 0) {
      return Promise.reject('Price cannot be negative');
    }
    return Promise.resolve();
  };

  return (
    <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Plaese wait...">
        <div className="content" />
          </Spin>
      </div>):
     <Form form={form} onFinish={onFinish} layout="vertical">
     <Row gutter={16}>
     <Col xs={24} sm={12}>
       <Form.Item
           name="buildingid"
           label="Building Number"
           rules={[{ required: true, message: 'Please enter building number' },
           {
             validator(_, value) {
               if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                 return Promise.resolve();
               }
       
               return Promise.reject(new Error('Please enter a non-negative whole number'));
             },
           }]}
         >
           <Input type="number" placeholder="Enter building number" />
         </Form.Item>
       </Col>
       <Col xs={24} sm={12}>
       <Form.Item
           name="floorid"
           label="Floor Number"
           rules={[{ required: true, message: 'Please enter floor number' },
           {
             validator(_, value) {
               if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                 return Promise.resolve();
               }
       
               return Promise.reject(new Error('Please enter a non-negative whole number'));
             },
           }]}
         >
           <Input type="number" placeholder="Enter floor number" />
         </Form.Item>
       </Col>
     </Row>

     <Row gutter={16}>
     <Col xs={24} sm={12}>
       <Form.Item
           name="roomid"
           label="Room Number"
           rules={[{ required: true, message: 'Please enter room number' },
           {
             validator(_, value) {
               if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                 return Promise.resolve();
               }
       
               return Promise.reject(new Error('Please enter a non-negative whole number'));
             },
           }]}
         >
           <Input type="number" placeholder="Enter room number" />
         </Form.Item>
       </Col>
       <Col xs={24} sm={12}>
         <Form.Item
           name="noofseats"
           label="No of seats"
           rules={[{ required: true, message: 'Please enter no of seats' },
           {
             validator(_, value) {
               if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                 return Promise.resolve();
               }
       
               return Promise.reject(new Error('Please enter a non-negative whole number'));
             },
           }]}
         >
           <Input type="number" placeholder="Enter Number of Seat" />
         </Form.Item>
       </Col>
    
   
     </Row>
     <Row gutter={16}>
     <Col xs={24} sm={6}>
     <Form.Item
     label={"Attach Bathroom"}
                   name={ 'bath'}
                     rules={[{ required: true, message: 'Please select bath type' }]}
                     className="flex-item"
                     fieldKey={ 'bath'}
                   >
                     <Select placeholder="Select bath type" >
                       <Option value="Yes">Yes</Option>
                       <Option value="No">No</Option>
                     </Select>
                   </Form.Item>
                   </Col>
                   <Col xs={24} sm={6}>
     <Form.Item
     label={"Attach Wardrobe"}
                   name={ 'wardrobe'}
                     rules={[{ required: true, message: 'Please select wardrobe type' }]}
                     className="flex-item"
                     fieldKey={ 'wardrobe'}
                   >
                     <Select placeholder="Select wardrobe type" >
                       <Option value="Yes">Yes</Option>
                       <Option value="No">No</Option>
                     </Select>
                   </Form.Item>
                   </Col>
                   <Col xs={24} sm={6}>
     <Form.Item
     label={"Attach Kitchen"}
                   name={ 'kitchen'}
                     rules={[{ required: true, message: 'Please select kitchen type' }]}
                     className="flex-item"
                     fieldKey={ 'kitchen'}
                   >
                     <Select placeholder="Select kitchen type" >
                       <Option value="Yes">Yes</Option>
                       <Option value="No">No</Option>
                     </Select>
                   </Form.Item>
                   </Col>
                   <Col xs={24} sm={6}>
      <Form.Item
      label={"Air Conditioner"}
                    name={ 'airconditioner'}
                      rules={[{ required: true, message: 'Please select A/C' }]}
                      className="flex-item"
                      fieldKey={ 'airconditioner'}
                    >
                      <Select placeholder="Select A/C type" >
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                      </Select>
                    </Form.Item>
                    </Col>
                   </Row>
    

      <Form.Item>
        <Button
          icon={<SaveFilled />}
          style={{
            background: COLORS.primarygradient,
            color: 'white',
            borderRadius: 10
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
          icon={<CloseCircleFilled/>}
            key="cancel"
            onClick={handleSuccessModalOk}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="danger"
            onClick={handleSuccessModalOk}
            icon={<CheckCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: 'white',
            }}
          >
            Done
          </Button>,
        ]}
      >
        Room Edited successfully!
      </Modal>

      {/* Error Modal */}
      <Modal
        title="Error"
        visible={errorModalVisible}
        onOk={handleErrorModalOk}
        onCancel={handleErrorModalOk}
        footer={[
          <Button
          icon={<CloseCircleFilled/>}
            key="cancel"
            onClick={handleErrorModalOk}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
          >
            Cancel
          </Button>
        ]}
      >
        Error editing room. Please try again.
      </Modal>
    </Form>}
    </div>
  );
};

export default EditProductForm;
