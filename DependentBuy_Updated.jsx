import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../store/slices/ui';
import healthcareIcon from '../../assets/icons/healthcare.png';
import clothingIcon from '../../assets/icons/clothing.png';
import schoolIcon from '../../assets/icons/school.png';
import babycareIcon from '../../assets/icons/babycare.png';
import entertainmentIcon from '../../assets/icons/entertainment.png';
import pregnancyIcon from '../../assets/icons/pregnancy.png';
// Additional icons for backend categories
import buyIcon from '../../assets/icons/buy.png'; // For Groceries
import setupIcon from '../../assets/icons/setup.png'; // For Other

const BACKEND_CATEGORIES = ['Healthcare', 'Education', 'Groceries', 'Pregnancy', 'Entertainment', 'Other'];

const CATEGORY_DESCRIPTIONS = {
  Healthcare: 'Medical supplies, vitamins, and health products',
  Education: 'School supplies, books, and educational materials',
  Groceries: 'Food, beverages, and household essentials',
  Pregnancy: 'Prenatal vitamins, pregnancy tests, and maternity care products',
  Entertainment: 'Games, toys, and entertainment items',
  Other: 'Personal care, baby products, and miscellaneous items'
};

// Age-appropriate messaging for restricted categories
const AGE_RESTRICTION_MESSAGES = {
  Healthcare: 'Some healthcare products require age verification (18+)',
  Education: 'Educational products and school supplies',
  Groceries: 'Food and household items for all ages',
  Pregnancy: 'Pregnancy and maternity products',
  Entertainment: 'Age-appropriate entertainment and games',
  Other: 'Personal care and general products'
};

