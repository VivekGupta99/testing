let signupButton = document.querySelector("#signupButton");
let nameInput = document.querySelector("#nameInput");
let emailInput = document.querySelector("#emailInput");
let passwordInput = document.querySelector("#passwordInput");
let form = document.querySelector("#signupForm");

form.addEventListener("submit", signup);

let networkErr = document.createElement("div");
networkErr.classList = "error";

async function signup(e) {
	e.preventDefault();
	try {
		let signUpDetails = {
			name: nameInput.value,
			email: emailInput.value,
			password: passwordInput.value,
		};
		console.log(signUpDetails);
		let response = await axios.post("http://50.19.25.55:3001/user/signup", signUpDetails);
		if (response.status === 201) {
			console.log("obj posted");
			window.location.href = "../index.html";
		} else {
			networkErr.appendChild(document.createTextNode(response.message))
		}
	} catch (error) {
		networkErr.appendChild(document.createTextNode(error.message));
		setTimeout(() => networkErr.remove(), 3001);
		document.body.appendChild(networkErr);
		console.log(error);
	}
}
