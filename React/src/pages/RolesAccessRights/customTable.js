import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { useTable, useGlobalFilter, useAsyncDebounce, useSortBy, useFilters, useExpanded, usePagination,} from "react-table";
import { Table, Row, Col, Button, Input } from "reactstrap"; 

function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = React.useState(globalFilter);
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined);
    }, 200);
 
        return (
            <Col sm={4}>
            <div className="search-box me-2 mb-2 d-inline-block">
                <div className="position-relative">
                <label htmlFor="search-bar-0" className="search-label">
                    <span id="search-bar-0-label" className="sr-only">
                    Search this table
                    </span>
                    <input
                    onChange={e => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                    id="search-bar-0"
                    type="text"
                    className="form-control"
                    placeholder={`${count} records...`}
                    value={value || ""}
                    />
                </label>
                <i className="bx bx-search-alt search-icon"></i>
                </div>
            </div>
            </Col>
        );
}

const CustomTable = ({ 
    columns, 
    data, 
    isGlobalFilter, 
    isAddOptions, 
    isAddUserList, 
    handleOrderClicks, 
    handleUserClick, 
    handleCustomerClick, 
    handleSave, 
    isAddCustList, 
    customPageSize, 
    className, 
    customPageSizeOptions
    }) => {
        const {
            getTableProps,
            getTableBodyProps,
            headerGroups,
            page,
            prepareRow,
            canPreviousPage,
            canNextPage,
            pageOptions,
            pageCount,
            gotoPage,
            nextPage,
            previousPage,
            setPageSize,
            state,
            preGlobalFilteredRows,
            setGlobalFilter,
            state: { pageIndex, pageSize },
        } = useTable({
            columns,
            data, 
            initialState: { 
                pageIndex: 0, 
                pageSize: customPageSize,
                sortBy: [
                    {
                        id: columns[0].accessor,
                        desc: false,
                    },
                ],
            },
        },
        useGlobalFilter,
        useFilters,
        useSortBy,
        useExpanded,
        usePagination
    );

    const generateSortingIndicator = column => {
        //return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : "";
        column.isSorted ? (column.isSortedDesc ? " " : " ") : "";
    };

    const onChangeInSelect = event => {
        setPageSize(Number(event.target.value));
    }; 

    const onChangeInInput = event => {
        const page = event.target.value ? Number(event.target.value) - 1 : 0;
        gotoPage(page);
    };
    
    return (
        <Fragment> 

        <div className="table-responsive react-table">
            <Table bordered hover {...getTableProps()} className={className}>
                <thead className="table-light table-nowrap">
                    {headerGroups.map(headerGroup => (
                        <tr key={`header-${headerGroup.id}`} {...headerGroup.getHeaderGroupProps()} >
                            {headerGroup.headers.map(column => (
                            <th key={`header-col-${column.id}`} style={{ width: column.Header !== "Module Name" ? "10%" : "", textAlign: column.Header !== "Module Name" ? "center" : ""}}>
                                <div className="mb-2" {...column.getSortByToggleProps()}>
                                {column.render("Header")} 
                                {generateSortingIndicator(column)}
                                </div> 
                            </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                    {page.map(row => {
                        prepareRow(row);
                        return ( 
                            <Fragment key={row.getRowProps().key}>
                            <tr key={`header-col-${row.id}`}>
                                {row.cells.map((cell, index) => {
                                    return (
                                        <React.Fragment key={cell.id}>
                                        <td {...cell.getCellProps()} >
                                            {cell.render("Cell")}
                                        </td> 
                                        </React.Fragment>
                                    );
                                })} 
                            </tr>
                            </Fragment>
                        );
                    })}
                </tbody>
            </Table>
        </div> 
        </Fragment>
    );
};

CustomTable.propTypes = {
    preGlobalFilteredRows: PropTypes.any,
};

export default CustomTable;
