# Creation Endpoints & Form Reset Testing Checklist

## Testing Date: 2025-10-16

### Prerequisites
- Backend API running on `http://localhost:3000`
- Frontend Dashboard running on `http://localhost:3001`
- Logged in as Super Admin at `http://localhost:3001`

---

## 1. Tenants Page Testing

### ✅ Create Tenant Form
- [ ] Click "Create Tenant" button
- [ ] **Verify**: All input fields are empty (name, code, billingEmail)
- [ ] **Verify**: Status and Subscription Plan have default selections
- [ ] **Test Empty Name**: Leave name empty → Should show "Tenant name is required" under field
- [ ] **Test Short Name**: Enter "A" → Should show "Tenant name must be at least 2 characters"
- [ ] **Test Empty Code**: Leave code empty → Should show "Tenant code is required"
- [ ] **Test Short Code**: Enter "ab" → Should show "Code must be at least 3 characters"
- [ ] **Test Invalid Code Format**: Enter "ABC123" → Should show "Code must contain only lowercase letters, numbers, and hyphens"
- [ ] **Test Invalid Email**: Enter "invalid-email" → Should show "Please enter a valid email address"
- [ ] **Test Valid Data**: Fill all fields correctly → Should create tenant successfully
- [ ] **Verify Success**: Toast message appears
- [ ] **Verify Table Update**: New tenant appears in the table
- [ ] **Test Form Reset**: Close dialog, reopen "Create Tenant" → All fields should be empty again

### ✅ Edit Tenant Form
- [ ] Click "Edit" on any tenant
- [ ] **Verify**: Fields are prefilled with existing tenant data
- [ ] **Test Edit Name**: Change name → Should update successfully
- [ ] **Verify**: Code field is disabled (readonly)
- [ ] **Test Invalid Email**: Enter invalid email → Should show error
- [ ] Close dialog, reopen same tenant → Data should match before edit

---

## 2. Users Page Testing

### ✅ Create User Form
- [ ] Click "Add User" button
- [ ] **Verify**: All fields are empty (firstName, lastName, email, password, tenant)
- [ ] **Verify**: userType has default selection (PHARMACIST)
- [ ] **Test Empty First Name**: Leave empty → Should show "First name is required"
- [ ] **Test Short First Name**: Enter "A" → Should show "First name must be at least 2 characters"
- [ ] **Test Empty Last Name**: Leave empty → Should show "Last name is required"
- [ ] **Test Empty Email**: Leave empty → Should show "Email is required"
- [ ] **Test Invalid Email**: Enter "test@" → Should show "Please enter a valid email address"
- [ ] **Test Empty Password**: Leave empty → Should show "Password is required"
- [ ] **Test Short Password**: Enter "Pass1!" → Should show "Password must be at least 8 characters"
- [ ] **Test Weak Password**: Enter "password" → Should show "Password must include uppercase, lowercase, number & symbol"
- [ ] **Test No Uppercase**: Enter "password123!" → Should show error
- [ ] **Test No Lowercase**: Enter "PASSWORD123!" → Should show error
- [ ] **Test No Number**: Enter "Password!" → Should show error
- [ ] **Test No Symbol**: Enter "Password123" → Should show error
- [ ] **Test Valid Password**: Enter "TestUser123!" → Should show helper text (not error)
- [ ] **Test No Tenant Selected**: Leave tenant empty → Should show "Please select a tenant"
- [ ] **Test Valid Data**: Fill all fields correctly → Should create user successfully
- [ ] **Verify Success**: Toast message appears
- [ ] **Verify Table Update**: New user appears in the table
- [ ] **Test Form Reset**: Close dialog, reopen "Add User" → All fields should be empty again

### ✅ Reset Password Dialog
- [ ] Click "Reset Password" on any user
- [ ] **Verify**: Password field is empty
- [ ] **Test Short Password**: Enter "Pass1!" → Should show error
- [ ] **Test Weak Password**: Enter various weak passwords → Should show specific errors
- [ ] **Test Valid Password**: Enter "NewPass123!" → Should reset successfully
- [ ] **Test Form Reset**: Close dialog, reopen → Password field should be empty

---

## 3. Branches Page Testing

### ✅ Create Branch Form
- [ ] Click "Create Branch" button
- [ ] **Verify**: All fields are empty (name, phone, address)
- [ ] **Verify**: Governorate and City dropdowns show placeholders
- [ ] **Test Empty Name**: Leave empty → Should show "Branch name is required"
- [ ] **Test Short Name**: Enter "A" → Should show "Branch name must be at least 2 characters"
- [ ] **Test Empty Phone**: Leave empty → Should show "Phone number is required"
- [ ] **Test Invalid Phone Format**: Enter "12345" → Should show "Phone must be in format +965 followed by 8 digits"
- [ ] **Test Invalid Kuwait Format**: Enter "+1234567890" → Should show error
- [ ] **Test Valid Kuwait Phone**: Enter "+96512345678" → No error
- [ ] **Test Empty Address**: Leave empty → Should show "Address is required"
- [ ] **Test Short Address**: Enter "Test" → Should show "Address must be at least 10 characters"
- [ ] **Test No Governorate**: Leave empty → Should show "Please select a governorate"
- [ ] **Test No City**: Leave empty → Should show "Please select a city"
- [ ] **Test City Without Governorate**: Select city without governorate → Should show error
- [ ] **Test Valid Data**: Fill all fields correctly → Should create branch successfully
- [ ] **Verify Success**: Toast message appears
- [ ] **Verify Table Update**: New branch appears in the table
- [ ] **Test Form Reset**: Close dialog, reopen "Create Branch" → All fields should be empty again

