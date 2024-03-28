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
  function sumFeesPending() {

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
  function sumFees() {

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
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Overall"
              value={sumFees()-sumFeesPending()}
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
              title="Total Incoming"
              value={sumFees()}
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
              title="Total Outgoing"
              value={sumFeesPending()}
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
       
       
      </Row>
      <Divider style={{ margin: '24px 0' }} />
      {/* Add more sections or components as needed for the admin home page */}
    </div>
  );
};

export default Statisticscard;
