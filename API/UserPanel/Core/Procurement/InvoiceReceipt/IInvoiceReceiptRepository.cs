using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseRequisition;

namespace Core.Procurement.InvoiceReceipt
{
    public interface IInvoiceReceiptRepository
    {
        Task<object> GetPONoAutoComplete(int supplier_id, int category_id, int org_id);
        Task<object> GetSupplierGRNAutoComplete(int supplier_id, int category_id, int org_id);
        //Task<object> GetSupplierPODetails(int supplier_id, int category_id, int org_id);
        Task<object> getSupplierPODetailsView(string po_id, int org_id,int cid);
        Task<object> GetInvoiceReceiptAll(Int32 supplierid, int org_id,int branchid);
        Task<object> updateSupplierPODetailsView(InvoiceEntry obj);
        Task<object> GenerateInvoiceReceipt(InvoiceGenerate obj);
        Task<object> InvoiceReceiptAttachment(int receiptnote_hdr_id, string file_path, string file_name);
        Task<object> AddIRN(InvoiceEntry Obj);
        Task<object> getSupplierPODetailsEditView(Int32 po_id, int org_id);
        Task<object> getSearchbySupplierduedate(string branchid, int orgid,int supplierid,string fromdate,string todate);
        Task<object> getIRNGRNDetails(int receiptnote_hdr_id);
        Task<object> getAddInvoiceReceiptDetails(string branchid, string orgid,string fromdate, string todate);
        Task<object> AddIRNGRN(InvoiceEntry1 Obj);
        Task<object> getIRNDetails(string branchid, string orgid, string fromdate, string todate);
        Task<object> InvoiceReceiptDocAttachment(List<InvoiceReceiptAttachment> list);
        Task<object> GenerateInvoiceReceiptIRN(InvoiceEntry1 Obj);
    }
}
