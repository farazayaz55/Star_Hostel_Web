import React, { useEffect } from 'react';
import UserHome from './Pages/Profile'
import Accounts from './Pages/ManageBankAccounts'
import InstallmentCustomers from './Pages/ManageInstallmentCustomers'
import LogIn from './Auth/SignIn'
import Customers from "./Pages/ManageCustomers"
import Expenses from './Pages/ManageExpenses'
import Khatta from './Pages/ManageKhatta'
import Fees from './Pages/Fees'
import Users from './Pages/Users'
import ManageHostel from './Pages/Hostelrooms'
import Employees from './Pages/Employees'
import Changepassword from './Pages/ChangePassword'
import Pay from "./Pages/Pay"
import Dashboard from "./Pages/Dashboard"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { auth } from './firebase-config1';

const App = () => {

  return (
    <Router>
      <Routes>
      <Route path="/" element={<UserHome />} />
      <Route path="/profile" element={<UserHome />} />
      <Route path="/users" element={<Users />} />
      <Route path="/dashboard" element={<Dashboard />} />
     <Route path="/archivedcustomers" element={<InstallmentCustomers />} />
      <Route path="/pay" element={<Pay />} />
      <Route path="/fees" element={<Fees />} />
      <Route path="/digikhatta" element={<Expenses />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/expenses" element={<Khatta />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/hostel" element={<ManageHostel />} />
      <Route path="/changepassword" element={<Changepassword />} />
</Routes>

    </Router>
  );
};

export default App;
