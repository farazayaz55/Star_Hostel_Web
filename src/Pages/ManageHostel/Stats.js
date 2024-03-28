// '#000B4F'
import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import {
  UserOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DollarCircleFilled,
} from '@ant-design/icons';
import COLORS from '../../colors';
const Statisticscard = ({data}) => {
  function sumFees() {
  
    let totalFeesOutgoing = 0;
    for (let i = 0; i < data.length; i++) {
        totalFeesOutgoing += Number(data[i].capacityleft)
    }
    return totalFeesOutgoing;
  }
  function sumFeesBookings() {
  
    let totalFeesOutgoing = 0;
    for (let i = 0; i < data.length; i++) {
        totalFeesOutgoing += Number(data[i].noofseats)
    }
    totalFeesOutgoing=totalFeesOutgoing-sumFees();
    return totalFeesOutgoing;
  }
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="All Bookings"
              value={sumFeesBookings()}
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
        <Col xs={24} sm={24} md={12}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Capacity Left"
              value={sumFees()}
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
   
     
      </Row>
      <Divider style={{ margin: '24px 0' }} />
      {/* Add more sections or components as needed for the admin home page */}
    </div>
  );
};

export default Statisticscard;
