// A simple backend that uses jwt for account creation and validation authentication
// and stores user data in user.json file.
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { type } = require('os');
require('dotenv').config();

secret = process.env.JWT_TOKEN;
const str_secret = String(secret);



exports.registerUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(typeof str_secret);

    // Basic validation of incoming data
    if (!username || !password) {
        return res.status(400).json({ message: 'username and password are required for registration.' });
    }

    try {
        //Verify if username exists in user.json file
        const users = require('./user.json'); // Assuming user.json is in the same directory
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists. Please choose a different one.' });
        }
        // Using bcrypt to hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt rounds of 10

        //Create a new user object with the hashed password
        const newUser = {
            username: username,
            password: hashedPassword // Store the hashed password
        };

        // Add the new user to the users array
        users.push(newUser);

        // Save the updated users array back to user.json
        const fs = require('fs');
        try {
            fs.writeFileSync('./user.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to user.json:', err);
                    return res.status(500).json({ message: 'Internal server error while saving user data.' });
                }
            });
        } catch (err) {
            console.error('Error writing to user.json:', err);
            return res.status(500).json({ message: 'Internal server error while saving user data.' });
        };

        //Generate a JWT token for the new user
        const token = jwt.sign({ username: newUser.username }, str_secret, { expiresIn: '1h' }); //Expires in 60 minutes
        res.status(201).json({ message: 'User registered successfully.', token: token });
        console.log({
            username: newUser.username,
            token: token
        });
        
    } catch (error) {
        console.error('Backend Registration Error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
}

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Basic validation of incoming data
    if (!username || !password) {
        return res.status(400).json({ message: 'username and password are required for login.' });
    }

    try {
        // Verify if username exists in user.json file
        const users = require('./user.json'); // Assuming user.json is in the same directory
        const existingUser = users.find(user => user.username === username);
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Compare the provided password with the hashed password stored in user.json
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Generate a JWT token for the user
        const token = jwt.sign({ username: existingUser.username }, str_secret , { expiresIn: '0.1h' }); //Expires in 6 minutes
        res.status(200).json({ message: 'Login successful.', token: token });
        console.log({
            username: existingUser.username,
            token: token
        })

    } catch (error) {
        console.error('Backend Login Error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
}

//Extracting user profiles
exports.getProfile = (req, res) => {
    const fs = require('fs');
    const users = JSON.parse(fs.readFileSync('./user.json', 'utf8'));

    const username = req.user.username;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userProfile } = user;

    res.status(200).json({
        ...userProfile,
        message: 'Profile retrieved successfully.'
    });
};

