// ============================================================
// script.js — Frontend JavaScript (CRUD via fetch())
// ============================================================
// This file handles ALL user interactions in the browser.
//
// What this file does:
//   1. Sends HTTP requests to the Express API using fetch()
//   2. Displays the response data in the HTML table
//   3. Handles form submission (Create + Update)
//   4. Handles Edit button (pre-fills form)
//   5. Handles Delete button (confirmation + delete)
//   6. Updates dashboard stats
//   7. Handles search, filter, and sort
//   8. Shows toast notifications
//
// DATA FLOW:
//   User Action → fetch() → Express API → MySQL → Response → Update UI
// ============================================================

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────
// The base URL of the backend API.
// Change this if your backend runs on a different port.
const API_BASE = 'http://localhost:3000/api';

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let isEditMode = false; // Are we editing an existing expense?
let editingId  = null;  // The ID of the expense being edited

// ─────────────────────────────────────────────
// DOM ELEMENT REFERENCES
// ─────────────────────────────────────────────
const form           = document.getElementById('expense-form');
const btnSubmitText  = document.getElementById('btn-submit-text');
const formTitle      = document.getElementById('form-title');
const btnCancelEdit  = document.getElementById('btn-cancel-edit');
const editIdInput    = document.getElementById('edit-id');
const tbody          = document.getElementById('expense-tbody');
const loadingSpinner = document.getElementById('loading-spinner');
const noData         = document.getElementById('no-data');
const tableWrapper   = document.getElementById('table-wrapper');
const recordCount    = document.getElementById('record-count');

// Dashboard stat elements
const statTotal   = document.getElementById('stat-total');
const statCount   = document.getElementById('stat-count');
const statHighest = document.getElementById('stat-highest');
const statAvg     = document.getElementById('stat-average');

// Filter elements
const searchInput    = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterPayment  = document.getElementById('filter-payment');
const sortBy         = document.getElementById('sort-by');
const sortOrder      = document.getElementById('sort-order');

// ============================================================
// SECTION 1: TOAST NOTIFICATIONS
// ============================================================
// Shows a small popup message at the top-right of the screen.
// type can be 'success' or 'error'
// ============================================================
let toastTimer = null;

function showToast(message, type = 'success') {
  const toast   = document.getElementById('toast');
  const toastMsg  = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  // Set the message and icon
  toastMsg.textContent  = message;
  toastIcon.textContent = type === 'success' ? '✅' : '❌';

  // Apply the correct class
  toast.className = `toast toast-${type} show`;

  // Hide automatically after 3.5 seconds
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ============================================================
// SECTION 2: FORM VALIDATION (Client-Side)
// ============================================================
// Validates the form before sending to the API.
// Returns true if valid, false if there are errors.
// ============================================================
function validateForm(data) {
  let isValid = true;

  // Clear all previous error messages
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

  // Validate Title
  if (!data.title || data.title.trim() === '') {
    document.getElementById('err-title').textContent = 'Title is required.';
    isValid = false;
  }

  // Validate Amount
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) {
    document.getElementById('err-amount').textContent = 'Amount must be greater than 0.';
    isValid = false;
  }

  // Validate Category
  if (!data.category) {
    document.getElementById('err-category').textContent = 'Please select a category.';
    isValid = false;
  }

  // Validate Date
  if (!data.expense_date) {
    document.getElementById('err-date').textContent = 'Please select a date.';
    isValid = false;
  }

  // Validate Payment Method
  if (!data.payment_method) {
    document.getElementById('err-payment').textContent = 'Please select a payment method.';
    isValid = false;
  }

  return isValid;
}

// ============================================================
// SECTION 3: READ ALL — Fetch and Display Expenses
// ============================================================
// GET /api/expenses
//
// This function:
//   1. Builds the URL with query params (search, filter, sort)
//   2. Calls the API using fetch()
//   3. Parses the JSON response
//   4. Builds the HTML table rows
//   5. Inserts them into the DOM
// ============================================================
async function fetchExpenses() {
  // Show loading state
  loadingSpinner.classList.remove('hidden');
  noData.classList.add('hidden');
  tableWrapper.classList.add('hidden');

  try {
    // Build query parameters from the filter controls
    const params = new URLSearchParams();
    if (searchInput.value.trim())    params.append('search',         searchInput.value.trim());
    if (filterCategory.value)         params.append('category',        filterCategory.value);
    if (filterPayment.value)          params.append('payment_method',  filterPayment.value);
    if (sortBy.value)                 params.append('sort_by',         sortBy.value);
    if (sortOrder.value)              params.append('sort_order',      sortOrder.value);

    // Build the full URL
    const url = `${API_BASE}/expenses?${params.toString()}`;

    // ── THE FETCH CALL ──
    // fetch() sends an HTTP GET request to the API.
    // It returns a Promise, so we use await to wait for it.
    const response = await fetch(url);

    // Parse the JSON body of the response
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch expenses.');
    }

    const expenses = result.data;

    // Update the record count badge
    recordCount.textContent = `${expenses.length} record${expenses.length !== 1 ? 's' : ''}`;

    // Hide spinner
    loadingSpinner.classList.add('hidden');

    if (expenses.length === 0) {
      // Show "no data" message
      noData.classList.remove('hidden');
      tableWrapper.classList.add('hidden');
      return;
    }

    // Build table rows
    tbody.innerHTML = ''; // Clear existing rows
    expenses.forEach(expense => {
      const row = buildTableRow(expense);
      tbody.appendChild(row);
    });

    tableWrapper.classList.remove('hidden');

  } catch (error) {
    loadingSpinner.classList.add('hidden');
    showToast('Could not load expenses. Is the backend running?', 'error');
    console.error('fetchExpenses error:', error);
  }
}

