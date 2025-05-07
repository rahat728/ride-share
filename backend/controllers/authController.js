const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      vehicleType,
      vehicleCapacity,
      vehicleColor,
      vehiclePlate,
    } = req.body;

    const validRoles = ['user', 'driver', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    // Validate driver fields if role is driver
    if (role === 'driver') {
      if (!vehicleType || !vehicleCapacity || !vehicleColor || !vehiclePlate) {
        return res.status(400).json({ error: 'All vehicle fields are required for drivers' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    if (role === 'driver') {
      newUserData.vehicleType = vehicleType;
      newUserData.vehicleCapacity = vehicleCapacity;
      newUserData.vehicleColor = vehicleColor.trim();
      newUserData.vehiclePlate = vehiclePlate.trim();
    }

    await User.create(newUserData);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vehicleType: user.vehicleType
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = (req, res) => {
  
  // Optionally, you can implement token invalidation logic here
  
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
