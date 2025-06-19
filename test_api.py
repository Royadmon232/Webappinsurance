#!/usr/bin/env python3
"""
Test script for data.gov.il streets API
This script will help us understand what city names are actually available in the streets database.
"""

import requests
import json
from urllib.parse import quote

def test_api_structure():
    """Test the API structure and see what fields are available"""
    print("=== Testing API Structure ===")
    
    resource_id = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b"
    url = f"https://data.gov.il/api/3/action/datastore_search?resource_id={resource_id}&limit=5"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("API Response Structure:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            if 'result' in data and 'records' in data['result'] and data['result']['records']:
                first_record = data['result']['records'][0]
                print(f"\nAvailable fields: {list(first_record.keys())}")
                print(f"First record: {json.dumps(first_record, indent=2, ensure_ascii=False)}")
                
                # Check city and street name fields
                city_field = 'שם_ישוב'
                street_field = 'שם_רחוב'
                
                if city_field in first_record:
                    print(f"\nCity name field '{city_field}' contains: '{first_record[city_field]}'")
                if street_field in first_record:
                    print(f"Street name field '{street_field}' contains: '{first_record[street_field]}'")
            else:
                print("No records found in response")
        else:
            print(f"API request failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

def explore_city_names():
    """Explore what city names are available in the database"""
    print("\n=== Exploring City Names ===")
    
    resource_id = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b"
    url = f"https://data.gov.il/api/3/action/datastore_search?resource_id={resource_id}&limit=1000"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if 'result' in data and 'records' in data['result'] and data['result']['records']:
                records = data['result']['records']
                print(f"Found {len(records)} records")
                
                # Extract unique city names
                city_names = set()
                for record in records:
                    if 'שם_ישוב' in record and record['שם_ישוב']:
                        city_names.add(record['שם_ישוב'].strip())
                
                unique_cities = sorted(list(city_names))
                print(f"Found {len(unique_cities)} unique city names")
                print("\nSample city names (first 20):")
                for i, city in enumerate(unique_cities[:20]):
                    print(f"{i+1}. {city}")
                
                # Look for specific cities we're interested in
                search_terms = ['באר שבע', 'אבו גוש', 'קרית אונו', 'פתח תקווה', 'תל אביב']
                print(f"\n=== Searching for specific cities ===")
                
                for term in search_terms:
                    matches = [city for city in unique_cities if term in city or city in term]
                    if matches:
                        print(f"Matches for '{term}': {matches}")
                    else:
                        print(f"No exact matches for '{term}'")
                        
                        # Try fuzzy matching
                        fuzzy_matches = []
                        term_clean = term.replace(' ', '').replace('-', '')
                        for city in unique_cities:
                            city_clean = city.replace(' ', '').replace('-', '')
                            if term_clean in city_clean or city_clean in term_clean:
                                fuzzy_matches.append(city)
                        
                        if fuzzy_matches:
                            print(f"  Fuzzy matches for '{term}': {fuzzy_matches}")
                        else:
                            print(f"  No fuzzy matches found for '{term}'")
                
                return unique_cities
            else:
                print("No records found in response")
        else:
            print(f"API request failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

def test_city_filter(city_name):
    """Test filtering by a specific city name"""
    print(f"\n=== Testing Filter for '{city_name}' ===")
    
    resource_id = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b"
    filter_data = {"שם_ישוב": city_name}
    filter_str = quote(json.dumps(filter_data))
    url = f"https://data.gov.il/api/3/action/datastore_search?resource_id={resource_id}&filters={filter_str}"
    
    print(f"URL: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if 'result' in data and 'records' in data['result'] and data['result']['records']:
                records = data['result']['records']
                print(f"Found {len(records)} streets for '{city_name}'")
                
                if records:
                    print("Sample streets:")
                    for i, record in enumerate(records[:5]):
                        if 'שם_רחוב' in record:
                            print(f"  {i+1}. {record['שם_רחוב']}")
                else:
                    print("No streets found")
            else:
                print("No records found in response")
        else:
            print(f"API request failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing data.gov.il Streets API")
    print("=" * 50)
    
    # Test API structure
    test_api_structure()
    
    # Explore city names
    cities = explore_city_names()
    
    # Test specific cities
    test_cities = ["באר שבע", "באר-שבע", "אבו גוש", "אבו-גוש"]
    for city in test_cities:
        test_city_filter(city)
    
    print("\n" + "=" * 50)
    print("Test completed!") 