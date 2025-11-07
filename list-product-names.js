const { Product } = require('./models');

async function listProductNames() {
  try {
    const products = await Product.findAll();
    console.log('Product names for mapping:');
    console.log('');
    
    products.forEach(product => {
      console.log(`'${product.name}': '',`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

listProductNames();