const User = require("../models/user.js") ;
const bcrypt = require ("bcryptjs");
const { registerValidation }  = require('../validation/requestValidation');


exports.registerUser = async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, firstName, lastName } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashPassword,
    firstName,
    lastName,
  });

  await user.save();

  res.status(201).json({
    _id: user._id,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};



