import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const AdminLogin = () => {
  const { loginAdmin, ADMIN_EMAIL } = useAdmin();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await loginAdmin(email, password);
    if (error) setError(error);
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-primary/20 shadow-sm">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Admin Login</h1>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-primary font-medium mb-2 block">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-primary font-medium mb-2 block">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg transition-all">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
