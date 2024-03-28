// '#000B4F'
import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import {
  UserOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import COLORS from '../../colors';
const Statisticscard = ({data}) => {
  
function sumFeesDiscount(arr) {
  let totalFees = 0;
  for (let i = 0; i < arr.length; i++) {
      totalFees += Number(arr[i].pay)
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
              title="Employees"
              value={data.pays.length}
              prefix={<UserOutlined 
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
        <Col xs={24} sm={12} md={16}>
          <Card
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            // bodyStyle={{ backgroundColor: '#f0f0f0' }}
          >
            <Statistic
              title="Total Amount"
              value={sumFeesDiscount(data.pays)}
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
      {/* <Divider style={{ margin: '24px 0' }} /> */}
      {/* Add more sections or components as needed for the admin home page */}
    </div>
  );
};

export default Statisticscard;
// import React, { useRef } from 'react';
// import { Card, Row, Col, Statistic, Divider, Button } from 'antd';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUser, faStore, faChartBar, faCalendar } from '@fortawesome/free-solid-svg-icons';

// import html2pdf from 'html2pdf.js';
// import COLORS from '../../colors';

// const Statisticscard = () => {
//   const statsRef = useRef(null);

//   const generatePDF = () => {
//     const element = statsRef.current;

//     // Set the options for PDF generation
//     const opt = {
//       margin: 10,
//       filename: 'statistics.pdf',
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     };

//     // Generate and save the PDF
//     html2pdf().from(element).set(opt).save();
//   };

//   return (
//     <div style={{ padding: '24px' }}>
//       <Row gutter={[16, 16]} ref={statsRef}>
//         <Col xs={24} sm={12} md={12}>
//           <Card
//             style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
//           >
//             <Statistic
//               title="Regular"
//               value={1000}
//               prefix={<FontAwesomeIcon icon={faUser} style={{
//                 background: COLORS.primarygradient,
//                 marginLeft: 5,
//                 width: 25,
//                 height: 25,
//                 padding: '8px', 
//                 borderRadius: 10,
//                 color:'white'
//               }}  />}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={12}>
//           <Card
//             style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
//           >
//             <Statistic
//               title="Contract"
//               value={50}
//               prefix={<FontAwesomeIcon icon={faStore} style={{
//                 background: COLORS.primarygradient,
//                 marginLeft: 5,
//                 width: 25,
//                 height: 25,
//                 padding: '8px', 
//                 borderRadius: 10,
//                 color:'white'
//               }}  />}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={12}>
//           <Card
//             style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
//           >
//             <Statistic
//               title="Order Based"
//               value={5000}
//               prefix={<FontAwesomeIcon icon={faChartBar} style={{
//                 background: COLORS.primarygradient,
//                 marginLeft: 5,
//                 width: 25,
//                 height: 25,
//                 padding: '8px', 
//                 borderRadius: 10,
//                 color:'white'
//               }}  />}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={12}>
//           <Card
//             style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
//           >
//             <Statistic
//               title="DailyWager"
//               value={10}
//               prefix={<FontAwesomeIcon icon={faCalendar} style={{
//                 background: COLORS.primarygradient,
//                 width: 25,
//                 height: 25,
//                 padding: '8px', 
//                 borderRadius: 10,
//                 color:'white'
//               }}  />}
//             />
//           </Card>
//         </Col>
//       </Row>
//       <Divider style={{ margin: '24px 0' }} />

//       {/* Add a button to trigger PDF generation */}
//       <Button type="primary" onClick={generatePDF}>
//         Generate PDF
//       </Button>
//     </div>
//   );
// };

// export default Statisticscard;
