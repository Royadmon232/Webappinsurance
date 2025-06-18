// Home Insurance Landing Page JavaScript
// Initialized and ready for development

document.addEventListener('DOMContentLoaded', function() {
    console.log('Home Insurance Landing Page loaded successfully!');
    
    // Initialize page functionality
    initializePage();
});

/**
 * Initialize page functionality
 */
function initializePage() {
    // Add smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Add responsive navigation handling
    initializeNavigation();
    
    // Add form validation (ready for future forms)
    initializeFormValidation();
    
    // Initialize CTA button functionality
    initializeCTAButton();
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
 * Initialize CTA Button functionality
 */
function initializeCTAButton() {
    const ctaButton = document.getElementById('getQuoteBtn');
    const formContainer = document.getElementById('formContainer');
    
    if (ctaButton && formContainer) {
        ctaButton.addEventListener('click', function() {
            // Smooth scroll to form container
            formContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Initialize the multi-step form
            initializeMultiStepForm();
        });
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

// Memoized form data collection
const collectFormData = (() => {
    let cachedData = null;
    let lastUpdate = 0;
    const CACHE_DURATION = 1000; // 1 second cache

    return () => {
        const now = Date.now();
        if (cachedData && (now - lastUpdate) < CACHE_DURATION) {
            return cachedData;
        }

        cachedData = {
            property: {
                address: document.getElementById('propertyAddress').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value,
                propertyType: document.getElementById('propertyType').value,
                yearBuilt: document.getElementById('yearBuilt').value,
                squareFootage: document.getElementById('squareMeters').value
            },
            personal: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                preferredContact: document.getElementById('preferredContact').value
            },
            metadata: {
                submissionDate: new Date().toISOString(),
                userAgent: navigator.userAgent,
                source: 'home-insurance-landing'
            }
        };

        lastUpdate = now;
        return cachedData;
    };
})();

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
    if (!validateStep(currentStep)) {
        return;
    }

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
 * @param {string} message - The error message
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
    initializePage,
    initializeCTAButton,
    initializeMultiStepForm,
    validateForm,
    showFieldError,
    clearFieldError,
    debounce
}; 