window.addEventListener("DOMContentLoaded", () => {
	if (!localStorage.getItem("NoOfExpPerPage")) {
		localStorage.setItem("NoOfExpPerPage", 2);
	}
	if (!localStorage.getItem("currPageOnScreen")) {
		getcurrPage(1);
	} else {
		getcurrPage(localStorage.getItem("currPageOnScreen"));
	}
	document.querySelector("#ExpensePerPage select").value = localStorage.getItem("NoOfExpPerPage")
});
let paginationButton = document.querySelector("#paginationButton");
let amount = document.querySelector("#expense");
let description = document.querySelector("#description");
let category = document.querySelector("#category");
let addExpense = document.querySelector("#addExpense");
let formId = document.querySelector("#formId");
let rzpButton = document.querySelector("#rzp-button");
let expensesDiv = document.querySelector("#expenses");
let leaderboardDiv = document.querySelector("#leader");
const downloadBtn = document.querySelector("#downloadBtn");
const fileurllist = document.querySelector("#fileurllist");
formId.addEventListener("submit", add_expense);

document.querySelector("#pagebutton").addEventListener("click", (e) => {
	let val = document.querySelector("#myselect").value;
	localStorage.setItem("NoOfExpPerPage", val);
	getcurrPage(1);
});

const getcurrPage = async function (currpage) {
	try {
		let noofexpperpage = localStorage.getItem("NoOfExpPerPage");
		let token = localStorage.getItem("token");
		const res = await axios.get(`http://50.19.25.55:3001/expense/pagination?currpage=${currpage}&expPerPage=${noofexpperpage}`, { headers: { Authorization: token } });

		generate_form(res.data.expenses);
		let currPage = res.data.currPage
		localStorage.setItem('currPageOnScreen', currPage)

		showPagination(res.data);
	} catch (error) {
		console.log(error);
	}
};

function showPagination(data) {
	const { currPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage } = data;

	paginationButton.innerHTML = "";
	if (hasPreviousPage) {
		let btn2 = document.createElement("button");
		btn2.innerHTML = previousPage;
		btn2.addEventListener("click", () => getcurrPage(previousPage));
		paginationButton.appendChild(btn2);
	}
	let btn1 = document.createElement("button");
	btn1.innerHTML = currPage;
	btn1.addEventListener("click", () => getcurrPage(currPage));
	paginationButton.appendChild(btn1);

	if (hasNextPage) {
		let btn3 = document.createElement("button");
		btn3.innerHTML = nextPage;
		btn3.addEventListener("click", () => getcurrPage(nextPage));
		paginationButton.appendChild(btn3);
	}
}
function parseJwt(token) {
	var base64Url = token.split(".")[1];
	var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	var jsonPayload = decodeURIComponent(
		window
			.atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join("")
	);
	return JSON.parse(jsonPayload);
}

rzpButton.addEventListener("click", paymentProcess);

async function paymentProcess(e) {
	try {
		const token = localStorage.getItem("token");

		const response = await axios.get("http://50.19.25.55:3001/purchase/premiummembership", { headers: { Authorization: token } });
		// console.log(response);

		var options = {
			key: response.data.key_id,
			order_id: response.data.order.id,

			handler: async function (response) {
				const res = await axios.post(
					"http://50.19.25.55:3001/purchase/updatetransactionstatus/success",
					{
						order_id: options.order_id,
						payment_id: response.razorpay_payment_id,
					},
					{ headers: { Authorization: token } }
				);
				rzpButton.remove();
				localStorage.setItem("token", res.data.token);

				let newhead = document.createElement("h1");
				newhead.textContent = "you are a premium user now";
				document.querySelector("#ispremium").appendChild(newhead);

				let leaderBoardBtn = document.createElement("button");
				leaderBoardBtn.appendChild(document.createTextNode("Leaderboard"));
				leaderBoardBtn.classList.add("leaderboard-button");
				leaderBoardBtn.addEventListener("click", showleaderboard);
				document.querySelector("#leader").appendChild(leaderBoardBtn);

				const Dbutton = document.createElement("button");
				Dbutton.id = "downloadexpense";
				Dbutton.innerText = "Download File";
				Dbutton.addEventListener("click", download);
				downloadBtn.appendChild(Dbutton);

				alert("you are a premium user now");
			},
		};
		const rzp1 = new Razorpay(options);
		rzp1.open();
		e.preventDefault();
		rzp1.on("payment.failed", async function (response) {
			// console.log(error);

			await axios.post(
				"http://50.19.25.55:3001/purchase/updatetransactionstatus/failed",
				{
					order_id: response.error.metadata.order_id,
					payment_id: response.error.metadata.payment_id,
				},
				{ headers: { Authorization: token } }
			);
			alert("something went wrong");
		});
	} catch (error) {
		let errorDiv = document.createElement("div");
		errorDiv.classList = "error";
		errorDiv.textContent = error.response.data.message;
		document.body.appendChild(errorDiv);
		setTimeout(() => {
			errorDiv.remove();
		}, 3001);
	}
}

