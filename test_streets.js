// Test script for street fetching functionality
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
const CITY_NAME_FIELD = 'שם_ישוב';
const STREET_NAME_FIELD = 'שם_רחוב';

async function testFetchStreets(cityName) {
    console.log(`\nTesting street fetching for "${cityName}"...`);
    
    const cleanCityName = cityName.trim();
    
    // Test with trailing space (as in database)
    const filter = { "שם_ישוב": cleanCityName + " " };
    const filterStr = encodeURIComponent(JSON.stringify(filter));
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${STREETS_RESOURCE_ID}&filters=${filterStr}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.result && data.result.records && data.result.records.length > 0) {
            const streets = data.result.records
                .filter(r => r[STREET_NAME_FIELD] && r[STREET_NAME_FIELD].trim())
                .map(r => r[STREET_NAME_FIELD].trim());
            
            console.log(`✅ Found ${streets.length} streets for "${cityName}":`);
            streets.slice(0, 5).forEach(street => console.log(`  - ${street}`));
            if (streets.length > 5) console.log(`  ... and ${streets.length - 5} more`);
        } else {
            console.log(`❌ No streets found for "${cityName}"`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Test multiple cities
async function runTests() {
    console.log('=== Testing Street Fetching ===');
    
    await testFetchStreets('אבו גוש');
    await testFetchStreets('אבו סנאן');
    await testFetchStreets('תל אביב');
    await testFetchStreets('ירושלים');
    
    console.log('\n=== Test completed ===');
}

// Run the tests
runTests(); 