import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, Space, Row, Col, Upload, message, DatePicker } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc, getDocs, collection,runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import moment from "moment"
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClockCircleFilled, CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ setEmployees, employees,allmonthsavailable,setMonthsAvailable }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [type,setType]=useState(null)

  const generateProductCode = () => {
    return `FEE-${uuidv4()}`;
  };
  function convertDateFormat(inputDate) {
    // Split the input date string into day, month, and year parts
    var dateParts = inputDate.split('/');
    
    // Create a new Date object using the parsed parts
    var inputDateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    
    // Format the date as "DD-MM-YYYY"
    var outputDate = inputDateObj.getDate() + '-' + (inputDateObj.getMonth() + 1) + '-' + inputDateObj.getFullYear();
    
    return outputDate;
}
  const onFinish = async (values) => {
    const productCode = values.date.$d.getMonth()+"-"+values.date.$d.getFullYear();
    try {
      
  await runTransaction(db, async (transaction) => {
const q= doc(db, 'Khatta', productCode);
const querySnapshot=await transaction.get(q);


if(querySnapshot.exists()){
alert("Record for this month already exists")
}else{

  const productRef = doc(db, 'Khatta', productCode);
    const empref1=collection(db,"Customer");
    const querySnapshot1=await getDocs(empref1)
    let tempemplyees=[]
    querySnapshot1.forEach((element,index)=>{
        tempemplyees=[...tempemplyees,...element.data().allobjects]
    })
let tempcollectioncustomers=[]
for(let i=0;i<tempemplyees.length;i++){
  const obj={code:generateProductCode(),customer:tempemplyees[i].customer,customerContact:tempemplyees[i].customerContact,roomcode:tempemplyees[i].roomcode,code:tempemplyees[i].code,collectioncode:tempemplyees[i].collectioncode,feeamount:tempemplyees[i].feeamount,feeDate:tempemplyees[i].feeDate,status:false,discount:0,date:""};
  tempcollectioncustomers.push(obj)
}
  transaction.set(productRef, {
    timeLine:[],
    customers:tempcollectioncustomers,
    pays:[],
    fines:[],
    month:productCode,
    code:productCode
  });
  let temp = [...allmonthsavailable];
  temp.push({
    timeLine:[],
    customers:tempcollectioncustomers,
    pays:[],
    fines:[],
    month:productCode,
    code:productCode
  });
  setMonthsAvailable(temp);
  // Reset the form to its default state
  form.resetFields();
  // Show success modal
  setSuccessModalVisible(true);
}
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
            label={"Month"}
            name={'date'}
            fieldKey={'date'}
            rules={[{ required: true, message: 'Please select a month' }]}
          >
            <DatePicker.MonthPicker placeholder="Select Month" style={{ width: '100%' }} />
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
          Add Fees Month
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
        Month added successfully!
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
        Error adding Month. Please try again.
      </Modal>
    </Form>
  );
};

export default AddProductForm;
