let balance = 0;
let stack = []; // For undo
let categoryMap = {}; // HashMap for category tracking
const historyList = document.getElementById('history-list');
const balanceDisplay = document.getElementById('balance');
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
}

document.getElementById('transaction-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const desc = document.getElementById('desc').value;
  const amount = parseInt(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  const transaction = {
    desc,
    amount,
    type,
    category
  };

  stack.push(transaction); // Push into stack for undo

  // Update category totals
  if (!categoryMap[category]) categoryMap[category] = 0;
  categoryMap[category] += (type === 'income' ? amount : -amount);

  updateBalance(transaction);
  addToHistory(transaction);

  // Clear form
  e.target.reset();
});

document.getElementById('undo-btn').addEventListener('click', function () {
  if (stack.length === 0) {
    alert("No transaction to undo!");
    return;
  }

  const last = stack.pop();

  // Undo balance
  if (last.type === 'income') balance -= last.amount;
  else balance += last.amount;

  // Undo category
  categoryMap[last.category] -= (last.type === 'income' ? last.amount : -last.amount);

  updateDisplay();

  // Remove last history item
  historyList.removeChild(historyList.lastChild);
});

function updateBalance(transaction) {
  if (transaction.type === 'income') balance += transaction.amount;
  else balance -= transaction.amount;

  updateDisplay();
}

function updateDisplay() {
  balanceDisplay.textContent = balance;
  console.log("Category Breakdown:", categoryMap);
}

function addToHistory(transaction) {
  const li = document.createElement('li');
  li.textContent = `${transaction.type.toUpperCase()}: ₹${transaction.amount} - ${transaction.desc} [${transaction.category}]`;
  historyList.appendChild(li);
  function updateCategoryDisplay() {
  const list = document.getElementById("category-list");
  list.innerHTML = ""; // clear old

  for (let category in categoryMap) {
    const li = document.createElement("li");
    li.textContent = `${category}: ₹${categoryMap[category]}`;
    list.appendChild(li);
  }
}

}
