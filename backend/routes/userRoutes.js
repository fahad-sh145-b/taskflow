const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { jwtAuthMiddleware, generatetoken } = require('../jwt')

const User = require('../models/user');


// // GET /user/
// router.get('/', (req, res) => {
//     res.json({ message: 'User route active' });
// });


router.post('/register', async (req, res) => {

    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({ message: 'All fields are required' });
        }


        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newuser = new User({
            name, password, phone, email
        });

        const response = await newuser.save();

        console.log('data saved');

        const payload = {
            id: response._id,
            _id: response._id,
            name: response.name,
            email: response.email,
            role: response.role,
            phone: response.phone
        }

        const token = generatetoken(payload);

        return res.status(200).json({ message: 'Registration successful', user: response, response: response, token: token });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

})



router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        const response = await User.findOne({ email });

        if (!response || !(await response.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (response.email === "shaikhbashiruddinmohdhajishaik@gmail.com" && response.role !== "admin") {
            response.role = "admin";
            await response.save();
        }
        const payload = {
            id: response._id,
            _id: response._id,
            name: response.name,
            email: response.email,
            role: response.role,
            phone: response.phone
        }

        const token = generatetoken(payload);

        return res.status(200).json({ message: 'Login successful', user: response, response: response, token: token });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
})


router.post('/add', jwtAuthMiddleware, async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        let existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', user: existingUser });
        }

        const newUser = new User({
            name: (name && name.trim()) || cleanEmail.split('@')[0],
            email: cleanEmail,
            password: 'User@' + Math.random().toString(36).substring(2, 8),
            role: role || 'member'
        });

        const savedUser = await newUser.save();
        console.log('New member added:', savedUser.email);

        return res.status(201).json({ message: 'Member added successfully', user: savedUser });
    } catch (err) {
        console.error('Error adding user:', err);
        return res.status(500).json({ message: 'Failed to add user' });
    }
});

router.get('/', jwtAuthMiddleware, async (req, res) => {

    try {

        const response = await User.find();

        console.log("data fetched");

        return res.status(201).json(response);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/profile/:id', jwtAuthMiddleware, async (req, res) => {

    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format. Must be a 24-character hex string.' });
        }

        const response = await User.findById(userId);

        if (!response) {
            return res.status(404).json({ message: 'user not found' });
        }

        return res.status(200).json(response);

    }

    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }

})



router.put('/:id', async (req, res) => {

    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format. Must be a 24-character hex string.' });
        }

        const updatedPersonData = req.body;
        const response = await User.findByIdAndUpdate(userId, updatedPersonData, {

            new: true,
            runValidators: true
        });

        if (!response) {

            return res.status(404).json({ message: 'user not found' })
        }


        console.log('data updated');
        return res.status(200).json({ message: 'user updated successfully', response })
    }

    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }

})




router.delete('/:id', async (req, res) => {

    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format. Must be a 24-character hex string.' });
        }

        const response = await User.findByIdAndDelete(userId);

        if (!response) {

            return res.status(404).json({ message: 'user not found' })
        }

        console.log('data deleted');
        return res.status(200).json({ message: 'user deleted successfully', response })
    }

    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }


})

module.exports = router;
