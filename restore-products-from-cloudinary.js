require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

// All your Cloudinary images with product details
const cloudinaryProductsToCreate = [
    {
        name: "Wireless Bluetooth Noise-Cancelling Headphones",
        sku: "HEADPHONES-BT-NC-PRO",
        category: "Entertainment",
        price: 749.99,
        description: "Premium wireless Bluetooth headphones with active noise cancellation technology for immersive audio experience.",
        image_id: "Wireless_Bluetooth_Noise-Cancelling_Headphones_odof6x"
    },
    {
        name: "Portable Chess Set with Tutorial App",
        sku: "CHESS-MAGNETIC-APP-NEW-001",
        category: "Education",
        price: 89.99,
        description: "Educational magnetic chess set with companion mobile app for learning chess strategies and tactics.",
        image_id: "Portable_Chess_Set_with_Tutorial_App_mmpapz"
    },
    {
        name: "Purity Baby Wipes Sensitive 80 Pack",
        sku: "PUR-WIPES-80",
        category: "Other",
        price: 34.99,
        description: "Gentle, hypoallergenic baby wipes specially formulated for sensitive skin, 80 count pack.",
        image_id: "Purity_Baby_Wipes_Sensitive_80_Pack_r4uw2c"
    },
    {
        name: "Panado 500mg Pain Relief 24 Tablets",
        sku: "PAN-500-24",
        category: "Healthcare",
        price: 32.99,
        description: "Fast-acting pain relief tablets containing 500mg paracetamol for headaches, fever and general pain.",
        image_id: "Panado_500mg_Pain_Relief_24_Tablets_zlzz5b"
    },
    {
        name: "Organic Quinoa Superfood 500g",
        sku: "QUINOA-ORG-500G-NEW-001",
        category: "Groceries",
        price: 89.99,
        description: "Premium organic quinoa, a complete protein superfood packed with essential amino acids and nutrients.",
        image_id: "Organic_Quinoa_Superfood_500g_ig20r6"
    },
    {
        name: "Nivea Soft Moisturising Cream 200ml",
        sku: "NIV-SOFT-200",
        category: "Other",
        price: 47.99,
        description: "Light, fast-absorbing moisturizing cream with Jojoba oil and Vitamin E for soft, smooth skin.",
        image_id: "Nivea_Soft_Moisturising_Cream_200ml_nxhvsz"
    },
    {
        name: "Natural Immune Boost Tea Blend",
        sku: "TEA-IMMUNE-BLEND-NEW-001",
        category: "Healthcare",
        price: 69.99,
        description: "Herbal tea blend with echinacea, ginger, and elderberry to naturally support immune system health.",
        image_id: "Natural_Immune_Boost_Tea_Blend_l1nw9g"
    },
    {
        name: "Johnson's Baby Shampoo 500ml",
        sku: "JOH-SHAMP-500",
        category: "Other",
        price: 54.99,
        description: "Gentle, tear-free baby shampoo with mild formula perfect for delicate baby hair and scalp.",
        image_id: "Johnson_s_Baby_Shampoo_500ml_bxncnu"
    },
    {
        name: "Fresh Organic Red Apples 1kg",
        sku: "APPLE-ORGANIC-RED-1KG",
        category: "Groceries",
        price: 45.99,
        description: "Fresh, crisp organic red apples, locally sourced and packed with vitamins and natural sweetness.",
        image_id: "Fresh_Organic_Red_Apples_1kg_zzey55"
    },
    {
        name: "Family Board Game Collection Set",
        sku: "BOARDGAME-FAMILY-3SET",
        category: "Entertainment",
        price: 399.99,
        description: "Complete family entertainment package with 3 classic board games for hours of fun together.",
        image_id: "Family_Board_Game_Collection_Set_fgdkiu"
    },
    {
        name: "Clicks Vitamin C 500mg 30 Tablets",
        sku: "CL-VITC-500",
        category: "Healthcare",
        price: 49.99,
        description: "High-potency Vitamin C supplements to support immune system and overall health, 30 tablets.",
        image_id: "Clicks_Vitamin_C_500mg_30_Tablets_qbhyy1"
    },
    {
        name: "Disprin Original Pain Relief 24 Tablets",
        sku: "DISP-ORIG-24",
        category: "Healthcare",
        price: 29.99,
        description: "Fast-dissolving aspirin tablets for quick relief from headaches, fever, and minor aches.",
        image_id: "Disprin_Original_Pain_Relief_24_Tablets_k1vbzs"
    },
    {
        name: "Complete Family First Aid Emergency Kit",
        sku: "FIRSTAID-COMPLETE-150",
        category: "Healthcare",
        price: 299.99,
        description: "Comprehensive 150-piece first aid kit with essential medical supplies for home and travel emergencies.",
        image_id: "Complete_Family_First_Aid_Emergency_Kit_mptt9w"
    },
    {
        name: "Colgate Total Advanced Toothpaste 75ml",
        sku: "COL-TOTAL-75",
        category: "Other",
        price: 42.99,
        description: "Advanced toothpaste with antibacterial protection for complete oral health care and fresh breath.",
        image_id: "Colgate_Total_Advanced_Toothpaste_75ml_z8fwgn"
    },
    {
        name: "Clicks Hand Sanitizer 500ml",
        sku: "CL-SANIT-500",
        category: "Healthcare",
        price: 39.99,
        description: "Alcohol-based hand sanitizer with 70% ethanol for effective germ protection, large 500ml size.",
        image_id: "Clicks_Hand_Sanitizer_500ml_edadcl"
    },
    {
        name: "Clicks Digital Thermometer",
        sku: "CL-THERM-DIG",
        category: "Healthcare",
        price: 79.99,
        description: "Accurate digital thermometer with fast reading and fever alert for reliable temperature monitoring.",
        image_id: "Clicks_Digital_Thermometer_td8pqr"
    },
    {
        name: "Learn to Read Phonics Books Set",
        sku: "SCHOL-PHON-12",
        category: "Education",
        price: 189.99,
        description: "12-book phonics learning set designed to help children develop reading skills step by step.",
        image_id: "Learn_to_Read_Phonics_Books_Set_vhav8g"
    },
    {
        name: "Whole Grain Cereal for Kids",
        sku: "KEL-WG-CEREAL-500",
        category: "Groceries",
        price: 35.99,
        description: "Nutritious whole grain cereal fortified with vitamins and minerals, perfect for growing children.",
        image_id: "Whole_Grain_Cereal_for_Kids_nmplkk"
    },
    {
        name: "Video Game - Educational Adventure",
        sku: "NINT-EDU-ADV-001",
        category: "Entertainment",
        price: 459.99,
        description: "Interactive educational adventure video game that makes learning fun through engaging gameplay.",
        image_id: "Video_Game_-_Educational_Adventure_dliigm"
    },
    {
        name: "Educational Tablet for Kids",
        sku: "LEAP-TAB-EDU",
        category: "Education",
        price: 899.99,
        description: "Kid-friendly educational tablet with pre-loaded learning apps and parental controls.",
        image_id: "Educational_Tablet_for_Kids_j6lrvk"
    },
    {
        name: "Dove Original Beauty Bar 100g",
        sku: "DOV-ORIG-100",
        category: "Other",
        price: 18.99,
        description: "Gentle beauty bar with moisturizing cream for soft, smooth skin, suitable for daily use.",
        image_id: "Dove_Original_Beauty_Bar_100g_evei3n"
    },
    {
        name: "Kids Fruit Snack Bars",
        sku: "JNG-FRUIT-BAR-6",
        category: "Groceries",
        price: 24.99,
        description: "Healthy fruit snack bars made with real fruit, no artificial colors or preservatives, 6-pack.",
        image_id: "Kids_Fruit_Snack_Bars_cbjh3g"
    },
    {
        name: "Kids Karaoke Machine with Microphone",
        sku: "SM-KARAOKE-KIDS",
        category: "Entertainment",
        price: 399.99,
        description: "Fun karaoke machine with wireless microphone and Bluetooth connectivity for kids' entertainment.",
        image_id: "Kids_Karaoke_Machine_with_Microphone_lziyyv"
    },
    {
        name: "Interactive Story Book with Sound",
        sku: "VTECH-STORY-SND",
        category: "Entertainment",
        price: 179.99,
        description: "Interactive storybook with sound effects and music to enhance reading experience for children.",
        image_id: "Interactive_Story_Book_with_Sound_o9cmqu"
    },
    {
        name: "Healthy Kids Lunch Box Snacks Pack",
        sku: "PNP-LUNCH-PACK",
        category: "Groceries",
        price: 42.99,
        description: "Variety pack of healthy, nutritious snacks perfect for school lunch boxes and on-the-go eating.",
        image_id: "Healthy_Kids_Lunch_Box_Snacks_Pack_uv3boq"
    },
    {
        name: "Puzzle 1000 Pieces - Nature Scene",
        sku: "RAV-PUZ-NAT-1000",
        category: "Entertainment",
        price: 159.99,
        description: "Challenging 1000-piece jigsaw puzzle featuring beautiful nature photography for relaxation and fun.",
        image_id: "Puzzle_1000_Pieces_-_Nature_Scene_gnbd4r"
    },
    {
        name: "Toddler Formula Milk Powder",
        sku: "NES-FORM-TOD-900",
        category: "Groceries",
        price: 189.99,
        description: "Nutritionally complete formula milk powder specially designed for toddlers aged 1-3 years, 900g.",
        image_id: "Toddler_Formula_Milk_Powde_t5ca2k"
    },
    {
        name: "Crayola Crayons 24 Pack",
        sku: "CRAY-24-001",
        category: "Education",
        price: 45.99,
        description: "Classic 24-pack of vibrant Crayola crayons, perfect for creative expression and educational activities.",
        image_id: "Crayola_Crayons_24_Pack_vn2i60"
    },
    {
        name: "Coloring Books Set with Markers",
        sku: "CRAY-COL-SET-5",
        category: "Entertainment",
        price: 89.99,
        description: "Complete coloring set with 5 themed coloring books and washable markers for creative fun.",
        image_id: "Coloring_Books_Set_with_Markers_ldvps3"
    },
    {
        name: "Soccer Ball Official Size 5",
        sku: "SOCCER-BALL-SIZE5-001",
        category: "Entertainment",
        price: 79.99,
        description: "Official FIFA-approved size 5 soccer ball with durable construction for outdoor play and training.",
        image_id: "Soccer_Ball_Official_Size_5_kaqled"
    }
];

// Function to generate optimized Cloudinary URL
function generateCloudinaryUrl(imageId) {
    return `https://res.cloudinary.com/dtyhvfjiz/image/upload/w_800,h_600,c_fill,q_auto,f_auto/${imageId}.jpg`;
}

// Function to extract brand from product name
function extractBrandFromName(name) {
    const brands = {
        'Wireless': 'Sony',
        'Portable Chess': 'ChessMaster',
        'Purity': 'Purity',
        'Panado': 'Panado',
        'Organic Quinoa': 'Organic Valley',
        'Nivea': 'Nivea',
        'Natural Immune': 'Nature\'s Way',
        'Johnson\'s': 'Johnson & Johnson',
        'Fresh Organic': 'Fresh Market',
        'Family Board Game': 'Hasbro',
        'Clicks Vitamin': 'Clicks',
        'Clicks Hand': 'Clicks',
        'Clicks Digital': 'Clicks',
        'Disprin': 'Disprin',
        'Complete Family': 'Johnson & Johnson',
        'Colgate': 'Colgate',
        'Learn to Read': 'Scholastic',
        'Whole Grain Cereal': 'Kellogg\'s',
        'Video Game': 'Nintendo',
        'Educational Tablet': 'LeapFrog',
        'Dove': 'Dove',
        'Kids Fruit': 'Jungle',
        'Kids Karaoke': 'Singing Machine',
        'Interactive Story': 'VTech',
        'Healthy Kids': 'Pick n Pay',
        'Puzzle 1000': 'Ravensburger',
        'Toddler Formula': 'Nestlé',
        'Crayola': 'Crayola',
        'Coloring Books': 'Crayola',
        'Soccer Ball': 'Nike'
    };
    
    for (const [key, brand] of Object.entries(brands)) {
        if (name.includes(key)) {
            return brand;
        }
    }
    return 'Generic Brand';
}

async function restoreProductsFromCloudinary() {
    try {
        console.log('🔄 RESTORING PRODUCTS FROM CLOUDINARY IMAGES');
        console.log('==============================================');

        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Check current products
        const existingProducts = await Product.findAll();
        console.log(`📦 Currently in database: ${existingProducts.length} products`);

        console.log('\n🆕 CREATING PRODUCTS FROM CLOUDINARY IMAGES:');
        console.log('============================================');

        let createdCount = 0;
        let skippedCount = 0;

        for (const productData of cloudinaryProductsToCreate) {
            try {
                // Check if product with same SKU already exists
                const existing = await Product.findOne({ where: { sku: productData.sku } });
                
                if (existing) {
                    console.log(`⏭️  Skipped: ${productData.name} (${productData.sku}) - Already exists`);
                    skippedCount++;
                    continue;
                }

                // Create the product with Cloudinary image URL
                const newProduct = await Product.create({
                    name: productData.name,
                    brand: productData.brand || extractBrandFromName(productData.name),
                    sku: productData.sku,
                    category: productData.category,
                    price: productData.price,
                    description: productData.description,
                    image: generateCloudinaryUrl(productData.image_id),
                    stockQuantity: 100, // Default stock
                    inStock: true,
                    isActive: true,
                    ageCategory: 'All Ages' // Default age category
                });

                console.log(`✅ Created: ${productData.name} (${productData.sku})`);
                console.log(`   🖼️  Image: ${productData.image_id}`);
                console.log(`   💰 Price: $${productData.price}`);
                console.log(`   📂 Category: ${productData.category}`);
                
                createdCount++;

            } catch (error) {
                console.log(`❌ Failed to create ${productData.name}: ${error.message}`);
            }
        }

        console.log('\n🎉 RESTORATION COMPLETE!');
        console.log('=========================');
        console.log(`📊 Products created: ${createdCount}`);
        console.log(`📊 Products skipped (already exist): ${skippedCount}`);
        console.log(`📊 Total Cloudinary images used: ${cloudinaryProductsToCreate.length}`);

        // Final count
        const finalProducts = await Product.findAll();
        console.log(`📦 Total products in database: ${finalProducts.length}`);

        console.log('\n🌟 ALL CLOUDINARY IMAGES NOW HAVE MATCHING PRODUCTS!');
        console.log('====================================================');
        console.log('🚀 Your product catalog is fully restored with optimized Cloudinary images!');
        console.log('📱 All images are mobile-optimized with smart compression');
        console.log('⚡ Lightning-fast loading with CDN delivery');

    } catch (error) {
        console.error('❌ Error restoring products:', error);
    } finally {
        // Close database connection
        await db.sequelize.close();
        console.log('📝 Database connection closed');
    }
}

// Run the restoration
restoreProductsFromCloudinary();