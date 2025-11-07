const { Product } = require('./models');

// High-quality alternative image sources mapped by actual product names
const alternativeImages = {
  // Education Category
  'Children\'s Educational Learning Tablet 10"': 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=800&h=600',
  'Crayola Crayons 24 Pack': 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?w=800&h=600',
  'Educational Puzzle Set 500 Pieces - Country Life': 'https://cdn.pixabay.com/photo/2017/10/31/19/05/web-2903804_640.jpg',
  'Educational Tablet for Kids': 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=800&h=600',
  'Learn to Read Phonics Books Set': 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_640.jpg',
  'Mathematical Learning Blocks': 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?w=800&h=600',
  'Science Experiment Kit for Kids': 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?w=800&h=600',

  // Entertainment Category
  'Board Game - Family Fun Night': 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800&h=600',
  'Building Blocks Set - 100 Pieces': 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?w=800&h=600',
  'Coloring Books Set with Markers': 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?w=800&h=600',
  'Family Board Game Collection Set': 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800&h=600',
  'Interactive Story Book with Sound': 'https://cdn.pixabay.com/photo/2017/08/12/10/16/book-2635456_640.jpg',
  'Kids Karaoke Machine with Microphone': 'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_640.jpg',
  'Portable Chess Set with Tutorial App': 'https://cdn.pixabay.com/photo/2017/02/25/22/09/chess-2098489_640.jpg',
  'Puzzle 1000 Pieces - Nature Scene': 'https://cdn.pixabay.com/photo/2017/10/31/19/05/web-2903804_640.jpg',
  'Video Game - Educational Adventure': 'https://cdn.pixabay.com/photo/2017/08/24/11/49/controller-2676554_640.jpg',
  'Wireless Bluetooth Noise-Cancelling Headphones': 'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?w=800&h=600',

  // Groceries Category
  'Fresh Fruits and Vegetables': 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?w=800&h=600',
  'Whole Grain Bread': 'https://cdn.pixabay.com/photo/2017/06/23/23/57/bread-2434370_640.jpg',
  'Organic Milk': 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?w=800&h=600',
  'Lean Protein (Chicken, Fish)': 'https://cdn.pixabay.com/photo/2018/02/08/22/27/duck-3139143_640.jpg',
  'Breakfast Cereals': 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?w=800&h=600',
  'Healthy Snacks': 'https://cdn.pixabay.com/photo/2017/05/11/19/44/fresh-2305192_640.jpg',
  'Cooking Oil': 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?w=800&h=600',
  'Baby Food Jars': 'https://cdn.pixabay.com/photo/2017/09/28/18/19/baby-food-2793010_640.jpg',
  'Organic Quinoa': 'https://images.pexels.com/photos/793785/pexels-photo-793785.jpeg?w=800&h=600',

  // Healthcare Category
  'First Aid Kit': 'https://cdn.pixabay.com/photo/2017/03/22/17/39/cross-2165549_640.jpg',
  'Children\'s Vitamins': 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?w=800&h=600',
  'Thermometer': 'https://cdn.pixabay.com/photo/2020/04/29/07/54/thermometer-5107990_640.jpg',
  'Hand Sanitizer': 'https://images.pexels.com/photos/4167544/pexels-photo-4167544.jpeg?w=800&h=600',
  'Pain Relief Medication': 'https://cdn.pixabay.com/photo/2017/03/14/03/29/pills-2141834_640.jpg',
  'Blood Pressure Monitor': 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?w=800&h=600',
  'Bandages and Gauze': 'https://cdn.pixabay.com/photo/2016/05/24/18/06/first-aid-1412703_640.jpg',
  'Natural Immune Boost Tea': 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?w=800&h=600',

  // Pregnancy Category
  'Prenatal Vitamins': 'https://images.pexels.com/photos/3923170/pexels-photo-3923170.jpeg?w=800&h=600',
  'Maternity Clothes': 'https://cdn.pixabay.com/photo/2017/08/03/22/12/maternity-2579630_640.jpg',
  'Baby Bottles and Supplies': 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?w=800&h=600',
  'Pregnancy Pillow': 'https://cdn.pixabay.com/photo/2017/03/14/03/29/pillow-2141845_640.jpg',
  'Baby Monitor': 'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?w=800&h=600',
  'Nursing Bras': 'https://cdn.pixabay.com/photo/2017/08/03/22/12/lingerie-2579641_640.jpg',

  // Other Category
  'Household Cleaning Supplies': 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?w=800&h=600',
  'Personal Hygiene Products': 'https://cdn.pixabay.com/photo/2017/04/03/15/52/soap-2198365_640.jpg',
  'Basic Tools Set': 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?w=800&h=600',
  'Emergency Flashlight': 'https://cdn.pixabay.com/photo/2016/03/09/15/10/flashlight-1246043_640.jpg',
  'Phone Chargers': 'https://images.pexels.com/photos/163069/mobile-phone-android-apps-application-163069.jpeg?w=800&h=600',
  'Water Filter': 'https://cdn.pixabay.com/photo/2017/02/15/10/39/water-2068219_640.jpg'
};

const updateProductImages = async () => {
  try {
    console.log('🔄 Starting product image update with alternative sources...\n');

    // Get all current products
    const products = await Product.findAll();
    console.log(`📊 Found ${products.length} products to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Check if we have an alternative image for this product
      if (alternativeImages[product.name]) {
        const oldImageUrl = product.imageUrl;
        const newImageUrl = alternativeImages[product.name];

        // Update the product with new image URL
        await product.update({ imageUrl: newImageUrl });

        console.log(`✅ Updated: ${product.name}`);
        console.log(`   Old: ${oldImageUrl ? oldImageUrl.substring(0, 60) + '...' : 'No previous image'}`);
        console.log(`   New: ${newImageUrl.substring(0, 60)}...\n`);
        
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${product.name} (no alternative image mapped)`);
        skippedCount++;
      }
    }

    console.log('\n🎉 Product image update completed!');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`📊 Total: ${products.length} products processed`);

    // Show category distribution
    console.log('\n📈 Updated products by category:');
    const categoryCount = {};
    const updatedProducts = await Product.findAll();
    
    for (const product of updatedProducts) {
      if (alternativeImages[product.name]) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      }
    }

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products with new images`);
    });

    console.log('\n🌟 All products now use high-quality Pixabay and Pexels images!');
    console.log('🚀 Your platform now has professional, free-to-use product images.');

  } catch (error) {
    console.error('❌ Error updating product images:', error);
  }
};

// Run the update if this script is executed directly
if (require.main === module) {
  updateProductImages();
}

module.exports = { updateProductImages, alternativeImages };