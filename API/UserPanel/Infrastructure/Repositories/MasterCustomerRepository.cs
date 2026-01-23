using System.Data;
using BackEnd.Master;
using Core.Abstractions;
using Core.Models;
using Core.OrderMngMaster.Customer;
using Dapper;
using UserPanel.Infrastructure.Data;

public class MasterCustomerRepository : IMasterCustomerRepository
{
    private readonly IDbConnection _connection;

    public MasterCustomerRepository(IUnitOfWorkDB1 unitOfWork)
    {
        _connection = unitOfWork.Connection;
    }
    public async Task<object> AddAsync(MasterCustomerModel item)
    {
        var response = new ResponseModel { Status = false };
        int resultCode = 0;

        try
        {

            if (item.TabId == 1)
            {
               var customer = item.Customer;
                var parameters = new DynamicParameters();

                parameters.Add("p_CustomerName", customer.CustomerName);
                parameters.Add("p_Email", customer.Email);
                parameters.Add("p_SalesPersonId", customer.SalesPersonId);
                parameters.Add("p_CountryId", customer.CountryId);
                parameters.Add("p_CC_Email", customer.Cc_Email);
                parameters.Add("p_Remarks", customer.Remarks);
                parameters.Add("p_PhoneNumber", customer.PhoneNumber);
                parameters.Add("p_Fax", customer.Fax);
                parameters.Add("p_IsActive", customer.IsActive);
                parameters.Add("p_OrgId", customer.OrgId);
                parameters.Add("p_BranchId", customer.BranchId);
                parameters.Add("p_BusinessFormId", customer.BusinessFormId);
                parameters.Add("p_BusinessFieldId", customer.BusinessFieldId);
                parameters.Add("p_CityId", customer.CityId);
                parameters.Add("p_ZoneId", customer.ZoneId);
                parameters.Add("p_PoNumber", customer.PoNumber);
                parameters.Add("p_CreditLimitinIDR", customer.CreditLimitinIDR);
                parameters.Add("p_LegalDocumentPath", customer.LegalDocumentPath ?? string.Empty);
                parameters.Add("ResultCode", dbType: DbType.Int32, direction: ParameterDirection.Output);

                await _connection.ExecuteAsync(
                    MasterCustomerMaster.MasterCreateUpdateCustomer,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                resultCode = parameters.Get<int>("ResultCode");

                if (resultCode == 1)
                    return new ResponseModel { Status = false, Message = "Customer name already exists.", StatusCode = 1 };

                if (resultCode == 2)
                    return new ResponseModel { Status = false, Message = "Email already exists.", StatusCode = 1 };

                return new ResponseModel
                {
                    Status = true,
                    Message = "Customer created successfully.",
                    Data = new { CustomerId = resultCode }
                };
            }


            else if (item.TabId == 2)
            {
                if (item.CustomerContacts != null && item.CustomerContacts.Any())
                {
                    foreach (var contact in item.CustomerContacts)
                    {
                        var contactParams = new DynamicParameters();
                        contactParams.Add("p_ContactId", contact.ContactId);
                        contactParams.Add("p_CustomerId", contact.CustomerId);
                        contactParams.Add("p_Department", contact.Department);
                        contactParams.Add("p_HandPhone", contact.HandPhone);
                        contactParams.Add("p_Email", contact.Email);
                        contactParams.Add("p_DeskPhone", contact.DeskPhone);
                        contactParams.Add("p_CreatedIP", "111.11");
                        contactParams.Add("p_LastModifiedBY", contact.UserId);
                        contactParams.Add("p_LastModifiedIP", "111.121");
                        contactParams.Add("p_IsActive", contact.IsActive ? 1 : 0, DbType.Int32);
                        contactParams.Add("p_Contactname", contact.Contactname);
                        contactParams.Add("p_UserId", contact.UserId);
                        contactParams.Add("p_BranchId", contact.BranchId);

                        contactParams.Add("p_ResultCode", dbType: DbType.Int32, direction: ParameterDirection.Output);
                        contactParams.Add("p_NewContactId", dbType: DbType.Int32, direction: ParameterDirection.Output);

                        await _connection.ExecuteAsync(
                            "proc_MasterContactCreateUpdate",
                            contactParams,
                            commandType: CommandType.StoredProcedure
                        );

                        int contactResultCode = contactParams.Get<int>("p_ResultCode");

                        if (contactResultCode == 1)
                        {
                            return new ResponseModel
                            {
                                Status = false,
                                Message = $"Duplicate contact name found: {contact.Contactname}",
                                StatusCode = 1
                            };
                        }
                        else if (contactResultCode == 2)
                        {
                            return new ResponseModel
                            {
                                Status = false,
                                Message = $"Duplicate email found for contact: {contact.Email}",
                                StatusCode = 2
                            };
                        }
                        else if (contactResultCode == 3)
                        {
                            return new ResponseModel
                            {
                                Status = false,
                                Message = $"Invalid customer ID for contact: {contact.Contactname}",
                                StatusCode = 3
                            };
                        }

                        int newContactId = contactParams.Get<int>("p_NewContactId");
                        contact.ContactId = newContactId;
                    }

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer contacts saved successfully.",
                        StatusCode = 0
                    };
                }

                return new ResponseModel
                {
                    Status = false,
                    Message = "No customer contacts provided.",
                    StatusCode = -1
                };
            }
            else if (item.TabId == 3)
            {
                if (item.CustomerAddresses != null && item.CustomerAddresses.Any())
                {
                    foreach (var address in item.CustomerAddresses)
                    {
                        var addressParams = new DynamicParameters();
                        addressParams.Add("p_AddressId", address.AddressId);
                        addressParams.Add("p_AddressTypeId", address.AddressTypeId);
                        addressParams.Add("p_ContactId", address.ContactId);
                        addressParams.Add("p_CustomerId", address.CustomerId);
                        addressParams.Add("p_Location", address.Location);
                        addressParams.Add("p_Address", address.Address);
                        addressParams.Add("p_UserId", address.UserId);
                        addressParams.Add("p_BranchId", address.BranchId);
                        addressParams.Add("p_UserIP", address.UserIP);
                        addressParams.Add("p_ContactName", address.ContactName);

                        addressParams.Add("p_StatusCode", dbType: DbType.Int32, direction: ParameterDirection.Output);

                        await _connection.ExecuteAsync(
                            "proc_MasterCustomerAddressCreateUpdate",
                            addressParams,
                            commandType: CommandType.StoredProcedure
                        );

                        int statusCode = addressParams.Get<int>("p_StatusCode");

                        if (statusCode == 1)
                        {
                            return new ResponseModel
                            {
                                Status = false,
                                Message = $"Duplicate contact name found: {address.ContactName}",
                                StatusCode = 1
                            };
                        }
                        else if (statusCode == 2)
                        {
                            return new ResponseModel
                            {
                                Status = false,
                                Message = $"Duplicate location found: {address.Location}",
                                StatusCode = 2
                            };
                        }
                    }

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer addresses saved successfully.",
                        StatusCode = 0
                    };
                }

                return new ResponseModel
                {
                    Status = false,
                    Message = "No customer addresses provided.",
                    StatusCode = -1
                };
            }



            return new ResponseModel
            {
                Status = false,
                Message = "Invalid TabId."
            };
        }
        catch (Exception ex)
        {
            return new ResponseModel
            {
                Status = false,
                Message = $"Error: {ex.Message}"
            };
        }
    }

    public async Task<object> GetByID(int customerId, int tabId, int branchId)
    {
        try
        {

            var parameters = new DynamicParameters();
            parameters.Add("p_BranchId", branchId);
            parameters.Add("p_UserId", branchId);
            parameters.Add("p_CustomerId", customerId);

            var customerDetails = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                "proc_MasterGetCustomerById",
                parameters,
                commandType: CommandType.StoredProcedure);

            if (customerDetails == null)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = "Customer not found"
                };
            }

            return new ResponseModel
            {
                Status = true,
                Data = customerDetails
            };

        }
        catch (Exception ex)
        {
            return new ResponseModel()
            {
                Status = false,
                Message = $"Error: {ex.Message}"
            };
        }
    }


    public async Task<object> GetAllAsync(int tabId, int customerId, int contactId, int branchId, int userId, int addressId, CancellationToken cancellationToken)
    {
        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_TabId", tabId);
            parameters.Add("p_CustomerId", customerId);
            parameters.Add("p_ContactId", contactId);
            parameters.Add("p_BranchId", branchId);
            parameters.Add("p_UserId", userId);
            parameters.Add("p_AddressId", addressId);

            var result = await _connection.QueryAsync<dynamic>(
                MasterCustomerMaster.MasterTabList,
                parameters,
                commandType: CommandType.StoredProcedure);

            return new ResponseModel
            {
                Status = true,
                Data = result
            };
        }
        catch (Exception ex)
        {
            return new ResponseModel
            {
                Status = false,
                Message = $"Error: {ex.Message}"
            };
        }
    }

    public async Task<object> GetAllCustomerAsync(string name, int branchId, int userId, int customerId, int contactId, int addressId)
    {
        try
        
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_Name", string.IsNullOrWhiteSpace(name) ? null : name);
            parameters.Add("p_BranchId", branchId);
            parameters.Add("p_UserId", userId);

            var customers = await _connection.QueryAsync<dynamic>(
                MasterCustomerMaster.MasterGetAllCustomers,
                parameters,
                commandType: CommandType.StoredProcedure);

            return new ResponseModel { Status = true, Data = customers };
        }
        catch (Exception ex)
        {
            return new ResponseModel { Status = false, Message = $"Error: {ex.Message}" };
        }
    }



    public async Task<object> ToogleStatus(MasterCustomer item)
    {

        if (item.AddressId.HasValue && item.AddressId > 0)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("p_CustomerId", item.CustomerId);
                parameters.Add("p_ContactId", item.ContactId);
                parameters.Add("p_AddressId", item.AddressId);
                parameters.Add("p_BranchId", item.BranchId);
                parameters.Add("p_UserId", item.UserId);
                parameters.Add("p_IsActive", item.IsActive);

                if (item.ContactId.HasValue && item.ContactId > 0)
                {
                    await _connection.ExecuteAsync(
                        MasterCustomerMaster.MasterToggleCustomerAddressStatus,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer address status toggled successfully.",
                        StatusCode = 0
                    };
                }
                else if (item.AddressId.HasValue && item.AddressId > 0)
                {
                    await _connection.ExecuteAsync(
                        MasterCustomerMaster.MasterToggleCustomerAddressStatus,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer address status toggled successfully.",
                        StatusCode = 200
                    };
                }
                else
                {
                    return new ResponseModel
                    {
                        Status = false,
                        Message = "Either ContactId or AddressId must be provided.",
                        StatusCode = 400
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                };
            }
        }
        else if (item.IsCustomer)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("p_CustomerId", item.CustomerId);
                parameters.Add("p_BranchId", item.BranchId);
                parameters.Add("p_UserId", item.UserId);
                parameters.Add("p_IsActive", item.IsActive);

                // Only proceed if CustomerId is valid
                if (item.CustomerId.HasValue && item.CustomerId > 0)
                {
                    var result = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                        MasterCustomerMaster.MasterToggleCustomerStatus,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    int statusCode = result?.statusCode ?? -1;
                    string message = result?.message ?? "Unknown result from stored procedure.";

                    return new ResponseModel
                    {
                        Status = statusCode == 0,
                        Message = message,
                        StatusCode = statusCode
                    };
                }

                return new ResponseModel
                {
                    Status = false,
                    Message = "Invalid CustomerId.",
                    StatusCode = 400
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Unexpected error: {ex.Message}",
                    StatusCode = 500
                };
            }

        }
        else
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("p_CustomerId", item.CustomerId);
                parameters.Add("p_ContactId", item.ContactId);
                parameters.Add("p_AddressId", item.AddressId);
                parameters.Add("p_BranchId", item.BranchId);
                parameters.Add("p_UserId", item.UserId);
                parameters.Add("p_IsActive", item.IsActive);

                if (item.ContactId.HasValue && item.ContactId > 0)
                {
                    await _connection.ExecuteAsync(
                        MasterCustomerMaster.MasterToggleCustomerContactStatus,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer contact status toggled successfully.",
                        StatusCode = 0
                    };
                }
                else if (item.AddressId.HasValue && item.AddressId > 0)
                {
                    await _connection.ExecuteAsync(
                        MasterCustomerMaster.MasterToggleCustomerAddressStatus,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    return new ResponseModel
                    {
                        Status = true,
                        Message = "Customer address status toggled successfully.",
                        StatusCode = 200
                    };
                }
                else
                {
                    return new ResponseModel
                    {
                        Status = false,
                        Message = "Either ContactId or AddressId must be provided.",
                        StatusCode = 400
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                };
            }
        }
    }
    public async Task<ResponseModel> UploadDO(int Id, string Path,int userId,int branchId)
    {
        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_UserId", userId);
            parameters.Add("p_BranchId", branchId);
            parameters.Add("p_CustomerId", Id);
            parameters.Add("p_LegalDocFilePath", Path);

            await _connection.ExecuteAsync(
                "sp_UploadLegalDocument",
                parameters,
                commandType: CommandType.StoredProcedure);

            return new ResponseModel
            {
                Data = null,
                Message = "File Uploaded Successfully",
                Status = true
            };
        }
        catch (Exception ex)
        {
            return new ResponseModel
            {
                Data = null,
                Message = "Something went wrong during file upload.",
                Status = false
            };
        }
    }


}


