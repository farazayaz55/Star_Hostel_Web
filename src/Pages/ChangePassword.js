
import React,{useEffect,useState} from 'react';
import { Tabs,Card,Spin } from 'antd';
import AdminSideBar from "../components/AdminSidebar"
import { useMedia } from 'react-use';
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc, writeBatch, setDoc } from 'firebase/firestore';
import { auth } from '../firebase-config1';
import {signOut} from "firebase/auth";
import Noaccesspage from "./NoAccess"
import { useNavigate } from 'react-router';
import ChangePassword from "../Auth/ChangePassowrd"
const AdminHomePage = () => {

  
  const navigate=useNavigate();
  
  const [noaccess,setNoaccess]=useState(false)
      const [userdata, setUserdata] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsstats,setProductsstats]=useState({toGive:0,toTake:0})
  const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
  let marginLeft=280
  let marginRight=10
  if(isMobile){
    marginLeft=10
  }
    function doesArrayContainElementStartingWith(arr, searchString) {
      // Use the Array.some() method to check if any element starts with the given string
      return arr.some(element => element.startsWith(searchString));
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
 
  const Logout=()=>{
    signOut(auth)
    .then(() => {
      navigate("/login")
      console.log('User signed out successfully.');
    })
    .catch((error) => {
      alert('Error signing out:');
    });
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
  const getAllEmployees = async () => {
    try {
        const userinfo = await listener();

        if (userinfo) {
            const result = getSubstringBeforeAtSymbol(userinfo.email);
            const q = doc(db, "Users", result);
            const querySnapshot = await getDoc(q);

            if (querySnapshot.exists()) {
                if (querySnapshot.data().newpassword === "") {
                  if((querySnapshot.data().role==="admin")){
                    setUserdata(querySnapshot.data());
                  }else{
                    setNoaccess(true)
                  }
                } else {
                    await auth.signOut();
                }
            } else {
                await auth.signOut();
            }
        } else {
            navigate("/login");
        }
        setLoading(false);
    } catch (error) {
        alert(error.message);
    }
};

  useEffect(() => {
    getAllEmployees()
  }, []);
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
 
 return (
    <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Loading...">
        <div className="content" />
          </Spin>
      </div>):
      <>
        {!(noaccess)?
    <div style={!isMobile?mainStyle:{}}>
    <div style={!isMobile?layoutStyle:{}}>
    <div style={!isMobile?sidebarStyle:{}}>
    <AdminSideBar label={"changepassword"} 
        userdata={userdata}/>
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>
{userdata&&
     <Card
      title="Manage Security"
      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
   <ChangePassword
    userdata={userdata}
    getAllEmployees={Logout}
   />
  </Card>}

 </div>
        
 </div>
 
:<Noaccesspage/>}
</>}
 </div>
  );
};

export default AdminHomePage;