function add_expense(e) {
	e.preventDefault();
	let obj = {
		amount: amount.value,
		description: description.value,
		category: category.value,
	};
	add_to_database(obj);
	amount.value = "";
	description.value = "";
}

let errordiv = document.createElement("div");
errordiv.classList = "error";

async function add_to_database(obj) {
	try {
		const token = localStorage.getItem("token");
		await axios.post("http://50.19.25.55:3001/expense", obj, { headers: { Authorization: token } });
		getcurrPage(localStorage.getItem("currPageOnScreen"));
	} catch (error) {
		errordiv.createTextNode(error);
		document.body.appendChild(errordiv);
		console.log(error);
	}
}
async function get_from_database() {
	try {
		const token = localStorage.getItem("token");

		let arr = await axios.get("http://50.19.25.55:3001/expense", { headers: { Authorization: token } });
		return arr.data;
	} catch (error) {
		console.log(error);
	}
}

async function showleaderboard() {
	try {
		leaderboardDiv.innerHTML = "";

		let leaderBoardBtn = document.createElement("button");
		leaderBoardBtn.appendChild(document.createTextNode(" here are the top expenses"));
		leaderBoardBtn.classList.add("leaderboard-button");
		leaderboardDiv.appendChild(leaderBoardBtn);
		leaderBoardBtn.addEventListener("click", showleaderboard);

		let unorderedList = document.createElement("ul");
		let token = localStorage.getItem("token");
		let newarr = await axios.get("http://50.19.25.55:3001/premium/leaderboard", { headers: { Authorization: token } });
		let arr = newarr.data;

		for (let i = 0; i < arr.length; i++) {
			let li = document.createElement("li");
			let text = document.createTextNode(`name: ${arr[i].Name} Total expenses: ${arr[i].total_cost}`);
			li.appendChild(text);
			unorderedList.appendChild(li);
		}

		leaderboardDiv.appendChild(unorderedList);
	} catch (error) {
		console.log(error);
	}
}

async function generate_form(expenses) {
	try {
		let token = localStorage.getItem("token");
		let premium = parseJwt(token);
		console.log("hello here")
		if (premium.ispremium == true) {
			rzpButton.remove();
			let newhead = document.createElement("h1");
			newhead.textContent = "you are a premium user";
			document.querySelector("#ispremium").innerHTML = "";
			document.querySelector("#ispremium").appendChild(newhead);
			let leaderBoardBtn = document.createElement("button");
			leaderBoardBtn.appendChild(document.createTextNode("Leaderboard"));
			leaderBoardBtn.classList.add("leaderboard-button");
			leaderboardDiv.innerHTML = '';
			leaderboardDiv.appendChild(leaderBoardBtn)

			leaderBoardBtn.addEventListener("click", showleaderboard);

			downloadBtn.innerHTML = "";
			const Dbutton = document.createElement("button");
			Dbutton.id = "downloadexpense";
			Dbutton.innerText = "Download File";
			Dbutton.addEventListener("click", download);
			downloadBtn.appendChild(Dbutton);
			show_fileURL_list();
		}

		let arr = expenses;


		expensesDiv.innerHTML = "";


		let expenseshead = document.createElement("h2");
		expenseshead.appendChild(document.createTextNode("Expenses"));
		if (arr.length > 0) expensesDiv.appendChild(expenseshead);
		let unorderedList = document.createElement("ul");
		unorderedList.classList.add("expense-list"); // Add a class to the unordered list

		for (let i = 0; i < arr.length; i++) {
			let li = document.createElement("li");
			li.classList.add("listItem"); // Add a class to the list item
			li.setAttribute("amount", arr[i].amount);
			li.setAttribute("description", arr[i].description);
			li.setAttribute("category", arr[i].category);
			li.setAttribute("id", arr[i].id);

			let text = document.createTextNode(`amount: ${arr[i].amount} description: ${arr[i].description} category: ${arr[i].category}  `);
			let editBtn = document.createElement("button");
			editBtn.textContent = "Edit";
			editBtn.classList.add("edit-button"); // Add a class to the edit button
			let deleteBtn = document.createElement("button");
			deleteBtn.textContent = "Delete";
			deleteBtn.classList.add("delete-button"); // Add a class to the delete button

			li.appendChild(text);
			li.appendChild(document.createElement("br")); // Add a line break
			li.appendChild(deleteBtn);
			li.appendChild(editBtn);
			unorderedList.appendChild(li);
			editBtn.addEventListener("click", edit_data);
			deleteBtn.addEventListener("click", delete_data);
		}
		expensesDiv.appendChild(unorderedList);
	} catch (error) {
		console.log(error);
	}
}

