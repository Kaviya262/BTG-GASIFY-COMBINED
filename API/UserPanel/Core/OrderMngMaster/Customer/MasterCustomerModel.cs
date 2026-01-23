using System.ComponentModel.DataAnnotations;
using Core.Models;
using MediatR;

namespace Core.OrderMngMaster.Customer
{
    public class MasterCustomerModel
    {
        public int TabId { get; set; }
        public MasterCustomer Customer { get; set; } = null!;
        public List<MasterCustomeraddress> CustomerAddresses { get; set; } = null!;
        public List<MasterCustomercontact> CustomerContacts { get; set; } = null!;
    }
    public class GetAllCustomerQuery : IRequest<object>
    {
        public string CustomerName { get; set; } = null!;
        public string FromDate { get; set; } = null!;
        public string ToDate { get; set; } = null!;
        public string TabId { get; set; }
        public int CustomerId { get; set; }
        public int ContactId { get; set; }

    }
    public class MasterCustomer
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? Email { get; set; }
        public int SalesPersonId { get; set; }
        public int CountryId { get; set; }
        public string? Cc_Email { get; set; } = null!;
        public string? Remarks { get; set; }
        public string? PhoneNumber { get; set; } = null!;
        public string? Fax { get; set; }
        public int? UserId { get; set; }
        public string? UserIP { get; set; }
        public bool IsActive { get; set; }
        public int? OrgId { get; set; }
        public int? BranchId { get; set; }
        public int BusinessFormId { get; set; }
        public int BusinessFieldId { get; set; }
        public int CityId { get; set; }
        public int ZoneId { get; set; }
        public int? CustomerId { get; set; }
        public int? ContactId { get; set; }
        public int? AddressId { get; set; }
        public bool IsCustomer { get; set; }
        public bool PoNumber { get; set; }
        public string? LegalDocumentPath { get; set; }
        public int? CreditLimitinIDR { get; set; }

    }


    public class MasterCustomeraddress
    {
        public int AddressId { get; set; }

        public int AddressTypeId { get; set; }
        public string? ContactName { get; set; }
        public int ContactId { get; set; }

        public int CustomerId { get; set; }

        public string Location { get; set; } = null!;

        public string? Address { get; set; }
        public int UserId { get; set; }
        public int BranchId { get; set; }
        public string? UserIP { get; set; }
        //public DateTime? CreatedDate { get; set; }

        //public string? CreatedIp { get; set; }

        //public int? LastModifiedBy { get; set; }

        //public DateTime? LastModifiedDate { get; set; }

        //public int? LastModifiedIp { get; set; }

        public bool IsActive { get; set; }
    }

    public class MasterCustomercontact
    {
        public int ContactId { get; set; }

        public int CustomerId { get; set; }

        public string Department { get; set; } = null!;

        public string? HandPhone { get; set; }

        [Required]
        public string Email { get; set; }

        public string? DeskPhone { get; set; }
        public int UserId { get; set; }
        public string? UserIP { get; set; }
        //public DateTime? CreatedDate { get; set; }

        //public string? CreatedIp { get; set; }

        //public int? LastModifiedBy { get; set; }

        //public DateTime? LastModifiedDate { get; set; }

        //public int? LastModifiedIp { get; set; }
        public int BranchId { get; set; }
        public bool IsActive { get; set; }

        public string Contactname { get; set; } = null!;
    }

}
