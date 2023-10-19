const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");

loginForm.addEventListener("submit", formsubmit);

async function formsubmit(e) {
	e.preventDefault();

	try {
		let loginobj = {
			email: emailInput.value,
			password: passwordInput.value,
		};
		console.log(loginobj);

		let res = await axios.post("http://50.19.25.55:3001/user/login", loginobj);
		if (res.status == 200) {
			console.log(res.data.token);
			localStorage.setItem("token", res.data.token);
			window.location.href = "./expenses/expense.html";
		}
	} catch (error) {
		console.log(error);
		let errorDiv = document.querySelector("#errordiv");
		// errorDiv.classList = "error";
		errorDiv.textContent = error.message;
		document.body.appendChild(errorDiv);
		setTimeout(() => {
			errorDiv.remove();
		}, 3001);
	}
}
