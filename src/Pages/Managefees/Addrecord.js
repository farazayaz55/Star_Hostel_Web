import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc,getDoc,runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClockCircleFilled, CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ allcollections,setAllcollections,setEmployees, employees,initialValues,onCancel,type,allmonthsavailable,setMonthsAvailable,month,indextochange,allaccounts,setAllaccounts }) => {
  
  const [form] = Form.useForm();

  const inputRef=useRef(null)
  const [imgUrl,setImgUrl]=useState(null)
  const [loading,setLoading]=useState(false)
  const [fileUploaded,setFileUploaded]=useState(null)
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const onFinish = async (values) => {
    try {
      values.Proof=imgUrl
      await runTransaction(db, async (transaction) => {
  const formattedDate =(values.date).format('DD/MM/YYYY');
  const productRef = doc(db, 'Khatta', month);
const toaddpayment=await transaction.get(productRef);
if(!(toaddpayment.exists())){
  alert("This month record does not exist anymore now!")
  onCancel();
  return;
}
  let temprecord=toaddpayment.data();
  let temptimeLine=[...temprecord.customers]
  const indextoaddpayment=temptimeLine.findIndex((obj)=>obj.code===initialValues.code)
  if(indextoaddpayment===-1){
    alert("This record does not exist anymore")
    onCancel();
    return;
  }
  temptimeLine[indextoaddpayment]={...temptimeLine[indextoaddpayment],...values,date:formattedDate,collectedon:formattedDate,status:true}
  console.log(temptimeLine[indextoaddpayment],values)
  let tempallmonth=[...allmonthsavailable];
  temprecord.customers=[...temptimeLine]

    const tempmonthindex=tempallmonth.findIndex((obj)=>obj.month===employees.month);
  transaction.set(productRef, {
   ...temprecord,
  });

let temp={
   ...temprecord
    
  };
  tempallmonth[tempmonthindex]=temp
  
  setMonthsAvailable(tempallmonth)
  setEmployees(temp)

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

 const handleChangePaymentType=(e)=>{
setPaymentMethod(e)
 }

 const openImages=()=>{
  inputRef.current.click()
 }

 const imageUploaded=(event)=>{
  const file=event.target.files[0]
  setFileUploaded(file)
  if (!file) {
    console.warn('No file selected for upload.');
    return;
  }
  const filename = `${Date.now()}-${file.name}`
  const date=new Date()
  console.log(initialValues,initialValues.customer)
  const ImgRef=ref(storage,`Payment Screenshots/${initialValues.customer}/${date.getFullYear()}/${date.getMonth()}/${filename}`)
  setLoading(true)
  const uploadTask=uploadBytesResumable(ImgRef,file)

  uploadTask.on(
    "state_changed",
    (snapshot) => {
        const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        console.log('file upload percent',percent)
    },
    (err) => {
      setFileUploaded(null)
      console.log(err)},
    () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log(url)
            setImgUrl(url)
            setLoading(false)
        });
    }
);
 }





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
            name="discount"
            label="Discount"

          >
            <Input type={"number"} placeholder="Enter Discount Amount" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
                   <Form.Item
      label={"Payement Type"}
                    name={ 'paymentType'}
                      rules={[{ required: true, message: 'Please select Payment Type' }]}
                      className="flex-item"
                      fieldKey={ 'paymentType'}
                    >
                      <Select placeholder="Select Payment Type" onChange={(e)=>handleChangePaymentType(e)} >
                        <Option value="Cash">Cash</Option>
                        <Option value="Online">Online</Option>
                      </Select>
                    </Form.Item>
                        </Col>
                        {(paymentMethod==="Online")&&      <Col xs={24} sm={12}>
                   <Form.Item
      label={"Account"}
                    name={ 'accountInfo'}
                      rules={[{ required: true, message: 'Please select Account' }]}
                      className="flex-item"
                      fieldKey={ 'accountInfo'}
                    >
                      <Select placeholder="Select Account"  >
                        {allaccounts.map((obj)=>{
                          return(
                            <Option value={obj.code}>{obj.bankName}</Option>
                          )
                        })}
                       
                      </Select>
                    </Form.Item>
                        </Col>}
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
          label={"Proof"}
          name={'Proof'}
          fieldKey={'Proof'}
          rules={[{required:false}]}>
            <input type='file' accept='img/*'  style={{display:'none'}} ref={inputRef} 
          onChange={imageUploaded}
            
            />
          { fileUploaded && <div>{fileUploaded.name}</div>}
            <Button
          icon={<PlusCircleFilled />}
          style={{
            background: COLORS.primarygradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={openImages}
        >
          Add Image
        </Button>
          </Form.Item>
        </Col>

      

      </Row>

      <Form.Item>
        <Button
          disabled={loading}
          icon={<PlusCircleFilled />}
          style={{
            background: loading?'red':COLORS.primarygradient,
            color: 'white',
            borderRadius: 10,
        
          }}
          htmlType="submit"
        >
          Add payment
        </Button>
      </Form.Item>
{/* <EmployeeSlip selected={}/> */}
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
        Error adding payment. Please try again.
      </Modal>
    </Form>
  );
};

export default AddProductForm;
