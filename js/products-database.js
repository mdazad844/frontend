// COMPLETE UNIFIED PRODUCT DATABASE - ALL PRODUCTS USE BULK STRUCTURE
const productDatabase = {
    // Product 1 - Now uses bulk structure
    '1': {
        id: 1,
        name: 'Classic White Hoodie',
        basePrice: 529,
        images: ['product1.jpg', 'product1-back.jpg', 'product1-detail.jpg', 'product1-side.jpg'],
        description: 'Premium cotton blend hoodie with a comfortable fit. Perfect for casual wear and everyday comfort.',
        colors: [
            {
                name: "white",
                displayName: "White",
                code: "#ffffff",
                images: [
                    "images/product1.jpg",
                    "images/product1-back.jpg",
                    "images/product1-detail.jpg"
                ]
            }
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        pricingTiers: [
            { min: 1, max: 10, price: 529 },
            { min: 11, max: 20, price: 499 },
            { min: 21, max: 999999, price: 449 }
        ],
        features: [
            "88% Cotton, 12% Polyester",
            "Machine Washable",
            "Pullover with Front Pocket",
            "Adjustable Drawstrings, Ribbed Cuffs"
        ],
        specifications: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Regular Fit',
            care: 'Machine Washable',
            weight: '430 GSM',
            origin: 'Made in India'
        },
        category: 'men',
        rating: 4.8,
        reviewCount: 127,
        inStock: true,
        isBulk: true  // NEW: Flag for bulk products
    },

    // Product 2 - Black Oversized T-Shirt (bulk structure)
    '2': {
        id: 2,
        name: 'Black Oversized T-Shirt',
        basePrice: 239,
        images: ['product2.jpg', 'product2-back.jpg'],
        description: 'Trendy oversized t-shirt with a relaxed fit. Perfect for casual outings.',
        colors: [
            {
                name: "black",
                displayName: "Black",
                code: "#000000",
                images: [
                    "images/product2.jpg",
                    "images/product2-back.jpg"
                ]
            }
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        pricingTiers: [
            { min: 1, max: 10, price: 239 },
            { min: 11, max: 20, price: 225 },
            { min: 21, max: 999999, price: 209 }
        ],
        features: [
            "100% Cotton, Biowash",
            "Breathable Fabric",
            "Soft Finish"
        ],
        specifications: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        category: 'men',
        rating: 4.5,
        reviewCount: 89,
        inStock: true,
        isBulk: true
    },

'3': {
        id: 3,
        name: 'Premium Navy Polo T-shirt',
        baseprice: 289,
        images: ['product3.jpg', 'product3-back.jpg', 'product3-detail.jpg', 'product3-side.jpg'],
        description: 'Premium cotton  polo T-shirt with excellent breathability and professional look.',
	 colors: [
            {
                name: "navy blue",
                displayName: "Navy blue",
                code: "#151B54",
                images: [
                    "images/product3.jpg",
                    "images/product3-back.jpg"
                ]
            }
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        pricingTiers: [
            { min: 1, max: 10, price: 289 },
            { min: 11, max: 20, price: 269 },
            { min: 21, max: 999999, price: 249 }
        ],
        features: [
            "100% Cotton, Biowash",
            "Breathable Fabric",
            "Soft Finish"
        ],
        specifications: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        category: 'men',
        rating: 4.5,
        reviewCount: 89,
        inStock: true,
        isBulk: true
    },


	
    // ... Continue for ALL products 3-28 with same structure

    
	
	
	
	
	
	
	
	// BULK PRODUCTS (1001-1008) - Already in correct structure
    '1001': {
        id: 1001,
        name: 'Premium Cotton T-Shirt',
        basePrice: 189,
        // ... keep existing bulk product structure
        isBulk: true
    },
    '1002': {
        id: 1002,
        name: 'Oversized Biowash Cotton T-Shirt',
        basePrice: 239,
        // ... keep existing bulk product structure
        isBulk: true
    },
    // ... continue for 1003-1008
};
