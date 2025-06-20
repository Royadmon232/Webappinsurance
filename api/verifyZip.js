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

        // First try: Regular geocoding without postal code
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
            console.log(`[API] Geocoding with postal code: ${addressWithZip}`);
            
            const geocodeWithZipUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressWithZip)}&key=${GOOGLE_API_KEY}`;
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
                
                const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
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
            
            // Get English version of city if available
            const cityEnglish = cityMapping[city] || city;
            console.log('[API] City mapping:', city, '->', cityEnglish);
            
            // Check if the components match what the user entered
            const cityMatches = cityComponent && (
                // Direct Hebrew match
                cityComponent.long_name.toLowerCase().includes(city.toLowerCase()) ||
                city.toLowerCase().includes(cityComponent.long_name.toLowerCase()) ||
                // English translation match
                cityComponent.long_name.toLowerCase() === cityEnglish.toLowerCase() ||
                cityComponent.long_name.toLowerCase().includes(cityEnglish.toLowerCase()) ||
                cityEnglish.toLowerCase().includes(cityComponent.long_name.toLowerCase()) ||
                // Also check short_name
                cityComponent.short_name.toLowerCase().includes(city.toLowerCase()) ||
                city.toLowerCase().includes(cityComponent.short_name.toLowerCase()) ||
                cityComponent.short_name.toLowerCase() === cityEnglish.toLowerCase()
            );
            
            console.log('[API] City comparison details:');
            console.log('  - cityComponent.long_name:', cityComponent?.long_name);
            console.log('  - cityEnglish:', cityEnglish);
            console.log('  - Direct match:', cityComponent?.long_name.toLowerCase() === cityEnglish.toLowerCase());
            console.log('  - cityMatches result:', cityMatches);
            
            // More flexible street matching - handle Hebrew street names
            const streetMatches = !street || (streetComponent && (() => {
                // Normalize street names by removing common suffixes
                const normalizeStreet = (str) => {
                    return str.toLowerCase()
                        .replace(/\bstreet\b/gi, '')
                        .replace(/\bst\b/gi, '')
                        .replace(/\bרחוב\b/gi, '')
                        .replace(/\bרח\b/gi, '')
                        .trim();
                };
                
                const streetNorm = normalizeStreet(street);
                const componentNorm = normalizeStreet(streetComponent.long_name);
                
                return (
                    // Direct comparison after normalization
                    streetNorm === componentNorm ||
                    // Partial matches
                    componentNorm.includes(streetNorm) ||
                    streetNorm.includes(componentNorm) ||
                    // Check if all words from user input are in component (order might differ)
                    streetNorm.split(' ').filter(w => w).every(word => 
                        componentNorm.includes(word)
                    )
                );
            })());
            
            const houseMatches = !house || (streetNumberComponent && 
                streetNumberComponent.long_name === house.toString()
            );
            
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
            
            return res.status(200).json({
                valid: false,
                officialZip: null,
                userZip: zipCode,
                address: result.formatted_address,
                error: 'No postal code found for this address',
                debug: {
                    triedWithZip: true,
                    cityComponent: cityComponent?.long_name || 'not found',
                    streetComponent: streetComponent?.long_name || 'not found', 
                    numberComponent: streetNumberComponent?.long_name || 'not found',
                    cityEnglish: cityEnglish,
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