const express = require('express')
const router = express.Router();
const x = require('../controller/premium')
const {authentication} = require('../middlewares/auth')

router.route('/leaderboard').get(authentication,x.getusers);

module.exports = router;