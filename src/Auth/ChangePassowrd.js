import React,{useState} from 'react';
import { Form, Input, Button, Card, Select } from 'antd';
import { UserOutlined, LockOutlined, LockFilled } from '@ant-design/icons';
import {auth} from "../firebase-config1";
import COLORS from '../colors';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase-config';
import { setDoc, doc } from 'firebase/firestore';
import { sendEmailVerification,updateProfile, createUserWithEmailAndPassword ,onAuthStateChanged,signOut,signInWithEmailAndPassword} from "firebase/auth";

const { Option } = Select;
const SignInPage = ({userdata,getAllEmployees}) => { 
  const navigate = useNavigate();
  function getStringLength(inputString) {
    return inputString.length;
  }
  
  function hasSpaces(inputString) {
    // Use a regular expression to check for spaces
    const spaceRegex = /\s/;
    return spaceRegex.test(inputString);
  }
 
  const onFinish = async(values) => {
    try{
      if(userdata.password===values.oldpassword){

    
      if(values.newpassword===values.confirmpassword){
        if(getStringLength(values.newpassword)>7&&(!(hasSpaces(values.newpassword)))){
          const empRef = doc(db, 'Users', String(userdata.username));
          await setDoc(empRef, {
            ...userdata,
            password:values.newpassword,
            newpassword:userdata.password,
          });
       
          getAllEmployees();
          // Show success modal
          // setSuccessModalVisible(true);
          // navigate("/profile");
        }
        else{
          alert("The length of password should be atleast 8 and should not have spaces")
        }
      }else{
        alert("Your new passowrd and confirm password does not match!")
      }
    }else{
      alert("Your old password is not correct")
    }
    }
    catch(error){
      alert(error.message)
    }
  };

  return (
      <Card title="Change Password" className="signin-card">
        <Form
          name="signin-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
     

          <Form.Item
            name="oldpassword"
            rules={[{ required: true, message: 'Please enter your oldpassword!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Old Password" />
          </Form.Item>
          
          <Form.Item
            name="newpassword"
            rules={[{ required: true, message: 'Please enter your newpassword!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
          </Form.Item>
          
          <Form.Item
            name="confirmpassword"
            rules={[{ required: true, message: 'Please enter your confirmpassword!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item>
            <Button 
            icon={<LockFilled/>}
            style={{
              background:COLORS.primarygradient,
               color:"white"
            }}
            htmlType="submit" className="signin-button">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
  );
};

export default SignInPage;
