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

    // Hebrew to English city mapping for common cities
    const cityMapping = {
        'פתח תקווה': 'Petah Tikva',
        'תל אביב': 'Tel Aviv',
        'ירושלים': 'Jerusalem',
        'חיפה': 'Haifa',
        'באר שבע': 'Beer Sheva',
        'ראשון לציון': 'Rishon LeZion',
        'אשדוד': 'Ashdod',
        'נתניה': 'Netanya',
        'בני ברק': 'Bnei Brak',
        'חולון': 'Holon',
        'רמת גן': 'Ramat Gan',
        'אשקלון': 'Ashkelon',
        'רחובות': 'Rehovot',
        'בת ים': 'Bat Yam',
        'כפר סבא': 'Kfar Saba',
        'הרצליה': 'Herzliya',
        'חדרה': 'Hadera',
        'מודיעין': 'Modiin',
        'רעננה': 'Raanana',
        'רמת השרון': 'Ramat Hasharon',
        'לוד': 'Lod',
        'רמלה': 'Ramla',
        'נהריה': 'Nahariya',
        'עפולה': 'Afula'
    };

    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_KEY;
    
    if (!GOOGLE_API_KEY) {
        console.error('GOOGLE_MAPS_KEY environment variable is not set');
        return res.status(500).json({ 
            error: 'Server configuration error' 
        });
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
                // Check if words are similar (handle י/ה endings, etc.)
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
            // פינחס vs פנחס (common name variations)
            [word1.replace(/ינ/g, 'נ'), word2],
            [word1, word2.replace(/ינ/g, 'נ')],
            // יצחק vs יצהק
            [word1.replace(/חק/g, 'הק'), word2],
            [word1, word2.replace(/חק/g, 'הק')],
            // שלום vs שלם
            [word1.replace(/ום$/g, 'ם'), word2],
            [word1, word2.replace(/ום$/g, 'ם')],
            // Double letters
            [word1.replace(/(.)\1/g, '$1'), word2],
            [word1, word2.replace(/(.)\1/g, '$1')]
        ];
        
        for (const [v1, v2] of variations) {
            if (v1 === v2) return true;
        }
        
        // Check if words are very similar (differ by 1 character)
        if (Math.abs(word1.length - word2.length) <= 1) {
            let differences = 0;
            const longer = word1.length > word2.length ? word1 : word2;
            const shorter = word1.length > word2.length ? word2 : word1;
            
            let j = 0;
            for (let i = 0; i < longer.length && differences <= 1; i++) {
                if (j < shorter.length && longer[i] === shorter[j]) {
                    j++;
                } else {
                    differences++;
                }
            }
            
            if (differences <= 1) return true;
        }
        
        return false;
    };

    try {
        // Build the address string for geocoding - keep it in Hebrew
        let address = city;
        if (street) {
            address = `${street}, ${city}`;
            if (house) {
                address = `${street} ${house}, ${city}`;
            }
        }
        address += ', ישראל'; // Add country in Hebrew

        console.log(`[API] Geocoding address (Hebrew): ${address}`);

        // First try: Regular geocoding with Hebrew address and language parameter
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=he&key=${GOOGLE_API_KEY}`;
        
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
        
        // Debug: Log all address components to see what's available
        console.log('[API] All address components:', JSON.stringify(result.address_components, null, 2));
        
        // Extract postal code from the result
        let postalCodeComponent = result.address_components.find(
            component => component.types.includes('postal_code')
        );

        // If no postal code found, try geocoding WITH the postal code included
        if (!postalCodeComponent) {
            console.log('[API] No postal code in first attempt, trying with postal code in query...');
            
            const addressWithZip = `${address}, ${zipCode}`;
            console.log(`[API] Geocoding with postal code (Hebrew): ${addressWithZip}`);
            
            const geocodeWithZipUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressWithZip)}&language=he&key=${GOOGLE_API_KEY}`;
            const responseWithZip = await fetch(geocodeWithZipUrl);
            const dataWithZip = await responseWithZip.json();
            
            if (dataWithZip.status === 'OK' && dataWithZip.results && dataWithZip.results.length > 0) {
                const resultWithZip = dataWithZip.results[0];
                console.log('[API] Address components with zip query:', JSON.stringify(resultWithZip.address_components, null, 2));
                
                postalCodeComponent = resultWithZip.address_components.find(
                    component => component.types.includes('postal_code')
                );
                
                if (postalCodeComponent) {
                    console.log('[API] Found postal code with zip in query:', postalCodeComponent.long_name);
                    // Update result to use the one with postal code
                    result.address_components = resultWithZip.address_components;
                    result.formatted_address = resultWithZip.formatted_address;
                }
            }
        }

        if (!postalCodeComponent) {
            console.log('[API] No postal code found in geocoding result');
            console.log('[API] Available component types:', result.address_components.map(c => c.types).flat());
            
            // Try reverse geocoding with the coordinates as an alternative
            if (result.geometry && result.geometry.location) {
                const { lat, lng } = result.geometry.location;
                console.log(`[API] Trying reverse geocoding with coordinates: ${lat}, ${lng}`);
                
                const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=he&key=${GOOGLE_API_KEY}`;
                const reverseResponse = await fetch(reverseGeocodeUrl);
                const reverseData = await reverseResponse.json();
                
                if (reverseData.status === 'OK' && reverseData.results && reverseData.results.length > 0) {
                    console.log('[API] Reverse geocoding successful, checking for postal code...');
                    
                    // Look for postal code in all reverse geocoding results
                    for (const reverseResult of reverseData.results) {
                        const reversePostalComponent = reverseResult.address_components.find(
                            component => component.types.includes('postal_code')
                        );
                        
                        if (reversePostalComponent) {
                            console.log('[API] Found postal code via reverse geocoding:', reversePostalComponent.long_name);
                            
                            const officialZip = reversePostalComponent.long_name;
                            const userZipClean = zipCode.replace(/\D/g, '');
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
                        }
                    }
                }
            }
            
            // Fallback: Check if the address components match what user entered
            console.log('[API] Checking address components match as fallback...');
            
            // Extract city, street, and street number from Google's components
            const cityComponent = result.address_components.find(c => 
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            const streetComponent = result.address_components.find(c => 
                c.types.includes('route')
            );
            const streetNumberComponent = result.address_components.find(c => 
                c.types.includes('street_number')
            );
            
            console.log('[API] Found components - City:', cityComponent?.long_name, 'Street:', streetComponent?.long_name, 'Number:', streetNumberComponent?.long_name);
            console.log('[API] User input - City:', city, 'Street:', street, 'House:', house);
            
            // Check if the components match what the user entered (with similarity threshold)
            const SIMILARITY_THRESHOLD = 0.8; // 80% similarity required
            
            // Calculate city similarity
            const citySimilarity = cityComponent ? Math.max(
                calculateSimilarity(city, cityComponent.long_name),
                calculateSimilarity(city, cityComponent.short_name)
            ) : 0;
            
            const cityMatches = citySimilarity >= SIMILARITY_THRESHOLD;
            
            console.log('[API] City comparison:');
            console.log('  - User city:', city);
            console.log('  - Component long_name:', cityComponent?.long_name);
            console.log('  - Component short_name:', cityComponent?.short_name);
            console.log('  - Similarity score:', citySimilarity);
            console.log('  - cityMatches:', cityMatches);
            
            // More flexible street matching with similarity
            const streetSimilarity = streetComponent && street ? 
                calculateSimilarity(street, streetComponent.long_name) : 1; // If no street provided, consider it a match
            
            const streetMatches = !street || streetSimilarity >= SIMILARITY_THRESHOLD;
            
            console.log('[API] Street comparison:');
            console.log('  - User street:', street);
            console.log('  - Component street:', streetComponent?.long_name);
            console.log('  - Similarity score:', streetSimilarity);
            console.log('  - streetMatches:', streetMatches);
            
            const houseMatches = !house || (streetNumberComponent && 
                streetNumberComponent.long_name === house.toString()
            );
            
            // REMOVED DANGEROUS FALLBACK - Do not accept postal codes without Google validation
            // Even if address matches, we cannot verify postal code without official data
            /*
            if (cityMatches && streetMatches && houseMatches) {
                console.log('[API] Address components match user input, accepting postal code as valid');
                
                // Since we verified the address matches, accept the user's postal code
                return res.status(200).json({
                    valid: true,
                    officialZip: zipCode, // Use user's zip as official since Google doesn't provide one
                    userZip: zipCode,
                    address: result.formatted_address,
                    note: 'Address verified, postal code accepted based on address match'
                });
            }
            */
            
            return res.status(200).json({
                valid: false,
                officialZip: null,
                userZip: zipCode,
                address: result.formatted_address,
                error: 'No postal code found for this address',
                note: 'Google Geocoding API often does not return postal codes for Israeli addresses. Consider using a local Israeli postal code database.',
                debug: {
                    triedWithZip: true,
                    cityComponent: cityComponent?.long_name || 'not found',
                    streetComponent: streetComponent?.long_name || 'not found', 
                    numberComponent: streetNumberComponent?.long_name || 'not found',
                    citySimilarity: citySimilarity,
                    streetSimilarity: streetSimilarity,
                    similarityThreshold: SIMILARITY_THRESHOLD,
                    cityMatches: cityMatches,
                    streetMatches: streetMatches,
                    houseMatches: houseMatches,
                    userInput: {
                        city: city,
                        street: street,
                        house: house
                    },
                    allComponents: result.address_components.map(c => ({
                        types: c.types,
                        long_name: c.long_name
                    }))
                }
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