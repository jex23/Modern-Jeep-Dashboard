// src/pages/About.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const About: React.FC = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1>About Us</h1>
          <p>This page provides information about our app.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
