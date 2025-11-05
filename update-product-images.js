const { Product } = require('./models');

// High-quality image mappings using Pixabay and Pexels (exact product names)
const productImageMappings = {
  // Healthcare Products
  'Disprin Original Pain Relief 24 Tablets': 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?w=800&h=600',
  'Panado 500mg Pain Relief 24 Tablets': 'https://cdn.pixabay.com/photo/2016/11/29/12/45/fitness-1869902_640.jpg',
  'Clicks Vitamin C 500mg 30 Tablets': 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg?w=800&h=600',
  'Clicks Digital Thermometer': 'https://cdn.pixabay.com/photo/2020/04/29/07/54/coronavirus-5107715_640.jpg',
  'Clicks Hand Sanitizer 500ml': 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?w=800&h=600',
  'Children\'s Multivitamin Gummies - Mixed Fruit': 'https://images.pexels.com/photos/3683094/pexels-photo-3683094.jpeg?w=800&h=600',
  'Complete Family First Aid Emergency Kit': 'https://cdn.pixabay.com/photo/2017/08/12/10/16/cross-2635909_640.jpg',

  // Pregnancy & Baby Care
  'Clicks Pregnancy Test Digital': 'https://images.pexels.com/photos/1556704/pexels-photo-1556704.jpeg?w=800&h=600',
  'Pregnacare Original 30 Tablets': 'https://images.pexels.com/photos/3683094/pexels-photo-3683094.jpeg?w=800&h=600',
  'Clicks Folic Acid 5mg 30 Tablets': 'https://cdn.pixabay.com/photo/2017/02/07/16/47/jar-2045567_640.jpg',
  'Bio-Oil Skincare Oil 125ml': 'https://images.pexels.com/photos/1007066/pexels-photo-1007066.jpeg?w=800&h=600',
  'Johnson\'s Baby Shampoo 500ml': 'https://cdn.pixabay.com/photo/2017/07/18/15/39/toy-2516582_640.jpg',
  'Purity Baby Wipes Sensitive 80 Pack': 'https://images.pexels.com/photos/1007066/pexels-photo-1007066.jpeg?w=800&h=600',
  'Bepanthen Nappy Care Ointment 30g': 'https://cdn.pixabay.com/photo/2017/03/14/03/18/woman-2141808_640.jpg',
  'Prenatal Complete Vitamin Complex with DHA': 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?w=800&h=600',
  'Ergonomic Maternity Support Pillow - Full Body': 'https://cdn.pixabay.com/photo/2017/03/14/03/18/woman-2141808_640.jpg',

  // Personal Care
  'Colgate Total Advanced Toothpaste 75ml': 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=800&h=600',
  'Nivea Soft Moisturising Cream 200ml': 'https://cdn.pixabay.com/photo/2016/11/29/12/45/fitness-1869902_640.jpg',
  'Dove Original Beauty Bar 100g': 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?w=800&h=600',

  // Education Products
  'Crayola Crayons 24 Pack': 'https://cdn.pixabay.com/photo/2017/09/03/18/40/art-2713587_640.jpg',
  'Learn to Read Phonics Books Set': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=800&h=600',
  'Mathematical Learning Blocks': 'https://cdn.pixabay.com/photo/2017/08/06/12/06/people-2591874_640.jpg',
  'Science Experiment Kit for Kids': 'https://cdn.pixabay.com/photo/2017/09/26/13/42/apple-2788662_640.jpg',
  'Educational Tablet for Kids': 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=800&h=600',
  'Educational Puzzle Set 500 Pieces - Country Life': 'https://cdn.pixabay.com/photo/2017/10/24/00/39/jigsaw-2880214_640.jpg',
  'Children\'s Educational Learning Tablet 10"': 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=800&h=600',

  // Food & Groceries
  'Organic Baby Food Puree - Mixed Vegetables': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?w=800&h=600',
  'Kids Fruit Snack Bars': 'https://cdn.pixabay.com/photo/2016/07/22/09/59/apples-1534494_640.jpg',
  'Whole Grain Cereal for Kids': 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=800&h=600',
  'Calcium Rich Milk 1L': 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?w=800&h=600',
  'Toddler Formula Milk Powder': 'https://cdn.pixabay.com/photo/2016/02/10/16/37/cat-1192026_640.jpg',
  'Healthy Kids Lunch Box Snacks Pack': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=800&h=600',
  'Fresh Organic Red Apples 1kg': 'https://cdn.pixabay.com/photo/2016/07/22/09/59/apples-1534494_640.jpg',
  'Artisan Whole Grain Bread Loaf': 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=800&h=600',
  'Organic Quinoa Superfood 500g': 'https://cdn.pixabay.com/photo/2018/02/25/07/15/quinoa-3179999_640.jpg',
  'Natural Immune Boost Tea Blend': 'https://cdn.pixabay.com/photo/2017/02/07/16/47/jar-2045567_640.jpg',

  // Entertainment Products
  'Building Blocks Set - 100 Pieces': 'https://images.pexels.com/photos/159395/lego-toys-blocks-colorful-159395.jpeg?w=800&h=600',
  'Puzzle 1000 Pieces - Nature Scene': 'https://cdn.pixabay.com/photo/2017/10/24/00/39/jigsaw-2880214_640.jpg',
  'Board Game - Family Fun Night': 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800&h=600',
  'Coloring Books Set with Markers': 'https://images.pexels.com/photos/207665/pexels-photo-207665.jpeg?w=800&h=600',
  'Interactive Story Book with Sound': 'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?w=800&h=600',
  'Kids Karaoke Machine with Microphone': 'https://images.pexels.com/photos/164742/pexels-photo-164742.jpeg?w=800&h=600',
  'Video Game - Educational Adventure': 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=800&h=600',
  'Family Board Game Collection Set': 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800&h=600',
  'Wireless Bluetooth Noise-Cancelling Headphones': 'https://images.pexels.com/photos/164742/pexels-photo-164742.jpeg?w=800&h=600',
  'Portable Chess Set with Tutorial App': 'https://cdn.pixabay.com/photo/2017/12/21/09/18/chess-3031503_640.jpg'
};

async function updateProductImages() {
  try {
    console.log('🔄 Starting product image update process...\n');

    const products = await Product.findAll();
    console.log(`📊 Found ${products.length} products to potentially update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const newImageUrl = productImageMappings[product.name];
      
      if (newImageUrl && product.image !== newImageUrl) {
        const oldUrl = product.image || 'No previous URL';
        await product.update({ image: newImageUrl });
        
        console.log(`✅ Updated: ${product.name}`);
        console.log(`   Old: ${oldUrl.length > 60 ? oldUrl.substring(0, 60) + '...' : oldUrl}`);
        console.log(`   New: ${newImageUrl.substring(0, 60)}...`);
        console.log(`   Category: ${product.category}\n`);
        
        updatedCount++;
      } else if (newImageUrl) {
        console.log(`⏭️  Skipped: ${product.name} (already has correct image)`);
        skippedCount++;
      } else {
        console.log(`⚠️  No mapping found for: ${product.name}`);
        skippedCount++;
      }
    }

    console.log('\n🎉 Image update process completed!');
    console.log(`📈 Statistics:`);
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products`);
    console.log(`   📊 Total: ${products.length} products`);

    if (updatedCount > 0) {
      console.log('\n🌟 Your products now use high-quality images from:');
      console.log('   • Pixabay (professional, free)');
      console.log('   • Pexels (commercial-grade photography)');
      console.log('   • All images are optimized for web display');
    }

  } catch (error) {
    console.error('❌ Error updating product images:', error);
  }
}

// Run the update
updateProductImages();