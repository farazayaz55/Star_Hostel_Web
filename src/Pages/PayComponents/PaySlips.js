
import React,{useState} from 'react';
import html2pdf from 'html2pdf.js';
import COLORS from '../../colors';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc,runTransaction } from 'firebase/firestore';
import {Button,Modal} from 'antd'
import { DownloadOutlined } from '@ant-design/icons';
const EmployeeSlip = ({selected,pays,setPays,type,allmonthsavailable, setMonthsAvailable,monthtosearch}) => {
    const [successModalVisible, setSuccessModalVisible] = useState(false);
  
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    function getCurrentDateTimeString() {
        const currentDate = new Date();
      
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
      
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      
        const dateTimeString = `${year}-${month}-${day}  ${hours}:${minutes}`;
      
        return dateTimeString;
      }
      
    const generateEmployeeId = () => {
        return `PAY-${uuidv4()}`;
      };
      const handleSuccessModalOk = () => {
        setSuccessModalVisible(false);
      };
    
      const handleErrorModalOk = () => {
        setErrorModalVisible(false);
      };
    const savetodatabase=async()=>{
        const employeeId = monthtosearch;
        try {
          await runTransaction(db, async (transaction) => {
          const empRef = doc(db, 'Khatta', String(selected.month));
            const response=await transaction.get(empRef);
            if(!(response.exists())){
              alert("This month record does not exist anymore")
              return;
            }
          const tempobj=[... selected.pays]
          // tempobj.date=getCurrentDateTimeString()
          // tempobj.id=employeeId
          // console.log(tempobj)

          transaction.set(empRef, {
            ... response.data(),
            pays:tempobj
          });
          // Reset the form to its default state
          let temp=[...pays];
          const indextoedit=temp.findIndex((obj)=>obj.code=== response.data().code)
          temp[indextoedit]= {
            ... response.data(),
            pays:tempobj
          }
          setPays(temp)
          // Show success modal
          setSuccessModalVisible(true);})
        } catch (e) {
          // Show error modal
          setErrorModalVisible(true);
          console.error('Error adding employee:', e.message);
        }
    }
  const generatePDF = async() => {
    if(type==="save"){

        await savetodatabase();
    }
    const element = document.getElementById('employeeSlips');

    // Configuration for html2pdf
    const opt = {
      margin: 10,
      filename: 'employee_slip.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate PDF
    html2pdf(element, opt);
  };

  return (
    <>
          {/* <button style={styles.slipBtn} onClick={generatePDF}>
        Generate PDF
      </button> */}
      <Button  onClick={generatePDF}
          style={{
           borderRadius:10,
               background: COLORS.primarygradient,
               color:"white",
               marginBottom:20
                     }}
                     icon={<DownloadOutlined/>}
       >
         Save & Generate PDF
       </Button>
      <div id="employeeSlips" >

{
    selected.pays.map((element,index)=>{
     return (
        <div id="employeeSlip" style={styles.slipContainer}>
        <div style={styles.header}>
          <div style={styles.date}>Date: January 1, 2023</div>
          <div style={styles.stamp}>Official Stamp</div>
        </div>
        <div style={styles.slipTitle}>Salary Slip</div>
        <div style={styles.slipContent}>
          <label>Name:</label>
          <span style={styles.employeeInfo}>{element.name}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Pay:</label>
          <span style={styles.employeeInfo}>{element.pay}</span>
        </div>
        <div style={styles.signatureContainer}>
          <div style={styles.signature}>Signature:</div>
          <div style={styles.signature}>Date:</div>
        </div>
      </div>
     )
    })
}

    
      </div>
    
      {/* Success Modal */}
      <Modal
        title="Success"
        visible={successModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
      >
        Pay added successfully!
      </Modal>

      {/* Error Modal */}
      <Modal
        title="Error"
        visible={errorModalVisible}
        onOk={handleErrorModalOk}
        onCancel={handleErrorModalOk}
      >
        Error adding pay. Please try again.
      </Modal>
    </>
  );
};

const styles = {
  slipContainer: {
    width: '90%',
    border: '1px dashed #000',
    borderRadius:20,
    padding: '20px',
    marginBottom: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  date: {
    fontSize: '12px',
  },
  stamp: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  slipTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  slipContent: {
    marginBottom: '8px',
  },
  employeeInfo: {
    marginLeft: '5px',
  },
  signatureContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  signature: {
    width: '40%',
    borderBottom: '1px solid #000',
  },
  slipBtn: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginTop: '20px',
  },
};

export default EmployeeSlip;