//using Core.OrderMngMaster.Customer;
//using Core.Models;
//using Dapper;
//using System.Data;
//using UserPanel.Infrastructure.Data;
//using BackEnd.Master;
//using MySqlX.XDevAPI.Common;
//using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
//using Mysqlx.Crud;

//namespace Infrastructure.Repositories
//{
//    public class MasterCustomerRepository : IMasterCustomerRepository
//    {
//        class ContactsAndAddresses
//        {
//            public int ContactId { get; set; }
//            public int? AddressId { get; set; }
//            public bool ContactIsFound { get; set; }
//            public bool AddressIsFound { get; set; }
//        }

//        class WrapperGetByID
//        {
//            public MasterCustomer mc { get; set; }
//            public MasterCustomercontact mcc { get; set; }
//            public MasterCustomeraddress mca { get; set; }
//        }

//        struct SQLQuery
//        {
//            public const string GetLastInsertedIdSql = "SELECT LAST_INSERT_ID();";

//            public const string insertMasterCustomer =
//                "INSERT INTO master_customer (CustomerCode, CustomerName, Email, SalesPersonId, CountryId, " +
//                "CC_Email, Remarks, PhoneNumber, Fax, CreatedBy, CreatedDate, CreatedIP, " +
//                "IsActive, OrgId, BranchId) " +
//                "VALUES (@CustomerCode, @CustomerName, @Email, @SalesPersonId, @CountryId, @CC_Email, " +
//                "@Remarks, @PhoneNumber, @Fax, @UserId, now(), @UserIp, " +
//                "@IsActive, @OrgId, @BranchId);";

