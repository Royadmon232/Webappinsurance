// =============================================================================
// GLOBAL ERROR HANDLERS - Enhanced Error Management  
// =============================================================================
// These handlers catch uncaught promises and JavaScript errors to prevent
// console errors and provide graceful degradation

// Handle uncaught promise rejections (main source of fetch errors)
window.addEventListener('unhandledrejection', function(event) {
    console.warn('🔥 Uncaught Promise Rejection:', event.reason);
    
    // Check if this is a fetch error
    if (event.reason && event.reason.name === 'TypeError' && 
        event.reason.message.includes('fetch')) {
        console.warn('🌐 Network fetch error handled globally');
        
        // Show user-friendly notification only for critical operations
                        if (event.reason.message.includes('/api/send-email') || 
            event.reason.message.includes('/api/send-verification')) {
            if (typeof showNotification === 'function') {
                showNotification('warning', 
                    '⚠️ בעיית תקשורת זמנית<br>אנא בדוק את החיבור לאינטרנט ונסה שוב'
                );
            }
        }
        
        // Prevent the default unhandled rejection behavior
        event.preventDefault();
        return;
    }
    
    // Handle Service Worker related errors
    if (event.reason && event.reason.message && 
        event.reason.message.includes('ServiceWorker')) {
        console.warn('🔧 Service Worker error handled globally');
        event.preventDefault();
        return;
    }
    
    // For other types of promise rejections, just log them
    console.warn('⚠️ Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Handle JavaScript runtime errors
window.addEventListener('error', function(event) {
    console.warn('❌ JavaScript Error:', event.error);
    
    // Check if this is a Service Worker error
    if (event.filename && event.filename.includes('sw.js')) {
        console.warn('🔧 Service Worker script error handled globally');
        return;
    }
    
    // For critical errors in main application
    if (event.error && event.error.name === 'ReferenceError') {
        console.error('🚨 Critical JavaScript error:', event.error.message);
    }
});

// =============================================================================
// END GLOBAL ERROR HANDLERS
// =============================================================================

// Home Insurance Landing Page JavaScript
// Initialized and ready for development

// Wizard state
let currentWizardStep = 0;
let wizardSteps = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Home Insurance Landing Page loaded successfully! - Version 20250620-2 (Static site mode)');
    
    // Initialize page functionality
    initializePage();
    
    // Initialize statistics counter animation
    initializeStatsCounter();
    
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
            addBuildingFormListeners();
            initializeContentsFields();
            addContentsFormListeners();
            initializeBankDropdowns();
            
            // Initialize numeric inputs with mobile keyboard support
            initializeNumericInputs();
            
            // Initialize building fields based on current product type
            const productType = document.getElementById('productType');
            const propertyType = document.getElementById('propertyType');
            if (productType && productType.value) {
                updateBuildingFields(productType.value);
                updateAdditionalCoverages(productType.value);
                updateBuildingExtensionsForProduct(productType.value);
            }
            if (propertyType && propertyType.value) {
                updateBuildingExtensions(propertyType.value);
            }
            
            // Log initialization summary
            logInitializationSummary();
            
            // Initialize wizard
            initStepWizard();
            
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
 * Initialize Step Wizard
 */
function initStepWizard() {
    // Reset wizard to first step
    currentWizardStep = 0;
    
    // Build steps array based on product type
    buildWizardSteps();
    
    // Initialize progress indicator
    initWizardProgress();
    
    // Show first step
    showWizardStep(0);
    
    // Update navigation buttons
    updateWizardNavigation();
}

/**
 * Build wizard steps array based on product type
 */
function buildWizardSteps() {
    const productType = document.getElementById('productType').value;
    
    // Always start with general details
    wizardSteps = ['step-general'];
    
    // Define cover steps in order
    const coverSteps = [
        { id: 'step-cover-structure', name: 'מבנה' },
        { id: 'step-cover-contents', name: 'תכולה' },
        { id: 'step-cover-additional', name: 'כיסוי נוסף לתכולה' }
    ];
    
    // Add steps based on product type rules
    switch(productType) {
        case 'מבנה בלבד':
            // Skip תכולה
            wizardSteps.push('step-cover-structure');
            wizardSteps.push('step-cover-additional');
            break;
            
        case 'תכולה בלבד':
            // Skip מבנה
            wizardSteps.push('step-cover-contents');
            wizardSteps.push('step-cover-additional');
            break;
            
        case 'מבנה בלבד משועבד לבנק':
            // Only מבנה and כיסויים נוספים
            wizardSteps.push('step-cover-structure');
            wizardSteps.push('step-cover-additional');
            break;
            
        default:
            // מבנה ותכולה or empty - show all steps
            coverSteps.forEach(step => {
                wizardSteps.push(step.id);
            });
            break;
    }
    
    // Always add completion step at the end
    wizardSteps.push('step-completion');
    
    // Update progress indicator if it exists
    const progressContainer = document.getElementById('wizard-progress-container');
    if (progressContainer) {
        initWizardProgress();
    }
}

/**
 * Show specific wizard step
 */
function showWizardStep(stepIndex) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.wizard-step');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    if (stepIndex >= 0 && stepIndex < wizardSteps.length) {
        const currentStepElement = document.getElementById(wizardSteps[stepIndex]);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        currentWizardStep = stepIndex;
        
        // Initialize phone validation when reaching the final step
        const currentStepId = wizardSteps[stepIndex];
        
        if (currentStepId === 'step-completion' || currentStepId === 'step-final-details') {
            // Initialize email verification field with email from general details
            setTimeout(() => {
                initializeEmailVerification();
                initializePhoneValidation();
            }, 50);
        }
        
        // Handle additional coverage step - show only third party for mortgaged properties
        if (currentStepId === 'step-cover-additional') {
            updateAdditionalCoverageVisibility();
        }
        
        // Scroll to top of modal when switching steps
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTo({ top: 0, behavior: 'auto' });
        }
    }
    
    // Update navigation
    updateWizardNavigation();
}

/**
 * Update wizard navigation buttons
 */
function updateWizardNavigation() {
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    
    // Show/hide previous button
    if (prevBtn) {
        prevBtn.style.display = currentWizardStep > 0 ? 'inline-block' : 'none';
    }
    
    // Update next button text
    if (nextBtn) {
        if (currentWizardStep === wizardSteps.length - 1) {
            nextBtn.textContent = 'סיום';
        } else {
            nextBtn.textContent = 'הבא';
        }
    }
    
    // Update progress indicator
    updateWizardProgress();
}

/**
 * Navigate to next wizard step
 */
function wizardNext() {
    // If on general details step, validate form first
    if (currentWizardStep === 0) {
        const form = document.getElementById('generalDetailsForm');
        if (form) {
            // Clear all previous errors
            clearFormErrors();
            
            // Perform custom validation
            const isValid = validateGeneralDetailsForm();
            
            if (!isValid || !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Rebuild steps based on selected product type
            buildWizardSteps();
            
            // Update progress indicator with new steps
            updateWizardNavigation();
        }
    }
            
            // If on building section step, validate building fields
            if (wizardSteps[currentWizardStep] === 'step-cover-structure') {
                // Clear all previous errors
                clearBuildingFormErrors();
                
                // Perform building section validation
                const isValid = validateBuildingSection();
                
                if (!isValid) {
                    return;
                }
            }
            
            // If on contents section step, validate contents fields
            if (wizardSteps[currentWizardStep] === 'step-cover-contents') {
                // Clear all previous errors
                clearContentsFormErrors();
                
                // Perform contents section validation
                const isValid = validateContentsSection();
                
                if (!isValid) {
                    return;
                }
            }
            
            // If on additional coverage section step, validate additional fields
            if (wizardSteps[currentWizardStep] === 'step-cover-additional') {
                // Clear all previous errors
                clearAdditionalCoverageFormErrors();
                
                // Perform additional coverage section validation
                const isValid = validateAdditionalCoverageSection();
                
                if (!isValid) {
                    return;
                }
            }
    
    // If on last step, show completion step
    if (currentWizardStep === wizardSteps.length - 1) {
        // Don't submit yet, just move to completion step
        showWizardStep(currentWizardStep + 1);
        return;
    }
    
    // Move to next step
    if (currentWizardStep < wizardSteps.length - 1) {
        showWizardStep(currentWizardStep + 1);
    }
}

/**
 * Navigate to previous wizard step
 */
function wizardPrev() {
    if (currentWizardStep > 0) {
        showWizardStep(currentWizardStep - 1);
    }
}

// Expose wizard functions to global scope for onclick handlers
window.HomeInsuranceApp = window.HomeInsuranceApp || {};
window.HomeInsuranceApp.wizardNext = wizardNext;
window.HomeInsuranceApp.wizardPrev = wizardPrev;
window.HomeInsuranceApp.submitQuoteRequest = submitQuoteRequest;

// Phone verification state
let verificationCode = '';
let phoneNumber = '';
let resendTimer = null;

/**
 * Send verification code
 */
window.HomeInsuranceApp.sendVerificationCode = async function() {
    try {
        const phoneInput = document.getElementById('phone-number');
        const sendBtn = document.getElementById('send-code-btn');
        const smsMessage = document.getElementById('sms-message');
        
        // Add safety checks
        if (!phoneInput) {
            console.error('Phone input element not found');
            alert('שגיאה: שדה הטלפון לא נמצא. אנא רענן את הדף ונסה שוב.');
            return;
        }
        
        if (!sendBtn) {
            console.error('Send button element not found');
            alert('שגיאה: כפתור השליחה לא נמצא. אנא רענן את הדף ונסה שוב.');
            return;
        }
        
        // Validate phone number using the new validation function
        const phoneValue = phoneInput.value.trim();
        const validation = validateIsraeliPhone(phoneValue);
    
    if (!phoneValue) {
        showPhoneMessage('error', 'אנא הזן מספר טלפון נייד');
        return;
    }
    
    if (!validation.isValid) {
        showPhoneMessage('error', 'אנא הזן מספר טלפון נייד ישראלי תקין (050-1234567)');
        return;
    }
    
    // Clear any previous errors and hide SMS message
    clearPhoneMessage();
    if (smsMessage) {
        smsMessage.style.display = 'none';
    }
    
    // Use the clean number for API call
    phoneNumber = phoneValue.replace(/\D/g, '');
    
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.querySelector('.btn-text').style.display = 'none';
    sendBtn.querySelector('.btn-loader').style.display = 'inline-block';
    
    try {
        // Determine the correct endpoint based on environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' || 
                             window.location.href.includes('localhost');
        
        const endpoint = isDevelopment 
            ? 'http://localhost:8080/api/send-verification'  // Local ONLY
            : 'https://admon-insurance-agency.co.il/api/send-verification';  // Production
        
        // Call backend API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send verification code');
        }
        
        // Show SMS success message
        if (smsMessage) {
            smsMessage.style.display = 'block';
            smsMessage.textContent = `קוד אימות נשלח למספר ${validation.formatted}`;
        }
        
        // Show code section
        document.getElementById('phone-section').style.display = 'none';
        document.getElementById('code-section').style.display = 'block';
        document.getElementById('phone-display').textContent = validation.formatted;
        
        // Start resend timer
        startResendTimer();
        
        // Focus first code input
        document.querySelector('.code-digit').focus();
        
        // Setup code inputs
        setupCodeInputs();
        
        // Also call initializeCodeInputs if it exists (for compatibility)
        if (typeof initializeCodeInputs === 'function') {
            initializeCodeInputs();
        }
        
    } catch (error) {
        console.error('Error sending verification code:', error);
        alert('שגיאה בשליחת קוד אימות. אנא נסה שוב.');
        
        // Hide SMS message on error
        if (smsMessage) {
            smsMessage.style.display = 'none';
        }
    } finally {
        // Reset button state
        sendBtn.disabled = false;
        sendBtn.querySelector('.btn-text').style.display = 'inline';
        sendBtn.querySelector('.btn-loader').style.display = 'none';
    }
    } catch (globalError) {
        console.error('Critical error in sendVerificationCode:', globalError);
        alert('שגיאה קריטית. אנא רענן את הדף ונסה שוב.');
    }
};

/**
 * Send email verification code
 */
window.HomeInsuranceApp.sendEmailVerificationCode = async function() {
    try {
        const emailInput = document.getElementById('email-verification');
        const sendBtn = document.getElementById('send-code-btn');
        const emailMessage = document.getElementById('email-message');
        
        // Add safety checks
        if (!emailInput) {
            console.error('Email input element not found');
            alert('שגיאה: שדה האימייל לא נמצא. אנא רענן את הדף ונסה שוב.');
            return;
        }
        
        if (!sendBtn) {
            console.error('Send button element not found');
            alert('שגיאה: כפתור השליחה לא נמצא. אנא רענן את הדף ונסה שוב.');
            return;
        }
        
        // Get email from the general details form
        const generalEmailInput = document.getElementById('email');
        const emailValue = generalEmailInput ? generalEmailInput.value.trim() : '';
        
        // Set the email verification field to readonly with the email from general details
        emailInput.value = emailValue;
        
        if (!emailValue) {
            alert('שגיאה: כתובת אימייל לא נמצאה. אנא רענן את הדף ונסה שוב.');
            return;
        }
        
        // Validate email
        if (!isValidEmail(emailValue)) {
            alert('אנא הזן כתובת אימייל תקינה');
            return;
        }
        
        // Clear any previous errors and hide email message
        if (emailMessage) {
            emailMessage.style.display = 'none';
        }
        
        // Show loading state
        sendBtn.disabled = true;
        sendBtn.querySelector('.btn-text').style.display = 'none';
        sendBtn.querySelector('.btn-loader').style.display = 'inline-block';
        
        try {
            // Determine the correct endpoint based on environment
            const isDevelopment = window.location.hostname === 'localhost' || 
                                 window.location.hostname === '127.0.0.1' || 
                                 window.location.href.includes('localhost');
            
            const endpoint = isDevelopment 
                ? 'http://localhost:8080/api/send-email-verification'  // Local ONLY
                : 'https://admon-insurance-agency.co.il/api/send-email-verification';  // Production
            
            // Call backend API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailValue })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email verification code');
            }
            
            // Show email success message
            if (emailMessage) {
                emailMessage.style.display = 'block';
                emailMessage.textContent = `קוד אימות נשלח לכתובת ${emailValue}`;
            }
            
            // Show code section
            document.getElementById('email-section').style.display = 'none';
            document.getElementById('code-section').style.display = 'block';
            document.getElementById('email-display').textContent = emailValue;
            
            // Start resend timer
            startResendTimer();
            
            // Focus first code input
            document.querySelector('.code-digit').focus();
            
            // Setup code inputs
            setupCodeInputs();
            
            // Also call initializeCodeInputs if it exists (for compatibility)
            if (typeof initializeCodeInputs === 'function') {
                initializeCodeInputs();
            }
            
        } catch (error) {
            console.error('Error sending email verification code:', error);
            alert('שגיאה בשליחת קוד אימות. אנא נסה שוב.');
            
            // Hide email message on error
            if (emailMessage) {
                emailMessage.style.display = 'none';
            }
        } finally {
            // Reset button state
            sendBtn.disabled = false;
            sendBtn.querySelector('.btn-text').style.display = 'inline';
            sendBtn.querySelector('.btn-loader').style.display = 'none';
        }
    } catch (globalError) {
        console.error('Critical error in sendEmailVerificationCode:', globalError);
        alert('שגיאה קריטית. אנא רענן את הדף ונסה שוב.');
    }
};

/**
 * Initialize code input handlers (enhanced version)
 * This function provides better handling of code inputs with filled state
 */
function initializeCodeInputs() {
    const codeInputs = document.querySelectorAll('.code-digit');
    
    codeInputs.forEach((input, index) => {
        // Handle input
        input.addEventListener('input', function(e) {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
            
            // Clear error state
            document.getElementById('verification-error').style.display = 'none';
            codeInputs.forEach(inp => inp.classList.remove('error'));
            
            if (value) {
                e.target.classList.add('filled');
                // Move to next input
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                } else {
                    // All digits entered - verify code
                    const code = Array.from(codeInputs).map(inp => inp.value).join('');
                    if (code.length === 6) {
                        verifyCode(code);
                    }
                }
            } else {
                e.target.classList.remove('filled');
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // Handle paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
            
            for (let i = 0; i < Math.min(pastedData.length, codeInputs.length); i++) {
                codeInputs[i].value = pastedData[i];
                codeInputs[i].classList.add('filled');
            }
            
            if (pastedData.length >= codeInputs.length) {
                const code = Array.from(codeInputs).map(inp => inp.value).join('');
                verifyCode(code);
            }
        });
    });
}

/**
 * Setup code digit inputs (legacy version - kept for compatibility)
 */
function setupCodeInputs() {
    try {
        const codeInputs = document.querySelectorAll('.code-digit');
        
        if (!codeInputs || codeInputs.length === 0) {
            console.error('Code input elements not found');
            return;
        }
        
        codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Clear error state safely
            const errorElement = document.getElementById('verification-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            codeInputs.forEach(inp => inp.classList.remove('error'));
            
            // Only allow digits
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Move to next input
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            
            // Check if all inputs are filled
            if (index === codeInputs.length - 1) {
                const code = Array.from(codeInputs).map(inp => inp.value).join('');
                if (code.length === 6) {
                    verifyCode(code);
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
            
            digits.split('').forEach((digit, i) => {
                if (codeInputs[i]) {
                    codeInputs[i].value = digit;
                }
            });
            
            if (digits.length === 6) {
                verifyCode(digits);
            }
        });
    });
    } catch (error) {
        console.error('Error in setupCodeInputs:', error);
    }
}

/**
 * Verify entered code
 */
async function verifyCode(enteredCode) {
    const codeInputs = document.querySelectorAll('.code-digit');
    
    try {
        // Determine the correct endpoint based on environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' || 
                             window.location.href.includes('localhost');
        
        const endpoint = isDevelopment 
            ? 'http://localhost:8080/api/verify-code'  // Local ONLY
            : 'https://admon-insurance-agency.co.il/api/verify-code';  // Production
        
        // Check if we're using email or phone verification
        const emailSection = document.getElementById('email-section');
        const isEmailVerification = emailSection && emailSection.style.display !== 'none';
        
        let requestBody;
        if (isEmailVerification) {
            // Email verification
            const generalEmailInput = document.getElementById('email');
            const emailValue = generalEmailInput ? generalEmailInput.value.trim() : '';
            requestBody = JSON.stringify({ 
                email: emailValue,
                code: enteredCode 
            });
        } else {
            // Phone verification (fallback)
            requestBody = JSON.stringify({ 
                phoneNumber,
                code: enteredCode 
            });
        }
        
        // Call backend API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store token for form submission
            window.authToken = data.token;
            
            // Success!
            codeInputs.forEach(input => input.classList.add('filled'));
            
            // Show success section
            setTimeout(() => {
                document.getElementById('code-section').style.display = 'none';
                document.getElementById('success-section').style.display = 'block';
                
                // Submit form data
                submitFinalForm();
            }, 500);
        } else {
            // Error
            codeInputs.forEach(input => input.classList.add('error'));
            document.getElementById('verification-error').style.display = 'flex';
            
            if (response.status === 429) {
                document.querySelector('.error-text').textContent = 'יותר מדי ניסיונות. אנא בקש קוד חדש.';
            }
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        codeInputs.forEach(input => input.classList.add('error'));
        document.getElementById('verification-error').style.display = 'flex';
    }
}

/**
 * Start resend timer
 */
function startResendTimer() {
    const resendBtn = document.querySelector('.btn-resend');
    const resendText = document.querySelector('.resend-text');
    const resendTimerEl = document.querySelector('.resend-timer');
    const timerSpan = document.getElementById('timer');
    
    let seconds = 60;
    
    resendBtn.disabled = true;
    resendText.style.display = 'none';
    resendTimerEl.style.display = 'inline';
    
    resendTimer = setInterval(() => {
        seconds--;
        timerSpan.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(resendTimer);
            resendBtn.disabled = false;
            resendText.style.display = 'inline';
            resendTimerEl.style.display = 'none';
        }
    }, 1000);
}

/**
 * Resend verification code
 */
window.HomeInsuranceApp.resendCode = async function() {
    try {
        // Check if we're using email or phone verification
        const emailSection = document.getElementById('email-section');
        const isEmailVerification = emailSection && emailSection.style.display !== 'none';
        
        // Determine the correct endpoint based on environment and verification type
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' || 
                             window.location.href.includes('localhost');
        
        let endpoint, requestBody;
        
        if (isEmailVerification) {
            // Email verification
            const generalEmailInput = document.getElementById('email');
            const emailValue = generalEmailInput ? generalEmailInput.value.trim() : '';
            
            endpoint = isDevelopment 
                ? 'http://localhost:8080/api/send-email-verification'  // Local ONLY
                : 'https://admon-insurance-agency.co.il/api/send-email-verification';  // Production
            
            requestBody = JSON.stringify({ email: emailValue });
        } else {
            // Phone verification (fallback for existing functionality)
            endpoint = isDevelopment 
                ? 'http://localhost:8080/api/send-verification'  // Local ONLY
                : 'https://admon-insurance-agency.co.il/api/send-verification';  // Production
            
            requestBody = JSON.stringify({ phoneNumber });
        }
        
        // Call backend API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send verification code');
        }
        
        // Clear inputs
        document.querySelectorAll('.code-digit').forEach(input => {
            input.value = '';
            input.classList.remove('error', 'filled');
        });
        
        // Hide error
        document.getElementById('verification-error').style.display = 'none';
        
        // Start timer again
        startResendTimer();
        
        // Focus first input
        document.querySelector('.code-digit').focus();
        
    } catch (error) {
        console.error('Error resending code:', error);
        alert('שגיאה בשליחת קוד חדש. אנא נסה שוב.');
    }
};

/**
 * Initialize email verification field with email from general details
 */
function initializeEmailVerification() {
    const generalEmailInput = document.getElementById('email');
    const emailVerificationInput = document.getElementById('email-verification');
    
    if (generalEmailInput && emailVerificationInput) {
        const emailValue = generalEmailInput.value.trim();
        emailVerificationInput.value = emailValue;
    }
}

/**
 * Submit final form with all collected data
 */
