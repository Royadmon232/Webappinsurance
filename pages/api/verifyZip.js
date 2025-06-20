const { URLSearchParams } = require('url');

async function getOfficialZip(address) {
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    if (!apiKey) {
        console.error('Google Maps API key not found.');
        return null;
    }

    const params = new URLSearchParams({
        address: address,
        key: apiKey,
        language: 'iw', // for Hebrew results
    });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Google API error: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            console.warn(`Address not found or no results for: ${address}`);
            return null;
        }

        // Find the best result (street_address or first result)
        const result = data.results.find(r => r.types.includes('street_address')) || data.results[0];
        
        // Find the postal code component
        const postalCodeComponent = result.address_components.find(comp => comp.types.includes('postal_code'));
        
        return postalCodeComponent ? postalCodeComponent.long_name : null;

    } catch (error) {
        console.error('Error fetching from Google Geocoding API:', error);
        return null;
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { city, street, house, userZip } = req.body;

    if (!city || !userZip) {
        return res.status(400).json({ error: 'City and userZip are required.' });
    }

    // Determine if it's a kibbutz or similar (street/house missing)
    const isKibbutzLike = !street && !house;
    
    // Build address string for Google API
    const address = isKibbutzLike
        ? `${city}, Israel`
        : `${house || ''} ${street || ''}, ${city}, Israel`.trim();

    const officialZip = await getOfficialZip(address);

    if (officialZip === null) {
        return res.status(200).json({ valid: false, official: null, error: 'Could not verify address.' });
    }

    const userZipDigits = userZip.replace(/\D/g, '');
    const officialZipDigits = officialZip.replace(/\D/g, '');

    // Google sometimes returns a 5-digit code when a 7-digit one exists.
    // We consider it valid if the user's zip STARTS WITH the official 5-digit one.
    const isValid = userZipDigits.startsWith(officialZipDigits);

    res.status(200).json({
        valid: isValid,
        official: officialZip
    });
} 