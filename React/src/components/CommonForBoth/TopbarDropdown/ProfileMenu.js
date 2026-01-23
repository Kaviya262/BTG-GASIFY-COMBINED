import React, { Component } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";

const getUserName = () => {
  if (localStorage.getItem("authUser")) {
    const obj = JSON.parse(localStorage.getItem("authUser"))
    return obj;
  }
}
class ProfileMenu extends Component {
  state = { menu: false };
  constructor(props) {
    super(props)
    this.state = {
      menu: false,
      name: "Admin",
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState(prevState => ({
      menu: !prevState.menu,
    }))
  }

  componentDidMount() {
    const userData = getUserName();
    if (userData) {
      // debugger;
      this.setState({ name: userData.username })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.success !== this.props.success) {
      const userData = getUserName();
      if (userData) {
        // debugger;
        this.setState({ name: userData.username })
      }
    }
  }

  handleLogout = () => {
    // clear user session and go to login page
    localStorage.removeItem("authUser");
    sessionStorage.clear();
    this.props.history.push("/login");
  };

  render() {
    const { t, onChangePasswordClick } = this.props;

    return (
      <Dropdown
        isOpen={this.state.menu}
        toggle={this.toggle}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
        >
          <span className="d-none d-xl-inline-block ms-1">
            Welcome, {this.state.name.charAt(0).toUpperCase() + this.state.name.slice(1)}
          </span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu-end">
          {/* NEW: Change Password item */}
          <DropdownItem onClick={onChangePasswordClick}>
            <i className="bx bx-lock-alt font-size-16 align-middle me-1" />
            {t("Change Password")}
          </DropdownItem>

          <DropdownItem divider />

          {/* Existing Logout with session clear */}
          <DropdownItem onClick={this.handleLogout}>
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            {t("Logout")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default withRouter(withTranslation()(ProfileMenu));
