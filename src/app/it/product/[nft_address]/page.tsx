"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../components/CartContext';
import { getProductByAddress, Product } from '../../../service/productService';
import styles from '../../../../styles/product.module.css';
import { 
  Shield, 
  ArrowLeft, 
  Tag, 
  Truck, 
  Check, 
  Plus, 
  Minus,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

export default function ProductPage() {
  const { nft_address } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    shipping: false,
    blockchain: false
  });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (typeof nft_address === 'string') {
          const productData = await getProductByAddress(nft_address);
          if (productData) {
            setProduct(productData);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [nft_address]);

  const handleAddToCart = () => {
    if (product) {
      // Add product to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      // Reset quantity
      setQuantity(1);
      
      // Show success message or notification
      alert('Prodotto aggiunto al carrello!');
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Prodotto non trovato</h2>
        <p>Il prodotto di cui stavi cercando non esiste oppure è stato rimosso.</p>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} className={styles.iconArrow} />
          Torna alla home
        </Link>
      </div>
    );
  }

  const solanaExplorerUrl = `https://explorer.solana.com/address/${nft_address}`;

  return (
    <div className={styles.productPage}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Home</Link> / 
        <Link href={product.isNew ? "/new" : `/${product.gender ==='Unisex' ? 'Unisex' : product.gender === "Men" ? 'Men' : 'Women'}`}>
          {product.isNew ? "New Arrivals" : (product.gender === 'Unisex' ? "Unisex" : product.gender === "Men" ? 'Men' : "Women")}
        </Link> / 
        <span>{product.name}</span>
      </div>

      <div className={styles.productContainer}>
        {/* Product Image */}
        <div className={styles.productImageSection}>
          <div className={styles.productBadges}>
            {product.isNew && <span className={styles.newBadge}>Novità</span>}
            <span className={styles.nftBadge}>Verificato NFT</span>
          </div>
          <div className={styles.mainImageContainer}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={styles.mainImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}></div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className={styles.productDetails}>
          <h1 className={styles.productName}>{product.name}</h1>
          <div className={styles.productPrice}>€{product.price}</div>

          
          <div className={styles.colorSize}>
            <div className={styles.colorOption}>
              <span className={styles.optionLabel}>Colore:</span>
              <span className={styles.colorValue}>{product.color}</span>
              <div 
                className={styles.colorSwatch} 
                style={{ backgroundColor: product.color.toLowerCase() }}
              ></div>
            </div>

            <div className={styles.genderOption}>
              <span className={styles.optionLabel}>Genere:</span>
              <span className={styles.genderValue}>{product.gender}</span>
            </div>
            
            
            <div className={styles.sizeOption}>
              <span className={styles.optionLabel}>Taglia:</span>
              <span className={styles.sizeValue}>{product.size}</span>
            </div>
          </div>

          <div className={styles.authenticitySection}>
            <div className={styles.authenticityIcon}>
              <Shield size={24} className={styles.iconShield} />
            </div>
            <div className={styles.authenticityText}>
              <p>Autenticità verificata NFT</p>
              <a 
                href={solanaExplorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.viewOnChainLink}
              >
                Visualizza sull'explorer Solana
                <ExternalLink size={14} className={styles.iconExternal} />
              </a>
            </div>
          </div>

          <div className={styles.quantityAddToCart}>
            <div className={styles.quantitySelector}>
              <button 
                className={styles.quantityButton} 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button 
                className={styles.quantityButton} 
                onClick={incrementQuantity}
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              Aggiungi al carrello
            </button>
          </div>

          {/* Collapsible Product Information Sections */}
          <div className={styles.productInfoSections}>
            <div className={styles.infoSection}>
              <button 
                className={styles.sectionToggle} 
                onClick={() => toggleSection('details')}
              >
                <span>Product Details</span>
                {expandedSections.details ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {expandedSections.details && (
                <div className={styles.sectionContent}>
                  <p className={styles.productDescription}>{product.description}</p>
                  <ul className={styles.productFeatures}>
                    <li><Check size={16} className={styles.checkIcon} /> Materiali di qualità Premium</li>
                    <li><Check size={16} className={styles.checkIcon} /> Manufatturato eticamente</li>
                    <li><Check size={16} className={styles.checkIcon} /> Produzione sostenibile</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.infoSection}>
              <button 
                className={styles.sectionToggle} 
                onClick={() => toggleSection('shipping')}
              >
                <span>Spedizioni e rimborsi</span>
                {expandedSections.shipping ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {expandedSections.shipping && (
                <div className={styles.sectionContent}>
                  <div className={styles.shippingItem}>
                    <Truck size={16} className={styles.shippingIcon} />
                    <div>
                      <h4>Spedizione gratuita sopra i 100 euro</h4>
                      <p>2-5 giorni lavorativi</p>
                    </div>
                  </div>
                  <div className={styles.shippingItem}>
                    <Tag size={16} className={styles.returnIcon} />
                    <div>
                      <h4>Rimborso gratuito</h4>
                      <p>Entro 30 giorni dall'arrivo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.infoSection}>
              <button 
                className={styles.sectionToggle} 
                onClick={() => toggleSection('blockchain')}
              >
                <span>Autenticazione Blockchain</span>
                {expandedSections.blockchain ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {expandedSections.blockchain && (
                <div className={styles.sectionContent}>
                  <p>
                  Questo prodotto è autenticato sulla blockchain di Solana come NFT univoco.
                  L'NFT funge da certificato digitale di autenticità e proprietà,
                  consentendo di verificarne l'origine e la provenienza.
                  </p>
                  
                  <div className={styles.nftDetails}>
                    <div className={styles.nftDetail}>
                      <span className={styles.nftDetailLabel}>Indirizzo NFT:</span>
                      <span className={styles.nftDetailValue}>
                        {nft_address?.toString().slice(0, 8)}...{nft_address?.toString().slice(-8)}
                      </span>
                    </div>
                    <a 
                      href={solanaExplorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.blockchainLink}
                    >
                      Visualizza i dettagli NFT su Solana
                      <ExternalLink size={14} className={styles.iconExternal} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}