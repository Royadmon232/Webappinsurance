// Home Insurance Landing Page JavaScript
// Initialized and ready for development

document.addEventListener('DOMContentLoaded', function() {
    console.log('Home Insurance Landing Page loaded successfully!');
    
    // Initialize CTA button - simplified version
    const ctaButton = document.getElementById('getQuoteBtn');
    const modal = document.getElementById('generalDetailsModal');
    
    // Function to open modal
    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Initialize modal functionality
            initializeConditionalFields();
            initializeProductSections();
            addFormInputListeners();
            setupModalCloseHandlers();
            
            // Set min date
            const startDateInput = document.getElementById('startDate');
            if (startDateInput) {
                const today = new Date().toISOString().split('T')[0];
                startDateInput.min = today;
            }
        }
    }
    
    // Add event listener to CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
});

/**
 * Initialize page functionality
 */
function initializePage() {
    console.log('initializePage called');
    // Add smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Add responsive navigation handling
    initializeNavigation();
    
    // Add form validation (ready for future forms)
    initializeFormValidation();
    
    // Initialize CTA button functionality - REMOVED to prevent conflict with modal
    // initializeCTAButton();
    
    // Initialize modal CTA button
    console.log('About to call initializeModalCTAButton');
    initializeModalCTAButton();
    console.log('initializeModalCTAButton completed');
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    // Add scroll effect to header
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down - hide header
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show header
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
    
    // Add smooth transition to header
    header.style.transition = 'transform 0.3s ease-in-out';
}

/**
 * Initialize form validation (ready for future forms)
 */
function initializeFormValidation() {
    // Placeholder for form validation functionality
    // This will be expanded when forms are added to the page
    
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Initialize modal CTA button functionality
 */
function initializeModalCTAButton() {
    console.log('Initializing modal CTA button...'); // Debug log
    const ctaButton = document.getElementById('getQuoteBtn');
    if (ctaButton) {
        console.log('CTA button found, adding click handler...'); // Debug log
        
        // Log existing event listeners (for debugging)
        console.log('Button HTML:', ctaButton.outerHTML);
        console.log('Button onclick:', ctaButton.onclick);
        
        // Add click event listener to open modal
        ctaButton.addEventListener('click', function(e) {
            console.log('CTA button clicked!'); // Debug log
            console.log('Event:', e);
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Open the modal
            openGeneralDetailsModal();
        });
        
        console.log('Event listener added successfully');
    } else {
        console.error('CTA button not found!'); // Debug log
    }
}

/**
 * Initialize the multi-step form
 */
function initializeMultiStepForm() {
    const formContainer = document.getElementById('formContainer');
    
    if (formContainer && !formContainer.hasChildNodes()) {
        // Create form structure
        const formHTML = `
            <form id="insuranceForm" class="multi-step-form">
                <!-- Honeypot Field -->
                <div class="honeypot-field">
                    <input type="text" name="address" id="honeypotAddress" autocomplete="off" tabindex="-1">
                </div>

                <!-- Progress Bar -->
                <div class="form-progress">
                    <div class="progress-steps">
                        <div class="step active" data-step="1">פרטי הנכס</div>
                        <div class="step" data-step="2">פרטים אישיים</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: 50%"></div>
                    </div>
                </div>

                <!-- Step 1: Property Information -->
                <div class="form-step active" data-step="1">
                    <h2>פרטי הנכס</h2>
                    <div class="form-group">
                        <label for="propertyAddress">כתובת הנכס*</label>
                        <input type="text" id="propertyAddress" name="propertyAddress" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">עיר*</label>
                            <input type="text" id="city" name="city" required>
                        </div>
                        <div class="form-group">
                            <label for="neighborhood">שכונה</label>
                            <input type="text" id="neighborhood" name="neighborhood">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="zipCode">מיקוד*</label>
                            <input type="text" id="zipCode" name="zipCode" required>
                        </div>
                        <div class="form-group">
                            <label for="propertyType">סוג הנכס*</label>
                            <select id="propertyType" name="propertyType" required>
                                <option value="">בחר סוג</option>
                                <option value="apartment">דירה</option>
                                <option value="house">בית פרטי</option>
                                <option value="penthouse">פנטהאוז</option>
                                <option value="cottage">קוטג'</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="yearBuilt">שנת בנייה*</label>
                            <input type="number" id="yearBuilt" name="yearBuilt" required>
                        </div>
                        <div class="form-group">
                            <label for="squareMeters">שטח במ"ר*</label>
                            <input type="number" id="squareMeters" name="squareMeters" required>
                        </div>
                    </div>
                    <div class="form-navigation">
                        <button type="button" class="btn-next">השלב הבא</button>
                    </div>
                </div>

                <!-- Step 2: Personal Information -->
                <div class="form-step" data-step="2">
                    <h2>פרטים אישיים</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">שם פרטי*</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">שם משפחה*</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">כתובת אימייל*</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">מספר טלפון*</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="preferredContact">דרך יצירת קשר מועדפת*</label>
                        <select id="preferredContact" name="preferredContact" required>
                            <option value="">בחר אפשרות</option>
                            <option value="email">אימייל</option>
                            <option value="phone">טלפון</option>
                            <option value="text">הודעת טקסט</option>
                        </select>
                    </div>
                    <div class="form-navigation">
                        <button type="button" class="btn-prev">השלב הקודם</button>
                        <button type="submit" class="btn-submit">שלח את הבקשה</button>
                    </div>
                </div>
            </form>
        `;
        
        formContainer.innerHTML = formHTML;
        
        // Add form event listeners
        const form = document.getElementById('insuranceForm');
        form.addEventListener('submit', handleFormSubmit);
        
        // Add input validation listeners
        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', validateField);
        });
    }
}

// Enhanced validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Allow Israeli phone formats: 050-1234567, 05-01234567, 0501234567, +972501234567
    const phoneRegex = /^(\+972|0)([2-9]\d{1,2})[-\s]?\d{3}[-\s]?\d{4}$/;
    return phoneRegex.test(phone);
}

function validateZipCode(zipCode) {
    // Israeli ZIP code format: 5 or 7 digits
    const zipRegex = /^\d{5}(\d{2})?$/;
    return zipRegex.test(zipCode);
}

function validateYearBuilt(year) {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    return year >= minYear && year <= currentYear;
}

function validateSquareFootage(sqft) {
    return sqft > 0 && sqft <= 10000; // Reasonable range for square meters
}

