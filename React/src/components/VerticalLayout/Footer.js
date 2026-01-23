import React, { Component } from "react"
import { Row, Col } from "reactstrap"

class Footer extends Component {
  render() {
    return (
      <React.Fragment>
        <footer className="footer">
          <div className="container-fluid">
            <Row>
              <Col sm={6}> Copyright © {new Date().getFullYear()} All Rights Reserved.                                                                                              1.0.0.1</Col>
             
            </Row>
          </div>
        </footer>
      </React.Fragment>
    )
  }
}

export default Footer;