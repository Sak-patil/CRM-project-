import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CustomersList from './pages/CustomersList';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import UsersList from './pages/admin/UsersList';
import UserForm from './pages/admin/UserForm';
import SeProgressView from './pages/admin/SeProgressView';
import Profile from './pages/se/Profile';
import FollowUpsList from './pages/FollowUpsList';
import FollowUpForm from './pages/FollowUpForm';
import InteractionsList from './pages/InteractionsList';
import InteractionForm from './pages/InteractionForm';
import SeDashboard from './pages/SeDashboard';
import AdminDashboard from './pages/AdminDashboard';
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

// Role-aware Dashboard: Admin → AdminDashboard, SE → SeDashboard
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'admin' ? <AdminDashboard /> : <SeDashboard />;
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
            <Route path="/" element={<DashboardRouter />} />
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

          {/* Admin-only Routes */}
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
            <Route path="/admin/users/:id/progress" element={<SeProgressView />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

