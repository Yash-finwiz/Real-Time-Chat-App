const express = require('express');
const router = express.Router();

const { getUserGroups } = require('../controllers/conversationController');

router.get('/getGroups', getUserGroups);


module.exports = router;