/**
 * Submit Final Form API Endpoint
 * קבלת נתוני הטופס הסופי אחרי אימות מוצלח
 */

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const formData = req.body;
        
        // Basic validation
        if (!formData) {
            return res.status(400).json({ error: 'No form data provided' });
        }
        
        // Log the received data (for debugging)
        console.log('📋 Final form data received:', {
            timestamp: new Date().toISOString(),
            hasPhoneNumber: !!formData.phoneNumber,
            hasEmail: !!formData.email,
            dataKeys: Object.keys(formData).length
        });
        
        // Generate a simple form ID for tracking
        const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // In the future, you can add:
        // - Save to database
        // - Send to email
        // - Send to CRM
        // - Generate PDF
        // - Add to Google Sheets
        
        // For now, just return success
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            formId: formId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error processing form submission:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 