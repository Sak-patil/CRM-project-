import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please provide email and password');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome back</h2>
        <p>Sign in to manage your customer relationships.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="role-selector" style={{ display: 'flex', marginBottom: '20px' }} aria-label="Sign-in role preview">
          <button 
            type="button" 
            onClick={() => setSelectedRole('admin')}
            className={selectedRole === 'admin' ? 'role-choice is-selected' : 'role-choice'}
          >
            Administrator
          </button>
          <button 
            type="button" 
            onClick={() => setSelectedRole('sales')}
            className={selectedRole === 'sales' ? 'role-choice is-selected' : 'role-choice'}
          >
            Sales executive
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
