import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export default AdminRoute;
