const totalAmountEl = document.getElementById("total-amount");
const ul = document.getElementById("expense-list");

const open = document.getElementById("open");
const close = document.getElementById("close");

const formModal = document.getElementById("form-modal");

const [form] = document.getElementsByTagName("form");

const formContainer = document.querySelector(".form-container");

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

const createList = ({ id, amount, category, description }) => {
	const li = document.createElement("li");
	li.classList.add("item");

	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "edit";
	btn.setAttribute("aria-label", "Edit expense");
	btn.textContent = "✒️";

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

const loadToFrontend = (data) => {
	const { totalAmount, expenses } = data;
	totalAmountEl.textContent = totalAmount;

	expenses.forEach((expense) => {
		const li = createList(expense);
		ul.appendChild(li);
	});
};

const saveData = ({ amount, category, description }) => {
	const raw = localStorage.getItem("expense");
	if (!raw) return false;

	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		return false;
	}

	const parsedAmount = Number.parseFloat(amount);
	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

	const currentTotal = Number.parseFloat(data.totalAmount);
	if (!Number.isFinite(currentTotal)) return false;

	const newTotalExpense = currentTotal + parsedAmount;

	const newExpense = {
		id: data.expenses.length + 1,
		amount,
		category,
		description,
	};

	const newData = {
		totalAmount: newTotalExpense,
		expenses: [...data.expenses, newExpense],
	};

	localStorage.setItem("expense", JSON.stringify(newData));
	formModal.style.display = "none";

	totalAmountEl.textContent = newTotalExpense;
	const li = createList(newExpense);
	ul.appendChild(li);

	return true;
};

open.addEventListener("click", () => {
	formModal.style.display = "block";
});

close.addEventListener("click", () => {
	formModal.style.display = "none";
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
