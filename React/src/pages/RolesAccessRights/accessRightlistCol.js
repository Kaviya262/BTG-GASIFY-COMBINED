import React from 'react';
import { Link } from 'react-router-dom';
import * as moment from "moment";
import { size, map } from "lodash";



const toLowerCase1 = str => {
    return (
        str === "" || str === undefined ? "" : str.toLowerCase()
    );
};

const ModuleName = (cell) => {
    return cell.value ? cell.value : '';
};

const ModuleCode = (cell) => {
    return cell.value ? cell.value : '';
};
 
export {
    ModuleName,
    ModuleCode
    
};