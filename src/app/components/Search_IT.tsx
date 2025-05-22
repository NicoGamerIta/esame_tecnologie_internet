"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import styles from '../../styles/search.module.css';
import { searchProducts, Product } from '../service/productService';
import Link from 'next/link';
import { useCart } from './CartContext';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length > 2) {
        try {
          const foundProducts = await searchProducts(query);
          setResults(foundProducts);
        } catch (error) {
          console.error('Error searching products:', error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    fetchResults();
  }, [query]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    // Focus the input after a small delay to ensure it's available after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Optionally close search or provide feedback
    setIsSearchOpen(false);
  };

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      {isSearchOpen ? (
        <div className={styles.searchExpanded}>
          <div className={styles.searchInputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerco prodotti..."
              className={styles.searchInput}
              autoFocus
            />
            {query && (
              <button className={styles.clearButton} onClick={handleClearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
          
          {results.length > 0 && (
            <div className={styles.searchResults}>
              <h3 className={styles.resultsTitle}>Prodotti ({results.length})</h3>
              <div className={styles.resultsList}>
                {results.map(product => (
                  <div key={product.nft_address} className={styles.resultItem}>
                    <div className={styles.resultImage}>
                      <div className={styles.imagePlaceholder}>
                      <img src={product.image_url} alt={product.name} />
                      </div>
                    </div>
                    <div className={styles.resultDetails}>
                      <h4 className={styles.resultName}>{product.name}</h4>
                      <p className={styles.resultPrice}>€{product.price}</p>
                      <p className={styles.resultDescription}>{product.description}</p>
                    </div>
                    <div className={styles.resultActions}>
                      <Link 
                        href={`/it/product/${product.nft_address}`}
                        className={styles.viewButton}
                      >
                        Guarda
                      </Link>
                      <button 
                        className={`${styles.addToCartButton} ${!product.isAvailable ? styles.disabledButton : ''}`}
                        disabled={!product.isAvailable}
                        onClick={() => handleAddToCart(product)}
                      >
                        {!product.isAvailable ? 'Prodotto esaurito' : 'Aggiungi al carrello'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {query.trim().length > 2 && results.length === 0 && (
            <div className={styles.noResults}>
              <p>Nessun prodotto trovato per "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        <button className={styles.searchButton} onClick={handleSearchOpen}>
          <SearchIcon size={18} />
          <span className={styles.searchText}>Cerca</span>
        </button>
      )}
    </div>
  );
};