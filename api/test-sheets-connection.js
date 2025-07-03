import { google } from 'googleapis';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    tests: {}
  };

  // Test 1: Check environment variables
  testResults.tests.environmentVariables = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
    GOOGLE_SHEETS_RANGE: !!process.env.GOOGLE_SHEETS_RANGE,
    emailValue: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT_SET',
    sheetsId: process.env.GOOGLE_SHEETS_ID || 'NOT_SET',
    sheetsRange: process.env.GOOGLE_SHEETS_RANGE || 'NOT_SET'
  };

  // Test 2: Check private key format
  if (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    let formattedPrivateKey = privateKey;
    
    try {
      // Handle different formats
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        try {
          formattedPrivateKey = Buffer.from(privateKey, 'base64').toString('utf8');
        } catch (e) {
          formattedPrivateKey = privateKey;
        }
      }
      
      formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
      
      testResults.tests.privateKeyFormat = {
        hasBeginHeader: formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----'),
        hasEndFooter: formattedPrivateKey.includes('-----END PRIVATE KEY-----'),
        length: formattedPrivateKey.length,
        isBase64Encoded: !privateKey.includes('BEGIN PRIVATE KEY'),
        preview: formattedPrivateKey.substring(0, 50) + '...'
      };
    } catch (error) {
      testResults.tests.privateKeyFormat = {
        error: error.message
      };
    }
  } else {
    testResults.tests.privateKeyFormat = {
      error: 'Private key not found'
    };
  }

  // Test 3: Try to initialize Google Auth
  try {
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    let formattedPrivateKey = privateKey;
    
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      try {
        formattedPrivateKey = Buffer.from(privateKey, 'base64').toString('utf8');
      } catch (e) {
        formattedPrivateKey = privateKey;
      }
    }
    
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    testResults.tests.authInitialization = {
      success: true,
      message: 'Google Auth JWT initialized successfully'
    };

    // Test 4: Try to authorize
    try {
      await auth.authorize();
      testResults.tests.authorization = {
        success: true,
        message: 'Google Auth authorized successfully'
      };

      // Test 5: Try to access the spreadsheet
      try {
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID
        });

        testResults.tests.spreadsheetAccess = {
          success: true,
          message: 'Spreadsheet accessed successfully',
          title: response.data.properties?.title,
          sheets: response.data.sheets?.map(sheet => sheet.properties?.title) || []
        };

        // Test 6: Try to read from the specified range
        try {
          const rangeResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: process.env.GOOGLE_SHEETS_RANGE || 'לידים!A1:BH1'
          });

          testResults.tests.rangeAccess = {
            success: true,
            message: 'Range accessed successfully',
            values: rangeResponse.data.values || [],
            range: rangeResponse.data.range
          };

        } catch (rangeError) {
          testResults.tests.rangeAccess = {
            success: false,
            error: rangeError.message,
            code: rangeError.code
          };
        }

      } catch (sheetsError) {
        testResults.tests.spreadsheetAccess = {
          success: false,
          error: sheetsError.message,
          code: sheetsError.code
        };
      }

    } catch (authError) {
      testResults.tests.authorization = {
        success: false,
        error: authError.message,
        code: authError.code
      };
    }

  } catch (initError) {
    testResults.tests.authInitialization = {
      success: false,
      error: initError.message
    };
  }

  // Determine overall status
  const allTests = Object.values(testResults.tests);
  const hasErrors = allTests.some(test => test.success === false || test.error);
  
  res.status(hasErrors ? 500 : 200).json({
    success: !hasErrors,
    message: hasErrors ? 'Some tests failed' : 'All tests passed',
    ...testResults
  });
} 