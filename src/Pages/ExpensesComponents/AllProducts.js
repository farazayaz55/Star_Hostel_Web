import { CloseCircleFilled, DeleteFilled, EditFilled, InfoCircleFilled, MinusCircleFilled, PaperClipOutlined, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table ,Modal} from 'antd';
import AddUserForm from './EditProducts';
import COLORS from '../../colors';
import AddRecord from './Addrecord'
import Editrecord from "./EditRecord"
import { db } from '../../firebase-config';
// import Details from "./Details"
// import ParticularDetails from "./ParticularDetails"
import { setDoc, doc, deleteDoc,runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';
import Stats from "./Stats"


const ProductTable = ({ products, setProducts,productsstats,setProductsstats,userdata }) => {
  const [visible, setVisible] = useState(false);
  const [visibleeditrecord, setVisibleEditRecord] = useState(false);
  const [index, setIndex] = useState(null);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleaddrecord, setVisibleAddRecord] = useState(false);
  const [visibleparticularpdfrecord, setVisibleParticularPdfRecord] = useState(false);
  const [selectedrecord1,setSelectedRecord1]=useState(null)
  const [sellectedindex1,setSellectedIndex1] =useState(null)
  const [deleteConfirmationVisible1, setDeleteConfirmationVisible1] = useState(false); 
  const [visiblepdfrecord, setVisiblePdfRecord] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedrecord,setSelectedRecord]=useState(null)
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false); // New state for delete confirmation

  const showDeleteConfirmationModal = (record) => {
    setSelectedProduct(record);
    setDeleteConfirmationVisible(true);
  };
  const showDeleteConfirmationModal1 = (index,record) => {
    setSelectedRecord1(record);
    setSellectedIndex1(index)
    setDeleteConfirmationVisible1(true);
  };

  const handleDeleteConfirmationOk1 = async () => {
    try {
      
      await runTransaction(db, async (transaction) => {
      // Delete the product document
      const productRef = doc(db, 'Expenses', String(selectedProduct.code));

      const tempexp=await transaction.get(productRef);
      // await deleteDoc(productRef);
        if(!(tempexp.exists())){
          alert("This account record does not exist now or removed by anyone.")
      setDeleteConfirmationVisible1(false);
      return;
        }
      // Update the local state to remove the deleted product
      let tempproduct = { ...tempexp.data() };
      let tempTimeline=[...tempproduct.timeLine]
      let indextodeletefromtimeline=tempTimeline.findIndex((obj)=>obj.code===selectedrecord1.code)
      if(indextodeletefromtimeline===-1){
        alert("This record does not exist now or removed by anyone.")
        setDeleteConfirmationVisible1(false);
        return;

      }
      tempTimeline.splice(indextodeletefromtimeline, 1);
      tempproduct.timeLine=tempTimeline;
  
      let toTake = 0;
      let toGive = 0;
  
      for (let i = 0; i < tempproduct.timeLine.length; i++) {
        if (tempproduct.timeLine[i].recordType === "toGive") {
          toGive += tempproduct.timeLine[i].amount;
        } else if (tempproduct.timeLine[i].recordType === "toTake") {
          toTake += tempproduct.timeLine[i].amount;
        }
      }

  
      tempproduct.toGive = toGive;
      tempproduct.toTake = toTake;
  
      let temp = [...products];
      const index = temp.findIndex((obj) => obj.code === selectedProduct.code);
      temp[index] = tempproduct;
      let statobj={toGive:0,toTake:0}
      for(let i=0;i<temp.length;i++){
        statobj.toGive+=temp[i].toGive;
        statobj.toTake+=temp[i].toTake;
      }
      transaction.set(productRef,{...tempproduct})
      setProductsstats(statobj)
      setSelectedProduct(tempproduct)
      setProducts(temp);
  
      // Close the confirmation modal
      setDeleteConfirmationVisible1(false);
    })
    } catch (e) {
      alert(e.code);
    }
  };
  
  const handleDeleteConfirmationCancel1 = () => {
    // Close the confirmation modal
    setDeleteConfirmationVisible1(false);
  };
  const handleDeleteConfirmationOk = async () => {
    try {
     
      // Delete the product document
      const productRef = doc(db, 'Expenses', String(selectedProduct.code));
      await deleteDoc(productRef);
  
      // Update the local state to remove the deleted product
      let temp = [...products];
      const index = temp.findIndex((obj) => obj.code === selectedProduct.code);
      temp.splice(index, 1);
      let statobj={toGive:0,toTake:0}
      for(let i=0;i<temp.length;i++){
        statobj.toGive+=temp[i].toGive;
        statobj.toTake+=temp[i].toTake;
      }

      setProductsstats(statobj)
      setProducts(temp);
  
      // Close the confirmation modal
      setDeleteConfirmationVisible(false);
    } catch (e) {
      alert(e.code);
    }
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Udhaar',
      dataIndex: 'toGive',
      key: 'toGive',
      sorter: (a, b) => a.toGive - b.toGive,
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    //   key: 'type',
    //   render: (type) => (
    //     <span style={{ color: type === 'given' ? 'red' : 'green' }}>
    //       {type === 'given' ? (
    //         <MinusCircleFilled style={{ color: 'red' }} />
    //       ) : (
    //         <PlusCircleFilled style={{ color: 'green' }} />
    //       )}{' '}
    //       {type.toUpperCase()}
    //     </span>
    //   ),
    // },
    {
      title: 'Payment',
      dataIndex: 'toTake',
      key: 'toTake',
      sorter: (a, b) => a.toTake - b.toTake,
      
      // ...getColumnSearchProps('category'),
    },
  
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
         {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-addrecord")!==-1))&&       <Button
          icon={<PlusCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.detailgradient,
color: "white"
          }} onClick={() => handleAddRecord(record)}>
            Add Record
          </Button>}
      {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-edit")!==-1))&&        <Button
          icon={<EditFilled/>}
          style={{

borderRadius: 10,
background: COLORS.editgradient,
color: "white"
          }} onClick={() => handleEdit(record)}>
            Edit
          </Button>}
    {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-detail")!==-1))&&         <Button
          icon={<InfoCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.primarygradient,
color: "white"
          }} onClick={() => handleDetail(record)}>Detail</Button>}
        {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-delete")!==-1))&&      <Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirmationModal(record)}
          >
            Delete
          </Button>}
       {/* {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-getparticularreport")!==-1))&&      <Button
            icon={<PaperClipOutlined />}
            style={{
              borderRadius: 10,
              background: COLORS.detailgradient,
              color: 'white',
            }}
            onClick={() => {
              setSelectedRecord(record)
              setVisibleParticularPdfRecord(true)}}
          >
            Get Report
          </Button>} */}
        </Space>
      ),
    },
  ];
 const  handleAddRecord = (product) => {
  setSelectedProduct(product);
  setVisibleAddRecord(true);
};
  const handleEdit = (product) => {
    setSelectedProduct(product);
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
             {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-overallstats")!==-1))&& <Stats data={productsstats}/>}
       {/* { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-getoverallreport")!==-1))&&       <Button
          icon={<PaperClipOutlined />}
          style={{
            marginLeft:10,
            marginBottom:10,
            background: COLORS.detailgradient,
            color: 'white',
            borderRadius: 10,
          }}
          onClick={() => setVisiblePdfRecord(true)}
        >
          Get Overall Report
        </Button>} */}
      <Table columns={columns} dataSource={products} rowKey="id" 
      
      scroll={{ x: true }} // Enable horizontal scrolling
      responsive={true} // Enable responsive behavior
      />
      <Modal title="Expense Details" visible={visibledetail} onCancel={handleClose} footer={null} width={1000}>
        {selectedProduct && (
          <div>
       { ((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-recordstats")!==-1))&&         <Stats data={selectedProduct}/>}
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
                  {recordType==="toGive"?"Udhaar":"Payment"}
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
                   
           {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-editrecord")!==-1))&&          <Button
                  icon={<EditFilled/>}
                  style={{
        
        borderRadius: 10,
        background: COLORS.editgradient,
        color: "white"
                  }} onClick={() => handleEditRecord(index,record)}>
                    Edit
                  </Button>}
                {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="digikhatta"||obj==="digikhatta-deleterecord")!==-1))&&     <Button
                    icon={<DeleteFilled />}
                    style={{
                      borderRadius: 10,
                      background: COLORS.deletegradient,
                      color: 'white',
                    }}
                    onClick={() => showDeleteConfirmationModal1(index,record)}
                  >
                    Delete
                  </Button>}
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
        {/* Assuming the EditProducts component is properly implemented */}
        <AddRecord
          initialValues={selectedProduct}
          onCancel={() => setVisibleAddRecord(false)}
          setProductsstats={setProductsstats}
          setEmployees={setProducts}
          employees={products}
        />
      </Modal>
      
     {/* {selectedrecord&& <Modal
        title=" Particular Pdf Report"
        visible={visibleparticularpdfrecord}
        onCancel={() => setVisibleParticularPdfRecord(false)}
        footer={null}
        width={800}
      > */}
        {/* Assuming the EditProducts component is properly implemented */}
        {/* <ParticularDetails
          onCancel={() => setVisibleParticularPdfRecord(false)}
          data={selectedrecord}
        />
      </Modal>} */}
      {/* <Modal
        title="Pdf Report"
        visible={visiblepdfrecord}
        onCancel={() => setVisiblePdfRecord(false)}
        footer={null}
        width={800}
      > */}
        {/* Assuming the EditProducts component is properly implemented */}
        {/* <Details
          onCancel={() => setVisiblePdfRecord(false)}
          data={products}
          productsstats={productsstats}
        />
      </Modal> */}
      <Modal
        title="Edit Name"
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
        />
      </Modal>
      <Modal
        title="Edit Record"
        visible={visibleeditrecord}
        onCancel={() => setVisibleEditRecord(false)}
        footer={null}
      >
        <Editrecord
          initialValues={selectedrecord}
          selectedProduct={selectedProduct}
          onCancel={() => setVisibleEditRecord(false)}
          setSelectedProduct={setSelectedProduct}
          setProducts={setProducts}
          setProductsstats={setProductsstats}
          index={index}
          products={products}
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
        <p>Are you sure you want to delete this account?</p>
      </Modal>
      {  <Modal
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
        <p>Are you sure you want to delete this record?</p>
      </Modal>}
    </>
  );
};

export default ProductTable;