async function submitFinalForm() {
    try {
        // Collect all form data
        const formData = collectAllFormData();
        
        // Add phone number
        formData.phoneNumber = phoneNumber;
        
        // Determine the correct endpoint based on environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' || 
                             window.location.href.includes('localhost');
        
        const endpoint = isDevelopment 
            ? 'http://localhost:8080/api/submit-form'  // Local ONLY
            : 'https://admon-insurance-agency.co.il/api/submit-form';  // Production
        
        // Send to backend
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit form');
        }
        
        // Store form ID for tracking
        if (data.formId) {
            localStorage.setItem('lastFormId', data.formId);
        }
        
        // Show final success message
        const submitBtn = document.querySelector('.btn-submit-final');
        if (submitBtn) {
            submitBtn.textContent = 'הפרטים נשלחו בהצלחה!';
            submitBtn.disabled = true;
        }
        
        console.log('Form submitted successfully:', data);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
    }
}

/**
 * Collect all form data from all steps
 */
function collectAllFormData() {
    const data = {
        // General details
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        email: document.getElementById('email')?.value || '',
        idNumber: document.getElementById('idNumber')?.value || '',
        productType: document.getElementById('productType')?.value || '',
        propertyType: document.getElementById('propertyType')?.value || '',
        startDate: document.getElementById('startDate')?.value || '',
        
        // Address
        city: document.getElementById('city')?.value || '',
        street: document.getElementById('street')?.value || '',
        houseNumber: document.getElementById('houseNumber')?.value || '',
        postalCode: document.getElementById('postalCode')?.value || '',
        hasGarden: document.getElementById('garden-checkbox')?.checked || false,
        
        // Building details (if applicable)
        buildingInsuranceAmount: document.getElementById('insurance-amount')?.value || '',
        buildingAge: document.getElementById('building-age')?.value || '',
        buildingArea: document.getElementById('building-area')?.value || '',
        constructionType: document.getElementById('construction-type')?.value || '',
        constructionStandard: document.getElementById('construction-standard')?.value || '',
        mortgagedProperty: document.getElementById('mortgaged-property')?.checked || false,
        loanEndDate: document.getElementById("loan-end-date")?.value || "",
        
        // Building coverages
        waterDamageType: document.getElementById('water-damage-type')?.value || '',
        waterDeductible: document.getElementById('water-deductible')?.value || '',
        mortgageWaterDamage: document.getElementById('mortgage-water-damage')?.value || '',
        burglaryBuilding: document.getElementById('burglary-building')?.checked || false,
        earthquakeCoverage: document.getElementById('earthquake-coverage')?.value || '',
        earthquakeDeductible: document.getElementById('earthquake-deductible')?.value || '',
        additionalSharedInsurance: document.getElementById('additional-shared-insurance')?.value || '',
        
        // Building extensions
        buildingContentsInsurance: document.getElementById('building-contents-insurance')?.value || '',
        storageInsurance: document.getElementById('storage-insurance')?.value || '',
        swimmingPoolInsurance: document.getElementById('swimming-pool-insurance')?.value || '',
        
        // Contents details (if applicable)
        contentsValue: document.getElementById('contents-value')?.value || '',
        contentsBuildingAge: document.getElementById('contents-building-age')?.value || '',
        hasJewelry: document.getElementById('has-jewelry')?.value || '',
        jewelryAmount: document.getElementById('jewelry-amount')?.value || '',
        hasWatches: document.getElementById('has-watches')?.value || '',
        watchesAmount: document.getElementById('watches-amount')?.value || '',
        
        // Contents coverages
        contentsEarthquakeCoverage: document.getElementById('contents-earthquake-coverage')?.value || '',
        
        // Additional coverages
        thirdPartyCoverage: document.getElementById('third-party-coverage')?.checked || false,
        employersLiability: document.getElementById('employers-liability')?.checked || false,
        cyberCoverage: document.getElementById('cyber-coverage')?.checked || false,
        terrorCoverage: document.getElementById('terror-coverage')?.checked || false,
        
        // Timestamp
        submittedAt: new Date().toLocaleString('he-IL')
    };
    
    return data;
}

/**
 * Format email content
 */
function formatEmailContent(data) {
    let content = `
פרטי הצעת ביטוח דירה חדשה
========================

פרטים אישיים:
--------------
שם מלא: ${data.firstName} ${data.lastName}
מספר טלפון: ${phoneNumber}
אימייל: ${data.email}
תעודת זהות: ${data.idNumber}

פרטי הביטוח:
--------------
סוג מוצר: ${data.productType}
סוג נכס: ${data.propertyType}
תאריך התחלה: ${data.startDate}

כתובת:
-------
עיר: ${data.city}
רחוב: ${data.street}
מספר בית: ${data.houseNumber}
מיקוד: ${data.postalCode}
גינה: ${data.hasGarden ? 'כן' : 'לא'}
`;

    // Add building details if applicable
    if (data.buildingInsuranceAmount) {
        content += `

פרטי מבנה:
-----------
סכום ביטוח: ₪${data.buildingInsuranceAmount}
גיל המבנה: ${data.buildingAge} שנים
שטח: ${data.buildingArea} מ"ר
סוג בניה: ${data.constructionType}
סטנדרט בניה: ${data.constructionStandard}
משועבד/מוטב: ${data.mortgagedProperty ? 'כן' : 'לא'}
חידושים: ${data.loanEndDate}

כיסויים נוספים למבנה:
נזקי מים: ${data.waterDamageType}
השתתפות עצמית: ${data.waterDeductible}
פריצה: ${data.burglaryBuilding ? 'כן' : 'לא'}
רעידת אדמה: ${data.earthquakeCoverage}
`;
    }

    // Add contents details if applicable
    if (data.jewelryAmount || data.watchesAmount) {
        content += `

פרטי תכולה:
-----------
תכשיטים: ₪${data.jewelryAmount || '0'}
שעונים: ₪${data.watchesAmount || '0'}
`;
    }

    // Add additional coverages
    content += `

כיסויים נוספים:
---------------
צד שלישי: ${data.thirdPartyCoverage ? 'כן' : 'לא'}
חבות מעבידים: ${data.employersLiability ? 'כן' : 'לא'}
סייבר למשפחה: ${data.cyberCoverage ? 'כן' : 'לא'}
טרור: ${data.terrorCoverage ? 'כן' : 'לא'}

נשלח בתאריך: ${data.submittedAt}
`;

    return content;
}

/**
 * Initialize page functionality
 */
