import React, { useState,useEffect } from 'react';
import { Table, Input, Modal, Space, Button } from 'antd';

const EmployeeTable = ({ employee, setEmployees,selected, setSelected1, type }) => {
  const [visibledetail, setVisibleDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Pay',
      dataIndex: 'pay',
      key: 'pay',
      sorter: (a, b) => a.pay - b.pay,
    },
    {
      title: 'Employee Contact',
      dataIndex: 'employeeContact',
      key: 'employeeContact',
      sorter: (a, b) => a.employeeType.localeCompare(b.employeeType),
    },
    
    {
      title: 'Employee CNIC',
      dataIndex: 'employeeCnic',
      key: 'employeeCnic',
      sorter: (a, b) => a.employeeType.localeCompare(b.employeeType),
    },
  
    {
      title: 'Actual Pay',
      key: 'actualPay',
      render: (_, record) => (
        <Input
          type="number"
          value={ record.pay}
          style={{minWidth:150}}
          onChange={(e) => handleActualPayChange(e, record)}
        />
      ),
    },
  ];
  const handleActualPayChange = (e, record) => {
    const newEmployee = { ...record, pay: e.target.value };
    // Update the employee in your state
    let tempamployee=[]
    setEmployees((prevEmployees) => {
      const index = prevEmployees.findIndex((emp) => emp.id === record.id);
      let updatedEmployees = [...prevEmployees];
      updatedEmployees[index] = newEmployee;
      tempamployee=[...updatedEmployees]
      return updatedEmployees;
    });
    const selectedEmployees = tempamployee.filter((emp) => selectedRowKeys.includes(emp.id));
    let temp={...selected}
    temp.pays=[...selectedEmployees];
    // setSelected({...temp});
    setSelected1({...temp});
        setSelectedRowKeys(selectedRowKeys);
  };

  const handleRowSelectionChange = (selectedKeys) => {
const selectedEmployees = employee.filter((emp) => selectedKeys.includes(emp.id));
let temp={...selected}
temp.pays=[...selectedEmployees];
setSelected1(temp);
    setSelectedRowKeys(selectedKeys);

  
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange, 
  };
  const handleClose = () => {
    setVisibleDetail(false);
    setSelectedEmployee(null);
  };
  useEffect(() => {
    setSelectedRowKeys(selected.pays.map(emp => emp.id));
}, [type, selected]);
  return (
    <>
      <Table
        dataSource={employee}
        columns={columns}
        rowKey="id"
        scroll={{ x: true }} // Enable horizontal scrolling
        responsive={true} // Enable responsive behavior
        
        rowSelection={rowSelection}
      />
      <Modal title="Employee Details" visible={visibledetail} onCancel={handleClose} footer={null}>
        {selectedEmployee && (
          <div>
            <p>Name: {selectedEmployee.name}</p>
            <p>Pay: {selectedEmployee.pay}</p>
            <p>Employee Type: {selectedEmployee.employeeType}</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default EmployeeTable;