//            public const string insertMasterCustomerContact =
//                "INSERT INTO master_customercontact(CustomerId, Department, HandPhone, Email, " +
//                "DeskPhone, CreatedDate, CreatedIP, " +
//                "IsActive, contactname) " +
//                "VALUES (@CustomerId, @Department, @HandPhone, @Email, @DeskPhone, now(), " +
//                "@UserIp, @IsActive, @contactname);";

//            public const string insertMasterCustomerAddress =
//                "INSERT INTO master_customeraddress(AddressTypeId, ContactId, CustomerId, Location, Address, " +
//                "CreatedDate, CreatedIP, IsActive) " +
//                "VALUES (@AddressTypeId, @ContactId, @CustomerId, @Location, @Address, now(), " +
//                "@UserIp, @IsActive);";


//            public const string updateMasterCustomer =
//                "UPDATE master_customer " +
//                "SET CustomerCode = @CustomerCode, " +
//                "CustomerName = @CustomerName, " +
//                "Email = @Email, " +
//                "SalesPersonId = @SalesPersonId, " +
//                "CountryId = @CountryId, " +
//                "CC_Email = @CC_Email, " +
//                "Remarks = @Remarks, " +
//                "PhoneNumber = @PhoneNumber, " +
//                "Fax = @Fax, " +
//                "LastModifiedBy = @UserId, " +
//                "LastModifiedDate = now(), " +
//                "LastModifiedIP = @UserIp, " +
//                "IsActive = @IsActive, " +
//                "OrgId = @OrgId, " +
//                "BranchId = @BranchId " +
//                "WHERE Id = @Id;";

