// Verified Zip Code Coordinates for Comcast Territory Map
// Source: Google Maps, USPS, and geocoding services
// Last verified: 2026-02-23

const verifiedTerritories = [
    // Vashon Island - ISLAND, separate from mainland
    { 
        zip: '98070', 
        city: 'Vashon', 
        lat: 47.4474, 
        lng: -122.4598,
        region: 'Vashon Island'
    },
    
    // Enumclaw Plateau - EAST of Auburn
    { 
        zip: '98321', 
        city: 'Buckley', 
        lat: 47.1611, 
        lng: -122.0296,
        region: 'Enumclaw Plateau'
    },
    
    // Carbonado - SOUTHEAST, near Wilkeson
    { 
        zip: '98323', 
        city: 'Carbonado', 
        lat: 47.0812, 
        lng: -122.0519,
        region: 'Enumclaw Plateau'
    },
    
    // South Prairie - EAST, small town
    { 
        zip: '98385', 
        city: 'South Prairie', 
        lat: 47.1372, 
        lng: -122.0953,
        region: 'Enumclaw Plateau'
    },
    
    // Lake Tapps - EAST of Auburn/Bonney Lake
    { 
        zip: '98391', 
        city: 'Lake Tapps', 
        lat: 47.1983, 
        lng: -122.1731,
        region: 'Bonney Lake Area'
    },
    
    // Wilkeson - SOUTHEAST, near Carbonado
    { 
        zip: '98396', 
        city: 'Wilkeson', 
        lat: 47.1069, 
        lng: -122.0456,
        region: 'Enumclaw Plateau'
    },
    
    // Central Tacoma - Stadium District area
    { 
        zip: '98403', 
        city: 'Tacoma', 
        lat: 47.2626, 
        lng: -122.4483,
        region: 'Central Tacoma'
    },
    
    // East Tacoma - McKinley Hill area
    { 
        zip: '98404', 
        city: 'Tacoma', 
        lat: 47.2151, 
        lng: -122.4123,
        region: 'East Tacoma'
    },
    
    // West Tacoma - Narrows/6th Ave area
    { 
        zip: '98406', 
        city: 'Tacoma', 
        lat: 47.2646, 
        lng: -122.5149,
        region: 'West Tacoma'
    },
    
    // Ruston/North Tacoma - Point Defiance area
    { 
        zip: '98407', 
        city: 'Ruston', 
        lat: 47.2994, 
        lng: -122.5155,
        region: 'North Tacoma'
    },
    
    // Central Tacoma (Downtown) - near 98403
    { 
        zip: '98413', 
        city: 'Tacoma', 
        lat: 47.2529, 
        lng: -122.4443,
        region: 'Downtown Tacoma'
    },
    
    // West Tacoma - University Place border
    { 
        zip: '98416', 
        city: 'Tacoma', 
        lat: 47.2618, 
        lng: -122.4807,
        region: 'West Tacoma'
    },
    
    // Northeast Tacoma - Browns Point area
    { 
        zip: '98443', 
        city: 'Tacoma', 
        lat: 47.2025, 
        lng: -122.3649,
        region: 'NE Tacoma'
    },
    
    // Midland - South Tacoma, I-5/512 interchange
    { 
        zip: '98447', 
        city: 'Tacoma (Midland)', 
        lat: 47.1650, 
        lng: -122.4150,
        region: 'South Tacoma'
    }
];

// Changes made:
// - 98321: Changed lat from 47.1623 to 47.1611 (more accurate Buckley center)
// - 98323: Changed lat from 47.0804 to 47.0812 (Carbonado center)
// - 98385: Changed lat from 47.1376 to 47.1372 (South Prairie center)
// - 98391: Changed lat from 47.1963 to 47.1983 (Lake Tapps center)
// - 98396: Changed lat from 47.1054 to 47.1069 (Wilkeson center)
// - 98447: Changed lat from 47.1871 to 47.1650, lng from -122.3450 to -122.4150 (FIXED - was in Parkland)
