using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Core.Shared
{
    public class ExcellSheet
    {
        public static IEnumerable<dynamic> FilterDynamicList(List<dynamic> list, string propertyName, object value)
        {
            // Use LINQ to filter dynamically based on property name and value
            return list.Where(item =>
            {
                var propertyValue = item.customerid;
                return propertyValue != null && propertyValue.Equals(value);
            }).ToList();
        }
        public async Task<ExcelSheetItems> DownloadExcelWithMultipleSheet(dynamic Obj)
        {

            ExcelSheetItems Data = new ExcelSheetItems(); 
          
            using (var workbook = new XLWorkbook())
            {
                for (int l = 0; l < Obj[0].Count; l++)
                {
                        var sdsdf = Obj[0][l].customerid;
                    var datalist = FilterDynamicList(Obj[1], "customerid", Obj[0][l].customerid);
                    // Create the first sheet
                    var sheet1 = workbook.Worksheets.Add("sheet"+(l+1));

                     
                     
                    sheet1.Cell(0 + 1, 1 + 1).Value = "DO No. System Generated";
                    sheet1.Cell(0 + 2, 1 + 1).Value = "DO Date";
                     
                    sheet1.Cell(0 + 3, 1 + 1).Value = "Customer Name";
                    sheet1.Cell(0 + 4, 1 + 1).Value = "Packer Name";
                    sheet1.Cell(0 + 5, 1 + 1).Value = "Date of Delivery";
                    sheet1.Cell(0 + 6, 1 + 1).Value = "PDL No.";
                    sheet1.Cell(0 + 7, 1 + 1).Value = "PDL Date";
                    sheet1.Cell(0 + 8, 1 + 1).Value = "Created By";

                     
                    sheet1.Cell(0 + 1, 1 + 2).Value = Obj[0][l].DONO;                     
                    sheet1.Cell(0 + 2, 1 + 2).Value = Obj[0][l].DODate.ToString();
                     
                    sheet1.Cell(0 + 3, 1 + 2).Value = Obj[0][l].CustomerName;
                    sheet1.Cell(0 + 4, 1 + 2).Value = Obj[0][l].PackerName;
                    sheet1.Cell(0 + 5, 1 + 2).Value = Obj[0][l].DODate.ToString();
                    sheet1.Cell(0 + 6, 1 + 2).Value = Obj[0][l].PDLNO;
                    sheet1.Cell(0 + 7, 1 + 2).Value = Obj[0][l].PDLDate;
                    sheet1.Cell(0 + 8, 1 + 2).Value = Obj[0][l].createdby;
 


                    sheet1.Cell(0 + 11, 1 + 1).Value = "GasCode";
                    sheet1.Cell(0 + 11, 1 + 2).Value = "Description";
                    sheet1.Cell(0 + 11, 1 + 3).Value = "Volume";
                    sheet1.Cell(0 + 11, 1 + 4).Value = "Pressure";
                    sheet1.Cell(0 + 11, 1 + 5).Value = "UOM";
                    //sheet1.Cell(0 + 16, 1 + 6).Value = "Picked Qty";
                    sheet1.Cell(0 + 11, 1 + 6).Value = "Driver Name";
                    sheet1.Cell(0 + 11, 1 + 7).Value = "Truck No.";
                    sheet1.Cell(0 + 11, 1 + 8).Value = "Required Delivery Date";
                    sheet1.Cell(0 + 11, 1 + 9).Value = "Delivery Address";
                    sheet1.Cell(0 + 11, 1 + 10).Value = "Delivery Instruction";
                    sheet1.Cell(0 + 11, 1 + 11).Value = "PO No.";
                    sheet1.Cell(0 + 11, 1 + 12).Value = "RefId";
                    
                    sheet1.Cell(0 + 11, 1 + 13).Value = "BarCode";

                    for (int i = 0; i < datalist.Count; i++)
                    {
                       
                            var value1 = datalist[i].GasCode;
                            sheet1.Cell(i + 12, 0 + 2).Value = value1 == null ? "" : value1.ToString();
                            

                        var value2 = datalist[i].Descriptions;
                        sheet1.Cell(i + 12, 1 + 2).Value = value2 == null ? "" : value2.ToString();
                        var value3 = datalist[i].Volume;
                        sheet1.Cell(i + 12, 2 + 2).Value = value3 == null ? "" : value3.ToString();
                        var value4 = datalist[i].Pressure;
                        sheet1.Cell(i + 12, 3 + 2).Value = value4 == null ? "" : value4.ToString();
                        var value5 = datalist[i].UOM;
                        sheet1.Cell(i + 12, 4 + 2).Value = value5 == null ? "" : value5.ToString();
                        
                        //var value6 = datalist[i].pickqty;
                        //sheet1.Cell(i + 17, 5 + 2).Value = value6 == null ? "" : value6.ToString();
                        
                        var value7 = datalist[i].drivername;
                        sheet1.Cell(i + 12, 5 + 2).Value = value7 == null ? "" : value7.ToString();
                        var value8 = datalist[i].trucknumber;
                        sheet1.Cell(i + 12, 6 + 2).Value = value8 == null ? "" : value8.ToString();
                        var value9 = datalist[i].requestdeliverydate;
                        sheet1.Cell(i + 12, 7 + 2).Value = value9 == null ? "" : value9.ToString();
                        var value10 = datalist[i].deliveryaddress;
                        sheet1.Cell(i + 12, 8 + 2).Value = value10 == null ? "" : value10.ToString();
                        var value11 = datalist[i].deliveryinstruction;
                        sheet1.Cell(i + 12, 9 + 2).Value = value11 == null ? "" : value11.ToString();
                        var value12 = datalist[i].ponumber;
                        sheet1.Cell(i + 12, 10 + 2).Value = value12 == null ? "" : value12.ToString();
                        var value13 = datalist[i].RefId;
                        sheet1.Cell(i + 12, 11 + 2).Value = value13 == null ? "" : value13.ToString();
                        
                        var value14 = datalist[i].Barcode;
                        sheet1.Cell(i + 12, 12 + 2).Value = value14 == null ? "" : value14.ToString();

                    }
                }


                byte[] memoryStream;

                // Save the workbook to a memory stream and return as byte array
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    memoryStream = stream.ToArray();
                }

                string fileName = "example.xlsx";
                string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                 
                Data.contentType = contentType;
                Data.fileName = fileName;
                Data.stream = memoryStream;
                return Data;
            }
        }

        public DataSet LoadExcelDataIntoDataSet(string filePath)
        {
            DataSet dataSet = new DataSet();

            // Open the Excel file using ClosedXML
            using (var workbook = new XLWorkbook(filePath))
            {
                foreach (var worksheet in workbook.Worksheets)
                {
                    // Create a DataTable for each sheet
                    DataTable table = new DataTable(worksheet.Name);

                    bool isFirstRow = true;
                    int rowIndex = 0;
                    // Loop through each row in the worksheet
                    foreach (var row in worksheet.Rows())
                    {
                        if (rowIndex > 7)
                        {
                            if (isFirstRow)
                            {
                                // Add columns to DataTable from the first row (header row)
                                foreach (var cell in row.Cells())
                                {
                                    table.Columns.Add(cell.Value.ToString());
                                }
                                isFirstRow = false;
                            }
                            else
                            {
                                // Add data to DataRow for each cell in the current row
                                DataRow dataRow = table.NewRow();
                                int columnIndex = 0;
                                //foreach (var cell in row.Cells())
                                //{
                                //    dataRow[columnIndex] = cell.Value.ToString();  // Get the value of the cell
                                //    columnIndex++;
                                //}

                                for (int i = 2; i <= 14; i++)
                                {
                                     
                                    string value = row.Cell(i).Value.ToString().Trim();

                                    dataRow[columnIndex] = value;
                                    columnIndex++;

                                }

                                table.Rows.Add(dataRow);
                            }
                        }
                        rowIndex++;
                    }

                    // Add the DataTable to the DataSet
                    dataSet.Tables.Add(table);
                }
            }

            return dataSet;
        }

        public Task<ExcelSheetItems> PrintSalesOrder(dynamic Obj)
        {
            ExcelSheetItems data = new ExcelSheetItems();

            using (var workbook = new XLWorkbook())
            {
                var sheet = workbook.Worksheets.Add("SalesOrders");

                string[] headers = new[]
                {
            "SO System Seq No.", "SO Date", "Customer Name", "Gas Code", "Gas Name", "Gas Description", "Qty",
            "Delivery Address", "Delivery Instruction", "Delivery Req Date", "Ordered By",
            "PO No.", "SQ No.", "UOM", "Status"
        };

                for (int col = 0; col < headers.Length; col++)
                {
                    sheet.Cell(1, col + 1).Value = headers[col];
                }

                var headerRange = sheet.Range(1, 1, 1, headers.Length);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                sheet.SheetView.FreezeRows(1);

                var dataList = Obj;
                for (int i = 0; i < dataList.Count; i++)
                {
                    var row = i + 2;
                    var dataRow = (IDictionary<string, object>)dataList[i];

                    string GetVal(string key) => dataRow.ContainsKey(key) ? dataRow[key]?.ToString() ?? "" : "";

                    sheet.Cell(row, 1).Value = GetVal("SO_Number");
                    sheet.Cell(row, 2).Value = DateTime.TryParse(GetVal("SO_Date"), out var soDate) ? soDate.ToString("dd-MMM-yyyy") : "";
                    sheet.Cell(row, 3).Value = GetVal("customername");
                    sheet.Cell(row, 4).Value = GetVal("gascode");
                    sheet.Cell(row, 5).Value = GetVal("gasname");
                    sheet.Cell(row, 6).Value = GetVal("GasDescription");

                    decimal.TryParse(GetVal("SO_Qty"), NumberStyles.Any, CultureInfo.InvariantCulture, out var qty);
                    sheet.Cell(row, 7).Value = qty.ToString("0.00");

                    sheet.Cell(row, 8).Value = GetVal("Deliveryaddress");
                    sheet.Cell(row, 9).Value = GetVal("DeliveryInstruction");
                    sheet.Cell(row, 10).Value = DateTime.TryParse(GetVal("ReqDeliveryDate"), out var reqDate) ? reqDate.ToString("dd-MMM-yyyy") : "";

                    sheet.Cell(row, 11).Value = GetVal("OrderBy");
                    sheet.Cell(row, 12).Value = GetVal("POnumber");
                    sheet.Cell(row, 13).Value = GetVal("SQNumber");
                    sheet.Cell(row, 14).Value = GetVal("uom");
                    sheet.Cell(row, 15).Value = GetVal("Status");
                }

                sheet.Columns().AdjustToContents();

                byte[] memoryStream;
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    memoryStream = stream.ToArray();
                }

                data.contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                data.fileName = "SalesOrder.xlsx";
                data.stream = memoryStream;

                return Task.FromResult(data);
            }
        }
        public async Task<ExcelSheetItems> DownloadSalesOrder(dynamic Obj)
        {

            ExcelSheetItems Data = new ExcelSheetItems();

            using (var workbook = new XLWorkbook())
            {
                
                 
                    var datalist = Obj;
                    // Create the first sheet
                    var sheet1 = workbook.Worksheets.Add("sheet1");


                    sheet1.Cell(1 , 1).Value = "SO System Seq No.";
                    sheet1.Cell(1 , 2).Value = "SO Date";
                    sheet1.Cell(1 , 3).Value = "Customer Name";
                    sheet1.Cell(1 , 4).Value = "Gas Code";
                    sheet1.Cell(1 , 5).Value = "Gas Description";
                    sheet1.Cell(1 , 6).Value = "Qty";

                    sheet1.Cell(1 , 7).Value = "Delivery Address";
                    sheet1.Cell(1 , 8).Value = "Delivery Instruction";
                    sheet1.Cell(1 , 9).Value = "Delivery Req Date";

                    sheet1.Cell(1 , 10).Value = "Ordered By";
                    sheet1.Cell(1 , 11).Value = "PO No.";
                    sheet1.Cell(1 , 12).Value = "SQ No.";
                     
                    sheet1.Cell(1, 13).Value = "Status";

                for (int i = 0; i < datalist.Count; i++)
                    {

                        var value1 = datalist[i].SO_Number;
                        sheet1.Cell(i+2 , 0+1).Value = value1 == null ? "" : value1.ToString();
                    var value2 = datalist[i].SO_Date;
                    sheet1.Cell(i+2, 0+2).Value = value2 == null ? "" : value2.ToString();
                    var value3 = datalist[i].customername;
                    sheet1.Cell(i + 2, 0+3).Value = value3 == null ? "" : value3.ToString();
                    var value4 = datalist[i].gascode;
                    sheet1.Cell(i + 2, 0+4).Value = value4 == null ? "" : value4.ToString();

                    var value5 = datalist[i].GasDescription;
                    sheet1.Cell(i + 2, 0+5).Value = value5 == null ? "" : value5.ToString();

                    var value6 = datalist[i].SO_Qty;
                    decimal formattedValue = value6 == null ? 0m : Convert.ToDecimal(value6);
                    sheet1.Cell(i + 2, 0 + 6).Value =Convert.ToDecimal(formattedValue.ToString("0.00"));

                    var value7 = datalist[i].Deliveryaddress;
                    sheet1.Cell(i + 2, 0+7).Value = value7 == null ? "" : value7.ToString();
                    var value8 = datalist[i].DeliveryInstruction;
                    sheet1.Cell(i + 2, 0+8).Value = value8 == null ? "" : value8.ToString();
                    var value9 = datalist[i].ReqDeliveryDate;
                    sheet1.Cell(i + 2, 0+9).Value = value9 == null ? "" : value9.ToString();


                    var value10 = datalist[i].OrderBy;
                    sheet1.Cell(i + 2, 0+10).Value = value10 == null ? "" : value10.ToString();
                    var value11 = datalist[i].POnumber;
                    sheet1.Cell(i + 2, 0+11).Value = value11 == null ? "" : value11.ToString();
                    var value12 = datalist[i].SQNumber;
                    sheet1.Cell(i + 2, 0+12).Value = value12 == null ? "" : value12.ToString();

         

                    var value15 = datalist[i].Status;
                    sheet1.Cell(i + 2, 0+13).Value = value15 == null ? "" : value15.ToString();


                }
                


                byte[] memoryStream;

                // Save the workbook to a memory stream and return as byte array
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    memoryStream = stream.ToArray();
                }

                string fileName = "SalesOrder.xlsx";
                string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";


                Data.contentType = contentType;
                Data.fileName = fileName;
                Data.stream = memoryStream;
                return Data;
            }
        }

        public async Task<ExcelSheetItems> DownloadPackingAndDO(dynamic Obj,int Types)
        {

            ExcelSheetItems Data = new ExcelSheetItems();

            using (var workbook = new XLWorkbook())
            {


                var datalist = Obj;
                // Create the first sheet
                var sheet1 = workbook.Worksheets.Add("sheet1");

                if (Types == 1)
                {
                    sheet1.Cell(1, 1).Value = "PDL No.";
                    sheet1.Cell(1, 2).Value = "Packer Name";
                    sheet1.Cell(1, 3).Value = "Delivery Date";
                    sheet1.Cell(1, 4).Value = "Gas Code";
                    sheet1.Cell(1, 5).Value = "Gas Description";
                    sheet1.Cell(1, 6).Value = "SO Qty";
                    sheet1.Cell(1, 7).Value = "Picked Qty";
                    sheet1.Cell(1, 8).Value = "Driver Name";
                    sheet1.Cell(1, 9).Value = "Truck No.";
                    sheet1.Cell(1, 10).Value = "SO No.";
                    sheet1.Cell(1, 11).Value = "SQ No.";
                     
                    sheet1.Cell(1, 12).Value = "PDL Download(Yes/No)";
                    sheet1.Cell(1, 13).Value = "ACK Upload(Yes/No)";
                    sheet1.Cell(1, 14).Value = "PDL Upload(Yes/No)";
                }
                else
                {
                    sheet1.Cell(1, 1).Value = "PDL No.";
                    sheet1.Cell(1, 2).Value = "DO No.";

                    sheet1.Cell(1, 3).Value = "Packer Name";
                    sheet1.Cell(1, 4).Value = "Delivery Date";
                    sheet1.Cell(1, 5).Value = "Est Time";
                    sheet1.Cell(1, 6).Value = "Gas Code";
                    sheet1.Cell(1, 7).Value = "Gas Description";
                    sheet1.Cell(1, 8).Value = "SO Qty";
                    sheet1.Cell(1, 9).Value = "Picked Qty";
                    sheet1.Cell(1, 10).Value = "Driver Name";
                    sheet1.Cell(1, 11).Value = "Truck No.";
                    sheet1.Cell(1, 12).Value = "SO No.";
                    sheet1.Cell(1, 13).Value = "SQ No.";
                     
                    sheet1.Cell(1, 14).Value = "PDL Download(Yes/No)";
                    sheet1.Cell(1, 15).Value = "ACK Upload(Yes/No)";
                    sheet1.Cell(1, 16).Value = "PDL Upload(Yes/No)";
                    sheet1.Cell(1, 17).Value = "Invoiced (Yes/No)";
                    sheet1.Cell(1, 18).Value = "Invoice No.";

                }
                if (Types == 1)
                {
                    for (int i = 0; i < datalist.Count; i++)
                    {

                        var value1 = datalist[i].PackNo;
                        sheet1.Cell(i, 1).Value = value1 == null ? "" : value1.ToString();
                        var value2 = datalist[i].packername;
                        sheet1.Cell(i, 2).Value = value2 == null ? "" : value2.ToString();
                        var value3 = datalist[i].deliverdate;
                        sheet1.Cell(i, 3).Value = value3 == null ? "" : value3.ToString();
                        var value4 = datalist[i].GasCode;
                        sheet1.Cell(i, 4).Value = value4 == null ? "" : value4.ToString();

                        var value5 = datalist[i].GasDescriptions;
                        sheet1.Cell(i, 5).Value = value5 == null ? "" : value5.ToString();


                        var value8 = datalist[i].drivername;
                        sheet1.Cell(i, 8).Value = value8 == null ? "" : value8.ToString();
                        var value9 = datalist[i].trucknumber;
                        sheet1.Cell(i, 9).Value = value9 == null ? "" : value9.ToString();


                        var value10 = datalist[i].SOnumber;
                        sheet1.Cell(i, 10).Value = value10 == null ? "" : value10.ToString();
                        var value11 = datalist[i].SQ_Nbr;
                        sheet1.Cell(i, 11).Value = value11 == null ? "" : value11.ToString();

                        var value13 = datalist[i].createdby + " / " + datalist[i].CreatedDate;
                        sheet1.Cell(i, 12).Value = value13 == null ? "" : value13.ToString();


                        var value14 = datalist[i].IsDoCreated;
                        sheet1.Cell(i, 13).Value = value14 == null ? "" : value14.ToString();

                        var value15 = datalist[i].isacknowledged;
                        sheet1.Cell(i, 14).Value = value15 == null ? "" : value15.ToString();

                        var value16 = datalist[i].isdouploaded;
                        sheet1.Cell(i, 15).Value = value16 == null ? "" : value16.ToString();


                    }

                }

                if (Types == 2)
                {
                    for (int i = 0; i < datalist.Count; i++)
                    {

                        var value1 = datalist[i].PackNo;
                        sheet1.Cell(i + 2, 1).Value = value1 == null ? "" : value1.ToString();

                        var value17 = datalist[i].dono;
                        sheet1.Cell(i + 2, 2).Value = value17 == null ? "" : value17.ToString();


                        var value2 = datalist[i].packername;
                        sheet1.Cell(i + 2, 3).Value = value2 == null ? "" : value2.ToString();
                        var value3 = datalist[i].deliverdate;
                        sheet1.Cell(i + 2, 4).Value = value3 == null ? "" : value3.ToString();


                        var value25 = datalist[i].esttime;
                        sheet1.Cell(i + 2, 5).Value = value25 == null ? "" : value25.ToString();


                        var value4 = datalist[i].GasCode;
                        sheet1.Cell(i + 2, 6).Value = value4 == null ? "" : value4.ToString();

                        var value5 = datalist[i].GasDescriptions;
                        sheet1.Cell(i + 2, 7).Value = value5 == null ? "" : value5.ToString();

                        var value6 = datalist[i].SOQty;
                        sheet1.Cell(i + 2, 8).Value = value6 == null ? 0 : Convert.ToDecimal((Convert.ToDecimal(value6).ToString("F2")));

                        var value7 = datalist[i].PickedQty;
                        sheet1.Cell(i + 2, 9).Value = value7 == null ? 0 : Convert.ToDecimal((Convert.ToDecimal(value7).ToString("F2")));

                        var value8 = datalist[i].drivername;
                        sheet1.Cell(i + 2, 10).Value = value8 == null ? "" : value8.ToString();
                        var value9 = datalist[i].trucknumber;
                        sheet1.Cell(i + 2, 11).Value = value9 == null ? "" : value9.ToString();


                        var value10 = datalist[i].SOnumber;
                        sheet1.Cell(i + 2, 12).Value = value10 == null ? "" : value10.ToString();
                        var value11 = datalist[i].SQ_Nbr;
                        sheet1.Cell(i + 2, 13).Value = value11 == null ? "" : value11.ToString();

                     

                        var value14 = datalist[i].IsDoCreated;
                        sheet1.Cell(i + 2, 14).Value = value14 == null ? "" : value14.ToString();

                        var value15 = datalist[i].isacknowledged;
                        sheet1.Cell(i + 2, 15).Value = value15 == null ? "" : value15.ToString();

                        var value16 = datalist[i].isdouploaded;
                        sheet1.Cell(i + 2, 16).Value = value16 == null ? "" : value16.ToString();

                        var value18 = datalist[i].IsInvoiced;
                        sheet1.Cell(i + 2, 17).Value = value18 == null ? "" : value18.ToString();

                        var value19 = datalist[i].InvoiceNo;
                        sheet1.Cell(i + 2, 18).Value = value19 == null ? "" : value19.ToString();


                    }

                }

                byte[] memoryStream;

                // Save the workbook to a memory stream and return as byte array
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    memoryStream = stream.ToArray();
                }

                string fileName = "";
                if (Types == 1) {
                    fileName = "Packing.xlsx";
                }
                else
                {
                    fileName = "DeliveryOrder.xlsx";  
                }
                    string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";


                Data.contentType = contentType;
                Data.fileName = fileName;
                Data.stream = memoryStream;
                return Data;
            }
        }
    }
}