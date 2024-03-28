// '#000B4F'
import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import {
  AppstoreAddOutlined,
  PlusCircleFilled,
  MinusCircleFilled,
} from '@ant-design/icons';
import COLORS from '../../colors';
const Statisticscard = ({data}) => {
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
          <Card
            // style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Overall"
              value={data.total-data.outgoing}
              prefix={<AppstoreAddOutlined 
                style={{
                //   background: COLORS.primarygradient,
                  marginLeft: 5,
                  width: 25,
                  height: 25,
                  padding: '8px', 
                  borderRadius: 10,
                  color:'green'
                }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            // style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Incoming"
              value={data.total}
              prefix={<PlusCircleFilled 
                style={{
                //   background: COLORS.savegradient,
                  marginLeft: 5,
                  width: 25,
                  height: 25,
                  padding: '8px', 
                  borderRadius: 10,
                  color:'green'
                }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            // style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Outgoing"
              value={data.outgoing}
              prefix={<MinusCircleFilled 
                style={{
                //   background: COLORS.deletegradient,
                  marginLeft: 5,
                  width: 25,
                  height: 25,
                  padding: '8px', 
                  borderRadius: 10,
                  color:'red'
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