function initializePage() {
    console.log('initializePage called');
    
    // Add responsive navigation handling
    initializeNavigation();
    
    // Add form validation (ready for future forms)
    initializeFormValidation();
    
    // Initialize modal CTA button
    console.log('About to call initializeModalCTAButton');
    initializeModalCTAButton();
    console.log('initializeModalCTAButton completed');
    
    // Note: initializeSmoothScrolling is called separately in other DOMContentLoaded
    // to avoid conflicts with the existing implementation
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

function validateHouseNumber(houseNumber) {
    // House number: digits optionally followed by Hebrew letter
    const houseRegex = /^\d+[א-ת]?$/;
    return houseRegex.test(houseNumber);
}

function validatePostalCode(postalCode) {
    // Postal code: 5-7 digits only
    const postalRegex = /^\d{5,7}$/;
    return postalRegex.test(postalCode);
}

function validateZipCode(zipCode) {
    // Israeli ZIP code format: 5 or 7 digits (alias for validatePostalCode)
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
            'houseNumber': { 
                required: true, 
                validate: validateHouseNumber,
                message: 'אנא הזן מספר בית תקין'
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

/**
 * Initialize Wizard Progress Indicator
 */
function initWizardProgress() {
    const progressContainer = document.getElementById('wizard-progress-container');
    if (!progressContainer) return;
    
    const stepsContainer = progressContainer.querySelector('.wizard-progress-steps');
    if (!stepsContainer) return;
    
    // Clear existing steps
    stepsContainer.innerHTML = '';
    
    // Create steps based on wizardSteps array
    wizardSteps.forEach((stepId, index) => {
        const stepDisplayName = getStepDisplayName(stepId);
        const stepNumber = index + 1;
        
        const stepItem = document.createElement('div');
        stepItem.className = 'wizard-step-item pending';
        stepItem.setAttribute('data-step-index', index);
        
        stepItem.innerHTML = `
            <div class="wizard-step-circle">${stepNumber}</div>
            <div class="wizard-step-label">${stepDisplayName}</div>
        `;
        
        stepsContainer.appendChild(stepItem);
    });
    
    // Update progress to show current step
    updateWizardProgress();
}

/**
 * Update Wizard Progress Indicator
 */
function updateWizardProgress() {
    const progressContainer = document.getElementById('wizard-progress-container');
    if (!progressContainer) return;
    
    const stepItems = progressContainer.querySelectorAll('.wizard-step-item');
    const progressFill = progressContainer.querySelector('.wizard-progress-fill');
    
    if (!stepItems.length || !progressFill) return;
    
    // Update step states
    stepItems.forEach((stepItem, index) => {
        const stepElement = stepItem;
        
        // Remove all state classes
        stepElement.classList.remove('pending', 'current', 'completed');
        
        // Add appropriate state class
        if (index < currentWizardStep) {
            stepElement.classList.add('completed');
        } else if (index === currentWizardStep) {
            stepElement.classList.add('current');
        } else {
            stepElement.classList.add('pending');
        }
    });
    
    // Update progress bar
    const progressPercentage = wizardSteps.length > 1 ? 
        (currentWizardStep / (wizardSteps.length - 1)) * 100 : 0;
    
    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    
    // Add percentage display if not exists
    let percentageDisplay = progressContainer.querySelector('.wizard-progress-percentage');
    if (!percentageDisplay) {
        percentageDisplay = document.createElement('div');
        percentageDisplay.className = 'wizard-progress-percentage';
        progressContainer.appendChild(percentageDisplay);
    }
    
    // Update percentage text
    const displayPercentage = Math.round(Math.min(progressPercentage, 100));
    percentageDisplay.textContent = `${displayPercentage}% הושלם`;
}

/**
 * Get display name for step
 */
function getStepDisplayName(stepId) {
    const stepNames = {
        'step-general': 'פרטים כלליים',
        'step-cover-structure': 'מבנה',
        'step-cover-contents': 'תכולה',
        'step-cover-additional': 'כיסוי נוסף לתכולה',
        'step-completion': 'סיום'
    };
    
    return stepNames[stepId] || 'שלב';
}

// Export functions for potential module use
window.HomeInsuranceApp = {
    openGeneralDetailsModal,
    collectFormData,
    submitFormData,
    closeGeneralDetailsModal,
    submitGeneralDetails,
    wizardNext,
    wizardPrev,
    submitQuoteRequest,
    // Add missing functions
    initializeConditionalFields,
    validateGeneralDetailsForm,
    clearFormErrors,
    updateProductSections,
    initializeProductSections,
    collectAllFormData,
    showNotification,
    // Phone verification functions
    initializeCodeInputs,
    verifyCode,
    startResendTimer,
    // Numeric inputs initialization
    initializeNumericInputs,
    initializeSingleNumericInput
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
        
        // Set minimum date to today for loan end date
        const loanEndDateInput = document.getElementById('loan-end-date');
        if (loanEndDateInput) {
            const today = new Date().toISOString().split('T')[0];
            loanEndDateInput.min = today;
        }
        
        // Initialize conditional field logic
        initializeConditionalFields();
        
        // Initialize product sections
        initializeProductSections();
        
        // Add form input listeners for real-time validation
        addFormInputListeners();
        
        // Initialize phone validation (delayed to ensure DOM is ready)
        setTimeout(() => {
            initializePhoneValidation();
            
            // Also check if we're already on the final step
            const currentStepElement = document.querySelector('.wizard-step.active');
            if (currentStepElement && currentStepElement.id === 'step-completion') {
                // Re-initialize for the final step to ensure it works
                setTimeout(() => {
                    initializePhoneValidation();
                }, 100);
            }
        }, 300);
        
        // Add event listeners for closing the modal
        setupModalCloseHandlers();
        
        // Initialize numeric inputs with mobile keyboard support
        initializeNumericInputs();
        
        // Initialize wizard
        initStepWizard();
        
        // Ensure phone validation is ready when needed
        document.addEventListener('input', function(e) {
            if (e.target && e.target.id === 'phone-number') {
                const phoneInput = e.target;
                if (!phoneInput.hasAttribute('data-validation-initialized')) {
                    phoneInput.setAttribute('data-validation-initialized', 'true');
                    initializePhoneValidation();
                }
            }
        }, true);
        
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
    const propertyTypeSelect = document.getElementById('propertyType');
    const floorCountSelect = document.getElementById('floorCount');
    
    // Find parent form groups
    const floorCountField = floorCountSelect ? floorCountSelect.closest('.form-group') : null;
    
    // Product Type change handler
    if (productTypeSelect) {
        productTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            // Update product sections based on selection
            updateProductSections(selectedValue);
            
            // Update building section fields based on selection
            updateBuildingFields(selectedValue);
            
            // Update additional coverages section based on selection
            updateAdditionalCoverages(selectedValue);
            
            // Update building extensions section based on selection
            updateBuildingExtensionsForProduct(selectedValue);
            
            // Update contents fields based on product type
            updateContentsFieldsForProductType();
            
            // Add smooth scroll to top when product type changes
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // Property Type change handler
    if (propertyTypeSelect) {
        propertyTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (floorCountField && floorCountSelect) {
                if (selectedValue === 'פרטי') {
                    // Hide floor count field
                    floorCountField.classList.add('hidden');
                    floorCountSelect.value = '';
                    floorCountSelect.required = false; // <-- תיקון נוסף לעקביות
                } else {
                    // Show floor count field
                    floorCountField.classList.remove('hidden');
                    floorCountSelect.required = true; // <-- תיקון נוסף לעקביות
                }
            }
        });
    }
    
    // Additional Coverages conditional fields
    const waterDamageSelect = document.getElementById('water-damage-type');
    const earthquakeSelect = document.getElementById('earthquake-coverage');
    
    if (waterDamageSelect) {
        waterDamageSelect.addEventListener('change', function() {
            updateWaterDamageFields(this.value);
        });
    }
    
    if (earthquakeSelect) {
        earthquakeSelect.addEventListener('change', function() {
            updateEarthquakeFields(this.value);
        });
    }

    // Building conditional fields handlers
    const hasTerrace = document.getElementById('has-terrace');
    const hasGarden = document.getElementById('has-garden');
    const hasSwimmingPool = document.getElementById('has-swimming-pool');
    const earthquakeLandCoverage = document.getElementById('earthquake-land-coverage');

    if (hasTerrace) {
        hasTerrace.addEventListener('change', function() {
            updateTerraceFields(this.value);
        });
    }

    if (hasGarden) {
        hasGarden.addEventListener('change', function() {
            updateGardenFields(this.value);
        });
    }

    if (hasSwimmingPool) {
        hasSwimmingPool.addEventListener('change', function() {
            updateSwimmingPoolFields(this.checked);
        });
    }

    if (earthquakeLandCoverage) {
        earthquakeLandCoverage.addEventListener('change', function() {
            updateEarthquakeLandCoverageFields(this.value);
        });
    }
    
    // Initialize tooltips and help text animations for additional coverage section
    initializeAdditionalCoverageEnhancements();
    
    // Add property type handler for building extensions (avoid duplicate handlers)
    if (propertyTypeSelect && !propertyTypeSelect.hasAttribute('data-extensions-handler')) {
        propertyTypeSelect.setAttribute('data-extensions-handler', 'true');
        propertyTypeSelect.addEventListener('change', function() {
            updateBuildingExtensions(this.value);
        });
        
        // Initialize on page load if property type is already selected
        if (propertyTypeSelect.value) {
            updateBuildingExtensions(propertyTypeSelect.value);
        }
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
        'צד שלישי': document.querySelector('[data-section="צד שלישי"]'),
        'מעבידים': document.querySelector('[data-section="מעבידים"]'),
        'סייבר למשפחה': document.querySelector('[data-section="סייבר למשפחה"]'),
        'טרור': document.querySelector('[data-section="טרור"]')
    };
    // Additional Coverage step sections - business section removed
    const additionalCoverageStep = document.getElementById('step-cover-additional');
    if (additionalCoverageStep) {
        // נניח שהכיסויים מסודרים לפי סדר: צד שלישי, חבות מעבידים, סייבר למשפחה, טרור
        const thirdPartySection = additionalCoverageStep.querySelector('.building-section:nth-of-type(1)');
        const employersSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(2)');
        const cyberSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(3)');
        const terrorSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(4)');
        // הצג הכל כברירת מחדל
        [thirdPartySection, employersSection, cyberSection, terrorSection].forEach(section => {
            if (section) section.style.display = '';
        });
        if (productType === 'מבנה בלבד משועבד לבנק') {
            // הצג רק צד שלישי, הסתר את השאר
            if (employersSection) employersSection.style.display = 'none';
            if (cyberSection) cyberSection.style.display = 'none';
            if (terrorSection) terrorSection.style.display = 'none';
            if (thirdPartySection) thirdPartySection.style.display = '';
        }
    }
    
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
            
        case 'מבנה בלבד משועבד לבנק':
            // Disable multiple sections
            disableSection(sections['תכולה']);
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
 * Update building section fields based on product type selection
 * @param {string} productType - The selected product type
 */
function updateBuildingFields(productType) {
    const buildingAgeField = document.getElementById('building-age');
    const buildingAgeGroup = buildingAgeField ? buildingAgeField.closest('.building-form-group') : null;
    const mortgagedCheckbox = document.getElementById('mortgaged-property');
    const loanEndDateGroup = document.getElementById('loanEndDate-group');
    const loanEndDateInput = document.getElementById('loanEndDate');
    
    if (productType === 'מבנה בלבד משועבד לבנק') {
        // Hide building age field
        if (buildingAgeGroup) {
            buildingAgeGroup.style.display = 'none';
            if (buildingAgeField) {
                buildingAgeField.required = false;
                buildingAgeField.value = '';
            }
        }
        
        // Automatically check and disable mortgaged checkbox
        if (mortgagedCheckbox) {
            mortgagedCheckbox.checked = true;
            mortgagedCheckbox.disabled = true;
            
            // Update the visual state of the wrapper
            const wrapper = mortgagedCheckbox.closest('.building-checkbox-wrapper');
            if (wrapper) {
                wrapper.style.opacity = '0.7';
                wrapper.style.cursor = 'not-allowed';
            }
        }
        
        // Show loanEndDate dropdown
        if (loanEndDateGroup) {
            loanEndDateGroup.style.display = 'block';
            if (loanEndDateInput) {
                loanEndDateInput.required = true;
            }
        }
    } else {
        // Show building age field
        if (buildingAgeGroup) {
            buildingAgeGroup.style.display = 'block';
            if (buildingAgeField) {
                buildingAgeField.required = true;
            }
        }
        
        // Enable mortgaged checkbox
        if (mortgagedCheckbox) {
            mortgagedCheckbox.disabled = false;
            mortgagedCheckbox.checked = false;
            
            // Restore the visual state of the wrapper
            const wrapper = mortgagedCheckbox.closest('.building-checkbox-wrapper');
            if (wrapper) {
                wrapper.style.opacity = '';
                wrapper.style.cursor = '';
            }
        }
        
        // Hide loanEndDate dropdown
        if (loanEndDateGroup) {
            loanEndDateGroup.style.display = 'none';
            if (loanEndDateInput) {
                loanEndDateInput.required = false;
                loanEndDateInput.value = '';
            }
        }
    }
}

/**
 * Update additional coverages fields based on product type selection
 * @param {string} productType - The selected product type
 */
function updateAdditionalCoverages(productType) {
    const waterDamageSelect = document.getElementById('water-damage-type');
    const burglaryCheckbox = document.getElementById('burglary-building');
    const earthquakeSelect = document.getElementById('earthquake-coverage');
    const waterDeductibleGroup = document.getElementById('water-deductible-group');
    const mortgageWaterDamageGroup = document.getElementById('mortgage-water-damage-group');
    const mortgageWaterDamageSelect = document.getElementById('mortgage-water-damage');
    
    if (productType === 'מבנה בלבד משועבד לבנק') {
        // Auto-select and disable water damage dropdown
        if (waterDamageSelect) {
            waterDamageSelect.value = 'מעוניין בשרברב בהסדר עם חברת ביטוח';
            waterDamageSelect.disabled = true;
            // Call updateWaterDamageFields to apply the changes
            updateWaterDamageFields('מעוניין בשרברב בהסדר עם חברת ביטוח');
        }
        
        // Hide regular water deductible field
        if (waterDeductibleGroup) {
            waterDeductibleGroup.style.display = 'none';
            const waterDeductibleSelect = document.getElementById('water-deductible');
            if (waterDeductibleSelect) {
                waterDeductibleSelect.required = false;
                waterDeductibleSelect.value = '';
            }
        }
        
        // Show and auto-select mortgage water damage dropdown
        if (mortgageWaterDamageGroup) {
            mortgageWaterDamageGroup.style.display = 'block';
            if (mortgageWaterDamageSelect) {
                mortgageWaterDamageSelect.value = 'השתתפות עצמית 850 ש״ח - שרברב שבהסדר';
                mortgageWaterDamageSelect.required = true;
                mortgageWaterDamageSelect.disabled = true;
            }
        }
        
        // Auto-check and disable burglary checkbox
        if (burglaryCheckbox) {
            burglaryCheckbox.checked = true;
            burglaryCheckbox.disabled = true;
            
            // Update visual state
            const wrapper = burglaryCheckbox.closest('.building-checkbox-wrapper');
            if (wrapper) {
                wrapper.style.opacity = '0.7';
                wrapper.style.cursor = 'not-allowed';
            }
        }
        
        // Auto-select and disable earthquake dropdown
        if (earthquakeSelect) {
            earthquakeSelect.value = 'כן';
            earthquakeSelect.disabled = true;
            
            // Show earthquake deductible field
            updateEarthquakeFields('כן');
        }
    } else {
        // Enable water damage dropdown
        if (waterDamageSelect) {
            waterDamageSelect.disabled = false;
            waterDamageSelect.value = '';
            
            // Update water damage fields based on current selection
            updateWaterDamageFields(waterDamageSelect.value);
        }
        
        // Hide mortgage water damage dropdown
        if (mortgageWaterDamageGroup) {
            mortgageWaterDamageGroup.style.display = 'none';
            if (mortgageWaterDamageSelect) {
                mortgageWaterDamageSelect.required = false;
                mortgageWaterDamageSelect.value = '';
            }
        }
        
        // Enable burglary checkbox
        if (burglaryCheckbox) {
            burglaryCheckbox.disabled = false;
            burglaryCheckbox.checked = false;
            
            // Restore visual state
            const wrapper = burglaryCheckbox.closest('.building-checkbox-wrapper');
            if (wrapper) {
                wrapper.style.opacity = '';
                wrapper.style.cursor = '';
            }
        }
        
        // Enable earthquake dropdown
        if (earthquakeSelect) {
            earthquakeSelect.disabled = false;
            earthquakeSelect.value = '';
            
            // Update earthquake fields based on current selection
            updateEarthquakeFields(earthquakeSelect.value);
        }
    }
}

/**
 * Update water damage related fields based on selection
 * @param {string} waterDamageType - The selected water damage type
 */
function updateWaterDamageFields(waterDamageType) {
    const waterDeductibleGroup = document.getElementById('water-deductible-group');
    const waterDeductibleSelect = document.getElementById('water-deductible');
    const waterDamageSelect = document.getElementById('water-damage-type');
    const productType = document.getElementById('productType')?.value || '';
    
    // If product type is "מבנה בלבד משועבד לבנק", force water damage to plumber option
    if (productType === 'מבנה בלבד משועבד לבנק' && waterDamageSelect) {
        waterDamageSelect.value = 'מעוניין בשרברב בהסדר עם חברת ביטוח';
        waterDamageSelect.disabled = true;
        waterDamageSelect.style.backgroundColor = '#f0f0f0';
        waterDamageSelect.style.cursor = 'not-allowed';
        
        // Add a note to explain why it's disabled
        const existingNote = waterDamageSelect.parentElement.querySelector('.form-note');
        if (!existingNote) {
            const note = document.createElement('small');
            note.className = 'form-note text-muted';
            note.textContent = 'שדה זה נקבע אוטומטית עבור נכס משועבד לבנק';
            note.style.color = '#666';
            note.style.fontSize = '12px';
            note.style.marginTop = '5px';
            note.style.display = 'block';
            waterDamageSelect.parentElement.appendChild(note);
        }
        
        // Force update the water damage type
        waterDamageType = 'מעוניין בשרברב בהסדר עם חברת ביטוח';
    } else if (waterDamageSelect) {
        waterDamageSelect.disabled = false;
        waterDamageSelect.style.backgroundColor = '';
        waterDamageSelect.style.cursor = '';
        
        // Remove the note
        const existingNote = waterDamageSelect.parentElement.querySelector('.form-note');
        if (existingNote) {
            existingNote.remove();
        }
    }
    
    if (waterDamageType === 'ללא נזקי מים' || !waterDamageType) {
        // Hide water deductible field
        if (waterDeductibleGroup) {
            waterDeductibleGroup.style.display = 'none';
            if (waterDeductibleSelect) {
                waterDeductibleSelect.required = false;
                waterDeductibleSelect.value = '';
            }
        }
    } else {
        // Show water deductible field
        if (waterDeductibleGroup) {
            waterDeductibleGroup.style.display = 'block';
            if (waterDeductibleSelect) {
                waterDeductibleSelect.required = true;
            }
        }
    }
}

/**
 * Update earthquake related fields based on selection
 * @param {string} earthquakeCoverage - The selected earthquake coverage
 */
function updateEarthquakeFields(earthquakeCoverage) {
    // This function is kept for compatibility but doesn't do anything
    // since earthquake deductible fields have been removed
}

/**
 * Update building extensions fields based on property type selection
 * @param {string} propertyType - The selected property type
 */
function updateBuildingExtensions(propertyType) {
    const storageGroup = document.getElementById('storage-group');
    const storageInput = document.getElementById('storage-insurance');
    const hasGardenGroup = document.getElementById('has-garden-group');
    const roofTypeGroup = document.getElementById('roof-type-group');
    
    if (propertyType === 'פרטי') {
        // Show storage field for private properties
        if (storageGroup) {
            storageGroup.style.display = 'block';
        }
        // Show garden field for private properties
        if (hasGardenGroup) {
            hasGardenGroup.style.display = 'block';
        }
        // Show roof type field for private properties
        if (roofTypeGroup) {
            roofTypeGroup.style.display = 'block';
        }
    } else if (propertyType === 'דירה קומת קרקע') {
        // Hide storage field for non-private properties
        if (storageGroup) {
            storageGroup.style.display = 'none';
            if (storageInput) {
                storageInput.value = '';
            }
        }
        // Show garden field for ground floor apartments
        if (hasGardenGroup) {
            hasGardenGroup.style.display = 'block';
        }
        // Hide roof type field for non-private properties
        if (roofTypeGroup) {
            roofTypeGroup.style.display = 'none';
            const roofTypeSelect = document.getElementById('roof-type');
            if (roofTypeSelect) {
                roofTypeSelect.value = '';
                roofTypeSelect.required = false;
            }
        }
    } else {
        // Hide storage field for non-private properties
        if (storageGroup) {
            storageGroup.style.display = 'none';
            if (storageInput) {
                storageInput.value = '';
            }
        }
        // Hide garden field for other property types
        if (hasGardenGroup) {
            hasGardenGroup.style.display = 'none';
            const hasGardenSelect = document.getElementById('has-garden');
            const gardenAreaGroup = document.getElementById('garden-area-group');
            if (hasGardenSelect) {
                hasGardenSelect.value = '';
            }
            if (gardenAreaGroup) {
                gardenAreaGroup.style.display = 'none';
                const gardenAreaInput = document.getElementById('garden-area');
                if (gardenAreaInput) {
                    gardenAreaInput.value = '';
                    gardenAreaInput.required = false;
                }
            }
        }
        // Hide roof type field for non-private properties
        if (roofTypeGroup) {
            roofTypeGroup.style.display = 'none';
            const roofTypeSelect = document.getElementById('roof-type');
            if (roofTypeSelect) {
                roofTypeSelect.value = '';
                roofTypeSelect.required = false;
            }
        }
    }
}

/**
 * Update building extensions fields based on product type selection
 * @param {string} productType - The selected product type
 */
/**
 * Update building extensions fields based on product type selection
 * @param {string} productType - The selected product type
 */
function updateBuildingExtensionsForProduct(productType) {
    const boilersGroup = document.getElementById('boilers-group');
    const boilersCheckbox = document.getElementById('boilers-coverage');
    const loanEndDateGroup = document.getElementById('loan-end-date-group');
    const loanEndDateInput = document.getElementById('loan-end-date');
    const mortgageBankGroup = document.getElementById('mortgage-bank-group');
    const mortgageBranchGroup = document.getElementById('mortgage-branch-group');
    
    if (productType === 'מבנה בלבד משועבד לבנק') {
        // Hide boilers checkbox completely
        if (boilersGroup) {
            boilersGroup.style.display = 'none';
            if (boilersCheckbox) {
                boilersCheckbox.checked = false;
                boilersCheckbox.value = '';
            }
        }
        
        // Show loan end date field for mortgaged properties
        if (loanEndDateGroup) {
            loanEndDateGroup.style.display = 'block';
            if (loanEndDateInput) {
                loanEndDateInput.required = true;
                // Set minimum date to today (only current or future dates allowed)
                const today = new Date().toISOString().split('T')[0];
                loanEndDateInput.min = today;
            }
        }
        
        // Show bank and branch fields
        if (mortgageBankGroup) {
            mortgageBankGroup.style.display = 'block';
            const bankInput = document.getElementById('mortgage-bank');
            if (bankInput) {
                bankInput.required = true;
            }
        }
        if (mortgageBranchGroup) {
            mortgageBranchGroup.style.display = 'block';
            const branchInput = document.getElementById('mortgage-branch');
            if (branchInput) {
                branchInput.required = true;
            }
        }
    } else {
        // Show boilers checkbox
        if (boilersGroup) {
            boilersGroup.style.display = 'block';
        }
        
        // Hide loan end date field for non-mortgaged properties
        if (loanEndDateGroup) {
            loanEndDateGroup.style.display = 'none';
            if (loanEndDateInput) {
                loanEndDateInput.required = false;
                loanEndDateInput.value = '';
            }
        }
        
        // Hide bank and branch fields
        if (mortgageBankGroup) {
            mortgageBankGroup.style.display = 'none';
            const bankInput = document.getElementById('mortgage-bank');
            if (bankInput) {
                bankInput.required = false;
                bankInput.value = '';
            }
        }
        if (mortgageBranchGroup) {
            mortgageBranchGroup.style.display = 'none';
            const branchInput = document.getElementById('mortgage-branch');
            if (branchInput) {
                branchInput.required = false;
                branchInput.value = '';
                branchInput.disabled = true;
            }
        }
    }
}
/**
 * Update terrace related fields based on selection
 * @param {string} hasTerrace - The selected terrace option
 */
function updateTerraceFields(hasTerrace) {
    const terraceAreaGroup = document.getElementById('terrace-area-group');
    const terraceAreaInput = document.getElementById('terrace-area');
    
    if (hasTerrace === 'כן') {
        // Show terrace area field
        if (terraceAreaGroup) {
            terraceAreaGroup.style.display = 'block';
            if (terraceAreaInput) {
                terraceAreaInput.required = true;
            }
        }
    } else {
        // Hide terrace area field
        if (terraceAreaGroup) {
            terraceAreaGroup.style.display = 'none';
            if (terraceAreaInput) {
                terraceAreaInput.required = false;
                terraceAreaInput.value = '';
            }
        }
    }
}

/**
 * Update garden related fields based on selection
 * @param {string} hasGarden - The selected garden option
 */
function updateGardenFields(hasGarden) {
    const gardenAreaGroup = document.getElementById('garden-area-group');
    const gardenAreaInput = document.getElementById('garden-area');
    
    if (hasGarden === 'כן') {
        // Show garden area field
        if (gardenAreaGroup) {
            gardenAreaGroup.style.display = 'block';
            if (gardenAreaInput) {
                gardenAreaInput.required = true;
            }
        }
    } else {
        // Hide garden area field
        if (gardenAreaGroup) {
            gardenAreaGroup.style.display = 'none';
            if (gardenAreaInput) {
                gardenAreaInput.required = false;
                gardenAreaInput.value = '';
            }
        }
    }
}

/**
 * Update swimming pool related fields based on selection
 * @param {boolean} hasSwimmingPool - Whether swimming pool checkbox is checked
 */
function updateSwimmingPoolFields(hasSwimmingPool) {
    const swimmingPoolValueGroup = document.getElementById('swimming-pool-value-group');
    const swimmingPoolValueInput = document.getElementById('swimming-pool-value');
    
    if (hasSwimmingPool) {
        // Show swimming pool value field
        if (swimmingPoolValueGroup) {
            swimmingPoolValueGroup.style.display = 'block';
            if (swimmingPoolValueInput) {
                swimmingPoolValueInput.required = true;
            }
        }
    } else {
        // Hide swimming pool value field
        if (swimmingPoolValueGroup) {
            swimmingPoolValueGroup.style.display = 'none';
            if (swimmingPoolValueInput) {
                swimmingPoolValueInput.required = false;
                swimmingPoolValueInput.value = '';
            }
        }
    }
}

/**
 * Update earthquake land coverage related fields based on selection
 * @param {string} earthquakeLandCoverage - The selected earthquake land coverage option
 */
function updateEarthquakeLandCoverageFields(earthquakeLandCoverage) {
    const earthquakeCoverageAmountGroup = document.getElementById('earthquake-coverage-amount-group');
    const earthquakeCoverageAmountInput = document.getElementById('earthquake-coverage-amount');
    
    if (earthquakeLandCoverage === 'כן') {
        // Show earthquake coverage amount field
        if (earthquakeCoverageAmountGroup) {
            earthquakeCoverageAmountGroup.style.display = 'block';
            if (earthquakeCoverageAmountInput) {
                earthquakeCoverageAmountInput.required = true;
            }
        }
    } else {
        // Hide earthquake coverage amount field
        if (earthquakeCoverageAmountGroup) {
            earthquakeCoverageAmountGroup.style.display = 'none';
            if (earthquakeCoverageAmountInput) {
                earthquakeCoverageAmountInput.required = false;
                earthquakeCoverageAmountInput.value = '';
            }
        }
    }
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
                    // Add subtle animation feedback
                    item.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                    }, 150);
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
    const propertyTypeSelect = document.getElementById('propertyType');
    if (productTypeSelect && productTypeSelect.value) {
        updateProductSections(productTypeSelect.value);
        updateBuildingFields(productTypeSelect.value);
        updateAdditionalCoverages(productTypeSelect.value);
        updateBuildingExtensionsForProduct(productTypeSelect.value);
    }
    if (propertyTypeSelect && propertyTypeSelect.value) {
        updateBuildingExtensions(propertyTypeSelect.value);
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
    const firstName = document.getElementById('first-name')?.value?.trim() || '';
    const lastName = document.getElementById('last-name')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const idNumber = document.getElementById('idNumber')?.value?.trim() || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const productType = document.getElementById('productType')?.value || '';
    const propertyType = document.getElementById('propertyType')?.value || '';
    const floorCount = document.getElementById('floorCount')?.value || '';
    
    // Get city from the autocomplete input
    const cityInput = document.getElementById('city-autocomplete') || document.getElementById('city');
    const city = cityInput?.value?.trim() || '';
    
    // Get street and house number only if visible
    const streetElement = document.getElementById('street');
    const streetGroup = streetElement ? streetElement.closest('.form-group') : null;
    const street = (streetGroup && streetGroup.style.display !== 'none') ? streetElement.value.trim() : '';
    
    const houseNumberElement = document.getElementById('houseNumber');
    const houseNumberGroup = houseNumberElement ? houseNumberElement.closest('.form-group') : null;
    const houseNumber = (houseNumberGroup && houseNumberGroup.style.display !== 'none') ? houseNumberElement.value : '';
    
    const postalCode = document.getElementById('postalCode')?.value || '';
    
    // Collect selected product sections
    const selectedProducts = [];
    const sectionCheckboxes = document.querySelectorAll('.section-item input[type="checkbox"]:checked');
    sectionCheckboxes.forEach(checkbox => {
        selectedProducts.push(checkbox.value);
    });
    
    // Create structured data object
    const formData = {
        // Personal Information
        firstName: firstName,
        lastName: lastName,
        email: email,
        idNumber: idNumber,
        
        // Policy Information
        startDate: startDate,
        productType: productType,
        
        // Property Information
        propertyType: propertyType,
        assetType: propertyType, // Keep for backward compatibility
        
        // Floor Information (only if visible and has value)
        ...(floorCount && {
            floorsNumber: parseInt(floorCount, 10)
        }),
        
        // Address Information
        city: city,
        street: street,
        houseNumber: houseNumber,
        zipCode: postalCode,
        postalCode: postalCode, // Both names for compatibility
        
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
    
    // Validate First Name
    const firstName = document.getElementById('first-name');
    if (firstName) {
        const firstNameValue = firstName.value.trim();
        if (!firstNameValue) {
            showFormError(firstName, 'שדה חובה - יש להזין שם פרטי');
            isValid = false;
        } else if (firstNameValue.length < 2) {
            showFormError(firstName, 'שם פרטי חייב להכיל לפחות 2 תווים');
            isValid = false;
        }
    }
    
    // Validate Last Name
    const lastName = document.getElementById('last-name');
    if (lastName) {
        const lastNameValue = lastName.value.trim();
        if (!lastNameValue) {
            showFormError(lastName, 'שדה חובה - יש להזין שם משפחה');
            isValid = false;
        } else if (lastNameValue.length < 2) {
            showFormError(lastName, 'שם משפחה חייב להכיל לפחות 2 תווים');
            isValid = false;
        }
    }
    
    // Validate Email
    const email = document.getElementById('email');
    if (email) {
        const emailValue = email.value.trim();
        if (!emailValue) {
            showFormError(email, 'שדה חובה - יש להזין כתובת אימייל');
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            showFormError(email, 'כתובת אימייל אינה תקינה - יש להזין כתובת מייל חוקית');
            isValid = false;
        }
    }
    
    // Validate Phone Number
    const phoneNumber = document.getElementById('phone-number');
    if (phoneNumber) {
        const phoneValue = phoneNumber.value.trim();
        // לוגים לבדיקה
        console.log('phoneValue:', JSON.stringify(phoneValue));
        if (!phoneValue) {
            showFormError(phoneNumber, 'שדה חובה - יש להזין מספר טלפון נייד');
            isValid = false;
        } else {
            // Clean the phone number before validation (remove formatting)
            const cleanedPhoneValue = phoneValue.replace(/\D/g, '');
            console.log('cleanedPhoneValue:', JSON.stringify(cleanedPhoneValue));
            const validation = validateIsraeliPhone(cleanedPhoneValue);
            console.log('validation:', validation);
            if (!validation.isValid) {
                // Use the specific error message from validation
                showFormError(phoneNumber, validation.error);
                isValid = false;
            }
        }
    }
    
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
        } else {
            const floorCountValue = parseInt(floorCount.value, 10);
            if (floorCountValue > 68) {
                showFormError(floorCount, `קומה ${floorCountValue} לא קיימת, נא לוודא שאתה רושם את מספר הקומות הנכון`);
                isValid = false;
            } else if (floorCountValue < 1) {
                showFormError(floorCount, 'מספר קומות חייב להיות לפחות 1');
                isValid = false;
            }
        }
    }
    
    // Validate City
    const cityInput = document.getElementById('city-autocomplete');
    if (cityInput && !cityInput.value.trim()) {
        showFormError(cityInput, 'שדה חובה');
        isValid = false;
    }
    
    // Validate Street (only if visible)
    const street = document.getElementById('street');
    const streetGroup = street ? street.closest('.form-group') : null;
    if (street && streetGroup && streetGroup.style.display !== 'none' && street.required) {
        if (!street.value.trim()) {
            showFormError(street, 'שדה חובה');
            isValid = false;
        }
    }
    
    // Validate House Number (only if visible)
    const houseNumber = document.getElementById('houseNumber');
    const houseNumberGroup = houseNumber ? houseNumber.closest('.form-group') : null;
    if (houseNumber && houseNumberGroup && houseNumberGroup.style.display !== 'none' && houseNumber.required) {
        if (!houseNumber.value) {
            showFormError(houseNumber, 'שדה חובה');
            isValid = false;
        }
    }
    
    // Validate Postal Code
    const postalCode = document.getElementById('postalCode');
    if (postalCode && !postalCode.value) {
        showFormError(postalCode, 'שדה חובה');
            isValid = false;
    } else if (postalCode && postalCode.value && !validatePostalCode(postalCode.value)) {
        showFormError(postalCode, 'מיקוד חייב להכיל 5-7 ספרות בלבד');
            isValid = false;
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
 * Initialize numeric inputs with mobile keyboard support
 * This function ensures that all numeric input fields in the insurance form:
 * 1. Display a numeric keyboard on mobile devices (inputmode="numeric")
 * 2. Only allow numeric input (filter out non-digits)
 * 3. Handle copy/paste correctly (extract only numbers)
 * 4. Preserve cursor position during input filtering
 * 5. Clear validation errors when user starts typing valid numbers
 */
function initializeNumericInputs() {
    console.log('🔢 Initializing numeric inputs with mobile keyboard support...');
    
    // List of all numeric input fields in the form
    const numericInputIds = [
        // Building section
        'insurance-amount',
        'building-age', 
        'building-area',
        'terrace-area',
        'garden-area',
        'earthquake-coverage-amount',
        'swimming-pool-value',
        'building-contents-insurance',
        'storage-insurance',
        'swimming-pool-insurance',
        
        // Contents section
        'contents-value',
        'contents-building-age',
        'jewelry-amount',
        'watches-amount',

        
        // General form fields
        'phone-number',
        'idNumber',
        'houseNumber',
        'postalCode',
        'floorCount'
    ];
    
    let initializedCount = 0;
    
    numericInputIds.forEach(inputId => {
        if (initializeSingleNumericInput(inputId)) {
            initializedCount++;
        }
    });
    
    // Also find and initialize any type="number" inputs that might have been missed
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        if (!input.hasAttribute('data-numeric-initialized')) {
            if (initializeSingleNumericInput(input)) {
                initializedCount++;
            }
        }
    });
    
    console.log(`🔢 Initialized ${initializedCount} numeric input fields with mobile keyboard support (${numericInputIds.length} from list + ${numberInputs.length - numericInputIds.length} auto-detected)`);
}

/**
 * Safe function to set selection range - works only on text inputs
 * @param {HTMLInputElement} input - Input element
 * @param {number} start - Start position
 * @param {number} end - End position
 */
function safeSetSelectionRange(input, start, end) {
    // Only try to set selection range on text-based inputs
    if (input.type === 'text' || input.type === 'search' || input.type === 'url' || 
        input.type === 'tel' || input.type === 'password') {
        try {
            input.setSelectionRange(start, end);
        } catch (e) {
            console.debug('setSelectionRange failed:', e.message);
        }
    }
    // For number inputs and others, do nothing - they don't support selection range
}

/**
 * Initialize a single numeric input field with mobile keyboard support
 * @param {string|HTMLElement} inputElement - Input element ID or element itself
 */
function initializeSingleNumericInput(inputElement) {
    const input = typeof inputElement === 'string' ? document.getElementById(inputElement) : inputElement;
    
    if (!input) {
        console.warn('⚠️ Numeric input element not found:', inputElement);
        return false;
    }
    
    // Skip if already initialized
    if (input.hasAttribute('data-numeric-initialized')) {
        return false;
    }
    
    // Set mobile keyboard to numeric
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('pattern', '[0-9]*');
    input.setAttribute('data-numeric-initialized', 'true');
    
    // Add input event listener to allow only numbers
    input.addEventListener('input', function(e) {
        // Store cursor position (safely handle all input types)
        let cursorPosition = null;
        try {
            cursorPosition = this.selectionStart;
        } catch (e) {
            // Some input types don't support selectionStart
            cursorPosition = null;
        }
        const originalLength = this.value.length;
        
        // Remove non-digits
        this.value = this.value.replace(/\D/g, '');
        
        // Restore cursor position only for text inputs (setSelectionRange doesn't work on number inputs)
        if (cursorPosition !== null) {
            const newLength = this.value.length;
            const lengthDiff = originalLength - newLength;
            const newCursorPosition = Math.max(0, cursorPosition - lengthDiff);
            safeSetSelectionRange(this, newCursorPosition, newCursorPosition);
        }
        
        // Clear validation errors when user starts typing
        if (this.value) {
            this.classList.remove('error');
            const errorMsg = this.closest('.form-group, .building-form-group')?.querySelector('.form-error-message, .error-message');
            if (errorMsg) {
                errorMsg.style.display = 'none';
                errorMsg.textContent = '';
            }
        }
    });
    
    // Prevent non-numeric key presses
    input.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter, arrows, home, end
        if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
            (e.ctrlKey === true && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1)) {
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    
    // Handle paste events
    input.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const numbersOnly = pastedData.replace(/\D/g, '');
        this.value = numbersOnly;
        
        // Trigger input event to validate
        this.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    console.log(`✅ Single numeric input initialized:`, input.id || input.name || 'unnamed input');
    return true;
}

/**
 * Add input event listeners for real-time validation
 */
function addFormInputListeners() {
    // First Name - real-time validation
    const firstName = document.getElementById('first-name');
    if (firstName) {
        firstName.addEventListener('input', function(e) {
            const value = this.value.trim();
            if (value.length >= 2) {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
        
        firstName.addEventListener('blur', function(e) {
            const value = this.value.trim();
            if (!value) {
                showFormError(this, 'שדה חובה - יש להזין שם פרטי');
            } else if (value.length < 2) {
                showFormError(this, 'שם פרטי חייב להכיל לפחות 2 תווים');
            }
        });
    }
    
    // Last Name - real-time validation
    const lastName = document.getElementById('last-name');
    if (lastName) {
        lastName.addEventListener('input', function(e) {
            const value = this.value.trim();
            if (value.length >= 2) {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
        
        lastName.addEventListener('blur', function(e) {
            const value = this.value.trim();
            if (!value) {
                showFormError(this, 'שדה חובה - יש להזין שם משפחה');
            } else if (value.length < 2) {
                showFormError(this, 'שם משפחה חייב להכיל לפחות 2 תווים');
            }
        });
    }
    
    // Email - real-time validation
    const email = document.getElementById('email');
    if (email) {
        email.addEventListener('input', function(e) {
            const value = this.value.trim();
            if (value && isValidEmail(value)) {
                this.classList.remove('error');
                this.classList.add('valid');
                const errorMsg = this.closest('.form-group').querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            } else if (value) {
                this.classList.add('error');
                this.classList.remove('valid');
            }
        });
        
        email.addEventListener('blur', function(e) {
            const value = this.value.trim();
            if (!value) {
                showFormError(this, 'שדה חובה - יש להזין כתובת אימייל');
            } else if (!isValidEmail(value)) {
                showFormError(this, 'כתובת אימייל אינה תקינה - יש להזין כתובת מייל חוקית');
            }
        });
    }
    
    // ID Number - allow only digits and limit to 9
    const idNumber = document.getElementById('idNumber');
    if (idNumber) {
        // Set mobile keyboard to numeric
        idNumber.setAttribute('inputmode', 'numeric');
        idNumber.setAttribute('pattern', '[0-9]*');
        
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
    
    // House Number - allow only digits
    const houseNumber = document.getElementById('houseNumber');
    if (houseNumber) {
        // Set mobile keyboard to numeric
        houseNumber.setAttribute('inputmode', 'numeric');
        houseNumber.setAttribute('pattern', '[0-9]*');
        
        houseNumber.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
        });

        houseNumber.addEventListener('blur', handleAddressBlur);
    }
    
    // Postal Code - allow only digits
    const postalCode = document.getElementById('postalCode');
    if (postalCode) {
        // Set mobile keyboard to numeric
        postalCode.setAttribute('inputmode', 'numeric');
        postalCode.setAttribute('pattern', '[0-9]*');
        
        postalCode.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 7 digits
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }
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

/**
 * Handle blur event on the house number field to verify the complete address.
 */
async function handleAddressBlur() {
    const houseNumberInput = document.getElementById('houseNumber');
    const houseNumberGroup = houseNumberInput ? houseNumberInput.closest('.form-group') : null;
    
    // Don't validate if house number field is hidden
    if (houseNumberGroup && houseNumberGroup.style.display === 'none') {
        console.log('[ADDRESS] House number field is hidden, skipping validation');
        return;
    }
    
    const house = houseNumberInput.value.trim();

    // Don't validate if empty
    if (!house) {
        console.log('[ADDRESS] Empty house number, skipping validation');
        return;
    }

    const city = document.getElementById('city').value;
    const street = document.getElementById('street').value.trim();

    console.log(`[ADDRESS] Validating address: ${street} ${house}, ${city}`);

    // We need all three components to validate
    if (!city || !street) {
        console.log('[ADDRESS] Missing city or street, skipping validation');
        return;
    }

    // Show some loading feedback
    houseNumberInput.style.borderColor = '#f39c12'; // Orange for loading

    try {
        console.log('[ADDRESS] Attempting to verify address with API');
        let result;
        
        try {
            // Check if we're running on Vercel (production/preview) or have API available
                    const isProduction = window.location.hostname.includes('admon-insurance-agency.co.il') ||
                        window.location.hostname.includes('vercel.app');
            
            if (isProduction) {
                // Call the real API
                const response = await fetch('/api/verifyAddress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        city: city,
                        street: street,
                        house: house
                    })
                });

                if (response.ok) {
                    result = await response.json();
                    console.log('[ADDRESS] API call successful:', result);
                } else {
                    throw new Error(`API returned ${response.status}`);
                }
            } else {
                throw new Error('Development mode - using mock');
            }
        } catch (apiError) {
            console.log('[ADDRESS] API call failed or not available, falling back to mock:', apiError.message);
            result = await mockAddressVerification(city, street, house);
        }

        console.log('[ADDRESS] Result:', result);
        
        // Log detailed validation information
        if (result.validation) {
            console.log('[ADDRESS] Detailed validation:');
            console.log('  - City matches:', result.validation.cityMatches);
            console.log('  - Street matches:', result.validation.streetMatches);
            console.log('  - House matches:', result.validation.houseMatches);
            console.log('  - House number found by Google:', result.validation.houseNumberFound);
            console.log('  - User entered:', result.validation.userHouseNumber);
            console.log('  - Google returned:', result.validation.googleHouseNumber);
            console.log('  - Location type:', result.locationType);
            console.log('  - Precise location:', result.validation.preciseLocation);
        }

        // Reset border color
        houseNumberInput.style.borderColor = '';

        if (!result.valid) {
            // Clear existing errors for this field before showing a new one
            clearFormError(houseNumberInput);
            
            // Show specific error message based on what failed
            let errorMessage = 'הכתובת שהוזנה אינה תקינה.';
            
            if (result.reason) {
                switch (result.reason) {
                    case 'City does not match':
                        errorMessage = 'העיר שנבחרה אינה תואמת לתוצאות החיפוש.';
                        break;
                    case 'Street does not match':
                        errorMessage = 'שם הרחוב אינו תואם לתוצאות החיפוש.';
                        break;
                    case 'House number does not match':
                        errorMessage = `מספר הבית ${house} אינו תואם למספר שנמצא בגוגל: ${result.validation?.googleHouseNumber || 'לא נמצא'}.`;
                        break;
                    case 'House number not found by Google':
                        errorMessage = `מספר הבית ${house} לא נמצא ברחוב ${street}. אנא בדוק שמספר הבית קיים.`;
                        break;
                    case 'Google could not find the exact house number - it may not exist':
                        errorMessage = `מספר הבית ${house} לא נמצא במדויק ברחוב ${street}. ייתכן שהמספר לא קיים.`;
                        break;
                    case 'Address not found with sufficient precision':
                        errorMessage = `מספר הבית ${house} לא נמצא במדויק. Google לא יכול לאמת את קיומו.`;
                        break;
                    case 'City not recognized':
                        errorMessage = 'העיר שנבחרה אינה מוכרת במערכת.';
                        break;
                    case 'Street name too short':
                        errorMessage = 'שם הרחוב קצר מדי או לא תקין.';
                        break;
                    case 'Invalid house number format or range':
                        errorMessage = 'מספר הבית אינו תקין. השתמש במספרים בין 1-999.';
                        break;
                    default:
                        errorMessage = result.reason;
                }
            }
            
            showFormError(houseNumberInput, errorMessage);
        } else {
            // Address is valid, clear any previous error
            clearFormError(houseNumberInput);
            console.log('[ADDRESS] Address is valid!');
            
            // Show success feedback briefly
            houseNumberInput.style.borderColor = '#28a745'; // Green for success
            setTimeout(() => {
                houseNumberInput.style.borderColor = '';
            }, 2000);
        }

    } catch (error) {
        console.error('Error verifying address:', error);
        // Reset border color on error
        houseNumberInput.style.borderColor = '';
        // Show a generic error message
        showFormError(houseNumberInput, 'שגיאה באימות הכתובת.');
    }
}

/**
 * Mock address verification for static site
 * @param {string} city - The city name
 * @param {string} street - The street name
 * @param {string} house - The house number
 * @returns {Promise<Object>} - Mock response
 */
async function mockAddressVerification(city, street, house) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Basic mock validation - check if we have reasonable inputs
    const normalizedCity = city.trim();
    const normalizedStreet = street.trim();
    const normalizedHouse = house.trim();
    
    // List of known Israeli cities for basic validation
    const knownCities = [
        'תל אביב', 'תל אביב - יפו', 'תל אביב יפו', 'ירושלים', 'חיפה', 'באר שבע',
        'פתח תקווה', 'ראשון לציון', 'אשדוד', 'נתניה', 'רמת גן', 'בני ברק',
        'הרצליה', 'כפר סבא', 'רעננה', 'הוד השרון', 'רחובות', 'מודיעין'
    ];
    
    // Basic validation rules - MORE STRICT
    const isCityValid = knownCities.some(knownCity => 
        knownCity.includes(normalizedCity) || normalizedCity.includes(knownCity)
    );
    
    const isStreetValid = normalizedStreet.length >= 2; // At least 2 characters
    
    // STRICT house number validation - must be valid format AND reasonable range
    const isHouseValid = /^\d+[א-ת]?$/.test(normalizedHouse) && 
                        parseInt(normalizedHouse) >= 1 && 
                        parseInt(normalizedHouse) <= 999;
    
    // ALL components must be valid for address to be valid
    const isValid = isCityValid && isStreetValid && isHouseValid;
    
    console.log(`[MOCK] Address validation - City: ${normalizedCity} (${isCityValid}), Street: ${normalizedStreet} (${isStreetValid}), House: ${normalizedHouse} (${isHouseValid}), Valid: ${isValid}`);
    
    // Mock detailed response similar to real API
    return {
        valid: isValid,
        address: isValid ? `${normalizedStreet} ${normalizedHouse}, ${normalizedCity}, ישראל` : null,
        similarity: {
            city: isCityValid ? 1 : 0,
            street: isStreetValid ? 1 : 0,
            house: isHouseValid ? 1 : 0
        },
        components: {
            city: isCityValid ? normalizedCity : null,
            street: isStreetValid ? normalizedStreet : null,
            house: isHouseValid ? normalizedHouse : null
        },
        validation: {
            cityMatches: isCityValid,
            streetMatches: isStreetValid,
            houseMatches: isHouseValid,
            houseNumberFound: isHouseValid,
            userHouseNumber: normalizedHouse,
            googleHouseNumber: isHouseValid ? normalizedHouse : null
        },
        ...((!isValid) && {
            reason: !isCityValid ? 'City not recognized' : 
                    !isStreetValid ? 'Street name too short' : 
                    !isHouseValid ? 'Invalid house number format or range' : 
                    'Unknown validation error'
        })
    };
}

// Add modal functions to the global app object (merged with main declaration above)

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
                let res;
                try {
                    res = await fetch(url);
                    if (!res.ok) throw new Error(`API error: ${res.status}`);
                } catch (fetchError) {
                    console.warn('[Cities API] Fetch failed:', fetchError.message);
                    throw new Error('Failed to load cities data');
                }
                
                let data;
                try {
                    data = await res.json();
                } catch (jsonError) {
                    console.warn('[Cities API] JSON parsing failed:', jsonError.message);
                    throw new Error('Invalid cities data received');
                }
                
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

                console.log(`🏘️ Found ${streets.length} streets for city: ${selectedCity}`);
                
                streetCache.set(selectedCity, streets);
                processStreets(streets);
            } catch (error) {
                console.error('Error fetching streets:', error);
                showError('שגיאה בטעינת רשימת הרחובות. נסה שוב מאוחר יותר.');
            }
        }

        function processStreets(streets) {
            // ========== ENHANCED VALIDATION FOR CITIES WITHOUT STREETS ==========
            // This function now handles cities that don't have registered streets
            // in the government database. When no streets are found, it automatically
            // hides the street and house number fields to improve user experience.
            // 
            // SPECIAL CASE: Some settlements return a single street with the same 
            // name as the city itself (e.g., "מושב אביגדור" has one street called
            // "אביגדור"). This indicates the settlement has no street division,
            // so we hide the street fields in this case too.
            // ====================================================================
            
            // Find house number field and its form group
            const houseNumberInput = document.getElementById('houseNumber');
            const houseNumberGroup = houseNumberInput ? houseNumberInput.closest('.form-group') : null;
            
            // Check if the only street has the same name as the city
            const hasOnlyStreetWithCityName = streets.length === 1 && 
                                               streets[0].trim().toLowerCase() === citySelect.value.trim().toLowerCase();
            
            if (streets.length > 0 && !hasOnlyStreetWithCityName) {
                // Has real streets - show street and house number fields
                streetInput.disabled = false;
                streetInput.placeholder = 'הקלד שם רחוב לחיפוש';
                
                // Show house number field
                if (houseNumberGroup) {
                    houseNumberGroup.style.display = 'block';
                    if (houseNumberInput) {
                        houseNumberInput.required = true;
                    }
                }
                
                // Show street field's parent group
                const streetGroup = streetInput.closest('.form-group');
                if (streetGroup) {
                    streetGroup.style.display = 'block';
                    streetInput.required = true;
                }
            } else {
                // No streets or only city-named street - hide street and house number fields
                if (hasOnlyStreetWithCityName) {
                    console.log(`🏘️ Only street found is same as city name "${citySelect.value}" - hiding street and house number fields`);
                } else {
                    console.log(`🏘️ No streets found for ${citySelect.value} - hiding street and house number fields`);
                }
                
                // Hide street field
                const streetGroup = streetInput.closest('.form-group');
                if (streetGroup) {
                    streetGroup.style.display = 'none';
                    streetInput.required = false;
                    streetInput.value = '';
                }
                
                // Hide house number field
                if (houseNumberGroup) {
                    houseNumberGroup.style.display = 'none';
                    if (houseNumberInput) {
                        houseNumberInput.required = false;
                        houseNumberInput.value = '';
                    }
                }
                
                // Show a friendly message based on the situation
                const messageText = hasOnlyStreetWithCityName 
                    ? `ביישוב "${citySelect.value}" אין חלוקה לרחובות. השדות "רחוב" ו"מספר בית" הוסתרו אוטומטית.`
                    : `ביישוב "${citySelect.value}" אין רחובות רשומים במערכת. השדות "רחוב" ו"מספר בית" הוסתרו אוטומטית.`;
                
                errorMsg.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">ℹ️</span>
                        <span>${messageText}</span>
                    </div>
                `;
                errorMsg.style.display = 'block';
                errorMsg.style.color = '#17a2b8'; // Info color instead of error color
                errorMsg.style.backgroundColor = '#d1ecf1';
                errorMsg.style.border = '1px solid #bee5eb';
                errorMsg.style.borderRadius = '4px';
                errorMsg.style.padding = '10px';
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
            errorMsg.style.color = ''; // Reset color to default
            errorMsg.style.backgroundColor = ''; // Reset background
            errorMsg.style.border = ''; // Reset border
            errorMsg.style.borderRadius = ''; // Reset border radius
            errorMsg.style.padding = ''; // Reset padding
            errorMsg.innerHTML = ''; // Clear content
            dropdown.style.display = 'none';
            
            // Reset visibility of street and house number fields to default (visible)
            const streetGroup = streetInput.closest('.form-group');
            if (streetGroup) {
                streetGroup.style.display = 'block';
                streetInput.required = true;
            }
            
            const houseNumberInput = document.getElementById('houseNumber');
            const houseNumberGroup = houseNumberInput ? houseNumberInput.closest('.form-group') : null;
            if (houseNumberGroup) {
                houseNumberGroup.style.display = 'block';
                if (houseNumberInput) {
                    houseNumberInput.required = true;
                }
            }
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

/**
 * Clear a single form error
 * @param {HTMLElement} field - The form field to clear errors for
 */
function clearFormError(field) {
     field.classList.remove('error');
     const formGroup = field.closest('.form-group');
     if (formGroup) {
        const existingError = formGroup.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
     }
}



/**
 * Comprehensive test function to validate all conditional logic
 * This function can be called from browser console for testing
 */
function testConditionalLogic() {
    console.log('=== Testing Conditional Logic ===');
    
    const productTypeSelect = document.getElementById('productType');
    const propertyTypeSelect = document.getElementById('propertyType');
    
    if (!productTypeSelect || !propertyTypeSelect) {
        console.error('Cannot find required select elements');
        return;
    }
    
    // Test מבנה בלבד משועבד לבנק
    console.log('\n--- Testing מבנה בלבד משועבד לבנק ---');
    productTypeSelect.value = 'מבנה בלבד משועבד לבנק';
    productTypeSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        const tests = [
            // Building section tests
            { 
                element: document.getElementById('building-age').closest('.building-form-group'), 
                expected: 'none',
                description: 'Building age field should be hidden'
            },
            { 
                element: document.getElementById('mortgaged-property'), 
                expected: true,
                property: 'checked',
                description: 'Mortgaged checkbox should be checked'
            },
            { 
                element: document.getElementById('mortgaged-property'), 
                expected: true,
                property: 'disabled',
                description: 'Mortgaged checkbox should be disabled'
            },
            { 
                element: document.getElementById('loanEndDate-group'), 
                expected: 'block',
                description: 'Renewals dropdown should be visible'
            },
            
            // Additional coverages tests
            { 
                element: document.getElementById('water-damage-type'), 
                expected: 'שרברב שבהסדר',
                property: 'value',
                description: 'Water damage should be auto-selected'
            },
            { 
                element: document.getElementById('water-damage-type'), 
                expected: true,
                property: 'disabled',
                description: 'Water damage dropdown should be disabled'
            },
            { 
                element: document.getElementById('water-deductible-group'), 
                expected: 'none',
                description: 'Water deductible field should be hidden'
            },
            { 
                element: document.getElementById('mortgage-water-damage-group'), 
                expected: 'block',
                description: 'Mortgage water damage field should be visible'
            },
            { 
                element: document.getElementById('mortgage-water-damage'), 
                expected: true,
                property: 'disabled',
                description: 'Mortgage water damage should be disabled'
            },
            { 
                element: document.getElementById('burglary-building'), 
                expected: true,
                property: 'checked',
                description: 'Burglary checkbox should be checked'
            },
            { 
                element: document.getElementById('burglary-building'), 
                expected: true,
                property: 'disabled',
                description: 'Burglary checkbox should be disabled'
            },
            { 
                element: document.getElementById('earthquake-coverage'), 
                expected: 'כן',
                property: 'value',
                description: 'Earthquake coverage should be auto-selected'
            },
            { 
                element: document.getElementById('earthquake-coverage'), 
                expected: true,
                property: 'disabled',
                description: 'Earthquake dropdown should be disabled'
            },
            
            // Building extensions tests
            { 
                element: document.getElementById('boilers-group'), 
                expected: 'none',
                description: 'Boilers checkbox should be completely hidden'
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        tests.forEach(test => {
            if (!test.element) {
                console.error(`❌ ${test.description}: Element not found`);
                failed++;
                return;
            }
            
            let actual;
            if (test.property) {
                actual = test.element[test.property];
            } else {
                actual = window.getComputedStyle(test.element).display;
            }
            
            if (actual === test.expected) {
                console.log(`✅ ${test.description}: PASS`);
                passed++;
            } else {
                console.error(`❌ ${test.description}: FAIL - Expected: ${test.expected}, Actual: ${actual}`);
                failed++;
            }
        });
        
        console.log(`\n--- Test Results ---`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Total: ${passed + failed}`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️ Some tests failed. Please check the implementation.');
        }
    }, 500); // Wait for all updates to complete
}

