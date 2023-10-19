const express = require('express');
const {html,forgotPassword,resetpassword, updatepassword} = require('../controller/password')
const router = express.Router(); 

router.route('/').get(html);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:id').get(resetpassword)
router.route('/updatepassword/:id').post(updatepassword)


module.exports = router;   