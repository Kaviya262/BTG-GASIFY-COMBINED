# Currency Utilities - Usage Guide

## Overview
This utility provides custom rounding logic for IDR currency with the following rules:
- **Decimal < 0.5**: Round down to 0
- **Decimal >= 0.5**: Round up to 1
- **Result**: No decimals for IDR

## Functions

### 1. `roundIDR(value)`
Custom rounding specifically for IDR currency.

**Examples:**
```javascript
import { roundIDR } from './currencyUtils';

roundIDR(10.40);  // Returns: 10 (0.40 < 0.5, rounds down)
roundIDR(10.49);  // Returns: 10 (0.49 < 0.5, rounds down)
roundIDR(10.50);  // Returns: 11 (0.50 >= 0.5, rounds up)
roundIDR(10.80);  // Returns: 11 (0.80 >= 0.5, rounds up)
roundIDR(5.00);   // Returns: 5
```

### 2. `formatCurrency(value, currencyCode)`
Formats currency values based on currency code.

**Examples:**
```javascript
import { formatCurrency } from './currencyUtils';

formatCurrency(10.80, 'IDR');  // Returns: "11" (rounded, no decimals)
formatCurrency(10.40, 'IDR');  // Returns: "10" (rounded, no decimals)
formatCurrency(10.80, 'USD');  // Returns: "10.80" (2 decimals)
formatCurrency(10.40, 'SGD');  // Returns: "10.40" (2 decimals)
```

### 3. `roundByCurrency(value, currencyCode)`
Rounds values based on currency code.

**Examples:**
```javascript
import { roundByCurrency } from './currencyUtils';

roundByCurrency(10.80, 'IDR');  // Returns: 11 (number)
roundByCurrency(10.40, 'IDR');  // Returns: 10 (number)
roundByCurrency(10.456, 'USD'); // Returns: 10.46 (number, 2 decimals)
```

## Usage in Your Code

### Example 1: In Purchase Requisition
```javascript
import { roundIDR, formatCurrency } from 'common/currencyUtils';

// When calculating totals for IDR
const calculateTotal = (items, currencyCode) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    if (currencyCode === 'IDR') {
        return roundIDR(total);  // Returns number with no decimals
    }
    return parseFloat(total.toFixed(2));
};

// When displaying values
const displayValue = (value, currencyCode) => {
    return formatCurrency(value, currencyCode);
};
```

### Example 2: In Form Calculations
```javascript
import { roundByCurrency } from 'common/currencyUtils';

const handleCalculation = (unitPrice, quantity, currencyCode) => {
    const rawTotal = unitPrice * quantity;
    const roundedTotal = roundByCurrency(rawTotal, currencyCode);
    
    setFieldValue('totalAmount', roundedTotal);
};
```

### Example 3: Replacing Math.round for IDR
```javascript
// OLD CODE (for IDR):
const netTotal = Math.round(calculatedTotal).toFixed(2);  // Wrong for IDR

// NEW CODE (for IDR):
import { roundIDR } from 'common/currencyUtils';
const netTotal = roundIDR(calculatedTotal);  // Correct for IDR
```

## Where to Apply

Based on your codebase, you should apply this in:

1. **Purchase Requisition files:**
   - `procurementsadd-purchaserequisition.js`
   - `procurementscopy-purchaserequisition.js`

2. **Purchase Order files:**
   - `procurementsadd-purchaseorder.js`

3. **Invoice files:**
   - `add-invoice.js`
   - `add-manual-invoice.js`

4. **Claim & Payment files:**
   - `add-claim&payment.js`
   - `copy-claim&payment.js`

## Important Notes

- Only use these functions when the currency is IDR
- For other currencies (USD, SGD, etc.), continue using standard `.toFixed(2)`
- Always check the currency code before applying IDR-specific rounding
- The functions handle null/undefined/NaN values safely