// Make test function available globally for console access
window.testConditionalLogic = testConditionalLogic;

/**
 * Log initialization summary to console
 */
function logInitializationSummary() {
    const productType = document.getElementById('productType')?.value || 'None';
    const propertyType = document.getElementById('propertyType')?.value || 'None';
    
    console.log('=== Building Form Initialization Summary ===');
    console.log(`Product Type: ${productType}`);
    console.log(`Property Type: ${propertyType}`);
    
    if (productType === 'מבנה בלבד משועבד לבנק') {
        console.log('🔒 Special conditions active for "מבנה בלבד משועבד לבנק":');
        console.log('  - Building age field: HIDDEN');
        console.log('  - Mortgaged checkbox: AUTO-CHECKED & DISABLED');
        console.log('  - Renewals dropdown: VISIBLE');
        console.log('  - Water damage: AUTO-SELECTED & DISABLED');
        console.log('  - Regular water deductible: HIDDEN');
        console.log('  - Mortgage water damage: VISIBLE & DISABLED');
        console.log('  - Burglary checkbox: AUTO-CHECKED & DISABLED');
        console.log('  - Earthquake coverage: AUTO-SELECTED & DISABLED');
        console.log('  - Boilers checkbox: COMPLETELY HIDDEN');
    }
    
    if (propertyType === 'פרטי') {
        console.log('🏠 Storage field visible for private property');
    } else if (propertyType && propertyType !== 'פרטי') {
        console.log('🏢 Storage field hidden for non-private property');
    }
    
    console.log('Use window.testConditionalLogic() to run comprehensive tests');
}

/**
 * Validate building section fields
 * @returns {boolean} - True if all visible required fields are valid
 */
