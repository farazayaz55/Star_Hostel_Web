import React, { useState } from 'react';
import { Menu, Drawer, Button, Avatar ,Card} from 'antd';
import { useMedia } from 'react-use';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  CalendarOutlined,
  MenuOutlined,
  LogoutOutlined,
  PhoneOutlined,
  CarFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import Info from '../info';
import { Typography } from 'antd';
import COLORS from '../colors';
import {signOut} from "firebase/auth";
import {auth} from "../firebase-config1";
// import image

const { Title } = Typography;


const SidebarDrawer = (props) => {
  const navigate = useNavigate();
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
  const isMobile = useMedia('(max-width: 768px)'); // Adjust the breakpoint as needed
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState(props.label);
  const imageUrl = require("./Ittehad.jpg");
  const handleMenuClick = ({ key }) => {
    setSelectedMenuKey(key);
    navigate("/" + key);
    setDrawerVisible(false);
  };
  function doesArrayContainElementStartingWith(arr, searchString) {
    // Use the Array.some() method to check if any element starts with the given string
    return arr.some(element => element.startsWith(searchString));
  }
  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logging out...');
  };
  const customScrollbarStyle = `
  ::-webkit-scrollbar {
    width: 0 !important;
  }
`;

  return (
    <>
    <style>{customScrollbarStyle}</style>
     {isMobile?
     <>
      <Drawer
        placement="left"
        // closable={false}
        onClose={() => setDrawerVisible(false)}
        visible={isMobile ? isDrawerVisible:true}
        width={240}
        bodyStyle={{ padding: 10, boxShadow: 'none'}}
        closable={isMobile ? true : false}
        mask={isMobile} // Add mask only for mobile screens
        maskClosable={!isMobile} // Allow closing on mask click only for mobile
        style={isMobile ? {} : { position: 'absolute' }}
      >
        <div style={{ padding: '16px', background: 'white' }}>
          <Avatar size={64} src={imageUrl} icon={<UserOutlined />} />
          <Title level={4}>{Info.name}</Title>
        </div>
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[selectedMenuKey]}
          onClick={handleMenuClick}
          style={{ background: 'white' }} // Set a white background for the menu items
        >
          {
           ((props.userdata.role==="admin")|| doesArrayContainElementStartingWith(props.userdata.accesses, "dashboard"))&&
            <Menu.Item key="dashboard" icon={<DashboardOutlined />} style={{ color: selectedMenuKey === 'dashboard' ? 'white' : 'black', background: selectedMenuKey === 'dashboard' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Dashboard
          </Menu.Item>
          }
            <Menu.Item key="profile" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'profile' ? 'white' : 'black', background: selectedMenuKey === 'profile' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Profile
          </Menu.Item>
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "hostel"))&&
          <Menu.Item key="hostel" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'hostel' ? 'white' : 'black', background: selectedMenuKey === 'hostel' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Manage Hostel
          </Menu.Item>}
            {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "dailydiary"))&&
          <Menu.Item key="expenses" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'expenses' ? 'white' : 'black', background: selectedMenuKey === 'expenses' ? COLORS.primarygradient: 'white' ,width:"100%"}}>
          Daily Diary
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "customers"))&&
          <Menu.Item key="customers" icon={<DashboardOutlined />} style={{ color: selectedMenuKey === 'customers' ? 'white' : 'black', background: selectedMenuKey === 'customers' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Customers
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "digikhatta"))&&
          <Menu.Item key="digikhatta" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'digikhatta' ? 'white' : 'black', background: selectedMenuKey === 'digikhatta' ? COLORS.primarygradient: 'white' ,width:"100%"}}>
          Digi Khatta
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "accounts"))&&
          <Menu.Item key="accounts" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'accounts' ? 'white' : 'black', background: selectedMenuKey === 'accounts' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Banks
          </Menu.Item>}


     
          
            {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "archivedcustomers"))&&<Menu.Item key="archivedcustomers" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'archivedcustomers' ? 'white' : 'black', background: selectedMenuKey === 'archivedcustomers' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Archive
          </Menu.Item>}
     
         
        {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "fees"))&& <Menu.Item key="fees" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'fees' ? 'white' : 'black', background: selectedMenuKey === 'fees' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Fees
          </Menu.Item>} 
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "pay"))&& <Menu.Item key="pay" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'pay' ? 'white' : 'black', background: selectedMenuKey === 'pay' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Pays
          </Menu.Item>} 
          
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "employees"))&& <Menu.Item key="employees" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'employees' ? 'white' : 'black', background: selectedMenuKey === 'employees' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Employees
          </Menu.Item>}
          
         
         
            {
           ( (props.userdata.role==="admin"))&& <Menu.Item key="users" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'users' ? 'white' : 'black', background: selectedMenuKey === 'users' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Users
          </Menu.Item>}
          
          
            {
           ( (props.userdata.role==="admin"))&&<Menu.Item key="changepassword" icon={<SettingOutlined />} style={{ color: selectedMenuKey === 'changepassword' ? 'white' : 'black', background: selectedMenuKey === 'changepassword' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Change Password
          </Menu.Item>}
        </Menu>
        <Button
  icon={<LogoutOutlined />}
  style={{
    background: COLORS.primarygradient,
    marginLeft: 5,
    marginTop:15,
    width: '100%',
    height: 40,
    bottom: 16,
    borderRadius:10,
    color:'white'
  }}
  onClick={Logout}
>
  Logout
</Button>
      </Drawer>
     
     <Card 
      style={{
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        margin:10,
      }}
      >
       <Button style={{
          background:COLORS.primarygradient,
          borderRadius:10,
        }} type="primary" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)}>
         
        </Button>
        </Card>
        </>:
         <Card 
         style={{
          //  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          //  margin:10,
           borderRadius:20,
           height:'100%',
          borderWidth:0,
           width:250,
         }}
         >
 <div style={{ padding: '16px', background: 'white' }}>
 <Avatar size={64} src={imageUrl} icon={<UserOutlined />} />
          <Title level={4}>{Info.name}</Title>
        </div>
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[selectedMenuKey]}
          onClick={handleMenuClick}
          style={{ background: 'white' }} // Set a white background for the menu items
        >
          {
           ((props.userdata.role==="admin")|| doesArrayContainElementStartingWith(props.userdata.accesses, "dashboard"))&&
            <Menu.Item key="dashboard" icon={<DashboardOutlined />} style={{ color: selectedMenuKey === 'dashboard' ? 'white' : 'black', background: selectedMenuKey === 'dashboard' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Dashboard
          </Menu.Item>
          }
            <Menu.Item key="profile" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'profile' ? 'white' : 'black', background: selectedMenuKey === 'profile' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Profile
          </Menu.Item>
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "hostel"))&&
          <Menu.Item key="hostel" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'hostel' ? 'white' : 'black', background: selectedMenuKey === 'hostel' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Manage Hostel
          </Menu.Item>}
            {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "dailydiary"))&&
          <Menu.Item key="expenses" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'expenses' ? 'white' : 'black', background: selectedMenuKey === 'expenses' ? COLORS.primarygradient: 'white' ,width:"100%"}}>
          Daily Diary
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "customers"))&&
          <Menu.Item key="customers" icon={<DashboardOutlined />} style={{ color: selectedMenuKey === 'customers' ? 'white' : 'black', background: selectedMenuKey === 'customers' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Customers
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "digikhatta"))&&
          <Menu.Item key="digikhatta" icon={<CalendarOutlined />} style={{ color: selectedMenuKey === 'digikhatta' ? 'white' : 'black', background: selectedMenuKey === 'digikhatta' ? COLORS.primarygradient: 'white' ,width:"100%"}}>
          Digi Khatta
          </Menu.Item>}

          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "accounts"))&&
          <Menu.Item key="accounts" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'accounts' ? 'white' : 'black', background: selectedMenuKey === 'accounts' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Banks
          </Menu.Item>}


     
          
            {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "archivedcustomers"))&&<Menu.Item key="archivedcustomers" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'archivedcustomers' ? 'white' : 'black', background: selectedMenuKey === 'archivedcustomers' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Archive
          </Menu.Item>}
     
         
        {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "fees"))&& <Menu.Item key="fees" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'fees' ? 'white' : 'black', background: selectedMenuKey === 'fees' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Fees
          </Menu.Item>} 
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "pay"))&& <Menu.Item key="pay" icon={<AppstoreAddOutlined />} style={{ color: selectedMenuKey === 'pay' ? 'white' : 'black', background: selectedMenuKey === 'pay' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Pays
          </Menu.Item>} 
          
          {
           ( (props.userdata.role==="admin")||doesArrayContainElementStartingWith(props.userdata.accesses, "employees"))&& <Menu.Item key="employees" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'employees' ? 'white' : 'black', background: selectedMenuKey === 'employees' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Employees
          </Menu.Item>}
          
         
         
            {
           ( (props.userdata.role==="admin"))&& <Menu.Item key="users" icon={<UserOutlined />} style={{ color: selectedMenuKey === 'users' ? 'white' : 'black', background: selectedMenuKey === 'users' ? COLORS.primarygradient: 'white',width:"100%" }}>
            Users
          </Menu.Item>}
          
          
            {
           ( (props.userdata.role==="admin"))&&<Menu.Item key="changepassword" icon={<SettingOutlined />} style={{ color: selectedMenuKey === 'changepassword' ? 'white' : 'black', background: selectedMenuKey === 'changepassword' ? COLORS.primarygradient: 'white',width:"100%" }}>
          Change Password
          </Menu.Item>}
        </Menu>
        <Button
  icon={<LogoutOutlined />}
  style={{
    background: COLORS.primarygradient,
    marginLeft: 5,
    marginTop:15,
    width: '100%',
    height: 40,
    bottom: 16,
    borderRadius:10,
    color:'white'
  }}
  onClick={Logout}
>
  Logout
</Button>
         </Card>
        }
    </>
  );
};

export default SidebarDrawer;
// '#001529',