//            public const string updateMasterCustomerContact =
//                "UPDATE master_customercontact " +
//                "SET CustomerId = @CustomerId, " +
//                "Department = @Department, " +
//                "HandPhone = @HandPhone, " +
//                "Email = @Email, " +
//                "DeskPhone = @DeskPhone, " +
//                "LastModifiedBY = @UserId, " +
//                "LastModifiedDate = now(), " +
//                "LastMOdifiedIP = @UserIp, " +
//                "IsActive = 1, " +
//                "contactname = @contactname " +
//                "WHERE ContactId = @ContactId;";

//            public const string updateMasterCustomerAddress =
//                "UPDATE master_customeraddress " +
//                "SET AddressTypeId = @AddressTypeId, " +
//                "ContactId = @ContactId, " +
//                "CustomerId = @CustomerId, " +
//                "Location = @Location, " +
//                "Address = @Address, " +
//                "LastModifiedBY = @UserId, " +
//                "LastModifiedDate = now(), " +
//                "LastMOdifiedIP = @UserIp, " +
//                "IsActive = 1 WHERE AddressId = @AddressId;";



//            //public const string deleteMasterCustomerAddress =
//            //    "DELETE FROM master_customeraddress WHERE AddressId = @AddressId;";

//            //public const string deleteMasterCustomerContact =
//            //    "DELETE FROM master_customercontact WHERE ContactId = @ContactId;";

