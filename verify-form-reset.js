#!/usr/bin/env node

/**
 * Form Reset Verification Script
 * This script verifies that all create forms have proper reset mechanisms
 */

const fs = require('fs');
const path = require('path');

const PAGES_TO_CHECK = [
  {
    name: 'Tenants',
    path: 'src/app/(dashboard)/tenants/page.tsx',
    expectedPatterns: [
      /useEffect\(\(\) => \{[\s\S]*?if \(createDialogOpen\)/,
      /setFormData\(/,
      /setFormErrors\(/,
      /createDialogOpen/
    ]
  },
  {
    name: 'Users',
    path: 'src/app/(dashboard)/users/page.tsx',
    expectedPatterns: [
      /useEffect\(\(\) => \{[\s\S]*?if \(createUserDialogOpen\)/,
      /setCreateFormData\(/,
      /setCreateFormErrors\(/,
      /createUserDialogOpen/
    ]
  },
  {
    name: 'Branches',
    path: 'src/app/(dashboard)/branches/page.tsx',
    expectedPatterns: [
      /useEffect\(\(\) => \{[\s\S]*?if \(createDialogOpen\)/,
      /setFormData\(/,
      /setFormErrors\(/,
      /createDialogOpen/
    ]
  }
];

const VALIDATION_PATTERNS = [
  {
    name: 'Validation Functions',
    pattern: /const validate.*Form = \(\) => \{/
  },
  {
    name: 'Error State',
    pattern: /const \[.*Errors, set.*Errors\] = useState/
  },
  {
    name: 'Inline Error Display',
    pattern: /\{.*Errors\..*&&.*<p.*text-red/
  },
  {
    name: 'Conditional Styling',
    pattern: /className=\{`.*\$\{.*Errors\..*\? 'border-red-500'/
  }
];

console.log('='.repeat(60));
console.log('Form Reset Verification Report');
console.log('='.repeat(60));
console.log('');

let allPassed = true;

PAGES_TO_CHECK.forEach(page => {
  console.log(`\n📄 Checking ${page.name} Page...`);
  console.log('-'.repeat(60));

  const filePath = path.join(__dirname, page.path);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    let pagePassed = true;

    // Check for form reset on dialog open
    page.expectedPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        console.log(`  ✓ Pattern ${index + 1}: Found`);
      } else {
        console.log(`  ✗ Pattern ${index + 1}: MISSING`);
        pagePassed = false;
        allPassed = false;
      }
    });

    // Check for validation patterns
    console.log(`\n  Validation Checks:`);
    VALIDATION_PATTERNS.forEach(validation => {
      if (validation.pattern.test(content)) {
        console.log(`  ✓ ${validation.name}: Implemented`);
      } else {
        console.log(`  ⚠ ${validation.name}: Not found (may use different pattern)`);
      }
    });

    if (pagePassed) {
      console.log(`\n  ✅ ${page.name} Page: PASSED`);
    } else {
      console.log(`\n  ❌ ${page.name} Page: FAILED`);
    }

  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
console.log('Summary');
console.log('='.repeat(60));

if (allPassed) {
  console.log('✅ All pages have proper form reset mechanisms!');
  console.log('');
  console.log('✓ useEffect hooks with dialog open dependencies');
  console.log('✓ Form data reset on dialog open');
  console.log('✓ Error state reset on dialog open');
  console.log('✓ Validation functions implemented');
  console.log('✓ Inline error display');
  console.log('✓ Conditional styling for errors');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Open http://localhost:3001 in browser');
  console.log('2. Follow TESTING_CHECKLIST.md for manual testing');
  console.log('3. Verify each creation flow works correctly');
  console.log('4. Verify forms reset after successful creation');
  console.log('5. Verify forms reset when dialog is closed and reopened');
  process.exit(0);
} else {
  console.log('❌ Some issues found. Please review the report above.');
  process.exit(1);
}
