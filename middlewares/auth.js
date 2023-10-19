const db = require('../db/connect.js')
const User = db.customers;
const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
	try {
		
		const token = req.header("Authorization");
		console.log(token);
		const user = jwt.verify(token, "secretKey");
		// console.log(userId);
		let currUser = await User.findByPk(user.userId);
		req.user = currUser;
		next();
	} catch (error) { 
		console.log(error);
		return res.status(401).json({ success: false, message: "error here" });
	}
};

module.exports = { authentication };
