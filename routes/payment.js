const express = require("express");
const router = express.Router();
const {purchasePremium,updateTransactionStatus,updateTransactionStatusFailed} = require("../controller/payment.js");
const { authentication } = require("../middlewares/auth");

router.route("/premiummembership").get(authentication, purchasePremium);

router.route('/updatetransactionstatus/success').post(authentication,updateTransactionStatus)
router.route('/updatetransactionstatus/failed').post(authentication,updateTransactionStatusFailed)
module.exports = router;
