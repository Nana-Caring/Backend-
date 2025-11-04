import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const CategoryTitle = styled.h2`
  margin: 0;
  color: #333;
  flex: 1;
`;

const ProductCount = styled.span`
  background: #4caf50;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : '#f5f5f5'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 3rem;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.3;
`;

const ProductBrand = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const ProductPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #4caf50;
  margin: 0.5rem 0;
`;

const ProductDescription = styled.p`
  margin: 0.5rem 0 0 0;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StockBadge = styled.span`
  background: ${props => props.inStock ? '#4caf50' : '#f44336'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  h3 {
    margin: 1rem 0;
    color: #333;
  }
  
  p {
    margin: 0.5rem 0;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 1.5rem;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #4caf50;
    }
  }
`;

const DependentProducts = ({ dependentId, category, onBackToCategories, token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [dependentId, category, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/products/dependent/${dependentId}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      Education: '📚',
      Healthcare: '🏥',
      Groceries: '🛒',
      Entertainment: '🎮',
      Other: '📦',
      Pregnancy: '🤱'
    };
    return emojis[category] || '📦';
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading products...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={onBackToCategories}>
          ← Back to Categories
        </BackButton>
        <CategoryTitle>
          {getCategoryEmoji(category)} {category}
        </CategoryTitle>
        <ProductCount>{products.length} products</ProductCount>
      </Header>

      <SearchBar>
        <input
          type="text"
          placeholder={`Search ${category} products...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {products.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '3rem' }}>
            {searchTerm ? '🔍' : getCategoryEmoji(category)}
          </div>
          <h3>
            {searchTerm 
              ? `No products found for "${searchTerm}"` 
              : `No products available in ${category}`
            }
          </h3>
          <p>
            {searchTerm 
              ? 'Try a different search term or browse other categories.' 
              : 'This category currently has no age-appropriate products available.'
            }
          </p>
        </EmptyState>
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id}>
              <ProductImage 
                imageUrl={product.mainImage?.url}
              >
                {!product.mainImage?.url && getCategoryEmoji(category)}
              </ProductImage>
              
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductBrand>{product.brand}</ProductBrand>
                <ProductPrice>R {parseFloat(product.price).toFixed(2)}</ProductPrice>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                  <StockBadge inStock={product.inStock}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </StockBadge>
                  {product.sku && (
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {product.description && (
                  <ProductDescription>{product.description}</ProductDescription>
                )}
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      )}
    </Container>
  );
};

export default DependentProducts;