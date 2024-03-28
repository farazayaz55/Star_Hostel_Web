import { CloseCircleFilled, DeleteFilled, DollarCircleFilled, EditFilled, InfoCircleFilled, MinusCircleFilled, MoneyCollectFilled, PaperClipOutlined, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table ,Modal} from 'antd';
import AddUserForm from './EditProducts';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import {  doc, deleteDoc } from 'firebase/firestore';
import Stats from "./Stats"
import DetailsStats from "./DetailsStats"

const ProductTable = ({ products, setProducts ,userdata,allmonthsavailable,setMonthsAvailable,month,allaccounts,setAllaccounts}) => {
  const [visible, setVisible] = useState(false);
  const [visibleeditrecord, setVisibleEditRecord] = useState(false);
  const [index, setIndex] = useState(null);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleaddrecord, setVisibleAddRecord] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedrecord,setSelectedRecord]=useState(null)
  const [selectedrecord1,setSelectedRecord1]=useState(null)
  const [sellectedindex,setSellectedIndex] =useState(null)
  const [searchedColumn, setSearchedColumn] = useState('');
  const [type,setType]=useState(null)
  const searchInput = useRef(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false); // New state for delete confirmation
  const [deleteConfirmationVisible1, setDeleteConfirmationVisible1] = useState(false); 
  const showDeleteConfirmationModal = (record,index) => {
    setSelectedProduct(record);
    setSellectedIndex(index)
    setDeleteConfirmationVisible(true);
  };

  const showDeleteConfirmationModal1 = (index,record) => {
    setSelectedRecord1(record);
    setDeleteConfirmationVisible1(true);
  };

  const handleDeleteConfirmationOk = async () => {
   try{
  
      // Delete the product document
      const productRef = doc(db, 'Accounts', String(products[sellectedindex].code));
      // await deleteDoc(productRef);
  
      // Update the local state to remove the deleted product
      let temp = [...products];
      let temptimeline=[...temp];
      temptimeline.splice(sellectedindex,1);
      temp=temptimeline;
      await deleteDoc(productRef)
      setProducts(temp);
  
      // Close the confirmation modal
      setDeleteConfirmationVisible(false);
    } catch (e) {
      alert(e.code);
    }
  };
  
  const handleDeleteConfirmationOk1 = async () => {
    try{
       // Delete the product document
       let tempallmonthsavailable=[...allmonthsavailable];
       const todeleteindex=tempallmonthsavailable.findIndex((obj)=>obj.code===products.code);

       const productRef = doc(db, 'Khatta', String(products.code));
       await deleteDoc(productRef);
       tempallmonthsavailable.splice(todeleteindex,1);
       setMonthsAvailable(tempallmonthsavailable)

       setProducts(null);
   
       // Close the confirmation modal
       setDeleteConfirmationVisible1(false);
     } catch (e) {
       alert(e.code);
     }
   };
   
  const handleDeleteConfirmationCancel1 = () => {
    // Close the confirmation modal
    setDeleteConfirmationVisible1(false);
  };
  const handleDeleteConfirmationCancel = () => {
    // Close the confirmation modal
    setDeleteConfirmationVisible(false);
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
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      ...getColumnSearchProps('bankName'),
    },
    {
      title: 'IBAN',
      dataIndex: 'IBAN',
      key: 'IBAN',
      ...getColumnSearchProps('IBAN'),
    },
    {
      title: 'Account Owner',
      dataIndex: 'accountOwner',
      key: 'accountOwner',
      ...getColumnSearchProps('accountOwner'),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalamount',
      key: 'totalamount',
      ...getColumnSearchProps('totalamount'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record,index) => (
        <Space size="middle">
            {/* <Button
          icon={<PlusCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.detailgradient,
color: "white"
          }} onClick={() => handleAddRecord(record)}>
            Add Record
          </Button> */}
     {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts"||obj==="accounts-edit")!==-1))&&       <>
      {  <Button
          icon={<EditFilled/>}
          style={{

borderRadius: 10,
background: COLORS.editgradient,
color: "white"
          }} onClick={() => handleEdit(record,index)}>
            Edit
          </Button>}
          
          </>}
          {/* {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-edit")!==-1))&&       <>
      {!(record.status) &&<Button
          icon={<DollarCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.primarygradient,
color: "white"
          }} onClick={() => handleAddRecord(record,index)}>
            Payment
          </Button>}
          
          </>} */}
           {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts"||obj==="accounts-detail")!==-1))&&    <>{    <Button
          icon={<InfoCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.primarygradient,
color: "white"
          }} onClick={() => handleDetail(record)}>Detail</Button> }
          </>}

   {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts"||obj==="accounts-delete")!==-1))&&    <>{    <Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirmationModal(record,index)}
          >
            Delete
          </Button>}
          </>}
        </Space>
      ),
    },
  ];
 const  handleAddRecord = (product,index) => {
  setSelectedProduct(product);
  setSellectedIndex(index)
  setType(type)
  setVisibleAddRecord(true);
 
};
  const handleEdit = (product,index) => {
    setSelectedProduct(product);
    setSellectedIndex(index)
    setVisible(true);
  };

  const handleDetail = (record) => {
    setSelectedProduct(record);
    setVisibleDetail(true);
  };

  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedProduct(null);
  };
  const handleEditRecord=(index,product)=>{
setIndex(index)
  setSelectedRecord(product);
  setVisibleEditRecord(true);
  }

  return (
    <>
    {products&&
    <>
     {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="accounts"||obj==="accounts-overallstats")!==-1))&&     <Stats data={products}/>}
      <Table columns={columns} dataSource={products} rowKey="id" responsive={true} scroll={{ x: true }}
       />
      <Modal title="Account Details" visible={visibledetail} onCancel={handleClose} footer={null} width={1000}>
        {selectedProduct && (
          <div>
            <DetailsStats data={selectedProduct}/>
            <h3>Title: {selectedProduct.bankName}</h3>
            <Table
          dataSource={selectedProduct.timeLine}
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
              key: 'date',
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
              key: 'amount',
            },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
            },
          ]}
          rowKey={(record, index) => index}
      scroll={{ x: true }} // Enable horizontal scrolling
      responsive={true} // Enable responsive behavior
        />
          </div>
        )}
      </Modal>
    
      <Modal
        title="Edit Record"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {/* Assuming the EditProducts component is properly implemented */}
        <AddUserForm
          initialValues={selectedProduct}
          onCancel={() => setVisible(false)}
          setProducts={setProducts}
          products={products}
          index={sellectedindex}
        />
      
      </Modal>
   
      <Modal
        title="Confirm Deletion"
        visible={deleteConfirmationVisible}
        onOk={handleDeleteConfirmationOk}
        onCancel={handleDeleteConfirmationCancel}
        footer={[
          <Button
          icon={<CloseCircleFilled/>}
            key="cancel"
            onClick={handleDeleteConfirmationCancel}
            style={{
              borderRadius: 10,
              background: COLORS.editgradient,
              color: 'white',
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="danger"
            onClick={handleDeleteConfirmationOk}
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this bank?</p>
      </Modal>
    </>
  }
  </>
  );
};

export default ProductTable;
