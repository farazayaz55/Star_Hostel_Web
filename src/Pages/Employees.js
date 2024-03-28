
import React,{useEffect,useState} from 'react';
import { Tabs,Card,Spin } from 'antd';
import AdminSideBar from "../components/AdminSidebar"
import { useMedia } from 'react-use';
import AllUsers from './EmployeeComponents/AllUsers'
import AddUserForm from './EmployeeComponents/AddUsers';
import Noaccesspage from "./NoAccess"
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc } from 'firebase/firestore';

import { auth } from '../firebase-config1';
import { useNavigate } from 'react-router';
const AdminHomePage = () => {
  const navigate=useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noaccess,setNoaccess]=useState(false)
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
  let Alltabs=[
    {
        label:"All Employees",
        key:"allusers",
        children: <AllUsers
        userdata={userdata}
        employee={employees}
        setEmployees={setEmployees}
        />
    },
    {
        label:"Add Employees",
        key:"addusers",
        children: <AddUserForm
        userdata={userdata}
        setEmployees={setEmployees}
        employees={employees}/>
    }
  ]
  const getAllEmployees=async()=>{
    try{
        const empref=collection(db,"Employee");
        const querySnapshot=await getDocs(empref)
        let tempemplyees=[]
        querySnapshot.forEach((element,index)=>{
            tempemplyees.push(element.data())
        })
        setEmployees(tempemplyees)
        }catch(error){
            alert(error.message)
        }
  }
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
          if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "employees")){
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
    getAllEmployees()
  }, []);
  let filteredTabs;
  if(userdata){
    filteredTabs = Alltabs.filter((tab) => {
      // If the user is an admin, show all tabs
      if(tab.key==="addusers"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="employees")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="employees-add")!==-1)){
          return true;
        }
        return false;
      }
      if(tab.key==="allusers"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="employees")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="employees-delete"||obj==="employees-edit")!==-1)){
          return true;
        }
        return false;
      }
      
    });
  }
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
    <AdminSideBar label={"employees"} userdata={userdata} />
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>

   {userdata&& 
     <Card
      title="Manage Employees"
      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
     <Tabs
    onChange={onChange}
    type="card"
    items={filteredTabs.map((element, i) => {
      return {
        label: element.label,
        key: element.key,
        children: element.children,
      };
    })}
  />
     </Card>}

</div>
</div>:<Noaccesspage/>}
</>}
</div>
  );
};

export default AdminHomePage;