const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');
// const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
// router.post('/login', loginUser);
router.get('/all', getAllUsers);

module.exports = router;
