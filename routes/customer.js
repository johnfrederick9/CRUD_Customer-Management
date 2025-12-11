// Import required modules
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const authMiddleware = require('../middleware/auth');

// EXPLANATION:
// All routes in this file are protected by authMiddleware
// Users must be logged in (valid JWT token) to access these routes
// req.user.id is available in all route handlers (set by middleware)

// Apply authentication middleware to all routes
router.use(authMiddleware);

// EXPLANATION:
// router.use() applies middleware to ALL routes in this router
// Every route below will require a valid JWT token
// If token is invalid, middleware returns 401 before reaching route

// ============================================
// CREATE CUSTOMER
// ============================================
// POST /api/customers
router.post('/', async (req, res) => {
    // EXPLANATION:
    // Creates a new customer for the logged-in user
    // req.user.id comes from JWT token (set by authMiddleware)
    
    try {
        const { first_name, last_name, email, phone, address } = req.body;
        
        // ============================================
        // VALIDATION
        // ============================================
        
        // Check required fields
        if (!first_name || !last_name || !email || !phone || !address) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Validate phone format (simple check)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                error: 'Invalid phone format' 
            });
        }
        
        // ============================================
        // CREATE CUSTOMER
        // ============================================
        
        const newCustomer = await Customer.create({
            first_name,
            last_name,
            email,
            phone,
            address,
            user_id: req.user.id  // Link customer to logged-in user
        });
        
        // EXPLANATION:
        // req.user.id ensures customer belongs to this user
        // User can only see/edit/delete their own customers
        
        res.status(201).json({
            message: 'Customer created successfully',
            customer: newCustomer
        });
        
    } catch (error) {
        console.error('Create customer error:', error);
        
        // Handle duplicate email
        if (error.message === 'Customer email already exists') {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ 
            error: 'Failed to create customer' 
        });
    }
});

// ============================================
// GET ALL CUSTOMERS
// ============================================
// GET /api/customers
router.get('/', async (req, res) => {
    // EXPLANATION:
    // Retrieves all customers belonging to the logged-in user
    // Only returns customers with user_id matching req.user.id
    
    try {
        const customers = await Customer.findAllByUserId(req.user.id);
        
        // EXPLANATION:
        // Customer.findAllByUserId filters by user_id
        // User A cannot see User B's customers
        
        res.status(200).json({
            customers,
            count: customers.length
        });
        
        // RESPONSE FORMAT:
        // {
        //   customers: [...array of customer objects...],
        //   count: 5
        // }
        
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve customers' 
        });
    }
});

// ============================================
// GET SINGLE CUSTOMER
// ============================================
// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    // EXPLANATION:
    // Retrieves one customer by ID
    // :id is a URL parameter (e.g., /api/customers/5)
    // Also checks user_id to prevent unauthorized access
    
    try {
        const customerId = req.params.id;
        
        // EXPLANATION OF req.params:
        // URL: /api/customers/5
        // req.params.id = "5"
        
        const customer = await Customer.findById(customerId, req.user.id);
        
        // EXPLANATION:
        // findById(customerId, req.user.id) ensures:
        // 1. Customer with this ID exists
        // 2. Customer belongs to current user
        
        if (!customer) {
            return res.status(404).json({ 
                error: 'Customer not found' 
            });
        }
        
        // 404 Not Found: Customer doesn't exist or doesn't belong to user
        
        res.status(200).json({ customer });
        
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve customer' 
        });
    }
});

// ============================================
// UPDATE CUSTOMER
// ============================================
// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
    // EXPLANATION:
    // Updates an existing customer
    // Can only update customers belonging to logged-in user
    
    try {
        const customerId = req.params.id;
        const { first_name, last_name, email, phone, address } = req.body;
        
        // ============================================
        // VALIDATION
        // ============================================
        
        if (!first_name || !last_name || !email || !phone || !address) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // ============================================
        // UPDATE CUSTOMER
        // ============================================
        
        const updatedCustomer = await Customer.update(
            customerId,
            { first_name, last_name, email, phone, address },
            req.user.id
        );
        
        // EXPLANATION:
        // Customer.update checks user_id internally
        // Prevents User A from updating User B's customers
        // Even if User A knows the customer ID
        
        res.status(200).json({
            message: 'Customer updated successfully',
            customer: updatedCustomer
        });
        
    } catch (error) {
        console.error('Update customer error:', error);
        
        // Handle specific errors
        if (error.message === 'Customer not found or unauthorized') {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message === 'Customer email already exists') {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ 
            error: 'Failed to update customer' 
        });
    }
});

// ============================================
// DELETE CUSTOMER
// ============================================
// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
    // EXPLANATION:
    // Deletes a customer
    // Can only delete customers belonging to logged-in user
    
    try {
        const customerId = req.params.id;
        
        await Customer.delete(customerId, req.user.id);
        
        // EXPLANATION:
        // Customer.delete checks user_id internally
        // Prevents User A from deleting User B's customers
        
        res.status(200).json({
            message: 'Customer deleted successfully',
            id: customerId
        });
        
    } catch (error) {
        console.error('Delete customer error:', error);
        
        if (error.message === 'Customer not found or unauthorized') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ 
            error: 'Failed to delete customer' 
        });
    }
});

// Export router for use in server.js
module.exports = router;

// ============================================
// USAGE IN server.js:
// ============================================
/*
const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

// This creates endpoints:
// POST   /api/customers       - Create customer
// GET    /api/customers       - Get all customers
// GET    /api/customers/:id   - Get single customer
// PUT    /api/customers/:id   - Update customer
// DELETE /api/customers/:id   - Delete customer
*/

// ============================================
// CLIENT-SIDE USAGE EXAMPLES:
// ============================================
/*
const token = localStorage.getItem('token');

// GET ALL CUSTOMERS
fetch('/api/customers', {
    headers: { 
        'Authorization': `Bearer ${token}` 
    }
})
.then(res => res.json())
.then(data => console.log(data.customers));

// CREATE CUSTOMER
fetch('/api/customers', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-0101',
        address: '123 Main St'
    })
})
.then(res => res.json())
.then(data => console.log(data));

// UPDATE CUSTOMER
fetch('/api/customers/5', {
    method: 'PUT',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone: '555-0102',
        address: '456 Oak Ave'
    })
})
.then(res => res.json())
.then(data => console.log(data));

// DELETE CUSTOMER
fetch('/api/customers/5', {
    method: 'DELETE',
    headers: { 
        'Authorization': `Bearer ${token}` 
    }
})
.then(res => res.json())
.then(data => console.log(data));
*/

// ============================================
// SECURITY FEATURES:
// ============================================
// 1. authMiddleware protects all routes
// 2. user_id check prevents unauthorized access
// 3. Input validation on all fields
// 4. Email format validation
// 5. Error handling with appropriate status codes
// 6. Parameterized queries prevent SQL injection
// 7. JWT token required in Authorization header

// ============================================
// HTTP STATUS CODES USED:
// ============================================
// 200 OK - Successful GET, PUT, DELETE
// 201 Created - Successful POST
// 400 Bad Request - Invalid input data
// 401 Unauthorized - Invalid/missing token
// 404 Not Found - Customer doesn't exist
// 409 Conflict - Duplicate email
// 500 Internal Server Error - Unexpected error