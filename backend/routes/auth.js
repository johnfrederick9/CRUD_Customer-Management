// Import required modules
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// EXPLANATION:
// express.Router(): Creates modular route handlers
// jwt: Creates and signs authentication tokens
// User model: Handles database operations for users

// ============================================
// REGISTER ROUTE - Create new user account
// ============================================
// POST /api/auth/register
router.post('/register', async (req, res) => {
    // EXPLANATION:
    // This endpoint handles user registration
    // Client sends: first_name, last_name, email, password, passwordConfirm
    
    try {
        // Extract data from request body
        const { first_name, last_name, email, password, passwordConfirm } = req.body;
        
        // ============================================
        // VALIDATION
        // ============================================
        
        // Check if all fields are provided
        if (!first_name || !last_name || !email || !password || !passwordConfirm) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // EXPLANATION:
        // 400 Bad Request: Client sent invalid data
        // Return immediately to stop execution
        
        // Check if passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({ 
                error: 'Passwords do not match' 
            });
        }
        
        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // EXPLANATION OF EMAIL REGEX:
        // ^[^\s@]+ : Start with one or more non-space, non-@ characters
        // @ : Must contain @
        // [^\s@]+ : Followed by non-space, non-@ characters
        // \. : Must contain dot
        // [^\s@]+$ : End with non-space, non-@ characters
        
        // ============================================
        // CHECK IF EMAIL ALREADY EXISTS
        // ============================================
        
        const existingUser = await User.findByEmail(email);
        
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // EXPLANATION:
        // 409 Conflict: Resource already exists
        // We check before creating to give meaningful error
        
        // ============================================
        // CREATE USER
        // ============================================
        
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password // Will be hashed in User.create()
        });
        
        // EXPLANATION:
        // User.create() handles password hashing with bcrypt
        // Never store plain text passwords in database
        
        // ============================================
        // GENERATE JWT TOKEN
        // ============================================
        
        // Create JWT payload
        const payload = {
            id: newUser.id,
            email: newUser.email
        };
        
        // Sign token with secret and set expiration
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );
        
        // EXPLANATION OF JWT:
        // Token contains user id and email
        // Signed with secret key (only server knows this)
        // Expires in 24 hours (user must login again)
        // Client stores this token and sends with each request
        
        // ============================================
        // SEND RESPONSE
        // ============================================
        
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email
            }
        });
        
        // EXPLANATION:
        // 201 Created: Resource successfully created
        // Return token for immediate login
        // Return user info for personalization
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed. Please try again.' 
        });
        // 500 Internal Server Error: Unexpected error occurred
    }
});

// ============================================
// LOGIN ROUTE - Authenticate existing user
// ============================================
// POST /api/auth/login
router.post('/login', async (req, res) => {
    // EXPLANATION:
    // This endpoint handles user login
    // Client sends: email, password
    
    try {
        // Extract credentials from request body
        const { email, password } = req.body;
        
        // ============================================
        // VALIDATION
        // ============================================
        
        // Check if credentials are provided
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // ============================================
        // FIND USER
        // ============================================
        
        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // EXPLANATION:
        // 401 Unauthorized: Authentication failed
        // Don't specify if email or password is wrong (security)
        // Prevents attackers from knowing which is incorrect
        
        // ============================================
        // VERIFY PASSWORD
        // ============================================
        
        const isPasswordValid = await User.verifyPassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // EXPLANATION:
        // User.verifyPassword uses bcrypt.compare()
        // Compares plain password with hashed password
        // Returns true if match, false otherwise
        
        // ============================================
        // GENERATE JWT TOKEN
        // ============================================
        
        const payload = {
            id: user.id,
            email: user.email
        };
        
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // ============================================
        // SEND RESPONSE
        // ============================================
        
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
        
        // EXPLANATION:
        // 200 OK: Request successful
        // Client stores token in localStorage
        // Token included in Authorization header for future requests
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed. Please try again.' 
        });
    }
});

// Export router to be used in server.js
module.exports = router;

// ============================================
// USAGE IN server.js:
// ============================================
/*
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// This creates endpoints:
// POST /api/auth/register
// POST /api/auth/login
*/

// ============================================
// CLIENT-SIDE USAGE:
// ============================================
/*
// REGISTER
fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
    })
})
.then(res => res.json())
.then(data => {
    // Store token
    localStorage.setItem('token', data.token);
    // Store user info
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
});

// LOGIN
fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
    })
})
.then(res => res.json())
.then(data => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
});
*/

// ============================================
// SECURITY BEST PRACTICES:
// ============================================
// 1. Password validation (length, complexity)
// 2. Email format validation
// 3. Password hashing with bcrypt
// 4. JWT for stateless authentication
// 5. Token expiration (24 hours)
// 6. Generic error messages (don't reveal which field is wrong)
// 7. HTTPS in production (encrypt data in transit)
// 8. Rate limiting (prevent brute force attacks)