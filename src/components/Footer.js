import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer className="footer fixed-bottom bg-dark text-white pt-4 pb-3 mt-auto border-top border-primary border-3">
      <Container>
        <Row className="mb-1 g-4">
          <Col md={6}>
            <div className="d-flex flex-column align-items-center pe-md-3">
              <h5 className="text-gradient mb-2">Furkan</h5>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex flex-column align-items-center ps-md-3">
              <h5 className="text-gradient mb-2">Selim</h5>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
