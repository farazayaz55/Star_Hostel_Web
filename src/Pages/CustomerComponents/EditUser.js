import React, { useState, useEffect,useRef } from 'react';
import { Form, Input, Button, Select, Space,Modal, Upload,Card,Table, message, Col, Row, DatePicker,Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-config';
import Highlighter from 'react-highlight-words';
import { setDoc, doc ,runTransaction, collection,getDocs} from 'firebase/firestore';
import { storage } from '../../firebase-config2';
import COLORS from '../../colors';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { CheckCircleFilled, CloseCircleFilled,SearchOutlined, EditFilled, SaveFilled,PlusCircleFilled,DeleteFilled } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const EditProductForm = (props) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [product, setProduct] = useState(props.initialValues);
  const [newdate, setNewdate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);


  useEffect(() => {
    const initialValues = {
      ...props.initialValues,
      buyingDate: props.initialValues.buyingDate ? moment(props.initialValues.buyingDate) : null,
    };

    form.setFieldsValue(props.initialValues);
  }, [props.initialValues, form]);


  const onFinish = async (values) => {
    setLoading(true)
    try {

    
      await runTransaction(db, async (transaction) => {

          const custRef = collection(db, 'Customer');
           const res=await getDocs(custRef);
           let tempemplyees=[]
           let tempallobjects=[];
           res.forEach((element,index)=>{
               tempemplyees.push(element.data())
               tempallobjects=[...tempallobjects,...element.data().allobjects]
           })
           const toaddroomcheck=tempallobjects.findIndex((obj) => obj.customerCNIC === values.customerCNIC&&obj.code!==props.initialValues.code);
           
      if(toaddroomcheck===-1){
        let updatedValues = {
          ...props.initialValues,
          ...values,
        };
        let updatedProducts = [...tempallobjects];
      const index = updatedProducts.findIndex((item) => item.code === props.initialValues.code);
      if(index===-1){
        alert("This user do not exit anymore");
        props.onCancel();
        return;
      }
        const productRef = doc(db, 'Customer', String(props.initialValues.collectioncode));
        const tempcollectiontomod=await transaction.get(productRef)
        let tempallrooms=[]
        let checksameornot=false;
        tempallrooms=[...props.allrooms];
        if(selectedRoom){
          let collectionidofoldroom;
          const roomRef = doc(db, 'Rooms', String(selectedRoom.collectioncode));
          let roomRef1 ;
          const querySnapshot1=await transaction.get(roomRef);
          if(props.initialValues.roomcode!==""){
            collectionidofoldroom=props.allrooms.find((obj)=>obj.roomcode===props.initialValues.roomcode)
            roomRef1 = doc(db, 'Rooms', String(collectionidofoldroom.collectioncode));
          }
          if(collectionidofoldroom.collectioncode===selectedRoom.collectioncode){
            let tempcollectionrom=querySnapshot1.data();
            const roomindex= tempcollectionrom.allobjects.findIndex((obj)=>obj.code===selectedRoom.code)
            tempcollectionrom.allobjects[roomindex]={...selectedRoom,capacityleft:Number(selectedRoom.capacityleft)-1}
                const allroomindex=props.allrooms.findIndex((obj)=>obj.code===selectedRoom.code);
                if(props.initialValues.roomcode!==""){
                  const querySnapshot2=await transaction.get(roomRef1);
                  const roomindex1= tempcollectionrom.allobjects.findIndex((obj)=>obj.code===collectionidofoldroom.code)
                  const tempobjroom={...tempcollectionrom.allobjects[roomindex1],capacityleft:Number(tempcollectionrom.allobjects[roomindex1].capacityleft)+1}
                  tempcollectionrom.allobjects[roomindex1]=tempobjroom
                const allroomindex1=props.allrooms.findIndex((obj)=>obj.code===collectionidofoldroom.code);
                tempallrooms[allroomindex1]={...tempobjroom}
                transaction.set(roomRef1, {
                  ...tempcollectionrom
                });
              }
                tempallrooms[allroomindex]={...selectedRoom,capacityleft:Number(selectedRoom.capacityleft)-1}
                  // transaction.set(roomRef, {
                  //   ...tempcollectionrom
                  // });
                  updatedValues={...updatedValues,roomcode:selectedRoom.roomcode}  
          }else{
            let tempcollectionrom=querySnapshot1.data();
            const roomindex= tempcollectionrom.allobjects.findIndex((obj)=>obj.code===selectedRoom.code)
            tempcollectionrom.allobjects[roomindex]={...selectedRoom,capacityleft:Number(selectedRoom.capacityleft)-1}
                const allroomindex=props.allrooms.findIndex((obj)=>obj.code===selectedRoom.code);
                if(props.initialValues.roomcode!==""){
                  const querySnapshot2=await transaction.get(roomRef1);
                  let tempcollectionrom1=querySnapshot2.data();
                  const roomindex1= tempcollectionrom1.allobjects.findIndex((obj)=>obj.code===collectionidofoldroom.code)
                  const tempobjroom={...tempcollectionrom1.allobjects[roomindex1],capacityleft:Number(tempcollectionrom1.allobjects[roomindex1].capacityleft)+1}
                  tempcollectionrom1.allobjects[roomindex1]=tempobjroom
                const allroomindex1=props.allrooms.findIndex((obj)=>obj.code===collectionidofoldroom.code);
                tempallrooms[allroomindex1]={...tempobjroom}
                transaction.set(roomRef1, {
                  ...tempcollectionrom1
                });
              }
                tempallrooms[allroomindex]={...selectedRoom,capacityleft:Number(selectedRoom.capacityleft)-1}
                  transaction.set(roomRef, {
                    ...tempcollectionrom
                  });
                  updatedValues={...updatedValues,roomcode:selectedRoom.roomcode}
          
          }
         }
      let tempallcollections=[...tempemplyees]
      const tempcollectiontoeditindex=tempallcollections.findIndex((obj)=>obj.code===props.initialValues.collectioncode);
      let tempcollectiontoedit=tempcollectiontomod.data()
      const indexinarraytoupdate=tempcollectiontoedit.allobjects.findIndex((obj)=>obj.code===props.initialValues.code);
      tempcollectiontoedit.allobjects[indexinarraytoupdate]={...updatedValues}
      transaction.set(productRef, {
        ...tempcollectiontoedit
      });
      updatedProducts[index] = { ...updatedValues,
       };
        tempallcollections[tempcollectiontoeditindex]=tempcollectiontoedit
        props.setAllcollections(tempallcollections)
      props.setProducts(updatedProducts);
      // form.resetFields();
      form.setFieldsValue(updatedValues)
      setNewdate(null);
      setProduct({...updatedValues,code: props.initialValues.code})
      setSelectedRoom(null)
      props.setAllrooms(tempallrooms)
      props.onCancel();
      setSuccessModalVisible(true);
    }else{
      alert("A customer with this CNIC already exist.")
      setLoading(false)
    }
      })
    
    } catch (e) {
      setErrorModalVisible(true);
      console.error('Error editing product:', e.message);
    }
    setLoading(false)
  };

  const handleSuccessModalOk = () => {
    setSuccessModalVisible(false);
  };

  const handleErrorModalOk = () => {
    setErrorModalVisible(false);
  };

  const validatePrice = (_, value) => {
    if (value < 0) {
      return Promise.reject('Price cannot be negative');
    }
    return Promise.resolve();
  };
  let filtereedallrooms=props.allrooms.filter((obj)=>obj.capacityleft>0&&obj.roomcode!==props.initialValues.roomcode)
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
    },  {
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
       
{(selectedRoom)&&(selectedRoom.code===record.code)?<Button
            icon={<CheckCircleFilled />}
            style={{
              borderRadius: 10,
              background: COLORS.savegradient,
              color: 'white',
            }}
            onClick={() => handleRoomSelection(record)}
          >
            Choosed
          </Button>:
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
  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setModalVisible(false);
    // You may want to update form fields with the selected room details
  };
  return (
    <div>
    {loading ? (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" tip="Plaese wait...">
        <div className="content" />
          </Spin>
      </div>):
     <Form form={form} onFinish={onFinish} layout="vertical">
     <Row gutter={16}>
     
    <Col xs={24} sm={12}>
    <Form.Item name="customer" label="Customer" rules={[{ required: true, message: 'Please enter a customer name' }]}>
      <Input placeholder="Enter Customer Name" />
    </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
    <Form.Item name="customerContact" label="Customer Contact" rules={[{ required: true, message: 'Please enter a contact' }]}>
      <Input placeholder="Enter Contact" />
    </Form.Item>
    </Col>
    {/* <Col xs={24} sm={8}>
    <Form.Item
                      label={"Deal Date"}
                        name={  'dealdate'}
                        fieldKey={'dealdate'}
                        rules={[{ required: true, message: 'Please select a dealdate' }]}
                      >
                        <DatePicker placeholder=" Date" style={{ width: '100%' }} />
                      </Form.Item>
                      </Col> */}
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
    <Col xs={24} sm={8}>
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
                  </Col>
    </Row>
    <Row gutter={16}>
    <Col xs={24} sm={8}>
                  <Form.Item
                  label={"Fee Amount"}
                    name={ 'feeamount'}
                    fieldKey={ 'feeamount'}
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
                  name={ 'feeDate'}
                    rules={[{ required: true, message: 'Please select fee date' }]}
                    className="flex-item"
                    fieldKey={ 'feeDate'}
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
               {props.initialValues&&       <Col xs={24} sm={8}>
              <Form.Item
               label={"Room : "+props.initialValues.roomcode}> 
     
                <Button type="primary"  
          icon={<PlusCircleFilled />} style={{
            borderRadius: 10,
            width:"100%",
            background: COLORS.detailgradient,
            color: 'white',
          }} onClick={() => setModalVisible(true)}>Assign Room</Button>
              </Form.Item>
            </Col>}
                     </Row>
    <Form.Item name="additionalDetails" label="Additional Details"
     rules={[{ required: true, message: 'Please add description' }]}
    >
      <Input.TextArea
        placeholder="Enter additional details about the customer"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </Form.Item>

  <Form.Item>
    <Button   style={{
          borderRadius:10,
              background: COLORS.primarygradient,
              color:"white"
                    }}
                    icon={<SaveFilled/>}
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
        icon={<CloseCircleFilled/>}
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
      Customer editted successfully!
    </Modal>
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
      Error editting customer. Please try again.
    </Modal>

  </Form>}
  </div>
  );
};

export default EditProductForm;