function validateBuildingSection() {
    let isValid = true;
    
    // Get product type to determine which fields to validate
    const productType = document.getElementById('productType').value;
    
    // If product type is תכולה בלבד, skip building validation
    if (productType === 'תכולה בלבד') {
        return true;
    }
    
    // Building age
    const buildingAge = document.getElementById('building-age');
    if (buildingAge && buildingAge.required && !buildingAge.value) {
        showBuildingFormError(buildingAge, 'אנא הזן גיל מבנה תקין');
        isValid = false;
    }
    
    // Building area
    const buildingArea = document.getElementById('building-area');
    if (buildingArea && buildingArea.required && !buildingArea.value) {
        showBuildingFormError(buildingArea, 'אנא הזן שטח מבנה תקין');
        isValid = false;
    }
    
    // Construction type
    const constructionType = document.getElementById('construction-type');
    if (constructionType && constructionType.required && !constructionType.value) {
        showBuildingFormError(constructionType, 'אנא בחר סוג בניה');
        isValid = false;
    }
    
    // Validate terrace area if terrace is selected
    const hasTerrace = document.getElementById('has-terrace');
    const terraceArea = document.getElementById('terrace-area');
    const terraceAreaGroup = document.getElementById('terrace-area-group');
    if (hasTerrace && hasTerrace.value === 'כן' && terraceAreaGroup && terraceAreaGroup.style.display !== 'none' && !terraceArea.value) {
        showBuildingFormError(terraceArea, 'אנא הזן שטח מרפסת תקין');
        isValid = false;
    }
    
    // Validate garden area if garden is selected
    const hasGarden = document.getElementById('has-garden');
    const gardenArea = document.getElementById('garden-area');
    const gardenAreaGroup = document.getElementById('garden-area-group');
    if (hasGarden && hasGarden.value === 'כן' && gardenAreaGroup && gardenAreaGroup.style.display !== 'none' && !gardenArea.value) {
        showBuildingFormError(gardenArea, 'אנא הזן שטח גינה תקין');
        isValid = false;
    }
    
    // Validate roof type if visible
    const roofType = document.getElementById('roof-type');
    const roofTypeGroup = document.getElementById('roof-type-group');
    if (roofTypeGroup && roofTypeGroup.style.display !== 'none' && !roofType.value) {
        showBuildingFormError(roofType, 'אנא בחר סוג גג');
        isValid = false;
    }
    
    // Validate loan end date if mortgaged property is checked
    const mortgagedProperty = document.getElementById('mortgaged-property');
    const loanEndDate = document.getElementById('loan-end-date');
    const loanEndDateGroup = document.getElementById('loan-end-date-group');
    if (mortgagedProperty && mortgagedProperty.checked && loanEndDateGroup && loanEndDateGroup.style.display !== 'none' && !loanEndDate.value) {
        showBuildingFormError(loanEndDate, 'אנא בחר תאריך תום הלוואה');
        isValid = false;
    }
    
    // Validate mortgage bank if visible
    const mortgageBankGroup = document.getElementById('mortgage-bank-group');
    const mortgageBankInput = document.getElementById('mortgage-bank');
    if (mortgageBankGroup && mortgageBankGroup.style.display !== 'none' && mortgageBankInput && mortgageBankInput.required) {
        if (!mortgageBankInput.value.trim()) {
            isValid = false;
            showBuildingFormError(mortgageBankInput, 'אנא בחר בנק');
        }
    }
    
    // Validate mortgage branch if visible
    const mortgageBranchGroup = document.getElementById('mortgage-branch-group');
    const mortgageBranchInput = document.getElementById('mortgage-branch');
    if (mortgageBranchGroup && mortgageBranchGroup.style.display !== 'none' && mortgageBranchInput && mortgageBranchInput.required) {
        if (!mortgageBranchInput.value.trim()) {
            isValid = false;
            showBuildingFormError(mortgageBranchInput, 'אנא בחר סניף');
        }
    }
    
    // Water damage type
    const waterDamageType = document.getElementById('water-damage-type');
    if (waterDamageType && waterDamageType.required && !waterDamageType.value) {
        showBuildingFormError(waterDamageType, 'אנא בחר אפשרות כיסוי נזקי צנרת');
        isValid = false;
    }
    
    // Earthquake coverage
    const earthquakeCoverage = document.getElementById('earthquake-coverage');
    if (earthquakeCoverage && earthquakeCoverage.required && !earthquakeCoverage.value) {
        showBuildingFormError(earthquakeCoverage, 'אנא בחר אפשרות כיסוי רעידת אדמה');
        isValid = false;
    }
    
    // Validate earthquake coverage amount if land coverage is selected
    const earthquakeLandCoverage = document.getElementById('earthquake-land-coverage');
    const earthquakeCoverageAmount = document.getElementById('earthquake-coverage-amount');
    const earthquakeCoverageAmountGroup = document.getElementById('earthquake-coverage-amount-group');
    if (earthquakeLandCoverage && earthquakeLandCoverage.value === 'כן' && 
        earthquakeCoverageAmountGroup && earthquakeCoverageAmountGroup.style.display !== 'none' && !earthquakeCoverageAmount.value) {
        showBuildingFormError(earthquakeCoverageAmount, 'אנא הזן סכום כיסוי תקין');
        isValid = false;
    }
    
    // Validate swimming pool value if pool is checked
    const hasSwimmingPool = document.getElementById('has-swimming-pool');
    const swimmingPoolValue = document.getElementById('swimming-pool-value');
    const swimmingPoolValueGroup = document.getElementById('swimming-pool-value-group');
    if (hasSwimmingPool && hasSwimmingPool.checked && swimmingPoolValueGroup && swimmingPoolValueGroup.style.display !== 'none' && !swimmingPoolValue.value) {
        showBuildingFormError(swimmingPoolValue, 'אנא הזן שווי בריכה תקין');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show error message for a building form field
 * @param {HTMLElement} field - The form field element
 * @param {string} message - The error message to display
 */
function showBuildingFormError(field, message) {
    // Add error class to field
    field.classList.add('error');
    
    // Look for error message span
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
}

/**
 * Clear all building form errors
 */
function clearBuildingFormErrors() {
    // Find all error fields in building sections
    const buildingContainer = document.querySelector('#step-cover-structure');
    
    if (buildingContainer) {
        // Remove error classes from fields
        const errorFields = buildingContainer.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // Hide all error messages
        const errorMessages = buildingContainer.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.style.display = 'none';
            message.textContent = '';
        });
    }
}

/**
 * Add input event listeners for building form validation
 */
