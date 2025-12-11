const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { exportToCSV } = require('../utils/csvExport');
const { exportToPDF } = require('../utils/pdfExport');
const fs = require('fs');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['date_created', 'DESC']]
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer', error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    
    const customer = await Customer.create({
      first_name,
      last_name,
      email,
      phone,
      address
    });
    
    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors.map(e => e.message) 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to create customer', error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    await customer.update({
      first_name,
      last_name,
      email,
      phone,
      address
    });
    
    res.json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors.map(e => e.message) 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to update customer', error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    await customer.destroy();
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer', error: error.message });
  }
});

// Export to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['date_created', 'DESC']]
    });
    
    const filePath = await exportToCSV(customers.map(c => c.toJSON()));
    
    res.download(filePath, 'customers.csv', (err) => {
      if (err) {
        console.error('Error downloading CSV:', err);
      }
      // Delete file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV', error: error.message });
  }
});

// Export to PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['date_created', 'DESC']]
    });
    
    const filePath = await exportToPDF(customers.map(c => c.toJSON()));
    
    res.download(filePath, 'customers.pdf', (err) => {
      if (err) {
        console.error('Error downloading PDF:', err);
      }
      // Delete file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to export PDF', error: error.message });
  }
});

module.exports = router;