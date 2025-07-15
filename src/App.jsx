import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateGroups from './pages/CreateGroups';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/create-groups" 
        element={
          <ProtectedRoute>
            <CreateGroups />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App; 