//            public const string toogleMasterCustomerStatus =
//                "UPDATE master_customer " +
//                "SET IsActive = @IsActive " +
//                "WHERE Id = @Id;";

//            public const string toogleMasterCustomerContactStatus =
//                "UPDATE master_customercontact " +
//                "SET IsActive = @IsActive " +
//                "WHERE ContactId = @ContactId;";

//            public const string toogleMasterCustomerAddressStatus =
//                "UPDATE master_customeraddress " +
//                "SET IsActive = @IsActive " +
//                "WHERE AddressId = @AddressId;";
//        }

//        private DynamicParameters GetDynamicParameters(int opt, string customer_name = "", string from_date = "", string to_date = "", int customer_id = 0)
//        {
//            var param = new DynamicParameters();
//            param.Add("@opt", opt);
//            param.Add("@customer_Name", customer_name);
//            param.Add("@from_date", from_date);
//            param.Add("@to_date", to_date);
//            param.Add("@customerid", customer_id);

//            return param;
//        }

//        private readonly IDbConnection _connection;
//        public MasterCustomerRepository(IUnitOfWorkDB1 unitOfWork)
//        {
//            _connection = connectionFactory.CreateConnection();
//        }

//        public async Task<object> AddAsync(MasterCustomerModel item)
//        {
//            var response = new ResponseModel() { Status = false };
//            _connection.Open();
//            var _transaction = _connection.BeginTransaction();
//            try
//            {
//                var result = 0;

