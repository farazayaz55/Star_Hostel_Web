import React from 'react';
import { BackwardFilled, CloseCircleOutlined, HomeFilled } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router';
import COLORS from '../colors';
const { Paragraph, Text } = Typography;

const App = () => {
  const navigate=useNavigate();
const gohome=()=>{
  navigate("/profile")
}
const goback=()=>{
  navigate(-1);
}
  return(

  
  <Result
    status="error"
    title="Access Failed"
    subTitle="You do not have access to this page. Request the owner to get access and visit again.Thanks!"
    extra={[
      <Button   icon={<HomeFilled />}
      style={{
        borderRadius: 10,
        background: COLORS.primarygradient,
        color: 'white',
      }} 
      onClick={gohome}
      type="primary" key="console">
        Go Home
      </Button>,
      <Button
      icon={<BackwardFilled />}
      style={{
        borderRadius: 10,
        background: COLORS.editgradient,
        color: 'white',
      }}
      onClick={goback}
      key="buy">Go Back</Button>,
    ]}
  >
   
  </Result>)
};
export default App;