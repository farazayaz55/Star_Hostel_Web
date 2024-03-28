import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Select, Modal, Card, Table, Space, Row, Col, DatePicker, Upload, message, Tabs, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import Highlighter from 'react-highlight-words';
import { setDoc, doc, collection, getDocs, getDoc, runTransaction, query, writeBatch } from 'firebase/firestore';
import COLORS from '../../colors';
import { CheckCircleFilled, CloseCircleFilled, DeleteFilled, PlusCircleFilled, SaveFilled, ScanOutlined, SecurityScanFilled, SearchOutlined } from '@ant-design/icons';
const { Option } = Select;

const AddProductForm = ({ setEmployees, employees, userdata, allcollections, setAllcollections, allrooms, setAllrooms, IsMessStudent }) => {
  const [form] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  let filtereedallrooms = allrooms.filter((obj) => obj.capacityleft > 0)
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();

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
    }, {
      title: 'Capacity Left',
      dataIndex: 'capacityleft',
      key: 'capacityleft',
      sorter: (a, b) => a.capacityleft - b.capacityleft,
    },
    {
      title: 'Building No',
      dataIndex: 'buildingid',
      key: 'buildingid',
      ...getColumnSearchProps('buildingid'),
    },
    {
      title: 'Floor No',
      dataIndex: 'floorid',
      key: 'floorid',
      ...getColumnSearchProps('floorid'),
    },
    {
      title: 'Room No',
      dataIndex: 'roomid',
      key: 'roomid',
      ...getColumnSearchProps('roomid'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">

          {(selectedRoom) && (selectedRoom.code === record.code) ? <Button
            icon={<CheckCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.savegradient,
              color: 'white',
            }}
            onClick={() => handleRoomSelection(record)}
          >
            Choosed
          </Button> :
            <Button
              icon={<CheckCircleFilled />}
              style={{
                borderRadius: 10,
                background: COLORS.primarygradient,
                color: 'white',
              }}
              onClick={() => handleRoomSelection(record)}
            >
              Choose
            </Button>}
        </Space>
      ),
    },
  ];

  const generateProductCode = () => {
    return `COLLECTION-${uuidv4()}`;
  };
  const generategeneratepaymentCode = () => {
    return `PAY-${uuidv4()}`;
  };
  const onFinish = async (values) => {
    const productCode = `CUSTOMER-${uuidv4()}`
    if (selectedRoom || IsMessStudent) { //either select room or be a mess student
      setLoading(true)
      try {

        await runTransaction(db, async (transaction) => {

          const custRef = collection(db, 'Customer');
          const res = await getDocs(custRef);
          let tempemplyees = []
          let tempallobjects = [];
          res.forEach((element, index) => {
            tempemplyees.push(element.data())
            tempallobjects = [...tempallobjects, ...element.data().allobjects]
          })
          if (tempemplyees.length > 0) {
          } else {
            const tempcollectionobj = { code: generateProductCode(), allobjects: [] }
            tempemplyees.push(tempcollectionobj)
          }
          let roomRef
          let querySnapshot1
          if(selectedRoom){
             roomRef = doc(db, 'Rooms', String(selectedRoom.collectioncode));
             querySnapshot1 = await transaction.get(roomRef);
             let tempcollectionrom = querySnapshot1.data();
             const roomindex = tempcollectionrom.allobjects.findIndex((obj) => obj.code === selectedRoom.code)
             tempcollectionrom.allobjects[roomindex] = { ...selectedRoom, capacityleft: Number(selectedRoom.capacityleft) - 1 }
             const allroomindex = allrooms.findIndex((obj) => obj.code === selectedRoom.code);
             let tempallrooms = [...allrooms];
             tempallrooms[allroomindex] = { ...selectedRoom, capacityleft: Number(selectedRoom.capacityleft) - 1 }
 
            transaction.set(roomRef, {
               ...tempcollectionrom
             }); 
            setAllrooms(tempallrooms)
          }

          const formattedDate = values.dealdate.$d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
          let month = formattedDate.slice(3, formattedDate.length);
          let tempnumtocheckmonth = Number(month[0] + month[1]);
          if (tempnumtocheckmonth < 10) {
            tempnumtocheckmonth = tempnumtocheckmonth - 1
          }
          month = String(tempnumtocheckmonth) + "-" + month[3] + month[4] + month[5] + month[6]
          const khattaRef = doc(db, 'Khatta', month);
          const Khattainfo = await transaction.get(khattaRef);

          const toaddroomcheck = tempallobjects.findIndex((obj) => obj.customerCNIC === values.customerCNIC);
          if (toaddroomcheck === -1) {
            let tempallcollections = [...tempemplyees];
            let collectionindex = tempallcollections.findIndex((obj) => obj.allobjects.length < 50);
            if (collectionindex === -1) {
              collectionindex = tempallcollections.length;
              tempallcollections.push({ code: generateProductCode(), allobjects: [] })
            }
            let temptoaddcollection = tempallcollections[collectionindex];
            temptoaddcollection.allobjects.push({
              ...values,
              roomcode: selectedRoom?.roomcode ?? null,
              dealdate: formattedDate,
              code: productCode,
              collectioncode: temptoaddcollection.code
            })
            tempallcollections[collectionindex] = { ...temptoaddcollection };
            const productRef = doc(db, 'Customer', temptoaddcollection.code);
            transaction.set(productRef, {
              ...temptoaddcollection
            });
            if (Khattainfo.exists()) {
              let tempkhattacust = [...Khattainfo.data().customers]
              tempkhattacust.push({ customer: values.customer, customerContact: values.customerContact, roomcode: selectedRoom?.roomcode ?? null, code: productCode, collectioncode: temptoaddcollection.code, feeamount: values.feeamount, feeDate: values.feeDate, status: false, discount: 0, date: "" })
              transaction.set(khattaRef, {
                ...Khattainfo.data(),
                customers: tempkhattacust
              })
            }

            let temp = [...tempallobjects];
            temp.unshift({
              ...values,
              dealdate: formattedDate,
              roomcode: selectedRoom?.roomcode ?? null,
              code: productCode,
              collectioncode: temptoaddcollection.code
            });
            setEmployees(temp);
            setAllcollections(tempallcollections)
            form.resetFields();
            setSelectedRoom(null)
            setSuccessModalVisible(true);
          }
          else {
            alert("A same customer with this cnic already exists")
          }

        })
      } catch (e) {
        // Show error modal
        setErrorModalVisible(true);
        console.error('Error adding customer:', e.message);
      }
    } else {
      alert("Please select a room")
    }
    setLoading(false)
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };



  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setModalVisible(false);
    // You may want to update form fields with the selected room details
  };

  return (
    <div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Spin size="large" />
          <p>Please Wait...</p>
        </div>) :
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row gutter={16}>

            <Col xs={24} sm={8}>
              <Form.Item name="customer" label="Customer" rules={[{ required: true, message: 'Please enter a customer name' }]}>
                <Input placeholder="Enter Customer Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="customerContact" label="Customer Contact" rules={[{ required: true, message: 'Please enter a contact' }]}>
                <Input placeholder="Enter Contact" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={"Deal Date"}
                name={'dealdate'}
                fieldKey={'dealdate'}
                rules={[{ required: true, message: 'Please select a dealdate' }]}
              >
                <DatePicker placeholder=" Date" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="customerAddress" label="Customer Address" rules={[{ required: true, message: 'Please enter customer address' }]}>
                <Input placeholder="Enter Customer Address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="customerCNIC" label="Customer CNIC" rules={[{ required: true, message: 'Please enter customer CNIC' }]}>
                <Input placeholder="Enter Customer CNIC" />
              </Form.Item>
            </Col>
           {!IsMessStudent && <Col xs={24} sm={8}>
                    <Form.Item
                    label={"Security"}
                      name={ 'security'}
                      fieldKey={ 'security'}
                      rules={[{ required: true, message: 'Please enter a security' },
                      {
                        validator(_, value) {
                          if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                            return Promise.resolve();
                          }
                  
                          return Promise.reject(new Error('Please enter a non-negative whole number'));
                        },
                      },
                    ]}
                    >
                      <Input type="number" placeholder="Security" />
                    </Form.Item>
                    </Col>}
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={"Fee Amount"}
                name={'feeamount'}
                fieldKey={'feeamount'}
                rules={[{ required: true, message: 'Please enter a fee amount' },
                {
                  validator(_, value) {
                    if (/^\d+$/.test(value) && parseInt(value, 10) >= 0) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('Please enter a non-negative whole number'));
                  },
                },
                ]}
              >
                <Input type="number" placeholder="Fee Amount" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={"Fee Date "}
                name={'feeDate'}
                rules={[{ required: true, message: 'Please select fee date' }]}
                className="flex-item"
                fieldKey={'feeDate'}
              >
                <Select placeholder="Select fees date"  >
                  <Option value="01">1</Option>
                  <Option value="02">2</Option>
                  <Option value="03">3</Option>
                  <Option value="04">4</Option>
                  <Option value="05">5</Option>
                  <Option value="06">6</Option>
                  <Option value="07">7</Option>
                  <Option value="08">8</Option>
                  <Option value="09">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                  <Option value="13">13</Option>
                  <Option value="14">14</Option>
                  <Option value="15">15</Option>
                  <Option value="16">16</Option>
                  <Option value="17">17</Option>
                  <Option value="18">18</Option>
                  <Option value="19">19</Option>
                  <Option value="20">20</Option>
                  <Option value="21">21</Option>
                  <Option value="22">22</Option>
                  <Option value="23">23</Option>
                  <Option value="24">24</Option>
                  <Option value="25">25</Option>
                  <Option value="26">26</Option>
                  <Option value="27">27</Option>
                  <Option value="28">28</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              {!IsMessStudent && <Form.Item
                label={"Assign Room "}>

                <Button type="primary"
                  icon={<PlusCircleFilled />} style={{
                    borderRadius: 10,
                    width: "100%",
                    background: COLORS.detailgradient,
                    color: 'white',
                  }} onClick={() => setModalVisible(true)}>Assign Room</Button>
              </Form.Item>}
            </Col>
          </Row>
          <Form.Item name="additionalDetails" label="Additional Details"
            // rules={[{ required: true, message: 'Please add description' }]}
          >
            <Input.TextArea
              placeholder="Enter additional details about the customer"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          {/* <Form.List name="guaranters">
        {(fields, { add, remove }) => (
          <>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', marginBottom: 8, marginRight: 8 }}>
                  <Card title="Guaranter" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                 
                    <Form.Item
                          {...restField}
                          name={[name, 'guaranterName']}
                          fieldKey={[fieldKey, 'guaranterName']}
                          rules={[{ required: true, message: 'Please enter Guaranter Name' }]}
                        >
                          <Input type="text" placeholder="Guaranter Name" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'guaranterCnic']}
                          fieldKey={[fieldKey, 'guaranterCnic']}
                          rules={[{ required: true, message: 'Please enter Guaranter CNIC' }]}
                        >
                          <Input type="text" placeholder="Guaranter CNIC" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'guaranterContact']}
                          fieldKey={[fieldKey, 'guaranterContact']}
                          rules={[{ required: true, message: 'Please enter Guaranter Phone' }]}
                        >
                          <Input type="text" placeholder="Guaranter Phone" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'guaranterAddress']}
                          fieldKey={[fieldKey, 'guaranterAddress']}
                          rules={[{ required: true, message: 'Please enter Guaranter Address' }]}
                        >
                            <Input.TextArea
          placeholder="Guaranter Address"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
                        </Form.Item>
                   
                   
                    <Button
                      style={{
                        borderRadius: 10,
                        background: COLORS.deletegradient,
                        color: 'white',
                        width: '100%',
                      }}
                      icon={<DeleteFilled />}
                      onClick={() => {
                        remove(name);
                      }}
                    >
                      Remove
                    </Button>
                  </Card>
                </div>
              ))}
            </div>
            <Form.Item>
              <Button
                style={{
                  borderRadius: 10,
                  background: COLORS.detailgradient,
                  color: 'white',
                  width: '100%',
                }}
                icon={<PlusCircleFilled />}
                type="dashed"
                onClick={() => add()} 
                // onClick={handleAddProduct}
                block
              >
                Add Guaranter
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List> */}
          <Form.Item>
            <Button style={{
              borderRadius: 10,
              background: COLORS.primarygradient,
              color: "white"
            }}
              icon={<SaveFilled />}
              htmlType="submit">
              Save Customer
            </Button>
          </Form.Item>

          {/* Success Modal */}
          <Modal
            title="Success"
            visible={successModalVisible}
            onOk={handleSuccessModalOk}
            onCancel={handleSuccessModalOk}
            footer={[
              <Button
                icon={<CloseCircleFilled />}
                key="cancel"
                onClick={handleSuccessModalOk}
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
                onClick={handleSuccessModalOk}
                icon={<CheckCircleFilled />}
                style={{
                  borderRadius: 10,
                  background: COLORS.primarygradient,
                  color: 'white',
                }}
              >
                Done
              </Button>,
            ]}
          >
            Customer added successfully!
          </Modal>
          {/* Room Selection Modal */}
          <Modal
            title="Select Room"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            width={800}
            footer={[
              <Button key="cancel"

                icon={<CloseCircleFilled />} style={{
                  borderRadius: 10,
                  background: COLORS.editgradient,
                  color: 'white',
                }} onClick={() => setModalVisible(false)}>Cancel</Button>
            ]}
          >
            <Table dataSource={filtereedallrooms} columns={columns}

              scroll={{ x: true }} // Enable horizontal scrolling
              responsive={true} // Enable responsive behavior
            />
          </Modal>

          {/* Error Modal */}
          <Modal
            title="Error"
            visible={errorModalVisible}
            onOk={handleErrorModalOk}
            onCancel={handleErrorModalOk}
          >
            Error adding customer. Please try again.
          </Modal>

        </Form>}
    </div>
  );
};

export default AddProductForm;
