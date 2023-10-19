const db = require('../db/connect.js')
const expenseUser = db.expenses;
const User = db.customers;
const AWS = require("aws-sdk");
const fileurl = db.fileurl;
const path=require('path')
const publicPath = path.join(__dirname, '../','public');
require('dotenv').config()
const html = async (req, res, next) => {
	try {
		res.sendFile(path.join(publicPath, 'expenses','expense.html'));
	} catch (error) {
		console.log(error);
	}
};
const addExpense = async (req, res, next) => {
	try {
		const { amount, description, category } = req.body;

		await expenseUser.create({
			amount: amount,
			description: description,
			category: category,
			customerId: req.user.id,
		});
		let totalexp = Number(amount) +Number(req.user.total_expense);
		await User.update({
            total_expense:totalexp
        },{
            where:{id:req.user.id},
          
        })

		res.status(200).json({ message: "user added", success: true, checout: req.user });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error });
	}
};

const getAllExpense = async (req, res, next) => {
	try {
		const allusers = await expenseUser.find({where:{ customerId: req.user.id }});
		res.json(allusers);
	} catch (error) {
		console.log(error);
	}
};

const deleteExpense = async (req, res, next) => {
	try {
		let { id } = req.params;

		let tbd = await expenseUser.findOne({where :{ id: id }});
		let user = await User.findOne({where:{ id: req.user.id }});
		let total = user.total_expense;
		let curr = tbd.amount;
		let result = await expenseUser.deleteOne({where:{ id: id }});
		if (result) {
			let user = await User.findOne(({where :{ id: req.user.id }}));
			await user.updateOne({
				total_expense: total - curr,
			});
			res.json({ message: "user deleted", success: true });
		} else {
			res.status(500).json({ message: "not yours to tamper with", success: false });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error, success: false });
	}
};

async function uploadToS3(data, filename) {
	let s3bucket = new AWS.S3({
		accessKeyId: process.env.IAM_USER_KEY,

		secretAccessKey: process.env.IAM_USER_SECRET,
	});
	var params = {
		Bucket: process.env.BUCKET_NAME,
		Key: filename,
		Body: data,
		ACL: "public-read",
	};
	return new Promise((resolve, reject) => {
		s3bucket.upload(params, (err, s3response) => {
			if (err) {
				console.log("something went wrong ", err);
				reject(err);
			} else {
				resolve(s3response.Location);
			}
		});
	});
}

async function downloadexpense(req, res, next) {
	try {
		// const expenses = await req.user.getExpenses();
		const expenses = await expenseUser.findAll({where:{ customerId: req.user.id }});
		const stringifiedExpenses = JSON.stringify(expenses);
		let userId = req.user.id;
		const filename = `Expenses${userId}/${new Date()}.txt`;
		const fileURL = await uploadToS3(stringifiedExpenses, filename);
		let obj = {
			customerId: req.user.id,
			fileURL: fileURL,
		};
		await fileurl.create(obj);
		res.status(200).json({ fileURL, success: true });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "failed to download expenses", success: false });
	}
}

async function allfiles(req, res, next) {
	try {
		let lis = await fileurl.findAll({where:{ customerId: req.user.id }});
		res.json(lis);
	} catch (error) {
		console.log(error);
		res.json({ message: "not able to fetch files", success: false });
	}
}

async function pagination(req, res, next) {
	try {
		const page = Number(req.query.currpage);
		let totalItems = await expenseUser.count({where:{ customerId: req.user.id }});
			const expensePerPage = await expenseUser.findAll({
			  where: { customerId: req.user.id },
			  offset: (page - 1) * Number(req.query.expPerPage),
			  limit: Number(req.query.expPerPage),
			});
		res.json({
			expenses: expensePerPage,
			currPage: page,
			hasNextPage: Number(req.query.expPerPage) * page < totalItems,
			nextPage: Number(page) + 1,
			hasPreviousPage: page > 1,
			previousPage: page - 1,
			lastPage: Math.ceil(totalItems / Number(req.query.expPerPage)),
		});
	} catch (error) {
		console.log(error);
		res.json(error);
	}
}

module.exports = {html, addExpense, getAllExpense, deleteExpense, downloadexpense, allfiles, pagination };
