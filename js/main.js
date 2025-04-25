
// App state
const state = {
    products: [],
    currentPage: 1,
    productsPerPage: 20,
    selectedProductId: null,
    selectedRowIndex: null,
    currentAction: null,
    scriptUrl: localStorage.getItem('scriptUrl') || '',
    isConnected: false
};

// DOM Elements
const elements = {
    // Connection status
    connectionStatus: document.getElementById('connectionStatus'),
    scriptUrl: document.getElementById('scriptUrl'),
    connectBtn: document.getElementById('connectBtn'),

    // Inventory table
    productTableBody: document.getElementById('productTableBody'),
    totalRevenue: document.getElementById('totalRevenue'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    startRange: document.getElementById('startRange'),
    endRange: document.getElementById('endRange'),
    totalProducts: document.getElementById('totalProducts'),
    addProductBtn: document.getElementById('addProductBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    toastContainer: document.getElementById('toastContainer'),

    // Image Modal
    imageModal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    modalProductName: document.getElementById('modalProductName'),
    closeImageModal: document.getElementById('closeImageModal'),

    // Product Form Modal
    productFormModal: document.getElementById('productFormModal'),
    productFormTitle: document.getElementById('productFormTitle'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productRowIndex: document.getElementById('productRowIndex'),
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productQuantitySold: document.getElementById('productQuantitySold'),
    productStock: document.getElementById('productStock'),
    productColor: document.getElementById('productColor'),
    closeProductFormModal: document.getElementById('closeProductFormModal'),
    cancelProductFormBtn: document.getElementById('cancelProductFormBtn'),

    // Confirmation Modal
    confirmationModal: document.getElementById('confirmationModal'),
    confirmationTitle: document.getElementById('confirmationTitle'),
    confirmationMessage: document.getElementById('confirmationMessage'),
    closeConfirmationModal: document.getElementById('closeConfirmationModal'),
    cancelConfirmationBtn: document.getElementById('cancelConfirmationBtn'),
    confirmActionBtn: document.getElementById('confirmActionBtn')
};

// Initialize the app
function init() {
    // Set the script URL if it's in localStorage
    if (state.scriptUrl) {
        console.log("🚀 ~ init ~ state.scriptUrl:", state.scriptUrl)
        elements.scriptUrl = state.scriptUrl;
        connectToScript();
    } else {
        handleConnect();
    }

    // Add event listeners
    elements.prevPageBtn.addEventListener('click', handlePrevPage);
    elements.nextPageBtn.addEventListener('click', handleNextPage);
    elements.addProductBtn.addEventListener('click', handleAddProduct);
    elements.refreshBtn.addEventListener('click', loadProductsFromSheet);

    // Image modal events
    elements.closeImageModal.addEventListener('click', closeImageModal);
    elements.imageModal.addEventListener('click', (e) => {
        if (e.target === elements.imageModal) closeImageModal();
    });

    // Product form modal events
    elements.productForm.addEventListener('submit', handleProductFormSubmit);
    elements.closeProductFormModal.addEventListener('click', closeProductFormModal);
    elements.cancelProductFormBtn.addEventListener('click', closeProductFormModal);
    elements.productFormModal.addEventListener('click', (e) => {
        if (e.target === elements.productFormModal) closeProductFormModal();
    });

    // Confirmation modal events
    elements.closeConfirmationModal.addEventListener('click', closeConfirmationModal);
    elements.cancelConfirmationBtn.addEventListener('click', closeConfirmationModal);
    elements.confirmationModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmationModal) closeConfirmationModal();
    });
}

// Handle connect button click
function handleConnect() {
    const url = API_URL;
    //const url = elements.scriptUrl.value.trim() 

    if (!url) {
        showToast('Please enter a valid Google Apps Script URL.', 'warning');
        return;
    }

    // Save the URL to localStorage
    localStorage.setItem('scriptUrl', url);
    state.scriptUrl = url;

    connectToScript();
}

// Connect to the Google Apps Script
function connectToScript() {
    updateConnectionStatus('connecting', 'Connecting to Google Apps Script...');

    // Test the connection by loading products
    loadProductsFromSheet();
}