// Enhanced step validation
function validateStep(step) {
    const fields = {
        1: {
            'propertyAddress': { required: true, message: 'אנא הזן את כתובת הנכס' },
            'city': { required: true, message: 'אנא הזן את העיר' },
            'zipCode': { 
                required: true, 
                validate: validateZipCode,
                message: 'אנא הזן מיקוד תקין (5 או 7 ספרות)'
            },
            'propertyType': { required: true, message: 'אנא בחר את סוג הנכס' },
            'yearBuilt': { 
                required: true, 
                validate: validateYearBuilt,
                message: 'אנא הזן שנת בנייה תקינה (1900 עד היום)'
            },
            'squareMeters': { 
                required: true, 
                validate: validateSquareFootage,
                message: 'אנא הזן שטח תקין במ"ר (1-10,000)'
            }
        },
        2: {
            'firstName': { required: true, message: 'אנא הזן את שמך הפרטי' },
            'lastName': { required: true, message: 'אנא הזן את שם המשפחה' },
            'email': { 
                required: true, 
                validate: validateEmail,
                message: 'אנא הזן כתובת אימייל תקינה'
            },
            'phone': { 
                required: true, 
                validate: validatePhone,
                message: 'אנא הזן מספר טלפון ישראלי תקין'
            },
            'preferredContact': { required: true, message: 'אנא בחר דרך יצירת קשר מועדפת' }
        }
    };

    let isValid = true;
    const currentFields = fields[step];

    // Clear previous errors
    clearErrors();

    // Validate each field
    for (const [fieldId, rules] of Object.entries(currentFields)) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();

        if (rules.required && !value) {
            showError(field, rules.message);
            isValid = false;
        } else if (rules.validate && !rules.validate(value)) {
            showError(field, rules.message);
            isValid = false;
        }
    }

    return isValid;
}

// Optimized error handling
function showError(field, message) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearErrors() {
    // Remove all error messages
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    // Remove error classes from inputs
    document.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });
}



