import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout Shell
import Layout from './components/layout/Layout';

// AI Tool Pages
import Dashboard from './pages/Dashboard';
import FeatureHistory from './pages/FeatureHistory';
import WriteArticle from './pages/WriteArticle';
import BlogTitles from './pages/BlogTitles';
import Generateimages from './pages/Generateimages';
import RemoveBackground from './pages/RemoveBackground';
import RemoveObject from './pages/RemoveObject';
import ReviewResume from './pages/ReviewResume';
import StudySessions from './pages/StudySessions';

const App = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Global Toast Notification Provider */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
        }} 
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes (Redirect to dashboard if already logged in) */}
        <Route path="/login" element={user ? <Navigate to="/ai" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/ai" replace /> : <Register />} />

        {/* Protected Dashboard Shell */}
        {/* Note: The Layout.jsx component already has built-in auth protection and a loading state */}
        <Route path="/ai" element={<Layout />}>
          {/* Default view when navigating to /ai */}
          <Route index element={<Dashboard />} />
          <Route path="history/:category" element={<FeatureHistory />} />
          
          {/* AI Tools */}
          <Route path="study-sessions" element={<StudySessions />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<Generateimages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
          
          {/* Catch-all for inside the dashboard (redirects back to main dashboard) */}
          <Route path="*" element={<Navigate to="/ai" replace />} />
        </Route>

        {/* Global Catch-all (redirects 404s to home) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;