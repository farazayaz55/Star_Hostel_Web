import React, { useEffect, useState } from 'react';
import { Tabs, Card, Button, Modal,Spin } from 'antd';
import AdminSideBar from "../components/AdminSidebar";
import { useMedia } from 'react-use';
import AllUsers from './PayComponents/AllUsers';
import AllPays from './PayComponents/AllPays';
import AddUserForm from './PayComponents/AddnewPay';
import COLORS from '../colors';
import { PlusOutlined } from '@ant-design/icons';

import Noaccesspage from "./NoAccess"
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc } from 'firebase/firestore';

import { auth } from '../firebase-config1';
import { useNavigate } from 'react-router';
const AdminHomePage = () => {
  const navigate=useNavigate();
  const [pays, setPays] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noaccess,setNoaccess]=useState(false)
  const [allmonthsavailable,setMonthsAvailable]=useState([])
  const [userdata, setUserdata] = useState(null);

  const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
  let marginLeft=280
  let marginRight=10
  if(isMobile){
    marginLeft=10
  }
const onChange = (key) => {
  console.log(key);
};
  const filterDailyWagerEmployees = (employees, type) => {
    return employees.filter((employee) => employee.employeeType === type);
  };
  

  const getAllEmployees = async () => {
    try {
      // const empref = collection(db, "Pays");
      // const querySnapshot = await getDocs(empref);
      // let tempEmployees = [];
      // querySnapshot.forEach((element, index) => {
      //   tempEmployees.push(element.data());
      // });
      // setPays(tempEmployees)
      const empref=collection(db,"Khatta");
        const querySnapshot=await getDocs(empref);
        let temparray=[]
        let finalarray=[]
        querySnapshot.forEach((element)=>{
          temparray.push(element.data());
        })
        for (let i=0;i<temparray.length;i++){
          var afterdash= Number(temparray[i].month.split('-')[1]);
          var result =Number( temparray[i].month.split('-')[0]);
          var finalnumber=afterdash+result;
          const obj={key:temparray[i],value:finalnumber}
          finalarray.push(obj);
        }
        finalarray.sort((a, b) => a.value - b.value);
        temparray.length=0;
        for (let i=0;i<finalarray.length;i++){
          temparray.push(finalarray[i].key);
        }
        setMonthsAvailable(temparray)
        setPays(temparray)
      
    } catch (error) {
      alert(error.message);
    }
  };
  const sidebarStyle = {
    color: 'white',
    width: '260px',
    margin: '10px', 
    borderRadius: 20,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  };

  const contentStyle = {
    marginLeft: `${marginLeft}px`,
    marginRight:10,
    marginTop:10,
    width: '100%',
  };
  const mainStyle = {
    display: 'flex'
  };
  const layoutStyle={
    overflowY: 'auto',
    position: 'fixed',
    height: '100%',
  }
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
  const listener = () => new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
      unsubscribe(); // Unsubscribe after resolving to prevent memory leaks
    });
  });
  
  function doesArrayContainElementStartingWith(arr, searchString) {
    // Use the Array.some() method to check if any element starts with the given string
    return arr.some(element => element.startsWith(searchString));
  }
  const listener1=async()=>{
    const userinfo = await listener();
  
    if (userinfo) {
      const result = getSubstringBeforeAtSymbol(userinfo.email);
      const q = doc(db, "Users", result);
      const querySnapshot = await getDoc(q);

      if (querySnapshot.exists()) {
        if(querySnapshot.data().newpassword===""){
          if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "pay")){
            setUserdata(querySnapshot.data());
          }else{
            setNoaccess(true)
          }
        }
        else{
          await auth.signOut();
        }
      
      } else {
        await auth.signOut();
      }
    } else {
      navigate("/login");
    }
    setLoading(false)
  }
  useEffect(() => {
    listener1();
    getAllEmployees();
  }, []);

  const handleAddPay = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Loading...">
        <div className="content" />
          </Spin>
      </div>):   <>
            {!(noaccess)?
    <div style={!isMobile?mainStyle:{}}>
    <div style={!isMobile?layoutStyle:{}}>
    <div style={!isMobile?sidebarStyle:{}}>
    <AdminSideBar label={"pay"} userdata={userdata} />
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>

   {userdata&&
        <Card
          title="Manage Pays"
          style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          // extra={
          //   <Button
          //     htmlType="submit"
          //     onClick={handleAddPay}
          //     style={{
          //       borderRadius: 10,
          //       background: COLORS.primarygradient,
          //       color: "white"
          //     }}
          //     icon={<PlusOutlined />}
          //   >
          //     Add Pay
          //   </Button>
          // }
        >

          <AllPays
            pays={pays}
            setPays={setPays}
            userdata={userdata}
          />

</Card>}

        <Modal
          title="Add Pay"
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={1000}
        >
          <AddUserForm allmonthsavailable={allmonthsavailable} setMonthsAvailable={setMonthsAvailable} setPays={setPays} pays={pays} />
        </Modal>
   

      </div>
      </div>:<Noaccesspage/>}
      </>}
      </div>
  );
};

export default AdminHomePage;
