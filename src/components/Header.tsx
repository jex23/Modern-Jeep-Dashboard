import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <h1 style={h1Style}>Moder Bus Route Tracking</h1>
    </header>
  );
};

// Inline styles
const headerStyle = {
  backgroundColor: '#007bff', // Blue background
  color: 'white',              // White text
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '50px',              // Adjust height as needed
  width: '100%',               // Full width
};

const h1Style = {
  margin: 0, // Remove default margin
};

export default Header;
