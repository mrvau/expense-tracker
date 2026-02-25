/**
 * Expense Tracker Application
 * Enhanced with delete, filter, validation, and accessibility features
 */

// ==================== DOM Element References ====================
const totalAmountEl = document.getElementById("total-amount");
const ul = document.getElementById("expense-list");
const open = document.getElementById("open");
const close = document.getElementById("close");
const formModal = document.getElementById("form-modal");
const form = document.getElementsByTagName("form")[0];
const addButton = form.querySelector("#add");
const updateButton = form.querySelector("#update");
const filterSelect = document.getElementById("filter");

// ==================== State Management ====================
let editingExpense = null;
let currentFilter = "all";

// ==================== Utility Functions ====================

/**
 * Format number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
	return Number(amount).toFixed(2);
};

/**
 * Capitalize first letter of a string
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
const capitalize = (text) => {
	return text[0].toUpperCase() + text.slice(1);
};

/**
 * Show notification message to user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success' or 'error')
 */
const showNotification = (message, type = "success") => {
	const notification = document.createElement("div");
	notification.className = `notification ${type}`;
	notification.textContent = message;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 3000);
};

/**
 * Reset form button visibility
 * @param {boolean} showAdd - Show add button if true, update button if false
 */
const resetFormButtons = (showAdd = true) => {
	if (showAdd) {
		addButton.style.display = "block";
		updateButton.style.display = "none";
	} else {
		addButton.style.display = "none";
		updateButton.style.display = "block";
	}
};

/**
 * Reset and close modal
 */
const closeModal = () => {
	formModal.style.display = "none";
	formModal.setAttribute("aria-hidden", "true");
	form.reset();
	editingExpense = null;
	resetFormButtons(true);
};

/**
 * Open modal for adding new expense
 */
const openModal = () => {
	formModal.style.display = "block";
	formModal.setAttribute("aria-hidden", "false");
	form.elements.namedItem("amount").focus();
	resetFormButtons(true);
};

// ==================== DOM Creation Functions ====================

/**
 * Create edit button for an expense
 * @param {Object} data - Expense data
 * @returns {HTMLButtonElement} Edit button element
 */
const createEditButton = (data) => {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "edit";
	btn.setAttribute("aria-label", "Edit expense");
	btn.setAttribute("data-id", data.id);
	btn.textContent = "✒️";
	return btn;
};

/**
 * Create delete button for an expense
 * @param {number} id - Expense ID
 * @returns {HTMLButtonElement} Delete button element
 */
const createDeleteButton = (id) => {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "delete";
	btn.setAttribute("aria-label", "Delete expense");
	btn.setAttribute("data-id", id);
	btn.textContent = "🗑️";
	return btn;
};

/**
 * Create list item for an expense
 * @param {Object} data - Expense data
 * @returns {HTMLLIElement} List item element
 */
const createList = (data) => {
	const { id, amount, category, description } = data;

	const li = document.createElement("li");
	li.classList.add("item");
	li.setAttribute("data-category", category);

	const idDiv = document.createElement("div");
	idDiv.className = "id";
	idDiv.textContent = String(id);

	const amountDiv = document.createElement("div");
	amountDiv.className = "expense";
	amountDiv.textContent = `$${formatCurrency(amount)}`;

	const categoryDiv = document.createElement("div");
	categoryDiv.className = "category";
	categoryDiv.textContent = capitalize(String(category));

	const descDiv = document.createElement("div");
	descDiv.className = "description truncate";
	descDiv.textContent = String(description);

	const tip = document.createElement("span");
	tip.className = "tooltip-text";
	tip.textContent = String(description);
	descDiv.appendChild(tip);

	// Actions container with both buttons
	const actionsDiv = document.createElement("div");
	actionsDiv.className = "actions";
	actionsDiv.appendChild(createEditButton(data));
	actionsDiv.appendChild(createDeleteButton(id));

	li.append(idDiv, amountDiv, categoryDiv, descDiv, actionsDiv);

	return li;
};

// ==================== Data Management Functions ====================

/**
 * Load data to the frontend
 * @param {Object} data - Data containing totalAmount and expenses
 */
const loadToFrontend = (data) => {
	const { totalAmount, expenses } = data;
	totalAmountEl.textContent = formatCurrency(totalAmount);

	// Remove existing items (except header)
	ul.querySelectorAll("li.item").forEach((li) => li.remove());

	// Filter expenses based on current filter
	const filteredExpenses =
		currentFilter === "all"
			? expenses
			: expenses.filter((expense) => expense.category === currentFilter);

	// Display filtered expenses
	filteredExpenses.forEach((expense) => {
		const li = createList(expense);
		ul.appendChild(li);
	});
};

/**
 * Save or update expense data
 * @param {Object} realData - Form data to save
 * @param {number|null} id - Expense ID for updates, null for new expenses
 * @returns {boolean} Success status
 */
