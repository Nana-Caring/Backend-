import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => {
    if (!props.isAvailable) return '#e0e0e0';
    if (props.hasRestrictions) return '#ff9800';
    return '#4caf50';
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  ${props => !props.isAvailable && `
    opacity: 0.6;
    cursor: not-allowed;
  `}
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => {
    const colors = {
      Education: '#2196f3',
      Healthcare: '#f44336',
      Groceries: '#4caf50',
      Entertainment: '#9c27b0',
      Other: '#607d8b',
      Pregnancy: '#e91e63'
    };
    return colors[props.category] || '#9e9e9e';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
`;

const CategoryTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProductBadge = styled.span`
  background: ${props => {
    if (!props.isAvailable) return '#e0e0e0';
    if (props.hasRestrictions) return '#ff9800';
    return '#4caf50';
  }};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const RestrictionBadge = styled.div`
  background: #fff3e0;
  border: 1px solid #ff9800;
  color: #f57c00;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const AgeInfo = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
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
  margin: 1rem;
  text-align: center;
`;

const CategorySelector = ({ dependentId, onCategorySelect, token }) => {
  const [categories, setCategories] = useState([]);
  const [dependent, setDependent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [dependentId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch age-appropriate categories for the dependent
      const response = await fetch(`/api/products/dependent/${dependentId}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
        setDependent(data.dependent);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }

    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Education: '📚',
      Healthcare: '🏥',
      Groceries: '🛒',
      Entertainment: '🎮',
      Other: '📦',
      Pregnancy: '🤱'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return <LoadingSpinner>Loading categories...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <div>
      {dependent && (
        <AgeInfo>
          <strong>{dependent.name}</strong> • Age: {dependent.age} • Category: {dependent.ageCategory}
        </AgeInfo>
      )}

      <CategoryGrid>
        {categories.map((category) => (
          <CategoryCard
            key={category.category}
            isAvailable={category.isAccessible}
            hasRestrictions={category.hasRestrictions}
            onClick={() => category.isAccessible && onCategorySelect(category.category)}
          >
            <CategoryIcon category={category.category}>
              {getCategoryIcon(category.category)}
            </CategoryIcon>
            
            <CategoryTitle>
              {category.category}
              <ProductBadge 
                isAvailable={category.isAccessible} 
                hasRestrictions={category.hasRestrictions}
              >
                {category.availableProducts} products
              </ProductBadge>
            </CategoryTitle>

            {category.hasRestrictions && (
              <RestrictionBadge>
                ⚠️ {category.restrictionReason}
              </RestrictionBadge>
            )}

            {!category.isAccessible && (
              <RestrictionBadge style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
                🚫 No available products
              </RestrictionBadge>
            )}
          </CategoryCard>
        ))}
      </CategoryGrid>
    </div>
  );
};

export default CategorySelector;