const CATEGORY_ICONS = {
  Healthcare: <img src={healthcareIcon} alt="Healthcare" width={40} height={40} style={{borderRadius: '50%'}} />,
  Education: <img src={schoolIcon} alt="Education" width={40} height={40} style={{borderRadius: '50%'}} />,
  Groceries: <img src={buyIcon} alt="Groceries" width={40} height={40} style={{borderRadius: '50%'}} />,
  Pregnancy: <img src={pregnancyIcon} alt="Pregnancy" width={40} height={40} style={{borderRadius: '50%'}} />,
  Entertainment: <img src={entertainmentIcon} alt="Entertainment" width={40} height={40} style={{borderRadius: '50%'}} />,
  Other: <img src={setupIcon} alt="Other" width={40} height={40} style={{borderRadius: '50%'}} />,
  // Legacy frontend labels mapped for completeness
  Clothing: <img src={clothingIcon} alt="Clothing" width={40} height={40} style={{borderRadius: '50%'}} />,
  School: <img src={schoolIcon} alt="School" width={40} height={40} style={{borderRadius: '50%'}} />,
  Babycare: <img src={babycareIcon} alt="Babycare" width={40} height={40} style={{borderRadius: '50%'}} />,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-top: -40px;
  height: calc(100vh - 60px);
  overflow: hidden;
  position: relative;
  margin-left: 175px;
`;

const Title = styled.h2`
  color: #185c37;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  text-align: center;
`;

const AgeInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  
  .age-display {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .age-category {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 8px 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  opacity: ${props => props.disabled ? 0.6 : 1};
  border: 2px solid ${props => props.hasProducts ? '#4CAF50' : props.hasRestrictedProducts ? '#FF9800' : '#e0e0e0'};

  &:hover {
    box-shadow: ${props => props.disabled ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 16px rgba(0,0,0,0.10)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ComingSoonBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
  text-transform: uppercase;
`;

const ProductCountBadge = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
  background: ${props => props.hasRestrictions ? '#FF9800' : '#4CAF50'};
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
  min-width: 16px;
  text-align: center;
`;

const Label = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #185c37;
  text-align: center;
  font-weight: 500;
  padding: 0 4px;
`;

const AgeWarning = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const DependentBuy = () => {
  const navigate = useNavigate();
  const authUser = useSelector(state => state.authentication?.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allowedCategories, setAllowedCategories] = useState([]);
  const [dependentInfo, setDependentInfo] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    const fetchAgeBasedCategories = async () => {
      if (!authUser?.role || authUser.role.toLowerCase() !== 'dependent' || !authUser?.id) {
        // Non-dependent: show full set (no age filter)
        setAllowedCategories(BACKEND_CATEGORIES);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        dispatch(showLoading({ message: 'Loading age-appropriate categories…' }));
        setError(null);

        const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || sessionStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

        // Use the proper age-based endpoint
        const res = await fetch(`${BASE_URL}/admin/dependents/${authUser.id}/products?limit=200`, { headers });
        const data = await res.json();

        if (!res.ok) {
          // Handle specific age-related errors
          if (data?.errorCode === 'INVALID_IDNUMBER') {
            throw new Error('Invalid ID number - cannot determine age. Please update your profile.');
          }
          throw new Error(data?.message || `HTTP ${res.status}`);
        }

        if (!data?.success) {
          throw new Error(data?.message || 'Failed to fetch age-appropriate products');
        }

        // Extract dependent information
        const dependent = data.dependent;
        setDependentInfo(dependent);

        // Get products and categorize them
        const items = Array.isArray(data.data) ? data.data : [];
        
        // Group products by category and count them
        const categoryMap = {};
        const stats = {};
        
        items.forEach(product => {
          const category = product.category;
          if (!categoryMap[category]) {
            categoryMap[category] = [];
            stats[category] = {
              total: 0,
              hasRestrictions: false
            };
          }
          categoryMap[category].push(product);
          stats[category].total++;
          
          // Check if product has age restrictions
          if (product.minAge || product.maxAge || product.requiresAgeVerification) {
            stats[category].hasRestrictions = true;
          }
        });

        setCategoryStats(stats);

        // Get available categories in the correct order
        const availableCategories = BACKEND_CATEGORIES.filter(c => categoryMap[c] && categoryMap[c].length > 0);
        setAllowedCategories(availableCategories.length > 0 ? availableCategories : BACKEND_CATEGORIES);

      } catch (e) {
        console.error('Failed to fetch age-appropriate categories:', e);
        setError(e.message);
        setAllowedCategories(BACKEND_CATEGORIES);
      } finally {
        setLoading(false);
        dispatch(hideLoading());
      }
    };

    fetchAgeBasedCategories();
  }, [authUser?.role, authUser?.id, dispatch]);
  
  const handleCategoryClick = (category) => {
    // Check if category has products available
    const hasProducts = categoryStats[category]?.total > 0;
    
    if (!hasProducts) {
      // Show message that no products are available for this age
      alert(`No ${category.toLowerCase()} products are available for your age group.`);
      return;
    }

    // Navigate to products with category filter and age context
    navigate('/products', { 
      state: { 
        category,
        dependentId: authUser?.id,
        ageInfo: dependentInfo 
      } 
    });
  };
  
  const displayCategories = useMemo(() => {
    return allowedCategories.map(label => {
      const stats = categoryStats[label] || { total: 0, hasRestrictions: false };
      return {
        label,
        icon: CATEGORY_ICONS[label],
        productCount: stats.total,
        hasRestrictions: stats.hasRestrictions,
        hasProducts: stats.total > 0
      };
    });
  }, [allowedCategories, categoryStats]);

  const hasAgeRestrictions = dependentInfo?.age < 18;

  return (
    <Container>
      <Title>Choose Your Product Category</Title>
      
      {!loading && dependentInfo && (
        <AgeInfo>
          <div className="age-display">Age: {dependentInfo.age} years</div>
          <div className="age-category">Category: {dependentInfo.ageCategory}</div>
        </AgeInfo>
      )}

      {!loading && hasAgeRestrictions && (
        <AgeWarning>
          ⚠️ Some products may require age verification (18+)
        </AgeWarning>
      )}

      {!loading && (
        <>
          {error && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px', 
              color: '#b00020',
              backgroundColor: '#ffebee',
              padding: '10px',
              borderRadius: '8px',
              maxWidth: '400px',
              margin: '0 auto 12px'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <Grid>
            {displayCategories.map((cat) => {
              return (
                <Card
                  key={cat.label}
                  disabled={!cat.hasProducts}
                  hasProducts={cat.hasProducts}
                  hasRestrictedProducts={cat.hasRestrictions}
                  onClick={() => handleCategoryClick(cat.label)}
                  title={cat.hasProducts ? 
                    (AGE_RESTRICTION_MESSAGES[cat.label] || CATEGORY_DESCRIPTIONS[cat.label]) : 
                    `No ${cat.label.toLowerCase()} products available for your age`
                  }
                >
                  {cat.productCount > 0 && (
                    <ProductCountBadge hasRestrictions={cat.hasRestrictions}>
                      {cat.productCount}
                    </ProductCountBadge>
                  )}
                  
                  {!cat.hasProducts && (
                    <ComingSoonBadge>No Products</ComingSoonBadge>
                  )}
                  
                  {cat.icon}
                  <Label>{cat.label}</Label>
                </Card>
              );
            })}
          </Grid>

          {displayCategories.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '16px'
            }}>
              No product categories are currently available.
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default DependentBuy;