function addBuildingFormListeners() {
    // Add listeners to all building form fields
    const buildingSections = document.querySelectorAll('.building-section');
    
    buildingSections.forEach(section => {
        // Add listeners to input fields
        const inputFields = section.querySelectorAll('input[type="number"], input[type="text"]');
        inputFields.forEach(field => {
            field.addEventListener('input', function() {
                if (this.value) {
                    this.classList.remove('error');
                    const errorMsg = this.closest('.building-form-group')?.querySelector('.form-error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
        
        // Add listeners to select fields
        const selectFields = section.querySelectorAll('select');
        selectFields.forEach(field => {
            field.addEventListener('change', function() {
                if (this.value) {
                    this.classList.remove('error');
                    const errorMsg = this.closest('.building-form-group')?.querySelector('.form-error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
    });
}

// Call the building form listeners when modal opens
// Add this to the openModal function or initialization
if (typeof window.addBuildingFormListeners === 'undefined') {
    window.addBuildingFormListeners = addBuildingFormListeners;
}

/**
 * Initialize contents section conditional fields
 */
function initializeContentsFields() {
    // Product type from general details
    const productTypeSelect = document.getElementById('productType');
    
    // Contents section fields
    const contentsBuilingAgeGroup = document.getElementById('contents-building-age-group');
    const hasJewelrySelect = document.getElementById('has-jewelry');
    const jewelryAmountGroup = document.getElementById('jewelry-amount-group');
    const hasWatchesSelect = document.getElementById('has-watches');
    const watchesAmountGroup = document.getElementById('watches-amount-group');
    
    // Update contents fields based on product type
    updateContentsFieldsForProductType();
    
    // Jewelry dropdown change handler
    if (hasJewelrySelect) {
        hasJewelrySelect.addEventListener('change', function() {
            updateJewelryAmountField(this.value);
        });
    }
    
    // Watches dropdown change handler
    if (hasWatchesSelect) {
        hasWatchesSelect.addEventListener('change', function() {
            updateWatchesAmountField(this.value);
        });
    }
}

/**
 * Update contents fields based on product type
 */
function updateContentsFieldsForProductType() {
    const productType = document.getElementById('productType')?.value;
    const contentsBuilingAgeGroup = document.getElementById('contents-building-age-group');
    const contentsBuilingAgeInput = document.getElementById('contents-building-age');
    
    if (productType === 'תכולה בלבד') {
        // Show building age field for contents only
        if (contentsBuilingAgeGroup) {
            contentsBuilingAgeGroup.style.display = 'block';
            if (contentsBuilingAgeInput) {
                contentsBuilingAgeInput.required = true;
            }
        }
    } else {
        // Hide building age field
        if (contentsBuilingAgeGroup) {
            contentsBuilingAgeGroup.style.display = 'none';
            if (contentsBuilingAgeInput) {
                contentsBuilingAgeInput.required = false;
                contentsBuilingAgeInput.value = '';
            }
        }
    }
}



/**
 * Update jewelry amount field based on jewelry selection
 * @param {string} selection - The jewelry selection value (כן/לא)
 */
function updateJewelryAmountField(selection) {
    const jewelryAmountGroup = document.getElementById('jewelry-amount-group');
    const jewelryAmountInput = document.getElementById('jewelry-amount');
    
    if (selection === 'כן') {
        // Show jewelry amount field
        if (jewelryAmountGroup) {
            jewelryAmountGroup.style.display = 'block';
            if (jewelryAmountInput) {
                jewelryAmountInput.required = true;
            }
        }
    } else {
        // Hide jewelry amount field
        if (jewelryAmountGroup) {
            jewelryAmountGroup.style.display = 'none';
            if (jewelryAmountInput) {
                jewelryAmountInput.required = false;
                jewelryAmountInput.value = '';
            }
        }
    }
}

/**
 * Update watches amount field based on watches selection
 * @param {string} selection - The watches selection value (כן/לא)
 */
function updateWatchesAmountField(selection) {
    const watchesAmountGroup = document.getElementById('watches-amount-group');
    const watchesAmountInput = document.getElementById('watches-amount');
    
    if (selection === 'כן') {
        // Show watches amount field
        if (watchesAmountGroup) {
            watchesAmountGroup.style.display = 'block';
            if (watchesAmountInput) {
                watchesAmountInput.required = true;
            }
        }
    } else {
        // Hide watches amount field
        if (watchesAmountGroup) {
            watchesAmountGroup.style.display = 'none';
            if (watchesAmountInput) {
                watchesAmountInput.required = false;
                watchesAmountInput.value = '';
            }
        }
    }
}


/**
 * Validate contents section fields
 * @returns {boolean} - True if all visible required fields are valid
 */
function validateContentsSection() {
    let isValid = true;
    
    // Get product type to determine which fields to validate
    const productType = document.getElementById('productType').value;
    
    // If product type is מבנה בלבד or מבנה בלבד משועבד לבנק, skip contents validation
    if (productType === 'מבנה בלבד' || productType === 'מבנה בלבד משועבד לבנק') {
        return true;
    }
    
    // Contents value
    const contentsValue = document.getElementById('contents-value');
    if (contentsValue && contentsValue.required && !contentsValue.value) {
        showContentsFormError(contentsValue, 'אנא בחר שווי תכולה');
        isValid = false;
    }
    
    // Building age (only if visible)
    const contentsBuildingAge = document.getElementById('contents-building-age');
    const contentsBuildingAgeGroup = document.getElementById('contents-building-age-group');
    if (contentsBuildingAgeGroup && contentsBuildingAgeGroup.style.display !== 'none' && !contentsBuildingAge.value) {
        showContentsFormError(contentsBuildingAge, 'אנא הזן גיל מבנה תקין');
        isValid = false;
    }
    
    // Jewelry amount (only if jewelry is selected)
    const hasJewelry = document.getElementById('has-jewelry');
    const jewelryAmount = document.getElementById('jewelry-amount');
    const jewelryAmountGroup = document.getElementById('jewelry-amount-group');
    if (hasJewelry && hasJewelry.value === 'כן' && jewelryAmountGroup && jewelryAmountGroup.style.display !== 'none' && !jewelryAmount.value) {
        showContentsFormError(jewelryAmount, 'אנא הזן שווי תכשיטים תקין');
        isValid = false;
    }
    
    // Watches amount (only if watches is selected)
    const hasWatches = document.getElementById('has-watches');
    const watchesAmount = document.getElementById('watches-amount');
    const watchesAmountGroup = document.getElementById('watches-amount-group');
    if (hasWatches && hasWatches.value === 'כן' && watchesAmountGroup && watchesAmountGroup.style.display !== 'none' && !watchesAmount.value) {
        showContentsFormError(watchesAmount, 'אנא הזן שווי שעונים תקין');
        isValid = false;
    }
    
    // Earthquake coverage for contents
    const contentsEarthquakeCoverage = document.getElementById('contents-earthquake-coverage');
    if (contentsEarthquakeCoverage && contentsEarthquakeCoverage.required && !contentsEarthquakeCoverage.value) {
        showContentsFormError(contentsEarthquakeCoverage, 'אנא בחר אפשרות כיסוי');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show error message for a contents form field
 * @param {HTMLElement} field - The form field element
 * @param {string} message - The error message to display
 */
function showContentsFormError(field, message) {
    // Add error class to field
    field.classList.add('error');
    
    // Look for error message span
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
}

/**
 * Clear all contents form errors
 */
function clearContentsFormErrors() {
    // Find all error fields in contents sections
    const contentsContainer = document.querySelector('#step-cover-contents');
    
    if (contentsContainer) {
        // Remove error classes from fields
        const errorFields = contentsContainer.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // Hide all error messages
        const errorMessages = contentsContainer.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.style.display = 'none';
            message.textContent = '';
        });
    }
}

/**
 * Add input event listeners for contents form validation
 */
function addContentsFormListeners() {
    // Add listeners to all contents form fields
    const contentsSections = document.querySelectorAll('#step-cover-contents .building-section');
    
    contentsSections.forEach(section => {
        // Add listeners to input fields
        const inputFields = section.querySelectorAll('input[type="number"]');
        inputFields.forEach(field => {
            field.addEventListener('input', function() {
                if (this.value) {
                    this.classList.remove('error');
                    const errorMsg = this.closest('.building-form-group')?.querySelector('.form-error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
        
        // Add listeners to select fields
        const selectFields = section.querySelectorAll('select');
        selectFields.forEach(field => {
            field.addEventListener('change', function() {
                if (this.value) {
                    this.classList.remove('error');
                    const errorMsg = this.closest('.building-form-group')?.querySelector('.form-error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
    });
}

// Make functions available globally
if (typeof window.initializeContentsFields === 'undefined') {
    window.initializeContentsFields = initializeContentsFields;
}
if (typeof window.addContentsFormListeners === 'undefined') {
    window.addContentsFormListeners = addContentsFormListeners;
}

/**
 * Initialize statistics counter animation
 */
function initializeStatsCounter() {
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    if (statsNumbers.length === 0) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const countUp = (element, target) => {
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString('he-IL');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('he-IL');
            }
        };
        
        updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                entry.target.setAttribute('data-counted', 'true');
                countUp(entry.target, target);
            }
        });
    }, observerOptions);
    
    statsNumbers.forEach(number => {
        observer.observe(number);
    });
}

// Initialize page functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize FAQ accordion
    initializeFAQ();
    
    // Initialize stats counter animation
    initializeStatsCounter();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize existing modal functionality
    const ctaButton = document.getElementById('getQuoteBtn');
    const modal = document.getElementById('generalDetailsModal');
    
    // Function to open modal
    // Duplicate openModal function removed - using the primary one above
    
    // Add event listener to CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
});

/**
 * Initialize Mobile Menu
 */
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuToggle && navMenu) {
        // Toggle menu on button click
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

/**
 * Initialize Smooth Scrolling
 */
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize FAQ Accordion
 */
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

/**
 * Initialize Stats Counter Animation
 */
function initializeStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    const animateNumbers = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateNumber = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateNumber();
        });
    };
    
    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateNumbers();
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

/**
 * Initialize Scroll Animations
 */
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .coverage-card, .process-step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Additional Coverage Section Functions
function validateAdditionalCoverageSection() {
    let isValid = true;
    
    // No mandatory fields in additional coverage section - all are optional
    console.log('Additional coverage section validation passed');
    
    return isValid;
}

function showAdditionalCoverageFormError(field, message) {
    // Remove any existing error
    clearAdditionalCoverageFormError(field);
    
    // Add error class to field
    field.classList.add('error');
    field.setAttribute('aria-describedby', field.id + '-error');
    
    // Create and add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.id = field.id + '-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Add validation state classes for visual feedback
    field.parentNode.classList.add('error-state');
    field.parentNode.classList.remove('success-state');
    
    // Focus the field
    field.focus();
    
    // Scroll to field if needed
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearAdditionalCoverageFormError(field) {
    // Remove error class and attributes
    field.classList.remove('error');
    field.removeAttribute('aria-describedby');
    
    // Remove error message
    const errorMessage = document.getElementById(field.id + '-error');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Remove validation state classes
    field.parentNode.classList.remove('error-state');
}

function clearAdditionalCoverageFormErrors() {
    const additionalCoverageSection = document.getElementById('step-cover-additional');
    if (!additionalCoverageSection) return;
    
    // Clear all field errors
    const fields = additionalCoverageSection.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        clearAdditionalCoverageFormError(field);
    });
    
    console.log('Additional coverage form errors cleared');
}

function addAdditionalCoverageFormListeners() {
    const additionalCoverageSection = document.getElementById('step-cover-additional');
    if (!additionalCoverageSection) return;
    
    // Add change/input listeners to all form fields
    const fields = additionalCoverageSection.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        // Add both input and change events for different field types
        ['input', 'change', 'blur'].forEach(eventType => {
            field.addEventListener(eventType, () => {
                // Clear error state when user starts typing/changing
                if (field.classList.contains('error')) {
                    clearAdditionalCoverageFormError(field);
                }
                
                // Remove success state classes for additional coverage fields
                field.parentNode.classList.remove('success-state');
            });
        });
    });
    
    console.log('Additional coverage form listeners added');
}

// Enhanced phone validation function with detailed error messages
function validateIsraeliPhone(phoneNumber) {
    // Clean the phone number - remove all non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Check if empty
    if (!cleanPhone) {
        return {
            isValid: false,
            error: 'מספר טלפון נייד נדרש',
            formatted: ''
        };
    }
    
    // Check if it's too short
    if (cleanPhone.length < 10) {
        return {
            isValid: false,
            error: `מספר הטלפון חייב להכיל 10 ספרות (יש רק ${cleanPhone.length})`,
            formatted: cleanPhone
        };
    }
    
    // Check if it's too long
    if (cleanPhone.length > 10) {
        return {
            isValid: false,
            error: `מספר הטלפון חייב להכיל 10 ספרות (יש ${cleanPhone.length})`,
            formatted: cleanPhone
        };
    }
    
    // Check if it starts with 05
    if (!cleanPhone.startsWith('05')) {
        return {
            isValid: false,
            error: 'מספר טלפון נייד חייב להתחיל ב-05',
            formatted: cleanPhone
        };
    }
    
    // Define valid Israeli mobile patterns
    const mobilePatterns = [
        /^050\d{7}$/, // Partner/Orange
        /^051\d{7}$/, // Golan
        /^052\d{7}$/, // Cellcom
        /^053\d{7}$/, // Hot Mobile/Pelephone
        /^054\d{7}$/, // Partner
        /^055\d{7}$/, // Hot Mobile
        /^058\d{7}$/, // Golan/MVNO
        /^059\d{7}$/  // Various MVNO
    ];
    
    // Check if it matches any valid mobile pattern
    const isValidMobile = mobilePatterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValidMobile) {
        return {
            isValid: false,
            error: 'מספר הטלפון אינו תקין. מספרי נייד תקינים: 050, 051, 052, 053, 054, 055, 058, 059',
            formatted: cleanPhone
        };
    }
    
    // Format the phone number for display
    const formatted = cleanPhone.replace(/(\d{3})(\d{7})/, '$1-$2');
    
    return {
        isValid: true,
        error: null,
        formatted: formatted
    };
}

// Format phone number for display
function formatPhoneNumber(value) {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 10) {
        return cleanValue.replace(/(\d{3})(\d{1,7})/, '$1-$2');
    }
    return cleanValue.slice(0, 10).replace(/(\d{3})(\d{7})/, '$1-$2');
}

// Show phone validation message
function showPhoneMessage(type, message) {
    const phoneInput = document.getElementById('phone-number');
    if (!phoneInput) {
        return;
    }
    
    const phoneGroup = phoneInput.closest('.building-form-group');
    if (!phoneGroup) {
        return;
    }
    
    // Clear any existing messages
    clearPhoneMessage();
    
    // Create message element
    const messageDiv = document.createElement('div');
    if (type === 'error') {
        messageDiv.className = 'phone-error-message';
        messageDiv.innerHTML = `<span class="error-icon">❌</span><span>${message}</span>`;
        phoneInput.classList.add('error');
        phoneInput.classList.remove('valid');
    } else if (type === 'success') {
        messageDiv.className = 'phone-success-message';
        messageDiv.innerHTML = `<span class="success-icon">✅</span><span>מספר טלפון נייד תקין</span>`;
        phoneInput.classList.add('valid');
        phoneInput.classList.remove('error');
    }
    
    // Try to insert after phone-input-container first
    const phoneContainer = phoneInput.closest('.phone-input-container');
    if (phoneContainer && phoneContainer.parentNode) {
        phoneContainer.parentNode.insertBefore(messageDiv, phoneContainer.nextSibling);
    } else {
        // Fallback to appending to form group
        phoneGroup.appendChild(messageDiv);
    }
    
    // Phone message shown
}

// Clear phone validation message
function clearPhoneMessage() {
    const phoneInput = document.getElementById('phone-number');
    if (!phoneInput) {
        return;
    }
    
    const phoneGroup = phoneInput.closest('.building-form-group');
    if (!phoneGroup) {
        return;
    }
    
    // Remove existing message
    const existingMessage = phoneGroup.querySelector('.phone-error-message, .phone-success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Reset input classes
    phoneInput.classList.remove('error', 'valid');
}

// Real-time phone validation and formatting
function handlePhoneInput(event) {
    const input = event.target;
    let value = input.value;
    
    // handlePhoneInput called
    
    // Filter input - only allow digits, spaces, dashes, and plus
    const filteredValue = value.replace(/[^\d\s\-+]/g, '');
    
    // Remove any non-digit characters for validation
    const digitsOnly = filteredValue.replace(/\D/g, '');
    
    // Limit to 10 digits maximum
    const limitedDigits = digitsOnly.slice(0, 10);
    
    // Format the display value
    const formattedValue = formatPhoneNumber(limitedDigits);
    
    // Update input value if it changed
    if (input.value !== formattedValue) {
        input.value = formattedValue;
    }
    
    // Validate the phone number
    const validation = validateIsraeliPhone(limitedDigits);
    
    // Validation result
    
    if (limitedDigits === '') {
        // Empty field - clear validation
        clearPhoneMessage();
    } else if (validation.isValid) {
        // Valid phone number
        showPhoneMessage('success', 'מספר טלפון נייד תקין');
    } else {
        // Invalid phone number
        showPhoneMessage('error', validation.error);
    }
    
    // Update send button state
    updateSendButtonState();
}

// Handle phone input blur (when user leaves the field)
function handlePhoneBlur(event) {
    const input = event.target;
    const value = input.value.replace(/\D/g, '');
    
    if (value && value.length > 0) {
        const validation = validateIsraeliPhone(value);
        if (validation.isValid) {
            showPhoneMessage('success', 'מספר טלפון נייד תקין');
        } else {
            showPhoneMessage('error', validation.error);
        }
    }
    
    updateSendButtonState();
}

// Handle paste events for phone input
function handlePhonePaste(event) {
    // Allow the paste to happen, then process it
    setTimeout(() => {
        handlePhoneInput(event);
    }, 10);
}

// Update send button state based on phone validation
function updateSendButtonState() {
    const phoneInput = document.getElementById('phone-number');
    const sendButton = document.getElementById('send-code-btn');
    
    if (!phoneInput || !sendButton) return;
    
    const phoneValue = phoneInput.value.replace(/\D/g, '');
    const validation = validateIsraeliPhone(phoneValue);
    
    if (validation.isValid) {
        sendButton.disabled = false;
        sendButton.classList.remove('disabled');
    } else {
        sendButton.disabled = true;
        sendButton.classList.add('disabled');
    }
}

// Initialize phone validation with enhanced real-time feedback
function initializePhoneValidation() {
    const phoneInput = document.getElementById('phone-number');
    
    if (phoneInput) {
        // Clear any existing event listeners by cloning the element
        const newPhoneInput = phoneInput.cloneNode(true);
        phoneInput.parentNode.replaceChild(newPhoneInput, phoneInput);
        
        // Set mobile keyboard to numeric (if not already set)
        if (!newPhoneInput.hasAttribute('inputmode')) {
            newPhoneInput.setAttribute('inputmode', 'numeric');
            newPhoneInput.setAttribute('pattern', '[0-9]*');
        }
        
        // Add event listeners for real-time validation
        newPhoneInput.addEventListener('input', handlePhoneInput);
        newPhoneInput.addEventListener('blur', handlePhoneBlur);
        newPhoneInput.addEventListener('paste', handlePhonePaste);
        newPhoneInput.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
        
        // Set initial state
        updateSendButtonState();
        
        // If there's already a value, validate it
        if (newPhoneInput.value) {
            handlePhoneInput({ target: newPhoneInput });
        }
        
        // Enhanced phone validation initialized with real-time feedback
    }
}

// Initialize additional coverage section enhancements
function initializeAdditionalCoverageEnhancements() {
    const additionalCoverageSection = document.getElementById('step-cover-additional');
    if (!additionalCoverageSection) return;
    
    // Add hover effects to coverage explanation boxes - optimized for performance
    const explanationBoxes = additionalCoverageSection.querySelectorAll('.coverage-explanation');
    explanationBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.borderColor = '#4f46e5';
            this.style.transition = 'border-color 0.2s ease';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
    
    // Enhanced checkbox interactions - performance optimized
    const checkboxWrappers = additionalCoverageSection.querySelectorAll('.building-checkbox-wrapper');
    checkboxWrappers.forEach(wrapper => {
        const checkbox = wrapper.querySelector('input[type="checkbox"]');
        const label = wrapper.querySelector('label');
        
        if (checkbox && label) {
            // Subtle click feedback without GPU-intensive animations
            wrapper.addEventListener('click', function() {
                this.style.backgroundColor = '#f0f9ff';
                setTimeout(() => {
                    this.style.backgroundColor = '';
                }, 200);
            });
            
            // Optimized hover states
            wrapper.addEventListener('mouseenter', function() {
                if (!checkbox.checked) {
                    this.style.borderColor = '#6366f1';
                    this.style.transition = 'border-color 0.2s ease';
                }
            });
            
            wrapper.addEventListener('mouseleave', function() {
                if (!checkbox.checked) {
                    this.style.borderColor = '';
                }
            });
        }
    });
    
    // Optimized number input interactions
    const numberInputs = additionalCoverageSection.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4f46e5';
            this.style.transition = 'border-color 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '';
        });
    });
    
    // Optimized section navigation - smooth scroll only
    const sectionTitles = additionalCoverageSection.querySelectorAll('.building-section-title');
    sectionTitles.forEach(title => {
        title.style.cursor = 'pointer';
        title.addEventListener('click', function() {
            const section = this.closest('.building-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

/**
 * Submit quote request - sends all collected data to agent
 */
async function submitQuoteRequest() {
    console.log('📧 Submitting quote request with email...');
    
    // Get the submit button
    const submitBtn = document.querySelector('.btn-submit-quote');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    }

    try {
        // Collect all form data
        const formData = collectFullFormData();
        
        // Debug: log the collected form data
        console.log('📋 Collected form data:', JSON.stringify(formData, null, 2));
        
        // Add timestamp and metadata
        formData.submittedAt = new Date().toISOString();
        formData.formVersion = '2.0';
        formData.source = 'ביטוח דירה - אדמון סוכנות לביטוח';
        
        // Use the sendEmailAndGeneratePDF function that handles everything
        const result = await sendEmailAndGeneratePDF(formData);
        
        if (result && result.emailSuccess) {
            console.log('✅ Quote request processed successfully:', result);
            
            // Close modal after showing success message
            setTimeout(() => {
                closeGeneralDetailsModal();
            }, 4000);
        } else {
            throw new Error('שגיאה בעיבוד הבקשה');
        }
        
    } catch (error) {
        console.error('❌ Error submitting quote request:', error);
        showNotification('error', `אירעה שגיאה בשליחת הבקשה: ${error.message}`);
    } finally {
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
}

/**
 * Collect complete form data from all steps
 */
function collectFullFormData() {
    // Collect all basic fields directly with correct IDs
    const formData = {};
    
    // Add phone number if verified
    const phoneNumber = document.getElementById('phone-number');
    if (phoneNumber && phoneNumber.value) {
        formData.phoneNumber = phoneNumber.value;
    }
    
    // Collect all basic fields with correct IDs (matching HTML)
    console.log('🔍 Checking DOM elements:');
    console.log('- first-name element:', document.getElementById('first-name'));
    console.log('- street element:', document.getElementById('street'));
    console.log('- city-autocomplete element:', document.getElementById('city-autocomplete'));
    console.log('- houseNumber element:', document.getElementById('houseNumber'));
    console.log('- postalCode element:', document.getElementById('postalCode'));
    console.log('- garden-checkbox element:', document.getElementById('garden-checkbox'));
    
    formData.firstName = document.getElementById('first-name')?.value || '';
    formData.lastName = document.getElementById('last-name')?.value || '';
    formData.email = document.getElementById('email')?.value || '';
    formData.idNumber = document.getElementById('idNumber')?.value || '';
    formData.startDate = document.getElementById('startDate')?.value || '';
    formData.productType = document.getElementById('productType')?.value || '';
    formData.propertyType = document.getElementById('propertyType')?.value || '';
    formData.city = document.getElementById('city-autocomplete')?.value || document.getElementById('city')?.value || '';
    
    // Get street and house number only if visible
    const streetElement = document.getElementById('street');
    const streetGroup = streetElement ? streetElement.closest('.form-group') : null;
    formData.street = (streetGroup && streetGroup.style.display !== 'none') ? streetElement.value : '';
    
    const houseNumberElement = document.getElementById('houseNumber');
    const houseNumberGroup = houseNumberElement ? houseNumberElement.closest('.form-group') : null;
    formData.houseNumber = (houseNumberGroup && houseNumberGroup.style.display !== 'none') ? houseNumberElement.value : '';
    
    formData.postalCode = document.getElementById('postalCode')?.value || '';
    formData.zipCode = formData.postalCode; // Alias for postalCode
    formData.hasGarden = document.getElementById('garden-checkbox')?.checked || false;
    formData.floorCount = document.getElementById('floorCount')?.value || '';
    
    // Add bank and branch fields for mortgaged properties
    formData.selectedBank = document.getElementById('mortgage-bank')?.value || '';
    formData.selectedBranch = document.getElementById('mortgage-branch')?.value || '';
    
    // Add building/structure data - with all fields including new ones
    const buildingData = {
        insuranceAmount: document.getElementById('insurance-amount')?.value || '',
        buildingInsuranceAmount: document.getElementById('insurance-amount')?.value || '',
        buildingAge: document.getElementById('building-age')?.value || '',
        age: document.getElementById('building-age')?.value || '',
        buildingArea: document.getElementById('building-area')?.value || '',
        area: document.getElementById('building-area')?.value || '',
        constructionType: document.getElementById('construction-type')?.value || '',
        constructionStandard: document.getElementById('construction-standard')?.value || '',
        mortgaged: document.getElementById('mortgaged-property')?.checked || false,
        mortgagedProperty: document.getElementById('mortgaged-property')?.checked || false,
        loanEndDate: document.getElementById("loan-end-date")?.value || "",
        
        // New fields from the enhanced forms
        hasTerrace: document.getElementById('has-terrace')?.value || '',
        terraceArea: document.getElementById('terrace-area')?.value || '',
        hasGarden: document.getElementById('has-garden')?.value || '',
        gardenArea: document.getElementById('garden-area')?.value || '',
        roofType: document.getElementById('roof-type')?.value || '',
        
        // Water damage fields
        waterDamageType: document.getElementById('water-damage-type')?.value || '',
        waterDeductible: document.getElementById('water-deductible')?.value || '',
        // Burglary field  
        burglaryBuilding: document.getElementById('burglary-building')?.checked || false,
        
        // Mortgage water damage (if applicable)
        mortgageWaterDamage: document.getElementById('mortgage-water-damage')?.value || '',
        // Earthquake fields
        earthquakeCoverage: document.getElementById('earthquake-coverage')?.value || '',
        earthquakeLandCoverage: document.getElementById('earthquake-land-coverage')?.value || '',
        earthquakeCoverageAmount: document.getElementById('earthquake-coverage-amount')?.value || '',
        
        // Swimming pool
        hasSwimmingPool: document.getElementById('has-swimming-pool')?.checked || false,
        swimmingPoolValue: document.getElementById('swimming-pool-value')?.value || '',
        
        // Additional shared property insurance
        additionalSharedInsurance: document.getElementById('additional-shared-insurance')?.value || '',
        // Extensions
        buildingContentsInsurance: document.getElementById('building-contents-insurance')?.value || '',
        storageInsurance: document.getElementById('storage-insurance')?.value || '',
        swimmingPoolInsurance: document.getElementById('swimming-pool-insurance')?.value || ''
    };
    
    // Add contents data
    const contentsData = {
        contentsValue: document.getElementById('contents-value')?.value || '',
        contentsBuildingAge: document.getElementById('contents-building-age')?.value || '',
        hasJewelry: document.getElementById('has-jewelry')?.value || '',
        jewelryAmount: document.getElementById('jewelry-amount')?.value || '',
        hasWatches: document.getElementById('has-watches')?.value || '',
        watchesAmount: document.getElementById('watches-amount')?.value || '',

        contentsEarthquakeCoverage: document.getElementById('contents-earthquake-coverage')?.value || ''
    };
    
    // Add additional coverage data
    const additionalCoverage = {
        thirdPartyCoverage: document.getElementById('third-party-coverage')?.checked || false,
        employersLiability: document.getElementById('employers-liability')?.checked || false,
        cyberCoverage: document.getElementById('cyber-coverage')?.checked || false,
        terrorCoverage: document.getElementById('terror-coverage')?.checked || false
    };
    
    // Create address object as expected by API
    const address = {
        street: formData.street || '',
        houseNumber: formData.houseNumber || '',
        city: formData.city || '',
        postalCode: formData.postalCode || '',
        hasGarden: formData.hasGarden || false
    };

    // Combine all data - include address data both ways for compatibility
    const finalData = {
        ...formData,
        address: address,
        // Also include address fields directly for backward compatibility with local server
        street: formData.street || '',
        houseNumber: formData.houseNumber || '',
        city: formData.city || '',
        postalCode: formData.postalCode || '',
        hasGarden: formData.hasGarden || false,
        building: buildingData,
        contents: contentsData,
        additionalCoverage: additionalCoverage
    };
    
    console.log('🔍 collectFullFormData result:', finalData);
    console.log('🔍 Basic form data:', {
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        email: finalData.email,
        idNumber: finalData.idNumber,
        startDate: finalData.startDate,
        productType: finalData.productType,
        propertyType: finalData.propertyType
    });
    console.log('🔍 Address data:', {
        street: finalData.street,
        houseNumber: finalData.houseNumber,
        city: finalData.city,
        postalCode: finalData.postalCode,
        hasGarden: finalData.hasGarden
    });
    
    return finalData;
}

/**
 * Generate HTML email content with comprehensive details
 */
function generateEmailHTML(data) {
    // Format date nicely
    const formatDate = (dateStr) => {
        if (!dateStr) return 'לא צוין';
        try {
            return new Date(dateStr).toLocaleDateString('he-IL');
        } catch {
            return dateStr;
        }
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        if (!amount || amount === '0') return '';
        return '₪' + new Intl.NumberFormat('he-IL').format(amount);
    };
    
    // Format boolean values
    const formatBoolean = (value) => value ? 'כן' : 'לא';
    
    // Get product type display text
    const getProductDisplay = (productType) => {
        const includesBuilding = productType && productType.includes('מבנה');
        const includesContents = productType && productType.includes('תכולה');
        return { includesBuilding, includesContents };
    };
    
    const { includesBuilding, includesContents } = getProductDisplay(data.productType);
    
    return `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    direction: rtl; 
                    text-align: right; 
                    background: #f5f5f5; 
                    margin: 0; 
                    padding: 20px; 
                }
                .container { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    background: white; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                }
                .header { 
                    background: #4169E1; 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: normal;
                }
                .header p { 
                    margin: 10px 0 0 0; 
                    font-size: 14px;
                }
                .content { 
                    padding: 30px; 
                }
                .section { 
                    margin-bottom: 30px; 
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #4169E1;
                    color: white;
                    padding: 10px 15px;
                    margin: 0 0 15px 0;
                    font-size: 18px;
                    font-weight: normal;
                }
                .section-icon {
                    font-size: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                td {
                    padding: 10px 15px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                }
                td:first-child {
                    background: #f8f9fa;
                    font-weight: bold;
                    width: 40%;
                }
                .highlight {
                    background: #FFF4E5;
                    padding: 15px;
                    border-right: 4px solid #FF8C00;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px; 
                    border-top: 1px solid #ddd;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: normal;
                }
                .badge.yes {
                    background: #d4edda;
                    color: #155724;
                }
                .badge.no {
                    background: #f8d7da;
                    color: #721c24;
                }
                .info-row {
                    margin-bottom: 8px;
                }
                .label {
                    font-weight: bold;
                    color: #333;
                }
                .value {
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 ליד חדש - הצעת ביטוח דירה</h1>
                    <p>אדמון סוכנות לביטוח</p>
                </div>
                
                <div class="content">
                    <!-- סיכום בקשה -->
                    ${data.productType ? `
                    <div class="highlight">
                        סוג ביטוח: ${data.productType}
                            </div>
                            ` : ''}
                    
                    <!-- פרטים אישיים -->
                    <div class="section">
                        <h2 class="section-title">
                            <span class="section-icon">👤</span>
                            פרטים אישיים
                        </h2>
                        <table>
                            <tr>
                                <td>שם מלא:</td>
                                <td>${data.firstName || ''} ${data.lastName || ''}</td>
                            </tr>
                            <tr>
                                <td>ת.ז:</td>
                                <td>${data.idNumber || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>אימייל:</td>
                                <td>${data.email || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>טלפון:</td>
                                <td>${data.phoneNumber || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>תאריך התחלת ביטוח:</td>
                                <td>${formatDate(data.startDate)}</td>
                            </tr>
                        </table>
                            </div>

                    <!-- פרטי הנכס -->
                    <div class="section">
                        <h2 class="section-title">
                            <span class="section-icon">🏠</span>
                            פרטי הנכס
                        </h2>
                        <table>
                            <tr>
                                <td>סוג נכס:</td>
                                <td>${data.propertyType || 'לא צוין'}</td>
                            </tr>
                            ${data.floorCount ? `
                            <tr>
                                <td>מספר קומות:</td>
                                <td>${data.floorCount}</td>
                            </tr>
                                ` : ''}
                        </table>
                        
                        <h3 style="background: #f8f9fa; padding: 10px; margin: 20px 0 10px 0;">כתובת:</h3>
                        <table>
                            <tr>
                                <td>עיר:</td>
                                <td>${data.city || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>רחוב:</td>
                                <td>${data.street || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>מספר בית:</td>
                                <td>${data.houseNumber || 'לא צוין'}</td>
                            </tr>
                            <tr>
                                <td>מיקוד:</td>
                                <td>${data.postalCode || data.zipCode || 'לא צוין'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- ביטוח מבנה -->
                    ${includesBuilding && data.building ? `
                    <div class="section">
                        <h2 class="section-title">
                            <span class="section-icon">🏗️</span>
                            ביטוח מבנה
                        </h2>
                        <table>
                            ${data.building.buildingAge ? `
                            <tr>
                                <td>גיל המבנה:</td>
                                <td>${data.building.buildingAge} שנים</td>
                            </tr>
                            ` : ''}
                            ${data.building.buildingArea ? `
                            <tr>
                                <td>שטח מבנה בנוי:</td>
                                <td>${data.building.buildingArea} מ"ר</td>
                            </tr>
                            ` : ''}
                            ${data.building.constructionType ? `
                            <tr>
                                <td>סוג בניה:</td>
                                <td>${data.building.constructionType}</td>
                            </tr>
                            ` : ''}
                            ${data.building.hasTerrace === 'כן' ? `
                            <tr>
                                <td>מרפסת:</td>
                                <td>כן${data.building.terraceArea ? ` - ${data.building.terraceArea} מ"ר` : ''}</td>
                            </tr>
                            ` : ''}
                            ${data.building.hasGarden === 'כן' ? `
                            <tr>
                                <td>גינה:</td>
                                <td>כן${data.building.gardenArea ? ` - ${data.building.gardenArea} מ"ר` : ''}</td>
                            </tr>
                            ` : ''}
                            ${data.building.roofType ? `
                            <tr>
                                <td>סוג גג:</td>
                                <td>${data.building.roofType}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td>משועבד/מוטב:</td>
                                <td><span class="badge ${data.building.mortgaged ? 'yes' : 'no'}">${formatBoolean(data.building.mortgaged)}</span></td>
                            </tr>
                            ${data.building.mortgaged && data.building.loanEndDate ? `
                            <tr>
                                <td>תאריך תום תקופת ההלוואה האחרונה:</td>
                                <td>${formatDate(data.building.loanEndDate)}</td>
                            </tr>
                            ` : ''}
                            ${data.productType === 'מבנה בלבד משועבד לבנק' && data.selectedBank ? `
                            <tr>
                                <td>בנק משעבד:</td>
                                <td>${data.selectedBank}</td>
                            </tr>
                            ` : ''}
                            ${data.productType === 'מבנה בלבד משועבד לבנק' && data.selectedBranch ? `
                            <tr>
                                <td>סניף בנק:</td>
                                <td>${data.selectedBranch}</td>
                            </tr>
                            ` : ''}
                        </table>
                        
                        <h3 style="background: #f8f9fa; padding: 10px; margin: 20px 0 10px 0;">כיסויים נוספים למבנה:</h3>
                        <table>
                            ${data.building.waterDamageType ? `
                            <tr>
                                <td>כיסוי נזקי צנרת:</td>
                                <td>${data.building.waterDamageType}</td>
                            </tr>
                            ` : ''}
                            ${data.building.earthquakeCoverage ? `
                            <tr>
                                <td>כיסוי רעידת אדמה:</td>
                                <td>${data.building.earthquakeCoverage}</td>
                            </tr>
                            ` : ''}
                            ${data.building.earthquakeLandCoverage === 'כן' ? `
                            <tr>
                                <td>כיסוי שווי קרקע ברעידת אדמה:</td>
                                <td>כן${data.building.earthquakeCoverageAmount ? ` - ${formatCurrency(data.building.earthquakeCoverageAmount)}` : ''}</td>
                            </tr>
                            ` : ''}
                            ${data.building.hasSwimmingPool ? `
                            <tr>
                                <td>בריכת שחיה:</td>
                                <td>כן${data.building.swimmingPoolValue ? ` - ${formatCurrency(data.building.swimmingPoolValue)}` : ''}</td>
                            </tr>
                    ` : ''}
                        </table>
                            </div>
                            ` : ''}
                    
                    <!-- ביטוח תכולה -->
                    ${includesContents && data.contents ? `
                    <div class="section">
                        <h2 class="section-title">
                            <span class="section-icon">📦</span>
                            ביטוח תכולה
                        </h2>
                        <table>
                            ${data.contents.contentsValue ? `
                            <tr>
                                <td>שווי התכולה:</td>
                                <td>${formatCurrency(data.contents.contentsValue)}</td>
                            </tr>
                            ` : ''}
                            ${!includesBuilding && data.contents.contentsBuildingAge ? `
                            <tr>
                                <td>גיל המבנה:</td>
                                <td>${data.contents.contentsBuildingAge} שנים</td>
                            </tr>
                            ` : ''}
                            ${data.contents.hasJewelry === 'כן' && data.contents.jewelryAmount ? `
                            <tr>
                                <td>תכשיטים:</td>
                                <td>${formatCurrency(data.contents.jewelryAmount)}</td>
                            </tr>
                            ` : ''}
                            ${data.contents.hasWatches === 'כן' && data.contents.watchesAmount ? `
                            <tr>
                                <td>שעוני יוקרה:</td>
                                <td>${formatCurrency(data.contents.watchesAmount)}</td>
                            </tr>
                            ` : ''}
                        </table>
                        
                        ${data.contents.contentsEarthquakeCoverage ? `
                        <h3 style="background: #f8f9fa; padding: 10px; margin: 20px 0 10px 0;">כיסוי נוסף לתכולה:</h3>
                        <table>
                            <tr>
                                <td>כיסוי נזקי מים ברעידת אדמה:</td>
                                <td>${data.contents.contentsEarthquakeCoverage}</td>
                            </tr>
                        </table>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- כיסויים נוספים -->
                    ${data.additionalCoverage && (data.additionalCoverage.thirdPartyCoverage || 
                       data.additionalCoverage.employersLiability || data.additionalCoverage.cyberCoverage || 
                       data.additionalCoverage.terrorCoverage) ? `
                    <div class="section">
                        <h2 class="section-title">
                            <span class="section-icon">🛡️</span>
                            כיסויים נוספים
                        </h2>
                        <table>
                            ${data.additionalCoverage.thirdPartyCoverage ? `
                            <tr>
                                <td>כיסוי צד שלישי:</td>
                                <td><span class="badge yes">כן</span></td>
                            </tr>
                            ` : ''}
                            ${data.additionalCoverage.employersLiability ? `
                            <tr>
                                <td>חבות מעבידים:</td>
                                <td><span class="badge yes">כן</span></td>
                            </tr>
                            ` : ''}
                            ${data.additionalCoverage.cyberCoverage ? `
                            <tr>
                                <td>כיסוי סייבר למשפחה:</td>
                                <td><span class="badge yes">כן</span></td>
                            </tr>
                            ` : ''}
                            ${data.additionalCoverage.terrorCoverage ? `
                            <tr>
                                <td>כיסוי לטרור:</td>
                                <td><span class="badge yes">כן</span></td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    ` : ''}
                    
                    <!-- חתימה -->
                    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <p style="margin: 0;">
                            <strong>תאריך יצירת הליד:</strong> ${new Date(data.submittedAt || Date.now()).toLocaleString('he-IL')}
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>אדמון סוכנות לביטוח</strong></p>
                    <p>טלפון: 03-1234567 | אימייל: info@admon-agency.co.il</p>
                    <p>אדמון סוכנות לביטוח - שירות מקצועי ואמין</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Get the correct API base URL based on current deployment
 */
function getApiBaseUrl() {
    const currentHost = window.location.hostname;
    const currentOrigin = window.location.origin;
    
    // Local development
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:8080';
    }
    
    // Production or preview deployments on Vercel
    // Use the current origin to handle any subdomain
    if (currentHost.includes('vercel.app')) {
        console.log(`🌐 Using current Vercel deployment: ${currentOrigin}`);
        return currentOrigin;
    }
    
    // Production domain
    if (currentHost.includes('admon-insurance-agency.co.il')) {
        return 'https://admon-insurance-agency.co.il';
    }
    
    // Fallback to production domain
    return 'https://admon-insurance-agency.co.il';
}

// =============================================================================
// EMAIL DEBUGGING INSTRUCTIONS
// =============================================================================
// אם יש בעיות עם שליחת מייל, בצע את השלבים הבאים:
//
// 1. פתח Developer Tools (F12) והקלד:
//    debugEmailSystem()
//    - זה יבדוק את סביבת העבודה ואת איכות הנתונים
//
// 2. לבדיקת חיבור לשרת:
//    const debug = debugEmailSystem()
//    await debug.testEndpoint('https://admon-insurance-agency.co.il/api/send-email')
//
// 3. לבדיקת שליחת מייל טסט:
//    debugEmailSending()
//
// 4. אם יש שגיאת 500 (Internal Server Error):
//    - בדוק שכל השדות הנדרשים מלאים
//    - בדוק שאין שדות עם ערכים null או undefined
//    - בדוק שגודל הנתונים לא גדול מדי
//
// 5. בעיות נפוצות ופתרונות:
//    - Error 500: בדוק שהשרת פועל ושהנתונים תקינים
//    - CORS Error: בדוק שהURL נכון לסביבה
//    - Network Error: בדוק חיבור אינטרנט
//    - Timeout: הנתונים גדולים מדי או השרת עמוס
//
// 6. אם כל השרתים נכשלים, הנתונים נשמרים ב-localStorage:
//    console.log(JSON.parse(localStorage.getItem('savedInsuranceForms')))
//
// =============================================================================

/**
 * Send email to agent via backend service with improved error handling
 */
async function sendEmailToAgent(emailData) {
    console.log('📮 Starting email sending process...');
    console.log('📤 Email data summary:', {
        to: emailData.to,
        subject: emailData.subject,
        hasHtml: !!emailData.html,
        hasFormData: !!emailData.formData,
        dataSize: JSON.stringify(emailData).length
    });
    
    // Get the correct API base URL dynamically
    const apiBaseUrl = getApiBaseUrl();
    const endpoint = `${apiBaseUrl}/api/send-email`;
    
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    console.log(`🌐 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
    console.log(`📡 Using endpoint: ${endpoint}`);
    
    try {
        // Validate email data before sending
        if (!emailData.to || !emailData.subject) {
            throw new Error('Missing required email fields (to/subject)');
        }
        
            // Get auth token if available
            const authToken = localStorage.getItem('authToken');
            
            // Additional validation: prevent CORS issues
            if (endpoint.includes('localhost') && !isDevelopment) {
                throw new Error('Cannot access localhost from production environment');
            }
            
        console.log('📦 Preparing to send email request...');
        console.log('🔐 Auth token available:', !!authToken);
        
        const requestStart = Date.now();
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken ? `Bearer ${authToken}` : ''
                },
                body: JSON.stringify(emailData)
            });
            
        const requestDuration = Date.now() - requestStart;
        console.log(`⏱️ Request completed in ${requestDuration}ms`);
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        let result;
        try {
            result = await response.json();
            console.log('📥 Response data:', result);
        } catch (jsonError) {
            console.error('❌ Failed to parse response JSON:', jsonError);
            throw new Error(`Server returned invalid JSON response (${response.status})`);
        }
        
        if (!response.ok) {
            // Log detailed error information
            console.error('❌ Email API returned error:', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: result.message || result.error,
                errorDetails: result.details,
                endpoint: endpoint
            });
            
            // Provide more specific error messages based on status code
            let errorMessage = result.message || result.error || 'Unknown server error';
            
            // Handle Gmail authentication errors
            if (errorMessage.includes('invalid_grant')) {
                errorMessage = 'Gmail authentication expired - server needs to refresh tokens';
                console.error('🔑 Gmail OAuth needs refresh - contact admin');
            } else if (response.status === 500) {
                errorMessage = `Server internal error: ${errorMessage}`;
            } else if (response.status === 429) {
                errorMessage = 'Too many requests, please try again later';
            } else if (response.status >= 400 && response.status < 500) {
                errorMessage = `Client error (${response.status}): ${errorMessage}`;
            }
            
            throw new Error(errorMessage);
        }
        
        console.log('✅ Email sent successfully:', {
            messageId: result.messageId,
            endpoint: endpoint,
            duration: requestDuration
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ Email sending failed:', {
            endpoint: endpoint,
            errorType: error.name,
            errorMessage: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
        });
        
        // Don't automatically save to localStorage here - let the caller decide
        throw new Error(`Email sending failed: ${error.message}`);
    }
}

/**
 * Send lead data to Google Sheets
 */
async function sendToGoogleSheets(formData) {
    console.log('📊 Starting Google Sheets integration...');
    
    // Get the correct API base URL dynamically
    const apiBaseUrl = getApiBaseUrl();
    let endpoint = `${apiBaseUrl}/api/add-to-sheets-alternative`; // Start with working one
    
    // Use the alternative method first (it works better)
    let useAlternative = true;
    
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    console.log(`🌐 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
    console.log(`📡 Using Google Sheets endpoint: ${endpoint}`);
    
    try {
        console.log('📦 Preparing to send data to Google Sheets...');
        console.log('📊 Form data summary:', {
            customerName: `${formData.firstName || ''} ${formData.lastName || ''}`,
            productType: formData.productType,
            hasBuilding: !!formData.building,
            hasContents: !!formData.contents,
            dataSize: JSON.stringify(formData).length
        });
        
        const requestStart = Date.now();
        
        let response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formData: formData })
        });
        
        // If alternative fails, try original method as fallback
        if (!response.ok && response.status === 500) {
            console.log('🔄 Alternative Google Sheets API failed, trying original method...');
            endpoint = `${apiBaseUrl}/api/add-to-sheets`;
            useAlternative = false;
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ formData: formData })
            });
        }
        
        const requestDuration = Date.now() - requestStart;
        console.log(`⏱️ Google Sheets request completed in ${requestDuration}ms`);
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        let result;
        try {
            result = await response.json();
            console.log('📥 Google Sheets response:', result);
        } catch (jsonError) {
            console.error('❌ Failed to parse Google Sheets response JSON:', jsonError);
            throw new Error(`Google Sheets server returned invalid JSON response (${response.status})`);
        }
        
        if (!response.ok) {
            console.error('❌ Google Sheets API returned error:', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: result.message || result.error,
                errorDetails: result.details,
                endpoint: endpoint
            });
            
            let errorMessage = result.message || result.error || 'Unknown Google Sheets error';
            let userFriendlyMessage = '';
            
            if (response.status === 500) {
                if (errorMessage.includes('DECODER routines::unsupported')) {
                    userFriendlyMessage = 'בעיה בהגדרות Google Sheets - צריך לתקן את המפתח הפרטי';
                    errorMessage = `Google Sheets configuration error: Private key format issue`;
                } else if (errorMessage.includes('Authentication failed') || errorMessage.includes('unauthorized')) {
                    userFriendlyMessage = 'בעיה בהרשאות Google Sheets - צריך לבדוק את ההגדרות';
                    errorMessage = `Google Sheets authentication error: ${errorMessage}`;
                } else {
                    userFriendlyMessage = 'שגיאת שרת ב-Google Sheets';
                    errorMessage = `Google Sheets server error: ${errorMessage}`;
                }
            } else if (response.status === 429) {
                userFriendlyMessage = 'יותר מדי בקשות ל-Google Sheets, נסה שוב בעוד כמה דקות';
                errorMessage = 'Too many requests to Google Sheets, please try again later';
            } else if (response.status >= 400 && response.status < 500) {
                userFriendlyMessage = 'בעיה בהגדרות Google Sheets';
                errorMessage = `Google Sheets client error (${response.status}): ${errorMessage}`;
            }
            
            // Store user-friendly message for UI display
            const error = new Error(errorMessage);
            error.userMessage = userFriendlyMessage;
            throw error;
        }
        
        console.log('✅ Data added to Google Sheets successfully:', {
            updatedRange: result.updatedRange,
            updatedRows: result.updatedRows,
            endpoint: endpoint,
            duration: requestDuration
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ Google Sheets integration failed:', {
            endpoint: endpoint,
            errorType: error.name,
            errorMessage: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
        
        // Return error but don't throw - we don't want to fail the entire process
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate PDF using jsPDF from form data - client-side generation
 */
function generateLeadPDF(formData) {
    console.log('📄 Generating PDF with jsPDF...');
    
    try {
        const { jsPDF } = window.jspdf;
        
        // Create PDF document in A4 format
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set RTL and Hebrew support
        doc.setLanguage('he');
        
        // Colors
        const primaryColor = [0, 82, 204]; // #0052cc
        const textColor = [51, 51, 51]; // #333
        const grayColor = [102, 102, 102]; // #666
        
        let yPosition = 20;
        const margin = 20;
        const pageWidth = 210;
        const contentWidth = pageWidth - (2 * margin);
        
        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('הצעת ביטוח דירה - אדמון סוכנות לביטוח', pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('ליד חדש מהאתר', pageWidth / 2, 30, { align: 'center' });
        
        yPosition = 50;
        
        // Helper function to add section
        const addSection = (title, items) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Section title
            doc.setTextColor(...primaryColor);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPosition);
            yPosition += 10;
            
            // Section content
            doc.setTextColor(...textColor);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            
            items.forEach(item => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                if (item.label && item.value !== undefined && item.value !== null && item.value !== '') {
                    const text = `${item.label}: ${item.value}`;
                    doc.text(text, margin + 5, yPosition);
                    yPosition += 6;
                }
            });
            
            yPosition += 5;
        };
        
        // Format date helper
        const formatDate = (dateStr) => {
            if (!dateStr) return 'לא צוין';
            try {
                return new Date(dateStr).toLocaleDateString('he-IL');
            } catch {
                return dateStr;
            }
        };
        
        // Format currency helper
        const formatCurrency = (amount) => {
            if (!amount) return '0 ₪';
            return new Intl.NumberFormat('he-IL').format(amount) + ' ₪';
        };
        
        // Format boolean helper
        const formatBoolean = (value) => value ? 'כן' : 'לא';
        
        // Personal Information
        addSection('פרטים אישיים', [
            { label: 'שם מלא', value: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() },
            { label: 'מספר ת.ז', value: formData.idNumber },
            { label: 'טלפון', value: formData.phoneNumber },
            { label: 'אימייל', value: formData.email },
            { label: 'תאריך התחלת ביטוח', value: formatDate(formData.startDate) }
        ]);
        
        // Property Information
        const propertyItems = [
            { label: 'סוג מוצר', value: formData.productType },
            { label: 'סוג נכס', value: formData.assetType || formData.propertyType },
            { label: 'עיר', value: formData.city },
            { label: 'רחוב', value: formData.street },
            { label: 'מספר בית', value: formData.houseNumber },
            { label: 'מיקוד', value: formData.zipCode || formData.postalCode }
        ];
        
        // Add bank information only for mortgaged product type
        if (formData.productType === 'מבנה בלבד משועבד לבנק') {
            if (formData.selectedBank) {
                propertyItems.push({ label: 'בנק משעבד', value: formData.selectedBank });
            }
            if (formData.selectedBranch) {
                propertyItems.push({ label: 'סניף בנק', value: formData.selectedBranch });
            }
        }
        
        addSection('פרטי הנכס', propertyItems);
        
        // Building Insurance
        if (formData.building && formData.building.buildingInsuranceAmount) {
            const buildingItems = [
                { label: 'סכום ביטוח מבנה', value: formatCurrency(formData.building.buildingInsuranceAmount) },
                { label: 'גיל המבנה', value: formData.building.buildingAge ? `${formData.building.buildingAge} שנים` : null },
                { label: 'שטח', value: formData.building.buildingArea ? `${formData.building.buildingArea} מ"ר` : null },
                { label: 'סוג בניה', value: formData.building.constructionType },
                { label: 'סטנדרט בניה', value: formData.building.constructionStandard },
                { label: 'משועבד/מוטב', value: formatBoolean(formData.building.mortgagedProperty) },
                { label: 'חידושים', value: formData.building.loanEndDate }
            ].filter(item => item.value);
            
            addSection('ביטוח מבנה', buildingItems);
        }
        
        // Contents Insurance
        if (formData.contents && (formData.contents.jewelryAmount || formData.contents.watchesAmount)) {
            const contentsItems = [
                { label: 'תכשיטים', value: formData.contents.jewelryAmount ? formatCurrency(formData.contents.jewelryAmount) : null },
                { label: 'שעונים', value: formData.contents.watchesAmount ? formatCurrency(formData.contents.watchesAmount) : null }
            ].filter(item => item.value);
            
            addSection('ביטוח תכולה', contentsItems);
        }
        
        // Additional Coverage
        if (formData.additionalCoverage) {
            const additionalItems = [
                { label: 'צד שלישי', value: formData.additionalCoverage.thirdPartyCoverage ? 'כן' : null },
                { label: 'חבות מעבידים', value: formData.additionalCoverage.employersLiability ? 'כן' : null },
                { label: 'סייבר למשפחה', value: formData.additionalCoverage.cyberCoverage ? 'כן' : null },
                { label: 'טרור', value: formData.additionalCoverage.terrorCoverage ? 'כן' : null }
            ].filter(item => item.value);
            
            if (additionalItems.length > 0) {
                addSection('כיסוי נוסף לתכולה', additionalItems);
            }
        }
        
        // Footer
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = Math.max(yPosition, 250);
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.text('נוצר על ידי: אדמון סוכנות לביטוח', pageWidth / 2, yPosition, { align: 'center' });
        doc.text(`תאריך יצירה: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}`, pageWidth / 2, yPosition + 5, { align: 'center' });
        
        // Get PDF as base64
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        
        console.log('✅ PDF generated successfully with jsPDF');
        
        return {
            pdfBase64: pdfBase64,
            size: pdfBase64.length
        };
        
    } catch (error) {
        console.error('❌ Error generating PDF with jsPDF:', error);
        throw error;
    }
}

/**
 * Send lead data to server for PDF generation and email sending
 */
async function sendLeadPDFToServer(pdfBase64, formData) {
    console.log('📧📄 Starting PDF generation and email process on server...');
    
    try {
        // Get the correct API base URL dynamically
        const apiBaseUrl = getApiBaseUrl();
        const endpoint = `${apiBaseUrl}/api/generate-pdf`;
        
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
        
        console.log(`🌐 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
        console.log(`📡 Using endpoint: ${endpoint}`);
        
        // Prepare request data - let server generate PDF from form data
        const requestData = {
            formData: formData,
            sendEmail: true,
            emailTo: 'royadmon23@gmail.com',
            emailSubject: `🏠 ליד חדש להצעת ביטוח דירה - ${formData.firstName || ''} ${formData.lastName || ''}`,
            generatePdf: true // Tell server to generate PDF from form data
        };
        
        // Add additional context for debugging
        console.log('📤 Request data summary:', {
            hasFormData: !!requestData.formData,
            emailTo: requestData.emailTo,
            subject: requestData.emailSubject,
            customerName: `${formData.firstName || ''} ${formData.lastName || ''}`,
            productType: formData.productType,
            dataSize: JSON.stringify(requestData).length
        });
        
        console.log('🚀 Sending request to server...');
        const requestStart = Date.now();
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const requestDuration = Date.now() - requestStart;
        console.log(`⏱️ Server request completed in ${requestDuration}ms`);
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        let result;
        try {
            result = await response.json();
            console.log('📥 Server response:', result);
        } catch (jsonError) {
            console.error('❌ Failed to parse server response JSON:', jsonError);
            throw new Error(`Server returned invalid JSON response (${response.status})`);
        }
        
        if (!response.ok) {
            console.error('❌ Server returned error:', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: result.message || result.error,
                endpoint: endpoint
            });
            
            let errorMessage = result.message || result.error || 'Unknown server error';
            if (response.status === 500) {
                errorMessage = `Server internal error: ${errorMessage}`;
            } else if (response.status === 429) {
                errorMessage = 'Too many requests, please try again later';
            }
            
            throw new Error(errorMessage);
        }
        
        console.log('✅ PDF generation and email successful:', {
            messageId: result.messageId,
            pdfGenerated: result.pdfGenerated,
            emailSent: result.emailSent,
            endpoint: endpoint,
            duration: requestDuration
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ PDF/Email server process failed:', {
            errorType: error.name,
            errorMessage: error.message,
            endpoint: endpoint
        });
        
        throw new Error(`Server PDF/Email process failed: ${error.message}`);
    }
}

/**
 * Download PDF from base64 data
 */
function downloadPDFFromBase64(base64Data, filename) {
    try {
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ PDF downloaded successfully:', filename);
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        throw error;
    }
}

/**
 * Send email for quote request (without PDF)
 */
async function sendEmailAndGeneratePDF(formData) {
    console.log('📧 Starting email process...');
    
    try {
        // Generate the beautiful HTML content
        const htmlContent = generateEmailHTML(formData);
        
        // Direct email sending
        try {
            console.log('📤 Sending email...');
            
            // Prepare email data with detailed logging
            const emailData = {
                to: 'royadmon23@gmail.com',
                replyTo: formData.email || 'royadmon23@gmail.com',
                subject: `🏠 ליד חדש להצעת ביטוח דירה - ${formData.firstName || ''} ${formData.lastName || ''}`,
                html: htmlContent,
                formData: formData // Include form data for server processing
            };
            
            console.log('📤 Sending email data:', {
                to: emailData.to,
                subject: emailData.subject,
                hasHtml: !!emailData.html,
                hasFormData: !!emailData.formData
            });
            
            const result = await sendEmailToAgent(emailData);
            
            console.log('✅ Email sent successfully:', result);
            
            // Send to Google Sheets in parallel (don't wait for it to complete)
            let sheetsResult = null;
            let sheetsErrorMessage = null;
            try {
                console.log('📊 Sending data to Google Sheets...');
                sheetsResult = await sendToGoogleSheets(formData);
                if (sheetsResult.success !== false) {
                    console.log('✅ Data added to Google Sheets successfully');
                }
            } catch (sheetsError) {
                console.error('⚠️ Google Sheets integration failed (non-critical):', sheetsError.message);
                sheetsErrorMessage = sheetsError.userMessage || sheetsError.message;
                // Continue anyway - Google Sheets is not critical
            }

            // Send to N8N webhook (if configured)
            let n8nResult = null;
            if (process.env.N8N_WEBHOOK_URL || typeof N8N_WEBHOOK_URL !== 'undefined') {
                try {
                    console.log('🔄 Sending data to N8N workflow...');
                    const webhookUrl = process.env.N8N_WEBHOOK_URL || N8N_WEBHOOK_URL;
                    
                    const n8nData = {
                        ...formData,
                        action: 'form_completed',
                        timestamp: new Date().toISOString(),
                        source: 'ביטוח דירה - אדמון סוכנות לביטוח',
                        stage: 'completed_lead'
                    };

                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(n8nData)
                    });

                    if (response.ok) {
                        n8nResult = await response.json();
                        console.log('✅ Data sent to N8N successfully:', n8nResult);
                    } else {
                        console.warn('⚠️ N8N webhook returned non-OK status:', response.status);
                    }
                } catch (n8nError) {
                    console.error('⚠️ N8N webhook failed (non-critical):', n8nError.message);
                    // Continue anyway - N8N is not critical for main flow
                }
            }
            
            let notificationMessage = `📧 הליד נשלח בהצלחה במייל!<br>💡 נשלח במייל מעוצב עם כל הפרטים<br>`;
            
            if (sheetsResult && sheetsResult.success !== false) {
                notificationMessage += '📊 נשמר ב-Google Sheets<br>';
            } else if (sheetsErrorMessage) {
                notificationMessage += `⚠️ בעיה ב-Google Sheets: ${sheetsErrorMessage}<br>`;
            }
            
            notificationMessage += '🎯 נציג יחזור אליך בהקדם';
            
            showNotification('success', notificationMessage);
            
            return {
                emailSuccess: true,
                pdfSuccess: false,
                emailResult: result,
                pdfResult: null,
                sheetsResult: sheetsResult,
                n8nResult: n8nResult,
                method: 'email-only',
                errors: { email: null, pdf: null, sheets: sheetsResult?.error || null, n8n: null }
            };
            
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            
            // Last resort: save to localStorage and show success message
            const timestamp = new Date().toISOString();
            const savedForms = JSON.parse(localStorage.getItem('savedInsuranceForms') || '[]');
            savedForms.push({
                ...formData,
                htmlContent: htmlContent,
                savedAt: timestamp,
                status: 'email_failed',
                errors: {
                    email: emailError.message
                }
            });
            localStorage.setItem('savedInsuranceForms', JSON.stringify(savedForms));
            
            console.log('💾 Form saved to localStorage as backup');
            
            showNotification('success', 
                `📋 הליד נשמר במערכת בהצלחה!<br>
                🔧 שירותי המייל זמנית לא זמינים<br>
                📞 נציג יחזור אליך תוך 24 שעות`
            );
            
            return {
                emailSuccess: true, // Show as success to user
                pdfSuccess: false,
                emailResult: { messageId: `backup_${timestamp}`, saved: true },
                pdfResult: null,
                n8nResult: null,
                method: 'backup',
                errors: { 
                    email: emailError.message, 
                    pdf: 'PDF generation disabled',
                    n8n: 'Not sent due to email failure'
                }
            };
        }
        
    } catch (error) {
        console.error('❌ Critical error in sendEmailAndGeneratePDF:', error);
        showNotification('error', `שגיאה קריטית: ${error.message}`);
        throw error;
    }
}

/**
 * Collect all form data from the wizard
 */
function collectAllFormData() {
    const data = {
        // Personal details
        firstName: document.getElementById('first-name')?.value || '',
        lastName: document.getElementById('last-name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phoneNumber: document.getElementById('phone-number')?.value || '',
        idNumber: document.getElementById('id-number')?.value || '',
        
        // Insurance details
        productType: document.getElementById('product-type')?.value || '',
        propertyType: document.getElementById('property-type')?.value || '',
        startDate: document.getElementById('start-date')?.value || '',
        
        // Address
        address: {
            city: document.getElementById('city')?.value || '',
            street: document.getElementById('street')?.value || '',
            houseNumber: document.getElementById('house-number')?.value || '',
            postalCode: document.getElementById('postal-code')?.value || '',
            hasGarden: document.getElementById('has-garden')?.checked || false
        },
        
        // Building details (if product includes building)
        building: collectBuildingData(),
        
        // Contents details (if product includes contents)
        contents: collectContentsData(),
        
        // Additional coverages
        additionalCoverages: collectAdditionalCoverages(),
        
        // Timestamp
        submittedAt: new Date().toISOString()
    };
    
    return data;
}

/**
 * Collect building insurance data
 */
function collectBuildingData() {
    const productType = document.getElementById('productType')?.value;
    if (!productType || !productType.includes('מבנה')) {
        return null;
    }
    
    return {
        age: parseInt(document.getElementById('building-age')?.value) || 0,
        area: parseFloat(document.getElementById('building-area')?.value) || 0,
        hasTerrace: document.getElementById('has-terrace')?.value || '',
        terraceArea: parseFloat(document.getElementById('terrace-area')?.value) || 0,
        hasGarden: document.getElementById('has-garden')?.value || '',
        gardenArea: parseFloat(document.getElementById('garden-area')?.value) || 0,
        roofType: document.getElementById('roof-type')?.value || '',
        constructionType: document.getElementById('construction-type')?.value || '',
        mortgagedProperty: document.getElementById('mortgaged-property')?.checked || false,
        loanEndDate: document.getElementById("loan-end-date")?.value || "",
        mortgageBank: document.getElementById('mortgage-bank')?.value || '',
        mortgageBranch: document.getElementById('mortgage-branch')?.value || '',
        waterDamageType: document.getElementById('water-damage-type')?.value || '',
        earthquakeCoverage: document.getElementById('earthquake-coverage')?.value || '',
        earthquakeDeductible: document.getElementById('earthquake-deductible')?.value || '',
        earthquakeLandCoverage: document.getElementById('earthquake-land-coverage')?.value || '',
        earthquakeCoverageAmount: parseFloat(document.getElementById('earthquake-coverage-amount')?.value) || 0,
        hasSwimmingPool: document.getElementById('has-swimming-pool')?.checked || false,
        swimmingPoolValue: parseFloat(document.getElementById('swimming-pool-value')?.value) || 0,
        extensions: {
            buildingContentsInsurance: parseFloat(document.getElementById('building-contents-insurance')?.value) || 0,
            storageInsurance: parseFloat(document.getElementById('storage-insurance')?.value) || 0
        }
    };
}

/**
 * Collect contents insurance data
 */
function collectContentsData() {
    const productType = document.getElementById('product-type')?.value;
    if (!productType || !productType.includes('תכולה')) {
        return null;
    }
    
    return {
        contentsValue: document.getElementById('contents-value')?.value || '',
        buildingAge: parseInt(document.getElementById('contents-building-age')?.value) || 0,
        jewelry: {
            hasJewelry: document.getElementById('has-jewelry')?.value || '',
            amount: parseFloat(document.getElementById('jewelry-amount')?.value) || 0
        },
        watches: {
            hasWatches: document.getElementById('has-watches')?.value || '',
            amount: parseFloat(document.getElementById('watches-amount')?.value) || 0
        },
        coverages: {
            earthquakeCoverage: document.getElementById("contents-earthquake-coverage")?.value || ""
        }
    };
}

/**
 * Collect additional coverages data
 */
function collectAdditionalCoverages() {
    return {
        thirdPartyCoverage: document.getElementById('third-party-coverage')?.checked || false,
        employersLiability: document.getElementById('employers-liability')?.checked || false,
        cyberCoverage: document.getElementById('cyber-coverage')?.checked || false,
        terrorCoverage: document.getElementById('terror-coverage')?.checked || false
    };
}

/**
 * Update additional coverage visibility based on product type
 */
function updateAdditionalCoverageVisibility() {
    const productType = document.getElementById('productType')?.value;
    
    // Get all coverage cards
    const thirdPartyCard = document.querySelector('#third-party-coverage')?.closest('.coverage-card');
    const employersCard = document.querySelector('#employers-liability')?.closest('.coverage-card');
    const cyberCard = document.querySelector('#cyber-coverage')?.closest('.coverage-card');
    const terrorCard = document.querySelector('#terror-coverage')?.closest('.coverage-card');
    
    // Get or create notice element
    const sectionHeader = document.querySelector('#step-cover-additional .section-header-wrapper');
    let noticeElement = document.getElementById('mortgage-coverage-notice');
    
    if (productType === 'מבנה בלבד משועבד לבנק') {
        // Show only third party coverage for mortgaged properties
        if (thirdPartyCard) thirdPartyCard.style.display = 'block';
        if (employersCard) employersCard.style.display = 'none';
        if (cyberCard) cyberCard.style.display = 'none';
        if (terrorCard) terrorCard.style.display = 'none';
        
        // Uncheck hidden checkboxes to prevent them from being submitted
        const employersCheckbox = document.getElementById('employers-liability');
        const cyberCheckbox = document.getElementById('cyber-coverage');
        const terrorCheckbox = document.getElementById('terror-coverage');
        
        if (employersCheckbox) employersCheckbox.checked = false;
        if (cyberCheckbox) cyberCheckbox.checked = false;
        if (terrorCheckbox) terrorCheckbox.checked = false;
        
        // Add notice for mortgaged property
        if (sectionHeader && !noticeElement) {
            noticeElement = document.createElement('div');
            noticeElement.id = 'mortgage-coverage-notice';
            noticeElement.className = 'coverage-info-box';
            noticeElement.style.marginTop = '20px';
            noticeElement.innerHTML = `
                <p style="text-align: center; margin: 0;">
                    <strong>שים לב:</strong> עבור נכס משועבד לבנק, מוצג רק כיסוי צד שלישי שהוא הכיסוי החיוני ביותר.
                </p>
            `;
            sectionHeader.appendChild(noticeElement);
        }
    } else {
        // Show all coverages for other product types
        if (thirdPartyCard) thirdPartyCard.style.display = 'block';
        if (employersCard) employersCard.style.display = 'block';
        if (cyberCard) cyberCard.style.display = 'block';
        if (terrorCard) terrorCard.style.display = 'block';
        
        // Remove notice if exists
        if (noticeElement) {
            noticeElement.remove();
        }
    }
}

/**
 * Show notification to user
 * @param {string} type - 'success' or 'error'
 * @param {string} message - The message to display
 */
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : type === 'warning' ? '⚠️' : '❌'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// DEBUG: Show the submit quote button always in the final step
const showQuoteBtn = () => {
    const btn = document.querySelector('.btn-submit-quote');
    if (btn) {
        btn.style.display = 'block';
        btn.style.visibility = 'visible';
        btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    showQuoteBtn();
});

// ... existing code ...
// DEBUG: Show the success section and submit quote button always for testing
function showSuccessSectionAlways() {
    const successSection = document.getElementById('success-section');
    if (successSection) {
        successSection.style.display = 'block';
    }
    const submitBtn = document.querySelector('.btn-submit-quote');
    if (submitBtn) {
        submitBtn.style.display = 'block';
        submitBtn.style.visibility = 'visible';
        submitBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showSuccessSectionAlways();
});
// ... existing code ...

// Debug function - can be called from browser console
function debugFormCollection() {
    console.log("🧪 DEBUG: Testing form data collection...");
    
    // Test if elements exist
    const elements = {
        "first-name": document.getElementById("first-name"),
        "last-name": document.getElementById("last-name"),
        "email": document.getElementById("email"),
        "street": document.getElementById("street"),
        "city-autocomplete": document.getElementById("city-autocomplete"),
        "houseNumber": document.getElementById("houseNumber"),
        "postalCode": document.getElementById("postalCode"),
        "garden-checkbox": document.getElementById("garden-checkbox")
    };
    
    console.log("🔍 DOM Elements:", elements);
    
    // Test collectFullFormData function
    try {
        const formData = collectFullFormData();
        console.log("✅ Form data collected successfully:", formData);
        return formData;
    } catch (error) {
        console.error("❌ Error collecting form data:", error);
        return null;
    }
}

// Enhanced debug function for email system
function debugEmailSystem() {
    console.log("🧪 DEBUG: Testing email system...");
    
    // Get dynamic API base URL
    const apiBaseUrl = getApiBaseUrl();
    
    // Check environment
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    console.log("🌐 Environment details:", {
        hostname: window.location.hostname,
        href: window.location.href,
        origin: window.location.origin,
        isDevelopment: isDevelopment,
        apiBaseUrl: apiBaseUrl,
        expectedSendEmailEndpoint: `${apiBaseUrl}/api/send-email`,
        expectedGeneratePdfEndpoint: `${apiBaseUrl}/api/generate-pdf`
    });
    
    // Test basic connectivity to endpoints
    async function testEndpoint(url) {
        try {
            console.log(`🔍 Testing endpoint: ${url}`);
            const response = await fetch(url, {
                method: 'OPTIONS', // Safe method to test connectivity
                mode: 'cors'
            });
            console.log(`✅ Endpoint ${url} is reachable - Status: ${response.status}`);
            return true;
        } catch (error) {
            console.error(`❌ Endpoint ${url} failed:`, error.message);
            return false;
        }
    }
    
    // Test form data quality
    const formData = collectFullFormData();
    console.log("📋 Form data quality check:", {
        hasFirstName: !!(formData.firstName && formData.firstName.trim()),
        hasLastName: !!(formData.lastName && formData.lastName.trim()),
        hasEmail: !!(formData.email && formData.email.trim()),
        hasPhone: !!(formData.phoneNumber && formData.phoneNumber.trim()),
        hasProductType: !!(formData.productType),
        hasAddress: !!(formData.city && formData.street && formData.houseNumber),
        totalFields: Object.keys(formData).length,
        dataSize: JSON.stringify(formData).length
    });
    
    return {
        environment: { isDevelopment, hostname: window.location.hostname, apiBaseUrl },
        formData: formData,
        testEndpoint: testEndpoint
    };
}

// Test the actual email sending process with mock data
async function debugEmailSending() {
    console.log("🧪 DEBUG: Testing email sending process...");
    
    try {
        // Create test email data
        const testEmailData = {
            to: 'royadmon23@gmail.com',
            subject: '🧪 Test Email - Debug Mode',
            html: '<h1>Test Email</h1><p>This is a test email from the debug system.</p>',
            formData: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                productType: 'מבנה ותכולה'
            }
        };
        
        console.log("📤 Sending test email...");
        const result = await sendEmailToAgent(testEmailData);
        console.log("✅ Test email sent successfully:", result);
        return { success: true, result };
        
    } catch (error) {
        console.error("❌ Test email failed:", error);
        return { success: false, error: error.message };
    }
}

// Make debug functions globally available
window.debugFormCollection = debugFormCollection;
window.debugEmailSystem = debugEmailSystem;
window.debugEmailSending = debugEmailSending;

/**
 * Initialize bank and branch dropdowns
 */
function initializeBankDropdowns() {
    const bankInput = document.getElementById('mortgage-bank');
    const branchInput = document.getElementById('mortgage-branch');
    const bankDropdown = document.getElementById('bank-dropdown');
    const branchDropdown = document.getElementById('branch-dropdown');
    
    if (!bankInput || !branchInput) return;
    
    // Initially hide dropdowns and ensure proper positioning
    if (bankDropdown) {
        bankDropdown.style.display = 'none';
        bankDropdown.style.position = 'absolute';
        bankDropdown.style.width = '100%';
        bankDropdown.style.maxHeight = '250px';
        bankDropdown.style.overflowY = 'auto';
    }
    if (branchDropdown) {
        branchDropdown.style.display = 'none';
        branchDropdown.style.position = 'absolute';
        branchDropdown.style.width = '100%';
        branchDropdown.style.maxHeight = '250px';
        branchDropdown.style.overflowY = 'auto';
    }
    
    let banksData = [];
    let branchesData = [];
    let selectedBank = null;
    
    // Fetch banks data from API
    async function fetchBanks() {
        try {
            bankDropdown.innerHTML = '<div class="dropdown-loading">טוען רשימת בנקים...</div>';
            bankDropdown.style.display = 'block';
            bankDropdown.style.zIndex = '9999';
            
            // Fetch all data from API - get all records
            let allRecords = [];
            let offset = 0;
            const limit = 1000;
            let hasMoreData = true;
            
            while (hasMoreData) {
                const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=1c5bc716-8210-4ec7-85be-92e6271955c2&limit=${limit}&offset=${offset}`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success && data.result && data.result.records) {
                    allRecords = allRecords.concat(data.result.records);
                    
                    // Check if we got fewer records than the limit - means no more data
                    if (data.result.records.length < limit) {
                        hasMoreData = false;
                    } else {
                        offset += limit;
                    }
                } else {
                    hasMoreData = false;
                }
            }
            
            console.log(`📊 Loaded ${allRecords.length} total records from government API`);
            
            if (allRecords.length > 0) {
                // Extract unique banks
                const bankMap = new Map();
                
                allRecords.forEach(record => {
                    const bankCode = record['Bank_Code'];
                    const bankName = record['Bank_Name'];
                    
                    if (bankCode && bankName && !bankMap.has(bankCode)) {
                        bankMap.set(bankCode, {
                            code: bankCode,
                            name: bankName.trim()
                        });
                    }
                });
                
                banksData = Array.from(bankMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'he'));
                branchesData = allRecords;
                
                console.log(`🏦 Found ${banksData.length} unique banks`);
                
                renderBankDropdown('');
            } else {
                throw new Error('No banks data received from API');
            }
        } catch (error) {
            console.error('Error fetching banks:', error);
            bankDropdown.innerHTML = '<div class="dropdown-error">שגיאה בטעינת רשימת הבנקים</div>';
        }
    }
    
    // Render bank dropdown
    function renderBankDropdown(searchTerm) {
        const filteredBanks = banksData.filter(bank => 
            bank.name.includes(searchTerm) || 
            bank.code.toString().includes(searchTerm)
        );
        
        if (filteredBanks.length === 0) {
            bankDropdown.innerHTML = '<div class="dropdown-no-results">לא נמצאו בנקים</div>';
            return;
        }
        
        bankDropdown.innerHTML = filteredBanks.map(bank => `
            <div class="dropdown-item" data-code="${bank.code}" data-name="${bank.name}">
                <span class="bank-name">${bank.name}</span>
                <span class="bank-code">${bank.code}</span>
            </div>
        `).join('');
        
        // Add click handlers
        bankDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                const name = this.getAttribute('data-name');
                selectBank(code, name);
            });
        });
    }
    
    // Select a bank
    function selectBank(code, name) {
        selectedBank = { code, name };
        bankInput.value = name;
        bankDropdown.style.display = 'none';
        
        // Remove active class when bank is selected
        const bankGroup = document.getElementById('mortgage-bank-group');
        if (bankGroup) {
            bankGroup.classList.remove('dropdown-active');
        }
        
        // Enable branch input
        branchInput.disabled = false;
        branchInput.placeholder = 'חפש סניף...';
        branchInput.value = '';
        
        // Clear validation error if exists
        clearFormError(bankInput);
    }
    
    // Render branch dropdown
    function renderBranchDropdown(searchTerm) {
        if (!selectedBank) return;
        
        const filteredBranches = branchesData.filter(branch => 
            branch['Bank_Code'] === parseInt(selectedBank.code) &&
            (branch['Branch_Name'] && branch['Branch_Name'].includes(searchTerm) ||
             branch['Branch_Code'] && branch['Branch_Code'].toString().includes(searchTerm) ||
             branch['City'] && branch['City'].includes(searchTerm))
        );
        
        if (filteredBranches.length === 0) {
            branchDropdown.innerHTML = '<div class="dropdown-no-results">לא נמצאו סניפים</div>';
            return;
        }
        
        branchDropdown.innerHTML = filteredBranches.map(branch => `
            <div class="dropdown-item" data-code="${branch['Branch_Code']}" data-name="${branch['Branch_Name']}">
                <div class="branch-details">
                    <span class="branch-name">${branch['Branch_Name'] || 'סניף ' + branch['Branch_Code']}</span>
                    <span class="branch-address">${branch['City'] || ''} ${branch['Street'] || ''} ${branch['House_Number'] || ''}</span>
                </div>
                <span class="branch-code">${branch['Branch_Code']}</span>
            </div>
        `).join('');
        
        // Add click handlers
        branchDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                const name = this.getAttribute('data-name');
                selectBranch(code, name);
            });
        });
    }
    
    // Select a branch
    function selectBranch(code, name) {
        branchInput.value = `${name} - סניף ${code}`;
        branchDropdown.style.display = 'none';
        
        // Clear validation error if exists
        clearFormError(branchInput);
    }
    
        // Bank input handlers
    bankInput.addEventListener('focus', function() {
        if (banksData.length === 0) {
            fetchBanks();
        } else {
            bankDropdown.style.display = 'block';
            bankDropdown.style.zIndex = '9999';
            // Add active class for mobile styling
            const bankGroup = document.getElementById('mortgage-bank-group');
            if (bankGroup && window.innerWidth <= 768) {
                bankGroup.classList.add('dropdown-active');
            }
            renderBankDropdown(this.value);
        }
    });

    bankInput.addEventListener('input', function() {
        bankDropdown.style.display = 'block';
        bankDropdown.style.zIndex = '9999';
        // Add active class for mobile styling
        const bankGroup = document.getElementById('mortgage-bank-group');
        if (bankGroup && window.innerWidth <= 768) {
            bankGroup.classList.add('dropdown-active');
        }
        renderBankDropdown(this.value);
    });
    
    // Bank input blur handler to remove active class
    bankInput.addEventListener('blur', function() {
        // Remove active class after a short delay to allow for dropdown selection
        setTimeout(() => {
            const bankGroup = document.getElementById('mortgage-bank-group');
            if (bankGroup) {
                bankGroup.classList.remove('dropdown-active');
            }
        }, 200);
    });
    
    // Function to position branch dropdown outside card boundaries
    function positionBranchDropdown() {
        const inputRect = branchInput.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, use absolute positioning relative to the container
            const container = branchInput.closest('.search-dropdown-container');
            if (container) {
                branchDropdown.style.position = 'absolute';
                branchDropdown.style.top = '100%';
                branchDropdown.style.left = '0';
                branchDropdown.style.right = '0';
                branchDropdown.style.width = 'auto';
                branchDropdown.style.zIndex = '10000';
                return;
            }
        }
        
        // For desktop, use fixed positioning
        branchDropdown.style.position = 'fixed';
        branchDropdown.style.top = (inputRect.bottom + 2) + 'px';
        branchDropdown.style.left = inputRect.left + 'px';
        branchDropdown.style.width = inputRect.width + 'px';
        branchDropdown.style.zIndex = '10000';
    }

    // Branch input handlers
    branchInput.addEventListener('focus', function() {
        if (selectedBank && branchesData.length > 0) {
            branchDropdown.style.display = 'block';
            positionBranchDropdown();
            renderBranchDropdown(this.value);
        }
    });
    
    branchInput.addEventListener('input', function() {
        if (selectedBank) {
            branchDropdown.style.display = 'block';
            positionBranchDropdown();
            renderBranchDropdown(this.value);
        }
    });
    
    // Click outside to close dropdowns
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-dropdown-container')) {
            bankDropdown.style.display = 'none';
            branchDropdown.style.display = 'none';
            // Remove active class when closing dropdowns
            const bankGroup = document.getElementById('mortgage-bank-group');
            if (bankGroup) {
                bankGroup.classList.remove('dropdown-active');
            }
        }
    });
    
    // Reposition branch dropdown on scroll/resize (only for desktop)
    window.addEventListener('scroll', function() {
        if (branchDropdown.style.display === 'block' && window.innerWidth > 768) {
            positionBranchDropdown();
        }
    });
    
    window.addEventListener('resize', function() {
        if (branchDropdown.style.display === 'block') {
            positionBranchDropdown();
        }
    });
}

// Add to initialization
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    initializeBankDropdowns();
});

/**
 * Initialize all insurance app functionality
 */
window.HomeInsuranceApp = window.HomeInsuranceApp || {};
Object.assign(window.HomeInsuranceApp, {
    openModal: openModal,  // Explicitly assign the function
    openGeneralDetailsModal,
    closeGeneralDetailsModal,
    wizardNext,
    wizardPrev,
    sendVerificationCode,
    verifyCode,
    // resendCode is already defined above as window.HomeInsuranceApp.resendCode
    submitQuoteRequest,
    testConditionalLogic,
    logInitializationSummary,
    debugFormCollection,
    initializeNumericInputs,
    initializeSingleNumericInput
});

// Also make openModal globally available for backward compatibility
window.openModal = openModal;
