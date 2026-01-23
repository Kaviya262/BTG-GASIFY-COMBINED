
import React, { useState, useEffect } from 'react';
import { Container } from "reactstrap"; 
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox } from 'primereact/tristatecheckbox'; 

const ManageCustomer = () => {
    const [customers, setCustomers] = useState(null);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [representatives] = useState([
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ]);
    const [statuses] = useState(['unqualified', 'qualified', 'new', 'negotiation', 'renewal']);

    const getSeverity = (status) => {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warning';

            case 'renewal':
                return null;
        }
    };

    useEffect(() => { 
        initFilters();
    }, []);

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);

    const getCustomers = () => {
        return [
            {id:1000,name:"James Butt",country:{name:"Algeria",code:"dz"},company:"Benton, John B Jr","date":"2015-09-13",status:"unqualified",verified:true,activity:17,representative:{name:"Ioni Bowcher","image":"ionibowcher.png"},"balance":70663},
            {id:1001,name:"Josephine Darakjy",country:{name:"Egypt",code:"eg"},company:"Chanay, Jeffrey A Esq","date":"2019-02-09",status:"proposal",verified:true,activity:0,representative:{name:"Amy Elsner","image":"amyelsner.png"},"balance":82429},{id:1002,name:"Art Venere",country:{name:"Panama",code:"pa"},company:"Chemel, James L Cpa","date":"2017-05-13",status:"qualified",verified:false,activity:63,representative:{name:"Asiya Javayant","image":"asiyajavayant.png"},"balance":28334},
            {id:1003,name:"Lenna Paprocki",country:{name:"Slovenia",code:"si"},company:"Feltz Printing Service","date":"2020-09-15",status:"new",verified:false,activity:37,representative:{name:"Xuxue Feng","image":"xuxuefeng.png"},"balance":88521},{id:1004,name:"Donette Foller",country:{name:"South Africa",code:"za"},company:"Printing Dimensions","date":"2016-05-20",status:"proposal",verified:true,activity:33,representative:{name:"Asiya Javayant","image":"asiyajavayant.png"},"balance":93905},
            {id:1005,name:"Simona Morasca",country:{name:"Egypt",code:"eg"},company:"Chapman, Ross E Esq","date":"2018-02-16",status:"qualified",verified:false,activity:68,representative:{name:"Ivan Magalhaes","image":"ivanmagalhaes.png"},"balance":50041},
            {id:1006,name:"Mitsue Tollner",country:{name:"Paraguay",code:"py"},company:"Morlong Associates","date":"2018-02-19",status:"renewal",verified:true,activity:54,representative:{name:"Ivan Magalhaes","image":"ivanmagalhaes.png"},"balance":58706},
            {id:1007,name:"Leota Dilliard",country:{name:"Serbia",code:"rs"},company:"Commercial Press","date":"2019-08-13",status:"renewal",verified:true,activity:69,representative:{name:"Onyama Limba","image":"onyamalimba.png"},"balance":26640},
            {id:1008,name:"Sage Wieser",country:{name:"Egypt",code:"eg"},company:"Truhlar And Truhlar Attys","date":"2018-11-21",status:"unqualified",verified:true,activity:76,representative:{name:"Ivan Magalhaes","image":"ivanmagalhaes.png"},"balance":65369},
            {id:1009,name:"Kris Marrier",country:{name:"Mexico",code:"mx"},company:"King, Christopher A Esq","date":"2015-07-07",status:"proposal",verified:false,activity:3,representative:{name:"Onyama Limba","image":"onyamalimba.png"},"balance":63451}];
    };
   
    
    const formatDate = (value) => {
        const date = new Date(value); // Convert the value to a Date object
        if (isNaN(date.getTime())) { // Check if the value is a valid date
            return ''; // Return a fallback value (or handle invalid date case)
        }
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            verified: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
            
        );
    };

    const countryBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <img alt="flag" src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${rowData.country.code}`} style={{ width: '24px' }} />
                <span>{rowData.country.name}</span>
            </div>
        );
    };

    const filterClearTemplate = (options) => {
        return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>;
    };

    const filterApplyTemplate = (options) => {
        return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>;
    };

    const filterFooterTemplate = () => {
        return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
    };

    const representativeBodyTemplate = (rowData) => {
        const representative = rowData.representative;

        return (
            <div className="flex align-items-center gap-2">
                <img alt={representative.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${representative.image}`} width="32" />
                <span>{representative.name}</span>
            </div>
        );
    };

    const representativeFilterTemplate = (options) => {
        return <MultiSelect value={options.value} options={representatives} itemTemplate={representativesItemTemplate} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />;
    };

    const representativesItemTemplate = (option) => {
        return (
            <div className="flex align-items-center gap-2">
                <img alt={option.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`} width="32" />
                <span>{option.name}</span>
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    };

    const dateFilterTemplate = (options) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
    };

    const balanceBodyTemplate = (rowData) => {
        return formatCurrency(rowData.balance);
    };

    const balanceFilterTemplate = (options) => {
        return <InputNumber value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} mode="currency" currency="USD" locale="en-US" />;
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear />;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };

    const activityBodyTemplate = (rowData) => {
        return <ProgressBar value={rowData.activity} showValue={false} style={{ height: '6px' }}></ProgressBar>;
    };

    const activityFilterTemplate = (options) => {
        return (
            <React.Fragment>
                <Slider value={options.value} onChange={(e) => options.filterCallback(e.value)} range className="m-3"></Slider>
                <div className="flex align-items-center justify-content-between px-2">
                    <span>{options.value ? options.value[0] : 0}</span>
                    <span>{options.value ? options.value[1] : 100}</span>
                </div>
            </React.Fragment>
        );
    };

    const verifiedBodyTemplate = (rowData) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.verified, 'text-red-500 pi-times-circle': !rowData.verified })}></i>;
    };

    const verifiedFilterTemplate = (options) => {
        return (
            <div className="flex align-items-center gap-2">
                <label htmlFor="verified-filter" className="font-bold">
                    Verified
                </label>
                <TriStateCheckbox inputId="verified-filter" value={options.value} onChange={(e) => options.filterCallback(e.value)} />
            </div>
        );
    };

    const header = renderHeader();

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Utility" breadcrumbItem="Manage Customers" />
        <div className="card">
            <DataTable value={customers} paginator showGridlines rows={10} loading={loading} dataKey="id" 
                    filters={filters} globalFilterFields={['name', 'country.name', 'representative.name', 'balance', 'status']} header={header}
                    emptyMessage="No customers found." onFilter={(e) => setFilters(e.filters)}>
                <Column field="name" header="name" filter filterPlaceholder="Search by name" />
                <Column header="country" filterField="country.name" body={countryBodyTemplate}
                    filter filterPlaceholder="Search by country" filterClear={filterClearTemplate} 
                    filterApply={filterApplyTemplate} filterFooter={filterFooterTemplate} />
                <Column header="Agent" filterField="representative" showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '14rem' }}
                    body={representativeBodyTemplate} filter filterElement={representativeFilterTemplate} />
                <Column header="Date" filterField="date" dataType="date"  body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                <Column header="Balance" filterField="balance" dataType="numeric"  body={balanceBodyTemplate} filter filterElement={balanceFilterTemplate} />
                <Column field="status" header="status" filterMenuStyle={{ width: '14rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} />
                <Column field="activity" header="activity" showFilterMatchModes={false} body={activityBodyTemplate} filter filterElement={activityFilterTemplate} />
                <Column field="verified" header="verified" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={verifiedBodyTemplate} filter filterElement={verifiedFilterTemplate} />
            </DataTable>
        </div>
        </Container>
            </div>
        </React.Fragment>
    );
};

export default ManageCustomer;
