import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CustomersList from './pages/CustomersList';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import UsersList from './pages/admin/UsersList';
import UserForm from './pages/admin/UserForm';
import Profile from './pages/se/Profile';
import FollowUpsList from './pages/FollowUpsList';
import FollowUpForm from './pages/FollowUpForm';
import InteractionsList from './pages/InteractionsList';
import InteractionForm from './pages/InteractionForm';
import './App.css';

// Layout component with Navbar
const AppLayout = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
};

// Placeholder Dashboard component
const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>CRM Dashboard</h1>
      <p>Welcome to the CRM system. You are logged in.</p>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes wrapped in AppLayout */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/follow-ups" element={<FollowUpsList />} />
            <Route path="/follow-ups/new" element={<FollowUpForm />} />
            <Route path="/follow-ups/:id/edit" element={<FollowUpForm />} />
            <Route path="/interactions" element={<InteractionsList />} />
            <Route path="/interactions/new" element={<InteractionForm />} />
            <Route path="/interactions/:id/edit" element={<InteractionForm />} />
            <Route path="/se/profile" element={<Profile />} />
          </Route>

          {/* Admin Protected Routes wrapped in AppLayout */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/new" element={<UserForm />} />
            <Route path="/admin/users/:id/edit" element={<UserForm />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
