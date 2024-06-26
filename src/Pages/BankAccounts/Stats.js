// '#000B4F'
import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import {
  UserOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  CalendarOutlined,
  PlusCircleFilled,
  MinusCircleFilled,
  DollarCircleFilled,
} from '@ant-design/icons';
import COLORS from '../../colors';
const Statisticscard = ({data}) => {
  function sumFees(arr) {
    let totalFees = 0;
    for (let i = 0; i < arr.length; i++) {
        totalFees += Number(arr[i].feeamount);
    }
    return totalFees;
}
  function sumFeesCollected(arr) {
    let totalFees = 0;
    for (let i = 0; i < arr.length; i++) {
      if(arr[i].status)
        {totalFees += Number(arr[i].amount);}
    }
    return totalFees;
}
function sumFeesPending(arr) {
  let totalFees = 0;
  for (let i = 0; i < arr.length; i++) {
    if(!(arr[i].status))
      {totalFees += Number(arr[i].feeamount);}
  }
  return totalFees;
}

function sumFeesDiscount(arr) {
  let totalFees = 0;
  for (let i = 0; i < arr.length; i++) {
      totalFees += Number(arr[i].totalamount)}
  return totalFees;
}

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Total Amount"
              value={sumFeesDiscount(data)}
              prefix={<DollarCircleFilled 
                style={{
                  background: COLORS.primarygradient,
                  marginLeft: 5,
                  width: 25,
                  height: 25,
                  padding: '8px', 
                  borderRadius: 10,
                  color:'white'
                }} />}
            />
          </Card>
        </Col>
   
       
      </Row>
      <Divider style={{ margin: '24px 0' }} />
      {/* Add more sections or components as needed for the admin home page */}
    </div>
  );
};

export default Statisticscard;
