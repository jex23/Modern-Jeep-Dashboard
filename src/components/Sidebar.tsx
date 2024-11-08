import React from "react";
import { Nav } from "react-bootstrap";
import {
  FaHome,
  FaUser,
  FaTrain,
  FaCar,
  FaSignOutAlt,
  FaMoneyBillWave,
} from "react-icons/fa"; // Importing icons from react-icons
import { useNavigate } from "react-router-dom"; // Importing useNavigate

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    onLogout(); // Call the logout function passed as a prop
    navigate("/"); // Navigate back to login
  };

  return (
    <div className="sidebar p-3">
      <Nav className="flex-column">
        <Nav.Link href="/home" className="nav-card">
          <FaHome className="me-2" />
          <span>Home</span>
        </Nav.Link>
        <Nav.Link href="/fare" className="nav-card">
          <FaMoneyBillWave className="me-2" />
          <span>Fare</span>
        </Nav.Link>
        <Nav.Link href="/user" className="nav-card">
          <FaUser className="me-2" />
          <span>User</span>
        </Nav.Link>
        <Nav.Link href="/conductor" className="nav-card">
          <FaTrain className="me-2" />
          <span>Conductor</span>
        </Nav.Link>
        <Nav.Link href="/for-pickup" className="nav-card">
          <FaCar className="me-2" />
          <span>For Pickup</span>
        </Nav.Link>
        <Nav.Link
          onClick={handleLogout}
          className="nav-card"
          style={{ cursor: "pointer" }}
        >
          <FaSignOutAlt className="me-2" />
          <span>Logout</span>
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
