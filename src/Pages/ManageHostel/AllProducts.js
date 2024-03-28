import { CloseCircleFilled, DeleteFilled, EditFilled, InfoCircleFilled, MinusCircleFilled, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table ,Modal,Spin} from 'antd';
import AddUserForm from './EditProducts';
import COLORS from '../../colors';
import Stats from "./Stats"
import { db } from '../../firebase-config';
import { setDoc, doc, deleteDoc ,runTransaction,collection,getDocs} from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';


const ProductTable = ({ products, setProducts,userdata,allcollections,setAllcollections }) => {
  const [visible, setVisible] = useState(false);
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading,setLoading]=useState(false)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false); // New state for delete confirmation

  const showDeleteConfirmationModal = (record) => {
    setSelectedProduct(record);
    setDeleteConfirmationVisible(true);
  };
//correct delte function
  const handleDeleteConfirmationOk = async () => {
    setLoading(true)
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'Rooms', String(selectedProduct.collectioncode));
        const response=await transaction.get(productRef);
         
      if(!(response.exists)){
        alert("Someone have removed the room");
        setDeleteConfirmationVisible(false);
        return
      }
      // Delete the product document
      let tempallcollectionsindex=allcollections.findIndex((obj)=>obj.code===selectedProduct.collectioncode);
        let tempcollectiontomodify={...response.data()};
       const temptodeleteindex= tempcollectiontomodify.allobjects.findIndex((obj)=>obj.code===selectedProduct.code)
       if(temptodeleteindex===-1){
        alert("This room does not exist anymore!");
        setDeleteConfirmationVisible(false);
        return;
      }
       tempcollectiontomodify.allobjects.splice(temptodeleteindex,1);
   
      const empref=collection(db,"Customer");
      const querySnapshot=await getDocs(empref)
      let tempemplyees=[]
      querySnapshot.forEach((element,index)=>{
        let toupdate=false;
        tempemplyees=element.data()
          element.data().allobjects.forEach((obj,index1)=>{
           
              if(obj.roomcode===selectedProduct.roomcode){
                tempemplyees.allobjects[index1].roomcode="";
                toupdate=true;
              }
          })
          if(toupdate){
            transaction.set(doc(db,"Customer",element.data().code),{...tempemplyees})
          }
      })
    
        let tempallcollections=[...allcollections];
        tempallcollections[tempallcollectionsindex]=tempcollectiontomodify;
        setAllcollections(tempallcollections)
      // Update the local state to remove the deleted product
      let temp = [...products];
      const index = temp.findIndex((obj) => obj.code === selectedProduct.code);
      
      temp.splice(index, 1);
      transaction.set(productRef,{...tempcollectiontomodify});
      setProducts(temp);
  
      // Close the confirmation modal
      setDeleteConfirmationVisible(false);})
    } catch (e) {
      alert(e.code);
    }
    setLoading(false)
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
    confirm();
  
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
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
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
      title: 'Room Code',
      dataIndex: 'roomcode',
      key: 'roomcode',
      ...getColumnSearchProps('roomcode'),
    },
    {
      title: 'Building No',
      dataIndex: 'buildingid',
      key: 'buildingid',
      sorter: (a, b) => a.buildingid-b.buildingid
    },
    {
      title: 'Floor No',
      dataIndex: 'floorid',
      key: 'floorid',
      sorter: (a, b) => a.floorid-b.floorid
    },
    {
      title: 'Room No',
      dataIndex: 'roomid',
      key: 'roomid',
      sorter: (a, b) => a.roomid-b.roomid
    },
    {
      title: 'Capacity Left',
      dataIndex: 'capacityleft',
      key: 'capacityleft',
      sorter: (a, b) => a.capacityleft-b.capacityleft
    },
    
    {
      title: 'Status',
      dataIndex: 'capacityleft',
      key: 'capacityleft',
      sorter: (a, b) => a.capacityleft-b.capacityleft,
      render: (type) => (
        <span style={{ color: type ===0 ? 'red' : 'green' }}>
          {type === 0 ? (
            <MinusCircleFilled style={{ color: 'red' }} />
          ) : (
            <PlusCircleFilled style={{ color: 'green' }} />
          )}{' '}
          {type===0?"BOOKED":"EMPTY"}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
         {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="hostel"||obj==="hostel-edi")!==-1)  )&&  <Button
          icon={<EditFilled/>}
          style={{

borderRadius: 10,
background: COLORS.editgradient,
color: "white"
          }} onClick={() => handleEdit(record)}>
            Edit
          </Button>}
        {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="hostel"||obj==="hostel-detail")!==-1)  )&&   <Button
          icon={<InfoCircleFilled/>}
          style={{

borderRadius: 10,
background: COLORS.primarygradient,
color: "white"
          }} onClick={() => handleDetail(record)}>Detail</Button>}
         {((userdata.role === "admin")||(userdata.accesses.findIndex((obj)=>obj==="hostel"||obj==="hostel-delete")!==-1)  )&&   <Button
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
        </Space>
      ),
    },
  ];

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

  return (
    <>
        <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Loading...">
        <div className="content" />
          </Spin>
      </div>):
      <>
        <Stats data={products}/>
      <Table columns={columns} dataSource={products} rowKey="id"
      
      scroll={{ x: true }} // Enable horizontal scrolling
      responsive={true} // Enable responsive behavior
      />
      </> 
    }
      </div>
      <Modal title="Room Details" visible={visibledetail} onCancel={handleClose} footer={null}>
        {selectedProduct && (
         <div>
         <p>Room Code: {selectedProduct.roomcode}</p>
         <p>Building No: {selectedProduct.buildingid}</p>
    <p>Floor No: {selectedProduct.floorid}</p>
    <p>Room ID: {selectedProduct.roomid}</p>
    <p>No of seats: {selectedProduct.noofseats}</p>
    <p>Capacity Left: {selectedProduct.capacityleft}</p>
    <p>Air Conditioner: {selectedProduct.airconditioner}</p>
    <p>Attached Kitchen: {selectedProduct.kitchen}</p>
    <p>Attach Wardrobe: {selectedProduct.wardrobe}</p>
    <p>Attach Bathroom: {selectedProduct.bath}</p>
  
  </div>
        )}
      </Modal>

      <Modal
        title="Edit Room"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {/* Assuming the EditProducts component is properly implemented */}
        <AddUserForm
          initialValues={selectedProduct}
          userdata={userdata}
          onCancel={() => setVisible(false)}
          setProducts={setProducts}
          products={products}
          allcollections={allcollections}
          setAllcollections={setAllcollections}
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
        <p>Are you sure you want to delete this room?</p>
      </Modal>

    </>
  );
};

export default ProductTable;
