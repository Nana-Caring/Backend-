const { Product } = require('./models');

async function seedProductsWithImages() {
  try {
    console.log('🌱 Seeding 60+ products with image URLs across all categories...');

    // Clear existing products first
    await Product.destroy({ where: {}, force: true });
    console.log('🗑️ Cleared existing products');

    const productCategories = {
      Healthcare: [
        {
          name: 'Pregnavit M 30 Capsules',
          brand: 'Clicks',
          description: 'Prenatal vitamins for expecting mothers',
          detailedDescription: 'Pregnavit M 30 Capsules are formulated for women before, during and after pregnancy. It contains folic acid and a range of essential vitamins and minerals to improve energy, maintain healthy cells, and promote strong bones and teeth.',
          price: 189.99,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
          ],
          subcategory: 'Vitamins & Supplements',
          sku: 'PREG001',
          stockQuantity: 50,
          minAge: 18,
          maxAge: 50,
          ageCategory: 'Adult',
          requiresAgeVerification: true
        },
        {
          name: 'Children\'s Multivitamin Gummies',
          brand: 'Kids Health',
          description: 'Fun and tasty multivitamin gummies for children',
          detailedDescription: 'Delicious fruit-flavored gummies packed with essential vitamins and minerals to support your child\'s healthy growth and development.',
          price: 99.99,
          image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop'
          ],
          subcategory: 'Children\'s Health',
          sku: 'KIDS001',
          stockQuantity: 75,
          minAge: 2,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Vitamin C 1000mg Tablets',
          brand: 'HealthPlus',
          description: 'High-strength Vitamin C for immune support',
          detailedDescription: 'Premium quality Vitamin C tablets to boost your immune system and support overall health.',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=600&fit=crop',
          images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop'],
          subcategory: 'Vitamins & Supplements',
          sku: 'VITC001',
          stockQuantity: 100,
          minAge: 12,
          ageCategory: 'Teen'
        },
        {
          name: 'Calcium + D3 Tablets',
          brand: 'BoneStrong',
          description: 'Calcium with Vitamin D3 for bone health',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          subcategory: 'Vitamins & Supplements',
          sku: 'CALC001',
          stockQuantity: 60,
          minAge: 18,
          ageCategory: 'Adult'
        },
        {
          name: 'Omega-3 Fish Oil',
          brand: 'MarineHealth',
          description: 'Pure fish oil for heart and brain health',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1505751104442-161335d45f67?w=800&h=600&fit=crop',
          subcategory: 'Vitamins & Supplements',
          sku: 'OMEGA001',
          stockQuantity: 40,
          minAge: 16,
          ageCategory: 'Adult'
        },
        {
          name: 'First Aid Kit',
          brand: 'SafetyFirst',
          description: 'Complete first aid kit for home and travel',
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1603398938209-f37922557733?w=800&h=600&fit=crop',
          subcategory: 'Medical Supplies',
          sku: 'AID001',
          stockQuantity: 25,
          ageCategory: 'All Ages'
        },
        {
          name: 'Digital Thermometer',
          brand: 'TempCheck',
          description: 'Fast and accurate digital thermometer',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          subcategory: 'Medical Devices',
          sku: 'TEMP001',
          stockQuantity: 80,
          ageCategory: 'All Ages'
        },
        {
          name: 'Hand Sanitizer 500ml',
          brand: 'CleanHands',
          description: '70% alcohol hand sanitizer',
          price: 35.99,
          image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800&h=600&fit=crop',
          subcategory: 'Hygiene',
          sku: 'SANI001',
          stockQuantity: 200,
          ageCategory: 'All Ages'
        },
        {
          name: 'Protein Powder Vanilla',
          brand: 'FitNutrition',
          description: 'Whey protein powder for muscle building',
          price: 459.99,
          image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=600&fit=crop',
          subcategory: 'Sports Nutrition',
          sku: 'PROT001',
          stockQuantity: 30,
          minAge: 16,
          ageCategory: 'Adult'
        },
        {
          name: 'Cough Syrup',
          brand: 'ReliefMed',
          description: 'Natural cough syrup for cold relief',
          price: 65.99,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          subcategory: 'Cold & Flu',
          sku: 'COUGH001',
          stockQuantity: 50,
          minAge: 6,
          ageCategory: 'Child'
        },
        {
          name: 'Bandages Pack',
          brand: 'HealFast',
          description: 'Assorted adhesive bandages',
          price: 25.99,
          image: 'https://images.unsplash.com/photo-1603398938209-f37922557733?w=800&h=600&fit=crop',
          subcategory: 'Medical Supplies',
          sku: 'BAND001',
          stockQuantity: 150,
          ageCategory: 'All Ages'
        }
      ],
      Education: [
        {
          name: 'High School Mathematics Textbook',
          brand: 'EduBooks',
          description: 'Comprehensive mathematics textbook for grades 10-12',
          detailedDescription: 'A complete mathematics curriculum covering algebra, geometry, calculus, and statistics. Perfect for high school students preparing for exams.',
          price: 450.00,
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop'
          ],
          subcategory: 'Textbooks',
          sku: 'MATH001',
          stockQuantity: 25,
          minAge: 14,
          maxAge: 18,
          ageCategory: 'Teen'
        },
        {
          name: 'Primary English Workbook',
          brand: 'LearnWell',
          description: 'Interactive English workbook for primary school',
          price: 120.00,
          image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop',
          subcategory: 'Workbooks',
          sku: 'ENG001',
          stockQuantity: 60,
          minAge: 6,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Science Experiment Kit',
          brand: 'ScienceFun',
          description: 'Hands-on science experiments for kids',
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
          subcategory: 'Educational Toys',
          sku: 'SCI001',
          stockQuantity: 35,
          minAge: 8,
          maxAge: 15,
          ageCategory: 'Child'
        },
        {
          name: 'Calculator Scientific',
          brand: 'MathPro',
          description: 'Advanced scientific calculator',
          price: 179.99,
          image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
          subcategory: 'School Supplies',
          sku: 'CALC002',
          stockQuantity: 50,
          minAge: 12,
          ageCategory: 'Teen'
        },
        {
          name: 'Art Supply Set',
          brand: 'CreativeKids',
          description: 'Complete art supplies for young artists',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
          subcategory: 'Art Supplies',
          sku: 'ART001',
          stockQuantity: 40,
          minAge: 4,
          maxAge: 16,
          ageCategory: 'Child'
        },
        {
          name: 'World Atlas',
          brand: 'GeoLearn',
          description: 'Comprehensive world atlas with maps',
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&h=600&fit=crop',
          subcategory: 'Reference Books',
          sku: 'ATLAS001',
          stockQuantity: 20,
          minAge: 8,
          ageCategory: 'Child'
        },
        {
          name: 'Geometry Set',
          brand: 'PrecisionTools',
          description: 'Professional geometry tools set',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
          subcategory: 'School Supplies',
          sku: 'GEO001',
          stockQuantity: 75,
          minAge: 10,
          ageCategory: 'Child'
        },
        {
          name: 'Laptop for Students',
          brand: 'TechEdu',
          description: 'Affordable laptop for educational use',
          price: 4999.99,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
          subcategory: 'Technology',
          sku: 'LAPTOP001',
          stockQuantity: 15,
          minAge: 12,
          ageCategory: 'Teen'
        },
        {
          name: 'Dictionary English-Afrikaans',
          brand: 'LangBooks',
          description: 'Comprehensive bilingual dictionary',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
          subcategory: 'Reference Books',
          sku: 'DICT001',
          stockQuantity: 45,
          minAge: 8,
          ageCategory: 'Child'
        },
        {
          name: 'Flash Cards Math',
          brand: 'QuickLearn',
          description: 'Math flash cards for quick learning',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
          subcategory: 'Learning Aids',
          sku: 'FLASH001',
          stockQuantity: 100,
          minAge: 5,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Microscope Student',
          brand: 'VisionScope',
          description: 'Student-grade microscope for biology',
          price: 899.99,
          image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
          subcategory: 'Lab Equipment',
          sku: 'MICRO001',
          stockQuantity: 12,
          minAge: 10,
          ageCategory: 'Child'
        }
      ],
      Groceries: [
        {
          name: 'Baby Food - Apple Puree',
          brand: 'BabyFirst',
          description: 'Organic apple puree for babies 6+ months',
          detailedDescription: 'Pure organic apple puree made from fresh apples. No added sugar, preservatives, or artificial flavors. Perfect first food for babies.',
          price: 25.99,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
          ],
          subcategory: 'Baby Food',
          sku: 'BABY001',
          stockQuantity: 100,
          minAge: 0,
          maxAge: 2,
          ageCategory: 'Toddler'
        },
        {
          name: 'Energy Drink - RedBull',
          brand: 'RedBull',
          description: 'Energy drink with caffeine and taurine',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop',
          subcategory: 'Beverages',
          sku: 'ENERGY001',
          stockQuantity: 200,
          minAge: 16,
          ageCategory: 'Adult',
          requiresAgeVerification: true
        },
        {
          name: 'Whole Wheat Bread',
          brand: 'FreshBake',
          description: 'Nutritious whole wheat bread loaf',
          price: 22.99,
          image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&h=600&fit=crop',
          subcategory: 'Bakery',
          sku: 'BREAD001',
          stockQuantity: 80,
          ageCategory: 'All Ages'
        },
        {
          name: 'Fresh Milk 2L',
          brand: 'DairyFresh',
          description: 'Fresh full cream milk',
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop',
          subcategory: 'Dairy',
          sku: 'MILK001',
          stockQuantity: 150,
          ageCategory: 'All Ages'
        },
        {
          name: 'Organic Eggs 12 Pack',
          brand: 'FarmFresh',
          description: 'Free-range organic eggs',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1569288052389-dac9b01ac282?w=800&h=600&fit=crop',
          subcategory: 'Dairy',
          sku: 'EGGS001',
          stockQuantity: 60,
          ageCategory: 'All Ages'
        },
        {
          name: 'Breakfast Cereal',
          brand: 'MorningCrunch',
          description: 'Nutritious whole grain cereal',
          price: 65.99,
          image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=600&fit=crop',
          subcategory: 'Breakfast',
          sku: 'CEREAL001',
          stockQuantity: 90,
          minAge: 2,
          ageCategory: 'Child'
        },
        {
          name: 'Fresh Bananas 1kg',
          brand: 'TropicalFresh',
          description: 'Sweet fresh bananas',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          subcategory: 'Fruits',
          sku: 'BANANA001',
          stockQuantity: 120,
          ageCategory: 'All Ages'
        },
        {
          name: 'Orange Juice 1L',
          brand: 'CitrusFresh',
          description: '100% pure orange juice',
          price: 28.99,
          image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&h=600&fit=crop',
          subcategory: 'Beverages',
          sku: 'JUICE001',
          stockQuantity: 85,
          ageCategory: 'All Ages'
        },
        {
          name: 'Chicken Breast 1kg',
          brand: 'FreshMeat',
          description: 'Premium chicken breast fillets',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
          subcategory: 'Meat',
          sku: 'CHICKEN001',
          stockQuantity: 45,
          ageCategory: 'All Ages'
        },
        {
          name: 'Rice 2kg',
          brand: 'GrainMaster',
          description: 'Premium long grain rice',
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
          subcategory: 'Grains',
          sku: 'RICE001',
          stockQuantity: 70,
          ageCategory: 'All Ages'
        },
        {
          name: 'Pasta 500g',
          brand: 'ItalianStyle',
          description: 'Premium durum wheat pasta',
          price: 18.99,
          image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop',
          subcategory: 'Grains',
          sku: 'PASTA001',
          stockQuantity: 95,
          ageCategory: 'All Ages'
        }
      ],
      Transport: [
        {
          name: 'Bicycle Adult Mountain',
          brand: 'RideMaster',
          description: '21-speed mountain bike for adults',
          price: 2999.99,
          image: 'https://images.unsplash.com/photo-1544191696-15693072cd00?w=800&h=600&fit=crop',
          subcategory: 'Bicycles',
          sku: 'BIKE001',
          stockQuantity: 15,
          minAge: 16,
          ageCategory: 'Adult'
        },
        {
          name: 'Kids Bicycle with Training Wheels',
          brand: 'KidRide',
          description: 'Safe bicycle for young children',
          price: 899.99,
          image: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=800&h=600&fit=crop',
          subcategory: 'Bicycles',
          sku: 'BIKEK001',
          stockQuantity: 25,
          minAge: 4,
          maxAge: 8,
          ageCategory: 'Child'
        },
        {
          name: 'Helmet Safety',
          brand: 'SafeRide',
          description: 'Protective helmet for cycling',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
          subcategory: 'Safety Gear',
          sku: 'HELMET001',
          stockQuantity: 60,
          minAge: 3,
          ageCategory: 'Child'
        },
        {
          name: 'Car Seat Child',
          brand: 'SafetyFirst',
          description: 'Child car seat for safe travel',
          price: 1299.99,
          image: 'https://images.unsplash.com/photo-1586772002994-d087bb565dfd?w=800&h=600&fit=crop',
          subcategory: 'Car Accessories',
          sku: 'CARSEAT001',
          stockQuantity: 20,
          minAge: 0,
          maxAge: 4,
          ageCategory: 'Toddler'
        },
        {
          name: 'Scooter Electric',
          brand: 'EcoRide',
          description: 'Electric scooter for urban transport',
          price: 3999.99,
          image: 'https://images.unsplash.com/photo-1544954503-6ad5ac882d5d?w=800&h=600&fit=crop',
          subcategory: 'Electric Vehicles',
          sku: 'SCOOTER001',
          stockQuantity: 12,
          minAge: 16,
          ageCategory: 'Adult'
        },
        {
          name: 'Skateboard Teen',
          brand: 'SkateZone',
          description: 'Complete skateboard for teenagers',
          price: 499.99,
          image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
          subcategory: 'Skateboards',
          sku: 'SKATE001',
          stockQuantity: 35,
          minAge: 10,
          maxAge: 18,
          ageCategory: 'Teen'
        },
        {
          name: 'Bus Pass Monthly',
          brand: 'CityTransport',
          description: 'Monthly public transport pass',
          price: 150.00,
          image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
          subcategory: 'Public Transport',
          sku: 'BUSPASS001',
          stockQuantity: 500,
          minAge: 6,
          ageCategory: 'Child'
        },
        {
          name: 'Taxi Voucher R100',
          brand: 'RideEasy',
          description: 'Prepaid taxi voucher',
          price: 100.00,
          image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          subcategory: 'Ride Services',
          sku: 'TAXI001',
          stockQuantity: 200,
          minAge: 12,
          ageCategory: 'Teen'
        },
        {
          name: 'Fuel Card R200',
          brand: 'FuelStation',
          description: 'Prepaid fuel card',
          price: 200.00,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          subcategory: 'Fuel',
          sku: 'FUEL001',
          stockQuantity: 100,
          minAge: 18,
          ageCategory: 'Adult'
        },
        {
          name: 'Bicycle Lock',
          brand: 'SecureLock',
          description: 'Heavy-duty bicycle lock',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1544954503-6ad5ac882d5d?w=800&h=600&fit=crop',
          subcategory: 'Accessories',
          sku: 'LOCK001',
          stockQuantity: 80,
          ageCategory: 'All Ages'
        },
        {
          name: 'Car Air Freshener',
          brand: 'FreshDrive',
          description: 'Long-lasting car air freshener',
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          subcategory: 'Car Accessories',
          sku: 'FRESH001',
          stockQuantity: 150,
          ageCategory: 'All Ages'
        }
      ],
      Entertainment: [
        {
          name: 'Tablet for Kids - Educational Games',
          brand: 'KidsTech',
          description: 'Educational tablet with pre-loaded learning games',
          detailedDescription: 'Kid-friendly tablet with educational games, parental controls, and durable design. Perfect for learning and entertainment.',
          price: 1299.99,
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=300&fit=crop'
          ],
          subcategory: 'Electronics',
          sku: 'TAB001',
          stockQuantity: 15,
          minAge: 3,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Board Game - Monopoly',
          brand: 'Hasbro',
          description: 'Classic Monopoly board game',
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
          subcategory: 'Board Games',
          sku: 'MONO001',
          stockQuantity: 40,
          minAge: 8,
          ageCategory: 'Child'
        },
        {
          name: 'PlayStation Game',
          brand: 'Sony',
          description: 'Latest action adventure game',
          price: 799.99,
          image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
          subcategory: 'Video Games',
          sku: 'PS001',
          stockQuantity: 25,
          minAge: 16,
          ageCategory: 'Teen',
          requiresAgeVerification: true
        },
        {
          name: 'Puzzle 1000 Pieces',
          brand: 'PuzzleMaster',
          description: 'Challenging 1000-piece jigsaw puzzle',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
          subcategory: 'Puzzles',
          sku: 'PUZZLE001',
          stockQuantity: 60,
          minAge: 10,
          ageCategory: 'Child'
        },
        {
          name: 'Action Figures Set',
          brand: 'HeroToys',
          description: 'Superhero action figures collection',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&h=600&fit=crop',
          subcategory: 'Toys',
          sku: 'ACTION001',
          stockQuantity: 50,
          minAge: 4,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Bluetooth Speaker',
          brand: 'SoundMax',
          description: 'Portable wireless speaker',
          price: 599.99,
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop',
          subcategory: 'Audio',
          sku: 'SPEAKER001',
          stockQuantity: 30,
          minAge: 12,
          ageCategory: 'Teen'
        },
        {
          name: 'Movie Ticket',
          brand: 'CinemaWorld',
          description: 'Movie theater admission ticket',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1489599845029-41b7dab155bb?w=800&h=600&fit=crop',
          subcategory: 'Cinema',
          sku: 'MOVIE001',
          stockQuantity: 200,
          minAge: 3,
          ageCategory: 'Child'
        },
        {
          name: 'Guitar Acoustic',
          brand: 'MusicMaker',
          description: 'Beginner acoustic guitar',
          price: 899.99,
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          subcategory: 'Musical Instruments',
          sku: 'GUITAR001',
          stockQuantity: 20,
          minAge: 8,
          ageCategory: 'Child'
        },
        {
          name: 'Coloring Books Set',
          brand: 'ArtFun',
          description: 'Set of coloring books with crayons',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
          subcategory: 'Art & Craft',
          sku: 'COLOR001',
          stockQuantity: 80,
          minAge: 3,
          maxAge: 10,
          ageCategory: 'Child'
        },
        {
          name: 'Remote Control Car',
          brand: 'SpeedRacer',
          description: 'High-speed RC racing car',
          price: 399.99,
          image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&h=600&fit=crop',
          subcategory: 'RC Toys',
          sku: 'RC001',
          stockQuantity: 35,
          minAge: 6,
          maxAge: 16,
          ageCategory: 'Child'
        },
        {
          name: 'VR Headset',
          brand: 'VirtualWorld',
          description: 'Virtual reality gaming headset',
          price: 1999.99,
          image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop',
          subcategory: 'VR Gaming',
          sku: 'VR001',
          stockQuantity: 10,
          minAge: 13,
          ageCategory: 'Teen'
        }
      ],
      Other: [
        {
          name: 'Backpack School',
          brand: 'StudyGear',
          description: 'Durable school backpack',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
          subcategory: 'Bags',
          sku: 'BAG001',
          stockQuantity: 70,
          minAge: 5,
          ageCategory: 'Child'
        },
        {
          name: 'Water Bottle Stainless',
          brand: 'HydroPlus',
          description: 'Insulated stainless steel water bottle',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop',
          subcategory: 'Drinkware',
          sku: 'BOTTLE001',
          stockQuantity: 100,
          ageCategory: 'All Ages'
        },
        {
          name: 'Lunch Box Kids',
          brand: 'MealTime',
          description: 'Colorful insulated lunch box',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          subcategory: 'Lunch Boxes',
          sku: 'LUNCH001',
          stockQuantity: 85,
          minAge: 3,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Phone Charger USB-C',
          brand: 'PowerTech',
          description: 'Fast charging USB-C cable',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop',
          subcategory: 'Electronics',
          sku: 'CHARGE001',
          stockQuantity: 120,
          minAge: 10,
          ageCategory: 'Child'
        },
        {
          name: 'Umbrella Compact',
          brand: 'WeatherShield',
          description: 'Compact travel umbrella',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1527345159620-d15bcf5cb3c5?w=800&h=600&fit=crop',
          subcategory: 'Weather Protection',
          sku: 'UMBRELLA001',
          stockQuantity: 90,
          ageCategory: 'All Ages'
        },
        {
          name: 'Sunglasses Kids',
          brand: 'SunSafe',
          description: 'UV protection sunglasses for children',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
          subcategory: 'Eyewear',
          sku: 'SUNGLASS001',
          stockQuantity: 60,
          minAge: 2,
          maxAge: 12,
          ageCategory: 'Child'
        },
        {
          name: 'Wallet Leather',
          brand: 'ClassicLeather',
          description: 'Genuine leather wallet',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
          subcategory: 'Accessories',
          sku: 'WALLET001',
          stockQuantity: 50,
          minAge: 16,
          ageCategory: 'Adult'
        },
        {
          name: 'Face Mask Cloth 3-Pack',
          brand: 'HealthGuard',
          description: 'Reusable cloth face masks',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800&h=600&fit=crop',
          subcategory: 'Health Protection',
          sku: 'MASK001',
          stockQuantity: 200,
          minAge: 3,
          ageCategory: 'Child'
        },
        {
          name: 'Keychain LED Flashlight',
          brand: 'BrightLight',
          description: 'Mini LED flashlight keychain',
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop',
          subcategory: 'Tools',
          sku: 'LED001',
          stockQuantity: 150,
          ageCategory: 'All Ages'
        },
        {
          name: 'Socks Cotton 6-Pack',
          brand: 'ComfortWear',
          description: 'Comfortable cotton socks pack',
          price: 69.99,
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop',
          subcategory: 'Clothing',
          sku: 'SOCKS001',
          stockQuantity: 100,
          ageCategory: 'All Ages'
        }
      ]
    };

    let totalCreated = 0;
    const categoryStats = {};

    // Create products for each category
    for (const [category, products] of Object.entries(productCategories)) {
      console.log(`\n📦 Creating ${category} products...`);
      categoryStats[category] = 0;

      for (const productData of products) {
        try {
          // Add common fields
          const completeProductData = {
            ...productData,
            category,
            ingredients: productData.ingredients || null,
            weight: productData.weight || null,
            manufacturer: productData.manufacturer || `${productData.brand} Manufacturing`,
            tags: productData.tags || [category.toLowerCase(), productData.brand.toLowerCase()],
            inStock: true,
            isActive: true,
            rating: Math.floor(Math.random() * 2) + 4, // Random rating 4-5
            createdBy: 1 // Admin user ID
          };

          const product = await Product.create(completeProductData);
          categoryStats[category]++;
          totalCreated++;
          console.log(`✅ Created: ${product.name} (ID: ${product.id})`);

        } catch (error) {
          console.error(`❌ Failed to create ${productData.name}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Successfully created ${totalCreated} products!`);
    
    // Display summary
    console.log('\n📊 Products Summary by Category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });

    // Display age distribution
    console.log('\n👶 Age Category Distribution:');
    const ageStats = {};
    for (const products of Object.values(productCategories)) {
      products.forEach(product => {
        const ageCategory = product.ageCategory || 'All Ages';
        if (!ageStats[ageCategory]) ageStats[ageCategory] = 0;
        ageStats[ageCategory]++;
      });
    }
    
    Object.entries(ageStats).forEach(([ageCategory, count]) => {
      console.log(`   ${ageCategory}: ${count} products`);
    });

    console.log('\n🎯 System Ready for Frontend Integration!');
    console.log('📷 All products have image URLs from Unsplash');
    console.log('🔒 Age restrictions properly configured');
    console.log('📱 Categories match dependent account types');

    return { totalCreated, categoryStats, ageStats };

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProductsWithImages()
    .then((stats) => {
      console.log('\n🎉 Product seeding with images completed!');
      console.log(`📈 Total products created: ${stats.totalCreated}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProductsWithImages };
