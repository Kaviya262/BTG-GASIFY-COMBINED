using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.Master.Currency
{
    public class CurrencyItem
    {
        public class CurrencyItemMain
        { // declare
            public CurrencyItemHeader Header { get; set; }
            public CurrencyItemStatus Detail { get; set; }
            public Int32 CurrencyId { get; set; }
            public string CurrencyCode { get; set; }
            public string CurrencyName { get; set; }

        }
        public class CurrencyItemStatus
        {
            public Int32 CurrencyId { get; set; }
            public Int32 UserId { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }
        }

        public class CurrencyItemHeader
        {
            public Int32 CurrencyId { get; set; }
            public string CurrencyCode { get; set; }
            public string CurrencyName { get; set; }
            public string CurrencySymbol { get; set; }
            public decimal ExchangeRate { get; set; }
            public DateTime EffectiveFromdate { get; set; }
            public Int32 UserId { get; set; }
            public DateTime CreatedDate { get; set; }
            public string  CreatedIP { get; set; }   
            //public string LastModifiedBy { get; set; }
            //public DateTime LastModifiedDate { get; set; }
            //public string LastModifiedIP { get; set; }
            public int OrgId { get; set; }
            public int BranchId { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }            
            public bool IsBaseCurrency {  get; set; }
            //declare for log table insert
            [JsonIgnore]
            public string? Prev_CurrencyCode { get; set; }
            [JsonIgnore]
            public string? Prev_CurrencyName { get; set; }
            [JsonIgnore]
            public string? Prev_CurrencySymbol { get; set; }
            [JsonIgnore]
            public decimal? Prev_ExchangeRate { get; set; }
            [JsonIgnore]
            public DateTime? Prev_EffectiveFromdate { get; set; }


        }

    }
}
