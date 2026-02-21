-- Create Journal Master Table
CREATE TABLE IF NOT EXISTS tbl_journal_master (
    journal_id INT AUTO_INCREMENT PRIMARY KEY,
    journal_no VARCHAR(50) NOT NULL,
    journal_date DATE NOT NULL,
    description TEXT,
    party_type ENUM('customer', 'supplier', 'bank') NOT NULL,
    party_id INT,
    party_name VARCHAR(255),
    reference_no VARCHAR(100),
    total_amount DECIMAL(18, 2) DEFAULT 0.00,
    status ENUM('Saved', 'Posted') DEFAULT 'Saved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Journal Details Table
CREATE TABLE IF NOT EXISTS tbl_journal_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT NOT NULL,
    gl_code VARCHAR(50),
    type ENUM('Debit', 'Credit') NOT NULL,
    description TEXT,
    amount DECIMAL(18, 2) DEFAULT 0.00,
    reference_no VARCHAR(100),
    FOREIGN KEY (journal_id) REFERENCES tbl_journal_master(journal_id) ON DELETE CASCADE
);

-- Stored Procedure: Get Party List
DELIMITER //
CREATE PROCEDURE proc_get_party_list(
    IN p_party_type VARCHAR(20),
    IN p_db_user_new VARCHAR(100),
    IN p_db_master VARCHAR(100)
)
BEGIN
    IF p_party_type = 'customer' THEN
        SET @sql = CONCAT('SELECT Id as value, CustomerName as label FROM ', p_db_user_new, '.master_customer WHERE IsActive = 1 ORDER BY CustomerName');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    ELSEIF p_party_type = 'supplier' THEN
        SET @sql = CONCAT('SELECT SupplierId as value, SupplierName as label FROM ', p_db_master, '.master_supplier WHERE IsActive = 1 ORDER BY SupplierName');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    ELSEIF p_party_type = 'bank' THEN
        SET @sql = CONCAT('SELECT BankId as value, BankName as label FROM ', p_db_master, '.master_bank WHERE IsActive = 1 ORDER BY BankName');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Stored Procedure: Save Journal
-- Note: Saving details usually handled via application logic looping or passing JSON. 
-- For simplicity in this SP, we might just insert Master and return ID. Details can be inserted via code or JSON parsing if supported.
-- Here we will just create the SP for Master insertion for now.

DELIMITER //
CREATE PROCEDURE proc_save_journal_header(
    IN p_journal_no VARCHAR(50),
    IN p_journal_date DATE,
    IN p_description TEXT,
    IN p_party_type VARCHAR(20),
    IN p_party_id INT,
    IN p_party_name VARCHAR(255),
    IN p_reference_no VARCHAR(100),
    IN p_total_amount DECIMAL(18, 2),
    IN p_status VARCHAR(20),
    IN p_created_by VARCHAR(50),
    OUT p_journal_id INT
)
BEGIN
    INSERT INTO tbl_journal_master (
        journal_no, journal_date, description, party_type, party_id, party_name, reference_no, total_amount, status, created_by
    ) VALUES (
        p_journal_no, p_journal_date, p_description, p_party_type, p_party_id, p_party_name, p_reference_no, p_total_amount, p_status, p_created_by
    );
    SET p_journal_id = LAST_INSERT_ID();
END //
DELIMITER ;