const saveData = (realData, id = null) => {
	const { amount, category, description } = realData;
	const raw = localStorage.getItem("expense");
	if (!raw) return false;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return false;
	}

	const parsedAmount = Number.parseFloat(amount);
	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
		showNotification("Please enter a valid amount greater than 0", "error");
		return false;
	}

	if (!category || !description.trim()) {
		showNotification("Please fill in all fields", "error");
		return false;
	}

	const currentTotal = Number.parseFloat(data.totalAmount);
	if (!Number.isFinite(currentTotal)) return false;

	let newTotalExpense;
	let newData;

	if (id) {
		// Update existing expense
		const oldExpense = data.expenses.find((expense) => expense.id === id);
		if (!oldExpense) return false;

		newTotalExpense = currentTotal - oldExpense.amount + parsedAmount;

		const updatedExpenses = data.expenses.map((expense) => {
			if (expense.id === id) {
				return {
					...expense,
					amount: parsedAmount,
					category,
					description: description.trim(),
				};
			}
			return expense;
		});

		newData = {
			totalAmount: newTotalExpense,
			expenses: updatedExpenses,
		};

		showNotification("Expense updated successfully!", "success");
	} else {
		// Add new expense
		newTotalExpense = currentTotal + parsedAmount;
		const newExpense = {
			id: data.expenses.length > 0 ? Math.max(...data.expenses.map((e) => e.id)) + 1 : 1,
			amount: parsedAmount,
			category,
			description: description.trim(),
		};

		newData = {
			totalAmount: newTotalExpense,
			expenses: [...data.expenses, newExpense],
		};

		showNotification("Expense added successfully!", "success");
	}

	localStorage.setItem("expense", JSON.stringify(newData));
	closeModal();
	loadToFrontend(newData);

	return true;
};

/**
 * Delete an expense
 * @param {number} id - Expense ID to delete
 */
const deleteExpense = (id) => {
	if (!confirm("Are you sure you want to delete this expense?")) {
		return;
	}

	const raw = localStorage.getItem("expense");
	if (!raw) return;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return;
	}

	const expenseToDelete = data.expenses.find((e) => e.id === id);
	if (!expenseToDelete) return;

	const newData = {
		totalAmount: data.totalAmount - expenseToDelete.amount,
		expenses: data.expenses.filter((e) => e.id !== id),
	};

	localStorage.setItem("expense", JSON.stringify(newData));
	loadToFrontend(newData);
	showNotification("Expense deleted successfully!", "success");
};

/**
 * Handle edit button click
 * @param {number} id - Expense ID to edit
 */
const handleEdit = (id) => {
	const raw = localStorage.getItem("expense");
	if (!raw) return;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return;
	}

	const expense = data.expenses.find((e) => e.id === id);
	if (!expense) return;

	formModal.style.display = "block";
	formModal.setAttribute("aria-hidden", "false");
	form.elements.namedItem("amount").value = expense.amount;
	form.elements.namedItem("description").value = expense.description;
	form.elements.namedItem("category").value = expense.category;
	form.elements.namedItem("amount").focus();
	resetFormButtons(false);
	editingExpense = expense;
};

/**
 * Filter expenses by category
 * @param {string} category - Category to filter by ('all' for no filter)
 */
const filterExpenses = (category) => {
	currentFilter = category;
	const raw = localStorage.getItem("expense");
	if (!raw) return;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return;
	}

	loadToFrontend(data);
};

// ==================== Initialization ====================

/**
 * Initialize the application
 */
const main = () => {
	const data = localStorage.getItem("expense");
	if (!data) {
		const initialData = { totalAmount: 0, expenses: [] };
		localStorage.setItem("expense", JSON.stringify(initialData));
		loadToFrontend(initialData);
	} else {
		let parsed;
		try {
			parsed = JSON.parse(data);
		} catch {
			const initialData = { totalAmount: 0, expenses: [] };
			localStorage.setItem("expense", JSON.stringify(initialData));
			parsed = initialData;
		}
		loadToFrontend(parsed);
	}
};

// ==================== Event Listeners ====================

// Open modal button
open.addEventListener("click", openModal);

// Close modal button
close.addEventListener("click", closeModal);

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && formModal.style.display === "block") {
		closeModal();
	}
});

// Update button click
updateButton.addEventListener("click", () => {
	if (!editingExpense) return;

	const formData = {
		amount: form.elements.namedItem("amount").value,
		category: form.elements.namedItem("category").value,
		description: form.elements.namedItem("description").value,
	};

	saveData(formData, editingExpense.id);
});

// Form submission (add new expense)
form.addEventListener("submit", (e) => {
	e.preventDefault();

	const amount = form.elements.namedItem("amount");
	const description = form.elements.namedItem("description");
	const select = form.elements.namedItem("category");

	const formData = {
		amount: amount.value,
		category: select.value,
		description: description.value,
	};

	saveData(formData);
});

// Event delegation for edit and delete buttons
ul.addEventListener("click", (e) => {
	const target = e.target;

	if (target.classList.contains("edit")) {
		const id = parseInt(target.getAttribute("data-id"));
		handleEdit(id);
	}

	if (target.classList.contains("delete")) {
		const id = parseInt(target.getAttribute("data-id"));
		deleteExpense(id);
	}
});

// Filter select change
filterSelect.addEventListener("change", (e) => {
	filterExpenses(e.target.value);
});

// ==================== Start Application ====================
main();
