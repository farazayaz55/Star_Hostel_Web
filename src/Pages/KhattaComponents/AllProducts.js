import { CloseCircleFilled, DeleteFilled, EditFilled, InfoCircleFilled, MinusCircleFilled, PaperClipOutlined, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table ,Modal} from 'antd';
import AddUserForm from './EditProducts';
import COLORS from '../../colors';
import AddRecord from './Addrecord'
// import Editrecord from "./EditRecord"
import { db } from '../../firebase-config';
import { setDoc, doc, deleteDoc, runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';
import Stats from "./Stats"

const ProductTable = ({ products, setProducts ,userdata,allmonthsavailable,setMonthsAvailable}) => {
  const [visible, setVisible] = useState(false);
  const [visibleeditrecord, setVisibleEditRecord] = useState(false);
  const [index, setIndex] = useState(null);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [visiblepdfdetail, setVisiblePdfDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleaddrecord, setVisibleAddRecord] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedrecord,setSelectedRecord]=useState(null)
  const [selectedrecord1,setSelectedRecord1]=useState(null)
  const [sellectedindex,setSellectedIndex] =useState(null)
  const [sellectedindex1,setSellectedIndex1] =useState(null)
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
  await runTransaction(db,async(transaction)=>{

 
      // Delete the product document
      const productRef = doc(db, 'Khatta', String(products.code));
      // await deleteDoc(productRef);
      const response=await transaction.get(productRef);
      if(!(response.exists())){
        alert("This month record does not exist anymore")
         // Close the confirmation modal
      setDeleteConfirmationVisible(false); 
        return;
      }
      // Update the local state to remove the deleted product
      let temp = {...response.data()};
      let temptimeline=[...temp.timeLine];
      const indextodel=temptimeline.findIndex((obj)=>obj.code===selectedProduct.code);
      if(indextodel===-1){
        console.log(indextodel,selectedProduct)
        alert("This record does not exist anymore")
        // Close the confirmation modal
     setDeleteConfirmationVisible(false); 
       return;
      }
      temptimeline.splice(indextodel,1);
      temp.timeLine=temptimeline;
      transaction.set(productRef,{...temp})
      setProducts(temp);
  
      // Close the confirmation modal
      setDeleteConfirmationVisible(false); })
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      ...getColumnSearchProps('date'),
    },
    // {
    //   title: 'Purpose',
    //   dataIndex: 'recordType',
    //   key: 'recordType',
    //   ...getColumnSearchProps('recordType'),
    // },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ color: type === 'Outgoing' ? 'red' : 'green' }}>
          {type === 'Outgoing' ? (
            <MinusCircleFilled style={{ color: 'red' }} />
          ) : (
            <PlusCircleFilled style={{ color: 'green' }} />
          )}{' '}
          {type.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Payment Type',
      dataIndex: 'PaymentTypeof',
      key: 'PaymentTypeof',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
     {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-edit")!==-1))&&       <>
     <Button
          icon={<EditFilled/>}
          style={{

borderRadius: 10,
background: COLORS.editgradient,
color: "white"
          }} onClick={() => handleEdit(record,index)}>
            Edit
          </Button>
          </>}
          {/* <Button
          icon={<InfoCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.primarygradient,
color: "white"
          }} onClick={() => handleDetail(record)}>Detail</Button> */}
   {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-delete")!==-1))&&    <>{ (record.recordType!=="Installment" && record.recordType!== "Settlement Income" &&record.recordType!== "Settlement Outgoing" &&record.recordType!=="Cash Order Payment"&&record.recordType!=="Advance Payment"&&record.recordType!=="Starting Balance") &&     <Button
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
  const fees = [
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
      title: 'Roomcode',
      dataIndex: 'roomcode',
      key: 'roomcode',
      ...getColumnSearchProps('roomcode'),
    },
    {
      title: 'Fee Amount',
      dataIndex: 'amount',
      key: 'amount',
      ...getColumnSearchProps('amount'),
    },
   
  ];
  const pays = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Pay',
      dataIndex: 'pay',
      key: 'pay',
      ...getColumnSearchProps('pay'),
    },
   
  ];
 const  handleAddRecord = (product,type) => {
  setSelectedProduct(product);
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
   {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-addincome")!==-1))&&
        <Button
          icon={<PlusCircleFilled />}
          style={{
            background: COLORS.primarygradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={
            
            () => handleAddRecord(products,"Income")}
        >
          Add Income
        </Button>}
      {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-addoutgoing")!==-1))&&  <Button
          icon={<PlusCircleFilled />}
          style={{
            marginLeft:10,
            background: COLORS.deletegradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={() => handleAddRecord(products,"Outgoing")}
        >
          Add Outgoing
        </Button>}
    {/* {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-getreport")!==-1))&&     <Button
          icon={<PaperClipOutlined />}
          style={{
            marginLeft:10,
            background: COLORS.detailgradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={() => setVisiblePdfDetail(true)}
        >
          Get Report
        </Button>} */}
      {/* {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-delete")!==-1))&&   <Button
          icon={<DeleteFilled />}
          style={{
            marginLeft:10,
            background: COLORS.deletegradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={() => showDeleteConfirmationModal1(products)}
        >
          Delete
        </Button>} */}
       
     {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="dailydiary"||obj==="dailydiary-stats")!==-1))&&     <Stats data={products}/>}
      
      <h3>Monthly Record</h3>
      <Table columns={columns} dataSource={products.timeLine} rowKey="id" responsive={true} scroll={{ x: true }}
       />
       <h3>Fees</h3>
        <Table columns={fees} dataSource={products.customers} rowKey="id" responsive={true} scroll={{ x: true }}
       />
       <h3>Pays</h3>
        <Table columns={pays} dataSource={products.pays} rowKey="id" responsive={true} scroll={{ x: true }}
       />
     
      <Modal title="Expense Details" visible={visibledetail} onCancel={handleClose} footer={null} width={1000}>
        {selectedProduct && (
          <div>
            <Stats data={selectedProduct}/>
            <h3>Title: {selectedProduct.title}</h3>
            <Table
          dataSource={selectedProduct.timeLine}
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
              key: 'date',
            },
            {
              title: 'Type',
              dataIndex: 'recordType',
              key: 'recordType',
              render: (recordType) => (
                <span style={{ color: recordType === 'toGive' ? 'red' : 'green' }}>
                  {recordType === 'toGive' ? (
                    <MinusCircleFilled style={{ color: 'red' }} />
                  ) : (
                    <PlusCircleFilled style={{ color: 'green' }} />
                  )}{' '}
                  {recordType.toUpperCase()}
                </span>
              ),
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
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record,index) => (
                <Space size="middle">
                   
                  <Button
                  icon={<EditFilled/>}
                  style={{
        
        borderRadius: 10,
        background: COLORS.editgradient,
        color: "white"
                  }} onClick={() => handleEditRecord(index,record)}>
                    Edit
                  </Button>
                   <Button
                    icon={<DeleteFilled />}
                    style={{
                      borderRadius: 10,
                      background: COLORS.deletegradient,
                      color: 'white',
                    }}
                    onClick={() => showDeleteConfirmationModal1(index,record)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
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
        title="Add Record"
        visible={visibleaddrecord}
        onCancel={() => setVisibleAddRecord(false)}
        footer={null}
      >
        <AddRecord
          initialValues={selectedProduct}
          onCancel={() => setVisibleAddRecord(false)}
          setEmployees={setProducts}
          allmonthsavailable={allmonthsavailable}
          setMonthsAvailable={setMonthsAvailable}
          employees={products}
          type={type}
        />
      </Modal>
      <Modal
        title="Edit Product"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
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
        <p>Are you sure you want to delete this record?</p>
      </Modal>
  
      <Modal
        title="Confirm Deletion"
        visible={deleteConfirmationVisible1}
        onOk={handleDeleteConfirmationOk1}
        onCancel={handleDeleteConfirmationCancel1}
        footer={[
          <Button
          icon={<CloseCircleFilled/>}
            key="cancel"
            onClick={handleDeleteConfirmationCancel1}
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
            onClick={handleDeleteConfirmationOk1}
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
        <p>Are you sure you want to delete this months record?</p>
      </Modal>
  

    </>
  }
  </>
  );
};

export default ProductTable;
