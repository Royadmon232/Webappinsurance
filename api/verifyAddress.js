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
        
        console.log(`[API] Location precision: ${locationType} (${isPreciseLocation ? 'PRECISE' : 'ESTIMATED/INTERPOLATED'})`);
        
        // For house number validation, we need precise location data
        if (!isPreciseLocation) {
            console.log('[API] Rejecting address: Google returned interpolated/estimated location, not precise address');
            return res.status(200).json({
                valid: false,
                address: result.formatted_address,
                error: 'Address not found with sufficient precision',
                locationType: locationType,
                reason: 'Google could not find the exact house number - it may not exist'
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
        
        // More sophisticated house number matching
        let houseSimilarity = 0;
        if (streetNumberComponent) {
            const googleHouseNumber = streetNumberComponent.long_name;
            const userHouseNumber = house;
            
            // Exact match
            if (googleHouseNumber === userHouseNumber) {
                houseSimilarity = 1;
            }
            // Match numbers, ignoring Hebrew letters (e.g., "6" matches "6א")
            else {
                const googleNum = googleHouseNumber.replace(/[א-ת]/g, '');
                const userNum = userHouseNumber.replace(/[א-ת]/g, '');
                if (googleNum === userNum && googleNum.length > 0) {
                    houseSimilarity = 0.9; // Very high but not perfect if letters differ
                }
            }
        }
        
        const SIMILARITY_THRESHOLD = 0.7; // 70% similarity required
        const HOUSE_SIMILARITY_THRESHOLD = 0.8; // 80% similarity required for house numbers
        
        // If Google found the exact location (ROOFTOP), be more lenient with street name matching
        // This handles cases where Google finds the exact address but with slight name variations
        const LENIENT_STREET_THRESHOLD = isPreciseLocation ? 0.5 : SIMILARITY_THRESHOLD;
        
        const cityMatches = citySimilarity >= SIMILARITY_THRESHOLD;
        const streetMatches = streetSimilarity >= LENIENT_STREET_THRESHOLD;
        
        // STRICT: House number must be found by Google AND match the user's input
        const houseMatches = streetNumberComponent && houseSimilarity >= HOUSE_SIMILARITY_THRESHOLD;
        
        const isValidAddress = cityMatches && streetMatches && houseMatches;
        
        console.log(`[API] Similarity scores - City: ${citySimilarity}, Street: ${streetSimilarity}, House: ${houseSimilarity}`);
        console.log(`[API] Street comparison: User="${street}" vs Google="${streetComponent?.long_name || 'NOT FOUND'}"`);
        console.log(`[API] Street threshold: ${LENIENT_STREET_THRESHOLD} (lenient due to ROOFTOP: ${isPreciseLocation})`);
        console.log(`[API] Google returned house number:`, streetNumberComponent?.long_name || 'NOT FOUND');
        console.log(`[API] User entered house number:`, house);
        console.log(`[API] House matches: ${houseMatches} (requires Google to find the exact house number)`);
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
                preciseLocation: isPreciseLocation
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
        // Basic comparison
        [word1, word2],
        
        // י/ה endings
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
        
        // צ/ץ variations (final forms)
        [word1.replace(/צ/g, 'ץ'), word2],
        [word1, word2.replace(/צ/g, 'ץ')],
        [word1.replace(/ץ/g, 'צ'), word2],
        [word1, word2.replace(/ץ/g, 'צ')],
        
        // כ/ך variations (final forms)
        [word1.replace(/כ/g, 'ך'), word2],
        [word1, word2.replace(/כ/g, 'ך')],
        [word1.replace(/ך/g, 'כ'), word2],
        [word1, word2.replace(/ך/g, 'כ')],
        
        // מ/ם variations (final forms)
        [word1.replace(/מ/g, 'ם'), word2],
        [word1, word2.replace(/מ/g, 'ם')],
        [word1.replace(/ם/g, 'מ'), word2],
        [word1, word2.replace(/ם/g, 'מ')],
        
        // נ/ן variations (final forms)
        [word1.replace(/נ/g, 'ן'), word2],
        [word1, word2.replace(/נ/g, 'ן')],
        [word1.replace(/ן/g, 'נ'), word2],
        [word1, word2.replace(/ן/g, 'נ')],
        
        // פ/ף variations (final forms)
        [word1.replace(/פ/g, 'ף'), word2],
        [word1, word2.replace(/פ/g, 'ף')],
        [word1.replace(/ף/g, 'פ'), word2],
        [word1, word2.replace(/ף/g, 'פ')],
        
        // Common name variations
        [word1.replace(/ינ/g, 'נ'), word2],
        [word1, word2.replace(/ינ/g, 'נ')],
        
        // Specific street name variations found in Israel
        // שדרוביצקי variations
        [word1.replace(/ביצק/g, 'בוצק'), word2],
        [word1, word2.replace(/ביצק/g, 'בוצק')],
        [word1.replace(/בוצק/g, 'ביצק'), word2],
        [word1, word2.replace(/בוצק/g, 'ביצק')],
        [word1.replace(/ביצ/g, 'בו'), word2],
        [word1, word2.replace(/ביצ/g, 'בו')],
        [word1.replace(/בו/g, 'ביצ'), word2],
        [word1, word2.replace(/בו/g, 'ביצ')],
        
        // Double letters variations
        [word1.replace(/וו/g, 'ו'), word2],
        [word1, word2.replace(/וו/g, 'ו')],
        [word1.replace(/ו/g, 'וו'), word2],
        [word1, word2.replace(/ו/g, 'וו')],
        [word1.replace(/לל/g, 'ל'), word2],
        [word1, word2.replace(/לל/g, 'ל')],
        [word1.replace(/ל/g, 'לל'), word2],
        [word1, word2.replace(/ל/g, 'לל')],
        
        // Common abbreviations and full forms
        [word1.replace(/בן /g, 'בן־'), word2],
        [word1, word2.replace(/בן /g, 'בן־')],
        [word1.replace(/בן־/g, 'בן '), word2],
        [word1, word2.replace(/בן־/g, 'בן ')],
        
        // ש vs שר variations
        [word1.replace(/^ש /g, 'שר '), word2],
        [word1, word2.replace(/^ש /g, 'שר ')],
        [word1.replace(/^שר /g, 'ש '), word2],
        [word1, word2.replace(/^שר /g, 'ש ')]
    ];
    
    for (const [v1, v2] of variations) {
        if (v1 === v2) return true;
    }
    
    // Additional check: calculate character-level similarity for close matches
    if (Math.abs(word1.length - word2.length) <= 3) {
        const similarity = calculateCharacterSimilarity(word1, word2);
        if (similarity >= 0.75) return true; // Lowered threshold slightly
    }
    
    return false;
};

// Helper function to calculate character-level similarity
const calculateCharacterSimilarity = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    let matches = 0;
    const minLen = Math.min(len1, len2);
    
    for (let i = 0; i < minLen; i++) {
        if (str1[i] === str2[i]) {
            matches++;
        }
    }
    
    return matches / maxLen;
}; 