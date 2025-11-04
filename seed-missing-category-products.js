const { Product } = require('./models');

// Seed products for categories that currently have no products
async function seedMissingCategoryProducts() {
    try {
        console.log('\n=== Seeding Products for Empty Categories ===');

        // Education Category Products
        const educationProducts = [
            {
                name: 'Crayola Crayons 24 Pack',
                brand: 'Crayola',
                price: 45.99,
                category: 'Education',
                description: 'Non-toxic crayons perfect for creative learning and artistic expression.',
                sku: 'CRAY-24-001',
                inStock: true,
                stockQuantity: 150,
                minAge: 3,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Learn to Read Phonics Books Set',
                brand: 'Scholastic',
                price: 189.99,
                category: 'Education',
                description: 'Complete phonics learning set with 12 progressive reading books.',
                sku: 'SCHOL-PHON-12',
                inStock: true,
                stockQuantity: 75,
                minAge: 4,
                maxAge: 10,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Mathematical Learning Blocks',
                brand: 'Learning Resources',
                price: 129.99,
                category: 'Education',
                description: 'Colorful counting and sorting blocks for early mathematics education.',
                sku: 'LR-MATH-BLOCKS',
                inStock: true,
                stockQuantity: 100,
                minAge: 3,
                maxAge: 8,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Science Experiment Kit for Kids',
                brand: 'National Geographic',
                price: 299.99,
                category: 'Education',
                description: 'Safe and fun science experiments to spark curiosity and learning.',
                sku: 'NG-SCI-KIT-001',
                inStock: true,
                stockQuantity: 50,
                minAge: 8,
                maxAge: 14,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Educational Tablet for Kids',
                brand: 'LeapFrog',
                price: 899.99,
                category: 'Education',
                description: 'Interactive learning tablet with educational games and apps.',
                sku: 'LEAP-TAB-EDU',
                inStock: true,
                stockQuantity: 30,
                minAge: 5,
                maxAge: 12,
                requiresAgeVerification: false,
                isActive: true
            }
        ];

        // Groceries Category Products
        const groceriesProducts = [
            {
                name: 'Organic Baby Food Puree - Mixed Vegetables',
                brand: 'Woolworths',
                price: 18.99,
                category: 'Groceries',
                description: 'Organic vegetable puree perfect for babies starting solids.',
                sku: 'WW-BABY-VEG-120',
                inStock: true,
                stockQuantity: 200,
                minAge: 0,
                maxAge: 2,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Kids Fruit Snack Bars',
                brand: 'Jungle',
                price: 24.99,
                category: 'Groceries',
                description: 'Natural fruit bars with no added sugar, perfect for lunchboxes.',
                sku: 'JNG-FRUIT-BAR-6',
                inStock: true,
                stockQuantity: 180,
                minAge: 2,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Whole Grain Cereal for Kids',
                brand: 'Kelloggs',
                price: 35.99,
                category: 'Groceries',
                description: 'Nutritious whole grain cereal fortified with vitamins and minerals.',
                sku: 'KEL-WG-CEREAL-500',
                inStock: true,
                stockQuantity: 120,
                minAge: 2,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Calcium Rich Milk 1L',
                brand: 'Clover',
                price: 22.99,
                category: 'Groceries',
                description: 'Fresh milk enriched with calcium for growing children.',
                sku: 'CLV-MILK-CAL-1L',
                inStock: true,
                stockQuantity: 150,
                minAge: 1,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Toddler Formula Milk Powder',
                brand: 'Nestlé',
                price: 189.99,
                category: 'Groceries',
                description: 'Nutritionally complete formula for toddlers aged 1-3 years.',
                sku: 'NES-FORM-TOD-900',
                inStock: true,
                stockQuantity: 80,
                minAge: 1,
                maxAge: 3,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Healthy Kids Lunch Box Snacks Pack',
                brand: 'Pick n Pay',
                price: 42.99,
                category: 'Groceries',
                description: 'Variety pack of healthy snacks perfect for school lunch boxes.',
                sku: 'PNP-LUNCH-PACK',
                inStock: true,
                stockQuantity: 100,
                minAge: 3,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            }
        ];

        // Entertainment Category Products
        const entertainmentProducts = [
            {
                name: 'Building Blocks Set - 100 Pieces',
                brand: 'LEGO',
                price: 299.99,
                category: 'Entertainment',
                description: 'Classic building blocks set to encourage creativity and imagination.',
                sku: 'LEGO-CLASS-100',
                inStock: true,
                stockQuantity: 90,
                minAge: 4,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Puzzle 1000 Pieces - Nature Scene',
                brand: 'Ravensburger',
                price: 159.99,
                category: 'Entertainment',
                description: 'Challenging 1000-piece puzzle featuring beautiful nature photography.',
                sku: 'RAV-PUZ-NAT-1000',
                inStock: true,
                stockQuantity: 60,
                minAge: 12,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Board Game - Family Fun Night',
                brand: 'Hasbro',
                price: 249.99,
                category: 'Entertainment',
                description: 'Exciting family board game for 2-6 players, ages 8 and up.',
                sku: 'HAS-FAM-GAME-001',
                inStock: true,
                stockQuantity: 75,
                minAge: 8,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Coloring Books Set with Markers',
                brand: 'Crayola',
                price: 89.99,
                category: 'Entertainment',
                description: 'Set of 5 coloring books with washable markers for creative fun.',
                sku: 'CRAY-COL-SET-5',
                inStock: true,
                stockQuantity: 120,
                minAge: 3,
                maxAge: 12,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Interactive Story Book with Sound',
                brand: 'VTech',
                price: 179.99,
                category: 'Entertainment',
                description: 'Interactive storybook with sound effects and voice narration.',
                sku: 'VTECH-STORY-SND',
                inStock: true,
                stockQuantity: 85,
                minAge: 2,
                maxAge: 7,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Kids Karaoke Machine with Microphone',
                brand: 'Singing Machine',
                price: 399.99,
                category: 'Entertainment',
                description: 'Portable karaoke machine with built-in songs and microphone.',
                sku: 'SM-KARAOKE-KIDS',
                inStock: true,
                stockQuantity: 40,
                minAge: 5,
                maxAge: null,
                requiresAgeVerification: false,
                isActive: true
            },
            {
                name: 'Video Game - Educational Adventure',
                brand: 'Nintendo',
                price: 459.99,
                category: 'Entertainment',
                description: 'Age-appropriate adventure game with educational elements.',
                sku: 'NINT-EDU-ADV-001',
                inStock: true,
                stockQuantity: 50,
                minAge: 8,
                maxAge: 16,
                requiresAgeVerification: false,
                isActive: true
            }
        ];

        // Combine all products
        const allProducts = [
            ...educationProducts,
            ...groceriesProducts,
            ...entertainmentProducts
        ];

        console.log(`\nCreating ${allProducts.length} products across 3 categories:`);
        console.log(`- Education: ${educationProducts.length} products`);
        console.log(`- Groceries: ${groceriesProducts.length} products`);
        console.log(`- Entertainment: ${entertainmentProducts.length} products`);

        // Insert products in batches
        const createdProducts = [];
        
        for (const productData of allProducts) {
            try {
                // Check if product with same SKU already exists
                const existingProduct = await Product.findOne({
                    where: { sku: productData.sku }
                });

                if (existingProduct) {
                    console.log(`⚠️  Skipping ${productData.name} - SKU already exists`);
                    continue;
                }

                const product = await Product.create(productData);
                createdProducts.push(product);
                console.log(`✅ Created: ${product.category} - ${product.name} (${product.sku})`);
                
            } catch (error) {
                console.log(`❌ Failed to create ${productData.name}: ${error.message}`);
            }
        }

        // Summary
        console.log(`\n=== Seeding Summary ===`);
        console.log(`Total products created: ${createdProducts.length}/${allProducts.length}`);
        
        // Get updated category counts
        const { Op } = require('sequelize');
        const categoryStats = await Product.findAll({
            attributes: [
                'category',
                [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'productCount']
            ],
            where: { 
                isActive: true,
                inStock: true 
            },
            group: ['category'],
            order: [['category', 'ASC']],
            raw: true
        });

        console.log('\n📊 Updated Category Statistics:');
        const allCategories = ['Education', 'Healthcare', 'Groceries', 'Entertainment', 'Other', 'Pregnancy'];
        allCategories.forEach(category => {
            const stats = categoryStats.find(stat => stat.category === category);
            const count = stats ? parseInt(stats.productCount) : 0;
            const status = count > 0 ? '✅' : '❌';
            console.log(`   ${category}: ${count} products ${status}`);
        });

        console.log('\n🎯 Age Distribution Summary:');
        const ageRanges = [
            { name: 'Infants (0-2)', min: 0, max: 2 },
            { name: 'Toddlers (3-5)', min: 3, max: 5 },
            { name: 'Children (6-12)', min: 6, max: 12 },
            { name: 'Teens (13-17)', min: 13, max: 17 },
            { name: 'Adults (18+)', min: 18, max: 150 }
        ];

        for (const range of ageRanges) {
            const count = await Product.count({
                where: {
                    isActive: true,
                    inStock: true,
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { minAge: null },
                                { minAge: { [Op.lte]: range.max } }
                            ]
                        },
                        {
                            [Op.or]: [
                                { maxAge: null },
                                { maxAge: { [Op.gte]: range.min } }
                            ]
                        }
                    ]
                }
            });
            console.log(`   ${range.name}: ${count} available products`);
        }

        console.log('\n✅ Category seeding completed successfully!');

    } catch (error) {
        console.error('Seeding error:', error);
    }
}

// Run the seeding
seedMissingCategoryProducts()
    .then(() => {
        console.log('\n=== Seeding Complete ===');
        process.exit(0);
    })
    .catch(error => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });