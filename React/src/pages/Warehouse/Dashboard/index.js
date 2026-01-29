import React, { Component } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle } from "reactstrap";

class WarehouseDashboard extends Component {
  render() {
    document.title = "Warehouse Dashboard | BTG Gas & Dashboard Template";
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <CardTitle className="mb-4 h4">Warehouse Dashboard</CardTitle>
                    <p className="text-muted">
                      Dashboard content for warehouse management will be displayed here.
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

export default WarehouseDashboard;
