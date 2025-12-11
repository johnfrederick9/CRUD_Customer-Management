// API Configuration
        const API_URL = 'http://localhost:3000/api/customers';

        // Load customers on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadCustomers();
        });

        // Show/Hide Forms
        function showCreateForm() {
            document.getElementById('createFormSection').classList.add('active');
            document.getElementById('editFormSection').classList.remove('active');
            document.getElementById('createForm').reset();
            hideAlerts();
        }

        function hideCreateForm() {
            document.getElementById('createFormSection').classList.remove('active');
        }

        function showEditForm() {
            document.getElementById('editFormSection').classList.add('active');
            document.getElementById('createFormSection').classList.remove('active');
            hideAlerts();
        }

        function hideEditForm() {
            document.getElementById('editFormSection').classList.remove('active');
        }

        // Alert Functions
        function showSuccess(message) {
            const alert = document.getElementById('successAlert');
            alert.textContent = message;
            alert.classList.add('show');
            setTimeout(() => alert.classList.remove('show'), 5000);
        }

        function showError(message) {
            const alert = document.getElementById('errorAlert');
            alert.textContent = message;
            alert.classList.add('show');
            setTimeout(() => alert.classList.remove('show'), 5000);
        }

        function hideAlerts() {
            document.getElementById('successAlert').classList.remove('show');
            document.getElementById('errorAlert').classList.remove('show');
        }

        // Load all customers
        async function loadCustomers() {
            try {
                const response = await fetch(API_URL);
                const result = await response.json();
                
                if (result.success) {
                    displayCustomers(result.data);
                } else {
                    showError('Failed to load customers');
                }
            } catch (error) {
                console.error('Error loading customers:', error);
                showError('Error connecting to server. Please make sure the backend is running.');
                document.getElementById('customerTableBody').innerHTML = 
                    '<tr><td colspan="8" class="empty-state">Failed to load customers. Please check your connection.</td></tr>';
            }
        }

        // Display customers in table
        function displayCustomers(customers) {
            const tbody = document.getElementById('customerTableBody');
            
            if (customers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No customers found. Add your first customer!</td></tr>';
                return;
            }
            
            tbody.innerHTML = customers.map(customer => `
                <tr>
                    <td>${customer.id}</td>
                    <td>${escapeHtml(customer.first_name)}</td>
                    <td>${escapeHtml(customer.last_name)}</td>
                    <td>${escapeHtml(customer.email)}</td>
                    <td>${escapeHtml(customer.phone)}</td>
                    <td>${escapeHtml(customer.address)}</td>
                    <td>${formatDate(customer.date_created)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-small" onclick="editCustomer(${customer.id})">✏️ Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteCustomer(${customer.id})">🗑️ Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Create new customer
        async function createCustomer(event) {
            event.preventDefault();
            
            const customerData = {
                first_name: document.getElementById('firstName').value.trim(),
                last_name: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim()
            };
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customerData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess(result.message);
                    hideCreateForm();
                    loadCustomers();
                    document.getElementById('createForm').reset();
                } else {
                    const errorMsg = result.errors ? result.errors.join(', ') : result.message;
                    showError(errorMsg);
                }
            } catch (error) {
                console.error('Error creating customer:', error);
                showError('Error creating customer. Please try again.');
            }
        }

        // Edit customer - Load data
        async function editCustomer(id) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                const result = await response.json();
                
                if (result.success) {
                    const customer = result.data;
                    document.getElementById('editCustomerId').value = customer.id;
                    document.getElementById('editFirstName').value = customer.first_name;
                    document.getElementById('editLastName').value = customer.last_name;
                    document.getElementById('editEmail').value = customer.email;
                    document.getElementById('editPhone').value = customer.phone;
                    document.getElementById('editAddress').value = customer.address;
                    showEditForm();
                    
                    // Scroll to form
                    document.getElementById('editFormSection').scrollIntoView({ behavior: 'smooth' });
                } else {
                    showError('Failed to load customer data');
                }
            } catch (error) {
                console.error('Error loading customer:', error);
                showError('Error loading customer data');
            }
        }

        // Update customer
        async function updateCustomer(event) {
            event.preventDefault();
            
            const id = document.getElementById('editCustomerId').value;
            const customerData = {
                first_name: document.getElementById('editFirstName').value.trim(),
                last_name: document.getElementById('editLastName').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                phone: document.getElementById('editPhone').value.trim(),
                address: document.getElementById('editAddress').value.trim()
            };
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customerData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess(result.message);
                    hideEditForm();
                    loadCustomers();
                } else {
                    const errorMsg = result.errors ? result.errors.join(', ') : result.message;
                    showError(errorMsg);
                }
            } catch (error) {
                console.error('Error updating customer:', error);
                showError('Error updating customer. Please try again.');
            }
        }

        // Delete customer
        async function deleteCustomer(id) {
            if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess(result.message);
                    loadCustomers();
                } else {
                    showError(result.message);
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
                showError('Error deleting customer. Please try again.');
            }
        }

        // Export to CSV
        async function exportToCSV() {
            try {
                const response = await fetch(`${API_URL}/export/csv`);
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `customers_${new Date().getTime()}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showSuccess('CSV exported successfully!');
                } else {
                    showError('Failed to export CSV');
                }
            } catch (error) {
                console.error('Error exporting CSV:', error);
                showError('Error exporting CSV. Please try again.');
            }
        }

        // Export to PDF
        async function exportToPDF() {
            try {
                const response = await fetch(`${API_URL}/export/pdf`);
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `customers_${new Date().getTime()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showSuccess('PDF exported successfully!');
                } else {
                    showError('Failed to export PDF');
                }
            } catch (error) {
                console.error('Error exporting PDF:', error);
                showError('Error exporting PDF. Please try again.');
            }
        }

        // Utility Functions
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }