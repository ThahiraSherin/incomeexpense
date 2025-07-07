// Global variables or constants
const API_URL = "https://684dd3c065ed0871391734f3.mockapi.io/IncomeExpensesCalculator";
let incomeEntries = [];
let expenseEntries = [];

// Function for adding income entry
function addIncome() {
  const container = document.getElementById("income-list");
  const entry = createEntry("income");
  container.appendChild(entry);
}

// Function for adding expense entry
function addExpense() {
  const container = document.getElementById("expense-list");
  const entry = createEntry("expense");
  container.appendChild(entry);
}

// Function to create an income/expense entry
function createEntry(type) {
  const div = document.createElement("div");
  div.classList.add("calculator", "entry");

  const description = document.createElement("input");
  description.type = "text";
  description.placeholder = "eg: salary/rent";

  const amount = document.createElement("input");
  amount.type = "number";
  amount.placeholder = "eg: 1000";
  amount.classList.add(type === "income" ? "incomeclass" : "expenseclass");

  div.appendChild(description);
  div.appendChild(amount);

  description.addEventListener("input", updateSummary);
  amount.addEventListener("input", updateSummary);

  return div;
}

// Function to sum amounts based on class name
function sumValue(className) {
  let total = 0;
  const inputs = document.getElementsByClassName(className);
  for (let input of inputs) {
    total += parseFloat(input.value) || 0;
  }
  return total;
}

// Function to update totals and balance
function updateSummary() {
  const totalIncome = sumValue("incomeclass");
  const totalExpense = sumValue("expenseclass");
  const balance = totalIncome - totalExpense;

  document.getElementById("total-income").innerText = totalIncome;
  document.getElementById("total-expense").innerText = totalExpense;
  document.getElementById("balance").innerText = balance;
}

// Function to get valid entries from DOM
function getEntriesFromDOM(containerId, className) {
  const container = document.getElementById(containerId);
  const entries = [];
  container.querySelectorAll(".calculator").forEach(div => {
    const inputs = div.querySelectorAll("input");
    const description = inputs[0].value.trim();
    const amount = parseFloat(inputs[1].value);
    if (description && !isNaN(amount)) {
      entries.push({ description, amount });
    }
  });
  return entries;
}

// Function to submit form data
function submitform() {
  const incomeData = getEntriesFromDOM("income-list", "incomeclass");
  const expenseData = getEntriesFromDOM("expense-list", "expenseclass");
  const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
  const balance = totalIncome - totalExpense;

  const payload = {
    id: generateId(),
    income: incomeData,
    expenses: expenseData,
    totalIncome,
    totalExpense,
    balance
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(() => {
      alert("Data submitted successfully!");
      resetform();
      fetchRecords();
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Something went wrong");
    });
}

// Function to reset form
function resetform() {
  document.getElementById("income-list").innerHTML = "";
  document.getElementById("expense-list").innerHTML = "";
  document.getElementById("total-income").innerText = "0";
  document.getElementById("total-expense").innerText = "0";
  document.getElementById("balance").innerText = "0";
  incomeEntries = [];
  expenseEntries = [];
}

// Function to generate unique ID
function generateId() {
  return "id-" + Math.random().toString(36).substr(2, 9);
}

// Function to fetch records from API
function fetchRecords() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => displayRecords(data))
    .catch(err => console.error("Error fetching records:", err));
}

// Function to display records
function displayRecords(records) {
  const container = document.getElementById("record-list");
  container.innerHTML = "";

  records.forEach(record => {
    const div = document.createElement("div");
    div.classList.add("record-card");
   div.innerHTML = `
  <p><strong>ID:</strong> ${record.id}</p>
  <p><strong>Total Income:</strong> ₹${record.totalIncome}</p>
  <p><strong>Total Expenses:</strong> ₹${record.totalExpense}</p>
  <p><strong>Balance:</strong> ₹${record.balance}</p>
  <button onclick="deleteRecord('${record.id}')">Delete</button>
  <button onclick="editRecord('${record.id}')">Edit</button>
`;

    container.appendChild(div);
  });
}

// Function to delete a record
function deleteRecord(id) {
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => {
      alert("Record deleted!");
      fetchRecords();
    })
    .catch(err => console.error("Error deleting record:", err));
}

// Function to edit a record
function editRecord(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(record => {
      prefillForm(record);
      deleteRecord(id);
    })
    .catch(err => console.error("Error fetching record for edit:", err));
}

// Function to prefill form with record data
function prefillForm(record) {
  resetform();

  record.income.forEach(entry => {
    addIncome();
  });
  const incomeInputs = document.querySelectorAll("#income-list .entry");
  incomeInputs.forEach((div, idx) => {
    div.querySelectorAll("input")[0].value = record.income[idx].description;
    div.querySelectorAll("input")[1].value = record.income[idx].amount;
  });

  record.expenses.forEach(entry => {
    addExpense();
  });
  const expenseInputs = document.querySelectorAll("#expense-list .entry");
  expenseInputs.forEach((div, idx) => {
    div.querySelectorAll("input")[0].value = record.expenses[idx].description;
    div.querySelectorAll("input")[1].value = record.expenses[idx].amount;
  });

  updateSummary();
}


// Initial fetch of records
fetchRecords();
