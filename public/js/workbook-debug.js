/**
 * WORKBOOK DEBUG SCRIPT
 * Chạy script này trong Console để kiểm tra buttons và event listeners
 */

console.log('🔍 WORKBOOK DEBUGGING STARTED');
console.log('==========================================');

// 1. Kiểm tra workbook ID
const workbookElement = document.querySelector('[data-workbook-id]');
console.log('1️⃣ Workbook element:', workbookElement);
console.log('   Workbook ID:', workbookElement ? workbookElement.dataset.workbookId : 'NOT FOUND');

// 2. Kiểm tra các buttons quan trọng
console.log('\n2️⃣ BUTTONS CHECK:');
const buttons = {
  'Add Week': document.querySelector('[data-action="add-week"]'),
  'Submit Workbook': document.querySelector('[data-action="submit-workbook"]'),
  'Add Task': document.querySelector('[data-action="add-task"]'),
  'Save Notes': document.querySelector('[data-action="save-notes"]'),
  'Prev Week': document.querySelector('[data-action="prev-week"]'),
  'Next Week': document.querySelector('[data-action="next-week"]')
};

for (const [name, btn] of Object.entries(buttons)) {
  if (btn) {
    console.log(`   ✅ ${name}:`, btn);
    console.log(`      - Tag: ${btn.tagName}`);
    console.log(`      - Text: ${btn.textContent.trim().substring(0, 30)}`);
    console.log(`      - data-action: ${btn.dataset.action}`);
  } else {
    console.log(`   ❌ ${name}: NOT FOUND`);
  }
}

// 3. Kiểm tra edit buttons
console.log('\n3️⃣ EDIT BUTTONS:');
const editButtons = document.querySelectorAll('.card-edit-btn');
console.log(`   Found ${editButtons.length} edit buttons`);
editButtons.forEach((btn, index) => {
  console.log(`   - Button ${index + 1}:`, {
    day: btn.dataset.day,
    workbook: btn.dataset.workbook
  });
});

// 4. Kiểm tra modal
console.log('\n4️⃣ MODAL CHECK:');
const modal = document.getElementById('editDayModal');
console.log('   Modal:', modal ? '✅ Found' : '❌ Not found');
if (modal) {
  const form = document.getElementById('dayEntryForm');
  console.log('   Form:', form ? '✅ Found' : '❌ Not found');
  const tasksList = document.getElementById('tasksList');
  console.log('   Tasks list:', tasksList ? '✅ Found' : '❌ Not found');
}

// 5. Kiểm tra WorkbookApp global object
console.log('\n5️⃣ GLOBAL OBJECT:');
if (window.WorkbookApp) {
  console.log('   ✅ window.WorkbookApp exists');
  console.log('   Available functions:', Object.keys(window.WorkbookApp));
} else {
  console.log('   ❌ window.WorkbookApp NOT FOUND');
}

// 6. Test click manually
console.log('\n6️⃣ MANUAL TEST FUNCTIONS:');
console.log('   Run these in console to test:');
console.log('   - testAddWeek()');
console.log('   - testAddTask()');
console.log('   - testSaveNotes()');

window.testAddWeek = function() {
  console.log('🧪 Testing Add Week button...');
  const btn = document.querySelector('[data-action="add-week"]');
  if (btn) {
    console.log('Button found, triggering click...');
    btn.click();
  } else {
    console.error('Button not found!');
  }
};

window.testAddTask = function() {
  console.log('🧪 Testing Add Task button...');
  const btn = document.querySelector('[data-action="add-task"]');
  if (btn) {
    console.log('Button found, triggering click...');
    btn.click();
  } else {
    console.error('Button not found! (Note: This button is inside modal)');
  }
};

window.testSaveNotes = function() {
  console.log('🧪 Testing Save Notes button...');
  const btn = document.querySelector('[data-action="save-notes"]');
  if (btn) {
    console.log('Button found, triggering click...');
    btn.click();
  } else {
    console.error('Button not found!');
  }
};

window.testOpenModal = function() {
  console.log('🧪 Testing Open Modal...');
  const btn = document.querySelector('.card-edit-btn');
  if (btn) {
    console.log('Edit button found, triggering click...');
    btn.click();
  } else {
    console.error('Edit button not found!');
  }
};

// 7. Check event listeners (approximate)
console.log('\n7️⃣ EVENT LISTENERS CHECK:');
const addWeekBtn = document.querySelector('[data-action="add-week"]');
if (addWeekBtn) {
  const listeners = getEventListeners(addWeekBtn);
  if (typeof getEventListeners !== 'undefined') {
    console.log('   Add Week button listeners:', listeners);
  } else {
    console.log('   ⚠️ getEventListeners() not available (Chrome DevTools only)');
    console.log('   Try clicking the button manually to see if it works');
  }
}

console.log('\n==========================================');
console.log('✅ DEBUG COMPLETE');
console.log('Try running: testAddWeek(), testOpenModal(), testSaveNotes()');
