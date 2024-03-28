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
function sumFeesPending1(arr) {
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
    if((arr[i].status))
      {totalFees += Number(arr[i].discount);}
  }
  return totalFees;
}
function sumFeesPending(arr) {
  let totalFees = 0;
  for (let i = 0; i < arr.length; i++) {
    if(!(arr[i].status))
      {totalFees += 1;}
  }
  return totalFees;
}
function sumFeesClear(arr) {
  let totalFees = 0;
  for (let i = 0; i < arr.length; i++) {
    if(arr[i].status)
      {totalFees += 1;}
  }
  return totalFees;
}

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Expected"
              value={sumFees(data.customers)}
              prefix={<AppstoreAddOutlined 
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
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Total Collected"
              value={sumFeesCollected(data.customers)}
              prefix={<BarChartOutlined 
                style={{
                  background: COLORS.savegradient,
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
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Total Pending"
              value={sumFeesPending1(data.customers)}
              prefix={<MinusCircleFilled 
                style={{
                  background: COLORS.deletegradient,
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
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Discount"
              value={sumFeesDiscount(data.customers)}
              prefix={<BarChartOutlined 
                style={{
                  background: COLORS.editgradient,
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
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Cleared Customers"
              value={sumFeesClear(data.customers)}
              prefix={<BarChartOutlined 
                style={{
                  background: COLORS.savegradient,
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
       
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Pending Customers"
              value={sumFeesPending(data.customers)}
              prefix={<BarChartOutlined 
                style={{
                  background: COLORS.deletegradient,
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
    </div>
  );
};

export default Statisticscard;