### ✅ Edit Branch Form
- [ ] Click "Edit" on any branch
- [ ] **Verify**: Fields are prefilled with existing branch data
- [ ] **Verify**: Phone field is disabled (cannot change phone on edit)
- [ ] **Test Edit Name**: Change name → Should update successfully
- [ ] **Test Edit Address**: Change address → Should update successfully
- [ ] **Test Change Location**: Change governorate/city → Should update successfully
- [ ] Close dialog, reopen same branch → Data should match before edit

---

## 4. API Response Validation

### ✅ Tenant Creation
```bash
# Test with curl or Postman
POST http://admin.localhost:3000/api/v1/admin/tenants
Headers: Authorization: Bearer {token}
Body: {
  "name": "API Test Tenant",
  "code": "api-test-tenant",
  "status": "active",
  "subscriptionPlan": "free",
  "billingEmail": "test@example.com"
}
Expected: 201 Created with tenant object
```

### ✅ User Creation
```bash
POST http://admin.localhost:3000/api/v1/admin/users
Headers: Authorization: Bearer {token}
Body: {
  "firstName": "API",
  "lastName": "User",
  "email": "apiuser@test.com",
  "password": "ApiUser123!",
  "userType": "pharmacist",
  "tenantId": "{tenant_id}"
}
Expected: 201 Created with user object
```

### ✅ Branch Creation
```bash
POST http://localhost:3000/api/v1/pharmacies/{pharmacy_id}/branches
Headers: Authorization: Bearer {token}
Body: {
  "name": "API Test Branch",
  "phone": "+96512345678",
  "address": "Test Address 123, Kuwait City",
  "governorateId": 1,
  "cityId": 1
}
Expected: 201 Created with branch object
```

---

## 5. Error Handling Tests

### ✅ Network Errors
- [ ] Disconnect from internet
- [ ] Try to create tenant/user/branch
- [ ] **Verify**: Appropriate error message shows
- [ ] **Verify**: Form data is preserved (not lost)
- [ ] Reconnect and retry
- [ ] **Verify**: Operation succeeds

### ✅ Duplicate Entries
- [ ] Try to create tenant with existing code
- [ ] **Verify**: Error message about duplicate code
- [ ] Try to create user with existing email
- [ ] **Verify**: Error message about duplicate email
- [ ] Try to create branch with existing phone
- [ ] **Verify**: Error message about duplicate phone

### ✅ Validation Errors
- [ ] Submit form with multiple validation errors
- [ ] **Verify**: All errors show simultaneously
- [ ] Fix one error
- [ ] **Verify**: That specific error disappears
- [ ] **Verify**: Other errors remain visible

---

## 6. Form Reset Verification

### ✅ After Successful Creation
- [ ] Create a tenant successfully
- [ ] **Verify**: Dialog closes automatically
- [ ] Reopen "Create Tenant" dialog
- [ ] **Verify**: Form is completely empty
- [ ] Repeat for User and Branch creation

### ✅ After Dialog Close (Cancel)
- [ ] Open "Create Tenant" dialog
- [ ] Fill some fields with data
- [ ] Click "Cancel" or close dialog
- [ ] Reopen "Create Tenant" dialog
- [ ] **Verify**: Form is completely empty (previous data cleared)
- [ ] Repeat for User and Branch creation

### ✅ After Edit Dialog
- [ ] Edit a tenant
- [ ] Close without saving
- [ ] Open "Create Tenant" dialog
- [ ] **Verify**: Form is empty (not showing edit data)
- [ ] Repeat for User and Branch

---

## 7. Field Interaction Tests

### ✅ Error Clearing on Type
- [ ] Trigger a validation error
- [ ] **Verify**: Red border and error text appear
- [ ] Start typing in the field
- [ ] **Verify**: Error disappears immediately
- [ ] **Verify**: Red border is removed
- [ ] Test for all validated fields

### ✅ Helper Text vs Error Text
- [ ] Open "Add User" dialog
- [ ] Focus password field
- [ ] **Verify**: Gray helper text shows password requirements
- [ ] Enter weak password and blur
- [ ] **Verify**: Helper text replaced with red error text
- [ ] Enter valid password
- [ ] **Verify**: Error text replaced with helper text again

### ✅ Conditional Field Validation
- [ ] In Branches form, select a governorate
- [ ] **Verify**: City dropdown is populated with cities from that governorate
- [ ] Change governorate
- [ ] **Verify**: City dropdown updates
- [ ] Select a city, then change governorate
- [ ] **Verify**: City selection is cleared if new governorate doesn't have that city

---

## Test Results Summary

### Tenants Page
- [ ] All validation working ✓
- [ ] Forms reset properly ✓
- [ ] API integration working ✓
- [ ] Error handling working ✓

### Users Page
- [ ] All validation working ✓
- [ ] Forms reset properly ✓
- [ ] API integration working ✓
- [ ] Error handling working ✓

### Branches Page
- [ ] All validation working ✓
- [ ] Forms reset properly ✓
- [ ] API integration working ✓
- [ ] Error handling working ✓

---

## Notes & Issues Found

*(Add any issues or observations here)*

---

## Sign-off

- Tester: _________________
- Date: _________________
- Overall Status: [ ] PASS [ ] FAIL [ ] NEEDS WORK
