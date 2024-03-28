import React, { useEffect, useState,useRef } from 'react';
import { Table, Space, Button, Modal, Card,Form,Select , Timeline, Input,Upload,message,Popconfirm,DatePicker,Row,Col, Spin } from 'antd';
import { EditOutlined, PlusOutlined,InfoCircleOutlined,CloseCircleOutlined ,DeleteOutlined,ExclamationCircleOutlined, SaveFilled, PaperClipOutlined, SearchOutlined, DeleteRowOutlined, DeleteFilled} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import jsPDF from 'jspdf';
import { setDoc, doc,deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import COLORS from '../../colors';
import Highlighter from 'react-highlight-words';
const { Option } = Select;
const OrderTable = ({ employee,setEmployees,statsinfo,setStatsinfo,userdata }) => {

const { confirm } = Modal;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form3] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedProduct(null);
  };


  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters,confirm) => {
    clearFilters();
    setSearchText('');
    confirm()
  
    // Reset the table to its original state
    // setFilteredInfo({});
    // setSortedInfo({});
  };
  

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: "white"
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters,confirm)}
            size="small"
            style={{
              width: 90,
              borderRadius: 10,
              background: COLORS.editgradient,
              color: "white"
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'customer',
      key: 'customer',
      ...getColumnSearchProps('customer'),
    },
    {
      title: 'Contact',
      dataIndex: 'customerContact',
      key: 'customerContact',
      ...getColumnSearchProps('customerContact'),
    },
    {
      title: 'Room Code',
      dataIndex: 'roomcode',
      key: 'roomcode',
      ...getColumnSearchProps('roomcode'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
       {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="archivedcustomers-detail"||obj==="archivedcustomers")!==-1))&&    <Button style={{
borderRadius:10,
    background: COLORS.primarygradient,
    color:"white"
          }} onClick={() => handleDetail(record)}
          icon={<InfoCircleOutlined/>}
          >
            Details
          </Button>}
          
        </Space>
      ),
    },

  ];   

    const handleDeleteSelectedRows =async () => {
      setLoading(true)
      if(selectedRowKeys.length<100){
        try{ // Implement your logic to delete selected rows
          const temptodelete=employee.filter((item) => selectedRowKeys.includes(item.code));
          const updatedEmployee = employee.filter((item) => !selectedRowKeys.includes(item.code));
          const batch=writeBatch(db);
          for(let i=0;i<temptodelete.length;i++){
            batch.set(doc(db,"Archive","Info"),{allobjects:[...updatedEmployee]});
          }
          // await Particularpdf(temptodelete)
          await batch.commit()
          setEmployees(updatedEmployee);
          setSelectedRowKeys([]);
        }catch(e){
          alert(e.message)
        }
      }else{
        alert("At max you can delete 100 records")
      }
  
      setLoading(false)
    };
    const handleDetail = (record) => {
      setSelectedProduct(record);
      setVisibleDetail(true);
    };
  return (
    <>

   <>
            {(userdata.role==="admin"||(userdata.accesses.findIndex((obj)=>obj==="archivedcustomers-delete"||obj==="archivedcustomers")!==-1))&&      <Button
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
              marginLeft:20,
              marginTop: 10,
              marginBottom:10
            }}
            icon={<DeleteFilled />}
            onClick={handleDeleteSelectedRows}
            disabled={selectedRowKeys.length === 0}
          >
            Delete Selected Rows
          </Button>}
</>
  
  <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Loading...">
        <div className="content" />
          </Spin>
      </div>):<Table
        dataSource={employee}
        columns={columns}
        rowKey="code"
        rowSelection={rowSelection} // Add rowSelection to enable row selection
        scroll={{ x: true }}
        responsive={true}
      />}
      </div>
      {/* Progress Modal */}
      <Modal title="Customer Details" visible={visibledetail} onCancel={handleClose} footer={null}>
        {selectedProduct && (
         <div>
         <p>Name: {selectedProduct.customer}</p>
         <p>CNIC: {selectedProduct.customerCNIC}</p>
    <p>Contact: {selectedProduct.customerContact}</p>
    <p>Room Code: {selectedProduct.roomcode}</p>
    <p>Dealdate: {selectedProduct.dealdate}</p>
    <p>Security Fee: {selectedProduct.security}</p>
    <p>Fee amount: {selectedProduct.feeamount}</p>
    <p>Fee Date: {selectedProduct.feeDate}</p>
    <p>Address: {selectedProduct.customerAddress}</p>
    
    <p>Additional details: {selectedProduct.additionalDetails}</p>
    
    {selectedProduct.guaranters.map((obj,index)=>{
      return(
        <>
        <h4>Guaranter : {index+1}</h4>
        <p>Name :{obj.guaranterName}</p>
        <p>CNIC :{obj.guaranterCnic}</p>
        <p>Contact :{obj.guaranterContact}</p>
        <p>Address :{obj.guaranterAddress}</p>
        </>
      )
    })}
  
  </div>
        )}
      </Modal>

   
    </>
  );
};

export default OrderTable;
