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

})();

// --- Cursor AI Patch: Smart city matching for streets ---
// This patch ensures proper synchronization between city selection and street dropdown
// It also adds comprehensive debugging and error handling

(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCityStreetSync);
    } else {
        initCityStreetSync();
    }

    function initCityStreetSync() {
        const citySelect = document.getElementById('city');
        const cityAutocompleteInput = document.getElementById('city-autocomplete');
        
        if (!citySelect || !cityAutocompleteInput) {
            console.log('[DEBUG] City elements not found, skipping sync');
            return;
        }

        // Helper function to find option by text
        function findOptionByText(select, text) {
            return Array.from(select.options).find(o => 
                o.text === text || o.value === text || 
                o.text.includes(text) || text.includes(o.text)
            );
        }

        // Helper function to ensure option exists
        function ensureOptionExists(select, text) {
            let opt = findOptionByText(select, text);
            if (!opt && text) {
                opt = new Option(text, text);
                select.add(opt);
            }
            return opt;
        }

        // Sync city autocomplete with city select
        cityAutocompleteInput.addEventListener('input', function() {
            const selectedCity = this.value.trim();
            console.log('[DEBUG] City input matches option:', selectedCity);
            
            if (selectedCity && selectedCity.length >= 2) {
                let opt = findOptionByText(citySelect, selectedCity);
                if (!opt) opt = ensureOptionExists(citySelect, selectedCity);
                if (opt) {
                    citySelect.value = opt.value;
                    console.log('[DEBUG] City selected from autocomplete dropdown:', selectedCity);
                    
                    // Trigger city change after a short delay to allow autocomplete to settle
                    setTimeout(() => {
                        if (window.handleCityChange) {
                            window.handleCityChange();
                        }
                    }, 100);
                }
            }
        });

        // Sync city select with city autocomplete
        citySelect.addEventListener('change', function() {
            cityAutocompleteInput.value = citySelect.value;
            console.log('[DEBUG] City selected from native dropdown:', citySelect.value);
            
            // Trigger city change
            if (window.handleCityChange) {
                window.handleCityChange();
            }
        });

        // Handle initial values
        if (citySelect.value || cityAutocompleteInput.value) {
            console.log('[DEBUG] Page loaded with city value:', citySelect.value || cityAutocompleteInput.value);
            // Sync values
            if (citySelect.value) {
                cityAutocompleteInput.value = citySelect.value;
            } else if (cityAutocompleteInput.value) {
                let opt = findOptionByText(citySelect, cityAutocompleteInput.value);
                if (!opt) opt = ensureOptionExists(citySelect, cityAutocompleteInput.value);
                if (opt) citySelect.value = opt.value;
            }
            
            // Trigger city change if we have a valid value
            if (citySelect.value && citySelect.value.length >= 2) {
                setTimeout(() => {
                    if (window.handleCityChange) {
                        window.handleCityChange();
                    }
                }, 500);
            }
        }
    }
})();

// === Global constants for street API ===
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
const CITY_NAME_FIELD = 'שם_ישוב';
const STREET_NAME_FIELD = 'שם_רחוב';

// --- BEGIN: Smart city matching for streets (Cursor AI patch) ---
// Cache for all unique city names in the streets DB
let allStreetCities = null;
let allStreetCitiesLoaded = false;
let allStreetCitiesLoading = false;
let allStreetCitiesLoadPromise = null;