// Helper: Build a single <tr> element for an expense
function buildTableRow(expense) {
  const tr = document.createElement('tr');

  // Format the date nicely
  const dateObj = new Date(expense.expense_date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Format the amount as currency
  const formattedAmount = '₹' + parseFloat(expense.amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2
  });

  tr.innerHTML = `
    <td class="td-id">#${expense.id}</td>
    <td class="td-title">
      ${escapeHtml(expense.title)}
      ${expense.description ? `<span class="td-description">${escapeHtml(expense.description)}</span>` : ''}
    </td>
    <td class="td-amount">${formattedAmount}</td>
    <td><span class="badge badge-${expense.category}">${expense.category}</span></td>
    <td class="td-date">${formattedDate}</td>
    <td><span class="pay-badge">${getPaymentIcon(expense.payment_method)} ${expense.payment_method}</span></td>
    <td class="td-actions">
      <button class="btn btn-edit" id="edit-btn-${expense.id}" onclick="editExpense(${expense.id})">✏️ Edit</button>
      <button class="btn btn-delete" id="delete-btn-${expense.id}" onclick="deleteExpense(${expense.id}, '${escapeHtml(expense.title)}')">🗑️ Delete</button>
    </td>
  `;

  return tr;
}

// Returns the icon for a payment method
function getPaymentIcon(method) {
  const icons = {
    'Cash': '💵', 'UPI': '📱', 'Debit Card': '💳',
    'Credit Card': '💳', 'Bank Transfer': '🏦'
  };
  return icons[method] || '💳';
}

// Prevents XSS by escaping HTML characters in user data
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// SECTION 4: DASHBOARD STATS
// ============================================================
// GET /api/dashboard
//
// Fetches aggregate stats from the API and updates the cards.
// ============================================================
async function fetchDashboard() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`);
    const result   = await response.json();

    if (!result.success) return;

    const { total_amount, total_count, highest_expense, average_expense } = result.data;

    // Update the stat cards in the UI
    statTotal.textContent   = '₹' + parseFloat(total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    statCount.textContent   = total_count;
    statHighest.textContent = '₹' + parseFloat(highest_expense).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    statAvg.textContent     = '₹' + parseFloat(average_expense).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  } catch (error) {
    console.error('fetchDashboard error:', error);
  }
}

// ============================================================
// SECTION 5: CREATE — Form Submit Handler
// ============================================================
// POST /api/expenses (when adding new)
// PUT  /api/expenses/:id (when editing existing)
//
// This function handles both Create and Update from one form.
// We know which mode we're in by checking `isEditMode`.
// ============================================================
form.addEventListener('submit', async (event) => {
  // Prevent the default browser form submission (which refreshes the page)
  event.preventDefault();

  // Collect form data
  const data = {
    title:          document.getElementById('title').value,
    amount:         document.getElementById('amount').value,
    category:       document.getElementById('category').value,
    description:    document.getElementById('description').value,
    expense_date:   document.getElementById('expense_date').value,
    payment_method: document.getElementById('payment_method').value
  };

  // Client-side validation — stop if invalid
  if (!validateForm(data)) return;

  // Disable the submit button to prevent double-clicks
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btnSubmitText.textContent = isEditMode ? '⏳ Updating...' : '⏳ Adding...';

  try {
    let response;

    if (isEditMode) {
      // ── UPDATE: PUT /api/expenses/:id ──
      // We're editing an existing expense.
      // Send a PUT request with the updated data.
      response = await fetch(`${API_BASE}/expenses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, // Tell API we're sending JSON
        body: JSON.stringify(data)                        // Convert JS object to JSON string
      });
    } else {
      // ── CREATE: POST /api/expenses ──
      // We're creating a new expense.
      // Send a POST request with the new expense data.
      response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Parse the API response
    const result = await response.json();

    if (!response.ok || !result.success) {
      // Handle validation errors returned from the server
      const errorMsg = result.errors ? result.errors.join(' ') : result.message;
      showToast(errorMsg, 'error');
      return;
    }

    // Success!
    showToast(result.message, 'success');
    resetForm();        // Clear the form
    fetchExpenses();    // Refresh the table
    fetchDashboard();   // Refresh the stats

  } catch (error) {
    showToast('Network error. Is the backend server running?', 'error');
    console.error('Form submit error:', error);
  } finally {
    // Re-enable the submit button
    btn.disabled = false;
    btnSubmitText.textContent = isEditMode ? '💾 Update Expense' : '➕ Add Expense';
  }
});

