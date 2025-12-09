
// COMPLETE PRODUCT DATABASE FOR MYBRAND - 25 PRODUCTS
const productDatabase = {
    // MEN'S CLOTHING
    '1': {
        id: 1,
        name: 'Classic White Hoodie',
        price: 529,
        images: ['product1.jpg', 'product1-back.jpg', 'product1-detail.jpg', 'product1-side.jpg'],
        description: 'Premium cotton blend hoodie with a comfortable fit. Perfect for casual wear and everyday comfort.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Regular Fit',
            care: 'Machine Washable',
            style: 'Pullover with Front Pocket',
            features: 'Adjustable Drawstrings, Ribbed Cuffs',
            weight: '430 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['white', 'black', 'off-white', 'navy'],
        category: 'men',
        rating: 4.8,
        reviewCount: 127,
        inStock: true
    },
    '2': {
        id: 2,
        name: 'Black Oversized T-Shirt',
        price: 239,
        images: ['product2.jpg', 'product2-back.jpg', 'product2-detail.jpg'],
        description: 'Trendy oversized black t-shirt with a relaxed fit. Perfect for casual outings.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['black'],
        category: 'men',
        rating: 4.5,
        reviewCount: 89,
        inStock: true
    },
    '3': {
        id: 3,
        name: 'Premium Navy Polo T-shirt',
        price: 289,
        images: ['product3.jpg', 'product3-back.jpg', 'product3-detail.jpg', 'product3-fit.jpg'],
        description: 'Premium cotton  polo T-shirt with excellent breathability and professional look.',
        details: {
            material: '100% Premium Cotton',
            fit: 'Slim Fit',
            care: 'Machine Washable',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [' navy blue'],
        category: 'men',
        rating: 4.7,
        reviewCount: 156,
        inStock: true
    },
    '4': {
        id: 4,
        name: 'Marron regular Fit T-Shirt',
        price: 189,
        images: ['product4.jpg', 'product4-back.jpg', 'product4-detail.jpg', 'product4-side.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['marron'],
        category: 'men',
        rating: 4.9,
        reviewCount: 203,
        inStock: true
    },
    '5': {
        id: 5,
        name: 'Premium Black Polo T-shirt',
        price: 289,
        images: ['product5.jpg', 'product5-back.jpg', 'product5-detail.jpg'],
        description: 'Premium cotton  polo T-shirt with excellent breathability and professional look.',
        details: {
            material: '100% Premium Cotton',
            fit: 'Slim Fit',
            care: 'Machine Washable',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['black'],
        category: 'men',
        rating: 4.6,
        reviewCount: 94,
        inStock: true
    },

    // WOMEN'S CLOTHING
    '6': {
        id: 6,
        name: 'Premium White Polo T-shirt',
        price: 289,
        images: ['product6.jpg', 'product6-back.jpg', 'product6-detail.jpg', 'product6-side.jpg'],
        description: 'Premium cotton  polo T-shirt with excellent breathability and professional look.',
        details: {
            material: '100% Premium Cotton',
            fit: 'Slim Fit',
            care: 'Machine Washable',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['white'],
        category: 'women',
        rating: 4.8,
        reviewCount: 178,
        inStock: true
    },
    '7': {
        id: 7,
        name: 'Premium Marron Polo T-shirt',
        price: 289,
        images: ['product7.jpg', 'product7-back.jpg', 'product7-detail.jpg'],
        description: 'Premium cotton  polo T-shirt with excellent breathability and professional look.',
        details: {
            material: '100% Premium Cotton',
            fit: 'Slim Fit',
            care: 'Machine Washable',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['marron'],
        category: 'women',
        rating: 4.7,
        reviewCount: 231,
        inStock: true
    },
    '8': {
        id: 8,
        name: 'White regular Fit T-shirt',
        price: 189,
        images: ['product8.jpg', 'product8-back.jpg', 'product8-detail.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes:  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['white'],
        category: 'women',
        rating: 4.9,
        reviewCount: 112,
        inStock: true
    },
    '9': {
        id: 9,
        name: 'Black regular Fit T-shirt',
        price: 189,
        images: ['product9.jpg', 'product9-back.jpg', 'product9-detail.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['black'],
        category: 'women',
        rating: 4.6,
        reviewCount: 87,
        inStock: true
    },
    '10': {
        id: 10,
        name: 'Beige regular Fit T-shirt',
        price: 189,
        images: ['product10.jpg', 'product10-back.jpg', 'product10-detail.jpg', 'product10-dupatta.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['beige'],
        category: 'women',
        rating: 4.8,
        reviewCount: 145,
        inStock: true
    },

    // KIDS' CLOTHING
    '11': {
        id: 11,
        name: 'Blue regular Fit T-shirt',
        price: 189,
        images: ['product11.jpg', 'product11-back.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['blue'],
        category: 'kids',
        rating: 4.7,
        reviewCount: 203,
        inStock: true
    },
    '12': {
        id: 12,
        name: 'Grey regular Fit T-shirt',
        price: 189,
        images: ['product12.jpg', 'product12-back.jpg', 'product12-detail.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['grey'],
        category: 'kids',
        rating: 4.6,
        reviewCount: 98,
        inStock: true
    },
    '13': {
        id: 13,
        name: 'Lavender regular Fit T-shirt',
        price: 189,
        images: ['product13.jpg', 'product13-back.jpg', 'product13-detail.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['lavender'],
        category: 'kids',
        rating: 4.9,
        reviewCount: 156,
        inStock: true
    },
    '14': {
        id: 14,
        name: 'Orange regular Fit T-shirt',
        price: 189,
        images: ['product14.jpg', 'product14-back.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['orange'],
        category: 'kids',
        rating: 4.5,
        reviewCount: 112,
        inStock: true
    },
    '15': {
        id: 15,
        name: 'Sky blue regular Fit T-shirt',
        price: 189,
        images: ['product15.jpg', 'product15-back.jpg', 'product15-detail.jpg'],
        description: 'Regular fit T-shirt crafted with soft, breathable fabric for all-day comfort and a clean everyday look.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Short, Regular Sleeves',
            weight: '180 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['sky blue'],
        category: 'kids',
        rating: 4.8,
        reviewCount: 134,
        inStock: true
    },

    // FOOTWEAR
    '16': {
        id: 16,
        name: 'White Oversized T-shirt',
        price: 239,
        images: ['product16.jpg', 'product16-side.jpg', 'product16-bottom.jpg', 'product16-back.jpg'],
        description: 'Trendy oversized black t-shirt with a relaxed fit. Perfect for casual outings.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['white'],
        category: 'footwear',
        rating: 4.7,
        reviewCount: 287,
        inStock: true
    },
    '17': {
        id: 17,
        name: 'Marron Oversized T-shirt',
        price: 239,
        images: ['product17.jpg', 'product17-side.jpg', 'product17-back.jpg'],
       description: 'Trendy oversized black t-shirt with a relaxed fit. Perfect for casual outings.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['marron'],
        category: 'footwear',
        rating: 4.7,
        reviewCount: 287,
        inStock: true
    },
    '18': {
        id: 18,
        name: 'Beige Oversized T-shirt',
        price: 239,
        images: ['product18.jpg', 'product18-side.jpg', 'product18-bottom.jpg'],
        description: 'Trendy oversized black t-shirt with a relaxed fit. Perfect for casual outings.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['beige'],
        category: 'footwear',
        rating: 4.7,
        reviewCount: 287,
        inStock: true
    },
    '19': {
        id: 19,
        name: 'Lavender Oversized T-shirt',
        price: 239,
        images: ['product19.jpg', 'product19-side.jpg', 'product19-back.jpg'],
       description: 'Trendy oversized black t-shirt with a relaxed fit. Perfect for casual outings.',
        details: {
            material: '100% Cotton, Biowash',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['lavender'],
        category: 'footwear',
        rating: 4.7,
        reviewCount: 287,
        inStock: true
    },
    '20': {
        id: 20,
        name: 'Black Sweatshirt',
        price: 299,
        images: ['product20.jpg', 'product20-side.jpg', 'product20-back.jpg'],
        description: 'Round-neck men’s pullover sweatshirt designed for ultimate winter comfort.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Regular Fit',
            care: 'Machine Wash',
            style: 'Round Neck',
            features: 'Pullover, Long Sleeves',
            weight: '320 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['black'],
        category: 'men',
        rating: 4.8,
        reviewCount: 178,
        inStock: true
    },

    // ACCESSORIES
    '21': {
        id: 21,
        name: 'Grey Sweatshirt',
        price: 299,
        images: ['product21.jpg', 'product21-open.jpg', 'product21-detail.jpg'],
        description: 'Round-neck men’s pullover sweatshirt designed for ultimate winter comfort.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Regular Fit',
            care: 'Machine Wash',
            style: 'Round Neck',
            features: 'Pullover, Long Sleeves',
            weight: '320 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['grey'],
        category: 'accessories',
        rating: 4.6,
        reviewCount: 134,
        inStock: true
    },
    '22': {
        id: 22,
        name: 'Navy Blue Sweatshirt',
        price: 299,
        images: ['product22.jpg', 'product22-folded.jpg', 'product22-detail.jpg'],
        description: 'Round-neck men’s pullover sweatshirt designed for ultimate winter comfort.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Regular Fit',
            care: 'Machine Wash',
            style: 'Round Neck',
            features: 'Pullover, Long Sleeves',
            weight: '320 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['navy'],
        category: 'accessories',
        rating: 4.7,
        reviewCount: 89,
        inStock: true
    },
    '23': {
        id: 23,
        name: 'Black Polo T-shirt',
        price: 249,
        images: ['product23.jpg', 'product23-back.jpg', 'product23-open.jpg', 'product23-side.jpg'],
        description: 'A versatile men polo T-shirt built for comfort, style, and long-lasting wear.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Slim Fit',
            care: 'Machine Wash',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            capacity: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['black'],
        category: 'accessories',
        rating: 4.8,
        reviewCount: 203,
        inStock: true
    },
    '24': {
        id: 24,
        name: 'White Polo T-shirt',
        price: 249,
        images: ['product24.jpg', 'product24-side.jpg', 'product24-case.jpg'],
        description: 'A versatile men polo T-shirt built for comfort, style, and long-lasting wear.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Slim Fit',
            care: 'Machine Wash',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['white'],
        category: 'accessories',
        rating: 4.5,
        reviewCount: 167,
        inStock: true
    },
    '25': {
        id: 25,
        name: 'Marron Polo T-shirt',
        price: 249,
        images: ['product25.jpg', 'product25-back.jpg', 'product25-detail.jpg'],
        description: 'A versatile men polo T-shirt built for comfort, style, and long-lasting wear.',
        details: {
            material: '88% Cotton, 12% Polyester',
            fit: 'Slim Fit',
            care: 'Machine Wash',
            style: 'Polo Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['marron'],
        category: 'accessories',
        rating: 4.6,
        reviewCount: 112,
        inStock: true
    }
};
