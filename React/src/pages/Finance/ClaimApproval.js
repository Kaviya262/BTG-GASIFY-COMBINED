import Breadcrumbs from "../../components/Common/Breadcrumb";
import React, { useState } from 'react';
import ManageApproval from './Manageapproval';
import Paymentplanapproval from './Paymentplanapproval';
import PPP from './PPP';
import PPPApproval from './PPPApproval';
import { Container } from "reactstrap";

const ClaimApproval = () => {
    const [selectedType, setSelectedType] = useState('');

    const typeComponents = {
        "Claim Approval": ManageApproval,
        "Payment Plan": Paymentplanapproval,
        "PPP": PPP,
        "PPP Approval": PPPApproval
    };

    const SelectedComponent = selectedType ? typeComponents[selectedType] : null;

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Approval" />
                
                {/* Render a selected child component and pass props */}
                {SelectedComponent && (
                    <SelectedComponent
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                    />
                )}

                {/* Optional: You can show default radio UI initially if nothing selected */}
                {!selectedType && (
                    <ManageApproval
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        isInitial
                    />
                )}
            </Container>
        </div>
    );
};

export default ClaimApproval;
