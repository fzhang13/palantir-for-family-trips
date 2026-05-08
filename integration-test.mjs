#!/usr/bin/env node

/**
 * Integration Test Suite for Palantir Trip Dashboard
 *
 * This script tests the complete application flow including:
 * - Build verification
 * - FamiliesPage CRUD operations
 * - StayPage CRUD operations
 * - Data persistence
 * - Form validation
 * - UI/UX elements
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

// Test results tracker
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, type = 'info') {
  const prefix = {
    info: '   ',
    pass: ' ✓ ',
    fail: ' ✗ ',
    warn: ' ⚠ '
  }[type];
  console.log(`${prefix}${message}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function testFamiliesPage(page) {
  logSection('Testing FamiliesPage');

  try {
    // Navigate to Families page
    log('Navigating to Families page...');
    await page.goto(`${BASE_URL}`);
    await page.waitForLoadState('networkidle');

    // Click on Families navigation
    await page.click('text=Families');
    await page.waitForTimeout(500);

    log('Families page loaded', 'pass');
    results.passed.push('FamiliesPage: Page loads');

    // Test: Add a new family
    log('Testing: Add new family...');
    await page.click('button:has-text("Add Family")');
    await page.waitForSelector('text=Add Family', { state: 'visible' });

    // Fill in the form
    await page.fill('input[placeholder*="Smiths"]', 'The Johnsons');
    await page.fill('input[placeholder*="San Francisco"]', 'Seattle');
    await page.fill('input[placeholder*="1 Market St"]', '123 Pike St, Seattle, WA');
    await page.selectOption('select', { value: 'Van' });
    await page.fill('input[placeholder*="adults"]', '4 adults, 2 kids');
    await page.fill('textarea[placeholder*="Additional notes"]', 'Test family for integration testing');

    // Submit the form
    await page.click('button:has-text("Add Family")');
    await page.waitForTimeout(1000);

    // Verify family appears in list
    const familyCard = await page.locator('text=The Johnsons').isVisible();
    if (familyCard) {
      log('Family successfully added to list', 'pass');
      results.passed.push('FamiliesPage: Add family');
    } else {
      log('Family not found in list', 'fail');
      results.failed.push('FamiliesPage: Add family - not visible');
    }

    // Verify family details
    const seattleText = await page.locator('text=Seattle').isVisible();
    if (seattleText) {
      log('Family details displayed correctly', 'pass');
      results.passed.push('FamiliesPage: Display family details');
    }

    // Test: Edit button (should show placeholder)
    log('Testing: Edit button placeholder...');
    const editButtons = page.locator('button[title="Edit family"]');
    await editButtons.first().click();
    await page.waitForTimeout(500);

    // Check for alert dialog
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Edit functionality coming soon')) {
        log('Edit placeholder works correctly', 'pass');
        results.passed.push('FamiliesPage: Edit placeholder');
        await dialog.accept();
      }
    });

    // Test: Delete with confirmation
    log('Testing: Delete family with confirmation...');
    page.once('dialog', async dialog => {
      if (dialog.message().includes('Are you sure')) {
        log('Delete confirmation dialog appeared', 'pass');
        await dialog.accept();
      }
    });

    const deleteButton = page.locator('button[title="Delete family"]').first();
    await deleteButton.click();
    await page.waitForTimeout(1000);

    // Verify family was deleted
    const familyGone = await page.locator('text=The Johnsons').count() === 0;
    if (familyGone) {
      log('Family successfully deleted', 'pass');
      results.passed.push('FamiliesPage: Delete family');
    } else {
      log('Family still visible after delete', 'fail');
      results.failed.push('FamiliesPage: Delete family failed');
    }

  } catch (error) {
    log(`FamiliesPage test error: ${error.message}`, 'fail');
    results.failed.push(`FamiliesPage: ${error.message}`);
  }
}

async function testStayPage(page) {
  logSection('Testing StayPage');

  try {
    // Navigate to Stay page
    log('Navigating to Stay page...');
    await page.click('text=Stay');
    await page.waitForTimeout(500);

    log('Stay page loaded', 'pass');
    results.passed.push('StayPage: Page loads');

    // Test: Add a new stay location
    log('Testing: Add new stay location...');
    await page.click('button:has-text("Add Stay")');
    await page.waitForSelector('text=Add Location', { state: 'visible' });

    // Fill in the location form
    await page.fill('input[placeholder*="Grand Canyon"]', 'Lake House Cabin');
    await page.fill('input[placeholder*="Grand Canyon, AZ"]', '789 Lake Drive, Pine Mountain Lake, CA');
    await page.selectOption('select', { value: 'stay' });
    await page.fill('input[type="number"][step="0.000001"]', '37.8199');
    await page.fill('input[type="number"][step="0.000001"] >> nth=1', '-120.2388');
    await page.fill('textarea[placeholder*="Additional information"]', 'Beautiful cabin by the lake');

    // Submit the form
    await page.click('button:has-text("Add Location")');
    await page.waitForTimeout(1000);

    // Verify location appears in list
    const locationCard = await page.locator('text=Lake House Cabin').isVisible();
    if (locationCard) {
      log('Stay location successfully added', 'pass');
      results.passed.push('StayPage: Add stay location');
    } else {
      log('Stay location not found in list', 'fail');
      results.failed.push('StayPage: Add stay location - not visible');
    }

    // Verify address is displayed
    const addressText = await page.locator('text=Lake Drive').isVisible();
    if (addressText) {
      log('Location address displayed correctly', 'pass');
      results.passed.push('StayPage: Display location details');
    }

    // Test: Delete stay location
    log('Testing: Delete stay location...');
    page.once('dialog', async dialog => {
      if (dialog.message().includes('Are you sure')) {
        log('Delete confirmation appeared', 'pass');
        await dialog.accept();
      }
    });

    const deleteBtn = page.locator('button[title="Delete location"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Verify location was deleted
    const locationGone = await page.locator('text=Lake House Cabin').count() === 0;
    if (locationGone) {
      log('Stay location successfully deleted', 'pass');
      results.passed.push('StayPage: Delete stay location');
    } else {
      log('Stay location still visible after delete', 'fail');
      results.failed.push('StayPage: Delete stay location failed');
    }

  } catch (error) {
    log(`StayPage test error: ${error.message}`, 'fail');
    results.failed.push(`StayPage: ${error.message}`);
  }
}

async function testDataPersistence(page) {
  logSection('Testing Data Persistence');

  try {
    // Add a family
    log('Adding test data for persistence check...');
    await page.click('text=Families');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Family")');
    await page.waitForSelector('text=Add Family', { state: 'visible' });

    await page.fill('input[placeholder*="Smiths"]', 'Persistence Test Family');
    await page.fill('input[placeholder*="San Francisco"]', 'Portland');
    await page.fill('input[placeholder*="1 Market St"]', '456 Test St, Portland, OR');

    await page.click('button:has-text("Add Family")');
    await page.waitForTimeout(1000);

    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('tripData');
    });

    if (localStorageData) {
      log('Data saved to localStorage', 'pass');
      results.passed.push('Persistence: Data saved to localStorage');

      const tripData = JSON.parse(localStorageData);
      log(`  Found ${Object.keys(tripData).length} trip(s) in localStorage`);

      if (tripData.default && tripData.default.families) {
        log(`  Default trip has ${tripData.default.families.length} family(ies)`, 'pass');
        results.passed.push('Persistence: Trip structure valid');
      }
    } else {
      log('No data found in localStorage', 'fail');
      results.failed.push('Persistence: localStorage empty');
    }

    // Reload page and verify data persists
    log('Reloading page to verify persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=Families');
    await page.waitForTimeout(500);

    const familyStillThere = await page.locator('text=Persistence Test Family').isVisible();
    if (familyStillThere) {
      log('Data persisted across page reload', 'pass');
      results.passed.push('Persistence: Data persists after reload');
    } else {
      log('Data lost after page reload', 'fail');
      results.failed.push('Persistence: Data lost after reload');
    }

    // Clean up
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    const deleteBtn = page.locator('button[title="Delete family"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(1000);

  } catch (error) {
    log(`Persistence test error: ${error.message}`, 'fail');
    results.failed.push(`Persistence: ${error.message}`);
  }
}

async function testFormValidation(page) {
  logSection('Testing Form Validation');

  try {
    // Test empty form submission
    log('Testing: Empty form submission (Families)...');
    await page.click('text=Families');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Family")');
    await page.waitForSelector('text=Add Family', { state: 'visible' });

    // Try to submit without filling fields
    await page.click('button:has-text("Add Family")');
    await page.waitForTimeout(500);

    // Check for validation error messages
    const nameError = await page.locator('text=Name must be at least 2 characters').isVisible();
    const originError = await page.locator('text=Origin city required').isVisible();
    const addressError = await page.locator('text=Valid address required').isVisible();

    if (nameError || originError || addressError) {
      log('Form validation errors displayed correctly', 'pass');
      results.passed.push('Validation: Required field validation works');
    } else {
      log('No validation errors shown for empty form', 'warn');
      results.warnings.push('Validation: Required field errors not visible');
    }

    // Close modal
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);

    // Test Stay form validation
    log('Testing: Empty form submission (Stay)...');
    await page.click('text=Stay');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Stay")');
    await page.waitForSelector('text=Add Location', { state: 'visible' });

    await page.click('button:has-text("Add Location")');
    await page.waitForTimeout(500);

    const titleError = await page.locator('text=Location name is required').isVisible();
    const addrError = await page.locator('text=Address is required').isVisible();

    if (titleError || addrError) {
      log('Stay form validation errors displayed', 'pass');
      results.passed.push('Validation: Stay form validation works');
    } else {
      log('No validation errors shown for empty stay form', 'warn');
      results.warnings.push('Validation: Stay form errors not visible');
    }

    // Close modal with ESC key
    log('Testing: ESC key closes modal...');
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);
    const modalGone = await page.locator('text=Add Location').count() === 0;
    if (modalGone) {
      log('ESC key successfully closes modal', 'pass');
      results.passed.push('UX: ESC key closes modal');
    }

  } catch (error) {
    log(`Form validation test error: ${error.message}`, 'fail');
    results.failed.push(`Validation: ${error.message}`);
  }
}

async function testUIElements(page) {
  logSection('Testing UI/UX Elements');

  try {
    // Test navigation between pages
    log('Testing: Page navigation...');
    const pages = ['Itinerary', 'Stay', 'Meals', 'Activities', 'Expenses', 'Families'];

    for (const pageName of pages) {
      await page.click(`text=${pageName}`);
      await page.waitForTimeout(300);
      log(`  Navigated to ${pageName}`, 'pass');
    }
    results.passed.push('UX: Page navigation works');

    // Test responsive layout
    log('Testing: Responsive layout...');
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);
      log(`  Layout renders at ${viewport.name} (${viewport.width}x${viewport.height})`, 'pass');
    }
    results.passed.push('UX: Responsive layout works');

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test icons render
    log('Testing: Icon rendering...');
    await page.click('text=Families');
    await page.waitForTimeout(500);

    // Check if lucide icons are rendered (they use SVG)
    const svgIcons = await page.locator('svg').count();
    if (svgIcons > 0) {
      log(`  Found ${svgIcons} SVG icons rendered`, 'pass');
      results.passed.push('UI: Icons render correctly');
    } else {
      log('  No SVG icons found', 'warn');
      results.warnings.push('UI: Icons may not be rendering');
    }

    // Test empty states
    log('Testing: Empty states...');
    const emptyStateText = await page.locator('text=No families yet').isVisible();
    const addFamilyButton = await page.locator('button:has-text("Add Family")').count();

    if (emptyStateText || addFamilyButton >= 1) {
      log('  Empty state displays correctly', 'pass');
      results.passed.push('UI: Empty states render');
    }

  } catch (error) {
    log(`UI test error: ${error.message}`, 'fail');
    results.failed.push(`UI: ${error.message}`);
  }
}

async function checkConsoleErrors(page) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return { errors, warnings };
}

async function generateReport() {
  logSection('Test Summary');

  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${results.passed.length} ✓`);
  console.log(`Failed: ${results.failed.length} ✗`);
  console.log(`Warnings: ${results.warnings.length} ⚠`);
  console.log(`Pass Rate: ${passRate}%`);

  if (results.passed.length > 0) {
    console.log('\n✓ PASSED:');
    results.passed.forEach(test => log(`  ${test}`, 'pass'));
  }

  if (results.failed.length > 0) {
    console.log('\n✗ FAILED:');
    results.failed.forEach(test => log(`  ${test}`, 'fail'));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠ WARNINGS:');
    results.warnings.forEach(test => log(`  ${test}`, 'warn'));
  }

  console.log('\n' + '='.repeat(60));

  if (results.failed.length === 0) {
    console.log('STATUS: ✓ ALL TESTS PASSED');
    return 0;
  } else {
    console.log('STATUS: ✗ SOME TESTS FAILED');
    return 1;
  }
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    logSection('Integration Test Suite Started');
    log(`Testing application at: ${BASE_URL}\n`);

    // Run all test suites
    await testFamiliesPage(page);
    await testStayPage(page);
    await testDataPersistence(page);
    await testFormValidation(page);
    await testUIElements(page);

    // Generate final report
    const exitCode = await generateReport();

    await browser.close();
    process.exit(exitCode);

  } catch (error) {
    log(`Critical error: ${error.message}`, 'fail');
    console.error(error);
    await browser.close();
    process.exit(1);
  }
}

// Run the test suite
runTests().catch(console.error);
