const db = require('../db/connect.js')
const User = db.customers
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path")

const getLoginPage = async (req, res, next) => {
	try {
		res.sendFile(path.join(__dirname, "../", "public", "index.html"));
	} catch (error) {
		console.log(error);
	}
};
const getSignupPage = async (req, res, next) => {
	try {
		res.sendFile(path.join(__dirname, "../", "public","signup", "signup.html"));
	} catch (error) {
		console.log(error);
	}
};
const signup = async (req, res, next) => {
	try {
		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;
		let obj = await User.findOne({where:{ Email: email }});
		if (obj) {
			res.status(409).json({ message: "email already exits", success: false });
		} else {
			let salt = await bcrypt.genSalt(10);
			let hashedPassword = await bcrypt.hash(password, salt);
			const customerObject = {
				Name: name,
				Email: email,
				Password: hashedPassword,
			}
			let result = await User.create(customerObject);
			res.status(201).json({ success: true, msg: "user created", user: result });
		}
	} catch (error) {
		console.log(error);
		res.json({ message: error, success: false });
	}
};

function generateAccessToken(id, premium) {
	let x = jwt.sign({ userId: id, ispremium: premium }, "secretKey");
	return x;
}

const login = async (req, res, next) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		console.log("1")
		let obj = await User.findOne({where:{ Email: email }});
		if (obj) {
			console.log("2")
			let passwordMatch = await bcrypt.compare(password, obj.Password);
			if (passwordMatch) {
				res.status(200).json({ message: "login successfully", success: true, token: generateAccessToken(obj.id, obj.isPremiumUser) });
			} else {
				res.status(400).json({ success: false, message: "invalid password" });
			}
		} else {
			res.status(404).json({ success: false, message: "USER does not exist" });
		}
	} catch (error) {
		res.status(500).json({ success: false , message: "hey buddy",});
	}
};

module.exports = { getLoginPage,getSignupPage,signup, login };
