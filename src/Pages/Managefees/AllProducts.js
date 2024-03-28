import { CloseCircleFilled, DeleteFilled, DollarCircleFilled, EditFilled, InfoCircleFilled, MinusCircleFilled, MoneyCollectFilled, PaperClipOutlined, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table, Modal } from 'antd';
import AddUserForm from './EditProducts';
import AddUserFormFees from './EditFees';
import COLORS from '../../colors';
import EmployeeSlip from "./Pdf"
import DetailsStats from "./DetailsStats"
import AddRecord from './Addrecord'
import { db } from '../../firebase-config';
import { setDoc, doc, deleteDoc, runTransaction } from 'firebase/firestore';
import Stats from "./Stats"

const ProductTable = ({ products, setProducts, allcollections, setAllcollections, userdata, allmonthsavailable, setMonthsAvailable, month, allaccounts, setAllaccounts }) => {
  const [visible, setVisible] = useState(false);
  const [visiblefees, setVisibleFees] = useState(false);
  const [index, setIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductpdf, setSelectedProducpdf] = useState(null);
  const [visibledetailpdf, setVisibleDetailpdf] = useState(false)
  const [visibleaddrecord, setVisibleAddRecord] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedrecord1, setSelectedRecord1] = useState(null)
  const [visibledetail, setVisibleDetail] = useState(false);
  const [sellectedindex, setSellectedIndex] = useState(null)
  const [searchedColumn, setSearchedColumn] = useState('');
  const [type, setType] = useState(null)
  const searchInput = useRef(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false); // New state for delete confirmation
  const [deleteConfirmationVisible1, setDeleteConfirmationVisible1] = useState(false);
  const showDeleteConfirmationModal = (record, index) => {
    setSelectedProduct(record);
    setSellectedIndex(index)
    setDeleteConfirmationVisible(true);
  };

  const showDeleteConfirmationModal1 = (index, record) => {
    setSelectedRecord1(record);
    setDeleteConfirmationVisible1(true);
  };

  const handleDetail = (record) => {
    const temp = allcollections.find((obj) => obj.code === record.code)
    setSelectedProduct({ ...temp, pending: record.pending });
    setVisibleDetail(true);
  };
  const handlePdf = (record) => {
    const temp = allcollections.find((obj) => obj.code === record.code)
    setSelectedProducpdf({ ...temp, pending: record.pending, ...record });
    setVisibleDetailpdf(true);
  };
  const handleClosePdf = () => {
    setVisibleDetailpdf(false);
    setSelectedProducpdf(null);
  };
  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedProduct(null);
  };
  const handleDeleteConfirmationOk = async () => {
    try {
      await runTransaction(async (transaction) => {


        // Delete the product document
        const productRef = doc(db, 'Khatta', String(products.code));
        const queryrecor = await transaction.get(productRef)
        if (!(queryrecor.exists())) {
          alert("This month record does not exist anymore");
          return;
        }
        // await deleteDoc(productRef);
        // Update the local state to remove the deleted product
        let temp = { ...queryrecor.data() };
        let temptimeline = [...temp.customers];
        const indextodel = temptimeline.findIndex((obj => obj.code === selectedProduct.code));
        if (indextodel === -1) {
          alert("This record does not exist anymore");
          return;
        }
        temptimeline.splice(indextodel, 1);
        temp.customers = temptimeline;
        transaction.set(productRef, { temp })
        setProducts(temp);

        // Close the confirmation modal
        setDeleteConfirmationVisible(false);
      })
    } catch (e) {
      alert(e.code);
    }
  };

  const handleDeleteConfirmationOk1 = async () => {
    try {
      // Delete the product document
      let tempallmonthsavailable = [...allmonthsavailable];
      const todeleteindex = tempallmonthsavailable.findIndex((obj) => obj.code === products.code);

      const productRef = doc(db, 'Khatta', String(products.code));
      await deleteDoc(productRef);
      tempallmonthsavailable.splice(todeleteindex, 1);
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

  const handleReset = (clearFilters, confirm) => {
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
      title: 'Roomcode',
      dataIndex: 'roomcode',
      key: 'roomcode',
      ...getColumnSearchProps('roomcode'),
    },
    {
      title: 'Proof',
      dataIndex: 'Proof',
      key: 'Proof',
      render: (text) => (text ? <a href={text} target="_blank" rel="noopener noreferrer">
        <img src={text} alt="Proof" width="50px" />
      </a> : null)
    },
    {
      title: 'Status',
      dataIndex: 'pending',
      key: 'pending',
      render: (type) => (
        <span style={{ color: type > 0 ? 'red' : 'green' }}>
          {type > 0 ? (
            <MinusCircleFilled style={{ color: 'red' }} />
          ) : (
            <PlusCircleFilled style={{ color: 'green' }} />
          )}{' '}
          {type > 0 ? "PENDING" : "CLEAR"}
        </span>
      ),
    },
    {
      title: 'Pending',
      dataIndex: 'pending',
      key: 'pending',

    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Space size="middle">
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-editpayment") !== -1)) && <>
            {(record.status) && <Button
              icon={<EditFilled />}
              style={{

                borderRadius: 10,
                background: COLORS.editgradient,
                color: "white"
              }} onClick={() => handleEdit(record, index)}>
              Edit Payment
            </Button>}

          </>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-addpayment") !== -1)) && <>
            {!(record.status) && <Button
              icon={<DollarCircleFilled />}
              style={{

                borderRadius: 10,
                background: COLORS.primarygradient,
                color: "white"
              }} onClick={() => handleAddRecord(record, index)}>
              Payment
            </Button>}

          </>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-addpayment") !== -1)) && <>
            <Button
              icon={<InfoCircleFilled />}
              style={{

                borderRadius: 10,
                background: COLORS.detailgradient,
                color: "white"
              }} onClick={() => handleDetail(record, index)}>
              Detail
            </Button>

          </>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-editfees") !== -1)) && <>
            <Button
              icon={<EditFilled />}
              style={{

                borderRadius: 10,
                background: COLORS.editgradient,
                color: "white"
              }} onClick={() => handleEditFees(record, index)}>
              Edit Fees
            </Button>

          </>}
          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-slip") !== -1)) && <>
            <Button
              icon={<InfoCircleFilled />}
              style={{

                borderRadius: 10,
                background: COLORS.detailgradient,
                color: "white"
              }} onClick={() => handlePdf(record, index)}>
              Get Slip
            </Button>

          </>}

          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-deletepayment") !== -1)) && <>{<Button
            icon={<DeleteFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.deletegradient,
              color: 'white',
            }}
            onClick={() => showDeleteConfirmationModal(record, index)}
          >
            Delete
          </Button>}
          </>}
        </Space>
      ),
    },
  ];
  const handleAddRecord = (product, index) => {
    setSelectedProduct(product);
    setSellectedIndex(index)
    setType(type)
    setVisibleAddRecord(true);

  };
  const handleEdit = (product, index) => {
    setSelectedProduct(product);
    setSellectedIndex(index)
    setVisible(true);
  };
  const handleEditFees = (product, index) => {
    setSelectedProduct(product);
    setSellectedIndex(index)
    setVisibleFees(true);
  };

  return (
    <>
      {products &&
        <>


          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-deletemonth") !== -1)) && <Button
            icon={<DeleteFilled />}
            style={{
              marginLeft: 10,
              background: COLORS.deletegradient,
              color: 'white',
              borderRadius: 10,
            }}
            onClick={() => showDeleteConfirmationModal1(products)}
          >
            Delete
          </Button>}

          {((userdata.role === "admin") || (userdata.accesses.findIndex((obj) => obj === "fees" || obj === "fees-stats") !== -1)) && <Stats data={products} />}
          <Table columns={columns} dataSource={products.customers} rowKey="id" responsive={true} scroll={{ x: true }}
          />

          <Modal
            title="Add Payment"
            visible={visibleaddrecord}
            onCancel={() => setVisibleAddRecord(false)}
            footer={null}
          >
            {/* Assuming the EditProducts component is properly implemented */}
            <AddRecord
              initialValues={selectedProduct}
              onCancel={() => setVisibleAddRecord(false)}
              setEmployees={setProducts}
              allmonthsavailable={allmonthsavailable}
              allaccounts={allaccounts}
              allcollections={allcollections}
              setAllcollections={setAllcollections}
              setAllaccounts={setAllaccounts}
              setMonthsAvailable={setMonthsAvailable}
              indextochange={sellectedindex}
              month={month}
              employees={products}
              type={type}
            />
          </Modal>
          <Modal
            title="Edit Record"
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={null}
          >
            <AddUserForm
              initialValues={selectedProduct}
              onCancel={() => setVisible(false)}
              setProducts={setProducts}
              products={products}
              allmonthsavailable={allmonthsavailable}
              setMonthsAvailable={setMonthsAvailable}
              index={sellectedindex}
            />

          </Modal>
          <Modal
            title="Edit Fees"
            visible={visiblefees}
            onCancel={() => setVisibleFees(false)}
            footer={null}
          >
            <AddUserFormFees
              initialValues={selectedProduct}
              onCancel={() => setVisibleFees(false)}
              setProducts={setProducts}
              products={products}
              allmonthsavailable={allmonthsavailable}
              setMonthsAvailable={setMonthsAvailable}
              index={sellectedindex}
            />

          </Modal>
          <Modal
            title="Fee Slip"
            visible={visibledetailpdf}
            onCancel={() => handleClosePdf()}
            footer={null}
          >
            <EmployeeSlip
              selected={selectedProductpdf}
              month={month}
              allaccounts={allaccounts}
              onCancel={() => handleClosePdf()}
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
            <p>Are you sure you want to delete this record?</p>
          </Modal>
          <Modal title="Customer Fees Details" visible={visibledetail} onCancel={handleClose} footer={null} width={1000}>
            {selectedProduct && (
              <div>
                <DetailsStats data={selectedProduct} />
                <Table
                  dataSource={selectedProduct.detail}
                  columns={[
                    {
                      title: 'Fee Month',
                      dataIndex: 'month',
                      key: 'month',
                    },
                    {
                      title: 'Date',
                      dataIndex: 'date',
                      key: 'date',
                    },
                    {
                      title: 'Fee',
                      dataIndex: 'feeamount',
                      key: 'feeamount',
                    },
                    {
                      title: 'Amount Paid',
                      dataIndex: 'amount',
                      key: 'amount',
                    },
                    // {
                    //   title: 'Status',
                    //   dataIndex: 'status',
                    //   key: 'status',
                    //   sorter: (a, b) => {
                    //     if (a.status === b.status) return 0;
                    //     return a.status ? 1 : -1;
                    //   },
                    //   render: (type) => (
                    //     <span style={{ color: type === false ? 'red' : 'green' }}>
                    //       {type === false ? (
                    //         <MinusCircleFilled style={{ color: 'red' }} />
                    //       ) : (
                    //         <PlusCircleFilled style={{ color: 'green' }} />
                    //       )}{' '}
                    //       {type?"PAID":"UNPAID"}
                    //     </span>
                    //   ),
                    // },
                  ]}
                  rowKey={(record, index) => index}
                  scroll={{ x: true }} // Enable horizontal scrolling
                  responsive={true} // Enable responsive behavior
                />
              </div>
            )}
          </Modal>
          <Modal
            title="Confirm Deletion"
            visible={deleteConfirmationVisible1}
            onOk={handleDeleteConfirmationOk1}
            onCancel={handleDeleteConfirmationCancel1}
            footer={[
              <Button
                icon={<CloseCircleFilled />}
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