// ============================================================
// SECTION 6: UPDATE — Load Expense Data into Form
// ============================================================
// GET /api/expenses/:id
//
// When the user clicks Edit, this function:
//   1. Fetches the expense data by ID from the API
//   2. Pre-fills the form with existing values
//   3. Switches the form to "edit mode"
//   4. Scrolls the page back up to the form
// ============================================================
async function editExpense(id) {
  try {
    // Fetch the expense details from the API
    const response = await fetch(`${API_BASE}/expenses/${id}`);
    const result   = await response.json();

    if (!response.ok || !result.success) {
      showToast(result.message || 'Could not load expense details.', 'error');
      return;
    }

    const expense = result.data;

    // Pre-fill the form with the expense's current values
    document.getElementById('title').value          = expense.title;
    document.getElementById('amount').value         = expense.amount;
    document.getElementById('category').value       = expense.category;
    document.getElementById('description').value    = expense.description || '';
    document.getElementById('payment_method').value = expense.payment_method;

    // Format the date to YYYY-MM-DD for the date input
    const dateStr = expense.expense_date.split('T')[0]; // handles both date and datetime formats
    document.getElementById('expense_date').value   = dateStr;

    // Switch to edit mode
    isEditMode = true;
    editingId  = id;

    // Update form UI to reflect edit mode
    formTitle.textContent         = `✏️ Editing Expense #${id}`;
    btnSubmitText.textContent     = '💾 Update Expense';
    btnCancelEdit.classList.remove('hidden');

    // Clear any previous validation errors
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

    // Scroll smoothly to the top so user can see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    showToast('Network error loading expense.', 'error');
    console.error('editExpense error:', error);
  }
}

// ============================================================
// SECTION 7: DELETE — Remove an Expense
// ============================================================
// DELETE /api/expenses/:id
//
// When the user clicks Delete, this function:
//   1. Shows a confirmation dialog
//   2. Sends a DELETE request to the API
//   3. Refreshes the table and stats
// ============================================================
async function deleteExpense(id, title) {
  // Show confirmation dialog before deleting
  const confirmed = confirm(`Are you sure you want to delete:\n\n"${title}"\n\nThis cannot be undone.`);
  if (!confirmed) return;

  try {
    // ── DELETE: DELETE /api/expenses/:id ──
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showToast(result.message || 'Could not delete expense.', 'error');
      return;
    }

    showToast(result.message, 'success');
    fetchExpenses();  // Refresh the table
    fetchDashboard(); // Refresh the stats

    // If we were editing this expense, cancel the edit mode
    if (isEditMode && editingId === id) {
      cancelEdit();
    }

  } catch (error) {
    showToast('Network error deleting expense.', 'error');
    console.error('deleteExpense error:', error);
  }
}

// ============================================================
// SECTION 8: CANCEL EDIT
// ============================================================
// Resets the form back to "Add" mode when user cancels editing.
// ============================================================
function cancelEdit() {
  isEditMode = false;
  editingId  = null;
  resetForm();
}

// Helper: Reset the form to its default (empty) state
function resetForm() {
  form.reset(); // Clears all input values

  // Reset edit-mode state
  isEditMode = false;
  editingId  = null;

  // Reset UI labels
  formTitle.textContent     = '➕ Add New Expense';
  btnSubmitText.textContent = '➕ Add Expense';
  btnCancelEdit.classList.add('hidden');

  // Clear all validation error messages
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

// ============================================================
// SECTION 9: SEARCH & FILTER
// ============================================================
// These event listeners watch the filter controls.
// When any filter changes, we re-fetch the expenses.
// The debounce on the search prevents too many API calls.
// ============================================================

// Debounce: only call fetchExpenses 400ms after the user stops typing
let searchDebounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(fetchExpenses, 400);
});

// Immediately re-fetch when dropdowns or sort controls change
filterCategory.addEventListener('change', fetchExpenses);
filterPayment.addEventListener('change', fetchExpenses);
sortBy.addEventListener('change', fetchExpenses);
sortOrder.addEventListener('change', fetchExpenses);

// Reset all filters to their defaults
function resetFilters() {
  searchInput.value    = '';
  filterCategory.value = '';
  filterPayment.value  = '';
  sortBy.value         = 'created_at';
  sortOrder.value      = 'DESC';
  fetchExpenses();
}

// ============================================================
// SECTION 10: SET TODAY'S DATE AS DEFAULT
// ============================================================
// Pre-fills the date field with today's date when page loads.
// ============================================================
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  document.getElementById('expense_date').value = today;
}

// ============================================================
// INITIALISE — Run when the page loads
// ============================================================
// This is the starting point.
// It fetches existing expenses and stats from the database.
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDate();   // Set today's date in the form
  fetchExpenses();    // Load the expense table (READ)
  fetchDashboard();   // Load the dashboard stats (READ)
});
