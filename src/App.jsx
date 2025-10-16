import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarProvider } from './context/CarContext';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CarList from './pages/CarList';
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking';
import Host from './pages/Host';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import { CityProvider } from './context/CityContext';
import Payment from './pages/Payment';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './routes/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CarProvider>
          <CityProvider>
          <Router>
            <div className="min-h-screen bg-background overflow-x-hidden">
              <Navbar />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<CarList />} />
                <Route path="/cars/:id" element={<CarDetails />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/host" element={<Host />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
              <Footer />
            </div>
          </Router>
          </CityProvider>
        </CarProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
