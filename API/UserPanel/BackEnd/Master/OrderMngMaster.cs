using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackEnd.Master
{
    public class OrderMngMaster
    {
        public static string OrderManagementMasterProcedure => "proc_commondata";
        public static string BarcodeProcedure => "proc_barcode";

        public static string GetCylinderSizeByBranch => "GetCylinderSizeByBranch";
        public static string GetGasCodeByBranch => "GetGasCodeByBranch";
        public static string AutentiationProedure => "proc_autnentication";
        public static string GetCustomerContactsLookup => "proc_GetCustomerContactsLookup";
        public static string MastergetPalletType => "proc_mastergetPalletType";
        public static string GetGasCodePallet => "proc_gascodepallet";
        public static string BarcodePacking => "proc_GetBarcodeDetails";
        public static string GetBank => "proc_GetBank";
    }
}
