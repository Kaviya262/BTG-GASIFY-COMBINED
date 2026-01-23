import PropTypes from "prop-types";
import React, { Component } from "react";
import SimpleBar from "simplebar-react";
import MetisMenu from "metismenujs";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";

class SidebarContent extends Component {
    constructor(props) {
        super(props);
        this.refDiv = React.createRef();
    }

    componentDidMount = async () => {
        this.loadMenuDetails();
    }

    state = {
        dynamicMenu: { menus: [] }
    };

    loadMenuDetails = async () => {
        // 1. Load existing data
        let menuData = JSON.parse(localStorage.getItem("userMenu"));

        // Safety check if localstorage is empty
        if (!menuData) {
            menuData = { menus: [] };
        }

        // ---------------------------------------------------------
        // 2. INJECT BANK BOOK ENTRIES INTO FINANCE
        // ---------------------------------------------------------
        const financeModule = menuData.menus.find(m => m.moduleName === "Finance");

        if (financeModule) {
            const alreadyExists = financeModule.screen.find(s => s.screenName === "Bank Book Entries");
            if (!alreadyExists) {
                financeModule.screen.push({
                    screenId: 99902,
                    screenName: "Bank Book Entries",
                    url: "/bank-book-entries",
                    icon: "bx bx-book",
                    module: []
                });
            }
        }

        // ---------------------------------------------------------
        // 3. INJECT NEW REPORTS (AR BOOK DO, SALES ITEM WISE, SALES CUSTOMER WISE)
        // ---------------------------------------------------------
        const reportsModule = menuData.menus.find(m => m.moduleName === "Reports");

        if (reportsModule) {
            // A. AR Book DO (Your existing logic)
            const arBookDoExists = reportsModule.screen.find(s => s.screenName === "AR Book DO");
            if (!arBookDoExists) {
                const arBookIndex = reportsModule.screen.findIndex(s => s.screenName === "AR Book");
                const newArBookDo = {
                    screenId: 99903,
                    screenName: "AR Book DO",
                    url: "/ar-book-do",
                    icon: "bx bx-file",
                    module: []
                };

                if (arBookIndex !== -1) {
                    reportsModule.screen.splice(arBookIndex + 1, 0, newArBookDo);
                } else {
                    reportsModule.screen.push(newArBookDo);
                }
            }

            // B. Inject Sales Item Wise & Sales Customer Wise (NEW TASK)
            const newReports = [
                {
                    screenId: 99905,
                    screenName: "Sales Item Wise",
                    url: "/sales-item-wise",
                    icon: "bx bx-list-ul",
                    module: []
                },
                {
                    screenId: 99906,
                    screenName: "Sales Customer Wise",
                    url: "/sales-customer-wise",
                    icon: "bx bx-user",
                    module: []
                }
            ];

            newReports.forEach(report => {
                if (!reportsModule.screen.find(s => s.screenName === report.screenName)) {
                    reportsModule.screen.push(report);
                }
            });
        }

        // ---------------------------------------------------------
        // 4. Your existing Test Menu Logic (Mktg Verify)
        // ---------------------------------------------------------
        const testMenu = {
            moduleId: 9999,
            moduleName: "Mktg Verify",
            icon: "bx bx-test-tube",
            screen: [
                {
                    screenId: 99901,
                    screenName: "Verify Customer",
                    url: "/verify-customer",
                    icon: "bx bx-file",
                    module: []
                }
            ]
        };

        if (!menuData.menus.find(m => m.moduleId === 9999)) {
            menuData.menus.push(testMenu);
        }

        // ---------------------------------------------------------
        // 5. RESTRUCTURE: MOVE REPORTS -> FINANCE
        // ---------------------------------------------------------
        const reportsMod = menuData.menus.find(m => m.moduleName === "Reports");
        const financeMod = menuData.menus.find(m => m.moduleName === "Finance");

        if (reportsMod && financeMod) {
            const keepInReports = [
                "Ledger",
                "TrialBalance",
                "Profit & Loss",
                "Balance Sheet",
                // Keep the new reports we just added in Reports module
                "Sales Item Wise",
                "Sales Customer Wise"
            ];

            const removeFromReports = ["Bank Reconciliation"];
            const newReportsScreens = [];

            reportsMod.screen.forEach(item => {
                if (keepInReports.includes(item.screenName)) {
                    newReportsScreens.push(item);
                } else if (removeFromReports.includes(item.screenName)) {
                    // Remove
                } else {
                    // Move to Finance
                    const existsInFinance = financeMod.screen.find(s => s.screenName === item.screenName);
                    if (!existsInFinance) {
                        financeMod.screen.push(item);
                    }
                }
            });

            reportsMod.screen = newReportsScreens;
        }

        // ---------------------------------------------------------
        // 6. REMOVE 'TAX REPORT' FROM FINANCE
        // ---------------------------------------------------------
        if (financeMod) {
            financeMod.screen = financeMod.screen.filter(item => item.screenName !== "Tax Report");
        }

        // ---------------------------------------------------------
        // 7. SORT FINANCE AND REPORTS ALPHABETICALLY (ASCENDING)
        // ---------------------------------------------------------
        if (financeMod && financeMod.screen) {
            financeMod.screen.sort((a, b) => a.screenName.localeCompare(b.screenName));
        }

        if (reportsMod && reportsMod.screen) {
            reportsMod.screen.sort((a, b) => a.screenName.localeCompare(b.screenName));
        }

        // 8. Update State
        this.setState({ dynamicMenu: menuData || [] }, () => {
            this.initMenu();
        });
    };

    componentDidUpdate(prevProps, prevState, ss) {
        if (this.props.type !== prevProps.type) {
            this.initMenu();
        }
    }

    initMenu() {
        new MetisMenu("#side-menu");
        let matchingMenuItem = null;
        const ul = document.getElementById("side-menu");
        if (ul) {
            const items = ul.getElementsByTagName("a");
            for (let i = 0; i < items.length; ++i) {
                if (this.props.location.pathname === items[i].pathname) {
                    matchingMenuItem = items[i];
                    break;
                }
            }
            if (matchingMenuItem) {
                this.activateParentDropdown(matchingMenuItem);
            }
        }
    }

    scrollElement = item => {
        setTimeout(() => {
            if (this.refDiv.current !== null) {
                if (item) {
                    const currentPosition = item.offsetTop;
                    if (currentPosition > window.innerHeight) {
                        if (this.refDiv.current)
                            this.refDiv.current.getScrollElement().scrollTop =
                                currentPosition - 300;
                    }
                }
            }
        }, 300);
    };

    activateParentDropdown = item => {
        item.classList.add("active");
        const parent = item.parentElement;
        const parent2El = parent.childNodes[1];
        if (parent2El && parent2El.id !== "side-menu") {
            parent2El.classList.add("mm-show");
        }
        if (parent) {
            parent.classList.add("mm-active");
            const parent2 = parent.parentElement;
            if (parent2) {
                parent2.classList.add("mm-show");
                const parent3 = parent2.parentElement;
                if (parent3) {
                    parent3.classList.add("mm-active");
                    parent3.childNodes[0].classList.add("mm-active");
                    const parent4 = parent3.parentElement;
                    if (parent4) {
                        parent4.classList.add("mm-show");
                        const parent5 = parent4.parentElement;
                        if (parent5) {
                            parent5.classList.add("mm-show");
                            parent5.childNodes[0].classList.add("mm-active");
                        }
                    }
                }
            }
            this.scrollElement(item);
            return false;
        }
        this.scrollElement(item);
        return false;
    };

    renderDynamicMenu = (menus) => {
        return menus.map((menu) => (
            <li key={menu.moduleId}>
                <Link to="/#" className="has-arrow">
                    <i className={menu.icon}></i>
                    <span>{menu.moduleName}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                    {menu.screen.map((screen) => (
                        <React.Fragment key={screen.screenId}>
                            <li>
                                <Link to={screen.url}>
                                    <i className={screen.icon}></i>
                                    {screen.screenName}
                                </Link>
                            </li>
                            {screen.module && screen.module.length > 0 && screen.module.map((subModule) => (
                                <li key={subModule.moduleId}>
                                    <Link to="/#" className="has-arrow">
                                        <i className={subModule.icon}></i>
                                        {subModule.moduleName}
                                    </Link>
                                    <ul className="sub-menu" aria-expanded="false">
                                        {subModule.screen.map((nestedScreen) => (
                                            <li key={nestedScreen.screenId}>
                                                <Link to={nestedScreen.url}>
                                                    <i className={nestedScreen.icon}></i>
                                                    {nestedScreen.screenName}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </React.Fragment>
                    ))}
                </ul>
            </li>
        ));
    };

    render() {
        return (
            <React.Fragment>
                <SimpleBar className="h-100" ref={this.refDiv}>
                    <div id="sidebar-menu">
                        <ul className="metismenu list-unstyled" id="side-menu">
                            <li className="menu-title"></li>
                            {this.state.dynamicMenu && this.state.dynamicMenu.menus && this.renderDynamicMenu(this.state.dynamicMenu.menus)}
                        </ul>
                    </div>
                </SimpleBar>
            </React.Fragment>
        );
    }
}

SidebarContent.propTypes = {
    location: PropTypes.object,
    t: PropTypes.any,
    type: PropTypes.string,
};

export default withRouter(withTranslation()(SidebarContent));