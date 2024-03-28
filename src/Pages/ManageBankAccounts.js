
import React,{useEffect,useState} from 'react';
import { Tabs,Card,Button,DatePicker,Spin,Select } from 'antd';
import AdminSideBar from "../components/AdminSidebar"
import { useMedia } from 'react-use';
import AllUsers from './BankAccounts/AllProducts'
import AddUserForm from './BankAccounts/AddProduct';
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
    const [allcollections, setAllcollections] = useState([]);
    const [allaccounts, setAllaccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userdata, setUserdata] = useState(null);
    const [monthtosearch, setMonthtosearch] = useState(null);
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
        label:"All Banks",
        key:"allusers",
        children: <AllUsers
        products={employees}
        month={monthtosearch}
        userdata={userdata} 
        allcollections={allcollections}
        setAllcollections={setAllcollections}
        allaccounts={allaccounts}
        setAllaccounts={setAllaccounts}
        allmonthsavailable={allmonthsavailable}
        setMonthsAvailable={setMonthsAvailable}
        setProducts={setEmployees}
        />
    },
    {
        label:"Add Bank",
        key:"addorder",
        children: <AddUserForm
        setEmployees={setEmployees}
        userdata={userdata} 
        month={monthtosearch}
        allcollections={allcollections}
        allaccounts={allaccounts}
        setAllaccounts={setAllaccounts}
        setAllcollections={setAllcollections}
        allmonthsavailable={allmonthsavailable}
        setMonthsAvailable={setMonthsAvailable}
        employees={employees}/>
    }
  ]
  const handleSearch=async(date)=>{
    try{
      if(date){
        const obj=allmonthsavailable.find((element)=>element.month===date)
        let tempaccounts=[]
        for(let l=0;l<allaccounts.length;l++){
            let totalamount=0;
            let tempobjectofacc=[]
            for(let x=0;x<obj.customers.length;x++){
              if(obj.customers[x].status&&obj.customers[x].paymentType==="Online"&&obj.customers[x].accountInfo===allaccounts[l].code){
                tempobjectofacc.push({...obj.customers[x],description:"Fees of : "+obj.customers[x].customer+" from room no :"+obj.customers[x].roomcode})
                totalamount+=Number(obj.customers[x].amount)
              }
          }
          tempaccounts.push({...allaccounts[l],totalamount,timeLine:tempobjectofacc})
        }
        setEmployees(tempaccounts)
        setMonthtosearch(date)
      }else{
        setEmployees(null)
        setMonthtosearch(null)
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
          if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "accounts")){
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
      const empref1=collection(db,"Customer");
      const querySnapshot1=await getDocs(empref1)
      let tempemplyees=[]
      let tempallobjects=[];
      querySnapshot1.forEach((element,index)=>{
          tempemplyees.push(element.data())
          tempallobjects=[...tempallobjects,...element.data().allobjects]
          setAllcollections(tempallobjects)
      })
      const empref2=collection(db,"Accounts");
      const querySnapshot2=await getDocs(empref2)
      let tempemplyees2=[]
      querySnapshot2.forEach((element,index)=>{
        tempemplyees2.push({...element.data(),timeLine:[]})
          setAllaccounts(tempemplyees2)
      })
      
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
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="accounts-add")!==-1)){
          return true;
        }
        return false;
      }
      if(tab.key==="allusers"){
        if((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts")!==-1)||(userdata.accesses.findIndex((obj)=>obj==="accounts-delete"||obj==="accounts-detail"||obj==="accounts-overallstats"||obj==="accounts-edit")!==-1)){
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
    <AdminSideBar label={"accounts"} userdata={userdata} />
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>

   {userdata&&   <Card
      title="Manage Accounts"
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