//                result = await _connection.ExecuteAsync(SQLQuery.insertMasterCustomer, item.Customer);
//                if (result == 0)
//                {
//                    response = new ResponseModel() { Message = "Saving MasterCustomer failed 0 row", Status = false };
//                    return response;
//                }
//                var masterCustomerId = await _connection.QuerySingleAsync<int>(SQLQuery.GetLastInsertedIdSql);

//                foreach (var contact in item.CustomerContacts)
//                {
//                    var currentContactIDWFE = contact.ContactId;
//                    contact.CustomerId = masterCustomerId;

//                    result = await _connection.ExecuteAsync(SQLQuery.insertMasterCustomerContact, contact);
//                    if (result == 0)
//                    {
//                        response = new ResponseModel() { Message = "Saving MasterContact failed 0 row", Status = false };
//                        return response;
//                    }
//                    //var masterCustomerContactId = await _connection.QuerySingleAsync<int>(SQLQuery.GetLastInsertedIdSql);

//                    //foreach (var address in item.CustomerAddresses)
//                    //{
//                    //    if (address.ContactId == currentContactIDWFE)
//                    //    {
//                    //        address.CustomerId = masterCustomerId;
//                    //        address.ContactId = masterCustomerContactId;

//                    //        result = await _connection.ExecuteAsync(SQLQuery.insertMasterCustomerAddress, address);
//                    //        if (result == 0)
//                    //        {
//                    //            response = new ResponseModel() { Message = "Saving MasterAddress failed 0 row", Status = false };
//                    //            return response;
//                    //        }
//                    //    }
//                    //}
//                }

//                response = new ResponseModel() { Message = "Saved Successfully", Status = true };
//                return response;
//            }
//            catch (Exception ex)
//            {
//                return new ResponseModel()
//                {
//                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
//                    Status = false
//                };
//            }
//            finally
//            {
//                if (response.Status)
//                {
//                    _transaction.Commit();
//                }
//                else
//                {
//                    _transaction.Rollback();
//                }
//            }
//        }

//        public async Task<object> GetAllAsync(string name, string from_date, string to_date)
//        {
//            var param = GetDynamicParameters(1, name, from_date, to_date);

//            return await Helper.QueryProcedure(_connection, MasterCustomerMaster.MasterCustomerProcedure, param);
//        }

//        public async Task<object> GetByID(int id)
//        {
//            try
//            {
//                var param = GetDynamicParameters(2, customer_id: id);

//                var result = await _connection.QueryAsync<MasterCustomer, MasterCustomercontact, MasterCustomeraddress, WrapperGetByID>(MasterCustomerMaster.MasterCustomerProcedure, (MC, MCC, MCA) => { return new WrapperGetByID { mc = MC, mcc = MCC, mca = MCA }; }, splitOn: "ContactId,AddressId", param: param, commandType: CommandType.StoredProcedure);

//                var mc = result.Select(p => p.mc).GroupBy(g => g.Id).Select(p => { return p.First(); }).First();
//                var mcc = result.Select(p => p.mcc).GroupBy(g => g.ContactId).Select(p => { return p.First(); }).ToList();
//                var mca = result.Select(p => p.mca).Where(w => w != null).GroupBy(g => g.AddressId).Select(p => { return p.First(); }).ToList();

//                MasterCustomerModel model = new MasterCustomerModel();
//                model.Customer = mc;
//                model.CustomerContacts = mcc;
//                model.CustomerAddresses = mca;

//                return new ResponseModel()
//                {
//                    Data = model,
//                    Message = "Success",
//                    Status = true
//                };
//            }
//            catch (Exception ex)
//            {
//                return new ResponseModel()
//                {
//                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
//                    Status = false
//                };
//            }
//        }

//        public async Task<object> UpdateAsync(MasterCustomerModel item)
//        {
//            var response = new ResponseModel() { Status = false };
//            _connection.Open();
//            var _transaction = _connection.BeginTransaction();
//            try
//            {
//                var result = 0;

