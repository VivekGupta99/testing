const {html,addExpense ,getAllExpense,deleteExpense,downloadexpense,allfiles,pagination} = require('../controller/expense')
const express = require('express');
const {authentication} = require('../middlewares/auth')
const router = express.Router();
router.route('/preview').get(html);
router.route('/').post(authentication,addExpense).get(authentication,getAllExpense);
router.route('/:id').delete(authentication,deleteExpense);
router.route('/download').get(authentication,downloadexpense)
router.route('/allfiles').get(authentication,allfiles);
router.route('/pagination').get(authentication,pagination);

module.exports = router; 