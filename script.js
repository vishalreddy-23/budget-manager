let balance = 0;
let stack = []; // For undo
let categoryMap = {}; // Tracks totals per category
const historyList = document.getElementById('history-list');
const balanceDisplay = document.getElementById('balance');

// Theme toggle
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
};

 // Grab the dropdowns
const categorySelect = document.getElementById('category');
const typeSelect = document.getElementById('type');
const incomeOption = typeSelect.querySelector('option[value="income"]');
const expenseOption = typeSelect.querySelector('option[value="expense"]');

categorySelect.addEventListener('change', function () {
  const selected = this.value;

  if (!selected) return; // ignore placeholder

  if (
    selected === 'food' ||
    selected === 'transport' ||
    selected === 'shopping' ||
    selected === 'electricity'
  ) {
    // ✅ Force Expense for these
    typeSelect.value = 'expense';
    incomeOption.disabled = true;
    expenseOption.disabled = false;
  } else if (selected === 'Salary') {
    // ✅ Force Income for Salary
    typeSelect.value = 'income';
    expenseOption.disabled = true;
    incomeOption.disabled = false;
  } else {
    // ✅ Others → enable both
    incomeOption.disabled = false;
    expenseOption.disabled = false;
  }
});



// Submit transaction
document.getElementById('transaction-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const desc = document.getElementById('desc').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  if (!desc || isNaN(amount) || amount <= 0) {
    alert("Please enter valid data!");
    return;
  }

  const transaction = {
    desc,
    amount,
    type,
    category
  };

  stack.push(transaction); // Save for undo

  // Update category map
  if (!categoryMap[category]) categoryMap[category] = 0;
  categoryMap[category] += (type === 'income' ? amount : -amount);

  updateBalance(transaction);
  addToHistory(transaction);

  // Clear form
  e.target.reset();
});

// Undo last transaction
document.getElementById('undo-btn').addEventListener('click', function () {
  if (stack.length === 0) {
    alert("No transaction to undo!");
    return;
  }

  const last = stack.pop();

  // Undo balance
  if (last.type === 'income') balance -= last.amount;
  else balance += last.amount;

  // Undo category map
  categoryMap[last.category] -= (last.type === 'income' ? last.amount : -last.amount);
  if (categoryMap[last.category] === 0) {
    delete categoryMap[last.category];
  }

  // Undo history
  const id = getTransactionId(last);
  let li = document.getElementById(id);

  if (li) {
    let currentAmount = parseInt(li.dataset.amount);
    let newAmount = currentAmount - last.amount;

    if (newAmount > 0) {
      li.dataset.amount = newAmount;
      li.textContent = `${last.type.toUpperCase()}: ₹${newAmount} - ${last.desc} [${last.category}]`;
    } else {
      historyList.removeChild(li);
    }
  }

  updateDisplay();
  updateCategoryDisplay();
});

// Update balance
function updateBalance(transaction) {
  if (transaction.type === 'income') balance += transaction.amount;
  else balance -= transaction.amount;

  updateDisplay();
}

// Update balance text
function updateDisplay() {
  balanceDisplay.textContent = balance;
  console.log("Category Breakdown:", categoryMap);
}

// Add or update transaction in history
function addToHistory(transaction) {
  const id = getTransactionId(transaction);

  let li = document.getElementById(id);

  if (li) {
    // If exists, update amount
    const oldAmount = parseInt(li.dataset.amount);
    const newAmount = oldAmount + transaction.amount;
    li.dataset.amount = newAmount;
    li.textContent = `${transaction.type.toUpperCase()}: ₹${newAmount} - ${transaction.desc} [${transaction.category}]`;
  } else {
    // Else, create new
    li = document.createElement('li');
    li.id = id;
    li.dataset.amount = transaction.amount;
    li.className = transaction.type === 'income' ? 'income' : 'expense';
    li.textContent = `${transaction.type.toUpperCase()}: ₹${transaction.amount} - ${transaction.desc} [${transaction.category}]`;
    historyList.appendChild(li);
  }

  updateCategoryDisplay();
}

// Build unique ID for each type/desc/category
function getTransactionId(transaction) {
  return `${transaction.type}-${transaction.category}-${transaction.desc}`.replace(/\s+/g, '-').toLowerCase();
}

// Show category summary
function updateCategoryDisplay() {
  const list = document.getElementById("category-list");
  list.innerHTML = ""; // Clear old

  for (let category in categoryMap) {
    const li = document.createElement("li");
    li.textContent = `${category}: ₹${categoryMap[category]}`;
    list.appendChild(li);
  }
}
