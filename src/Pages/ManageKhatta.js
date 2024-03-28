
import React,{useEffect,useState} from 'react';
import { Tabs,Card,Button,DatePicker,Spin,Select } from 'antd';
import AdminSideBar from "../components/AdminSidebar"
import { useMedia } from 'react-use';
import AllUsers from './KhattaComponents/AllProducts'
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc } from 'firebase/firestore';
import COLORS from '../colors';
import Noaccesspage from "./NoAccess"
import { PlusCircleFilled, SearchOutlined } from '@ant-design/icons';

import { auth } from '../firebase-config1';
import { useNavigate } from 'react-router';
const { Option } = Select;
const AdminHomePage = () => {
const navigate=useNavigate();
    const [employees, setEmployees] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userdata, setUserdata] = useState(null);
    const [noaccess,setNoaccess]=useState(false)
    const [allmonthsavailable,setMonthsAvailable]=useState([])
    const [searchText, setSearchText] = useState('');
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
        label:"All Months",
        key:"allusers",
        children: <AllUsers
        products={employees}
        userdata={userdata} 
        allmonthsavailable={allmonthsavailable}
        setMonthsAvailable={setMonthsAvailable}
        setProducts={setEmployees}
        />
    },

    // {
    //     label:"Add Month",
    //     key:"addorder",
    //     children: <AddUserForm
    //     setEmployees={setEmployees}
    //     userdata={userdata} 
    //     allmonthsavailable={allmonthsavailable}
    //     setMonthsAvailable={setMonthsAvailable}
    //     employees={employees}/>
    // }
  ]
  const handleSearch=async(date)=>{
    try{
      if(date){
        const obj=allmonthsavailable.find((element)=>element.month===date)
        setEmployees(obj)
      }else{
        setEmployees(null)
      }
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
          if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "dailydiary")){
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
  const extractdatabase=async()=>{
    try{
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
      }catch(error){
          alert(error.message)
      }
  }
  useEffect(()=>{
    listener1();
    extractdatabase()
  },[])
  let filteredTabs;
  if(userdata){
    filteredTabs = Alltabs.filter((tab) => {
      // If the user is an admin, show all tabs
      if(tab.key==="addorder"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="dailydiary-add")!==-1)){
          return true;
        }
        return false;
      }
      if(tab.key==="allusers"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="dailydiary-addincome"||obj==="dailydiary-addoutgoing"||obj==="dailydiary-getreport"||obj==="dailydiary-delete"||obj==="dailydiary-stats")!==-1)){
          return true;
        }
        return false;
      }
      
    });
  }
 const showlist=(str)=>{
  var afterdash= str.split('-')[1];
  var result =Number( str.split('-')[0]);
result++;
return String(result)+"-"+String(afterdash);
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
    <AdminSideBar label={"expenses"} userdata={userdata} />
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>

   {userdata&&   <Card
      title="Manage Daily Diary"
      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      extra={
        <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* Replace DatePicker.MonthPicker with Select dropdown */}
        <Select
          style={{ width: 200, marginRight: 16 }}
          placeholder="Select Month"
          onChange={(e)=>handleSearch(e)}
        >
          {allmonthsavailable.map((month) => (
            <Option key={month.month} value={month.month}>
              {showlist(month.month)}
            </Option>
          ))}
        </Select>
        {/* Your other extra content goes here */}
      </div>

      }
    >
      {/* <Tabs
        onChange={onChange}
        type="card"
        items={filteredTabs.map((element, i) => {
          return {
            label: element.label,
            key: element.key,
            children: element.children,
          };
        })}
      /> */}
       <AllUsers
        products={employees}
        userdata={userdata} 
        allmonthsavailable={allmonthsavailable}
        setMonthsAvailable={setMonthsAvailable}
        setProducts={setEmployees}
        />
    </Card>}

 </div>
 </div>:<Noaccesspage/>}
 </>}
 </div>
  );
};

export default AdminHomePage;