import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import InternshipDetail from './pages/InternshipDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PostInternship from './pages/PostInternship.jsx';
import ManageApplications from './pages/ManageApplications.jsx';
import ApplicationDetail from './pages/ApplicationDetail.jsx';
import Saved from './pages/Saved.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth, dashboardPath } from './context/AuthContext.jsx';
import Loader from './components/Loader.jsx';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={dashboardPath(user?.role)} replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="boot">
        <Loader />
      </div>
    );
  }
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/internships/:id" element={<InternshipDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/recruiter" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="/recruiter/post" element={<ProtectedRoute roles={['recruiter', 'admin']}><PostInternship /></ProtectedRoute>} />
          <Route path="/recruiter/edit/:id" element={<ProtectedRoute roles={['recruiter', 'admin']}><PostInternship /></ProtectedRoute>} />
          <Route path="/recruiter/applications" element={<ProtectedRoute roles={['recruiter', 'admin']}><ManageApplications /></ProtectedRoute>} />

          <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute roles={['student']}><Saved /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
