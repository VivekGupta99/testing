const express = require("express")
const app = express();
const cors = require("cors")
const path = require("path")
const bodyParser = require('body-parser')
const user_route = require("./routes/user")
const expense_route = require("./routes/expense")
const purchase_route = require("./routes/payment")
const premium_route = require("./routes/premium")
const password_route = require("./routes/password")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const db = require('./db/connect.js')
db.customers.hasMany(db.expenses)
db.expenses.belongsTo(db.customers)
db.customers.hasMany(db.orders)
db.orders.belongsTo(db.customers)
db.customers.hasMany(db.ResetPassword);
db.ResetPassword.belongsTo(db.customers);
db.customers.hasMany(db.fileurl);
db.fileurl.belongsTo(db.customers);
db.sequelize.sync({}).then(() => {
  console.log("ok report")
}).catch((error) => {
  console.log(error)
})

//production

app.use(cors());

//middlewares
app.use(bodyParser.json());

//routes
app.use('/user',user_route);
app.use('/expense',expense_route)
app.use('/purchase',purchase_route)
app.use('/premium',premium_route)
app.use('/password',password_route)

// app.use((req,res)=>{

// 	res.sendFile(path.join(__dirname,`public/${req.url}`))
// })  
 
app.listen(3001);

