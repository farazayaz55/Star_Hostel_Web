import React,{useState,useEffect,useRef} from 'react';
import AdminSideBar from "../components/AdminSidebar"
import { Row,Col,Spin,Space,Table,Input,Button,Card } from 'antd';
import Statisticscard from '../components/Stats';
import Highlighter from 'react-highlight-words';
import GradientBarChart from '../components/charts/BarChart';
import { useNavigate } from 'react-router';
import { useMedia } from 'react-use';
import COLORS from '../colors';
import Noaccesspage from "./NoAccess"
import { db } from '../firebase-config';
import { getDocs,collection,doc,getDoc } from 'firebase/firestore';
import {  SearchOutlined } from '@ant-design/icons';
import { auth } from '../firebase-config1';

const AdminHomePage = () => {
    
  const navigate=useNavigate();

  const [employees, setEmployees] = useState([]);
  
  const [labels, setLabel] = useState([]);
  const [profit, setProfit] = useState([]);
  const [expense, setExpense] = useState([]);
  const [net, setNet] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  
  const searchInput = useRef(null);
    const [loading, setLoading] = useState(true);
    const [noaccess,setNoaccess]=useState(false)
    const [userdata, setUserdata] = useState(null);
    const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
    let marginLeft=280
    let marginRight=10
    if(isMobile){
      marginLeft=10
    }
    const getName=(str)=>{
      var afterdash= str.split('-')[1];
      var result =Number( str.split('-')[0]);
    result++;
    return String(result)+"-"+String(afterdash);
     }
     function sumFeesPending(data) {

      let totalFeesOutgoing = 0;
      for (let i = 0; i < data.timeLine.length; i++) {
        if((data.timeLine[i].type==="Outgoing"))
          {totalFeesOutgoing += Number(data.timeLine[i].amount)}
      }
      for (let i = 0; i < data.pays.length; i++) {
          totalFeesOutgoing += Number(data.pays[i].pay)
      }
      return totalFeesOutgoing;
    }
    function sumFees(data) {
  
      let totalFeesOutgoing = 0;
      for (let i = 0; i < data.timeLine.length; i++) {
        if(!(data.timeLine[i].type==="Outgoing"))
          {totalFeesOutgoing += Number(data.timeLine[i].amount)}
      }
      for (let i = 0; i < data.customers.length; i++) {
        if(data.customers[i].status)
          {totalFeesOutgoing += Number(data.customers[i].amount)}
      }
      return totalFeesOutgoing;
    }
  const getAllEmployees=async()=>{
    try{
        const empref=collection(db,"Khatta");
        const querySnapshot=await getDocs(empref)
        let templables=[];
        let tempprofit=[];
        let tempexpense=[];
        let tempnet=[]
        let tempemplyees=[]
        querySnapshot.forEach((element,index)=>{
            templables.push(getName(element.data().month));
            tempprofit.push(sumFees(element.data()))
            tempexpense.push(sumFeesPending(element.data()))
            tempnet.push(Number(sumFees(element.data()))-Number(sumFeesPending(element.data())))
            tempemplyees.push({label:getName(element.data().month),profit:sumFees(element.data()),expense:sumFeesPending(element.data()),netprofit:Number(sumFees(element.data()))-Number(sumFeesPending(element.data()))})
        })

          for(let i=templables.length;i<12;i++){
            templables.push('-')
            tempprofit.push(0);
            tempexpense.push(0)
            tempnet.push(0)
          }
        setLabel(templables)
        setProfit(tempprofit)
        setExpense(tempexpense)
        setNet(tempnet)
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
    } else {
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
          if((querySnapshot.data().role==="admin")||doesArrayContainElementStartingWith(querySnapshot.data().accesses, "dashboard")){
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
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters,confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  
    // Reset the table to its original state
    // setFilteredInfo({});
    // setSortedInfo({});
  };
  
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: "white"
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters,confirm)}
            size="small"
            style={{
              width: 90,
              borderRadius: 10,
              background: COLORS.editgradient,
              color: "white"
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: 'Month',
      dataIndex: 'label',
      key: 'label',
      ...getColumnSearchProps('label'),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      ...getColumnSearchProps('profit'),
    },
    {
      title: 'Expense',
      dataIndex: 'expense',
      key: 'expense',
      ...getColumnSearchProps('expense'),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netprofit',
      key: 'netprofit',
      sorter: (a, b) => a.netprofit-b.netprofit
    },
  ];

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
    <AdminSideBar label={"dashboard"} userdata={userdata} />
    </div>
      <div style={{

marginBottom:20,
      }}>

      </div>
      </div>
    
      <div style={contentStyle}>

   {userdata&& 
   <div>

{((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dashboard"||obj==="dashboard-stats")!==-1)  )&&  <Statisticscard data={net}/>}
     <div style={{alignContent:'center',marginLeft:25,marginRight:25}}>
     {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dashboard"||obj==="dashboard-graph")!==-1)  )&&    <Row gutter={ 16}>
        <Col style={{marginBottom:10}}  xs={24} sm={24} md={24}>
        <GradientBarChart title={"Net Profit"} label={labels} profit={net}/>
        </Col>
        <Col style={{marginBottom:10}}  xs={24} sm={24} md={24}>
        <GradientBarChart title={"Income"}   label={labels} profit={profit}/>
        </Col>
         <Col style={{marginBottom:10}} xs={24} sm={24} md={24}>
        <GradientBarChart title={"Expenses"} label={labels} profit={expense}/>
        </Col>
        </Row>}
        {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dashboard"||obj==="dashboard-recordtable")!==-1)  )&&    <Card
      title="All Months"
      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
        <Table columns={columns} dataSource={employees} rowKey="id"
      
      scroll={{ x: true }} // Enable horizontal scrolling
      responsive={true} // Enable responsive behavior
      /></Card>}
        </div>
   
  
     </div>
}

</div>
</div>:<Noaccesspage/>}
</>}
</div>
  );
};

export default AdminHomePage;
