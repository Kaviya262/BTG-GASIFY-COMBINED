import React, { Component } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle } from "reactstrap";

class WarehouseReport extends Component {
  render() {
    document.title = "Warehouse Report | BTG Gas & Dashboard Template";
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <CardTitle className="mb-4 h4">Warehouse Report</CardTitle>
                    <p className="text-muted">
                      Warehouse analytics and reports will be displayed here.
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

export default WarehouseReport;
