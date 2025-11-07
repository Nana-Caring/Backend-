const { Product } = require('./models');

// Professional MVP image solution with consistent branding
const updateToMVPProfessionalImages = async () => {
  try {
    console.log('🎯 Starting MVP Professional Image Update...\n');

    // Category-specific styling for professional MVP appearance
    const categoryStyles = {
      Healthcare: {
        bg: 'e3f2fd',      // Light medical blue
        text: '1976d2',     // Medical blue
        icon: '🏥'
      },
      Education: {
        bg: 'f3e5f5',      // Light educational purple
        text: '7b1fa2',     // Educational purple  
        icon: '📚'
      },
      Groceries: {
        bg: 'e8f5e8',      // Light fresh green
        text: '388e3c',     // Fresh green
        icon: '🥗'
      },
      Entertainment: {
        bg: 'fff3e0',      // Light fun orange
        text: 'f57c00',     // Fun orange
        icon: '🎮'
      },
      Pregnancy: {
        bg: 'fce4ec',      // Light caring pink
        text: 'c2185b',     // Caring pink
        icon: '🤱'
      },
      Other: {
        bg: 'f5f5f5',      // Light neutral gray
        text: '616161',     // Professional gray
        icon: '📦'
      }
    };

    const products = await Product.findAll();
    console.log(`📊 Found ${products.length} products to update\n`);

    let updatedCount = 0;

    for (const product of products) {
      // Get category styling
      const style = categoryStyles[product.category] || categoryStyles.Other;
      
      // Clean product name for URL (limit length, encode properly)
      const cleanName = product.name
        .substring(0, 25)  // Limit to 25 characters for clean display
        .replace(/[^\w\s]/g, '') // Remove special characters
        .trim();
      
      // Create professional placeholder image URL
      const professionalImageUrl = `https://via.placeholder.com/800x600/${style.bg}/${style.text}?text=${style.icon}+${encodeURIComponent(cleanName)}`;
      
      // Update product with new professional image
      await product.update({ image: professionalImageUrl });
      
      console.log(`✅ Updated: ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Style: ${style.icon} ${style.bg}/${style.text}`);
      console.log(`   Image: ${professionalImageUrl.substring(0, 70)}...\n`);
      
      updatedCount++;
    }

    console.log('🎉 MVP Professional Image Update Completed!');
    console.log(`📈 Statistics:`);
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   📊 Total: ${products.length} products\n`);

    console.log('🌟 MVP Benefits Applied:');
    console.log('   • Consistent professional branding across all products');
    console.log('   • Category-specific color coding for instant recognition');
    console.log('   • Clean, corporate-appropriate design');
    console.log('   • Fast-loading placeholder service');
    console.log('   • No copyright or licensing concerns');
    console.log('   • Ready for production MVP deployment\n');

    // Show category distribution
    const categoryCount = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    console.log('📋 Category Distribution with New Professional Images:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      const style = categoryStyles[category] || categoryStyles.Other;
      console.log(`   ${style.icon} ${category}: ${count} products`);
    });

  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
};

// Run the MVP professional image update
updateToMVPProfessionalImages();