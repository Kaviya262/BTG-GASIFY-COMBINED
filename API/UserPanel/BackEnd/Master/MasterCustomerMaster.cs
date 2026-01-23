using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackEnd.Master
{
    public class MasterCustomerMaster
    {
        public static string MasterCustomerProcedure => "Proc_MasterCustomer"; // dont need
        public static string MasterCreateUpdateCustomer => "proc_MasterCreateUpdateCustomer";
        public static string MasterGetAllCustomers => "proc_MasterGetAllCustomers";
        public static string MasterGetCustomerById => "proc_MasterGetCustomerById";
        public static string MasterTabList => "proc_MasterCustomerTabList";
        public static string MasterToggleCustomerContactStatus => "proc_MasterToggleCustomerContactStatus";
        public static string MasterToggleCustomerAddressStatus => "proc_MasterToggleCustomerAdressStatus";
        public static string MasterToggleCustomerStatus => "proc_MasterToggleCustomerStatus";
    }
}