// Enhanced form submission with better error handling
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Check honeypot field first
    const honeypotField = document.getElementById('honeypotAddress');
    if (honeypotField.value.trim() !== '') {
        console.log('Potential bot submission detected');
        return;
    }
    
    // Validate the current step before submission
    // if (!validateStep(currentStep)) {
    //     return;
    // }

    // Show loading state
    const submitButton = document.querySelector('.btn-submit');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'שולח...';

    try {
        // Collect form data using memoized function
        const formData = collectFormData();

        // Submit to n8n webhook
        const response = await submitForm(formData);

        // Show success message
        showSuccessMessage();

    } catch (error) {
        console.error('Form submission error:', error);
        let errorMessage = 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.';
        
        if (error.name === 'NetworkError') {
            errorMessage = 'שגיאת רשת. אנא בדוק את חיבור האינטרנט שלך.';
        } else if (error.name === 'TimeoutError') {
            errorMessage = 'הבקשה נכשלה עקב תפוגת זמן. אנא נסה שוב.';
        }
        
        showErrorMessage(errorMessage);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

/**
 * Submit form data to n8n webhook
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} - The response from the webhook
 */
async function submitForm(formData) {
    const webhookUrl = 'https://your-n8n-webhook-url'; // Replace with actual webhook URL

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
    }

    return response.json();
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <div class="success-message">
            <div class="success-icon">✅</div>
            <h2>תודה! בקשתך התקבלה בהצלחה.</h2>
            <p>ניצור איתך קשר בקרוב כדי לדון בצרכי ביטוח הדירה שלך.</p>
            <div class="success-details">
                <p>מה קורה עכשיו?</p>
                <ul>
                    <li>מומחה הביטוח שלנו יבדוק את המידע שלך</li>
                    <li>תקבל הצעת מחיר מותאמת אישית תוך 24 שעות</li>
                    <li>ניצור איתך קשר בדרך המועדפת עליך</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Show error message
 * @param {string} errorMessage - The error message to display
 */
function showErrorMessage(errorMessage) {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <h3>אופס! משהו השתבש</h3>
            <p>${errorMessage}</p>
            <button class="btn-retry" onclick="location.reload()">נסה שוב</button>
        </div>
    `;
}

/**
 * Validate a single form field
 * @param {Event} e - The blur event
 */
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Additional validation based on field type
    switch (field.type) {
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'tel':
            if (!isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
    }
    
    clearFieldError(field);
    return true;
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s-+()]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Navigate to the next step
 * @param {number} currentStep - The current step number
 */
function nextStep(currentStep) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const nextStepElement = document.querySelector(`.form-step[data-step="${currentStep + 1}"]`);
    
    // Validate current step
    const inputs = currentStepElement.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (isValid) {
        // Update progress bar
        updateProgressBar(currentStep + 1);
        
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep + 1) {
                step.classList.add('active');
            }
        });
        
        // Show next step
        currentStepElement.style.display = 'none';
        nextStepElement.style.display = 'block';
        
        // Smooth scroll to top of form
        nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Navigate to the previous step
 * @param {number} currentStep - The current step number
 */
function prevStep(currentStep) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const prevStepElement = document.querySelector(`.form-step[data-step="${currentStep - 1}"]`);
    
    // Update progress bar
    updateProgressBar(currentStep - 1);
    
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === currentStep - 1) {
            step.classList.add('active');
        }
    });
    
    // Show previous step
    currentStepElement.style.display = 'none';
    prevStepElement.style.display = 'block';
    
    // Smooth scroll to top of form
    prevStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Update the progress bar
 * @param {number} step - The current step number
 */
function updateProgressBar(step) {
    const progressBar = document.querySelector('.progress-bar-fill');
    const progress = (step / 2) * 100;
    progressBar.style.width = `${progress}%`;
}

/**
 * Validate form fields
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    // Basic form validation logic
    // This will be expanded based on specific form requirements
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showFieldError(field, 'This field is required');
        } else {
            clearFieldError(field);
        }
    });
    
    return isValid;
}

/**
 * Show error message for a field
 * @param {HTMLElement} field - The form field
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorElement);
    field.style.borderColor = '#e74c3c';
}

/**
 * Clear error message for a field
 * @param {HTMLElement} field - The form field
 */
function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.style.borderColor = '';
}

/**
 * Utility function to debounce function calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for potential module use
window.HomeInsuranceApp = {
    openGeneralDetailsModal,
    collectFormData,
    submitFormData
};

/**
 * Open General Details Modal
 * This function opens the modal dialog for general details input
 */
function openGeneralDetailsModal() {
    console.log('openGeneralDetailsModal called!'); // Debug log
    const modal = document.getElementById('generalDetailsModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Set minimum date to today for start date
        const startDateInput = document.getElementById('startDate');
        if (startDateInput) {
            const today = new Date().toISOString().split('T')[0];
            startDateInput.min = today;
        }
        
        // Initialize conditional field logic
        initializeConditionalFields();
        
        // Initialize product sections
        initializeProductSections();
        
        // Add form input listeners for real-time validation
        addFormInputListeners();
        
        // Add event listeners for closing the modal
        setupModalCloseHandlers();
        
        // Focus on the modal for accessibility
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.focus();
        }
    } else {
        console.error('Modal element not found!');
    }
}

/**
 * Initialize conditional field display logic
 */
function initializeConditionalFields() {
    const productTypeSelect = document.getElementById('productType');
    const coverageTypeSelect = document.getElementById('coverageType');
    const propertyTypeSelect = document.getElementById('propertyType');
    const floorCountSelect = document.getElementById('floorCount');
    
    // Find parent form groups
    const coverageTypeField = coverageTypeSelect ? coverageTypeSelect.closest('.form-group') : null;
    const floorCountField = floorCountSelect ? floorCountSelect.closest('.form-group') : null;
    
    // Product Type change handler
    if (productTypeSelect) {
        productTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (coverageTypeField && coverageTypeSelect) {
                if (selectedValue === 'מבנה בלבד' || selectedValue === 'מבנה בלבד משועבד') {
                    // Hide coverage type field with animation
                    coverageTypeField.classList.add('hidden');
                    // Clear the value when hiding
                    coverageTypeSelect.value = '';
                } else {
                    // Show coverage type field with animation
                    coverageTypeField.classList.remove('hidden');
                }
            }
            
            // Update product sections based on selection
            updateProductSections(selectedValue);
        });
    }
    
    // Property Type change handler
    if (propertyTypeSelect) {
        propertyTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (floorCountField && floorCountSelect) {
                if (selectedValue === 'פרטי') {
                    // Hide floor count field with animation
                    floorCountField.classList.add('hidden');
                    // Clear the value when hiding
                    floorCountSelect.value = '';
                } else {
                    // Show floor count field with animation
                    floorCountField.classList.remove('hidden');
                }
            }
        });
    }
}

/**
 * Update product sections based on product type selection
 * @param {string} productType - The selected product type
 */
function updateProductSections(productType) {
    const sections = {
        'מבנה': document.querySelector('[data-section="מבנה"]'),
        'תכולה': document.querySelector('[data-section="תכולה"]'),
        'פעילות עסקית': document.querySelector('[data-section="פעילות עסקית"]'),
        'צד שלישי': document.querySelector('[data-section="צד שלישי"]'),
        'מעבידים': document.querySelector('[data-section="מעבידים"]'),
        'סייבר למשפחה': document.querySelector('[data-section="סייבר למשפחה"]'),
        'טרור': document.querySelector('[data-section="טרור"]')
    };
    
    // First, enable all sections and remove disabled state
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.remove('disabled');
            section.classList.add('transitioning');
            const checkbox = section.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.disabled = false;
            }
        }
    });
    
    // Apply conditional logic based on product type
    switch(productType) {
        case 'מבנה בלבד':
            // Disable תכולה
            disableSection(sections['תכולה']);
            break;
            
        case 'תכולה בלבד':
            // Disable מבנה
            disableSection(sections['מבנה']);
            break;
            
        case 'מבנה בלבד משועבד':
            // Disable multiple sections
            disableSection(sections['תכולה']);
            disableSection(sections['פעילות עסקית']);
            disableSection(sections['סייבר למשפחה']);
            disableSection(sections['מעבידים']);
            disableSection(sections['טרור']);
            break;
    }
    
    // Remove transitioning class after animation
    setTimeout(() => {
        Object.values(sections).forEach(section => {
            if (section) {
                section.classList.remove('transitioning');
            }
        });
    }, 300);
}

/**
 * Disable a product section
 * @param {HTMLElement} section - The section element to disable
 */
function disableSection(section) {
    if (section) {
        section.classList.add('disabled');
        const checkbox = section.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.disabled = true;
            checkbox.checked = false; // Uncheck if it was checked
        }
    }
}

/**
 * Initialize product sections event handlers
 */
function initializeProductSections() {
    // Add click handlers to section items for better UX
    const sectionItems = document.querySelectorAll('.section-item');
    
    sectionItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        // Handle checkbox change for styling
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
            });
            
            // Set initial state
            if (checkbox.checked) {
                item.classList.add('checked');
            }
        }
        
        // Handle click on the container
        item.addEventListener('click', function(e) {
            // If clicking on the label or the container (not the checkbox itself)
            if (!e.target.matches('input[type="checkbox"]') && !this.classList.contains('disabled')) {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    // Trigger change event
                    checkbox.dispatchEvent(new Event('change'));
                }
            }
        });
    });
    
    // Initialize based on current product type selection
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect && productTypeSelect.value) {
        updateProductSections(productTypeSelect.value);
    }
}

/**
 * Close General Details Modal
 */
function closeGeneralDetailsModal() {
    const modal = document.getElementById('generalDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

/**
 * Setup modal close handlers
 */
function setupModalCloseHandlers() {
    const modal = document.getElementById('generalDetailsModal');
    const closeBtn = modal.querySelector('.close');
    
    // Close button click handler
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeGeneralDetailsModal();
        };
    }
    
    // Click outside modal to close
    window.onclick = function(event) {
        if (event.target === modal) {
            closeGeneralDetailsModal();
        }
    };
    
    // Escape key to close
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeGeneralDetailsModal();
        }
    });
}

/**
 * Submit General Details Form
 */
function submitGeneralDetails() {
    const form = document.getElementById('generalDetailsForm');
    
    if (form) {
        // Clear all previous errors
        clearFormErrors();
        
        // Perform custom validation
        const isValid = validateGeneralDetailsForm();
        
        if (isValid && form.checkValidity()) {
            // Collect all form data into a structured object
            const formData = collectFormData();
            
            // Print the structured data to console
            console.log('📋 Collected Form Data:');
            console.log(JSON.stringify(formData, null, 2));
            console.log('✅ Form is valid and ready for submission');
            
            // For now, just log the data - no submission yet
            // You can uncomment these lines when ready to actually submit:
            // submitFormData(formData);
            // closeGeneralDetailsModal();
            // alert('הפרטים נשלחו בהצלחה!');
        } else {
            // Trigger browser validation for any HTML5 validation issues
            form.reportValidity();
        }
    }
}

/**
 * Collect all form data into a structured object
 * @returns {Object} - Structured form data object
 */
function collectFormData() {
    // Collect basic form fields
    const idNumber = document.getElementById('idNumber').value.trim();
    const startDate = document.getElementById('startDate').value;
    const productType = document.getElementById('productType').value;
    const coverageType = document.getElementById('coverageType').value;
    const propertyType = document.getElementById('propertyType').value;
    const floorCount = document.getElementById('floorCount').value;
    const city = document.getElementById('city').value;
    const street = document.getElementById('street').value.trim();
    const houseNumber = document.getElementById('houseNumber').value;
    const zipCode = document.getElementById('zipCode').value.trim();
    
    // Collect selected product sections
    const selectedProducts = [];
    const sectionCheckboxes = document.querySelectorAll('.section-item input[type="checkbox"]:checked');
    sectionCheckboxes.forEach(checkbox => {
        selectedProducts.push(checkbox.value);
    });
    
    // Create structured data object
    const formData = {
        // Personal Information
        idNumber: idNumber,
        
        // Policy Information
        startDate: startDate,
        productType: productType,
        
        // Coverage Information (only if visible)
        ...(coverageType && !document.querySelector('#coverageType').closest('.form-group').classList.contains('hidden') && {
            coverageType: coverageType
        }),
        
        // Property Information
        assetType: propertyType,
        
        // Floor Information (only if visible)
        ...(floorCount && !document.querySelector('#floorCount').closest('.form-group').classList.contains('hidden') && {
            floorsNumber: parseInt(floorCount, 10)
        }),
        
        // Address Information
        city: city,
        street: street,
        houseNumber: parseInt(houseNumber, 10),
        zipCode: zipCode,
        
        // Selected Insurance Products
        selectedProducts: selectedProducts
    };
    
    // Add metadata
    formData.timestamp = new Date().toISOString();
    formData.formVersion = '1.0';
    
    return formData;
}

/**
 * Submit form data to backend (placeholder for future implementation)
 * @param {Object} formData - The structured form data to submit
 */
function submitFormData(formData) {
    // This function will be implemented in a future step
    console.log('📤 Ready to submit data to backend:', formData);
    // TODO: Implement actual submission logic
}

/**
 * Validate General Details Form
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateGeneralDetailsForm() {
    let isValid = true;
    
    // Validate ID Number
    const idNumber = document.getElementById('idNumber');
    if (idNumber) {
        const idValue = idNumber.value.trim();
        if (!idValue) {
            showFormError(idNumber, 'שדה חובה');
            isValid = false;
        } else if (!/^\d{9}$/.test(idValue)) {
            showFormError(idNumber, 'תעודת זהות חייבת להכיל 9 ספרות בדיוק');
            isValid = false;
        }
    }
    
    // Validate Start Date
    const startDate = document.getElementById('startDate');
    if (startDate) {
        const dateValue = startDate.value;
        if (!dateValue) {
            showFormError(startDate, 'שדה חובה');
            isValid = false;
        } else {
            const selectedDate = new Date(dateValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFormError(startDate, 'לא ניתן לבחור תאריך בעבר');
                isValid = false;
            }
        }
    }
    
    // Validate Product Type
    const productType = document.getElementById('productType');
    if (productType && !productType.value) {
        showFormError(productType, 'שדה חובה');
        isValid = false;
    }
    
    // Validate Coverage Type (only if visible)
    const coverageType = document.getElementById('coverageType');
    const coverageTypeField = coverageType ? coverageType.closest('.form-group') : null;
    if (coverageType && coverageTypeField && !coverageTypeField.classList.contains('hidden')) {
        if (!coverageType.value) {
            showFormError(coverageType, 'שדה חובה');
            isValid = false;
        }
    }
    
    // Validate Property Type
    const propertyType = document.getElementById('propertyType');
    if (propertyType && !propertyType.value) {
        showFormError(propertyType, 'שדה חובה');
        isValid = false;
    }
    
    // Validate Floor Count (only if visible)
    const floorCount = document.getElementById('floorCount');
    const floorCountField = floorCount ? floorCount.closest('.form-group') : null;
    if (floorCount && floorCountField && !floorCountField.classList.contains('hidden')) {
        if (!floorCount.value) {
            showFormError(floorCount, 'שדה חובה');
            isValid = false;
        }
    }
    
    // Validate City
    const city = document.getElementById('city');
    if (city && !city.value) {
        showFormError(city, 'שדה חובה');
        isValid = false;
    }
    
    // Validate Street
    const street = document.getElementById('street');
    if (street && !street.value.trim()) {
        showFormError(street, 'שדה חובה');
        isValid = false;
    }
    
    // Validate House Number
    const houseNumber = document.getElementById('houseNumber');
    if (houseNumber && !houseNumber.value) {
        showFormError(houseNumber, 'שדה חובה');
        isValid = false;
    }
    
    // Validate ZIP Code
    const zipCode = document.getElementById('zipCode');
    if (zipCode) {
        const zipValue = zipCode.value.trim();
        if (!zipValue) {
            showFormError(zipCode, 'שדה חובה');
            isValid = false;
        } else if (!/^\d+$/.test(zipValue)) {
            showFormError(zipCode, 'מיקוד חייב להכיל ספרות בלבד');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Show error message for a form field
 * @param {HTMLElement} field - The form field element
 * @param {string} message - The error message to display
 */
function showFormError(field, message) {
    // Add error class to field
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.textContent = message;
    
    // Insert error message after the field
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        // Remove any existing error message
        const existingError = formGroup.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        formGroup.appendChild(errorElement);
    }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
    // Remove error classes from all fields
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    // Remove all error messages
    const errorMessages = document.querySelectorAll('.form-error-message');
    errorMessages.forEach(message => {
        message.remove();
    });
}

/**
 * Add input event listeners for real-time validation
 */
function addFormInputListeners() {
    // ID Number - allow only digits and limit to 9
    const idNumber = document.getElementById('idNumber');
    if (idNumber) {
        idNumber.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 9 digits
            if (this.value.length > 9) {
                this.value = this.value.slice(0, 9);
            }
            
            // Clear error on valid input
            if (this.value.length === 9) {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    }
    
    // ZIP Code - allow only digits
    const zipCode = document.getElementById('zipCode');
    if (zipCode) {
        zipCode.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
        });
    }
    
    // Clear errors on change for select fields
    const selectFields = document.querySelectorAll('#generalDetailsForm select');
    selectFields.forEach(field => {
        field.addEventListener('change', function() {
            if (this.value) {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
    
    // Clear errors on input for text fields
    const textFields = document.querySelectorAll('#generalDetailsForm input[type="text"], #generalDetailsForm input[type="date"]');
    textFields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.value) {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
}

// Add modal functions to the global app object
window.HomeInsuranceApp.openGeneralDetailsModal = openGeneralDetailsModal;
window.HomeInsuranceApp.closeGeneralDetailsModal = closeGeneralDetailsModal;
window.HomeInsuranceApp.submitGeneralDetails = submitGeneralDetails;
window.HomeInsuranceApp.initializeConditionalFields = initializeConditionalFields;
window.HomeInsuranceApp.validateGeneralDetailsForm = validateGeneralDetailsForm;
window.HomeInsuranceApp.clearFormErrors = clearFormErrors;
window.HomeInsuranceApp.updateProductSections = updateProductSections;
window.HomeInsuranceApp.initializeProductSections = initializeProductSections;
window.HomeInsuranceApp.collectFormData = collectFormData;
window.HomeInsuranceApp.submitFormData = submitFormData;

/**
 * Smooth scroll functionality
 */
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ==========================
// Dynamic City Dropdown + Autocomplete (Cursor AI Task)
// ==========================
// This code adds dynamic loading and autocomplete to the 'city' dropdown ("בחר ישוב")
// It does NOT overwrite any existing code.
//
// Author: Cursor AI
//
// --- Begin Dynamic City Dropdown Code ---

(function() {
    // API details
    const API_URL = 'https://data.gov.il/api/3/action/datastore_search';
    const RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
    const CITY_FIELD = 'שם_ישוב';
    let allCities = [];
    let isLoaded = false;
    let isLoading = false;
    let loadError = false;

    // Elements
    const citySelect = document.getElementById('city');
    if (!citySelect) return;

    // Create a wrapper for custom dropdown/autocomplete
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    citySelect.parentNode.insertBefore(wrapper, citySelect);
    wrapper.appendChild(citySelect);

    // Create input for autocomplete
    const cityInput = document.createElement('input');
    cityInput.type = 'text';
    cityInput.id = 'city-autocomplete';
    cityInput.setAttribute('placeholder', 'בחר ישוב');
    cityInput.setAttribute('autocomplete', 'off');
    cityInput.required = true;
    cityInput.style.width = '100%';
    cityInput.style.boxSizing = 'border-box';
    cityInput.style.marginBottom = '0.5em';
    cityInput.style.fontSize = 'inherit';
    cityInput.style.padding = '12px 16px';
    cityInput.style.borderRadius = 'var(--radius-md, 8px)';
    cityInput.style.border = '1px solid var(--border-color, #ccc)';
    cityInput.style.direction = 'rtl';
    cityInput.style.background = 'var(--primary-white, #fff)';
    cityInput.style.position = 'relative';
    cityInput.style.zIndex = '2';
    // Hide the original select visually but keep it for form submission
    citySelect.style.display = 'none';
    wrapper.insertBefore(cityInput, citySelect);

    // Dropdown for autocomplete results
    const dropdown = document.createElement('div');
    dropdown.className = 'city-autocomplete-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '48px';
    dropdown.style.right = '0';
    dropdown.style.left = '0';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderTop = 'none';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '10';
    dropdown.style.display = 'none';
    dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    dropdown.style.direction = 'rtl';
    wrapper.appendChild(dropdown);

    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#e74c3c';
    errorMsg.style.fontSize = '0.95em';
    errorMsg.style.marginTop = '0.25em';
    errorMsg.style.display = 'none';
    errorMsg.textContent = 'לא ניתן לטעון רשימת ישובים כרגע, נסו שוב מאוחר יותר.';
    wrapper.appendChild(errorMsg);

    // Fetch all cities from API (with paging)
    async function fetchAllCities() {
        isLoading = true;
        let cities = [];
        let start = 0;
        const limit = 1000;
        try {
            while (true) {
                const url = `${API_URL}?resource_id=${RESOURCE_ID}&limit=${limit}&offset=${start}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('API error');
                const data = await res.json();
                if (!data.result || !data.result.records) break;
                const batch = data.result.records.map(r => r[CITY_FIELD]).filter(Boolean);
                cities = cities.concat(batch);
                if (batch.length < limit) break;
                start += limit;
            }
            // Remove duplicates and sort
            cities = Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, 'he'));
            allCities = cities;
            isLoaded = true;
            loadError = false;
        } catch (e) {
            loadError = true;
            errorMsg.style.display = 'block';
        } finally {
            isLoading = false;
        }
    }

    // Show dropdown with filtered cities
    function showDropdown(filtered) {
        dropdown.innerHTML = '';
        if (!filtered.length) {
            dropdown.style.display = 'none';
            return;
        }
        filtered.forEach(city => {
            const option = document.createElement('div');
            option.textContent = city;
            option.style.padding = '10px 16px';
            option.style.cursor = 'pointer';
            option.style.fontSize = '1em';
            option.style.textAlign = 'right';
            option.addEventListener('mousedown', function(e) {
                e.preventDefault();
                cityInput.value = city;
                citySelect.value = city;
                dropdown.style.display = 'none';
                
                // Trigger change event to enable street dropdown
                const changeEvent = new Event('change', { bubbles: true });
                citySelect.dispatchEvent(changeEvent);
            });
            dropdown.appendChild(option);
        });
        dropdown.style.display = 'block';
    }

    // Filter cities by input
    function filterCities(query) {
        if (!allCities.length) return [];
        query = query.trim();
        if (!query) return allCities.slice(0, 50); // Show first 50 if empty
        const norm = s => s.replace(/["'\-\s]/g, '').toLowerCase();
        return allCities.filter(city => norm(city).includes(norm(query))).slice(0, 50);
    }

    // Handle input events
    cityInput.addEventListener('focus', async function() {
        if (!isLoaded && !isLoading && !loadError) {
            errorMsg.style.display = 'none';
            await fetchAllCities();
        }
        if (isLoaded) {
            showDropdown(filterCities(cityInput.value));
        } else if (loadError) {
            errorMsg.style.display = 'block';
        }
    });
    cityInput.addEventListener('input', function() {
        if (isLoaded) {
            showDropdown(filterCities(cityInput.value));
        }
    });
    cityInput.addEventListener('blur', function() {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    // Sync select value on form submit
    cityInput.form && cityInput.form.addEventListener('submit', function() {
        citySelect.value = cityInput.value;
    });

    // If user selects from dropdown, update select
    citySelect.addEventListener('change', function() {
        cityInput.value = citySelect.value;
        
        // Trigger street dropdown logic when city changes
        if (window.handleCityChange) {
            window.handleCityChange();
        }
    });

    // If form is reset, clear input
    cityInput.form && cityInput.form.addEventListener('reset', function() {
        cityInput.value = '';
        citySelect.value = '';
    });

    // If page loads with value, sync
    if (citySelect.value) {
        cityInput.value = citySelect.value;
    }

    // Responsive/mobile: make dropdown font-size inherit
    dropdown.style.fontSize = 'inherit';

    // --- End Dynamic City Dropdown Code ---
})(); 

// ==========================
// Dynamic Street Dropdown + Autocomplete (Cursor AI Task)
// ==========================
// This code adds dynamic loading and autocomplete to the 'street' field ("שם הרחוב")
// It depends on city selection and does NOT overwrite any existing code.
//
// Author: Cursor AI
//
// --- Begin Dynamic Street Dropdown Code ---

(function() {
    // API details for streets
    const STREETS_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
    const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b'; // Fixed Resource ID
    const STREET_NAME_FIELD = 'שם_רחוב';
    const CITY_NAME_FIELD = 'שם_ישוב';
    
    // Cache for streets by city
    const streetsCache = new Map();
    let currentCity = null;
    let isLoadingStreets = false;
    let cityChangeTimeout = null;
    let searchTimeout = null;

    // Elements
    const streetInput = document.getElementById('street');
    const citySelect = document.getElementById('city');
    if (!streetInput || !citySelect) return;

    // Create a wrapper for custom dropdown/autocomplete
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    streetInput.parentNode.insertBefore(wrapper, streetInput);
    wrapper.appendChild(streetInput);

    // Create autocomplete input
    const streetAutocompleteInput = document.createElement('input');
    streetAutocompleteInput.type = 'text';
    streetAutocompleteInput.id = 'street-autocomplete';
    streetAutocompleteInput.setAttribute('placeholder', 'שם הרחוב');
    streetAutocompleteInput.setAttribute('autocomplete', 'off');
    streetAutocompleteInput.required = true;
    streetAutocompleteInput.disabled = true; // Initially disabled
    streetAutocompleteInput.style.width = '100%';
    streetAutocompleteInput.style.boxSizing = 'border-box';
    streetAutocompleteInput.style.marginBottom = '0.5em';
    streetAutocompleteInput.style.fontSize = 'inherit';
    streetAutocompleteInput.style.padding = '12px 16px';
    streetAutocompleteInput.style.borderRadius = 'var(--radius-md, 8px)';
    streetAutocompleteInput.style.border = '1px solid var(--border-color, #ccc)';
    streetAutocompleteInput.style.direction = 'rtl';
    streetAutocompleteInput.style.background = 'var(--primary-white, #fff)';
    streetAutocompleteInput.style.position = 'relative';
    streetAutocompleteInput.style.zIndex = '2';
    streetAutocompleteInput.style.opacity = '0.6'; // Visual indication of disabled state
    
    // Hide the original input visually but keep it for form submission
    streetInput.style.display = 'none';
    wrapper.insertBefore(streetAutocompleteInput, streetInput);

    // Dropdown for autocomplete results
    const dropdown = document.createElement('div');
    dropdown.className = 'street-autocomplete-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '48px';
    dropdown.style.right = '0';
    dropdown.style.left = '0';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderTop = 'none';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '10';
    dropdown.style.display = 'none';
    dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    dropdown.style.direction = 'rtl';
    wrapper.appendChild(dropdown);

    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#e74c3c';
    errorMsg.style.fontSize = '0.95em';
    errorMsg.style.marginTop = '0.25em';
    errorMsg.style.display = 'none';
    errorMsg.textContent = 'לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.';
    wrapper.appendChild(errorMsg);

    // Add CSS for city suggestions
    const style = document.createElement('style');
    style.textContent = `
        .city-suggestion {
            color: #3498db !important;
            text-decoration: underline;
            cursor: pointer;
            font-weight: bold;
        }
        .city-suggestion:hover {
            color: #2980b9 !important;
        }
    `;
    document.head.appendChild(style);

    // Loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.style.color = '#3498db';
    loadingMsg.style.fontSize = '0.95em';
    loadingMsg.style.marginTop = '0.25em';
    loadingMsg.style.display = 'none';
    loadingMsg.textContent = 'טוען רחובות...';
    wrapper.appendChild(loadingMsg);

    // Debounced function to handle city changes
    function debouncedCityChange(cityName) {
        if (cityChangeTimeout) {
            clearTimeout(cityChangeTimeout);
        }
        
        cityChangeTimeout = setTimeout(() => {
            handleCityChangeInternal(cityName);
        }, 500); // Wait 500ms after user stops typing
    }

    // Internal city change handler
    async function handleCityChangeInternal(cityName) {
        console.log('[DEBUG] handleCityChangeInternal called with:', cityName);
        
        if (!cityName || cityName.length < 2) {
            // City name too short, disable street field
            streetAutocompleteInput.disabled = true;
            streetAutocompleteInput.style.opacity = '0.6';
            streetAutocompleteInput.value = '';
            streetInput.value = '';
            dropdown.style.display = 'none';
            errorMsg.style.display = 'none';
            loadingMsg.style.display = 'none';
            currentCity = null;
            return;
        }

        currentCity = cityName;
        
        // Check if we have cached data
        if (streetsCache.has(cityName)) {
            const streets = streetsCache.get(cityName);
            if (streets.length > 0) {
                streetAutocompleteInput.disabled = false;
                streetAutocompleteInput.style.opacity = '1';
                errorMsg.style.display = 'none';
            } else {
                streetAutocompleteInput.disabled = true;
                streetAutocompleteInput.style.opacity = '0.6';
                errorMsg.style.display = 'block';
            }
        } else {
            // Fetch streets for the selected city
            await fetchStreetsForCity(cityName);
        }
    }

    // Fetch streets for a specific city
    async function fetchStreetsForCity(cityName) {
        if (streetsCache.has(cityName)) {
            return streetsCache.get(cityName);
        }

        // Don't fetch if already loading
        if (isLoadingStreets) {
            return [];
        }

        isLoadingStreets = true;
        loadingMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        
        let streets = [];
        
        try {
            // Strategy 1: Try exact match first - most reliable
            console.log('[DEBUG] Fetching streets for city:', cityName);
            streets = await fetchStreetsWithExactMatch(cityName);
            
            // Strategy 2: If no results, try with normalized name
            if (streets.length === 0) {
                console.log('[DEBUG] No results with exact match, trying normalized name');
                const normalizedCityName = normalizeCityName(cityName);
                if (normalizedCityName !== cityName) {
                    streets = await fetchStreetsWithExactMatch(normalizedCityName);
                }
            }
            
            // Strategy 3: If still no results, try with fuzzy matching
            if (streets.length === 0) {
                console.log('[DEBUG] No results with normalized name, trying fuzzy matching');
                const similarCities = await findSimilarCitiesInStreetsAPI(cityName);
                for (const similarCity of similarCities.slice(0, 3)) {
                    console.log(`[DEBUG] Trying similar city: ${similarCity}`);
                    const similarStreets = await fetchStreetsWithExactMatch(similarCity);
                    if (similarStreets.length > 0) {
                        streets = similarStreets;
                        console.log(`[DEBUG] Found ${similarStreets.length} streets using similar city: ${similarCity}`);
                        break;
                    }
                }
            }
            
            // Remove duplicates and sort
            streets = Array.from(new Set(streets)).sort((a, b) => a.localeCompare(b, 'he'));
            streetsCache.set(cityName, streets);
            
            console.log(`[DEBUG] Found ${streets.length} streets for city: ${cityName}`);
            
            if (streets.length === 0) {
                errorMsg.style.display = 'block';
                streetAutocompleteInput.disabled = true;
                streetAutocompleteInput.style.opacity = '0.6';
                errorMsg.textContent = `לא נמצאו רחובות זמינים בעיר "${cityName}", אנא נסה שוב מאוחר יותר.`;
            } else {
                streetAutocompleteInput.disabled = false;
                streetAutocompleteInput.style.opacity = '1';
                errorMsg.style.display = 'none';
            }
            
        } catch (e) {
            console.error('[DEBUG] Error fetching streets:', e);
            errorMsg.style.display = 'block';
            streetAutocompleteInput.disabled = true;
            streetAutocompleteInput.style.opacity = '0.6';
            errorMsg.textContent = 'שגיאה בטעינת רחובות, אנא נסה שוב מאוחר יותר.';
        } finally {
            isLoadingStreets = false;
            loadingMsg.style.display = 'none';
        }
        
        return streets;
    }
    
    // Simplified function to fetch streets with exact match only
    async function fetchStreetsWithExactMatch(cityName) {
        let streets = [];
        let start = 0;
        const limit = 1000;
        
        try {
            while (true) {
                const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&limit=${limit}&offset=${start}&filters={"${CITY_NAME_FIELD}":"${cityName}"}`;
                
                // Try direct fetch first, fallback to proxy if needed
                let res;
                try {
                    res = await fetch(url);
                } catch (e) {
                    // If direct fetch fails, try with proxy
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                    res = await fetch(proxyUrl);
                }
                
                if (!res.ok) {
                    console.warn(`[DEBUG] API request failed with status: ${res.status}`);
                    break;
                }
                
                const data = await res.json();
                if (!data.result || !data.result.records) break;
                
                const batch = data.result.records
                    .filter(r => r[STREET_NAME_FIELD])
                    .map(r => r[STREET_NAME_FIELD]);
                
                streets = streets.concat(batch);
                
                if (batch.length < limit) break;
                start += limit;
                
                // Limit to prevent infinite loops
                if (start > 5000) break;
            }
        } catch (e) {
            console.error('[DEBUG] Error in fetchStreetsWithExactMatch:', e);
        }
        
        return streets;
    }
    
    // Helper function to normalize city names for better matching
    function normalizeCityName(cityName) {
        // Remove common prefixes/suffixes that might differ between APIs
        let normalized = cityName
            .replace(/^עיר\s+/i, '') // Remove "עיר" prefix
            .replace(/^מועצה\s+/i, '') // Remove "מועצה" prefix
            .replace(/\s+עירייה$/i, '') // Remove "עירייה" suffix
            .replace(/\s+מועצה$/i, '') // Remove "מועצה" suffix
            .trim();
        
        // Handle common variations and alternative names
        const variations = {
            'תל אביב': 'תל אביב-יפו',
            'תל אביב-יפו': 'תל אביב',
            'ירושלים': 'ירושלים',
            'חיפה': 'חיפה',
            'באר שבע': 'באר שבע',
            'ראשון לציון': 'ראשון לציון',
            'פתח תקווה': 'פתח תקווה',
            'אשדוד': 'אשדוד',
            'נתניה': 'נתניה',
            'באר שבע': 'באר שבע',
            'רמת גן': 'רמת גן',
            'גבעתיים': 'גבעתיים',
            'רמת השרון': 'רמת השרון',
            'הוד השרון': 'הוד השרון',
            'כפר סבא': 'כפר סבא',
            'רעננה': 'רעננה',
            'הרצליה': 'הרצליה',
            'קריית אונו': 'קריית אונו',
            'יהוד': 'יהוד',
            'אור יהודה': 'אור יהודה',
            'קריית גת': 'קריית גת',
            'אשקלון': 'אשקלון',
            'רחובות': 'רחובות',
            'רמלה': 'רמלה',
            'לוד': 'לוד',
            'מודיעין עילית': 'מודיעין עילית',
            'מודיעין': 'מודיעין',
            'בית שמש': 'בית שמש',
            'ביתר עילית': 'ביתר עילית',
            'קריית מלאכי': 'קריית מלאכי',
            'קריית שמונה': 'קריית שמונה',
            'צפת': 'צפת',
            'טבריה': 'טבריה',
            'עכו': 'עכו',
            'נהריה': 'נהריה',
            'קריית ביאליק': 'קריית ביאליק',
            'קריית מוצקין': 'קריית מוצקין',
            'קריית ים': 'קריית ים',
            'נצרת': 'נצרת',
            'נצרת עילית': 'נצרת עילית',
            'עפולה': 'עפולה',
            'בית שאן': 'בית שאן',
            'אריאל': 'אריאל',
            'רעננה': 'רעננה',
            'כפר יונה': 'כפר יונה',
            'טירה': 'טירה',
            'טירת כרמל': 'טירת כרמל',
            'נשר': 'נשר',
            'אום אל-פחם': 'אום אל-פחם',
            'אום אל-פחם': 'אום אל פחם',
            'אום אל פחם': 'אום אל-פחם',
            'נצרת עילית': 'נוף הגליל',
            'נוף הגליל': 'נצרת עילית',
            // Add more variations for common city name differences
            'כרמל': 'כרמיאל',
            'כרמיאל': 'כרמל',
            'קריית שמונה': 'קריית שמונה',
            'קריית שמונה': 'קריית שמונה',
            'קריית גת': 'קריית גת',
            'קריית גת': 'קריית גת',
            'קריית מלאכי': 'קריית מלאכי',
            'קריית מלאכי': 'קריית מלאכי',
            'קריית ביאליק': 'קריית ביאליק',
            'קריית ביאליק': 'קריית ביאליק',
            'קריית מוצקין': 'קריית מוצקין',
            'קריית מוצקין': 'קריית מוצקין',
            'קריית ים': 'קריית ים',
            'קריית ים': 'קריית ים',
            'קריית אונו': 'קריית אונו',
            'קריית אונו': 'קריית אונו'
        };
        
        return variations[normalized] || normalized;
    }
    
    // Helper function to find similar cities in the streets API using fuzzy matching
    async function findSimilarCitiesInStreetsAPI(cityName) {
        try {
            console.log('[DEBUG] Searching for similar cities to:', cityName);
            
            // Get a sample of cities from the streets API to find similar names
            const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&limit=2000`;
            
            // Try direct fetch first, fallback to proxy if needed
            let res;
            try {
                res = await fetch(url);
            } catch (e) {
                // If direct fetch fails, try with proxy
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                res = await fetch(proxyUrl);
            }
            
            if (!res.ok) {
                console.warn(`[DEBUG] API request failed with status: ${res.status}`);
                return [];
            }
            
            const data = await res.json();
            if (!data.result || !data.result.records) {
                console.log('[DEBUG] No records found in streets API');
                return [];
            }
            
            // Extract unique city names from streets API
            const availableCities = [...new Set(data.result.records
                .filter(r => r[CITY_NAME_FIELD])
                .map(r => r[CITY_NAME_FIELD]))];
            
            console.log(`[DEBUG] Found ${availableCities.length} unique cities in streets API`);
            
            // Find similar cities using multiple matching strategies
            const similarCities = [];
            
            // Strategy 1: Exact substring matching
            const substringMatches = availableCities.filter(availableCity => 
                availableCity.includes(cityName) || cityName.includes(availableCity)
            );
            
            // Strategy 2: Fuzzy matching with similarity threshold
            const fuzzyMatches = availableCities.filter(availableCity => {
                const similarity = calculateStringSimilarity(cityName, availableCity);
                return similarity > 0.6; // 60% similarity threshold
            });
            
            // Strategy 3: Normalized matching
            const normalizedCityName = normalizeCityName(cityName);
            const normalizedMatches = availableCities.filter(availableCity => {
                const normalizedAvailableCity = normalizeCityName(availableCity);
                return normalizedAvailableCity === normalizedCityName || 
                       normalizedAvailableCity.includes(normalizedCityName) || 
                       normalizedCityName.includes(normalizedAvailableCity);
            });
            
            // Combine all matches and remove duplicates
            const allMatches = [...substringMatches, ...fuzzyMatches, ...normalizedMatches];
            const uniqueMatches = [...new Set(allMatches)];
            
            // Sort by relevance (exact matches first, then by similarity)
            const sortedMatches = uniqueMatches.sort((a, b) => {
                const aExact = a === cityName || a.includes(cityName) || cityName.includes(a);
                const bExact = b === cityName || b.includes(cityName) || cityName.includes(b);
                
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                
                const aSimilarity = calculateStringSimilarity(cityName, a);
                const bSimilarity = calculateStringSimilarity(cityName, b);
                return bSimilarity - aSimilarity;
            });
            
            console.log(`[DEBUG] Found ${sortedMatches.length} similar cities:`, sortedMatches.slice(0, 5));
            return sortedMatches;
            
        } catch (e) {
            console.error('[DEBUG] Error finding similar cities:', e);
            return [];
        }
    }
    
    // Helper function to calculate string similarity (Levenshtein distance based)
    function calculateStringSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // Levenshtein distance implementation
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Show dropdown with filtered streets
    function showDropdown(filtered) {
        dropdown.innerHTML = '';
        if (!filtered.length) {
            dropdown.style.display = 'none';
            return;
        }
        filtered.forEach(street => {
            const option = document.createElement('div');
            option.textContent = street;
            option.style.padding = '10px 16px';
            option.style.cursor = 'pointer';
            option.style.fontSize = '1em';
            option.style.textAlign = 'right';
            option.addEventListener('mousedown', function(e) {
                e.preventDefault();
                streetAutocompleteInput.value = street;
                streetInput.value = street;
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(option);
        });
        dropdown.style.display = 'block';
    }

    // Filter streets by input with debouncing
    function filterStreets(query) {
        if (!currentCity || !streetsCache.has(currentCity)) return [];
        const streets = streetsCache.get(currentCity);
        query = query.trim();
        if (!query) return streets.slice(0, 50); // Show first 50 if empty
        const norm = s => s.replace(/["'\-\s]/g, '').toLowerCase();
        return streets.filter(street => norm(street).includes(norm(query))).slice(0, 50);
    }

    // Debounced search function
    function debouncedSearch() {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        searchTimeout = setTimeout(() => {
            if (currentCity && streetsCache.has(currentCity)) {
                showDropdown(filterStreets(streetAutocompleteInput.value));
            }
        }, 300);
    }

    // Handle city selection change
    function handleCityChange() {
        // Get city value from either select or autocomplete input
        const cityAutocompleteInput = document.getElementById('city-autocomplete');
        let selectedCity = citySelect.value || (cityAutocompleteInput ? cityAutocompleteInput.value : '');
        
        console.log('[DEBUG] handleCityChange called. selectedCity=', selectedCity);
        
        // Only proceed if we have a meaningful city name
        if (!selectedCity || selectedCity.length < 2) {
            console.log('[DEBUG] City name too short or empty, skipping');
            return;
        }
        
        // Use debounced function to avoid excessive API calls
        debouncedCityChange(selectedCity);
    }

    // Make handleCityChange available globally
    window.handleCityChange = handleCityChange;

    // Handle street input events
    streetAutocompleteInput.addEventListener('focus', function() {
        if (currentCity && streetsCache.has(currentCity)) {
            showDropdown(filterStreets(streetAutocompleteInput.value));
        }
    });
    
    streetAutocompleteInput.addEventListener('input', function() {
        // Use debounced search to avoid excessive filtering
        debouncedSearch();
    });
    
    streetAutocompleteInput.addEventListener('blur', function() {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    // Listen for city selection changes
    citySelect.addEventListener('change', handleCityChange);
    
    // Also listen for changes from the city autocomplete
    const cityAutocompleteInput = document.getElementById('city-autocomplete');
    if (cityAutocompleteInput) {
        // Add input listener for real-time updates
        cityAutocompleteInput.addEventListener('input', function() {
            // Update city select value when autocomplete changes
            const opt = Array.from(citySelect.options).find(o => o.text === this.value || o.value === this.value);
            if (opt) {
                citySelect.value = opt.value;
            }
            // Only trigger city change if we have a valid value and it matches an option
            if (this.value && this.value.length >= 2 && opt) {
                handleCityChange();
            }
        });
        
        // Add change listener for when user selects from dropdown
        cityAutocompleteInput.addEventListener('change', function() {
            const opt = Array.from(citySelect.options).find(o => o.text === this.value || o.value === this.value);
            if (opt) {
                citySelect.value = opt.value;
                handleCityChange();
            }
        });
    }

    // Sync values on form submit
    streetAutocompleteInput.form && streetAutocompleteInput.form.addEventListener('submit', function() {
        streetInput.value = streetAutocompleteInput.value;
    });

    // If form is reset, clear input
    streetAutocompleteInput.form && streetAutocompleteInput.form.addEventListener('reset', function() {
        streetAutocompleteInput.value = '';
        streetInput.value = '';
        currentCity = null;
        streetAutocompleteInput.disabled = true;
        streetAutocompleteInput.style.opacity = '0.6';
        errorMsg.style.display = 'none';
        loadingMsg.style.display = 'none';
    });

    // If page loads with values, sync
    if (streetInput.value) {
        streetAutocompleteInput.value = streetInput.value;
    }
    
    // Check if there's a city value on page load (from either select or autocomplete)
    let initialCityValue = citySelect.value || (cityAutocompleteInput ? cityAutocompleteInput.value : '');
    
    if (initialCityValue) {
        console.log('[DEBUG] Page loaded with city value:', initialCityValue);
        // Trigger city change handler to enable street field
        handleCityChange();
        
        // If there's also a street value, enable the street field
        if (streetInput.value) {
            streetAutocompleteInput.disabled = false;
            streetAutocompleteInput.style.opacity = '1';
        }
    }

    // Responsive/mobile: make dropdown font-size inherit
    dropdown.style.fontSize = 'inherit';

    // --- End Dynamic Street Dropdown Code ---
})(); 

// --- Cursor AI Patch: Robust city-street sync + debug ---
(function() {
    const citySelect = document.getElementById('city');
    const cityAutocompleteInput = document.getElementById('city-autocomplete');
    if (!citySelect || !cityAutocompleteInput) return;

    // Utility: find <option> in select by text
    function findOptionByText(select, text) {
        return Array.from(select.options).find(opt => opt.text.trim() === text.trim());
    }

    // Utility: add option if not exists
    function ensureOptionExists(select, text) {
        let opt = findOptionByText(select, text);
        if (!opt && text) {
            opt = document.createElement('option');
            opt.value = text;
            opt.text = text;
            select.appendChild(opt);
        }
        return opt;
    }

    // Patch: when user selects from city autocomplete dropdown
    const cityDropdown = document.querySelector('.city-autocomplete-dropdown');
    if (cityDropdown) {
        cityDropdown.addEventListener('mousedown', function(e) {
            if (e.target && e.target.textContent) {
                const selectedCity = e.target.textContent;
                cityAutocompleteInput.value = selectedCity;
                let opt = findOptionByText(citySelect, selectedCity);
                if (!opt) opt = ensureOptionExists(citySelect, selectedCity);
                if (opt) {
                    citySelect.value = opt.value;
                    // Trigger city change after selection
                    setTimeout(() => {
                        if (window.handleCityChange) {
                            window.handleCityChange();
                        }
                    }, 100);
                    console.log('[DEBUG] City selected from autocomplete dropdown:', opt.value);
                }
            }
        });
    }

    // Patch: when user types and the value matches an option, update select
    cityAutocompleteInput.addEventListener('input', function() {
        let opt = findOptionByText(citySelect, cityAutocompleteInput.value);
        if (!opt && cityAutocompleteInput.value) opt = ensureOptionExists(citySelect, cityAutocompleteInput.value);
        if (opt) {
            citySelect.value = opt.value;
            console.log('[DEBUG] City input matches option:', opt.value);
        }
    });

    // Patch: when user selects from the native dropdown
    citySelect.addEventListener('change', function() {
        cityAutocompleteInput.value = citySelect.value;
        console.log('[DEBUG] City selected from native dropdown:', citySelect.value);
    });

    // Also trigger on page load if יש ערך
    if (citySelect.value || cityAutocompleteInput.value) {
        console.log('[DEBUG] Page loaded with city value:', citySelect.value || cityAutocompleteInput.value);
    }
})();
// --- End Cursor AI Patch ---

// --- Cursor AI Patch: Robust street code to use city input if needed ---
(function() {
    // This patch is no longer needed as the main street code handles everything
    // Keeping this as a placeholder for any future enhancements
})();
// --- End Cursor AI Patch --- 