// Update connection status UI
function updateConnectionStatus(status, message, clickable = false) {
    let bgColor, borderColor, textColor, icon;

    if (status === 'success') {
        bgColor = 'bg-green-50';
        borderColor = 'border-green-400';
        textColor = 'text-green-700';
        icon = `<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;
    } else if (status === 'error') {
        bgColor = 'bg-red-50';
        borderColor = 'border-red-400';
        textColor = 'text-red-700';
        icon = `<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;
    } else if (status === 'connecting') {
        bgColor = 'bg-blue-50';
        borderColor = 'border-blue-400';
        textColor = 'text-blue-700';
        icon = `<svg class="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`;
    } else {
        bgColor = 'bg-yellow-50';
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-700';
        icon = `<svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>`;
    }

    elements.connectionStatus.className = `mb-8 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg ${clickable ? 'cursor-pointer hover:bg-opacity-80' : ''}`;
    elements.connectionStatus.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="ml-3">
                <p class="text-sm ${textColor}">
                    ${message}
                </p>
            </div>
        </div>
    `;
}

// Load products from Google Sheet via Apps Script
function loadProductsFromSheet() {
    if (!state.scriptUrl) {
        showToast('Please enter and connect to your Google Apps Script URL first.', 'warning');
        return;
    }

    // Show loading state
    elements.productTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="py-8 text-center text-slate-500">
                <div class="flex flex-col items-center justify-center">
                    <svg class="animate-spin h-8 w-8 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading products from Google Sheets...
                </div>
            </td>
        </tr>
    `;

    // Fetch data from the Apps Script
    fetch(`${state.scriptUrl}?action=getProducts`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                state.isConnected = true;
                updateConnectionStatus('success', 'Connected to Google Apps Script successfully!');

                // Process the products
                state.products = data.products.map(product => ({
                    ...product,
                    price: parseFloat(product.price),
                    quantitySold: parseInt(product.quantitySold),
                    stock: parseInt(product.stock)
                }));

                renderProductTable();
                updatePagination();
                showToast('Products loaded successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to load products');
            }
        })
        .catch(error => {
            console.error('Error loading data:', error);
            state.isConnected = false;
            updateConnectionStatus('error', 'Failed to connect to Google Apps Script. Please check the URL and try again.');

            elements.productTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-slate-500">
                        <div class="flex flex-col items-center justify-center">
                            <svg class="h-8 w-8 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                            Failed to load data. Please check your connection and try again.
                        </div>
                    </td>
                </tr>
            `;

            showToast('Failed to load products. Please check the Apps Script URL and make sure it\'s deployed as a web app.', 'error');
        });
}

// Render the product table
function renderProductTable() {
    const startIndex = (state.currentPage - 1) * state.productsPerPage;
    const endIndex = startIndex + state.productsPerPage;
    const currentPageProducts = state.products.slice(startIndex, endIndex);

    elements.productTableBody.innerHTML = '';

    if (currentPageProducts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="py-8 text-center text-slate-500">
                No products found. Add a new product to get started.
            </td>
        `;
        elements.productTableBody.appendChild(row);
    } else {
        currentPageProducts.forEach(product => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 transition-colors duration-150';

            const revenue = product.price * product.quantitySold;

            row.innerHTML = `
                <td class="py-4 px-6 text-left">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer product-image shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105" 
                            style="background-color: ${product.color};" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-color="${product.color}">
                        <span class="text-white text-xl font-semibold">${product.name.charAt(0)}</span>
                    </div>
                </td>
                <td class="py-4 px-6 text-left font-medium text-slate-800">${product.name}</td>
                <td class="py-4 px-6 text-right text-slate-700">$${product.price.toFixed(2)}</td>
                <td class="py-4 px-6 text-right text-slate-700">${product.quantitySold}</td>
                <td class="py-4 px-6 text-right text-slate-700">${product.stock}</td>
                <td class="py-4 px-6 text-right font-medium text-slate-800">$${revenue.toFixed(2)}</td>
                <td class="py-4 px-6 text-center">
                    <div class="flex justify-center space-x-2">
                        <button class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 edit-btn" data-id="${product.id}" data-row-index="${product.rowIndex}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 delete-btn" data-id="${product.id}" data-row-index="${product.rowIndex}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            elements.productTableBody.appendChild(row);
        });
    }

    // Add event listeners to the product images
    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('click', handleImageClick);
    });

    // Add event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditProduct);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteProduct);
    });

    // Update total revenue
    updateTotalRevenue();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(state.products.length / state.productsPerPage);
    const startIndex = state.products.length > 0 ? (state.currentPage - 1) * state.productsPerPage + 1 : 0;
    const endIndex = Math.min(startIndex + state.productsPerPage - 1, state.products.length);

    elements.startRange.textContent = startIndex;
    elements.endRange.textContent = endIndex;
    elements.totalProducts.textContent = state.products.length;

    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
}

// Update total revenue
function updateTotalRevenue() {
    const total = state.products.reduce((sum, product) => {
        return sum + (product.price * product.quantitySold);
    }, 0);

    elements.totalRevenue.textContent = `$${total.toFixed(2)}`;
}

// Handle previous page button click
function handlePrevPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderProductTable();
        updatePagination();
    }
}

// Handle next page button click
function handleNextPage() {
    const totalPages = Math.ceil(state.products.length / state.productsPerPage);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderProductTable();
        updatePagination();
    }
}

// Handle image click
function handleImageClick(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const name = e.currentTarget.dataset.name;
    const color = e.currentTarget.dataset.color;

    elements.modalProductName.textContent = name;

    // Create a larger version of the product image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add product initial with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 180px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0), canvas.width / 2, canvas.height / 2);

    elements.modalImage.src = canvas.toDataURL();

    // Show the modal
    elements.imageModal.classList.remove('hidden');
    setTimeout(() => {
        elements.imageModal.classList.add('opacity-100');
        elements.imageModal.querySelector('.scale-95').classList.add('scale-100');
    }, 10);
}

// Adjust color brightness
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// Close image modal
function closeImageModal() {
    elements.imageModal.classList.remove('opacity-100');
    elements.imageModal.querySelector('.scale-100').classList.remove('scale-100');
    setTimeout(() => {
        elements.imageModal.classList.add('hidden');
    }, 300);
}

// Handle add product button click
function handleAddProduct() {
    if (!state.isConnected) {
        showToast('Please connect to your Google Apps Script first.', 'warning');
        return;
    }

    showProductForm();
}

// Handle edit product button click
function handleEditProduct(e) {
    if (!state.isConnected) {
        showToast('Please connect to your Google Apps Script first.', 'warning');
        return;
    }

    const id = parseInt(e.currentTarget.dataset.id);
    const rowIndex = parseInt(e.currentTarget.dataset.rowIndex);
    showProductForm(id, rowIndex);
}

// Handle delete product button click
function handleDeleteProduct(e) {
    if (!state.isConnected) {
        showToast('Please connect to your Google Apps Script first.', 'warning');
        return;
    }

    const id = parseInt(e.currentTarget.dataset.id);
    const rowIndex = parseInt(e.currentTarget.dataset.rowIndex);
    state.selectedProductId = id;
    state.selectedRowIndex = rowIndex;

    const product = state.products.find(p => p.id === id);
    if (product) {
        showConfirmationModal(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            deleteProduct
        );
    }
}

// Show product form
function showProductForm(productId = null, rowIndex = null) {
    if (productId) {
        // Edit mode
        const product = state.products.find(p => p.id === productId);
        if (product) {
            elements.productFormTitle.textContent = 'Edit Product';
            elements.productId.value = product.id;
            elements.productRowIndex.value = rowIndex;
            elements.productName.value = product.name;
            elements.productPrice.value = product.price;
            elements.productQuantitySold.value = product.quantitySold;
            elements.productStock.value = product.stock;
            elements.productColor.value = product.color;
        }
    } else {
        // Add mode
        elements.productFormTitle.textContent = 'Add Product';
        elements.productForm.reset();
        elements.productId.value = '';
        elements.productRowIndex.value = '';
        elements.productColor.value = '#0ea5e9';
    }

    elements.productFormModal.classList.remove('hidden');
    setTimeout(() => {
        elements.productFormModal.classList.add('opacity-100');
        elements.productFormModal.querySelector('.scale-95').classList.add('scale-100');
        elements.productName.focus();
    }, 10);
}

// Close product form modal
function closeProductFormModal() {
    elements.productFormModal.classList.remove('opacity-100');
    elements.productFormModal.querySelector('.scale-100').classList.remove('scale-100');
    setTimeout(() => {
        elements.productFormModal.classList.add('hidden');
    }, 300);
}

// Show confirmation modal
function showConfirmationModal(title, message, confirmCallback) {
    elements.confirmationTitle.textContent = title;
    elements.confirmationMessage.textContent = message;

    // Set the confirm button action
    elements.confirmActionBtn.onclick = () => {
        closeConfirmationModal();
        confirmCallback();
    };

    elements.confirmationModal.classList.remove('hidden');
    setTimeout(() => {
        elements.confirmationModal.classList.add('opacity-100');
        elements.confirmationModal.querySelector('.scale-95').classList.add('scale-100');
    }, 10);
}

// Close confirmation modal
function closeConfirmationModal() {
    elements.confirmationModal.classList.remove('opacity-100');
    elements.confirmationModal.querySelector('.scale-100').classList.remove('scale-100');
    setTimeout(() => {
        elements.confirmationModal.classList.add('hidden');
    }, 300);
}

// Handle product form submission
function handleProductFormSubmit(e) {
    e.preventDefault();

    const productData = {
        name: elements.productName.value,
        price: parseFloat(elements.productPrice.value),
        quantitySold: parseInt(elements.productQuantitySold.value),
        stock: parseInt(elements.productStock.value),
        color: elements.productColor.value
    };

    const productId = elements.productId.value;
    const rowIndex = elements.productRowIndex.value;

    if (productId && rowIndex) {
        // Update existing product
        updateProduct(parseInt(productId), parseInt(rowIndex), productData);
    } else {
        // Add new product
        addProduct(productData);
    }

    closeProductFormModal();
}

// Add a new product
function addProduct(productData) {
    // Show loading toast
    showToast('Adding product...', 'info');

    // Send request to Apps Script
    fetch(`${state.scriptUrl}?action=addProduct`, {
        method: 'POST',
        body: JSON.stringify(productData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Add to local state
                state.products.push({
                    ...data.product,
                    price: parseFloat(data.product.price),
                    quantitySold: parseInt(data.product.quantitySold),
                    stock: parseInt(data.product.stock)
                });

                // Update UI
                renderProductTable();
                updatePagination();

                showToast('Product added successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to add product');
            }
        })
        .catch(error => {
            console.error('Error adding product:', error);
            showToast('Failed to add product. Please try again.', 'error');
        });
}

// Update an existing product
function updateProduct(id, rowIndex, productData) {
    // Show loading toast
    showToast('Updating product...', 'info');

    // Prepare data for the request
    const requestData = {
        ...productData,
        id: id,
        rowIndex: rowIndex
    };

    // Send request to Apps Script
    fetch(`${state.scriptUrl}?action=updateProduct`, {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Update in local state
                const index = state.products.findIndex(p => p.id === id);

                if (index !== -1) {
                    state.products[index] = {
                        ...state.products[index],
                        ...data.product,
                        price: parseFloat(data.product.price),
                        quantitySold: parseInt(data.product.quantitySold),
                        stock: parseInt(data.product.stock)
                    };

                    // Update UI
                    renderProductTable();
                    updatePagination();

                    showToast('Product updated successfully!', 'success');
                }
            } else {
                throw new Error(data.error || 'Failed to update product');
            }
        })
        .catch(error => {
            console.error('Error updating product:', error);
            showToast('Failed to update product. Please try again.', 'error');
        });
}

// Delete a product
function deleteProduct() {
    const id = state.selectedProductId;
    const rowIndex = state.selectedRowIndex;

    if (!id || !rowIndex) return;

    // Show loading toast
    showToast('Deleting product...', 'info');

    // Prepare data for the request
    const requestData = {
        id: id,
        rowIndex: rowIndex
    };

    // Send request to Apps Script
    fetch(`${state.scriptUrl}?action=deleteProduct`, {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Remove from local state
                state.products = state.products.filter(p => p.id !== id);

                // Update UI
                renderProductTable();
                updatePagination();

                // Adjust current page if needed
                const totalPages = Math.ceil(state.products.length / state.productsPerPage);
                if (state.currentPage > totalPages && totalPages > 0) {
                    state.currentPage = totalPages;
                    renderProductTable();
                    updatePagination();
                }

                showToast('Product deleted successfully!', 'warning');
            } else {
                throw new Error(data.error || 'Failed to delete product');
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            showToast('Failed to delete product. Please try again.', 'error');
        });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 p-4 rounded-xl shadow-lg transform transition-all duration-500 translate-x-full animate-slide-up max-w-md';

    // Set background color based on type
    if (type === 'success') {
        toast.classList.add('bg-green-50', 'border-l-4', 'border-green-500');
        var icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>`;
    } else if (type === 'warning') {
        toast.classList.add('bg-yellow-50', 'border-l-4', 'border-yellow-500');
        var icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>`;
    } else if (type === 'error') {
        toast.classList.add('bg-red-50', 'border-l-4', 'border-red-500');
        var icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>`;
    } else {
        toast.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
        var icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    }

    toast.innerHTML = `
        ${icon}
        <span class="text-slate-800">${message}</span>
        <button class="ml-auto text-slate-400 hover:text-slate-600 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Add close button functionality
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

// Remove toast notification
function removeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-up {
        0% { transform: translateX(100%); }
        100% { transform: translateX(0); }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
