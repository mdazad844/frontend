
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
        sizes: ['S', 'M', 'L', 'XL'],
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
            material: '100% Cotton',
            fit: 'Oversized',
            care: 'Machine Wash Cold',
            style: 'Round Neck',
            features: 'Breathable Fabric, Soft Finish',
            weight: '240 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL'],
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
        description: 'Formal cotton shirt with excellent breathability and professional look.',
        details: {
            material: '100% Premium Cotton',
            fit: 'Slim Fit',
            care: 'Machine Washable',
            style: 'Polor Collar',
            features: 'Short, Regular Sleeves',
            weight: '220 GSM',
            origin: 'Made in India'
        },
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [' Navy blue'],
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
        description: 'Classic denim jacket with a modern fit. Perfect for layering.',
        details: {
            material: '100% Cotton Denim',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Trucker Jacket',
            features: 'Metal Buttons, Chest Pockets',
            weight: '12 oz Denim',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['blue', 'black'],
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
        description: 'Utility cargo pants with multiple pockets. Comfortable and stylish.',
        details: {
            material: 'Cotton Twill',
            fit: 'Relaxed Fit',
            care: 'Machine Washable',
            style: 'Cargo Pants',
            features: '6 Pockets, Adjustable Waist',
            weight: '350 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['khaki', 'black', 'olive'],
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
        description: 'Beautiful floral print summer dress perfect for casual outings.',
        details: {
            material: '100% Cotton',
            fit: 'A-Line',
            care: 'Hand Wash Recommended',
            style: 'Summer Dress',
            features: 'Floral Print, Knee Length',
            weight: '200 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L'],
        colors: ['multicolor', 'pink', 'blue'],
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
        description: 'High-waisted yoga pants with four-way stretch for maximum comfort.',
        details: {
            material: '92% Polyester, 8% Spandex',
            fit: 'High Waist',
            care: 'Machine Wash Cold',
            style: 'Athletic Wear',
            features: 'Four-way Stretch, Moisture Wicking',
            weight: '280 GSM',
            origin: 'Made in India'
        },
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['black', 'gray', 'navy'],
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
        description: 'Elegant silk blouse perfect for office wear or special occasions.',
        details: {
            material: '100% Pure Silk',
            fit: 'Regular Fit',
            care: 'Dry Clean Only',
            style: 'Formal Blouse',
            features: 'Pearl Buttons, French Cuffs',
            weight: '16 Momme',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L'],
        colors: ['white', 'cream', 'lavender'],
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
        description: 'Classic denim skirt with modern cut. Versatile for any occasion.',
        details: {
            material: '100% Cotton Denim',
            fit: 'A-Line',
            care: 'Machine Wash Cold',
            style: 'Denim Skirt',
            features: 'Button Front, Side Pockets',
            weight: '10 oz Denim',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L'],
        colors: ['blue', 'black'],
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
        description: 'Traditional Indian kurti set with embroidery work.',
        details: {
            material: 'Cotton with Silk Embroidery',
            fit: 'Regular Fit',
            care: 'Dry Clean Recommended',
            style: 'Ethnic Wear',
            features: 'Hand Embroidery, Matching Dupatta',
            weight: '320 GSM',
            origin: 'Made in India'
        },
        sizes: ['S', 'M', 'L'],
        colors: ['pink', 'blue', 'maroon'],
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
        description: 'Colorful cartoon print t-shirt for kids. Soft and comfortable.',
        details: {
            material: '100% Cotton',
            fit: 'Regular Fit',
            care: 'Machine Washable',
            style: 'Casual T-Shirt',
            features: 'Cartoon Print, Tagless Neck',
            weight: '160 GSM',
            origin: 'Made in India'
        },
        sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
        colors: ['blue', 'red', 'green', 'yellow'],
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
        description: 'Mini version of classic denim jacket for kids.',
        details: {
            material: '100% Cotton Denim',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Kids Jacket',
            features: 'Snap Buttons, Chest Pocket',
            weight: '10 oz Denim',
            origin: 'Made in India'
        },
        sizes: ['3-4Y', '5-6Y', '7-8Y'],
        colors: ['blue', 'black'],
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
        description: 'Beautiful party dress for special occasions.',
        details: {
            material: 'Satin with Tulle',
            fit: 'A-Line',
            care: 'Hand Wash',
            style: 'Party Dress',
            features: 'Ruffles, Sash Belt',
            weight: '280 GSM',
            origin: 'Made in India'
        },
        sizes: ['3-4Y', '5-6Y', '7-8Y'],
        colors: ['pink', 'purple', 'white'],
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
        description: 'Comfortable track pants for active kids.',
        details: {
            material: 'Polyester Cotton Blend',
            fit: 'Regular Fit',
            care: 'Machine Washable',
            style: 'Athletic Wear',
            features: 'Elastic Waist, Side Stripes',
            weight: '250 GSM',
            origin: 'Made in India'
        },
        sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
        colors: ['navy', 'black', 'gray'],
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
        description: 'Warm winter jacket with hood for cold weather.',
        details: {
            material: 'Polyester with Filling',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            style: 'Winter Jacket',
            features: 'Hood, Zip Pockets, Quilted',
            weight: '450 GSM',
            origin: 'Made in India'
        },
        sizes: ['3-4Y', '5-6Y', '7-8Y'],
        colors: ['red', 'blue', 'black'],
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
        description: 'Lightweight running shoes with cushioning for maximum comfort.',
        details: {
            material: 'Mesh Upper, Rubber Sole',
            fit: 'True to Size',
            care: 'Wipe Clean',
            style: 'Athletic Shoes',
            features: 'Air Cushioning, Non-Slip Sole',
            weight: '280g per shoe',
            origin: 'Made in India'
        },
        sizes: ['7', '8', '9', '10'],
        colors: ['black', 'blue', 'gray'],
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
        description: 'Stylish casual sneakers for everyday wear.',
        details: {
            material: 'Canvas Upper, Rubber Sole',
            fit: 'True to Size',
            care: 'Spot Clean',
            style: 'Casual Shoes',
            features: 'Lace-up, Padded Collar',
            weight: '320g per shoe',
            origin: 'Made in India'
        },
        sizes: ['7', '8', '9', '10'],
        colors: ['white', 'black', 'navy'],
        category: 'footwear',
        rating: 4.6,
        reviewCount: 198,
        inStock: true
    },
    '18': {
        id: 18,
        name: 'Beige Oversized T-shirt',
        price: 239,
        images: ['product18.jpg', 'product18-side.jpg', 'product18-bottom.jpg'],
        description: 'Premium leather formal shoes for office and occasions.',
        details: {
            material: 'Genuine Leather',
            fit: 'True to Size',
            care: 'Polish Regularly',
            style: 'Formal Shoes',
            features: 'Leather Sole, Goodyear Welt',
            weight: '450g per shoe',
            origin: 'Made in India'
        },
        sizes: ['8', '9', '10', '11'],
        colors: ['black', 'brown'],
        category: 'footwear',
        rating: 4.9,
        reviewCount: 156,
        inStock: true
    },
    '19': {
        id: 19,
        name: 'Lavender Oversized T-shirt',
        price: 239,
        images: ['product19.jpg', 'product19-side.jpg', 'product19-back.jpg'],
        description: 'Elegant women\'s heels for parties and formal events.',
        details: {
            material: 'Synthetic Leather',
            fit: 'True to Size',
            care: 'Wipe Clean',
            style: 'Party Heels',
            features: '4-inch Heel, Ankle Strap',
            weight: '380g per shoe',
            origin: 'Made in India'
        },
        sizes: ['6', '7', '8'],
        colors: ['black', 'nude', 'red'],
        category: 'footwear',
        rating: 4.7,
        reviewCount: 203,
        inStock: true
    },
    '20': {
        id: 20,
        name: 'Black Sweatshirt',
        price: 299,
        images: ['product20.jpg', 'product20-side.jpg', 'product20-back.jpg'],
        description: 'Durable school shoes for kids with comfortable fit.',
        details: {
            material: 'Synthetic Leather',
            fit: 'True to Size',
            care: 'Wipe Clean',
            style: 'School Shoes',
            features: 'Velcro Strap, Padded Insole',
            weight: '220g per shoe',
            origin: 'Made in India'
        },
        sizes: ['1', '2', '3', '4'],
        colors: ['black', 'brown'],
        category: 'footwear',
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
        description: 'Genuine leather wallet with multiple card slots.',
        details: {
            material: 'Genuine Leather',
            fit: 'Standard',
            care: 'Leather Conditioner',
            style: 'Bifold Wallet',
            features: '8 Card Slots, 2 Note Compartments',
            weight: '150g',
            origin: 'Made in India'
        },
        sizes: ['One Size'],
        colors: ['black', 'brown', 'tan'],
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
        description: 'Printed silk scarf perfect for any outfit.',
        details: {
            material: '100% Pure Silk',
            fit: 'One Size',
            care: 'Dry Clean Only',
            style: 'Square Scarf',
            features: 'Hand Rolled Edges, Digital Print',
            dimensions: '90cm x 90cm',
            origin: 'Made in India'
        },
        sizes: ['One Size'],
        colors: ['multicolor', 'blue', 'pink'],
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
        description: 'Durable canvas backpack with laptop compartment.',
        details: {
            material: 'Heavy Duty Canvas',
            fit: '15-inch Laptop',
            care: 'Spot Clean',
            style: 'Backpack',
            features: 'Laptop Sleeve, Multiple Pockets',
            capacity: '25L',
            origin: 'Made in India'
        },
        sizes: ['One Size'],
        colors: ['khaki', 'navy', 'black'],
        category: 'accessories',
        rating: 4.8,
        reviewCount: 203,
        inStock: true
    },
    '24': {
        id: 24,
        name: 'Black Polo T-shirt',
        price: 249,
        images: ['product24.jpg', 'product24-side.jpg', 'product24-case.jpg'],
        description: 'UV protected sunglasses with polarized lenses.',
        details: {
            material: 'Acetate Frame',
            fit: 'Standard',
            care: 'Microfiber Cloth',
            style: 'Aviator',
            features: 'Polarized Lenses, UV400 Protection',
            lensColor: 'Brown Gradient',
            origin: 'Made in India'
        },
        sizes: ['One Size'],
        colors: ['black', 'brown', 'tortoise'],
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
        description: 'Warm winter gloves with touchscreen compatibility.',
        details: {
            material: 'Acrylic Wool Blend',
            fit: 'One Size Fits All',
            care: 'Hand Wash',
            style: 'Winter Gloves',
            features: 'Touchscreen Fingers, Fleece Lining',
            weight: '80g per pair',
            origin: 'Made in India'
        },
        sizes: ['One Size'],
        colors: ['black', 'gray', 'navy'],
        category: 'accessories',
        rating: 4.6,
        reviewCount: 112,
        inStock: true
    }
};
