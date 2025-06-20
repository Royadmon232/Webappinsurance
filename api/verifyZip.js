export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { city, street, house, zipCode } = req.body;

    // Validate required fields
    if (!city || !zipCode) {
        return res.status(400).json({ 
            error: 'Missing required fields: city and zipCode are required' 
        });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_KEY;
    
    if (!GOOGLE_API_KEY) {
        console.error('GOOGLE_MAPS_KEY environment variable is not set');
        return res.status(500).json({ 
            error: 'Server configuration error' 
        });
    }

    try {
        // Build the address string for geocoding
        let address = city;
        if (street) {
            address = `${street}, ${city}`;
            if (house) {
                address = `${street} ${house}, ${city}`;
            }
        }
        address += ', Israel'; // Add country for better accuracy

        console.log(`[API] Geocoding address: ${address}`);

        // Call Google Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            console.log(`[API] Geocoding failed: ${data.status}`);
            return res.status(200).json({
                valid: false,
                officialZip: null,
                userZip: zipCode,
                address: null,
                error: 'Address not found'
            });
        }

        // Get the first result
        const result = data.results[0];
        
        // Extract postal code from the result
        const postalCodeComponent = result.address_components.find(
            component => component.types.includes('postal_code')
        );

        if (!postalCodeComponent) {
            console.log('[API] No postal code found in geocoding result');
            return res.status(200).json({
                valid: false,
                officialZip: null,
                userZip: zipCode,
                address: result.formatted_address,
                error: 'No postal code found for this address'
            });
        }

        const officialZip = postalCodeComponent.long_name;
        const userZipClean = zipCode.replace(/\D/g, ''); // Remove non-digits
        const officialZipClean = officialZip.replace(/\D/g, '');

        // Israeli postal codes are 7 digits, but sometimes only 5 are used
        let isValid = false;
        
        if (userZipClean.length === 7 && officialZipClean.length === 7) {
            // Both have full 7-digit postal codes - compare all digits
            isValid = userZipClean === officialZipClean;
        } else if (userZipClean.length >= 5 && officialZipClean.length >= 5) {
            // At least one has only 5 digits - compare first 5 digits
            isValid = userZipClean.substring(0, 5) === officialZipClean.substring(0, 5);
        }

        console.log(`[API] User zip: ${userZipClean}, Official: ${officialZipClean}, Valid: ${isValid}`);

        return res.status(200).json({
            valid: isValid,
            officialZip: officialZip,
            userZip: zipCode,
            address: result.formatted_address
        });

    } catch (error) {
        console.error('Error in zip verification:', error);
        return res.status(200).json({
            valid: false,
            officialZip: null,
            userZip: zipCode,
            address: null,
            error: 'Internal server error'
        });
    }
} 