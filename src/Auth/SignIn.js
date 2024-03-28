import React, { useState } from 'react';
import { Form, Input, Button, Card, Select } from 'antd';
import { UserOutlined, LockOutlined, LockFilled } from '@ant-design/icons';
import {auth} from "../firebase-config1";
import COLORS from '../colors';
import { useNavigate } from 'react-router-dom';
import {db} from "../firebase-config";
import { sendEmailVerification,updateProfile, createUserWithEmailAndPassword ,onAuthStateChanged,signOut,signInWithEmailAndPassword, updatePassword, deleteUser} from "firebase/auth";
import { doc,getDoc,setDoc,updateDoc } from 'firebase/firestore';

const { Option } = Select;
const SignInPage = () => {
  const navigate = useNavigate();
const [userdata,setUserdata]=useState(null)
function getSubstringBeforeAtSymbol(email) {
  const atIndex = email.indexOf('@');
  
  if (atIndex !== -1) {
    return email.substring(0, atIndex);
    // or use slice: return email.slice(0, atIndex);
  } else {
    // handle the case where '@' is not present in the email
    return 'Invalid email format';
  }
}
let check=false;
const onFinish1 = async (values) => {
  try{
    const result = getSubstringBeforeAtSymbol( values.username);
    const userDocRef = doc(db, "Users", result);
    const querySnapshot = await getDoc(userDocRef);

    if (querySnapshot.exists()) {
      const userData = querySnapshot.data();
      if(userData.password===values.password){
        if(userData.newpassword!==""){
          check=true;
    const userinfo = await signInWithEmailAndPassword(auth, values.username, userData.newpassword);
    if(userinfo){
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, userData.password);
      // Update password in Firestore
      await updateDoc(userDocRef, { newpassword: ""});
      setUserdata(userData);
      navigate("/profile");
    }
        }else{
          const userinfo = await signInWithEmailAndPassword(auth, values.username, values.password);
          if(userinfo){
            setUserdata(userData);
            navigate("/profile");
          }
        }

      }else{
        alert("Incorrect Password")
      }
    }else{
      const userinfo = await signInWithEmailAndPassword(auth, values.username, values.password);
      if(userinfo){
        await deleteUser(auth.currentUser)
        navigate("/login")
      }
    }

  }catch(error){
    if(error.message==="Firebase: Error (auth/invalid-credential)."){
      const result = getSubstringBeforeAtSymbol( values.username);
      const userDocRef = doc(db, "Users", result);
      const querySnapshot = await getDoc(userDocRef);

      if (querySnapshot.exists()) {
        const userData = querySnapshot.data();
        if (values.password === userData.password) {
          try{
            if(check){
              await signInWithEmailAndPassword(auth, values.username, userData.password);
              await updateDoc(userDocRef, { newpassword: ""});
              setUserdata(userData);
              navigate("/profile");
              return;
            }else{
              await createUserWithEmailAndPassword(auth, values.username, userData.password);
              setUserdata(userData);
              navigate("/profile");
              return;
            }
          
          }catch(e){
            if(error.message==="Firebase: Error (auth/invalid-credential)."){
              if(check){
                await createUserWithEmailAndPassword(auth, values.username, userData.password);
                await updateDoc(userDocRef, { newpassword: ""});
                setUserdata(userData);
                navigate("/profile");
                return;
              }
            }
           
          }
        }
      }
    }
  }
}
const onFinish = async (values) => {
  try {
    const userinfo = await signInWithEmailAndPassword(auth, values.username, values.password);

    if (userinfo) {
      const result = getSubstringBeforeAtSymbol( values.username);
      const userDocRef = doc(db, "Users", result);
      const querySnapshot = await getDoc(userDocRef);

      if (querySnapshot.exists()) {

        const userData = querySnapshot.data();
if(userData.password===values.password){
  if (userData.newpassword !== "") {
    if (values.password !== userData.password) {
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, userData.password);
      // Update password in Firestore
      await updateDoc(userDocRef, { newpassword: ""});

      // Set user data
      setUserdata(userData);
      navigate("/profile");
    }
    else{

      // Update password in Firestore
      await setDoc(userDocRef, { newpassword: "" });
         // Set user data
         setUserdata(userData);
         navigate("/profile");
    }
  } else {

    setUserdata(userData);
    navigate("/profile");
  }
}
     else{
      alert("Wrong Credentials")
     }
      } else {
        await deleteUser(auth.currentUser)
        navigate("/login")
      }
    } 
  } catch (error) {
    if(error.message==="Firebase: Error (auth/invalid-credential)."){
        const result = getSubstringBeforeAtSymbol( values.username);
        const userDocRef = doc(db, "Users", result);
        const querySnapshot = await getDoc(userDocRef);
  
        if (querySnapshot.exists()) {
  
          const userData = querySnapshot.data();
  
            if (values.password === userData.password) {
                try{
                  await createUserWithEmailAndPassword(auth, values.username, userData.password);
                  setUserdata(userData);
                  navigate("/profile");
                  return;
                }catch(e){
                  if(e.message==="Firebase: Error (auth/email-already-in-use)."){
                    const userinfo = await signInWithEmailAndPassword(auth, values.username, userData.password);
                    console.log(userinfo)
                    if(userinfo){
      
                      await updatePassword(auth.currentUser, userData.password);
                      // Update password in Firestore
                      await updateDoc(userDocRef, { newpassword: ""});
          
                      // Set user data
                      setUserdata(userData);
                      navigate("/profile");
                    }
                  }
                }
            }
            else{
              alert("Wrong credentials")
            }
         
        } 
    }
   
    else{alert(error.message);}
  }
};
  return (
    <div className="signin-container">
      <Card title="Sign In" className="signin-card">
        <Form
          name="signin-form"
          initialValues={{ remember: true }}
          onFinish={onFinish1}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button 
            icon={<LockFilled/>}
            style={{
              background:COLORS.primarygradient,
               color:"white"
            }}
            htmlType="submit" className="signin-button">
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SignInPage;
