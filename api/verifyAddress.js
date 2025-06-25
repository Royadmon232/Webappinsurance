export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { city, street, house } = req.body;

    // Validate required fields
    if (!city || !street || !house) {
        return res.status(400).json({ 
            error: 'Missing required fields: city, street, and house are required' 
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
        // Build the address string for geocoding - keep it in Hebrew
        let address = `${street} ${house}, ${city}, ישראל`;

        console.log(`[API] Verifying address: ${address}`);

        // Call Google Geocoding API with Hebrew language
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=he&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            console.log(`[API] Address not found: ${data.status}`);
            return res.status(200).json({
                valid: false,
                address: null,
                error: 'Address not found'
            });
        }

        // Get the first result
        const result = data.results[0];
        
        console.log('[API] Address found:', result.formatted_address);
        console.log('[API] Location type:', result.geometry.location_type);
        console.log('[API] Geometry:', result.geometry);
        
        // Check if this is a precise address (not interpolated)
        const locationType = result.geometry.location_type;
        const isPreciseLocation = locationType === 'ROOFTOP';
        const isAcceptableLocation = isPreciseLocation || locationType === 'RANGE_INTERPOLATED';
        
        console.log(`[API] Location precision: ${locationType} (${isPreciseLocation ? 'PRECISE' : isAcceptableLocation ? 'ACCEPTABLE' : 'ESTIMATED/INTERPOLATED'})`);
        
        // For house number validation, we accept ROOFTOP or RANGE_INTERPOLATED
        if (!isAcceptableLocation && locationType !== 'GEOMETRIC_CENTER') {
            console.log('[API] Rejecting address: Google returned location type that is too imprecise');
            return res.status(200).json({
                valid: false,
                address: result.formatted_address,
                error: 'Address not found with sufficient precision',
                locationType: locationType,
                reason: 'Google could not find the address with acceptable precision'
            });
        }
        
        // Extract components to verify they match user input
        const cityComponent = result.address_components.find(c => 
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        );
        const streetComponent = result.address_components.find(c => 
            c.types.includes('route')
        );
        const streetNumberComponent = result.address_components.find(c => 
            c.types.includes('street_number')
        );
        
        console.log('[API] Components - City:', cityComponent?.long_name, 'Street:', streetComponent?.long_name, 'Number:', streetNumberComponent?.long_name);

        // Calculate similarity scores
        const citySimilarity = cityComponent ? calculateSimilarity(city, cityComponent.long_name) : 0;
        const streetSimilarity = streetComponent ? calculateSimilarity(street, streetComponent.long_name) : 0;
        
        // More sophisticated house number matching with better tolerance
        let houseSimilarity = 0;
        if (streetNumberComponent) {
            const googleHouseNumber = streetNumberComponent.long_name;
            const userHouseNumber = house;
            
            // Exact match
            if (googleHouseNumber === userHouseNumber) {
                houseSimilarity = 1;
            }
            // Match numbers, ignoring Hebrew letters and extra characters
            else {
                const googleNum = googleHouseNumber.replace(/[א-ת\s\-\/]/g, '');
                const userNum = userHouseNumber.replace(/[א-ת\s\-\/]/g, '');
                if (googleNum === userNum && googleNum.length > 0) {
                    houseSimilarity = 0.9; // Very high but not perfect if letters differ
                }
                // Check if user number is contained in Google number (e.g., "23" in "23א")
                else if (googleNum.includes(userNum) || userNum.includes(googleNum)) {
                    houseSimilarity = 0.85;
                }
            }
        }
        
        // Adjust thresholds based on location type
        const CITY_SIMILARITY_THRESHOLD = isPreciseLocation ? 0.65 : 0.6; // Slightly lower for less precise locations
        const STREET_SIMILARITY_THRESHOLD = isPreciseLocation ? 0.65 : 0.6;
        const HOUSE_SIMILARITY_THRESHOLD = isPreciseLocation ? 0.75 : 0.7; // Lower threshold for interpolated addresses
        
        const cityMatches = citySimilarity >= CITY_SIMILARITY_THRESHOLD;
        const streetMatches = streetSimilarity >= STREET_SIMILARITY_THRESHOLD;
        
        // For GEOMETRIC_CENTER (city center), we don't require house number match
        let houseMatches;
        if (locationType === 'GEOMETRIC_CENTER') {
            houseMatches = true; // Accept addresses that point to city center
            console.log('[API] Accepting city center location - house number validation skipped');
        } else {
            // For other location types, house number must be found and match
            houseMatches = streetNumberComponent && houseSimilarity >= HOUSE_SIMILARITY_THRESHOLD;
        }
        
        const isValidAddress = cityMatches && streetMatches && houseMatches;
        
        console.log(`[API] Similarity scores - City: ${citySimilarity} (req: ${CITY_SIMILARITY_THRESHOLD}), Street: ${streetSimilarity} (req: ${STREET_SIMILARITY_THRESHOLD}), House: ${houseSimilarity} (req: ${HOUSE_SIMILARITY_THRESHOLD})`);
        console.log(`[API] Google returned house number:`, streetNumberComponent?.long_name || 'NOT FOUND');
        console.log(`[API] User entered house number:`, house);
        console.log(`[API] House matches: ${houseMatches}`);
        console.log(`[API] Address valid: ${isValidAddress}`);

        return res.status(200).json({
            valid: isValidAddress,
            address: result.formatted_address,
            locationType: locationType,
            similarity: {
                city: citySimilarity,
                street: streetSimilarity,
                house: houseSimilarity
            },
            components: {
                city: cityComponent?.long_name || null,
                street: streetComponent?.long_name || null,
                house: streetNumberComponent?.long_name || null
            },
            validation: {
                cityMatches: cityMatches,
                streetMatches: streetMatches,
                houseMatches: houseMatches,
                houseNumberFound: !!streetNumberComponent,
                userHouseNumber: house,
                googleHouseNumber: streetNumberComponent?.long_name || null,
                preciseLocation: isPreciseLocation,
                acceptableLocation: isAcceptableLocation
            },
            ...((!isValidAddress) && {
                reason: !cityMatches ? 'City does not match' : 
                        !streetMatches ? 'Street does not match' : 
                        !houseMatches ? (streetNumberComponent ? 'House number does not match' : 'House number not found by Google') : 
                        'Unknown validation error'
            })
        });

    } catch (error) {
        console.error('Error verifying address:', error);
        return res.status(200).json({
            valid: false,
            address: null,
            error: 'Internal server error'
        });
    }
} 

