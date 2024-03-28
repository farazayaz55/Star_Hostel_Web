
import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker,Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc,runTransaction,collection,getDocs } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CheckCircleFilled, CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';
import moment from "moment"

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,userdata,allcollections,setAllcollections }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type,setType]=useState(null)

  const generateProductCode = () => {
    return `ROOMCOLLECTION-${uuidv4()}`;
  };
  const onFinish = async (values) => {
    const productCode = `ROOM-${uuidv4()}`
    const roomcode=values.buildingid+"-"+values.floorid+"-"+values.roomid;
    setLoading(true)
    try {
     
      await runTransaction(db, async (transaction) => {
        const empref=collection(db,"Rooms");
        const querySnapshot=await getDocs(empref)
        let tempemplyees=[]
        let tempallobjects=[];
        querySnapshot.forEach((element,index)=>{
            tempemplyees.push(element.data())
            tempallobjects=[...tempallobjects,...element.data().allobjects]
        })
        if(tempemplyees.length>0){
        }else{
          const tempcollectionobj={code:generateProductCode(),allobjects:[]}
          tempemplyees.push(tempcollectionobj)
        }
      // Convert buyingDate to a format that can be stored in Firebase
      const toaddroomcheck=tempallobjects.findIndex((obj) => obj.buildingid === values.buildingid && obj.floorid === values.floorid && obj.roomid === values.roomid);
      if(toaddroomcheck===-1){

        let tempinfoofdoc
        let productRef
        let temptoaddcollection
      let tempallcollections=[...allcollections];
      let collectionindex=tempallcollections.findIndex((obj)=>obj.allobjects.length<50);
      if(collectionindex===-1){
        collectionindex=tempallcollections.length;
        tempallcollections.push({code:generateProductCode(),allobjects:[]})
        temptoaddcollection=tempallcollections[collectionindex];
        productRef = doc(db, 'Rooms', temptoaddcollection.code);
      }else{
        
        temptoaddcollection=tempallcollections[collectionindex];
         productRef = doc(db, 'Rooms', tempallcollections[collectionindex].code);
        tempinfoofdoc=await transaction.get(productRef);
        if(tempinfoofdoc.exists()){
          temptoaddcollection=tempinfoofdoc.data()
        }
     
      }
      
    
      temptoaddcollection.allobjects.push({
        ...values,
        roomcode,
        capacityleft:values.noofseats,
        code: productCode,
        collectioncode:temptoaddcollection.code
      })
      tempallcollections[collectionindex]=temptoaddcollection;
        transaction.set(productRef, {
          ...temptoaddcollection
        });
  
        let temp = [...employees];
        temp.unshift({
          ...values,
          roomcode,
          capacityleft:values.noofseats,
          code: productCode,
          collectioncode:temptoaddcollection.code
        });
        setEmployees(temp);
        setAllcollections(tempallcollections)
        form.resetFields();
        setSuccessModalVisible(true);
      }
      else{
        alert("A same room with these credentials already exists")
      }
  
    })
    } catch (e) {
      // Show error modal
      setErrorModalVisible(true);
      console.error('Error adding room:', e.message);
    }
    setLoading(false)
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
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
          icon={<PlusCircleFilled />}
          style={{
            background: COLORS.primarygradient,
            color: 'white',
            borderRadius: 10,
          }}
          htmlType="submit"
        >
          Add Room
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
        Room added successfully!
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
        Error adding room. Please try again.
      </Modal>
    </Form>}
    </div>
  );
};

export default AddProductForm;
