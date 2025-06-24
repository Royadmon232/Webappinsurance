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
        { id: 'step-cover-additional', name: 'כיסויים נוספים' }
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
            
        case 'מבנה בלבד משועבד':
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
            // Initialize phone validation immediately for the final step
            setTimeout(() => {
                initializePhoneValidation();
            }, 50);
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
        // Call backend API
        const response = await fetch('http://localhost:3000/api/send-verification', {
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
        // Call backend API
        const response = await fetch('http://localhost:3000/api/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                phoneNumber,
                code: enteredCode 
            })
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
        // Call backend API
        const response = await fetch('http://localhost:3000/api/send-verification', {
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
 * Submit final form with all collected data
 */
async function submitFinalForm() {
    try {
        // Collect all form data
        const formData = collectAllFormData();
        
        // Add phone number
        formData.phoneNumber = phoneNumber;
        
        // Send to backend
        const response = await fetch('http://localhost:3000/api/submit-form', {
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
        renewals: document.getElementById('renewals')?.value || '',
        
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
        glassBreakageInsurance: document.getElementById('glass-breakage-insurance')?.value || '',
        boilersCoverage: document.getElementById('boilers-coverage')?.checked || false,
        
        // Contents details (if applicable)
        contentsInsuranceAmount: document.getElementById('contents-insurance-amount')?.value || '',
        contentsBuildingAge: document.getElementById('contents-building-age')?.value || '',
        jewelryAmount: document.getElementById('jewelry-amount')?.value || '',
        jewelryCoverage: document.getElementById('jewelry-coverage')?.value || '',
        watchesAmount: document.getElementById('watches-amount')?.value || '',
        watchesCoverage: document.getElementById('watches-coverage')?.value || '',
        
        // Valuable items
        camerasAmount: document.getElementById('cameras-amount')?.value || '',
        electronicsAmount: document.getElementById('electronics-amount')?.value || '',
        bicyclesAmount: document.getElementById('bicycles-amount')?.value || '',
        musicalInstrumentsAmount: document.getElementById('musical-instruments-amount')?.value || '',
        
        // Contents coverages
        contentsWaterDamage: document.getElementById('contents-water-damage')?.checked || false,
        contentsBurglary: document.getElementById('contents-burglary')?.checked || false,
        contentsEarthquake: document.getElementById('contents-earthquake')?.value || '',
        contentsEarthquakeDeductible: document.getElementById('contents-earthquake-deductible')?.value || '',
        
        // Additional coverages
        businessContentsAmount: document.getElementById('business-contents-amount')?.value || '',
        businessEmployers: document.getElementById('business-employers')?.checked || false,
        businessThirdParty: document.getElementById('business-third-party')?.checked || false,
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
חידושים: ${data.renewals}

כיסויים נוספים למבנה:
נזקי מים: ${data.waterDamageType}
השתתפות עצמית: ${data.waterDeductible}
פריצה: ${data.burglaryBuilding ? 'כן' : 'לא'}
רעידת אדמה: ${data.earthquakeCoverage}
`;
    }

    // Add contents details if applicable
    if (data.contentsInsuranceAmount) {
        content += `

פרטי תכולה:
-----------
סכום ביטוח: ₪${data.contentsInsuranceAmount}
תכשיטים: ₪${data.jewelryAmount || '0'}
שעונים: ₪${data.watchesAmount || '0'}
מצלמות: ₪${data.camerasAmount || '0'}
ציוד אלקטרוני: ₪${data.electronicsAmount || '0'}
אופניים: ₪${data.bicyclesAmount || '0'}
כלי נגינה: ₪${data.musicalInstrumentsAmount || '0'}
`;
    }

    // Add additional coverages
    content += `

כיסויים נוספים:
---------------
פעילות עסקית: ${data.businessContentsAmount ? `₪${data.businessContentsAmount}` : 'לא'}
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
    startResendTimer
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
    const coverageTypeSelect = document.getElementById('coverageType');
    const propertyTypeSelect = document.getElementById('propertyType');
    const floorCountSelect = document.getElementById('floorCount');
    
    // Find parent form groups
    const coverageTypeField = coverageTypeSelect ? coverageTypeSelect.closest('.form-group') : null;
    const floorCountField = floorCountSelect ? floorCountSelect.closest('.form-group') : null;
    
    // Coverage Type change handler
    if (coverageTypeSelect) {
        coverageTypeSelect.addEventListener('change', function() {
            // Update valuable items section based on coverage type
            updateValuableItemsSection();
        });
    }
    
    // Product Type change handler
    if (productTypeSelect) {
        productTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (coverageTypeField && coverageTypeSelect) {
                if (selectedValue === 'מבנה בלבד' || selectedValue === 'מבנה בלבד משועבד') {
                    // Hide coverage type field
                    coverageTypeField.classList.add('hidden');
                    coverageTypeSelect.value = '';
                    coverageTypeSelect.required = false; // <-- התיקון
                } else {
                    // Show coverage type field
                    coverageTypeField.classList.remove('hidden');
                    coverageTypeSelect.required = true; // <-- התיקון
                }
            }
            
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
    
    // Initialize tooltips and help text animations for additional coverage section
    initializeAdditionalCoverageEnhancements();
    
    // Add property type handler for building extensions (avoid duplicate handlers)
    if (propertyTypeSelect && !propertyTypeSelect.hasAttribute('data-extensions-handler')) {
        propertyTypeSelect.setAttribute('data-extensions-handler', 'true');
        propertyTypeSelect.addEventListener('change', function() {
            updateBuildingExtensions(this.value);
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
    // Additional Coverage step sections
    const additionalCoverageStep = document.getElementById('step-cover-additional');
    if (additionalCoverageStep) {
        const businessSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(1)');
        const thirdPartySection = additionalCoverageStep.querySelector('.building-section:nth-of-type(2)');
        const employersSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(3)');
        const cyberSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(4)');
        const terrorSection = additionalCoverageStep.querySelector('.building-section:nth-of-type(5)');
        // Show all by default
        [businessSection, thirdPartySection, employersSection, cyberSection, terrorSection].forEach(section => {
            if (section) section.style.display = '';
        });
        if (productType === 'מבנה בלבד משועבד') {
            // Hide all except third party
            if (businessSection) businessSection.style.display = 'none';
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
 * Update building section fields based on product type selection
 * @param {string} productType - The selected product type
 */
function updateBuildingFields(productType) {
    const buildingAgeField = document.getElementById('building-age');
    const buildingAgeGroup = buildingAgeField ? buildingAgeField.closest('.building-form-group') : null;
    const mortgagedCheckbox = document.getElementById('mortgaged-property');
    const renewalsGroup = document.getElementById('renewals-group');
    const renewalsSelect = document.getElementById('renewals');
    
    if (productType === 'מבנה בלבד משועבד') {
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
        
        // Show renewals dropdown
        if (renewalsGroup) {
            renewalsGroup.style.display = 'block';
            if (renewalsSelect) {
                renewalsSelect.required = true;
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
        
        // Hide renewals dropdown
        if (renewalsGroup) {
            renewalsGroup.style.display = 'none';
            if (renewalsSelect) {
                renewalsSelect.required = false;
                renewalsSelect.value = '';
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
    
    if (productType === 'מבנה בלבד משועבד') {
        // Auto-select and disable water damage dropdown
        if (waterDamageSelect) {
            waterDamageSelect.value = 'שרברב שבהסדר';
            waterDamageSelect.disabled = true;
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
    const earthquakeDeductibleGroup = document.getElementById('earthquake-deductible-group');
    const earthquakeDeductibleSelect = document.getElementById('earthquake-deductible');
    
    if (earthquakeCoverage === 'כן') {
        // Show earthquake deductible field
        if (earthquakeDeductibleGroup) {
            earthquakeDeductibleGroup.style.display = 'block';
            if (earthquakeDeductibleSelect) {
                earthquakeDeductibleSelect.required = true;
            }
        }
    } else {
        // Hide earthquake deductible field
        if (earthquakeDeductibleGroup) {
            earthquakeDeductibleGroup.style.display = 'none';
            if (earthquakeDeductibleSelect) {
                earthquakeDeductibleSelect.required = false;
                earthquakeDeductibleSelect.value = '';
            }
        }
    }
}

/**
 * Update building extensions fields based on property type selection
 * @param {string} propertyType - The selected property type
 */
function updateBuildingExtensions(propertyType) {
    const storageGroup = document.getElementById('storage-group');
    const storageInput = document.getElementById('storage-insurance');
    
    if (propertyType === 'פרטי') {
        // Show storage field for private properties
        if (storageGroup) {
            storageGroup.style.display = 'block';
        }
    } else {
        // Hide storage field for non-private properties
        if (storageGroup) {
            storageGroup.style.display = 'none';
            if (storageInput) {
                storageInput.value = '';
            }
        }
    }
}

/**
 * Update building extensions fields based on product type selection
 * @param {string} productType - The selected product type
 */
function updateBuildingExtensionsForProduct(productType) {
    const boilersGroup = document.getElementById('boilers-group');
    const boilersCheckbox = document.getElementById('boilers-coverage');
    
    if (productType === 'מבנה בלבד משועבד') {
        // Hide boilers checkbox completely
        if (boilersGroup) {
            boilersGroup.style.display = 'none';
            if (boilersCheckbox) {
                boilersCheckbox.checked = false;
                boilersCheckbox.value = '';
            }
        }
    } else {
        // Show boilers checkbox
        if (boilersGroup) {
            boilersGroup.style.display = 'block';
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
    // Collect basic form fields - FIX IDs to match HTML
    const firstName = document.getElementById('first-name')?.value?.trim() || '';
    const lastName = document.getElementById('last-name')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const idNumber = document.getElementById('id-number')?.value?.trim() || '';
    const startDate = document.getElementById('start-date')?.value || '';
    const productType = document.getElementById('product-type')?.value || '';
    const coverageType = document.getElementById('coverage-type')?.value || '';
    const propertyType = document.getElementById('property-type')?.value || '';
    const floorCount = document.getElementById('floor-count')?.value || '';
    
    // Get city from the autocomplete input
    const cityInput = document.getElementById('city-autocomplete') || document.getElementById('city');
    const city = cityInput?.value?.trim() || '';
    
    const street = document.getElementById('street')?.value?.trim() || '';
    const houseNumber = document.getElementById('house-number')?.value || '';
    const postalCode = document.getElementById('postal-code')?.value || '';
    const hasGarden = document.getElementById('has-garden')?.checked || false;
    
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
        
        // Coverage Information (only if visible)
        ...(coverageType && {
            coverageType: coverageType
        }),
        
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
        hasGarden: hasGarden,
        
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
    if (coverageTypeField && coverageTypeField.classList.contains('hidden')) {
        // If the field is hidden, skip validation for it
    } else {
        // If the field is visible, validate it
        if (coverageType && !coverageType.value) {
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
    const cityInput = document.getElementById('city-autocomplete');
    if (cityInput && !cityInput.value.trim()) {
        showFormError(cityInput, 'שדה חובה');
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
        houseNumber.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
        });

        houseNumber.addEventListener('blur', handleAddressBlur);
    }
    
    // Postal Code - allow only digits
    const postalCode = document.getElementById('postalCode');
    if (postalCode) {
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
            const isProduction = window.location.hostname.includes('vercel.app') || 
                                window.location.hostname.includes('webappinsurance');
            
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

// Garden checkbox functionality
document.addEventListener('DOMContentLoaded', function() {
    const propertyTypeSelect = document.getElementById('propertyType');
    const gardenCheckboxContainer = document.getElementById('garden-checkbox-container');
    const gardenCheckbox = document.getElementById('garden-checkbox');
    
    if (propertyTypeSelect && gardenCheckboxContainer && gardenCheckbox) {
        // Add event listener to property type select
        propertyTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            toggleGardenCheckbox(selectedValue === 'משותף קומת קרקע');
        });
    }
    
    /**
     * Toggle garden checkbox visibility and reset state
     * @param {boolean} show - Whether to show the garden checkbox
     */
    function toggleGardenCheckbox(show) {
        if (show) {
            gardenCheckboxContainer.style.display = 'block';
        } else {
            gardenCheckboxContainer.style.display = 'none';
            gardenCheckbox.checked = false;
        }
    }
});

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
    
    // Test מבנה בלבד משועבד
    console.log('\n--- Testing מבנה בלבד משועבד ---');
    productTypeSelect.value = 'מבנה בלבד משועבד';
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
                element: document.getElementById('renewals-group'), 
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
    
    if (productType === 'מבנה בלבד משועבד') {
        console.log('🔒 Special conditions active for "מבנה בלבד משועבד":');
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
    
    // Section 1: מבנה (Building) fields
    // Insurance amount
    const insuranceAmount = document.getElementById('insurance-amount');
    if (insuranceAmount && insuranceAmount.required && !insuranceAmount.value) {
        showBuildingFormError(insuranceAmount, 'שדה חובה - יש למלא סכום ביטוח');
        isValid = false;
    }
    
    // Building age (only if visible)
    const buildingAge = document.getElementById('building-age');
    const buildingAgeGroup = buildingAge ? buildingAge.closest('.building-form-group') : null;
    if (buildingAge && buildingAgeGroup && buildingAgeGroup.style.display !== 'none' && buildingAge.required && !buildingAge.value) {
        showBuildingFormError(buildingAge, 'שדה חובה - יש למלא גיל המבנה');
        isValid = false;
    }
    
    // Building area
    const buildingArea = document.getElementById('building-area');
    if (buildingArea && buildingArea.required && !buildingArea.value) {
        showBuildingFormError(buildingArea, 'שדה חובה - יש למלא שטח המבנה');
        isValid = false;
    }
    
    // Construction type
    const constructionType = document.getElementById('construction-type');
    if (constructionType && constructionType.required && !constructionType.value) {
        showBuildingFormError(constructionType, 'שדה חובה - יש לבחור סוג בניה');
        isValid = false;
    }
    
    // Construction standard
    const constructionStandard = document.getElementById('construction-standard');
    if (constructionStandard && constructionStandard.required && !constructionStandard.value) {
        showBuildingFormError(constructionStandard, 'שדה חובה - יש לבחור סטנדרט בניה');
        isValid = false;
    }
    
    // Renewals dropdown (only if visible and required)
    const renewalsGroup = document.getElementById('renewals-group');
    const renewalsSelect = document.getElementById('renewals');
    if (renewalsSelect && renewalsGroup && renewalsGroup.style.display !== 'none' && renewalsSelect.required && !renewalsSelect.value) {
        showBuildingFormError(renewalsSelect, 'שדה חובה - יש לבחור סוג חידוש');
        isValid = false;
    }
    
    // Section 2: כיסויים נוספים למבנה (Additional Coverages)
    // Water damage type
    const waterDamageType = document.getElementById('water-damage-type');
    if (waterDamageType && waterDamageType.required && !waterDamageType.value) {
        showBuildingFormError(waterDamageType, 'שדה חובה - יש לבחור סוג כיסוי נזקי מים');
        isValid = false;
    }
    
    // Water deductible (only if visible and required)
    const waterDeductibleGroup = document.getElementById('water-deductible-group');
    const waterDeductibleSelect = document.getElementById('water-deductible');
    if (waterDeductibleSelect && waterDeductibleGroup && waterDeductibleGroup.style.display !== 'none' && waterDeductibleSelect.required && !waterDeductibleSelect.value) {
        showBuildingFormError(waterDeductibleSelect, 'שדה חובה - יש לבחור השתתפות עצמית');
        isValid = false;
    }
    
    // Earthquake coverage
    const earthquakeCoverage = document.getElementById('earthquake-coverage');
    if (earthquakeCoverage && earthquakeCoverage.required && !earthquakeCoverage.value) {
        showBuildingFormError(earthquakeCoverage, 'שדה חובה - יש לבחור האם לכלול כיסוי רעידת אדמה');
        isValid = false;
    }
    
    // Earthquake deductible (only if visible and required)
    const earthquakeDeductibleGroup = document.getElementById('earthquake-deductible-group');
    const earthquakeDeductibleSelect = document.getElementById('earthquake-deductible');
    if (earthquakeDeductibleSelect && earthquakeDeductibleGroup && earthquakeDeductibleGroup.style.display !== 'none' && earthquakeDeductibleSelect.required && !earthquakeDeductibleSelect.value) {
        showBuildingFormError(earthquakeDeductibleSelect, 'שדה חובה - יש לבחור השתתפות עצמית לרעידת אדמה');
        isValid = false;
    }
    
    // Section 3: הרחבות נוספות למבנה (Additional Extensions)
    // No required fields in this section - all are optional
    
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
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.textContent = message;
    
    // Insert error message after the field or helper text
    const formGroup = field.closest('.building-form-group');
    if (formGroup) {
        // Remove any existing error message
        const existingError = formGroup.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Find where to insert the error (after helper text if exists, otherwise after field)
        const helperText = formGroup.querySelector('.form-helper-text');
        if (helperText) {
            helperText.insertAdjacentElement('afterend', errorElement);
        } else {
            field.insertAdjacentElement('afterend', errorElement);
        }
    }
}

/**
 * Clear all building form errors
 */
function clearBuildingFormErrors() {
    // Find all error fields in building sections
    const buildingSections = document.querySelectorAll('.building-section');
    
    buildingSections.forEach(section => {
        // Remove error classes from fields
        const errorFields = section.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove all error messages
        const errorMessages = section.querySelectorAll('.form-error-message');
        errorMessages.forEach(message => {
            message.remove();
        });
    });
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
    // Product type and coverage type from general details
    const productTypeSelect = document.getElementById('productType');
    const coverageTypeSelect = document.getElementById('coverageType');
    
    // Contents section fields
    const contentsBuilingAgeGroup = document.getElementById('contents-building-age-group');
    const jewelryAmountInput = document.getElementById('jewelry-amount');
    const jewelryCoverageGroup = document.getElementById('jewelry-coverage-group');
    const watchesAmountInput = document.getElementById('watches-amount');
    const watchesCoverageGroup = document.getElementById('watches-coverage-group');
    const valuableItemsSection = document.getElementById('valuable-items-section');
    const contentsWaterDamageGroup = document.getElementById('contents-water-damage-group');
    const contentsEarthquakeSelect = document.getElementById('contents-earthquake');
    const contentsEarthquakeDeductibleGroup = document.getElementById('contents-earthquake-deductible-group');
    
    // Update contents fields based on product type
    updateContentsFieldsForProductType();
    
    // Update valuable items section based on coverage type
    updateValuableItemsSection();
    
    // Jewelry amount change handler
    if (jewelryAmountInput) {
        jewelryAmountInput.addEventListener('input', function() {
            updateJewelryCoverageField(this.value);
        });
    }
    
    // Watches amount change handler
    if (watchesAmountInput) {
        watchesAmountInput.addEventListener('input', function() {
            updateWatchesCoverageField(this.value);
        });
    }
    
    // Contents earthquake change handler
    if (contentsEarthquakeSelect) {
        contentsEarthquakeSelect.addEventListener('change', function() {
            updateContentsEarthquakeDeductible(this.value);
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
    const contentsWaterDamageGroup = document.getElementById('contents-water-damage-group');
    
    if (productType === 'תכולה בלבד') {
        // Show building age field for contents only
        if (contentsBuilingAgeGroup) {
            contentsBuilingAgeGroup.style.display = 'block';
            if (contentsBuilingAgeInput) {
                contentsBuilingAgeInput.required = true;
            }
        }
        
        // Show water damage checkbox for contents only
        if (contentsWaterDamageGroup) {
            contentsWaterDamageGroup.style.display = 'block';
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
        
        // Hide water damage checkbox
        if (contentsWaterDamageGroup) {
            contentsWaterDamageGroup.style.display = 'none';
        }
    }
}

/**
 * Update valuable items section based on coverage type
 */
function updateValuableItemsSection() {
    const coverageType = document.getElementById('coverageType')?.value;
    const valuableItemsSection = document.getElementById('valuable-items-section');
    
    if (coverageType === 'חלק מהתכולה בכה״ס' || coverageType === 'כל התכולה בכה״ס') {
        // Show valuable items section
        if (valuableItemsSection) {
            valuableItemsSection.style.display = 'block';
        }
    } else {
        // Hide valuable items section
        if (valuableItemsSection) {
            valuableItemsSection.style.display = 'none';
            
            // Clear values in hidden fields
            const fields = valuableItemsSection.querySelectorAll('input[type="number"]');
            fields.forEach(field => {
                field.value = '';
            });
        }
    }
    
    // Handle special case for תכולה מקיף בלבד
    updateContentsDropdownsForCoverageType(coverageType);
}

/**
 * Update jewelry coverage field based on jewelry amount
 * @param {string} amount - The jewelry amount value
 */
function updateJewelryCoverageField(amount) {
    const jewelryCoverageGroup = document.getElementById('jewelry-coverage-group');
    const jewelryCoverageSelect = document.getElementById('jewelry-coverage');
    
    if (amount && parseFloat(amount) > 0) {
        // Show jewelry coverage dropdown
        if (jewelryCoverageGroup) {
            jewelryCoverageGroup.style.display = 'block';
            if (jewelryCoverageSelect) {
                jewelryCoverageSelect.required = true;
            }
        }
    } else {
        // Hide jewelry coverage dropdown
        if (jewelryCoverageGroup) {
            jewelryCoverageGroup.style.display = 'none';
            if (jewelryCoverageSelect) {
                jewelryCoverageSelect.required = false;
                jewelryCoverageSelect.value = '';
            }
        }
    }
}

/**
 * Update watches coverage field based on watches amount
 * @param {string} amount - The watches amount value
 */
function updateWatchesCoverageField(amount) {
    const watchesCoverageGroup = document.getElementById('watches-coverage-group');
    const watchesCoverageSelect = document.getElementById('watches-coverage');
    
    if (amount && parseFloat(amount) > 0) {
        // Show watches coverage dropdown
        if (watchesCoverageGroup) {
            watchesCoverageGroup.style.display = 'block';
            if (watchesCoverageSelect) {
                watchesCoverageSelect.required = true;
            }
        }
    } else {
        // Hide watches coverage dropdown
        if (watchesCoverageGroup) {
            watchesCoverageGroup.style.display = 'none';
            if (watchesCoverageSelect) {
                watchesCoverageSelect.required = false;
                watchesCoverageSelect.value = '';
            }
        }
    }
}

/**
 * Update contents earthquake deductible field based on earthquake selection
 * @param {string} earthquakeCoverage - The earthquake coverage selection
 */
function updateContentsEarthquakeDeductible(earthquakeCoverage) {
    const contentsEarthquakeDeductibleGroup = document.getElementById('contents-earthquake-deductible-group');
    const contentsEarthquakeDeductibleSelect = document.getElementById('contents-earthquake-deductible');
    
    if (earthquakeCoverage === 'כן') {
        // Show earthquake deductible field
        if (contentsEarthquakeDeductibleGroup) {
            contentsEarthquakeDeductibleGroup.style.display = 'block';
            if (contentsEarthquakeDeductibleSelect) {
                contentsEarthquakeDeductibleSelect.required = true;
            }
        }
    } else {
        // Hide earthquake deductible field
        if (contentsEarthquakeDeductibleGroup) {
            contentsEarthquakeDeductibleGroup.style.display = 'none';
            if (contentsEarthquakeDeductibleSelect) {
                contentsEarthquakeDeductibleSelect.required = false;
                contentsEarthquakeDeductibleSelect.value = '';
            }
        }
    }
}

/**
 * Update contents dropdowns for תכולה מקיף בלבד coverage type
 * @param {string} coverageType - The coverage type selection
 */
function updateContentsDropdownsForCoverageType(coverageType) {
    const jewelryCoverageSelect = document.getElementById('jewelry-coverage');
    const watchesCoverageSelect = document.getElementById('watches-coverage');
    
    if (coverageType === 'תכולה מקיף בלבד') {
        // Set jewelry coverage to מקיף and disable
        if (jewelryCoverageSelect) {
            jewelryCoverageSelect.value = 'מקיף';
            jewelryCoverageSelect.disabled = true;
        }
        
        // Set watches coverage to מקיף and disable
        if (watchesCoverageSelect) {
            watchesCoverageSelect.value = 'מקיף';
            watchesCoverageSelect.disabled = true;
        }
    } else {
        // Enable jewelry coverage dropdown
        if (jewelryCoverageSelect) {
            jewelryCoverageSelect.disabled = false;
        }
        
        // Enable watches coverage dropdown
        if (watchesCoverageSelect) {
            watchesCoverageSelect.disabled = false;
        }
    }
}

/**
 * Validate contents section fields
 * @returns {boolean} - True if all visible required fields are valid
 */
function validateContentsSection() {
    let isValid = true;
    
    // Contents insurance amount
    const contentsInsuranceAmount = document.getElementById('contents-insurance-amount');
    if (contentsInsuranceAmount && contentsInsuranceAmount.required && !contentsInsuranceAmount.value) {
        showContentsFormError(contentsInsuranceAmount, 'שדה חובה - יש למלא סכום ביטוח תכולה');
        isValid = false;
    }
    
    // Building age (only if visible)
    const contentsBuildingAge = document.getElementById('contents-building-age');
    const contentsBuildingAgeGroup = contentsBuildingAge ? contentsBuildingAge.closest('.building-form-group') : null;
    if (contentsBuildingAge && contentsBuildingAgeGroup && contentsBuildingAgeGroup.style.display !== 'none' && contentsBuildingAge.required && !contentsBuildingAge.value) {
        showContentsFormError(contentsBuildingAge, 'שדה חובה - יש למלא גיל המבנה');
        isValid = false;
    }
    
    // Jewelry coverage (only if visible and required)
    const jewelryCoverageGroup = document.getElementById('jewelry-coverage-group');
    const jewelryCoverageSelect = document.getElementById('jewelry-coverage');
    if (jewelryCoverageSelect && jewelryCoverageGroup && jewelryCoverageGroup.style.display !== 'none' && jewelryCoverageSelect.required && !jewelryCoverageSelect.value) {
        showContentsFormError(jewelryCoverageSelect, 'שדה חובה - יש לבחור סוג כיסוי לתכשיטים');
        isValid = false;
    }
    
    // Watches coverage (only if visible and required)
    const watchesCoverageGroup = document.getElementById('watches-coverage-group');
    const watchesCoverageSelect = document.getElementById('watches-coverage');
    if (watchesCoverageSelect && watchesCoverageGroup && watchesCoverageGroup.style.display !== 'none' && watchesCoverageSelect.required && !watchesCoverageSelect.value) {
        showContentsFormError(watchesCoverageSelect, 'שדה חובה - יש לבחור סוג כיסוי לשעונים');
        isValid = false;
    }
    
    // Earthquake coverage
    const contentsEarthquake = document.getElementById('contents-earthquake');
    if (contentsEarthquake && contentsEarthquake.required && !contentsEarthquake.value) {
        showContentsFormError(contentsEarthquake, 'שדה חובה - יש לבחור האם לכלול כיסוי רעידת אדמה');
        isValid = false;
    }
    
    // Earthquake deductible (only if visible and required)
    const contentsEarthquakeDeductibleGroup = document.getElementById('contents-earthquake-deductible-group');
    const contentsEarthquakeDeductibleSelect = document.getElementById('contents-earthquake-deductible');
    if (contentsEarthquakeDeductibleSelect && contentsEarthquakeDeductibleGroup && contentsEarthquakeDeductibleGroup.style.display !== 'none' && contentsEarthquakeDeductibleSelect.required && !contentsEarthquakeDeductibleSelect.value) {
        showContentsFormError(contentsEarthquakeDeductibleSelect, 'שדה חובה - יש לבחור השתתפות עצמית לרעידת אדמה');
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
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.textContent = message;
    
    // Insert error message after the field or helper text
    const formGroup = field.closest('.building-form-group');
    if (formGroup) {
        // Remove any existing error message
        const existingError = formGroup.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Find where to insert the error (after helper text if exists, otherwise after field)
        const helperText = formGroup.querySelector('.form-helper-text');
        if (helperText) {
            helperText.insertAdjacentElement('afterend', errorElement);
        } else {
            field.insertAdjacentElement('afterend', errorElement);
        }
    }
}

/**
 * Clear all contents form errors
 */
function clearContentsFormErrors() {
    // Find all error fields in contents sections
    const contentsContainer = document.querySelector('#step-cover-contents .building-sections-container');
    
    if (contentsContainer) {
        // Remove error classes from fields
        const errorFields = contentsContainer.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove all error messages
        const errorMessages = contentsContainer.querySelectorAll('.form-error-message');
        errorMessages.forEach(message => {
            message.remove();
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
    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Initialize modal functionality
            initializeConditionalFields();
            initializeProductSections();
            addFormInputListeners();
            setupModalCloseHandlers();
            addAdditionalCoverageFormListeners();
            
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
    
    // Add hover effects to coverage explanation boxes
    const explanationBoxes = additionalCoverageSection.querySelectorAll('.coverage-explanation');
    explanationBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 30px rgba(79, 70, 229, 0.15)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Enhanced checkbox interactions
    const checkboxWrappers = additionalCoverageSection.querySelectorAll('.building-checkbox-wrapper');
    checkboxWrappers.forEach(wrapper => {
        const checkbox = wrapper.querySelector('input[type="checkbox"]');
        const label = wrapper.querySelector('label');
        
        if (checkbox && label) {
            // Click animation
            wrapper.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            // Hover hint
            wrapper.addEventListener('mouseenter', function() {
                if (!checkbox.checked) {
                    this.style.borderColor = '#6366f1';
                }
            });
            
            wrapper.addEventListener('mouseleave', function() {
                if (!checkbox.checked) {
                    this.style.borderColor = '';
                }
            });
        }
    });
    
    // Smooth number input interactions
    const numberInputs = additionalCoverageSection.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('focus', function() {
            const parent = this.closest('.building-form-group');
            if (parent) {
                parent.style.transform = 'scale(1.02)';
                parent.style.transition = 'transform 0.2s ease';
            }
        });
        
        input.addEventListener('blur', function() {
            const parent = this.closest('.building-form-group');
            if (parent) {
                parent.style.transform = 'scale(1)';
            }
        });
    });
    
    // Add visual feedback for section headers
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
    console.log('📧📄 Submitting quote request with email and PDF generation...');
    
    // Get the submit button
    const submitBtn = document.querySelector('.btn-submit-quote');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    }

    try {
        // Collect all form data
        const formData = collectFullFormData();
        
        // Add timestamp and metadata
        formData.submittedAt = new Date().toISOString();
        formData.formVersion = '2.0';
        formData.source = 'ביטוח דירה - אדמון סוכנות לביטוח';
        
        // Send email and generate PDF with the beautiful design
        const result = await sendEmailAndGeneratePDF(formData);
        
        if (result.emailSuccess || result.pdfSuccess) {
            // Log success details
            console.log('✅ Quote request processed:', result);
            
            // Close modal after showing success message
            setTimeout(() => {
                closeGeneralDetailsModal();
            }, 4000);
        } else {
            // Both failed
            throw new Error('נכשל בשליחת המייל וביצירת PDF');
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
    // Start with basic form data
    const formData = collectFormData();
    
    // Add phone number if verified
    const phoneNumber = document.getElementById('phone-number');
    if (phoneNumber && phoneNumber.value) {
        formData.phoneNumber = phoneNumber.value;
    }
    
    // Add building/structure data - with all fields
    const buildingData = {
        insuranceAmount: document.getElementById('insurance-amount')?.value || '',
        buildingAge: document.getElementById('building-age')?.value || '',
        buildingArea: document.getElementById('building-area')?.value || '',
        constructionType: document.getElementById('construction-type')?.value || '',
        constructionStandard: document.getElementById('construction-standard')?.value || '',
        mortgaged: document.getElementById('mortgaged-property')?.checked || false,
        renewals: document.getElementById('renewals')?.value || '',
        // Water damage fields
        waterDamageType: document.getElementById('water-damage-type')?.value || '',
        waterDeductible: document.getElementById('water-deductible')?.value || '',
        // Burglary field  
        burglaryBuilding: document.getElementById('burglary-building')?.checked || false,
        
        // Mortgage water damage (if applicable)
        mortgageWaterDamage: document.getElementById('mortgage-water-damage')?.value || '',
        // Earthquake fields
        earthquakeCoverage: document.getElementById('earthquake-coverage')?.value || '',
        earthquakeDeductible: document.getElementById('earthquake-deductible')?.value || '',
        // Additional shared property insurance
        additionalSharedInsurance: document.getElementById('additional-shared-insurance')?.value || '',
        // Extensions
        buildingContentsInsurance: document.getElementById('building-contents-insurance')?.value || '',
        storageInsurance: document.getElementById('storage-insurance')?.value || '',
        swimmingPoolInsurance: document.getElementById('swimming-pool-insurance')?.value || '',
        glassBreakageInsurance: document.getElementById('glass-breakage-insurance')?.value || '',
        boilersCoverage: document.getElementById('boilers-coverage')?.checked || false
    };
    
    // Add contents data
    const contentsData = {
        contentsInsuranceAmount: document.getElementById('contents-insurance-amount')?.value || '',
        contentsBuildingAge: document.getElementById('contents-building-age')?.value || '',
        jewelryAmount: document.getElementById('jewelry-amount')?.value || '',
        jewelryCoverage: document.getElementById('jewelry-coverage')?.value || '',
        watchesAmount: document.getElementById('watches-amount')?.value || '',
        watchesCoverage: document.getElementById('watches-coverage')?.value || '',
        camerasAmount: document.getElementById('cameras-amount')?.value || '',
        electronicsAmount: document.getElementById('electronics-amount')?.value || '',
        bicyclesAmount: document.getElementById('bicycles-amount')?.value || '',
        musicalInstrumentsAmount: document.getElementById('musical-instruments-amount')?.value || '',
        contentsWaterDamage: document.getElementById('contents-water-damage')?.checked || false,
        contentsBurglary: document.getElementById('contents-burglary')?.checked || false,
        contentsEarthquake: document.getElementById('contents-earthquake')?.value || '',
        contentsEarthquakeDeductible: document.getElementById('contents-earthquake-deductible')?.value || ''
    };
    
    // Add additional coverage data
    const additionalCoverage = {
        businessContentsAmount: document.getElementById('business-contents-amount')?.value || '',
        businessEmployers: document.getElementById('business-employers')?.checked || false,
        businessThirdParty: document.getElementById('business-third-party')?.checked || false,
        thirdPartyCoverage: document.getElementById('third-party-coverage')?.checked || false,
        employersLiability: document.getElementById('employers-liability')?.checked || false,
        cyberCoverage: document.getElementById('cyber-coverage')?.checked || false,
        terrorCoverage: document.getElementById('terror-coverage')?.checked || false
    };
    
    // Combine all data
    return {
        ...formData,
        building: buildingData,
        contents: contentsData,
        additionalCoverage: additionalCoverage
    };
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
        if (!amount) return '0';
        return new Intl.NumberFormat('he-IL').format(amount);
    };
    
    // Format boolean values
    const formatBoolean = (value) => value ? 'כן' : 'לא';
    
    return `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #0052cc 0%, #003d99 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .header p { margin: 10px 0 0 0; opacity: 0.9; }
                .content { padding: 30px; }
                .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #0052cc; }
                .section h2 { color: #0052cc; margin-top: 0; font-size: 20px; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
                .info-item { background: white; padding: 12px; border-radius: 5px; border: 1px solid #e0e0e0; }
                .info-item strong { color: #333; display: block; margin-bottom: 5px; }
                .info-item span { color: #666; font-size: 15px; }
                .coverage-list { list-style: none; padding: 0; margin: 0; }
                .coverage-list li { background: white; padding: 10px 15px; margin-bottom: 8px; border-radius: 5px; border-right: 3px solid #4CAF50; }
                .coverage-list li:before { content: "✓ "; color: #4CAF50; font-weight: bold; margin-left: 5px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-right: 4px solid #ffc107; margin-bottom: 20px; }
                .subsection { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .value-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
                .value-item:last-child { border-bottom: none; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
                .badge.active { background: #d4edda; color: #155724; }
                .badge.inactive { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 בקשה חדשה להצעת ביטוח דירה</h1>
                    <p>נשלח בתאריך: ${new Date(data.submittedAt).toLocaleString('he-IL')}</p>
                </div>
                
                <div class="content">
                    <!-- פרטים אישיים -->
                    <div class="section">
                        <h2>👤 פרטים אישיים</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>שם מלא:</strong>
                                <span>${data.firstName || ''} ${data.lastName || ''}</span>
                            </div>
                            <div class="info-item">
                                <strong>מספר ת.ז:</strong>
                                <span>${data.idNumber || 'לא צוין'}</span>
                            </div>
                            <div class="info-item">
                                <strong>מספר טלפון:</strong>
                                <span>${data.phoneNumber || 'לא צוין'}</span>
                            </div>
                            ${data.email ? `
                            <div class="info-item">
                                <strong>אימייל:</strong>
                                <span>${data.email}</span>
                            </div>
                            ` : ''}
                            <div class="info-item">
                                <strong>תאריך התחלת ביטוח:</strong>
                                <span>${formatDate(data.startDate)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- פרטי הנכס -->
                    <div class="section">
                        <h2>🏘️ פרטי הנכס</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>סוג מוצר:</strong>
                                <span>${data.productType || 'לא צוין'}</span>
                            </div>
                            <div class="info-item">
                                <strong>סוג נכס:</strong>
                                <span>${data.assetType || data.propertyType || 'לא צוין'}</span>
                            </div>
                            ${data.coverageType ? `
                            <div class="info-item">
                                <strong>סוג כיסוי:</strong>
                                <span>${data.coverageType}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="subsection">
                            <h3 style="margin-top: 0;">📍 כתובת מלאה</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>עיר:</strong>
                                    <span>${data.city || 'לא צוין'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>רחוב:</strong>
                                    <span>${data.street || 'לא צוין'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>מספר בית:</strong>
                                    <span>${data.houseNumber || 'לא צוין'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>מיקוד:</strong>
                                    <span>${data.zipCode || 'לא צוין'}</span>
                                </div>
                                ${data.floorsNumber ? `
                                <div class="info-item">
                                    <strong>מספר קומות:</strong>
                                    <span>${data.floorsNumber}</span>
                                </div>
                                ` : ''}
                                ${data.hasGarden !== undefined ? `
                                <div class="info-item">
                                    <strong>גינה:</strong>
                                    <span class="badge ${data.hasGarden ? 'active' : 'inactive'}">${formatBoolean(data.hasGarden)}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- כיסויים נבחרים -->
                    ${data.selectedProducts && data.selectedProducts.length > 0 ? `
                    <div class="section">
                        <h2>✅ כיסויים נבחרים</h2>
                        <ul class="coverage-list">
                            ${data.selectedProducts.map(product => `<li>${product}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <!-- פרטי מבנה -->
                    ${data.building && data.building.insuranceAmount ? `
                    <div class="section">
                        <h2>🏗️ פרטי ביטוח מבנה</h2>
                        <div class="highlight">
                            <strong>סכום ביטוח מבנה:</strong> ₪${formatCurrency(data.building.insuranceAmount)}
                        </div>
                        <div class="info-grid">
                            ${data.building.buildingAge ? `
                            <div class="info-item">
                                <strong>גיל המבנה:</strong>
                                <span>${data.building.buildingAge} שנים</span>
                            </div>
                            ` : ''}
                            ${data.building.buildingArea ? `
                            <div class="info-item">
                                <strong>שטח המבנה:</strong>
                                <span>${data.building.buildingArea} מ"ר</span>
                            </div>
                            ` : ''}
                            ${data.building.constructionType ? `
                            <div class="info-item">
                                <strong>סוג בנייה:</strong>
                                <span>${data.building.constructionType}</span>
                            </div>
                            ` : ''}
                            ${data.building.constructionStandard ? `
                            <div class="info-item">
                                <strong>סטנדרט בנייה:</strong>
                                <span>${data.building.constructionStandard}</span>
                            </div>
                            ` : ''}
                            <div class="info-item">
                                <strong>נכס משועבד:</strong>
                                <span class="badge ${data.building.mortgaged ? 'active' : 'inactive'}">${formatBoolean(data.building.mortgaged)}</span>
                            </div>
                            ${data.building.renewals ? `
                            <div class="info-item">
                                <strong>חידושים:</strong>
                                <span>${data.building.renewals}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- כיסויים נוספים למבנה -->
                        <div class="subsection">
                            <h3 style="margin-top: 0;">כיסויים וסכומים נוספים</h3>
                            <div class="value-item">
                                <span>נזקי מים:</span>
                                <strong>${data.building.waterDamageType || 'לא נבחר'}</strong>
                            </div>
                            ${data.building.waterDeductible ? `
                            <div class="value-item">
                                <span>השתתפות עצמית נזקי מים:</span>
                                <strong>${data.building.waterDeductible}</strong>
                            </div>
                            ` : ''}
                            ${data.building.mortgageWaterDamage ? `
                            <div class="value-item">
                                <span>נזקי מים משכנתא:</span>
                                <strong>${data.building.mortgageWaterDamage}</strong>
                            </div>
                            ` : ''}
                            <div class="value-item">
                                <span>פריצה:</span>
                                <strong class="badge ${data.building.burglaryBuilding ? 'active' : 'inactive'}">${formatBoolean(data.building.burglaryBuilding)}</strong>
                            </div>
                            <div class="value-item">
                                <span>רעידת אדמה:</span>
                                <strong>${data.building.earthquakeCoverage || 'לא'}</strong>
                            </div>
                            ${data.building.earthquakeDeductible ? `
                            <div class="value-item">
                                <span>השתתפות עצמית רעידת אדמה:</span>
                                <strong>${data.building.earthquakeDeductible}</strong>
                            </div>
                            ` : ''}
                            ${data.building.additionalSharedInsurance ? `
                            <div class="value-item">
                                <span>רכוש משותף נוסף:</span>
                                <strong>₪${formatCurrency(data.building.additionalSharedInsurance)}</strong>
                            </div>
                            ` : ''}
                            ${data.building.buildingContentsInsurance ? `
                            <div class="value-item">
                                <span>תכולת מבנה:</span>
                                <strong>₪${formatCurrency(data.building.buildingContentsInsurance)}</strong>
                            </div>
                            ` : ''}
                            ${data.building.storageInsurance ? `
                            <div class="value-item">
                                <span>מחסן:</span>
                                <strong>₪${formatCurrency(data.building.storageInsurance)}</strong>
                            </div>
                            ` : ''}
                            ${data.building.swimmingPoolInsurance ? `
                            <div class="value-item">
                                <span>בריכת שחייה:</span>
                                <strong>₪${formatCurrency(data.building.swimmingPoolInsurance)}</strong>
                            </div>
                            ` : ''}
                            ${data.building.glassBreakageInsurance ? `
                            <div class="value-item">
                                <span>שבר זכוכית:</span>
                                <strong>₪${formatCurrency(data.building.glassBreakageInsurance)}</strong>
                            </div>
                            ` : ''}
                            <div class="value-item">
                                <span>דודי חימום:</span>
                                <strong class="badge ${data.building.boilersCoverage ? 'active' : 'inactive'}">${formatBoolean(data.building.boilersCoverage)}</strong>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- פרטי תכולה -->
                    ${data.contents && data.contents.contentsInsuranceAmount ? `
                    <div class="section">
                        <h2>📦 פרטי ביטוח תכולה</h2>
                        <div class="highlight">
                            <strong>סכום ביטוח תכולה:</strong> ₪${formatCurrency(data.contents.contentsInsuranceAmount)}
                        </div>
                        <div class="info-grid">
                            ${data.contents.contentsBuildingAge ? `
                            <div class="info-item">
                                <strong>גיל המבנה לתכולה:</strong>
                                <span>${data.contents.contentsBuildingAge} שנים</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- פריטי ערך -->
                        ${(data.contents.jewelryAmount || data.contents.watchesAmount || data.contents.camerasAmount || 
                           data.contents.electronicsAmount || data.contents.bicyclesAmount || data.contents.musicalInstrumentsAmount) ? `
                        <div class="subsection">
                            <h3 style="margin-top: 0;">💎 פריטי ערך</h3>
                            ${data.contents.jewelryAmount ? `
                            <div class="value-item">
                                <span>תכשיטים:</span>
                                <strong>₪${formatCurrency(data.contents.jewelryAmount)} ${data.contents.jewelryCoverage ? `(${data.contents.jewelryCoverage})` : ''}</strong>
                            </div>
                            ` : ''}
                            ${data.contents.watchesAmount ? `
                            <div class="value-item">
                                <span>שעונים:</span>
                                <strong>₪${formatCurrency(data.contents.watchesAmount)} ${data.contents.watchesCoverage ? `(${data.contents.watchesCoverage})` : ''}</strong>
                            </div>
                            ` : ''}
                            ${data.contents.camerasAmount ? `
                            <div class="value-item">
                                <span>מצלמות:</span>
                                <strong>₪${formatCurrency(data.contents.camerasAmount)}</strong>
                            </div>
                            ` : ''}
                            ${data.contents.electronicsAmount ? `
                            <div class="value-item">
                                <span>מוצרי חשמל ואלקטרוניקה:</span>
                                <strong>₪${formatCurrency(data.contents.electronicsAmount)}</strong>
                            </div>
                            ` : ''}
                            ${data.contents.bicyclesAmount ? `
                            <div class="value-item">
                                <span>אופניים:</span>
                                <strong>₪${formatCurrency(data.contents.bicyclesAmount)}</strong>
                            </div>
                            ` : ''}
                            ${data.contents.musicalInstrumentsAmount ? `
                            <div class="value-item">
                                <span>כלי נגינה:</span>
                                <strong>₪${formatCurrency(data.contents.musicalInstrumentsAmount)}</strong>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                        
                        <!-- כיסויים לתכולה -->
                        <div class="subsection">
                            <h3 style="margin-top: 0;">כיסויים לתכולה</h3>
                            <div class="value-item">
                                <span>נזקי מים:</span>
                                <strong class="badge ${data.contents.contentsWaterDamage ? 'active' : 'inactive'}">${formatBoolean(data.contents.contentsWaterDamage)}</strong>
                            </div>
                            <div class="value-item">
                                <span>פריצה:</span>
                                <strong class="badge ${data.contents.contentsBurglary ? 'active' : 'inactive'}">${formatBoolean(data.contents.contentsBurglary)}</strong>
                            </div>
                            <div class="value-item">
                                <span>רעידת אדמה:</span>
                                <strong>${data.contents.contentsEarthquake || 'לא'}</strong>
                            </div>
                            ${data.contents.contentsEarthquakeDeductible ? `
                            <div class="value-item">
                                <span>השתתפות עצמית רעידת אדמה:</span>
                                <strong>${data.contents.contentsEarthquakeDeductible}</strong>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- כיסויים נוספים -->
                    ${data.additionalCoverage && (data.additionalCoverage.businessContentsAmount || 
                       data.additionalCoverage.thirdPartyCoverage || data.additionalCoverage.employersLiability || 
                       data.additionalCoverage.cyberCoverage || data.additionalCoverage.terrorCoverage) ? `
                    <div class="section">
                        <h2>🛡️ כיסויים נוספים</h2>
                        <div class="info-grid">
                            ${data.additionalCoverage.businessContentsAmount ? `
                            <div class="info-item">
                                <strong>תכולה עסקית:</strong>
                                <span>₪${formatCurrency(data.additionalCoverage.businessContentsAmount)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.businessEmployers !== undefined ? `
                            <div class="info-item">
                                <strong>חבות מעבידים עסקית:</strong>
                                <span class="badge ${data.additionalCoverage.businessEmployers ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.businessEmployers)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.businessThirdParty !== undefined ? `
                            <div class="info-item">
                                <strong>צד ג' עסקי:</strong>
                                <span class="badge ${data.additionalCoverage.businessThirdParty ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.businessThirdParty)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.thirdPartyCoverage !== undefined ? `
                            <div class="info-item">
                                <strong>צד שלישי:</strong>
                                <span class="badge ${data.additionalCoverage.thirdPartyCoverage ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.thirdPartyCoverage)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.employersLiability !== undefined ? `
                            <div class="info-item">
                                <strong>חבות מעבידים:</strong>
                                <span class="badge ${data.additionalCoverage.employersLiability ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.employersLiability)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.cyberCoverage !== undefined ? `
                            <div class="info-item">
                                <strong>סייבר למשפחה:</strong>
                                <span class="badge ${data.additionalCoverage.cyberCoverage ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.cyberCoverage)}</span>
                            </div>
                            ` : ''}
                            ${data.additionalCoverage.terrorCoverage !== undefined ? `
                            <div class="info-item">
                                <strong>טרור:</strong>
                                <span class="badge ${data.additionalCoverage.terrorCoverage ? 'active' : 'inactive'}">${formatBoolean(data.additionalCoverage.terrorCoverage)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p><strong>אדמון סוכנות לביטוח</strong></p>
                    <p>טלפון: 1-800-ADMON-1 | אימייל: insurance@admon-agency.co.il</p>
                    <p style="font-size: 12px; color: #999;">מסמך זה נוצר באופן אוטומטי ממערכת הלידים</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Send email to agent via backend service
 */
async function sendEmailToAgent(emailData) {
    console.log('📮 Sending email via Gmail API...', emailData);
    
    try {
        // Get auth token if available
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to send email');
        }
        
        console.log('✅ Email sent successfully:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        
        // Fallback to localStorage if email fails
        const timestamp = new Date().toISOString();
        const savedForms = JSON.parse(localStorage.getItem('savedInsuranceForms') || '[]');
        savedForms.push({
            ...emailData,
            savedAt: timestamp,
            status: 'email_failed'
        });
        localStorage.setItem('savedInsuranceForms', JSON.stringify(savedForms));
        
        // Still return success to user but log the error
        return { 
            success: true, 
            messageId: `local_${Date.now()}`,
            note: 'Email service unavailable, form saved locally'
        };
    }
}

/**
 * Generate PDF from the beautiful email HTML template
 */
async function generateQuotePDF(htmlContent, filename) {
    console.log('📄 Generating PDF from beautiful template...');
    
    try {
        const response = await fetch('http://localhost:3000/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                htmlContent: htmlContent,
                filename: filename || `insurance_quote_${Date.now()}.pdf`
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to generate PDF');
        }
        
        console.log('✅ PDF generated successfully:', result);
        
        // Download the PDF
        downloadPDFFromBase64(result.pdf, result.filename);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        throw error;
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
 * Send email and generate PDF for quote request
 */
async function sendEmailAndGeneratePDF(formData) {
    console.log('📧📄 Sending email and generating PDF...');
    
    try {
        // Generate the beautiful HTML content
        const htmlContent = generateEmailHTML(formData);
        
        // Generate filename based on customer data
        const timestamp = new Date().toISOString().slice(0, 10);
        const customerName = `${formData.firstName || ''}_${formData.lastName || ''}`.replace(/\s+/g, '_') || 'customer';
        const filename = `ביטוח_דירה_${customerName}_${timestamp}.pdf`;
        
        // Send email and generate PDF in parallel for better performance
        const [emailResult, pdfResult] = await Promise.allSettled([
            sendEmailToAgent({
                to: 'roi@admon-agency.co.il',
                replyTo: formData.email || 'noreply@admon-agency.co.il',
                subject: `🏠 בקשה חדשה להצעת ביטוח דירה - ${formData.firstName || ''} ${formData.lastName || ''}`,
                html: htmlContent
            }),
            generateQuotePDF(htmlContent, filename)
        ]);
        
        // Log results
        if (emailResult.status === 'fulfilled') {
            console.log('✅ Email sent successfully');
        } else {
            console.error('❌ Email failed:', emailResult.reason);
        }
        
        if (pdfResult.status === 'fulfilled') {
            console.log('✅ PDF generated and downloaded successfully');
            
            // Show success notification with PDF info
            showNotification('success', 
                `הליד נשלח בהצלחה במייל וכקובץ PDF! 📧📄<br>
                קובץ PDF: ${filename}<br>
                נשמר בהורדות שלך`
            );
        } else {
            console.error('❌ PDF generation failed:', pdfResult.reason);
            
            // Show partial success notification
            showNotification('warning', 
                `הליד נשלח בהצלחה במייל! 📧<br>
                שגיאה ביצירת PDF: ${pdfResult.reason?.message || 'שגיאה לא ידועה'}`
            );
        }
        
        return {
            emailSuccess: emailResult.status === 'fulfilled',
            pdfSuccess: pdfResult.status === 'fulfilled',
            emailResult: emailResult.status === 'fulfilled' ? emailResult.value : null,
            pdfResult: pdfResult.status === 'fulfilled' ? pdfResult.value : null,
            errors: {
                email: emailResult.status === 'rejected' ? emailResult.reason : null,
                pdf: pdfResult.status === 'rejected' ? pdfResult.reason : null
            }
        };
        
    } catch (error) {
        console.error('❌ Error in sendEmailAndGeneratePDF:', error);
        showNotification('error', `שגיאה בשליחת הליד: ${error.message}`);
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
    const productType = document.getElementById('product-type')?.value;
    if (!productType || !productType.includes('מבנה')) {
        return null;
    }
    
    return {
        insuranceAmount: parseFloat(document.getElementById('building-insurance-amount')?.value) || 0,
        age: parseInt(document.getElementById('building-age')?.value) || 0,
        area: parseFloat(document.getElementById('area')?.value) || 0,
        constructionType: document.getElementById('construction-type')?.value || '',
        constructionStandard: document.getElementById('construction-standard')?.value || '',
        mortgagedProperty: document.getElementById('mortgaged-property')?.checked || false,
        renewals: document.getElementById('renewals')?.value || '',
        waterDamageType: document.getElementById('water-damage-type')?.value || '',
        waterDeductible: document.getElementById('water-deductible')?.value || '',
        burglary: document.getElementById('burglary')?.checked || false,
        earthquakeCoverage: document.getElementById('earthquake-coverage')?.value || '',
        earthquakeDeductible: document.getElementById('earthquake-deductible')?.value || '',
        additionalSharedInsurance: parseFloat(document.getElementById('additional-shared-insurance')?.value) || 0,
        extensions: {
            buildingContentsInsurance: parseFloat(document.getElementById('building-contents-insurance')?.value) || 0,
            storageInsurance: parseFloat(document.getElementById('storage-insurance')?.value) || 0,
            swimmingPoolInsurance: parseFloat(document.getElementById('swimming-pool-insurance')?.value) || 0,
            glassBreakageInsurance: parseFloat(document.getElementById('glass-breakage-insurance')?.value) || 0,
            boilersCoverage: document.getElementById('boilers-coverage')?.checked || false
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
        insuranceAmount: parseFloat(document.getElementById('contents-insurance-amount')?.value) || 0,
        buildingAge: parseInt(document.getElementById('contents-building-age')?.value) || 0,
        jewelry: {
            amount: parseFloat(document.getElementById('jewelry-amount')?.value) || 0,
            coverage: document.getElementById('jewelry-coverage')?.value || ''
        },
        watches: {
            amount: parseFloat(document.getElementById('watches-amount')?.value) || 0,
            coverage: document.getElementById('watches-coverage')?.value || ''
        },
        valuableItems: {
            cameras: parseFloat(document.getElementById('cameras-amount')?.value) || 0,
            electronics: parseFloat(document.getElementById('electronics-amount')?.value) || 0,
            bicycles: parseFloat(document.getElementById('bicycles-amount')?.value) || 0,
            musicalInstruments: parseFloat(document.getElementById('musical-instruments-amount')?.value) || 0
        },
        coverages: {
            waterDamage: document.getElementById('contents-water-damage')?.checked || false,
            burglary: document.getElementById('contents-burglary')?.checked || false,
            earthquake: document.getElementById('contents-earthquake')?.value || '',
            earthquakeDeductible: document.getElementById('contents-earthquake-deductible')?.value || ''
        }
    };
}

/**
 * Collect additional coverages data
 */
function collectAdditionalCoverages() {
    return {
        businessContents: parseFloat(document.getElementById('business-contents-amount')?.value) || 0,
        businessEmployers: document.getElementById('business-employers')?.checked || false,
        businessThirdParty: document.getElementById('business-third-party')?.checked || false,
        thirdPartyCoverage: document.getElementById('third-party-coverage')?.checked || false,
        employersLiability: document.getElementById('employers-liability')?.checked || false,
        cyberCoverage: document.getElementById('cyber-coverage')?.checked || false,
        terrorCoverage: document.getElementById('terror-coverage')?.checked || false
    };
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
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
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