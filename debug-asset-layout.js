/* CSS Debug Helper - Add to browser console */
/* Paste this in DevTools Console to check layout */

console.log('🔍 Checking Asset Page Layout...\n');

const checks = [
  {
    selector: '.asset-page',
    property: 'maxWidth',
    expected: 'none',
    description: 'Asset page should not have max-width'
  },
  {
    selector: '.asset-page',
    property: 'width',
    expected: /100%|.*px/,
    description: 'Asset page should have full width'
  },
  {
    selector: '.asset-main-layout',
    property: 'gridTemplateColumns',
    expected: /1fr.*380px|1fr.*340px/,
    description: 'Main layout should use "1fr 380px" or "1fr 340px"'
  },
  {
    selector: '.asset-grid',
    property: 'gridTemplateColumns',
    expected: /repeat/,
    description: 'Asset grid should use repeat()'
  },
  {
    selector: '.app-content',
    property: 'maxWidth',
    expected: 'none',
    description: 'App content should not have max-width'
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach(check => {
  const element = document.querySelector(check.selector);
  if (!element) {
    console.log(`❌ ${check.description}`);
    console.log(`   Element not found: ${check.selector}\n`);
    return;
  }
  
  const computedStyle = window.getComputedStyle(element);
  const value = computedStyle[check.property];
  
  let passed = false;
  if (check.expected instanceof RegExp) {
    passed = check.expected.test(value);
  } else {
    passed = value === check.expected;
  }
  
  if (passed) {
    console.log(`✅ ${check.description}`);
    console.log(`   ${check.selector} { ${check.property}: ${value} }\n`);
    passedChecks++;
  } else {
    console.log(`❌ ${check.description}`);
    console.log(`   ${check.selector} { ${check.property}: ${value} }`);
    console.log(`   Expected: ${check.expected}\n`);
  }
});

console.log(`📊 Results: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 All layout checks passed!');
} else {
  console.log('⚠️  Some checks failed. Try hard refresh (Ctrl+Shift+R)');
}

// Additional info
console.log('\n📐 Layout dimensions:');
const assetPage = document.querySelector('.asset-page');
if (assetPage) {
  const rect = assetPage.getBoundingClientRect();
  console.log(`   Asset page width: ${Math.round(rect.width)}px`);
}

const appContent = document.querySelector('.app-content');
if (appContent) {
  const rect = appContent.getBoundingClientRect();
  console.log(`   App content width: ${Math.round(rect.width)}px`);
}

const mainLayout = document.querySelector('.asset-main-layout');
if (mainLayout) {
  const rect = mainLayout.getBoundingClientRect();
  console.log(`   Main layout width: ${Math.round(rect.width)}px`);
}
