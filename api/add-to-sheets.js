import { google } from 'googleapis';

// Google Sheets setup with better error handling
let auth;
try {
  // Parse the private key more carefully
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not defined');
  }
  
  // Handle different formats of private key
  let formattedPrivateKey = privateKey;
  
  // If the key is base64 encoded, decode it first
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      formattedPrivateKey = Buffer.from(privateKey, 'base64').toString('utf8');
    } catch (e) {
      // If base64 decode fails, use as is
      formattedPrivateKey = privateKey;
    }
  }
  
  // Replace literal \n with actual newlines
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
  
  // Ensure proper key format
  if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Invalid private key format - missing BEGIN PRIVATE KEY header');
  }
  
  if (!formattedPrivateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key format - missing END PRIVATE KEY footer');
  }

  auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: formattedPrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  console.log('Google Auth initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google Auth:', error.message);
  auth = null;
}

const sheets = auth ? google.sheets({ version: 'v4', auth }) : null;

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Google Sheets is properly configured
  if (!auth || !sheets) {
    console.error('Google Sheets not configured properly');
    return res.status(500).json({
      success: false,
      error: 'Google Sheets configuration error',
      message: 'Google Service Account credentials are not properly configured'
    });
  }

  // Check required environment variables
  if (!process.env.GOOGLE_SHEETS_ID) {
    return res.status(500).json({
      success: false,
      error: 'Configuration error',
      message: 'GOOGLE_SHEETS_ID is not defined'
    });
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return res.status(500).json({
      success: false,
      error: 'Configuration error',
      message: 'GOOGLE_SERVICE_ACCOUNT_EMAIL is not defined'
    });
  }

  try {
    const { formData } = req.body;
    
    if (!formData) {
      return res.status(400).json({ 
        error: 'Missing form data',
        message: 'Please provide form data to add to sheets' 
      });
    }

    // Test authentication before proceeding
    try {
      await auth.authorize();
      console.log('Google Auth authorized successfully');
    } catch (authError) {
      console.error('Google Auth authorization failed:', authError);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: 'Failed to authenticate with Google Sheets API',
        details: authError.message
      });
    }

    // Format date helper
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString('he-IL');
      } catch {
        return dateStr;
      }
    };

    // Format currency helper
    const formatCurrency = (amount) => {
      if (!amount || amount === '0') return '';
      return new Intl.NumberFormat('he-IL').format(amount);
    };

    // Format boolean helper
    const formatBoolean = (value) => value ? 'כן' : 'לא';

    // Prepare the row data based on all possible fields
    const rowData = [
      // תאריך ושעה
      new Date().toLocaleDateString('he-IL'),
      new Date().toLocaleTimeString('he-IL'),
      
      // פרטים אישיים
      formData.firstName || '',
      formData.lastName || '',
      formData.idNumber || '',
      formData.phoneNumber || '',
      formData.email || '',
      formatDate(formData.startDate),
      
      // סוג מוצר
      formData.productType || '',
      
      // פרטי נכס
      formData.propertyType || '',
      formData.city || '',
      formData.street || '',
      formData.houseNumber || '',
      formData.postalCode || formData.zipCode || '',
      formData.floorCount || '',
      formatBoolean(formData.hasGarden),
      
      // בנק (אם משועבד)
      formData.selectedBank || '',
      formData.selectedBranch || '',
      
      // ביטוח מבנה
      formData.building?.buildingInsuranceAmount ? formatCurrency(formData.building.buildingInsuranceAmount) : '',
      formData.building?.buildingAge || '',
      formData.building?.buildingArea || '',
      formData.building?.constructionType || '',
      formData.building?.constructionStandard || '',
      formatBoolean(formData.building?.mortgagedProperty),
      formatDate(formData.building?.loanEndDate),
      
      // תוספות מבנה
      formData.building?.hasTerrace || '',
      formData.building?.terraceArea || '',
      formData.building?.hasGarden || '',
      formData.building?.gardenArea || '',
      formData.building?.roofType || '',
      formatBoolean(formData.building?.hasSwimmingPool),
      formData.building?.swimmingPoolValue ? formatCurrency(formData.building.swimmingPoolValue) : '',
      
      // כיסויים למבנה
      formData.building?.waterDamageType || '',
      formData.building?.waterDeductible || '',
      formatBoolean(formData.building?.burglaryBuilding),
      formData.building?.earthquakeCoverage || '',
      formData.building?.earthquakeLandCoverage || '',
      formData.building?.earthquakeCoverageAmount ? formatCurrency(formData.building.earthquakeCoverageAmount) : '',
      
      // ביטוח תכולה
      formData.contents?.contentsValue ? formatCurrency(formData.contents.contentsValue) : '',
      formData.contents?.contentsBuildingAge || '',
      formData.contents?.hasJewelry || '',
      formData.contents?.jewelryAmount ? formatCurrency(formData.contents.jewelryAmount) : '',
      formData.contents?.hasWatches || '',
      formData.contents?.watchesAmount ? formatCurrency(formData.contents.watchesAmount) : '',
      formData.contents?.contentsEarthquakeCoverage || '',
      
      // כיסויים נוספים
      formatBoolean(formData.additionalCoverage?.thirdPartyCoverage),
      formatBoolean(formData.additionalCoverage?.employersLiability),
      formatBoolean(formData.additionalCoverage?.cyberCoverage),
      formatBoolean(formData.additionalCoverage?.terrorCoverage),
      
      // הרחבות נוספות
      formData.building?.additionalSharedInsurance || '',
      formData.building?.buildingContentsInsurance || '',
      formData.building?.storageInsurance || '',
      formData.building?.swimmingPoolInsurance || '',
      formData.building?.mortgageWaterDamage || ''
    ];

    // Log for debugging
    console.log('Adding row to Google Sheets:', {
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: process.env.GOOGLE_SHEETS_RANGE || 'לידים!A:BH',
      rowDataLength: rowData.length
    });

    // Append the row to Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: process.env.GOOGLE_SHEETS_RANGE || 'לידים!A:BH', // 60 columns
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('Successfully added to Google Sheets:', response.data);

    res.status(200).json({
      success: true,
      message: 'Data added to Google Sheets successfully',
      updatedRange: response.data.updates?.updatedRange,
      updatedRows: response.data.updates?.updatedRows
    });

  } catch (error) {
    console.error('Error adding to Google Sheets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add data to Google Sheets',
      message: error.message,
      details: error.response?.data || error
    });
  }
} 