// Fetch all unique city names from the streets API (once)
async function fetchAllStreetCities() {
    if (allStreetCitiesLoaded) return allStreetCities;
    if (allStreetCitiesLoading && allStreetCitiesLoadPromise) return allStreetCitiesLoadPromise;
    allStreetCitiesLoading = true;
    allStreetCitiesLoadPromise = new Promise(async (resolve, reject) => {
        try {
            let offset = 0;
            let limit = 1000;
            let uniqueCities = new Set();
            let more = true;
            while (more) {
                const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&limit=${limit}&offset=${offset}`;
                let res;
                try {
                    res = await fetch(url);
                } catch (e) {
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                    res = await fetch(proxyUrl);
                }
                if (!res.ok) break;
                const data = await res.json();
                if (data.result && data.result.records && data.result.records.length > 0) {
                    data.result.records.forEach(record => {
                        if (record[CITY_NAME_FIELD]) {
                            uniqueCities.add(record[CITY_NAME_FIELD].trim());
                        }
                    });
                    offset += data.result.records.length;
                    more = data.result.records.length === limit;
                } else {
                    more = false;
                }
            }
            allStreetCities = Array.from(uniqueCities);
            allStreetCitiesLoaded = true;
            allStreetCitiesLoading = false;
            resolve(allStreetCities);
        } catch (err) {
            allStreetCitiesLoaded = false;
            allStreetCitiesLoading = false;
            reject(err);
        }
    });
    return allStreetCitiesLoadPromise;
}

// Fuzzy match: find the best matching city name from the streets DB
function fuzzyFindCityName(selectedCity) {
    if (!allStreetCities || !selectedCity) return null;
    const norm = s => s.replace(/["'\-\s]/g, '').toLowerCase();
    const selectedNorm = norm(selectedCity);
    
    // First try exact match with trailing space (as stored in database)
    let found = allStreetCities.find(city => city.trim() === selectedCity.trim());
    if (found) return found;
    
    // Try normalized exact match
    found = allStreetCities.find(city => norm(city) === selectedNorm);
    if (found) return found;
    
    // Starts with
    found = allStreetCities.find(city => norm(city).startsWith(selectedNorm));
    if (found) return found;
    
    // Contains
    found = allStreetCities.find(city => norm(city).includes(selectedNorm));
    if (found) return found;
    
    // Fuzzy: city contains selected
    found = allStreetCities.find(city => selectedNorm.includes(norm(city)));
    if (found) return found;
    
    // Partial word match
    const selectedWords = selectedNorm.split(/\s|-/);
    for (const city of allStreetCities) {
        const cityNorm = norm(city);
        let matches = 0;
        for (const word of selectedWords) {
            if (word.length > 1 && cityNorm.includes(word)) matches++;
        }
        if (matches > 0) return city;
    }
    return null;
}

// Enhanced fetchStreetsByCity function with smart city matching
async function fetchStreetsByCity(cityName) {
    console.log(`[DEBUG] fetchStreetsByCity called with: "${cityName}"`);
    
    // Check cache first
    if (window.cityToStreets && window.cityToStreets.has(cityName)) {
        console.log(`[DEBUG] Returning cached streets for "${cityName}"`);
        return window.cityToStreets.get(cityName);
    }
    
    try {
        const cleanCityName = cityName.trim();
        if (!cleanCityName) return [];
        
        console.log(`[DEBUG] Trying original city name: "${cleanCityName}"`);
        
        // Try the original name first (with trailing space as in database)
        let filter = { "שם_ישוב": cleanCityName + " " };
        let filterStr = encodeURIComponent(JSON.stringify(filter));
        let url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&filters=${filterStr}`;
        console.log(`[DEBUG] API URL for original: ${url}`);
        
        let res;
        try {
            res = await fetch(url);
        } catch (e) {
            console.log('[DEBUG] Direct fetch failed, trying proxy');
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            res = await fetch(proxyUrl);
        }
        
        let data = res.ok ? await res.json() : null;
        let streets = [];
        
        if (data && data.result && data.result.records && data.result.records.length > 0) {
            streets = data.result.records
                .filter(r => r[STREET_NAME_FIELD] && r[STREET_NAME_FIELD].trim())
                .map(r => r[STREET_NAME_FIELD].trim());
            console.log(`[DEBUG] Found ${streets.length} streets with original name`);
        } else {
            console.log(`[DEBUG] No streets found with original name, trying variations...`);
        }
        
        // If found, cache and return
        if (streets.length > 0) {
            streets = Array.from(new Set(streets)).sort((a, b) => a.localeCompare(b, 'he'));
            if (window.cityToStreets) {
                window.cityToStreets.set(cityName, streets);
            }
            console.log(`[DEBUG] Caching and returning ${streets.length} streets for "${cityName}"`);
            return streets;
        }
        
        // Try common variations if no results (all with trailing space)
        const variations = [
            cleanCityName.replace('ו', '') + " ",
            cleanCityName.replace(/-/g, ' ') + " ",
            cleanCityName.replace(/ /g, '-') + " ",
            cleanCityName.replace(/ /g, '') + " ",
            cleanCityName.replace('תקווה', 'תקוה') + " ",
            cleanCityName.replace('תקוה', 'תקווה') + " ",
            cleanCityName.replace('קרית', 'קריית') + " ",
            cleanCityName.replace('קריית', 'קרית') + " ",
            cleanCityName + " (עיר) ",
            cleanCityName + " (מועצה) ",
            // Also try without trailing space
            cleanCityName,
            cleanCityName.replace('ו', ''),
            cleanCityName.replace(/-/g, ' '),
            cleanCityName.replace(/ /g, '-'),
            cleanCityName.replace(/ /g, ''),
            cleanCityName.replace('תקווה', 'תקוה'),
            cleanCityName.replace('תקוה', 'תקווה'),
            cleanCityName.replace('קרית', 'קריית'),
            cleanCityName.replace('קריית', 'קרית'),
            cleanCityName + " (עיר)",
            cleanCityName + " (מועצה)",
        ];
        
        console.log(`[DEBUG] Trying variations:`, variations);
        
        for (const variant of variations) {
            if (!variant || variant === cleanCityName + " ") {
                console.log(`[DEBUG] Skipping variant "${variant}" (empty or same as original)`);
                continue;
            }
            
            console.log(`[DEBUG] Trying variant: "${variant}"`);
            filter = { "שם_ישוב": variant };
            filterStr = encodeURIComponent(JSON.stringify(filter));
            url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&filters=${filterStr}`;
            console.log(`[DEBUG] API URL for variant "${variant}": ${url}`);
            
            let res2;
            try {
                res2 = await fetch(url);
            } catch (e) {
                console.log(`[DEBUG] Direct fetch failed for variant "${variant}", trying proxy`);
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                res2 = await fetch(proxyUrl);
            }
            
            let data2 = res2.ok ? await res2.json() : null;
            let streets2 = [];
            
            if (data2 && data2.result && data2.result.records && data2.result.records.length > 0) {
                streets2 = data2.result.records
                    .filter(r => r[STREET_NAME_FIELD] && r[STREET_NAME_FIELD].trim())
                    .map(r => r[STREET_NAME_FIELD].trim());
                console.log(`[DEBUG] Found ${streets2.length} streets with variant "${variant}"`);
            } else {
                console.log(`[DEBUG] No streets found with variant "${variant}"`);
            }
            
            if (streets2.length > 0) {
                streets2 = Array.from(new Set(streets2)).sort((a, b) => a.localeCompare(b, 'he'));
                if (window.cityToStreets) {
                    window.cityToStreets.set(cityName, streets2);
                }
                console.log(`[DEBUG] Caching and returning ${streets2.length} streets for "${cityName}" (found with variant "${variant}")`);
                return streets2;
            }
        }
        
        // If still nothing, cache empty and return []
        console.log(`[DEBUG] No streets found with any variation, caching empty result for "${cityName}"`);
        if (window.cityToStreets) {
            window.cityToStreets.set(cityName, []);
        }
        return [];
        
    } catch (error) {
        console.error('[DEBUG] Error fetching streets:', error);
        throw error;
    }
}

// Smart city matching handleCityChange function
async function handleCityChange() {
    // Get city value from either select or autocomplete input
    const citySelect = document.getElementById('city');
    const cityAutocompleteInput = document.getElementById('city-autocomplete');
    const streetAutocompleteInput = document.getElementById('street-autocomplete');
    const streetInput = document.getElementById('street');
    const dropdown = document.querySelector('.street-autocomplete-dropdown');
    const errorMsg = document.querySelector('[data-error="street"]') || document.createElement('div');
    const loadingMsg = document.querySelector('[data-loading="street"]') || document.createElement('div');
    
    let selectedCity = citySelect.value || (cityAutocompleteInput ? cityAutocompleteInput.value : '');
    selectedCity = selectedCity.trim();
    
    console.log('[DEBUG] [SmartMatch] handleCityChange called. selectedCity=', selectedCity);
    
    if (!selectedCity || selectedCity.length < 2) {
        console.log('[DEBUG] [SmartMatch] City name too short or empty, skipping');
        return;
    }
    
    // Prevent multiple rapid calls during autocomplete typing
    if (handleCityChange.debounceTimer) {
        clearTimeout(handleCityChange.debounceTimer);
    }
    
    handleCityChange.debounceTimer = setTimeout(async () => {
        try {
            // Load all street cities if not loaded
            await fetchAllStreetCities();
            
            // Find best match
            const matchedCity = fuzzyFindCityName(selectedCity);
            if (!matchedCity) {
                console.log('[DEBUG] [SmartMatch] No matching city found in streets DB for:', selectedCity);
                if (streetAutocompleteInput) {
                    streetAutocompleteInput.disabled = true;
                    streetAutocompleteInput.style.opacity = '0.6';
                    streetAutocompleteInput.value = '';
                }
                if (streetInput) streetInput.value = '';
                if (dropdown) dropdown.style.display = 'none';
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = 'לא נמצאו רחובות ליישוב שבחרת';
                }
                if (loadingMsg) loadingMsg.style.display = 'none';
                return;
            }
            
            console.log('[DEBUG] [SmartMatch] Matched city in streets DB:', matchedCity);
            
            // Show loading state
            if (loadingMsg) {
                loadingMsg.style.display = 'block';
                loadingMsg.textContent = 'טוען רחובות...';
            }
            if (errorMsg) errorMsg.style.display = 'none';
            if (dropdown) dropdown.style.display = 'none';
            
            // Call fetchStreetsByCity with the matched city name
            const streets = await fetchStreetsByCity(matchedCity);
            
            if (loadingMsg) loadingMsg.style.display = 'none';
            if (dropdown) dropdown.innerHTML = '';
            
            if (streets && streets.length > 0) {
                streets.forEach(street => {
                    const option = document.createElement('div');
                    option.textContent = street;
                    option.style.padding = '8px 12px';
                    option.style.cursor = 'pointer';
                    option.style.borderBottom = '1px solid #eee';
                    option.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#f5f5f5';
                    });
                    option.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '#fff';
                    });
                    option.addEventListener('click', function() {
                        if (streetAutocompleteInput) streetAutocompleteInput.value = street;
                        if (streetInput) streetInput.value = street;
                        if (dropdown) dropdown.style.display = 'none';
                    });
                    if (dropdown) dropdown.appendChild(option);
                });
                
                if (streetAutocompleteInput) {
                    streetAutocompleteInput.disabled = false;
                    streetAutocompleteInput.style.opacity = '1';
                }
                if (errorMsg) errorMsg.style.display = 'none';
                if (dropdown) dropdown.style.display = 'block';
            } else {
                const noStreetsOption = document.createElement('div');
                noStreetsOption.textContent = 'לא נמצאו רחובות';
                noStreetsOption.style.padding = '8px 12px';
                noStreetsOption.style.color = '#666';
                noStreetsOption.style.fontStyle = 'italic';
                if (dropdown) {
                    dropdown.appendChild(noStreetsOption);
                    dropdown.style.display = 'block';
                }
                
                if (streetAutocompleteInput) {
                    streetAutocompleteInput.disabled = true;
                    streetAutocompleteInput.style.opacity = '0.6';
                }
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = 'לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.';
                }
            }
        } catch (error) {
            console.error('[DEBUG] [SmartMatch] Error fetching streets:', error);
            if (loadingMsg) loadingMsg.style.display = 'none';
            if (dropdown) dropdown.innerHTML = '';
            
            const errorOption = document.createElement('div');
            errorOption.textContent = 'שגיאה בטעינת רשימת הרחובות';
            errorOption.style.padding = '8px 12px';
            errorOption.style.color = '#e74c3c';
            errorOption.style.fontStyle = 'italic';
            errorOption.disabled = true;
            if (dropdown) {
                dropdown.appendChild(errorOption);
                dropdown.style.display = 'block';
            }
            
            if (streetAutocompleteInput) {
                streetAutocompleteInput.disabled = true;
                streetAutocompleteInput.style.opacity = '0.6';
            }
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'שגיאה בטעינת רשימת הרחובות';
            }
        }
    }, 300); // 300ms debounce to prevent rapid calls during typing
}

// Make functions available globally
window.handleCityChange = handleCityChange;
window.fetchStreetsByCity = fetchStreetsByCity;
window.fetchAllStreetCities = fetchAllStreetCities;
window.fuzzyFindCityName = fuzzyFindCityName;
// --- END: Smart city matching for streets (Cursor AI patch) ---
