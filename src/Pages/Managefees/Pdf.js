
import React,{useState} from 'react';
import html2pdf from 'html2pdf.js';
import COLORS from '../../colors';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import { setDoc, doc,runTransaction } from 'firebase/firestore';
import {Button,Modal} from 'antd'
import { DownloadOutlined } from '@ant-design/icons';
const EmployeeSlip = ({selected,month,allaccounts}) => {
    const showlist=(str)=>{
        var afterdash= str.split('-')[1];
        var result =Number( str.split('-')[0]);
      result++;
      return String(result)+"-"+String(afterdash);
       }
   
  let bank={...allaccounts.find((obj)=>obj.code===selected.accountInfo)}
  const generatePDF = async() => {
   
    const element = document.getElementById('employeeSlips');

    // Configuration for html2pdf
    const opt = {
      margin: 10,
      filename: 'employee_slip.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf(element, opt);
  };

  return (
    <>
      <Button  onClick={generatePDF}
          style={{
           borderRadius:10,
               background: COLORS.primarygradient,
               color:"white",
               marginBottom:20
                     }}
                     icon={<DownloadOutlined/>}
       >
        Generate PDF
       </Button>
      <div id="employeeSlips" >

{
    selected &&
        <div id="employeeSlip" style={styles.slipContainer}>
        <div style={styles.header}>
          <div style={styles.date}>{showlist(month)}</div>
          <div style={styles.stamp}>Official Stamp</div>
        </div>
        <div style={styles.slipTitle}>Fees Slip</div>
        <div style={styles.slipContent}>
          <label>Name:</label>
          <span style={styles.employeeInfo}>{selected.customer}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Room:</label>
          <span style={styles.employeeInfo}>{selected.roomcode}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Fee Amount:</label>
          <span style={styles.employeeInfo}>{selected.feeamount}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Paid Amount:</label>
          <span style={styles.employeeInfo}>{selected.amount}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Pending:</label>
          <span style={styles.employeeInfo}>{selected.pending}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Payment Type:</label>
          <span style={styles.employeeInfo}>{selected.paymentType}</span>
        </div>
        <div style={styles.slipContent}>
          <label>Bank:</label>
          <span style={styles.employeeInfo}>{bank.bankName+"---"+bank.IBAN}</span>
        </div>
        <div style={styles.signatureContainer}>
          <div style={styles.signature}>Signature:</div>
          <div style={styles.signature}>Date:{selected.date}</div>
        </div>
      </div>
}

    
      </div>
    
  
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