//                result = await _connection.ExecuteAsync(SQLQuery.updateMasterCustomer, item.Customer);
//                if (result == 0)
//                {
//                    response = new ResponseModel() { Message = "Update MasterCustomer failed 0 row", Status = false };
//                    return response;
//                }

//                //get current customer contacts and addressess
//                var param = GetDynamicParameters(3, customer_id: item.Customer.Id);
//                var contactsAndAddresses = (List<ContactsAndAddresses>)await Helper.RunQueryProcedure<ContactsAndAddresses>(_connection, MasterCustomerMaster.MasterCustomerProcedure, param);

//                if (contactsAndAddresses != null)
//                {
//                    //update address first
//                    //if address with same contactId and addressid found. update else insert
//                    //then update contact
//                    //if contact with same contactid is found. update else insert
//                    //then delete not found address and contact


//                    result = await _connection.ExecuteAsync("UPDATE master_customeraddress SET IsActive = 0 WHERE CustomerId ="+item.Customer.Id+";");
//                    foreach (var address in item.CustomerAddresses)
//                    {
//                        if (address.ContactId > 0)
//                        {
//                            if (address.AddressId > 0)
//                            {

//                                result = await _connection.ExecuteAsync(SQLQuery.updateMasterCustomerAddress, address);
//                                if (result == 0)
//                                {
//                                    response = new ResponseModel() { Message = "Update MasterCustomerAddress failed 0 row", Status = false };
//                                    return response;
//                                }
//                            }
//                            else
//                            {
//                                result = await _connection.ExecuteAsync(SQLQuery.insertMasterCustomerAddress, address);
//                                if (result == 0)
//                                {
//                                    response = new ResponseModel() { Message = "Insert MasterCustomerAddress failed 0 row", Status = false };
//                                    return response;
//                                }
//                            }
//                        }
//                    }
//                    result = await _connection.ExecuteAsync("UPDATE master_customercontact SET IsActive = 0 WHERE CustomerId =" + item.Customer.Id + ";");

//                    foreach (var contact in item.CustomerContacts)
//                    {
//                        var enumDataFound = contactsAndAddresses.Where(a => a.ContactId == contact.ContactId);
//                        var dataFound = enumDataFound.Count() > 0 ? enumDataFound.First() : null;
//                        if (dataFound != null)
//                        {
//                            dataFound.ContactIsFound = true;
//                            result = await _connection.ExecuteAsync(SQLQuery.updateMasterCustomerContact, contact);
//                            if (result == 0)
//                            {
//                                response = new ResponseModel() { Message = "Update MasterCustomerContact failed 0 row", Status = false };
//                                return response;
//                            }
//                        }
//                        else
//                        {
//                            result = await _connection.ExecuteAsync(SQLQuery.insertMasterCustomerContact, contact);
//                            if (result == 0)
//                            {
//                                response = new ResponseModel() { Message = "Insert MasterCustomerContact failed 0 row", Status = false };
//                                return response;
//                            }
//                        }
//                    }




//                }

//                response = new ResponseModel() { Message = "Updated Successfully", Status = true };
//                return response;
//            }
//            catch (Exception ex)
//            {
//                return new ResponseModel()
//                {
//                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
//                    Status = false
//                };
//            }
//            finally
//            {
//                if (response.Status)
//                {
//                    _transaction.Commit();
//                }
//                else
//                {
//                    _transaction.Rollback();
//                }
//            }
//        }

//        public async Task<object> ToogleStatus(MasterCustomer item)
//        {
//            try
//            {
//                var result = await _connection.ExecuteAsync(SQLQuery.toogleMasterCustomerStatus, item);
//                if (result == 0)
//                {
//                    return new ResponseModel() { Message = "Toogle status MasterCustomer failed 0 row", Status = false };
//                }
//                return new ResponseModel() { Message = "Toogle status MasterCustomer success", Status = true };
//            }
//            catch (Exception ex)
//            {
//                return new ResponseModel()
//                {
//                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
//                    Status = false
//                };
//            }
//        }
//    }

//}

