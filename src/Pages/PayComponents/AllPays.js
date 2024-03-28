import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, Card } from 'antd';
import AddUserForm from './AddnewPay';
import { EditOutlined, DeleteOutlined, DeleteFilled, EditFilled, InfoCircleFilled } from '@ant-design/icons';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { db } from '../../firebase-config';
import { setDoc, doc,deleteDoc,runTransaction } from 'firebase/firestore';
import COLORS from '../../colors';
import Statisticscard from './PayStats';
import PaySlips from './PaySlips';

const EmployeeTable = ({ pays, setPays ,userdata}) => {
  const [visible, setVisible] = useState(false);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);


  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setVisible(true);
  };

  const handleDetail = (record) => {
    setSelectedEmployee(record);
    setVisibleDetail(true);
  };

  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedEmployee(null);
  };

  const handleDeleteConfirmation = (employee) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this pay record?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDeletePay(employee);
      },
    });
  };

  const handleDeletePay =async (employee) => {
    try{
      
      await runTransaction(db, async (transaction) => {
        const payref=doc(db,"Khatta",employee.code);
        const response=await transaction.get(payref);
        if(!(response.exists())){
          alert("This month record does not exist anymore")
          return;
        }
let temp=[pays];
const index=temp.findIndex((obj)=>obj.code===response.data().code);
transaction.set(payref,{...response.data(),pays:[]});
temp[index]={...response.data(),pays:[]}
setPays(temp);
      })
    }catch(e){
alert(e.message)
    }
  };
  const showlist=(str)=>{
    var afterdash= str.split('-')[1];
    var result =Number( str.split('-')[0]);
  result++;
  return String(result)+"-"+String(afterdash);
   }
  return (
    <>
      {/* Table */}
      {pays.map((event, index) => (
        <Card
          title={"Pay: "+showlist(event.code)}
          extra={
            <>
       { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="pay"||obj==="pay-detail")!==-1))&&     <Button
                onClick={() => handleDetail(event)}
                style={{
                  borderRadius: 10,
                  background: COLORS.primarygradient,
                  color: 'white',
                }}
                icon={<InfoCircleFilled />}
              >
                Details
              </Button>}
              { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="pay"||obj==="pay-manage")!==-1))&&   <Button
                style={{
                  borderRadius: 10,
                  background: COLORS.editgradient,
                  color: 'white',
                }}
                onClick={() => handleEdit(event)}
                icon={<EditFilled />}
              >
                Pays
              </Button>}
          {/* { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="pay"||obj==="pay-delete")!==-1))&&     <Button
                style={{
                  borderRadius: 10,
                  background: COLORS.deletegradient,
                  color: 'white',
                }}
                icon={<DeleteFilled />}
                onClick={() => handleDeleteConfirmation(event)}
              >
                Delete
              </Button>} */}
            </>
          }
          style={{
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: 10,
          }}
        >
          <Statisticscard data={event} />
        </Card>
      ))}

      {/* Pay Details Modal */}
      <Modal
        title="Pay Details"
        visible={visibledetail}
        onCancel={handleClose}
        footer={null}
      >
        {selectedEmployee && (
          <PaySlips
            selected={selectedEmployee}
            setSelected={setSelectedEmployee}
            setPays={setPays}
            pays={pays}
            type="pdfonly"
          />
        )}
      </Modal>

      {/* Edit Pay Details Modal */}
      <Modal
        title="Edit Pay Details"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        {/* <AddUserForm
          initialValues={selectedEmployee}
          setSelected1={setSelectedEmployee}
          onCancel={() => setVisible(false)}
          setPays={setPays}
          pays={pays}
        /> */}
                 <AddUserForm setPays={setPays} pays={pays} onCancel={() => setVisible(false)} setSelected1={setSelectedEmployee} initialValues={selectedEmployee} />
      </Modal>
    </>
  );
};

export default EmployeeTable;
