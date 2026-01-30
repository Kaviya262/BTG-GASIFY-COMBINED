-- ============================================
-- Diagnostic Queries for Access Rights Issue
-- ============================================

-- Query 1: Check if stored procedure exists
SHOW PROCEDURE STATUS WHERE Name = 'proc_RolesAccess';

-- Query 2: View stored procedure definition
SHOW CREATE PROCEDURE proc_RolesAccess;

-- ============================================
-- Replace <user_id> with the actual user ID who is having issues
-- ============================================

-- Query 3: Check user's role and department assignment
SELECT 
    u.Id AS UserId,
    u.UserName,
    u.Email,
    u.RoleId,
    u.DepartmentId,
    r.RoleName,
    d.DepartmentName,
    u.IsActive AS UserActive
FROM users u
LEFT JOIN roles r ON u.RoleId = r.Id
LEFT JOIN departments d ON u.DepartmentId = d.Id
WHERE u.Id = <user_id>;

-- Query 4: Check all active access rights headers
SELECT 
    h.Id AS HeaderId,
    h.Role,
    h.RoleId,
    h.Department,
    h.DepartmentId,
    h.Hod,
    h.IsActive,
    h.EffectiveFrom,
    h.CreatedDate
FROM master_accessrights_header h
WHERE h.IsActive = 1
ORDER BY h.Id DESC;

-- Query 5: Check access rights details for "Claim" module
SELECT 
    h.Id AS HeaderId,
    h.Role,
    h.Department,
    h.IsActive AS HeaderActive,
    h.EffectiveFrom,
    d.Module,
    d.Screen,
    d.View,
    d.Edit,
    d.Delete,
    d.Post,
    d.Save,
    d.Print,
    d.ViewRate,
    d.SendMail,
    d.ViewDetails,
    d.Records
FROM master_accessrights_header h
JOIN master_accessrights_details d ON h.Id = d.HeaderId
WHERE h.IsActive = 1
  AND d.Module LIKE '%Claim%'
  AND d.Screen LIKE '%Approval%'
ORDER BY h.Id DESC;

-- Query 6: Test stored procedure for specific user
-- Replace <user_id> with actual user ID
CALL proc_RolesAccess(9, <user_id>, 1, 1, 0, 0);

-- Query 7: Check what the stored procedure returns (if it uses a SELECT)
-- This will show the exact data returned to the API
SET @opt = 9;
SET @userid = <user_id>;
SET @branchid = 1;
SET @orgid = 1;
SET @screenid = 0;
SET @headerid = 0;

-- Run the stored procedure
CALL proc_RolesAccess(@opt, @userid, @branchid, @orgid, @screenid, @headerid);

-- ============================================
-- Common Fix Queries
-- ============================================

-- Fix 1: Assign user to a role and department
-- Replace values as needed
-- UPDATE users 
-- SET RoleId = <role_id>, DepartmentId = <dept_id>
-- WHERE Id = <user_id>;

-- Fix 2: Activate an access rights header
-- UPDATE master_accessrights_header
-- SET IsActive = 1
-- WHERE Id = <header_id>;

-- Fix 3: Update effective date to current date
-- UPDATE master_accessrights_header
-- SET EffectiveFrom = NOW()
-- WHERE Id = <header_id>;

-- ============================================
-- Verification Queries
-- ============================================

-- After applying fixes, verify the user now has access
SELECT 
    u.Id AS UserId,
    u.UserName,
    h.Role,
    h.Department,
    d.Module,
    d.Screen,
    d.View AS CanView
FROM users u
JOIN master_accessrights_header h ON u.RoleId = h.RoleId AND u.DepartmentId = h.DepartmentId
JOIN master_accessrights_details d ON h.Id = d.HeaderId
WHERE u.Id = <user_id>
  AND h.IsActive = 1
  AND h.EffectiveFrom <= NOW()
  AND d.Module = 'Claim'
  AND d.Screen = 'Approval';
