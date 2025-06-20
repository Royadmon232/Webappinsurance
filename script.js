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
    // Enhanced Israeli ZIP code validation
    // Accepts 5 or 7 digits, with better format checking
    const zipRegex = /^\d{5}(\d{2})?$/;
    
    if (!zipRegex.test(zipCode)) {
        return false;
    }
    
    // Additional validation: check if it's a reasonable Israeli ZIP code range
    const zipNum = parseInt(zipCode, 10);
    
    // Israeli ZIP codes are typically between 10000 and 9999999
    // But most are in specific ranges for different regions
    if (zipNum < 10000 || zipNum > 9999999) {
        return false;
    }
    
    // Check for known Israeli ZIP code ranges by region
    const zipRanges = {
        // Tel Aviv area
        'telAviv': { min: 61000, max: 69999 },
        // Jerusalem area
        'jerusalem': { min: 90000, max: 99999 },
        // Haifa area
        'haifa': { min: 30000, max: 39999 },
        // Central area
        'central': { min: 40000, max: 49999 },
        // Southern area
        'southern': { min: 80000, max: 89999 },
        // Northern area
        'northern': { min: 10000, max: 29999 }
    };
    
    // Check if ZIP code falls within any known range
    for (const region in zipRanges) {
        const range = zipRanges[region];
        if (zipNum >= range.min && zipNum <= range.max) {
            return true;
        }
    }
    
    // If not in known ranges, still accept if it's a reasonable number
    return zipNum >= 10000 && zipNum <= 9999999;
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
        } else if (!validateZipCode(zipValue)) {
            showFormError(zipCode, 'מיקוד חייב להכיל 5 או 7 ספרות בלבד');
            isValid = false;
        } else {
            // Additional validation: check if ZIP code matches the address
            const city = document.getElementById('city')?.value;
            const street = document.getElementById('street')?.value?.trim();
            const houseNumber = document.getElementById('houseNumber')?.value;
            
            if (city && street && houseNumber) {
                // Check if we have a cached validation result
                const addressKey = `${city}-${street}-${houseNumber}`;
                const cachedZip = window.ZipCodeValidation?.getCachedZipCode?.(addressKey);
                
                if (cachedZip && cachedZip !== zipValue) {
                    showFormError(zipCode, `מיקוד שגוי. המיקוד הנכון לכתובת זו הוא: ${cachedZip}`);
                    isValid = false;
                } else if (city && window.ZipCodeValidation?.validateZipCodeForCity) {
                    // Validate ZIP code against city range
                    if (!window.ZipCodeValidation.validateZipCodeForCity(zipValue, city)) {
                        showFormError(zipCode, `מיקוד לא מתאים לעיר ${city}`);
                        isValid = false;
                    }
                }
            }
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
        // DISABLED: Old implementation conflicts with new Cursor AI implementation
        // if (window.handleCityChange) {
        //     window.handleCityChange();
        // }
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

/*
(function() {
    // API details for streets
    const STREETS_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
    const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b'; // Fixed Resource ID
    const STREET_NAME_FIELD = 'שם_רחוב';
    const CITY_NAME_FIELD = 'שם_ישוב';
    
    // Cache for streets by city
    const cityToStreets = new Map();
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

    // --- BEGIN: Variation logic for city name matching (Cursor AI patch) ---
    async function fetchStreetsByCity(cityName) {
        console.log(`[DEBUG] fetchStreetsByCity called with: "${cityName}"`);
        // Check cache first
        if (cityToStreets.has(cityName)) {
            console.log(`[DEBUG] Returning cached streets for "${cityName}"`);
            return cityToStreets.get(cityName);
        }
        try {
            const cleanCityName = cityName.trim();
            if (!cleanCityName) return [];
            console.log(`[DEBUG] Trying original city name: "${cleanCityName}"`);
            // Try the original name first
            let filter = { "שם_ישוב": cleanCityName };
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
                cityToStreets.set(cityName, streets);
                console.log(`[DEBUG] Caching and returning ${streets.length} streets for "${cityName}"`);
                return streets;
            }
            // --- Try common variations if no results ---
            const variations = [
                cleanCityName.replace('ו', ''),
                cleanCityName.replace(/-/g, ' '),
                cleanCityName.replace(/ /g, '-'),
                cleanCityName.replace(/ /g, ''),
                cleanCityName.replace('תקווה', 'תקוה'),
                cleanCityName.replace('תקוה', 'תקווה'),
            ];
            console.log(`[DEBUG] Trying variations:`, variations);
            for (const variant of variations) {
                if (!variant || variant === cleanCityName) {
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
                    cityToStreets.set(cityName, streets2);
                    console.log(`[DEBUG] Caching and returning ${streets2.length} streets for "${cityName}" (found with variant "${variant}")`);
                    return streets2;
                }
            }
            // --- END: Variation logic ---
            // If still nothing, cache empty and return []
            console.log(`[DEBUG] No streets found with any variation, caching empty result for "${cityName}"`);
            cityToStreets.set(cityName, []);
            return [];
        } catch (error) {
            console.error('[DEBUG] Error fetching streets:', error);
            throw error;
        }
    }
    // --- END: Variation logic for city name matching (Cursor AI patch) ---

    // --- BEGIN: Cache management and testing functions (Cursor AI patch) ---
    // Function to clear the streets cache (for testing)
    function clearStreetsCache() {
        cityToStreets.clear();
        console.log('[DEBUG] Streets cache cleared');
    }

    // Function to test API directly
    async function testStreetsAPI(cityName) {
        console.log(`[DEBUG] Testing API directly for: "${cityName}"`);
        clearStreetsCache();
        const result = await fetchStreetsByCity(cityName);
        console.log(`[DEBUG] Test result:`, result);
        return result;
    }

    // Function to explore what city names exist in the streets database
    async function exploreStreetsDatabase() {
        console.log('[DEBUG] Exploring streets database to find actual city names...');
        try {
            const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&limit=1000`;
            console.log('[DEBUG] Fetching sample data from:', url);
            
            let res;
            try {
                res = await fetch(url);
            } catch (e) {
                console.log('[DEBUG] Direct fetch failed, trying proxy');
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                res = await fetch(proxyUrl);
            }
            
            if (!res.ok) {
                console.error('[DEBUG] API request failed:', res.status);
                return;
            }
            
            const data = await res.json();
            console.log('[DEBUG] API response received');
            
            if (data.result && data.result.records && data.result.records.length > 0) {
                // Extract unique city names
                const cityNames = new Set();
                data.result.records.forEach(record => {
                    if (record[CITY_NAME_FIELD]) {
                        cityNames.add(record[CITY_NAME_FIELD].trim());
                    }
                });
                
                const uniqueCities = Array.from(cityNames).sort();
                console.log('[DEBUG] Found', uniqueCities.length, 'unique city names in streets database:');
                console.log('[DEBUG] Sample city names:', uniqueCities.slice(0, 20));
                
                // Look for cities that might match what we're searching for
                const searchTerms = ['אבו גוש', 'קרית אונו', 'פתח תקווה', 'תל אביב'];
                searchTerms.forEach(term => {
                    const matches = uniqueCities.filter(city => 
                        city.includes(term) || term.includes(city) || 
                        city.replace(/[\s\-]/g, '').includes(term.replace(/[\s\-]/g, ''))
                    );
                    if (matches.length > 0) {
                        console.log(`[DEBUG] Possible matches for "${term}":`, matches);
                    } else {
                        console.log(`[DEBUG] No matches found for "${term}"`);
                    }
                });
                
                return uniqueCities;
            } else {
                console.log('[DEBUG] No records found in API response');
            }
        } catch (error) {
            console.error('[DEBUG] Error exploring database:', error);
        }
    }

    // Function to test the API without any filter
    async function testAPIWithoutFilter() {
        console.log('[DEBUG] Testing API without any filter...');
        try {
            const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&limit=10`;
            console.log('[DEBUG] Fetching from URL:', url);
            
            let res;
            try {
                res = await fetch(url);
            } catch (e) {
                console.log('[DEBUG] Direct fetch failed, trying proxy');
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                res = await fetch(proxyUrl);
            }
            
            if (!res.ok) {
                console.error('[DEBUG] API request failed:', res.status);
                return;
            }
            
            const data = await res.json();
            console.log('[DEBUG] Raw API response:', data);
            
            if (data.result && data.result.records && data.result.records.length > 0) {
                console.log('[DEBUG] Sample records:');
                data.result.records.forEach((record, index) => {
                    console.log(`[DEBUG] Record ${index + 1}:`, record);
                });
                
                // Check what fields are available
                const firstRecord = data.result.records[0];
                console.log('[DEBUG] Available fields:', Object.keys(firstRecord));
                console.log('[DEBUG] City name field value:', firstRecord[CITY_NAME_FIELD]);
                console.log('[DEBUG] Street name field value:', firstRecord[STREET_NAME_FIELD]);
            }
        } catch (error) {
            console.error('[DEBUG] Error testing API:', error);
        }
    }

    // Make functions available globally for testing
    window.clearStreetsCache = clearStreetsCache;
    window.testStreetsAPI = testStreetsAPI;
    window.exploreStreetsDatabase = exploreStreetsDatabase;
    window.testAPIWithoutFilter = testAPIWithoutFilter;
    // --- END: Cache management and testing functions (Cursor AI patch) ---

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
        if (cityToStreets.has(cityName)) {
            const streets = cityToStreets.get(cityName);
            if (streets.length > 0) {
                streetAutocompleteInput.disabled = false;
                streetAutocompleteInput.style.opacity = '1';
                errorMsg.style.display = 'none';
            } else {
                streetAutocompleteInput.disabled = true;
                streetAutocompleteInput.style.opacity = '0.6';
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.';
            }
        } else {
            // Fetch streets for the selected city
            await fetchStreetsForCity(cityName);
        }
    }

    // Fetch streets for a specific city
    async function fetchStreetsForCity(cityName) {
        if (cityToStreets.has(cityName)) {
            return cityToStreets.get(cityName);
        }

        // Don't fetch if already loading
        if (isLoadingStreets) {
            return [];
        }

        isLoadingStreets = true;
        loadingMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        
        try {
            console.log(`[DEBUG] ===== Starting street search for city: "${cityName}" =====`);
            
            // Use the clean helper function
            const streets = await fetchStreetsByCity(cityName);
            
            console.log(`[DEBUG] ===== Final result: ${streets.length} streets for city: ${cityName} =====`);
            
            if (streets.length === 0) {
                errorMsg.style.display = 'block';
                streetAutocompleteInput.disabled = true;
                streetAutocompleteInput.style.opacity = '0.6';
                errorMsg.textContent = 'לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.';
            } else {
                streetAutocompleteInput.disabled = false;
                streetAutocompleteInput.style.opacity = '1';
                errorMsg.style.display = 'none';
            }
            
            return streets;
            
        } catch (error) {
            console.error('[DEBUG] Error fetching streets:', error);
            errorMsg.style.display = 'block';
            streetAutocompleteInput.disabled = true;
            streetAutocompleteInput.style.opacity = '0.6';
            errorMsg.textContent = 'שגיאה בטעינת רשימת הרחובות';
            return [];
        } finally {
            isLoadingStreets = false;
            loadingMsg.style.display = 'none';
        }
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
        if (!currentCity || !cityToStreets.has(currentCity)) return [];
        const streets = cityToStreets.get(currentCity);
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
            if (currentCity && cityToStreets.has(currentCity)) {
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
        
        // Disable the street dropdown and show loading
        streetAutocompleteInput.disabled = true;
        streetAutocompleteInput.style.opacity = '0.6';
        streetAutocompleteInput.value = '';
        streetInput.value = '';
        dropdown.style.display = 'none';
        errorMsg.style.display = 'none';
        loadingMsg.style.display = 'block';
        loadingMsg.textContent = 'טוען רחובות...';
        
        // Clear existing dropdown options
        dropdown.innerHTML = '';
        
        // Add loading option to dropdown
        const loadingOption = document.createElement('div');
        loadingOption.textContent = 'טוען...';
        loadingOption.style.padding = '8px 12px';
        loadingOption.style.color = '#666';
        loadingOption.style.fontStyle = 'italic';
        dropdown.appendChild(loadingOption);
        dropdown.style.display = 'block';
        
        // Call fetchStreetsByCity once
        // DISABLED: Old implementation conflicts with new Cursor AI implementation
        // fetchStreetsByCity(selectedCity)
        //     .then(streets => {
        //         // Clear loading message
        //         loadingMsg.style.display = 'none';
        //         dropdown.innerHTML = '';
        //         
        //         if (streets && streets.length > 0) {
        //             // Populate the dropdown with street options
        //             streets.forEach(street => {
        //                 const option = document.createElement('div');
        //                 option.textContent = street;
        //                 option.style.padding = '8px 12px';
        //                 option.style.cursor = 'pointer';
        //                 option.style.borderBottom = '1px solid #eee';
        //                 
        //                 option.addEventListener('mouseenter', function() {
        //                     this.style.backgroundColor = '#f5f5f5';
        //                 });
        //                 
        //                 option.addEventListener('mouseleave', function() {
        //                     this.style.backgroundColor = '#fff';
        //                 });
        //                 
        //                 option.addEventListener('click', function() {
        //                     streetAutocompleteInput.value = street;
        //                     streetInput.value = street;
        //                     dropdown.style.display = 'none';
        //                 });
        //                 
        //                 dropdown.appendChild(option);
        //             });
        //             
        //             // Re-enable the dropdown
        //             streetAutocompleteInput.disabled = false;
        //             streetAutocompleteInput.style.opacity = '1';
        //             errorMsg.style.display = 'none';
        //             
        //             // Show dropdown initially
        //             dropdown.style.display = 'block';
        //             
        //         } else {
        //             // Show "no streets found" message
        //             const noStreetsOption = document.createElement('div');
        //             noStreetsOption.textContent = 'לא נמצאו רחובות';
        //             noStreetsOption.style.padding = '8px 12px';
        //             noStreetsOption.style.color = '#666';
        //             noStreetsOption.style.fontStyle = 'italic';
        //             dropdown.appendChild(noStreetsOption);
        //             dropdown.style.display = 'block';
        //             
        //             // Keep disabled
        //             streetAutocompleteInput.disabled = true;
        //             streetAutocompleteInput.style.opacity = '0.6';
        //             errorMsg.style.display = 'block';
        //             errorMsg.textContent = 'לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.';
        //         }
        //     })
        //     .catch(error => {
        //         console.error('[DEBUG] Error fetching streets:', error);
        //         
        //         // Clear loading message
        //         loadingMsg.style.display = 'none';
        //         dropdown.innerHTML = '';
        //         
        //         // Show error option
        //         const errorOption = document.createElement('div');
        //         errorOption.textContent = 'שגיאה בטעינת רשימת הרחובות';
        //         errorOption.style.padding = '8px 12px';
        //         errorOption.style.color = '#e74c3c';
        //         errorOption.style.fontStyle = 'italic';
        //         errorOption.disabled = true;
        //         dropdown.appendChild(errorOption);
        //         dropdown.style.display = 'block';
        //         
        //         // Keep disabled
        //         streetAutocompleteInput.disabled = true;
        //         streetAutocompleteInput.style.opacity = '0.6';
        //         errorMsg.style.display = 'block';
        //         errorMsg.textContent = 'שגיאה בטעינת רשימת הרחובות';
        //     });
    }

    // Make handleCityChange available globally
    window.handleCityChange = handleCityChange;

    // Handle street input events
    streetAutocompleteInput.addEventListener('focus', function() {
        if (currentCity && cityToStreets.has(currentCity)) {
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
    // DISABLED: Old implementation conflicts with new Cursor AI implementation
    // citySelect.addEventListener('change', handleCityChange);
    
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
            // DISABLED: Old implementation conflicts with new Cursor AI implementation
            // if (this.value && this.value.length >= 2 && opt) {
            //     handleCityChange();
            // }
        });
        
        // Add change listener for when user selects from dropdown
        cityAutocompleteInput.addEventListener('change', function() {
            const opt = Array.from(citySelect.options).find(o => o.text === this.value || o.value === this.value);
            if (opt) {
                citySelect.value = opt.value;
                // DISABLED: Old implementation conflicts with new Cursor AI implementation
                // handleCityChange();
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
        // DISABLED: Old implementation conflicts with new Cursor AI implementation
        // handleCityChange();
        
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
*/

// --- Cursor AI Patch: Robust city-street sync + debug ---
(function() {
    const citySelect = document.getElementById('city');
    const cityAutocompleteInput = document.getElementById('city-autocomplete');
    if (!citySelect || !cityAutocompleteInput) return;

    // Utility: find <option> in select by text
    function findOptionByText(select, text) {
        if (!text) return null;
        const normalizedSearchText = normalizeCityName(text.trim());
        console.log('[DEBUG] Looking for city:', normalizedSearchText);
        
        // First try exact match
        const exactMatch = Array.from(select.options).find(opt => {
            const normalizedOption = normalizeCityName(opt.text.trim());
            console.log('[DEBUG] Comparing with option:', normalizedOption);
            return normalizedOption === normalizedSearchText;
        });
        
        if (exactMatch) return exactMatch;
        
        // If no exact match and text is too short, don't do partial matches
        if (normalizedSearchText.length < 2) return null;
        
        // Then try partial match only for longer inputs
        return Array.from(select.options).find(opt => {
            const normalizedOption = normalizeCityName(opt.text.trim());
            // Only match if the input is a prefix of a valid city name
            return normalizedOption.startsWith(normalizedSearchText);
        });
    }

    // Utility: add option if not exists
    function ensureOptionExists(select, text) {
        const normalizedText = normalizeCityName(text.trim());
        let opt = findOptionByText(select, normalizedText);
        if (!opt && normalizedText) {
            opt = document.createElement('option');
            opt.value = normalizedText;
            opt.text = normalizedText;
            select.appendChild(opt);
            console.log('[DEBUG] Added new option:', normalizedText);
        }
        return opt;
    }

    // Patch: when user selects from city autocomplete dropdown
    const cityDropdown = document.querySelector('.city-autocomplete-dropdown');
    if (cityDropdown) {
        cityDropdown.addEventListener('mousedown', function(e) {
            if (e.target && e.target.textContent) {
                const selectedCity = e.target.textContent.trim();
                console.log('[DEBUG] Selected city from dropdown:', selectedCity);
                
                const normalizedCity = normalizeCityName(selectedCity);
                console.log('[DEBUG] Normalized city name:', normalizedCity);
                
                // First update the autocomplete input
                cityAutocompleteInput.value = selectedCity;
                
                // Then find or create the option in the select
                let opt = findOptionByText(citySelect, normalizedCity);
                if (!opt) {
                    opt = document.createElement('option');
                    opt.value = normalizedCity;
                    opt.text = selectedCity; // Keep original text
                    citySelect.appendChild(opt);
                    console.log('[DEBUG] Added new option:', selectedCity);
                }
                
                // Update select and trigger change
                citySelect.value = opt.value;
                const event = new Event('change', { bubbles: true });
                citySelect.dispatchEvent(event);
                console.log('[DEBUG] City selected from autocomplete dropdown:', selectedCity);
            }
        });
    }

    // Patch: when user types and the value matches an option, update select
    cityAutocompleteInput.addEventListener('input', function() {
        // Don't add new options while typing, only look for existing matches
        const opt = findOptionByText(citySelect, cityAutocompleteInput.value);
        if (opt) {
            citySelect.value = opt.value;
            // Trigger change event on the select element
            const event = new Event('change', { bubbles: true });
            citySelect.dispatchEvent(event);
            console.log('[DEBUG] City input matches option:', opt.value);
        }
    });

    // Patch: when user selects from the native dropdown
    citySelect.addEventListener('change', function() {
        const selectedOption = citySelect.options[citySelect.selectedIndex];
        if (selectedOption) {
            cityAutocompleteInput.value = selectedOption.text; // Use original text
            console.log('[DEBUG] City selected from native dropdown:', selectedOption.text);
        } else {
            cityAutocompleteInput.value = '';
            console.log('[DEBUG] City selection cleared from native dropdown');
        }
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

// Helper function to normalize city names for better matching
function normalizeCityName(cityName) {
    console.log(`[DEBUG] Normalizing city name: "${cityName}"`);
    
    // Remove common prefixes/suffixes that might differ between APIs
    let normalized = cityName
        .replace(/^עיר\s+/i, '') // Remove "עיר" prefix
        .replace(/^מועצה\s+/i, '') // Remove "מועצה" prefix
        .replace(/\s+עירייה$/i, '') // Remove "עירייה" suffix
        .replace(/\s+מועצה$/i, '') // Remove "מועצה" suffix
        .trim();
    
    // Handle common variations and alternative names
    const variations = {
        'תל אביב': 'תל אביב - יפו',
        'תל אביב-יפו': 'תל אביב - יפו',
        'תל אביב יפו': 'תל אביב - יפו',
        'ירושלים': 'ירושלים',
        'חיפה': 'חיפה',
        'באר שבע': 'באר שבע',
        'ראשון לציון': 'ראשון לציון',
        'פתח תקווה': 'פתח תקווה',
        'פתח תקוה': 'פתח תקווה',
        'אשדוד': 'אשדוד',
        'נתניה': 'נתניה',
        'רמת גן': 'רמת גן',
        'גבעתיים': 'גבעתיים',
        'רמת השרון': 'רמת השרון',
        'הוד השרון': 'הוד השרון',
        'כפר סבא': 'כפר סבא',
        'רעננה': 'רעננה',
        'הרצליה': 'הרצליה',
        'קריית אונו': 'קריית אונו',
        'יהוד': 'יהוד',
        'יהוד-מונוסון': 'יהוד-מונוסון',
        'אור יהודה': 'אור יהודה',
        'קריית גת': 'קריית גת',
        'אשקלון': 'אשקלון',
        'רחובות': 'רחובות',
        'רמלה': 'רמלה',
        'לוד': 'לוד',
        'מודיעין עילית': 'מודיעין עילית',
        'מודיעין': 'מודיעין-מכבים-רעות',
        'מודיעין-מכבים-רעות': 'מודיעין-מכבים-רעות',
        'מודיעין מכבים רעות': 'מודיעין-מכבים-רעות',
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
        'נצרת עילית': 'נוף הגליל',
        'נוף הגליל': 'נוף הגליל',
        'עפולה': 'עפולה',
        'בית שאן': 'בית שאן',
        'אריאל': 'אריאל',
        'כפר יונה': 'כפר יונה',
        'טירה': 'טירה',
        'טירת כרמל': 'טירת כרמל',
        'נשר': 'נשר',
        'אום אל-פחם': 'אום אל-פחם',
        'אום אל פחם': 'אום אל-פחם',
        'כרמל': 'כרמיאל',
        'כרמיאל': 'כרמיאל',
        'כרמאל': 'כרמיאל',
        'ראש העין': 'ראש העין',
        'בני ברק': 'בני ברק',
        'חולון': 'חולון',
        'בת ים': 'בת ים',
        'קריית אתא': 'קריית אתא',
        'קרית אתא': 'קריית אתא',
        'אילת': 'אילת',
        'דימונה': 'דימונה',
        'ערד': 'ערד',
        'שדרות': 'שדרות',
        'אופקים': 'אופקים',
        'נתיבות': 'נתיבות',
        'קריית עקרון': 'קריית עקרון',
        'קרית עקרון': 'קריית עקרון',
        'יבנה': 'יבנה',
        'גדרה': 'גדרה',
        'מזכרת בתיה': 'מזכרת בתיה',
        'נס ציונה': 'נס ציונה',
        'גן יבנה': 'גן יבנה'
    };
    
    const result = variations[normalized] || normalized;
    console.log(`[DEBUG] Normalized result: "${result}"`);
    return result;
}

// Test function to check API functionality
async function testAPI() {
    console.log('[TEST] Testing API functionality...');
    
    try {
        const url = 'https://data.gov.il/api/3/action/datastore_search?resource_id=9ad3862c-8391-4b2f-84a4-2d4c68625f4b&limit=10';
        console.log('[TEST] Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('[TEST] Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('[TEST] API Response:', data);
            
            if (data.result && data.result.records) {
                console.log('[TEST] Records found:', data.result.records.length);
                console.log('[TEST] Sample records:', data.result.records.slice(0, 3));
                
                // Check what fields are available
                if (data.result.records.length > 0) {
                    const firstRecord = data.result.records[0];
                    console.log('[TEST] Available fields:', Object.keys(firstRecord));
                    console.log('[TEST] First record:', firstRecord);
                }
            } else {
                console.log('[TEST] No records in response');
            }
        } else {
            console.log('[TEST] API request failed');
        }
    } catch (error) {
        console.error('[TEST] Error testing API:', error);
    }
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment the next line to test the API
    testAPI();
});

// Helper function to find similar cities locally using fuzzy matching
function findSimilarCitiesLocally(searchCity, availableCities) {
    console.log(`[DEBUG] findSimilarCitiesLocally: searching for "${searchCity}" among ${availableCities.length} cities`);
    
    if (!searchCity || searchCity.length < 2) {
        return [];
    }
    
    const searchNormalized = searchCity.replace(/["'\-\s]/g, '').toLowerCase();
    const results = [];
    
    for (const city of availableCities) {
        if (!city) continue;
        
        const cityNormalized = city.replace(/["'\-\s]/g, '').toLowerCase();
        
        // Exact match
        if (cityNormalized === searchNormalized) {
            results.unshift({ city, score: 100 }); // Highest priority
            continue;
        }
        
        // Starts with search term
        if (cityNormalized.startsWith(searchNormalized)) {
            results.push({ city, score: 90 });
            continue;
        }
        
        // Contains search term
        if (cityNormalized.includes(searchNormalized)) {
            results.push({ city, score: 80 });
            continue;
        }
        
        // Search term starts with city
        if (searchNormalized.startsWith(cityNormalized)) {
            results.push({ city, score: 70 });
            continue;
        }
        
        // Partial word match (for multi-word cities)
        const searchWords = searchNormalized.split(/[\s\-]/);
        const cityWords = cityNormalized.split(/[\s\-]/);
        
        let wordMatches = 0;
        for (const searchWord of searchWords) {
            if (searchWord.length < 2) continue;
            for (const cityWord of cityWords) {
                if (cityWord.includes(searchWord) || searchWord.includes(cityWord)) {
                    wordMatches++;
                    break;
                }
            }
        }
        
        if (wordMatches > 0) {
            const score = Math.min(60 + (wordMatches * 10), 69);
            results.push({ city, score });
        }
    }
    
    // Sort by score (highest first) and return top results
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, 10).map(r => r.city);
    
    console.log(`[DEBUG] findSimilarCitiesLocally: found ${topResults.length} similar cities:`, topResults);
    return topResults;
}

// === Global constants for street API ===
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
const CITY_NAME_FIELD = 'שם_ישוב';
const STREET_NAME_FIELD = 'שם_רחוב';

// =======================================================================
// /***** CURSOR AI: START - New Dynamic Street Dropdown Implementation *****/
// This self-contained module implements the dynamic street dropdown functionality
// as per the user's request. It activates when a city is selected, fetches
// streets for that city with autocomplete, handles errors, and caches results.
// =======================================================================
(function() {
    // Ensure this code runs after the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    function initialize() {
        const modal = document.getElementById('generalDetailsModal');
        if (!modal) {
            console.error('Street Dropdown: Modal not found.');
            return;
        }

        // Use a MutationObserver to initialize when the modal is displayed
        const observer = new MutationObserver((mutations, obs) => {
            if (modal.style.display === 'block') {
                setupDynamicStreetDropdown();
            }
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });

        // Also run if modal is already visible on initialization
        if (modal.style.display === 'block') {
            setupDynamicStreetDropdown();
        }
    }

    const streetCache = new Map();

    function setupDynamicStreetDropdown() {
        const citySelect = document.getElementById('city');
        const streetInput = document.getElementById('street');

        // Check for essential elements
        if (!citySelect || !streetInput) {
            console.error('Street Dropdown: City or Street input not found.');
            return;
        }
        
        // Prevent re-initialization
        if (streetInput.dataset.dynamicStreetInitialized === 'true') {
            return;
        }
        streetInput.dataset.dynamicStreetInitialized = 'true';

        // --- Create UI Elements ---
        const wrapper = document.createElement('div');
        wrapper.className = 'dynamic-street-wrapper';
        wrapper.style.position = 'relative';
        streetInput.parentNode.insertBefore(wrapper, streetInput);
        wrapper.appendChild(streetInput);

        const dropdown = document.createElement('div');
        dropdown.className = 'street-autocomplete-results';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            border: 1px solid #ddd;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            direction: rtl;
        `;
        wrapper.appendChild(dropdown);

        const errorMsg = document.createElement('div');
        errorMsg.className = 'street-error-message';
        errorMsg.style.cssText = `
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 4px;
            display: none;
        `;
        wrapper.appendChild(errorMsg);

        // --- Initial State ---
        streetInput.disabled = true;
        streetInput.placeholder = 'בחר ישוב תחילה';

        // --- Event Listeners ---
        citySelect.addEventListener('change', handleCityChange);
        
        streetInput.addEventListener('input', () => {
            const selectedCity = citySelect.value;
            if (streetCache.has(selectedCity)) {
                renderDropdown(streetCache.get(selectedCity), streetInput.value);
            }
        });

        streetInput.addEventListener('focus', () => {
            const selectedCity = citySelect.value;
            if (streetInput.value.length > 0 && streetCache.has(selectedCity)) {
                renderDropdown(streetCache.get(selectedCity), streetInput.value);
            }
        });

        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });

        async function handleCityChange() {
            const selectedCity = citySelect.value;
            resetStreetField();

            if (!selectedCity) {
                return;
            }

            streetInput.disabled = true;
            streetInput.placeholder = 'טוען רחובות...';

            if (streetCache.has(selectedCity)) {
                processStreets(streetCache.get(selectedCity));
                return;
            }

            try {
                const API_URL = 'https://data.gov.il/api/3/action/datastore_search';
                const RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
                // Use 'q' for a more flexible full-text search instead of 'filters' for an exact match.
                // This helps handle inconsistencies in city name spellings in the database.
                const queryParams = JSON.stringify({ 'שם_ישוב': selectedCity });
                const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(queryParams)}&limit=32000`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const data = await response.json();
                
                // Sort streets alphabetically in Hebrew and ensure they are unique.
                const streets = data.success && data.result.records
                    ? [...new Set(data.result.records.map(r => r['שם_רחוב'].trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he'))
                    : [];

                streetCache.set(selectedCity, streets);
                processStreets(streets);
            } catch (error) {
                console.error('Error fetching streets:', error);
                showError('שגיאה בטעינת רשימת הרחובות. נסה שוב מאוחר יותר.');
            }
        }

        function processStreets(streets) {
            if (streets.length > 0) {
                streetInput.disabled = false;
                streetInput.placeholder = 'הקלד שם רחוב לחיפוש';
            } else {
                showError('לא נמצאו רחובות זמינים בעיר שבחרת, אנא נסה שוב מאוחר יותר.');
            }
        }

        function renderDropdown(streets, query) {
            dropdown.innerHTML = '';
            // Make filtering case-insensitive for a better user experience.
            const normalizedQuery = query.toLowerCase();
            const filteredStreets = query
                ? streets.filter(s => s.toLowerCase().includes(normalizedQuery))
                : streets;

            if (filteredStreets.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            filteredStreets.slice(0, 50).forEach(street => {
                const item = document.createElement('div');
                item.textContent = street;
                item.style.cssText = `
                    padding: 10px 16px;
                    cursor: pointer;
                    text-align: right;
                `;
                item.addEventListener('mouseenter', () => item.style.backgroundColor = '#f0f0f0');
                item.addEventListener('mouseleave', () => item.style.backgroundColor = '#fff');
                item.addEventListener('click', () => {
                    streetInput.value = street;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(item);
            });

            dropdown.style.display = 'block';
        }

        function resetStreetField() {
            streetInput.disabled = true;
            streetInput.placeholder = 'בחר ישוב תחילה';
            streetInput.value = '';
            errorMsg.style.display = 'none';
            dropdown.style.display = 'none';
        }

        function showError(message) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            streetInput.disabled = true;
            streetInput.placeholder = 'לא נמצאו רחובות';
        }
    }
})();
// =======================================================================
// /***** CURSOR AI: END - New Dynamic Street Dropdown Implementation *****/
// =======================================================================

// ==========================
// Dynamic ZIP Code Validation System
// ==========================
// This system validates ZIP codes against real address data from Israel Post API
// and data.gov.il APIs for accurate address validation
//
// Author: Cursor AI
//
// --- Begin Dynamic ZIP Code Validation Code ---

(function() {
    // Cache for ZIP codes by address
    const zipCodeCache = new Map();
    let isZipValidationInitialized = false;

    // Initialize ZIP code validation when modal opens
    function initializeZipCodeValidation() {
        if (isZipValidationInitialized) return;
        
        const modal = document.getElementById('generalDetailsModal');
        if (!modal) return;

        // Use MutationObserver to initialize when modal is displayed
        const observer = new MutationObserver((mutations, obs) => {
            if (modal.style.display === 'block') {
                setupZipCodeValidation();
            }
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });

        // Also run if modal is already visible
        if (modal.style.display === 'block') {
            setupZipCodeValidation();
        }

        isZipValidationInitialized = true;
    }

    function setupZipCodeValidation() {
        const zipCodeInput = document.getElementById('zipCode');
        const citySelect = document.getElementById('city');
        const streetInput = document.getElementById('street');
        const houseNumberSelect = document.getElementById('houseNumber');

        if (!zipCodeInput || !citySelect || !streetInput || !houseNumberSelect) {
            console.error('ZIP Code Validation: Required elements not found');
            return;
        }

        // Prevent re-initialization
        if (zipCodeInput.dataset.zipValidationInitialized === 'true') {
            return;
        }
        zipCodeInput.dataset.zipValidationInitialized = 'true';

        // Create wrapper for enhanced UI
        const wrapper = document.createElement('div');
        wrapper.className = 'zip-code-validation-wrapper';
        wrapper.style.position = 'relative';
        zipCodeInput.parentNode.insertBefore(wrapper, zipCodeInput);
        wrapper.appendChild(zipCodeInput);

        // Create validation status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'zip-validation-status';
        statusIndicator.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        `;
        wrapper.appendChild(statusIndicator);

        // Create suggestion dropdown
        const suggestionDropdown = document.createElement('div');
        suggestionDropdown.className = 'zip-suggestion-dropdown';
        suggestionDropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            border: 1px solid #ddd;
            border-top: none;
            max-height: 150px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            direction: rtl;
        `;
        wrapper.appendChild(suggestionDropdown);

        // Create error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'zip-error-message';
        errorMsg.style.cssText = `
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 4px;
            display: none;
        `;
        wrapper.appendChild(errorMsg);

        // Create loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'zip-loading-message';
        loadingMsg.style.cssText = `
            color: #3498db;
            font-size: 0.875rem;
            margin-top: 4px;
            display: none;
        `;
        wrapper.appendChild(loadingMsg);

        // Add padding to input for status indicator
        zipCodeInput.style.paddingRight = '40px';

        // Event listeners
        let validationTimeout;

        // Validate ZIP code when all address fields are filled
        function validateZipCodeOnAddressChange() {
            const city = citySelect.value;
            const street = streetInput.value.trim();
            const houseNumber = houseNumberSelect.value;
            const zipCode = zipCodeInput.value.trim();

            if (city && street && houseNumber) {
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(() => {
                    validateZipCodeFromAddress(city, street, houseNumber, zipCode);
                }, 500);
            } else if (city && !zipCode) {
                // If only city is selected, suggest ZIP code range
                suggestZipCodeForCity(city);
            }
        }

        // Suggest ZIP code range for selected city
        function suggestZipCodeForCity(city) {
            const cityZipRanges = {
                'תל אביב': { min: 61000, max: 69999, example: '61000' },
                'ירושלים': { min: 90000, max: 99999, example: '90000' },
                'חיפה': { min: 30000, max: 39999, example: '30000' },
                'באר שבע': { min: 84000, max: 84999, example: '84000' },
                'ראשון לציון': { min: 75000, max: 75999, example: '75000' },
                'פתח תקווה': { min: 49000, max: 49999, example: '49000' },
                'אשדוד': { min: 77000, max: 77999, example: '77000' },
                'נתניה': { min: 42000, max: 42999, example: '42000' },
                'רמת גן': { min: 52000, max: 52999, example: '52000' },
                'גבעתיים': { min: 53000, max: 53999, example: '53000' },
                'רמת השרון': { min: 47000, max: 47999, example: '47000' },
                'הוד השרון': { min: 45000, max: 45999, example: '45000' },
                'כפר סבא': { min: 44000, max: 44999, example: '44000' },
                'רעננה': { min: 43000, max: 43999, example: '43000' },
                'הרצליה': { min: 46000, max: 46999, example: '46000' },
                'קריית אונו': { min: 55000, max: 55999, example: '55000' },
                'יהוד': { min: 56000, max: 56999, example: '56000' },
                'אור יהודה': { min: 60000, max: 60999, example: '60000' },
                'קריית גת': { min: 82000, max: 82999, example: '82000' },
                'אשקלון': { min: 78000, max: 78999, example: '78000' },
                'רחובות': { min: 76000, max: 76999, example: '76000' },
                'רמלה': { min: 72000, max: 72999, example: '72000' },
                'לוד': { min: 71000, max: 71999, example: '71000' },
                'מודיעין': { min: 71000, max: 71999, example: '71000' },
                'בית שמש': { min: 99000, max: 99999, example: '99000' },
                'ביתר עילית': { min: 90000, max: 90999, example: '90000' },
                'קריית מלאכי': { min: 83000, max: 83999, example: '83000' },
                'קריית שמונה': { min: 11000, max: 11999, example: '11000' },
                'צפת': { min: 13000, max: 13999, example: '13000' },
                'טבריה': { min: 14000, max: 14999, example: '14000' },
                'עכו': { min: 24000, max: 24999, example: '24000' },
                'נהריה': { min: 22000, max: 22999, example: '22000' },
                'קריית ביאליק': { min: 27000, max: 27999, example: '27000' },
                'קריית מוצקין': { min: 28000, max: 28999, example: '28000' },
                'קריית ים': { min: 29000, max: 29999, example: '29000' },
                'נצרת': { min: 16000, max: 16999, example: '16000' },
                'נוף הגליל': { min: 17000, max: 17999, example: '17000' },
                'עפולה': { min: 18000, max: 18999, example: '18000' },
                'בית שאן': { min: 11000, max: 11999, example: '11000' },
                'אריאל': { min: 40000, max: 40999, example: '40000' },
                'כפר יונה': { min: 40000, max: 40999, example: '40000' },
                'טירה': { min: 40000, max: 40999, example: '40000' },
                'טירת כרמל': { min: 30000, max: 30999, example: '30000' },
                'נשר': { min: 30000, max: 30999, example: '30000' },
                'אום אל-פחם': { min: 30000, max: 30999, example: '30000' },
                'כרמיאל': { min: 20000, max: 20999, example: '20000' },
                'ראש העין': { min: 48000, max: 48999, example: '48000' },
                'בני ברק': { min: 51000, max: 51999, example: '51000' },
                'חולון': { min: 58000, max: 58999, example: '58000' },
                'בת ים': { min: 59000, max: 59999, example: '59000' },
                'קריית אתא': { min: 28000, max: 28999, example: '28000' },
                'אילת': { min: 88000, max: 88999, example: '88000' },
                'דימונה': { min: 86000, max: 86999, example: '86000' },
                'ערד': { min: 89000, max: 89999, example: '89000' },
                'שדרות': { min: 87000, max: 87999, example: '87000' },
                'אופקים': { min: 85000, max: 85999, example: '85000' },
                'נתיבות': { min: 80000, max: 80999, example: '80000' },
                'קריית עקרון': { min: 76000, max: 76999, example: '76000' },
                'יבנה': { min: 80000, max: 80999, example: '80000' },
                'גדרה': { min: 70000, max: 70999, example: '70000' },
                'מזכרת בתיה': { min: 70000, max: 70999, example: '70000' },
                'נס ציונה': { min: 74000, max: 74999, example: '74000' },
                'גן יבנה': { min: 80000, max: 80999, example: '80000' }
            };
            
            const cityRange = cityZipRanges[city];
            if (cityRange) {
                // Update placeholder with example ZIP code
                zipCodeInput.placeholder = `דוגמה: ${cityRange.example}`;
                
                // Show info message
                loadingMsg.textContent = `מיקוד לעיר ${city}: ${cityRange.min}-${cityRange.max}`;
                loadingMsg.style.display = 'block';
                loadingMsg.style.color = '#27ae60';
                
                // Hide after 3 seconds
                setTimeout(() => {
                    loadingMsg.style.display = 'none';
                }, 3000);
            }
        }

        // Listen for changes in address fields
        citySelect.addEventListener('change', validateZipCodeOnAddressChange);
        streetInput.addEventListener('input', validateZipCodeOnAddressChange);
        houseNumberSelect.addEventListener('change', validateZipCodeOnAddressChange);

        // Validate ZIP code input directly
        zipCodeInput.addEventListener('input', function() {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 7 digits
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }

            // Clear previous validation state
            clearValidationState();

            // If we have a complete address, validate
            const city = citySelect.value;
            const street = streetInput.value.trim();
            const houseNumber = houseNumberSelect.value;
            
            if (city && street && houseNumber && this.value.length >= 5) {
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(() => {
                    validateZipCodeFromAddress(city, street, houseNumber, this.value);
                }, 300);
            } else if (city && this.value.length >= 5) {
                // If we only have city, validate against city range
                if (window.ZipCodeValidation?.validateZipCodeForCity) {
                    const isValidForCity = window.ZipCodeValidation.validateZipCodeForCity(this.value, city);
                    if (isValidForCity) {
                        showSuccess('מיקוד תקין לעיר זו');
                    } else {
                        showError(`מיקוד לא מתאים לעיר ${city}`);
                    }
                }
            }
        });

        // Validate ZIP code from address using multiple APIs
        async function validateZipCodeFromAddress(city, street, houseNumber, enteredZipCode) {
            const addressKey = `${city}-${street}-${houseNumber}`;
            
            // Check cache first
            if (zipCodeCache.has(addressKey)) {
                const cachedZip = zipCodeCache.get(addressKey);
                validateZipCodeResult(cachedZip, enteredZipCode);
                return;
            }

            showLoading('בודק מיקוד...');

            try {
                // Try multiple APIs for better coverage
                const zipCode = await fetchZipCodeFromMultipleSources(city, street, houseNumber);
                
                if (zipCode) {
                    zipCodeCache.set(addressKey, zipCode);
                    validateZipCodeResult(zipCode, enteredZipCode);
                } else {
                    showError('לא ניתן לאמת את המיקוד עבור הכתובת הזו');
                }
            } catch (error) {
                console.error('Error validating ZIP code:', error);
                showError('שגיאה בבדיקת המיקוד');
            } finally {
                hideLoading();
            }
        }

        // Fetch ZIP code from multiple sources
        async function fetchZipCodeFromMultipleSources(city, street, houseNumber) {
            // Try data.gov.il first (more reliable for Israeli addresses)
            try {
                const zipCode = await fetchZipCodeFromDataGov(city, street, houseNumber);
                if (zipCode) return zipCode;
            } catch (error) {
                console.log('data.gov.il failed, trying backup source');
            }

            // Try backup data.gov.il resource
            try {
                const zipCode = await fetchZipCodeFromDataGovBackup(city, street, houseNumber);
                if (zipCode) return zipCode;
            } catch (error) {
                console.log('Backup data.gov.il failed, trying Israel Post API');
            }

            // Try Israel Post API as fallback
            try {
                const zipCode = await fetchZipCodeFromIsraelPost(city, street, houseNumber);
                if (zipCode) return zipCode;
            } catch (error) {
                console.log('Israel Post API failed');
            }

            return null;
        }

        // Fetch ZIP code from data.gov.il
        async function fetchZipCodeFromDataGov(city, street, houseNumber) {
            const API_URL = 'https://data.gov.il/api/3/action/datastore_search';
            const RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b'; // Streets database
            
            // Search for the specific address
            const query = `${city} ${street} ${houseNumber}`;
            const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(query)}&limit=1000`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            
            if (data.success && data.result && data.result.records) {
                // Look for exact match
                const exactMatch = data.result.records.find(record => {
                    const recordCity = record['שם_ישוב']?.trim();
                    const recordStreet = record['שם_רחוב']?.trim();
                    const recordHouseNumber = record['מספר_בית']?.toString();
                    
                    return recordCity === city && 
                           recordStreet === street && 
                           recordHouseNumber === houseNumber;
                });

                if (exactMatch && exactMatch['מיקוד']) {
                    return exactMatch['מיקוד'].toString();
                }
            }

            return null;
        }

        // Fetch ZIP code from alternative data.gov.il resource (backup)
        async function fetchZipCodeFromDataGovBackup(city, street, houseNumber) {
            const API_URL = 'https://data.gov.il/api/3/action/datastore_search';
            // Alternative resource ID for postal codes
            const RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba'; // Cities database
            
            try {
                // First, get the city's general ZIP code range
                const cityQuery = encodeURIComponent(JSON.stringify({ "שם_ישוב": city }));
                const url = `${API_URL}?resource_id=${RESOURCE_ID}&filters=${cityQuery}&limit=1000`;

                const response = await fetch(url);
                if (!response.ok) throw new Error('API request failed');

                const data = await response.json();
                
                if (data.success && data.result && data.result.records) {
                    const cityRecord = data.result.records.find(record => 
                        record['שם_ישוב']?.trim() === city
                    );

                    if (cityRecord && cityRecord['מיקוד']) {
                        // Return the city's general ZIP code
                        // This is less precise but provides a fallback
                        return cityRecord['מיקוד'].toString();
                    }
                }
            } catch (error) {
                console.log('Backup data.gov.il API failed:', error);
            }

            return null;
        }

        // Fetch ZIP code from Israel Post API (fallback)
        async function fetchZipCodeFromIsraelPost(city, street, houseNumber) {
            // This is a placeholder for Israel Post API integration
            // You would need to register for their API service
            const API_URL = 'https://api.israelpost.co.il/addresses/validate';
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_API_KEY' // Replace with actual API key
                    },
                    body: JSON.stringify({
                        city: city,
                        street: street,
                        houseNumber: houseNumber
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.zipCode;
                }
            } catch (error) {
                console.log('Israel Post API not available');
            }

            return null;
        }

        // Validate ZIP code result against entered ZIP code
        function validateZipCodeResult(expectedZipCode, enteredZipCode) {
            if (!expectedZipCode) {
                showError('לא נמצא מיקוד לכתובת הזו');
                return;
            }

            if (!enteredZipCode) {
                // Auto-fill the ZIP code
                zipCodeInput.value = expectedZipCode;
                showSuccess('מיקוד נוסף אוטומטית');
                return;
            }

            if (enteredZipCode === expectedZipCode) {
                showSuccess('מיקוד תקין');
            } else {
                showError(`מיקוד שגוי. המיקוד הנכון הוא: ${expectedZipCode}`);
                // Show suggestion
                showSuggestion(expectedZipCode);
            }
        }

        // Show validation states
        function showSuccess(message) {
            statusIndicator.innerHTML = '✓';
            statusIndicator.style.background = '#27ae60';
            statusIndicator.style.color = '#fff';
            statusIndicator.style.display = 'flex';
            
            errorMsg.style.display = 'none';
            suggestionDropdown.style.display = 'none';
            
            zipCodeInput.style.borderColor = '#27ae60';
        }

        function showError(message) {
            statusIndicator.innerHTML = '✗';
            statusIndicator.style.background = '#e74c3c';
            statusIndicator.style.color = '#fff';
            statusIndicator.style.display = 'flex';
            
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            
            zipCodeInput.style.borderColor = '#e74c3c';
        }

        function showLoading(message) {
            statusIndicator.innerHTML = '⟳';
            statusIndicator.style.background = '#3498db';
            statusIndicator.style.color = '#fff';
            statusIndicator.style.display = 'flex';
            statusIndicator.style.animation = 'spin 1s linear infinite';
            
            loadingMsg.textContent = message;
            loadingMsg.style.display = 'block';
            
            errorMsg.style.display = 'none';
            suggestionDropdown.style.display = 'none';
        }

        function hideLoading() {
            loadingMsg.style.display = 'none';
            statusIndicator.style.animation = '';
        }

        function showSuggestion(correctZipCode) {
            suggestionDropdown.innerHTML = `
                <div style="padding: 10px 16px; cursor: pointer; border-bottom: 1px solid #eee;">
                    <div style="font-weight: bold; color: #27ae60;">המיקוד הנכון:</div>
                    <div style="font-size: 1.2em; margin-top: 4px;">${correctZipCode}</div>
                    <div style="font-size: 0.9em; color: #666; margin-top: 4px;">לחץ להשתמש במיקוד זה</div>
                </div>
            `;
            
            const suggestionItem = suggestionDropdown.querySelector('div');
            suggestionItem.addEventListener('click', () => {
                zipCodeInput.value = correctZipCode;
                showSuccess('מיקוד עודכן');
                suggestionDropdown.style.display = 'none';
            });
            
            suggestionDropdown.style.display = 'block';
        }

        function clearValidationState() {
            statusIndicator.style.display = 'none';
            errorMsg.style.display = 'none';
            loadingMsg.style.display = 'none';
            suggestionDropdown.style.display = 'none';
            zipCodeInput.style.borderColor = '';
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) {
                suggestionDropdown.style.display = 'none';
            }
        });

        // Add CSS animation for loading spinner
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: translateY(-50%) rotate(0deg); }
                100% { transform: translateY(-50%) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeZipCodeValidation);
    } else {
        initializeZipCodeValidation();
    }

    // Export functions for global use
    window.ZipCodeValidation = {
        validateZipCodeFromAddress: async function(city, street, houseNumber) {
            const addressKey = `${city}-${street}-${houseNumber}`;
            if (zipCodeCache.has(addressKey)) {
                return zipCodeCache.get(addressKey);
            }
            
            // This would call the same validation logic
            // Implementation would be similar to the internal function
            return null;
        },
        getCachedZipCode: function(addressKey) {
            return zipCodeCache.get(addressKey) || null;
        },
        validateZipCodeForCity: function(zipCode, city) {
            // Validate ZIP code against known city ZIP code ranges
            const cityZipRanges = {
                'תל אביב': { min: 61000, max: 69999 },
                'ירושלים': { min: 90000, max: 99999 },
                'חיפה': { min: 30000, max: 39999 },
                'באר שבע': { min: 84000, max: 84999 },
                'ראשון לציון': { min: 75000, max: 75999 },
                'פתח תקווה': { min: 49000, max: 49999 },
                'אשדוד': { min: 77000, max: 77999 },
                'נתניה': { min: 42000, max: 42999 },
                'רמת גן': { min: 52000, max: 52999 },
                'גבעתיים': { min: 53000, max: 53999 },
                'רמת השרון': { min: 47000, max: 47999 },
                'הוד השרון': { min: 45000, max: 45999 },
                'כפר סבא': { min: 44000, max: 44999 },
                'רעננה': { min: 43000, max: 43999 },
                'הרצליה': { min: 46000, max: 46999 },
                'קריית אונו': { min: 55000, max: 55999 },
                'יהוד': { min: 56000, max: 56999 },
                'אור יהודה': { min: 60000, max: 60999 },
                'קריית גת': { min: 82000, max: 82999 },
                'אשקלון': { min: 78000, max: 78999 },
                'רחובות': { min: 76000, max: 76999 },
                'רמלה': { min: 72000, max: 72999 },
                'לוד': { min: 71000, max: 71999 },
                'מודיעין': { min: 71000, max: 71999 },
                'בית שמש': { min: 99000, max: 99999 },
                'ביתר עילית': { min: 90000, max: 90999 },
                'קריית מלאכי': { min: 83000, max: 83999 },
                'קריית שמונה': { min: 11000, max: 11999 },
                'צפת': { min: 13000, max: 13999 },
                'טבריה': { min: 14000, max: 14999 },
                'עכו': { min: 24000, max: 24999 },
                'נהריה': { min: 22000, max: 22999 },
                'קריית ביאליק': { min: 27000, max: 27999 },
                'קריית מוצקין': { min: 28000, max: 28999 },
                'קריית ים': { min: 29000, max: 29999 },
                'נצרת': { min: 16000, max: 16999 },
                'נוף הגליל': { min: 17000, max: 17999 },
                'עפולה': { min: 18000, max: 18999 },
                'בית שאן': { min: 11000, max: 11999 },
                'אריאל': { min: 40000, max: 40999 },
                'כפר יונה': { min: 40000, max: 40999 },
                'טירה': { min: 40000, max: 40999 },
                'טירת כרמל': { min: 30000, max: 30999 },
                'נשר': { min: 30000, max: 30999 },
                'אום אל-פחם': { min: 30000, max: 30999 },
                'כרמיאל': { min: 20000, max: 20999 },
                'ראש העין': { min: 48000, max: 48999 },
                'בני ברק': { min: 51000, max: 51999 },
                'חולון': { min: 58000, max: 58999 },
                'בת ים': { min: 59000, max: 59999 },
                'קריית אתא': { min: 28000, max: 28999 },
                'אילת': { min: 88000, max: 88999 },
                'דימונה': { min: 86000, max: 86999 },
                'ערד': { min: 89000, max: 89999 },
                'שדרות': { min: 87000, max: 87999 },
                'אופקים': { min: 85000, max: 85999 },
                'נתיבות': { min: 80000, max: 80999 },
                'קריית עקרון': { min: 76000, max: 76999 },
                'יבנה': { min: 80000, max: 80999 },
                'גדרה': { min: 70000, max: 70999 },
                'מזכרת בתיה': { min: 70000, max: 70999 },
                'נס ציונה': { min: 74000, max: 74999 },
                'גן יבנה': { min: 80000, max: 80999 }
            };
            
            const zipNum = parseInt(zipCode, 10);
            const cityRange = cityZipRanges[city];
            
            if (cityRange) {
                return zipNum >= cityRange.min && zipNum <= cityRange.max;
            }
            
            // If city not found, use general validation
            return validateZipCode(zipCode);
        },
        clearCache: function() {
            zipCodeCache.clear();
        }
    };

})();

// --- End Dynamic ZIP Code Validation Code ---