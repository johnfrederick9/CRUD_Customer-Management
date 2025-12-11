// ============================================
// IMPORT REQUIRED MODULES
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// EXPLANATION:
// express: Web framework for Node.js
// cors: Enables Cross-Origin Resource Sharing
// bodyParser: Parses incoming request bodies (JSON)
// path: Handles file paths
// dotenv: Loads environment variables from .env

// Import database connection (initializes connection pool)
require('./config/database');

// Import route modules
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');

// ============================================
// CREATE EXPRESS APP
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// EXPLANATION:
// app: Express application instance
// PORT: Server will run on port 3000 (or from .env)

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS middleware - allows frontend to make requests
app.use(cors({
    origin: '*',  // Allow all origins (restrict in production!)
    credentials: true
}));

// EXPLANATION OF CORS:
// Cross-Origin Resource Sharing allows JavaScript from one origin
// to access resources from another origin
// origin: '*' means allow requests from any domain
// In production, specify exact origins: origin: 'https://yourdomain.com'

// Body parser middleware - parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// EXPLANATION:
// bodyParser.json(): Parses JSON in request body
//   Example: { "email": "test@example.com" }
// bodyParser.urlencoded(): Parses URL-encoded data (form submissions)
//   Example: email=test@example.com&password=123456

// Static file serving - serve files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// EXPLANATION:
// Serves static files (HTML, CSS, JS, images) from 'public' folder
// Example: 
//   File: public/index.html → URL: http://localhost:3000/index.html
//   File: public/assets/css/style.css → URL: http://localhost:3000/assets/css/style.css

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// EXPLANATION:
// Logs every request to console for debugging
// Format: 2024-12-11T10:30:00.000Z - GET /api/customers
// next() passes control to next middleware/route

// ============================================
// MOUNT ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// EXPLANATION:
// Mounts authRoutes at /api/auth
// Creates these endpoints:
//   POST /api/auth/register
//   POST /api/auth/login

// Customer CRUD routes (protected by authentication)
app.use('/api/customers', customerRoutes);

// EXPLANATION:
// Mounts customerRoutes at /api/customers
// Creates these endpoints:
//   GET    /api/customers       - Get all customers
//   POST   /api/customers       - Create customer
//   GET    /api/customers/:id   - Get single customer
//   PUT    /api/customers/:id   - Update customer
//   DELETE /api/customers/:id   - Delete customer

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// EXPLANATION:
// When user visits http://localhost:3000/
// Serve the login/register page (index.html)

// ============================================
// 404 HANDLER - Route not found
// ============================================

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found' 
    });
});

// EXPLANATION:
// This middleware runs if no other route matches
// Returns 404 error for undefined routes
// Example: GET /api/nonexistent → 404 error

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// EXPLANATION:
// Catches any errors that weren't handled in routes
// 4 parameters (err, req, res, next) identifies this as error handler
// Always runs last if an error occurs anywhere in the app

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log('🚀 Server is running!');
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log('🚀 ================================');
    console.log('');
    console.log('📍 Available Routes:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/customers');
    console.log('   POST   /api/customers');
    console.log('   GET    /api/customers/:id');
    console.log('   PUT    /api/customers/:id');
    console.log('   DELETE /api/customers/:id');
    console.log('');
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
});

// EXPLANATION:
// app.listen(PORT, callback): Starts HTTP server on specified port
// Server listens for incoming requests
// Callback runs when server successfully starts

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
    console.log('\n⚠️  Shutting down gracefully...');
    process.exit(0);
});

// EXPLANATION:
// Handles Ctrl+C gracefully
// Allows cleanup before exit (closing database connections, etc.)
// SIGINT: Signal sent when user presses Ctrl+C

// ============================================
// HOW TO RUN THIS SERVER:
// ============================================
/*
1. Install dependencies:
   npm install

2. Create .env file with database credentials

3. Setup database (run schema.sql in phpMyAdmin)

4. Start server:
   npm start
   or
   node server.js

5. For development with auto-restart:
   npm run dev
   (requires nodemon)

6. Access application:
   http://localhost:3000
*/

// ============================================
// REQUEST FLOW:
// ============================================
/*
1. Client sends request → http://localhost:3000/api/customers

2. Request passes through middleware:
   - CORS middleware (allows cross-origin)
   - Body parser (parses JSON)
   - Logger (logs request)

3. Router matches the route:
   - /api/customers → customerRoutes

4. Authentication middleware runs:
   - Checks JWT token
   - Sets req.user if valid
   - Returns 401 if invalid

5. Route handler executes:
   - Processes request
   - Queries database
   - Returns response

6. Response sent back to client
*/

// ============================================
// FOLDER STRUCTURE SUMMARY:
// ============================================
/*
server.js                    ← You are here!
├── config/database.js       ← Database connection
├── models/
│   ├── User.js             ← User database operations
│   └── Customer.js         ← Customer database operations
├── routes/
│   ├── auth.js             ← Login/register routes
│   └── customers.js        ← CRUD routes
├── middleware/
│   └── auth.js             ← JWT verification
└── public/                  ← Frontend files
    ├── index.html          ← Login/register page
    ├── dashboard.html      ← Customer management
    └── assets/             ← CSS, JS, images
*/

// ============================================
// SECURITY CONSIDERATIONS:
// ============================================
/*
1. Use HTTPS in production (not HTTP)
2. Set specific CORS origins (not '*')
3. Use helmet.js for security headers
4. Implement rate limiting to prevent abuse
5. Validate and sanitize all inputs
6. Use environment variables for secrets
7. Keep dependencies updated
8. Implement proper error handling
9. Log errors for monitoring
10. Use secure password hashing (bcrypt)
*/