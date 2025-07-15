import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../api';

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  // In a real application, you would also want to verify the token's validity
  // with the server here. For this example, we'll just check for its existence.
  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 