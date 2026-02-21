DELIMITER $$

DROP PROCEDURE IF EXISTS `proc_claimAndpayment`$$

CREATE DEFINER=`btgsogdbu53r`@`%` PROCEDURE `proc_claimAndpayment`(
    IN opt INT,
    IN claimid INT,
    IN branchid INT,
    IN orgid INT,
    IN categorytypeid INT,
    IN departmentid INT,
    IN currencyid INT,
    IN user_id INT,
    IN claimtypeid INT
)
BEGIN
    DECLARE isHOD INT DEFAULT 0;
    DECLARE MasterdbName VARCHAR(100);
    DECLARE SalesdbName VARCHAR(100);
    DECLARE PurchasedbName VARCHAR(100);
    DECLARE CostCenter VARCHAR(50);
    DECLARE CostCenter_id INT;
    DECLARE HOD VARCHAR(100);

    SELECT a.MasterDB, a.SalesDB, a.PurchaseDB
    INTO MasterdbName, SalesdbName, PurchasedbName
    FROM btgsaas_master_db.tenants AS a
    WHERE a.orgid = orgid
    LIMIT 1;

    IF opt = 1 THEN
      
        SET @getIsHODSql = CONCAT(
            'SELECT IFNULL(a.ishod,0) INTO @isHOD FROM ', SalesdbName,
            '.users a WHERE a.id = ', user_id, ' LIMIT 1'
        );
        PREPARE getIsHODStmt FROM @getIsHODSql;
        EXECUTE getIsHODStmt;
        DEALLOCATE PREPARE getIsHODStmt;
        SET isHOD = IFNULL(@isHOD,0);

        CREATE TEMPORARY TABLE IF NOT EXISTS temp_filtered_claims (
            Claim_ID INT NULL,
            Purpose LONGTEXT NULL
        );
        TRUNCATE TABLE temp_filtered_claims;

        IF claimtypeid > 0 THEN
            INSERT INTO temp_filtered_claims (Claim_ID, Purpose)
            SELECT a.Claim_ID, GROUP_CONCAT(DISTINCT a.Purpose SEPARATOR ', ')
            FROM tbl_claimAndpayment_Details a
            WHERE a.IsActive = 1
              AND a.ClaimTypeId = claimtypeid
            GROUP BY a.Claim_ID;
        ELSE
            INSERT INTO temp_filtered_claims (Claim_ID, Purpose)
            SELECT a.Claim_ID, GROUP_CONCAT(DISTINCT b.Purpose SEPARATOR ', ')
            FROM tbl_claimAndpayment_header a
            INNER JOIN tbl_claimAndpayment_Details b ON a.Claim_ID = b.Claim_ID
            WHERE a.IsActive = 1
            GROUP BY a.Claim_ID;
        END IF;

        SET @sqlText = CONCAT(
            'SELECT tfc.Purpose AS purpose, ch.Claim_ID, ch.ApplicationNo AS claimno, ',
            'DATE_FORMAT(ch.ApplicationDate, ''%d-%b-%Y'') AS claimdate, ',
            'cat.claimcategory AS claimcategory, ',
            'CASE WHEN (ch.ClaimCategoryId=3) THEN IFNULL(u.username,'''') ELSE u.username END AS applicantname, ',
            'CASE WHEN (ch.ClaimCategoryId=3) THEN IFNULL(md.departmentname,'''') ELSE md.departmentname END AS departmentname, ',
            'CASE WHEN ch.IsSubmitted = 0 AND (IFNULL(ch.Claim_Discussed_Count,0) <= 2 ',
            'AND IFNULL(ch.PPP_Discussed_Count,0) <= 2 AND IFNULL(ch.isdiscussionaccepted,0)=0) ',
            'THEN ''Saved'' ELSE ''Posted'' END AS Status, ',
            'cur.CurrencyCode AS transactioncurrency, ',
            'IFNULL(pm.PaymentMethod, '''') AS paymentmethodname, ',
            'ch.claimamountintc, IFNULL(ch.isclaimant_discussed,0) AS isclaimant_discussed, ',
            'CASE WHEN IFNULL(ch.claim_hod_isapproved,0)=0 THEN 1 ELSE 0 END AS candelete, ',
            'CASE WHEN IFNULL(ch.ppp_gm_approvalone,0)=0 AND IFNULL(ch.Claim_Discussed_Count,0)<=2 THEN 1 ELSE 0 END AS canedit, ',
            'ch.totalamountinidr, ch.voucherid, ch.voucherno, ',
            'IFNULL(psh.PaymentNo, '''') AS PaymentNo, ',
            'CASE WHEN IFNULL(ch.isdiscussionaccepted,0)=1 THEN 1 ELSE IFNULL(ch.IsSubmitted,0) END AS isSubmitted, ',
            'IFNULL(ch.is_delete_required,0) AS is_delete_required, ',
            'IFNULL(ch.hod_discussed_count,0) AS hod_discussed_count, ',
            'IFNULL(ch.gm_discussed_count,0) AS gm_discussed_count, ',
            'IFNULL(ch.director_discussed_count,0) AS director_discussed_count, ',
            'CASE WHEN IFNULL(ch.Claim_Discussed_Count,0)>2 OR IFNULL(ch.PPP_Discussed_Count,0)>2 THEN 1 ELSE 0 END AS IsReject, ',
            'CASE WHEN IFNULL(ch.claim_gm_isapproved,0)=0 AND IFNULL(ch.claim_gm_isdiscussed,0)=1 ',
            'AND IFNULL(ch.IsSubmitted,0)=0 AND IFNULL(ch.Claim_Discussed_Count,0)<=2 ',
            'AND IFNULL(ch.PPP_Discussed_Count,0)<=2 THEN 1 ELSE 0 END AS candiscuss ',
            'FROM tbl_claimAndpayment_header ch ',
            'INNER JOIN master_claimcategory cat ON cat.id = ch.ClaimCategoryId ',
            'INNER JOIN temp_filtered_claims tfc ON tfc.Claim_ID = ch.Claim_ID ',
            'LEFT JOIN ', SalesdbName, '.master_department md ON md.DepartmentId = ch.DepartmentId ',
            'LEFT JOIN ', SalesdbName, '.users u ON u.id = ch.ApplicantId ',
            'INNER JOIN ', SalesdbName, '.master_currency cur ON cur.currencyid = ch.TransactionCurrencyId ',
            'LEFT JOIN btggasify_live.master_paymentmethod pm ON pm.Id = ch.ModeOfPaymentId ',
            'LEFT JOIN tbl_PaymentSummary_header psh ON psh.SummaryId = ch.SummaryId AND psh.Isactive = 1 ',
            'WHERE ch.isactive = 1 ',
            'AND (ch.ClaimCategoryId = ', categorytypeid, ' OR IFNULL(', categorytypeid, ',0)=0) ',
            'AND (ch.DepartmentId = ', departmentid, ' OR IFNULL(', departmentid, ',0)=0) ',
            'AND (ch.TransactionCurrencyId = ', currencyid, ' OR IFNULL(', currencyid, ',0)=0) ',

            -- 🔥 UPDATED HOD LOGIC (ONLY CHANGE)
            'AND ( (', isHOD, ' = 1 AND ch.CreatedBy IN ',
            '(SELECT uu.id FROM ', SalesdbName, '.users uu WHERE uu.hodid = ', user_id, ')) ',
            'OR (', isHOD, ' = 0 AND ch.CreatedBy = ', user_id, ') ) ',

            'ORDER BY ch.claim_id ASC'
        );

        PREPARE stmt FROM @sqlText;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    ELSEIF opt = 2 THEN
        -- USE DYNAMIC SQL FOR HEADER QUERY BECAUSE OF DYNAMIC DB NAMES
        SET @sqlHeader = CONCAT(
            'SELECT 
                ch.Claim_ID AS ClaimId,
                ch.ClaimCategoryId,
                ch.ApplicationDate,
                ch.ApplicationNo,
                ch.DepartmentId,
                ch.ApplicantId,
                ch.JobTitle,
                ch.HOD,
                ch.TransactionCurrencyId,
                ch.ModeOfPaymentId,
                ch.AttachmentName,
                ch.AttachmentPath,
                ch.CostCenterId,
                ch.ClaimAmountInTC,
                ch.TotalAmountInIDR,
                ch.Remarks,
                ch.IsActive,
                ch.IsSubmitted,
                ch.OrgId,
                ch.BranchId,
                ch.PONo,
                ch.SupplierId,
                ch.CreatedBy AS UserId,
                ch.IsTaxCalType,
                ch.docType,
                IFNULL(u.username, '''') AS applicantname,
                IFNULL(md.departmentname, '''') AS departmentname,
                IFNULL(cur.CurrencyCode, '''') AS transactioncurrency,
                IFNULL(pm.PaymentMethod, '''') AS paymentmethodname,
                IFNULL(hod.username, '''') AS HOD_Name,
                IFNULL(sup.SupplierName, '''') AS SupplierName
            FROM tbl_claimAndpayment_header ch
            LEFT JOIN ', SalesdbName, '.users u ON u.id = ch.ApplicantId
            LEFT JOIN ', SalesdbName, '.master_department md ON md.DepartmentId = ch.DepartmentId
            LEFT JOIN ', SalesdbName, '.master_currency cur ON cur.currencyid = ch.TransactionCurrencyId
            LEFT JOIN btggasify_live.master_paymentmethod pm ON pm.Id = ch.ModeOfPaymentId
            LEFT JOIN ', SalesdbName, '.users hod ON hod.id = ch.HOD
            LEFT JOIN ', SalesdbName, '.master_supplier sup ON sup.SupplierId = ch.SupplierId
            WHERE ch.Claim_ID = ', claimid
        );
        
        PREPARE stmtHeader FROM @sqlHeader;
        EXECUTE stmtHeader;
        DEALLOCATE PREPARE stmtHeader;

        -- Result Set 2: Details
        -- Using static SQL here assuming tbl_claimAndpayment_Details and master_claimtype are in the default context
        SELECT 
            cd.Claim_Dtl_ID AS ClaimDtlId,
            cd.Claim_ID AS ClaimId,
            cd.ClaimTypeId,
            cd.ClaimAndPaymentDesc,
            cd.Amount,
            cd.TaxRate,
            cd.VatRate,
            cd.TotalAmount,
            cd.ExpenseDate,
            cd.Purpose,
            cd.PaymentId,
            cd.poid,
            cd.docReference,
            cd.TaxPerc,
            cd.VatPerc,
            cd.taxid,
            cd.vatid,
            cd.IsTaxCalType,
            IFNULL(ct.claimtype, '') AS claimtype,
            cd.ClaimAndPaymentDesc AS PaymentDescription,
            cd.PaymentId
        FROM tbl_claimAndpayment_Details cd
        LEFT JOIN master_claimtype ct ON ct.id = cd.ClaimTypeId
        WHERE cd.Claim_ID = claimid AND cd.IsActive = 1;

    ELSEIF opt = 3 THEN
        SELECT 0 as result, 'Sequence Logic' as text;
    END IF;
END$$

DELIMITER ;