// Helper function to normalize Hebrew text
const normalizeHebrew = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[״"']/g, '') // Remove quotes
        .replace(/[-־]/g, ' ') // Replace dashes with spaces
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .trim();
};

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = normalizeHebrew(str1);
    const s2 = normalizeHebrew(str2);
    
    // Exact match
    if (s1 === s2) return 1;
    
    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Calculate word-based similarity
    const words1 = s1.split(' ').filter(w => w.length > 0);
    const words2 = s2.split(' ').filter(w => w.length > 0);
    
    let matchedWords = 0;
    for (const word1 of words1) {
        for (const word2 of words2) {
            // Check exact word match
            if (word1 === word2) {
                matchedWords++;
                break;
            }
            // Check if words are similar (handle Hebrew variations)
            if (areWordsSimilar(word1, word2)) {
                matchedWords += 0.8;
                break;
            }
        }
    }
    
    const totalWords = Math.max(words1.length, words2.length);
    return totalWords > 0 ? matchedWords / totalWords : 0;
};

// Helper function to check if two Hebrew words are similar
const areWordsSimilar = (word1, word2) => {
    // Handle common Hebrew variations
    const variations = [
        // י/ה endings
        [word1, word2],
        [word1 + 'ה', word2],
        [word1, word2 + 'ה'],
        [word1 + 'י', word2],
        [word1, word2 + 'י'],
        [word1.replace(/ה$/, ''), word2.replace(/ה$/, '')],
        [word1.replace(/י$/, ''), word2.replace(/י$/, '')],
        // Common letter substitutions
        [word1.replace(/י/g, 'ו'), word2],
        [word1, word2.replace(/י/g, 'ו')],
        [word1.replace(/ו/g, 'י'), word2],
        [word1, word2.replace(/ו/g, 'י')],
        // Common name variations like פינחס vs פנחס
        [word1.replace(/ינ/g, 'נ'), word2],
        [word1, word2.replace(/ינ/g, 'נ')]
    ];
    
    for (const [v1, v2] of variations) {
        if (v1 === v2) return true;
    }
    
    return false;
}; 