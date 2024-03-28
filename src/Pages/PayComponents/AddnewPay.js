
import React,{useEffect,useState} from 'react';
import {Select, Tabs,Card } from 'antd';
import { useMedia } from 'react-use';
import AllUsers from './AllUsers'
import { db } from '../../firebase-config';
import { getDocs,collection } from 'firebase/firestore';
import PaySlips from './PaySlips'
const { Option } = Select;
const AdminHomePage = ({pays,setPays,allmonthsavailable, setMonthsAvailable,initialValues,setSelected1}) => {

    const [regularemployees, setRegularemployees] = useState([]);
    const [fullmonth, setFullmonth] = useState(null);
    const [monthtosearch, setMonthtosearch] = useState(null);
    const [dailywagersemployees, setDailywagersemployees] = useState([]);
  const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
  let marginLeft=230
  let marginRight=10
  if(isMobile){
    marginLeft=10
  }
  const onChange = (key) => {
  };
  let Alltabs=[

    {
        label:"All Employees",
        key:"regular",
        children: <AllUsers
        employee={regularemployees}
        setEmployees={setRegularemployees}
        selected={initialValues}
        setSelected1={setSelected1}
        type="regular"
        />
    },
    {
        label:"Preview",
        key:"selected",
        children: <PaySlips
        setEmployees={setDailywagersemployees}
        employees={dailywagersemployees}
        selected={initialValues}
        fullmonth={fullmonth}
        monthtosearch={monthtosearch}
        setFullmonth={setFullmonth}
        allmonthsavailable={allmonthsavailable}
        setMonthsAvailable={setMonthsAvailable}
        setSelected={setSelected1}
        setPays={setPays} 
        pays={pays} 
        type="save"
        />
    },
  ]
  const getAllEmployees = async () => {
    try {
      const empref = collection(db, "Employee");
      const querySnapshot = await getDocs(empref);
      let tempEmployees = [];
      querySnapshot.forEach((element, index) => {
        const existornot=initialValues.pays.findIndex((obj)=>obj.id===element.data().id)
        console.log(existornot)
        if(existornot!==-1){
          tempEmployees.push(initialValues.pays[existornot]);
        }else{
          tempEmployees.push(element.data());
        }
      });
  let employeesWithDefaultOvertime = tempEmployees.map((emp) => ({ ...emp}));
      setRegularemployees(employeesWithDefaultOvertime);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getAllEmployees()
  }, []);
  return (

     <Card
      title="Manage Pays"
      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
      

     <Tabs
    onChange={onChange}
    type="card"
    items={Alltabs.map((element, i) => {
      return {
        label: element.label,
        key: element.key,
        children: element.children,
      };
    })}
  />
  </Card>

  );
};

export default AdminHomePage;