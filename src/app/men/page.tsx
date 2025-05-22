"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/new.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { Filter, ChevronDown, ArrowUpDown, Grid, List } from 'lucide-react';
import { Product, getProductsByGender } from '../service/productService';
import { Search } from '../components/Search';
import { Cart } from '../components/Cart';
import { useWalletAuth } from '../components/AppWalletProvider';
import dynamic from 'next/dynamic';
import { useCart } from '../components/CartContext';


const DynamicWalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function NewArrivals() {
  const { phantomEmbedded, isEmbeddedConnected } = useWalletAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const { publicKey } = useWallet();
  const { addToCart } = useCart();
  
  // Fetch products
  useEffect(() => {
    const fetchNewProducts = async () => {
      setIsLoading(true);
      try {
        const newProducts = await getProductsByGender('Men');
        const sortedProducts = [...newProducts].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
      addToCart(product);
    };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply size filter if sizes are selected
    if (selectedSizes.length > 0) {
      result = result.filter(product => 
        selectedSizes.includes(product.size)
      );
    }
    
    // Apply color filter if colors are selected
    if (selectedColors.length > 0) {
      result = result.filter(product => 
        selectedColors.includes(product.color)
      );
    }
    
    // Apply price range filter
    result = result.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        // Poiché non abbiamo una data, ordiniamo per prezzo come sostituto
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [products, sortOption, priceRange, selectedSizes, selectedColors]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(event.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 200]);
    setSortOption('newest');
  };

  // Array di taglie e colori disponibili (da utilizzare come filtri)
  const sizes = ['S', 'M', 'L', 'XL']; 
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green'];

  // Componente ProductCard 
   const ProductCard = ({ product }: { product: Product }) => (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        <div className={styles.productImage}>
          {product.image_url ? (
            <Link href={`/product/${product.nft_address}`}>
            <img src={product.image_url} alt={product.name} className={styles.productImg} />
            </Link>
          ) : (
            <div className={styles.imagePlaceholder}></div>
          )}
        </div>
        <div className={styles.productNftBadge}>NFT Verified</div>
        {product.quantity === 0 && <div className={styles.unavailableBadge}>Not Available</div>}
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription}>{product.description}</p>
        <div className={styles.productDetails}>
          <span className={styles.productPrice}>€{product.price}</span>
          <div className={styles.productAttributes}>
            <span className={styles.productSize}>Size: {product.size}</span>
            <span className={styles.productColor}>Color: {product.color}</span>
          </div>
          <button 
            className={`${styles.addToCartButton} ${!product.isAvailable? styles.disabledButton : ''}`}
            onClick={() => product.isAvailable && handleAddToCart(product)}
            disabled={!product.isAvailable}
          >
            {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className={styles.main}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link href="/">
            <img src="/icon.png" alt="Site Logo" className={styles.logo} />
          </Link>
          
          <div className={styles.navMenu}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/new" className={styles.navLink}>New Arrivals</Link>
            <Link href="/men" className={`${styles.navLink} ${styles.active}`}>Men</Link>
            <Link href="/women" className={styles.navLink}>Women</Link>
            <Link href="/contacts" className={styles.navLink}>Contact</Link>
          </div>
          
          <div className={styles.navActions}>
            <Search />
            {!isEmbeddedConnected ? (<DynamicWalletMultiButton></DynamicWalletMultiButton>) : ('')}
            <Cart />
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>New Arrivals</h1>
          <p className={styles.pageDescription}>
            Discover our latest authentic fashion pieces, each verified with blockchain technology
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.productsContainer}>
          {/* Filters and Sorting */}
          <div className={`${styles.filtersBar} ${filtersVisible ? styles.filtersVisible : ''}`}>
            <div className={styles.filterToggle} onClick={toggleFilters}>
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} className={filtersVisible ? styles.rotated : ''} />
            </div>
            
            <div className={styles.sortOptions}>
              <div className={styles.sortDropdown}>
                <ArrowUpDown size={16} />
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>
              
              <div className={styles.viewOptions}>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {filtersVisible && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Sizes</h4>
                <div className={styles.filterOptions}>
                  {sizes.map(size => (
                    <label key={size} className={styles.filterCheckbox}>
                      <input 
                        type="checkbox" 
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      <span className={styles.checkmark}></span>
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Colors</h4>
                <div className={styles.filterOptions}>
                  {colors.map(color => (
                    <label key={color} className={styles.filterCheckbox}>
                      <input 
                        type="checkbox" 
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleColor(color)}
                      />
                      <span className={styles.checkmark}></span>
                      {color}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Price Range</h4>
                <div className={styles.priceInputs}>
                  <div className={styles.priceInput}>
                    <label>Min (€)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={priceRange[1]} 
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                    />
                  </div>
                  <div className={styles.priceInput}>
                    <label>Max (€)</label>
                    <input 
                      type="number" 
                      min={priceRange[0]} 
                      max="1000" 
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                    />
                  </div>
                </div>
                <div className={styles.priceSlider}>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className={styles.slider}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className={styles.slider}
                  />
                </div>
              </div>
              
              <button className={styles.clearFiltersButton} onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
          
          {/* Products Display */}
          {isLoading ? (
            <div className={styles.loadingIndicator}>Loading products...</div>
          ) : (
            <>
              <div className={styles.resultsCount}>
                {filteredProducts.length} products found
              </div>
              
              <div className={`${styles.productsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard key={product.nft_address} product={product} />
                  ))
                ) : (
                  <div className={styles.noResults}>
                    <p>No products match your filters</p>
                    <button className={styles.clearFiltersButton} onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

     {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <Link href="/">ACONSY</Link>
            </div>
            <p className={styles.footerTagline}>
              Authentic fashion powered by blockchain technology
            </p>
          </div>
          
          <div className={styles.footerNav}>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Shop</h4>
              <Link href="/new" className={styles.footerLink}>New Arrivals</Link>
              <Link href="/men" className={styles.footerLink}>Men</Link>
              <Link href="/women" className={styles.footerLink}>Women</Link>
              <Link href="/sale" className={styles.footerLink}>Sale</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Information</h4>
              <Link href="/about" className={styles.footerLink}>About Us</Link>
              <Link href="/blockchain" className={styles.footerLink}>Blockchain</Link>
              <Link href="/sustainability" className={styles.footerLink}>Sustainability</Link>
              <Link href="/faq" className={styles.footerLink}>FAQ</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Aconsy. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}