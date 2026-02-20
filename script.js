// Constant declarations for DOM elements

const totalAmountEl = document.getElementById("total-amount");
const ul = document.getElementById("expense-list");

const open = document.getElementById("open");
const close = document.getElementById("close");

const formModal = document.getElementById("form-modal");

const [form] = document.getElementsByTagName("form");

const addButton = form.querySelector("#add");
const updateButton = form.querySelector("#update");

const formContainer = document.querySelector(".form-container");

// Main function to initialize the application

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

// Function to create an edit button for each expense item
let editingExpense = null;

const createEditButton = (data) => {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "edit";
	btn.setAttribute("aria-label", "Edit expense");
	btn.textContent = "✒️";

	btn.addEventListener("click", () => {
		formModal.style.display = "block";
		form.elements.namedItem("amount").value = data.amount;
		form.elements.namedItem("description").value = data.description;
		form.elements.namedItem("category").value = data.category;
		updateButton.style.display = "block";
		addButton.style.display = "none";
		editingExpense = data;
	});
	return btn;
};

// Function to create a list item for each expense

const createList = (data) => {
	const { id, amount, category, description } = data;

	const li = document.createElement("li");
	li.classList.add("item");

	const btn = createEditButton(data);

	const idDiv = document.createElement("div");
	idDiv.className = "id";
	idDiv.textContent = String(id);

	const amountDiv = document.createElement("div");
	amountDiv.className = "expense";
	amountDiv.textContent = String(amount);

	const categoryDiv = document.createElement("div");
	categoryDiv.className = "category";
	categoryDiv.textContent = String(category);

	const descDiv = document.createElement("div");
	descDiv.className = "description truncate";
	descDiv.textContent = String(description);

	const tip = document.createElement("span");
	tip.className = "tooltip-text";
	tip.textContent = String(description);
	descDiv.appendChild(tip);

	li.append(btn, idDiv, amountDiv, categoryDiv, descDiv);

	return li;
};

// Function to load data to the frontend

const loadToFrontend = (data) => {
	const { totalAmount, expenses } = data;
	totalAmountEl.textContent = totalAmount;

	ul.querySelectorAll("li.item").forEach((li) => li.remove());

	expenses.forEach((expense) => {
		const li = createList(expense);
		ul.appendChild(li);
	});
};

// Function to save data to localStorage

const saveData = (realData, id = null) => {
	const { amount, category, description } = realData;
	const raw = localStorage.getItem("expense");
	console.log(raw);
	if (!raw) return false;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return false;
	}

	const parsedAmount = Number.parseFloat(amount);
	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return false;

	const currentTotal = Number.parseFloat(data.totalAmount);
	if (!Number.isFinite(currentTotal)) return false;

	const oldExpense = data.expenses.find((expense) => expense.id === id);
	if (!oldExpense) return false;

	newTotalExpense = currentTotal - oldExpense.amount + parsedAmount;

	let newData;

	if (id) {
		const updatedExpense = data.expenses.map((expense) => {
			if (expense.id === id) {
				expense.amount = parsedAmount;
				expense.category = category;
				expense.description = description;
			}
			return expense;
		});

		newData = {
			totalAmount: newTotalExpense,
			expenses: updatedExpense,
		};
	} else {
		const newExpense = {
			id: data.expenses.length + 1,
			amount: parsedAmount,
			category,
			description,
		};

		newData = {
			totalAmount: newTotalExpense,
			expenses: [...data.expenses, newExpense],
		};
	}

	localStorage.setItem("expense", JSON.stringify(newData));
	formModal.style.display = "none";
	form.reset();

	loadToFrontend(newData);

	return true;
};

// Event listeners for opening and closing the form modal, and handling form submission

open.addEventListener("click", () => {
	formModal.style.display = "block";

	updateButton.style.display = "none";
	addButton.style.display = "block";
});

close.addEventListener("click", () => {
	formModal.style.display = "none";
});

updateButton.addEventListener("click", () => {
	data = {
		amount: form.elements.namedItem("amount").value,
		category: form.elements.namedItem("category").value,
		description: form.elements.namedItem("description").value,
		id: editingExpense.id,
	};
	saveData(data, data.id);
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const amount = form.elements.namedItem("amount");
	const description = form.elements.namedItem("description");
	const select = form.elements.namedItem("category");

	const data = {
		amount: amount.value,
		category: select.value,
		description: description.value,
	};

	const saved = saveData(data);
	if (saved) {
		amount.value = "";
		description.value = "";
		select.value = "";
	} else {
		alert("Failed to save data. Please try again.");
	}
});

main();
