import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import User from './pages/Users';
import Conductor from './pages/Conductors';
import ForPickup from './pages/ForPickup';
import Fare from './pages/Fare';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Retrieve initial authentication state from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    // Persist authentication state in localStorage when it changes
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false); // Set authentication state to false
  };

  return (
    <Router>
      <div>
        {isAuthenticated ? (
          <div className="d-flex">
            <Sidebar onLogout={handleLogout} /> {/* Pass the logout function */}
            <div className="content w-100">
              <Header />
              <div className="container">
                <Routes>
                  <Route path="/" element={<Navigate to="/home" />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/user" element={<User />} />
                  <Route path="/conductor" element={<Conductor />} />
                  <Route path="/for-pickup" element={<ForPickup />} />
                  <Route path="/fare" element={<Fare />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </div>
        ) : (
          <Routes>
            <Route
              path="*"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
