using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Supplier
{
    public class SupplierMaster
    {
        public supplier Master { get; set; }
        public List<SupplierCurrency> Currency { get; set; }
    }
    public class supplier
    {
        public int SupplierId { get; set; }
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public int SupplierCategoryId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string WebSite { get; set; } = string.Empty;
        public string UENNO { get; set; } = string.Empty;

        public string Bank1 { get; set; }
        public string Bank1_Code { get; set; } = string.Empty;
        public string Bank1_AccountNumber { get; set; } = string.Empty;

        public string Bank2 { get; set; }
        public string Bank2_Code { get; set; } = string.Empty;
        public string Bank2_AccountNumber { get; set; } = string.Empty;

        public int PajakPph_Perc { get; set; }
        public decimal UEN_Number { get; set; }
        public decimal CreditLimit { get; set; }

        public int SupplierBlockId { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string PostalCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int userid { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedIP { get; set; } = string.Empty;        
        public DateTime LastModifiedDate { get; set; }
        public string LastModifiedIP { get; set; } = string.Empty;        
        public bool IsActive { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }      

        public int taxid { get; set; }

       
        //public string statename { get; set; }       
        //public string? cityname { get; set; }
        public int paymenttermid { get; set; }
        public int deliverytermid { get; set; }

    }

    public class SupplierCurrency
    {
        public int Id { get; set; }
        public int SupplierId { get; set; }
        public int CurrencyId { get; set; }

        public int userid { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedIP { get; set; } = string.Empty;

        public DateTime LastModifiedDate { get; set; }
        public string LastModifiedIP { get; set; } = string.Empty;

        public bool IsActive { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        
    }
}