function edit_data(e) {
	e.preventDefault();
	let lis = e.target.parentNode;
	let amounti = e.target.parentNode.getAttribute("amount");
	let descriptioni = e.target.parentNode.getAttribute("description");
	let categoryi = e.target.parentNode.getAttribute("category");
	let id = e.target.parentNode.getAttribute("id");
	e.target.parentNode.remove();
	amount.value = amounti;
	description.value = descriptioni;
	category.value = categoryi;
	delete_from_database(id);
}

async function delete_data(e) {
	e.preventDefault();

	try {
		let lis = e.target.parentNode;
		let id = e.target.parentNode.getAttribute("id");
		// let amount = e.target.parentNode.getAttribute("amount");

		e.target.parentNode.remove();

		await delete_from_database(id);
		// generate_form();
	} catch (error) {
		console.log(error);
	}
}

async function delete_from_database(id) {
	try {
		let token = localStorage.getItem("token");
		await axios.delete(`http://50.19.25.55:3001/expense/${id}`, { headers: { Authorization: token } });
		getcurrPage(1);
	} catch (error) {
		console.log(error);
		let errorDiv = document.createElement("div");
		errorDiv.classList = "error";
		errorDiv.textContent = error.response.data.message;
		getExpensesPerPage();

		document.body.appendChild(errorDiv);
		setTimeout(() => {
			errorDiv.remove();
		}, 3001);
	}
}

async function download() {
	try {
		let token = localStorage.getItem("token");
		let res = await axios.get("http://50.19.25.55:3001/expense/download", { headers: { Authorization: token } });

		if (res.status === 200) {
			var a = document.createElement("a");
			console.log(res.data.fileURL);
			a.href = res.data.fileURL;
			a.download = "myexpense.csv";
			a.click();
			show_fileURL_list();
		} else {
			throw new Error(res.data.message);
		}
	} catch (error) {
		console.log(error);
	}
}

async function show_fileURL_list() {
	try {
		let token = localStorage.getItem("token");
		let lis = await axios.get("http://50.19.25.55:3001/expense/allfiles", { headers: { Authorization: token } });
		let arr = lis.data;
		let ul = document.createElement("ul");
		let h = document.createElement("h3");
		h.textContent = "previous downloads";

		fileurllist.innerHTML = "";
		if (arr.length > 0) fileurllist.appendChild(h);
		for (let i = 0; i < arr.length; i++) {
			let obj = arr[i];

			// const dateTimeString = obj.createdAt;
			// const dateTime = new Date(dateTimeString);
			// const date = dateTime.toISOString().split("T")[0];
			let innerhtml = `<li> --- <a href = "${obj.fileURL}">download link<a> </li> `;
			ul.innerHTML = ul.innerHTML + innerhtml;
		}
		fileurllist.appendChild(ul);
	} catch (error) {
		console.log(error);
	}
}
