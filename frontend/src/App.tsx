import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Navbar from './components/navbar.tsx'
import ForgotPassword from './pages/forgotPassword.tsx'
import ResetPassword from './pages/resetPassword.tsx'
import DeviceInfoSubmission from './pages/deviceInfoSubmission.tsx'
import AdminPage from './pages/adminPage.tsx'
import Profile from './pages/profile.tsx'
import AboutUs from './pages/aboutUs.tsx'
import ResultsPage from './pages/resultsPage.tsx'
import Contact from './pages/contact.tsx'
import Home from './pages/home.tsx'
import ThankYou from './pages/thankYou.tsx'

/**
 * App Component
 * 
 * The root of the application. Sets up routing for all pages using React Router.
 * Includes a persistent Navbar and defines each route's path and corresponding component.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Top navigation bar visible on all routes */}
      <Navbar />

      {/* Define route paths and associated page components */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<AboutUs/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/device-info-submission"
          element={<DeviceInfoSubmission />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="/results" element={<ResultsPage/>} />
        <Route path="/thank-you" element={<ThankYou/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
