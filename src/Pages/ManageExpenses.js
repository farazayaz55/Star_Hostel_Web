
import React,{useEffect,useState} from 'react';
import { Tabs,Card,Spin } from 'antd';
import AdminSideBar from "../components/AdminSidebar"
import { useMedia } from 'react-use';
import AllUsers from './ExpensesComponents/AllProducts'
import AddUserForm from './ExpensesComponents/AddProduct';
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc } from 'firebase/firestore';
import Noaccesspage from "./NoAccess"
import { auth } from '../firebase-config1';
import { useNavigate } from 'react-router';
const AdminHomePage = () => {

  
  const navigate=useNavigate();
  
      const [userdata, setUserdata] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [noaccess,setNoaccess]=useState(false)
    const [loading, setLoading] = useState(true);
    const [productsstats,setProductsstats]=useState({toGive:0,toTake:0})
  const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
  let marginLeft=280
  let marginRight=10
  if(isMobile){
    marginLeft=10
  }
  const onChange = (key) => {
  };
  let Alltabs=[
    {
        label:"All Digi Khatta",
        key:"allusers",
        children: <AllUsers
        products={employees}
        userdata={userdata}
        setProducts={setEmployees}
        productsstats={productsstats}
        setProductsstats={setProductsstats}
        />
    },

    {
        label:"Add Khatta",
        key:"addorder",
        children: <AddUserForm
        setEmployees={setEmployees}
        userdata={userdata}
        employees={employees}
        productsstats={productsstats}
        setProductsstats={setProductsstats}/>
    }
  ]
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
  function doesArrayContainElementStartingWith(arr, searchString) {
    // Use the Array.some() method to check if any element starts with the given string
    return arr.some(element => element.startsWith(searchString));
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
  const getAllEmployees=async()=>{
    try{
      const userinfo = await listener();
  
      if (userinfo) {
        const result = getSubstringBeforeAtSymbol(userinfo.email);
        const q = doc(db, "Users", result);
        const querySnapshot = await getDoc(q);
  
        if (querySnapshot.exists()) {
          if(querySnapshot.data().newpassword===""){
            if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "digikhatta")){
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
  
        const empref=collection(db,"Expenses");
        const querySnapshot=await getDocs(empref)
        let tempemplyees=[]
        let tempproductsstats={toGive:0,toTake:0}
        querySnapshot.forEach((element,index)=>{
            tempemplyees.push(element.data())
            tempproductsstats.toGive=tempproductsstats.toGive+element.data().toGive;
            tempproductsstats.toTake=tempproductsstats.toTake+element.data().toTake
        })
        setProductsstats(tempproductsstats)
        setEmployees(tempemplyees)
        setLoading(false)
        }catch(error){
            alert(error.message)
        }
  }
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
  let filteredTabs;
  if(userdata){
    filteredTabs = Alltabs.filter((tab) => {
      // If the user is an admin, show all tabs
      if(tab.key==="addorder"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="digikhatta-add")!==-1)){
          return true;
        }
        return false;
      }
      if(tab.key==="allusers"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="digikhatta-edit"||obj==="digikhatta-detail"||obj==="digikhatta-delete"||  obj==="digikhatta-addrecord"||  obj==="digikhatta-editrecord"||  obj==="digikhatta-deleterecord"||  obj==="digikhatta-getparticularreport"||  obj==="digikhatta-getoverallreport"||  obj==="digikhatta-overallstats"||  obj==="digikhatta-recordstats")!==-1)){
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
      </div>):
            <>
            {!(noaccess)?
    <div style={!isMobile?mainStyle:{}}>
    <div style={!isMobile?layoutStyle:{}}>
    <div style={!isMobile?sidebarStyle:{}}>
    <AdminSideBar label={"digikhatta"} 
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
      title="Digi Khatta"
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