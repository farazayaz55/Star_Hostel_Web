import { CiCircleFilled, CloseCircleFilled, DeleteFilled, EditFilled, InfoCircleFilled, LockFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table, Modal, Spin, Select } from 'antd';
import AddUserForm from './EditUser';
import COLORS from '../../colors';
import { db } from '../../firebase-config';
import Statisticscard from "./Stats"
import { setDoc, doc, deleteDoc, runTransaction } from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';


const ProductTable = ({ products, setProducts, userdata, allcollections, setAllcollections, allrooms, setAllrooms }) => {
  const [visible, setVisible] = useState(false);
  const [filter,setFilter]=useState('All')
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const searchInput = useRef(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false); // New state for delete confirmation


/**
 * Filters rows on basis of filter selected
 */

  const filterRows=()=>{
    switch (filter){
      case 'All':
        return products

      case 'Hostelites Only':
        return products.filter((student)=>student.roomcode? true :false)

      case 'Mess Only':
        return products.filter((student)=>!student.roomcode?true:false)
    }
  }

  const showDeleteConfirmationModal = (record) => {
    setSelectedProduct(record);
    setDeleteConfirmationVisible(true);
  };
  //correct delte function
  const handleDeleteConfirmationOk = async () => {
    setLoading(true)
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'Customer', String(selectedProduct.collectioncode));
        const collectiontempmod = await transaction.get(productRef);
        // Delete the product document
        let tempallcollectionsindex = allcollections.findIndex((obj) => obj.code === selectedProduct.collectioncode);
        let tempcollectiontomodify = collectiontempmod.data();
        const temptodeleteindex = tempcollectiontomodify.allobjects.findIndex((obj) => obj.code === selectedProduct.code)
        tempcollectiontomodify.allobjects.splice(temptodeleteindex, 1);
        if (temptodeleteindex === -1) {
          alert("This customer does not exist any more or it is removed by any one")
          setDeleteConfirmationVisible(false);
          return;
        }
        const productRef1 = doc(db, 'Archive', "Info");
        const archiveDoc = await transaction.get(productRef1);
        let tempallrooms = [...allrooms];
        if (selectedProduct.roomcode !== "") {
          const collectionidofoldroom = allrooms.find((obj) => obj.roomcode === selectedProduct.roomcode)
          const roomRef = doc(db, 'Rooms', String(collectionidofoldroom.collectioncode));
          const querySnapshot1 = await transaction.get(roomRef);
          let tempcollectionrom = querySnapshot1.data();
          const roomindex = tempcollectionrom.allobjects.findIndex((obj) => obj.code === collectionidofoldroom.code)

          if (roomindex !== -1) {
            tempcollectionrom.allobjects[roomindex] = { ...collectionidofoldroom, capacityleft: Number(collectionidofoldroom.capacityleft) + 1 }
            const allroomindex = allrooms.findIndex((obj) => obj.code === collectionidofoldroom.code);
            tempallrooms[allroomindex] = { ...collectionidofoldroom, capacityleft: Number(collectionidofoldroom.capacityleft) + 1 }
            transaction.set(roomRef, {
              ...tempcollectionrom
            });
          }
        } else {

        }



        if (archiveDoc.exists()) {
          if (archiveDoc.data().allobjects.length < 2500) {
            let temparchive = [...archiveDoc.data().allobjects]
            temparchive.unshift(selectedProduct)
            transaction.set(productRef1, { allobjects: temparchive })
          } else {
            let temparchive = archiveDoc.data().allobjects
            temparchive.length = 2000;
            temparchive.unshift(selectedProduct)
            transaction.set(productRef1, { allobjects: temparchive })
          }

        } else {
          let temparchive = []
          temparchive.unshift(selectedProduct)
          transaction.set(productRef1, { allobjects: temparchive })
        }
        transaction.set(productRef, { ...tempcollectiontomodify });
        let tempallcollections = [...allcollections];
        tempallcollections[tempallcollectionsindex] = tempcollectiontomodify;
        setAllcollections(tempallcollections)
        // Update the local state to remove the deleted product
        let temp = [...products];
        const index = temp.findIndex((obj) => obj.code === selectedProduct.code);
        temp.splice(index, 1);
        setProducts(temp);
        setAllrooms(tempallrooms)

        // Close the confirmation modal
        setDeleteConfirmationVisible(false);
      })
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

  const handleReset = (clearFilters, confirm) => {
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
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
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
      title:'Fee',
      dataIndex:'feeamount',
      dataIndex:'feeamount',
      ...getColumnSearchProps('feeamount'),

    },
    {
      title: 'Security Deposit',
      dataIndex: 'security',
      key: 'security',
      sorter: (a, b) => a.security - b.security,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "customers" || obj === "customers-edit") !== -1)) && <Button
            icon={<EditFilled />}
            style={{

              borderRadius: 10,
              background: COLORS.editgradient,
              color: "white"
            }} onClick={() => handleEdit(record)}>
            Edit
          </Button>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "customers" || obj === "customers-detail") !== -1)) && <Button
            icon={<InfoCircleFilled />}
            style={{

              borderRadius: 10,
              background: COLORS.primarygradient,
              color: "white"
            }} onClick={() => handleDetail(record)}>Detail</Button>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "customers" || obj === "customers-archive") !== -1)) && <Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirmationModal(record)}
          >
            Archive
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
          </div>) :
          <>
            {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "customers" || obj === "customers-stats") !== -1)) && <Statisticscard data={filterRows(products)} />}
            
            <Select
            defaultValue={'All'}
            options={[
              {value:'All',label:'All'},
              {value:'Mess Only', label:'Mess Students Only'},
              {value:'Hostelites Only',label:'Hostelites Only'}
            ]}
            onChange={(value)=>setFilter(value)}
            style={{minWidth:'10vw'}}
            />
            <Table columns={columns} dataSource={filterRows(products)} rowKey="id"

              scroll={{ x: true }} // Enable horizontal scrolling
              responsive={true} // Enable responsive behavior
            />
          </>}
      </div>
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



          </div>
        )}
      </Modal>

      <Modal
        title="Edit Customer"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        {/* Assuming the EditProducts component is properly implemented */}
        <AddUserForm
          initialValues={selectedProduct}
          userdata={userdata}
          allrooms={allrooms}
          setAllrooms={setAllrooms}
          allcollections={allcollections}
          setAllcollections={setAllcollections}
          onCancel={() => setVisible(false)}
          setProducts={setProducts}
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
            icon={<CloseCircleFilled />}
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
        <p>Are you sure you want to delete this customer?</p>
      </Modal>

    </>
  );
};

export default ProductTable;
