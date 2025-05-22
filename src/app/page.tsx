"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/page.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePathname, useRouter } from "next/navigation";
import { useWalletAuth } from './components/AppWalletProvider';
import { 
  ShoppingBag, 
  Globe, 
  ChevronDown, 
  User, 
  Lock, 
  Truck, 
  CreditCard, 
  Shield,
  Menu,
  X,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

import { Search } from './components/Search';
import { Cart } from './components/Cart';
import { getNewProductsWithLimit, Product } from './service/productService';
import { createOrUpdateUser } from './service/userService';

const DynamicWalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const { phantomEmbedded, isEmbeddedConnected } = useWalletAuth();
  const [language, setLanguage] = useState('EN');
  const [clientPublicKey, setClientPublicKey] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      const products = await getNewProductsWithLimit();
      setFeaturedProducts(products);
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    const initEmbeddedWallet = async () => {
      if (phantomEmbedded) {
        try {
          // Try to connect and get the public key from the embedded wallet
          const connected = await phantomEmbedded.solana.connect();
          if (connected && connected.publicKey) {
            setClientPublicKey(connected.publicKey.toString());
          }
        } catch (err) {
        }
      }
    };
    setWalletConnected(true)
    initEmbeddedWallet();
  }, [phantomEmbedded]);

  useEffect(() => {
    if (publicKey) {
      setClientPublicKey(publicKey.toBase58());
      setWalletConnected(true);
      createOrUpdateUser(publicKey.toBase58());
    }
  }, [publicKey]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <main className={styles.main}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
        <img src="/icon.png" alt="Site Logo" className={styles.logo} />
          
          <div className={`${styles.navMenu} ${mobileMenuOpen ? styles.navMenuActive : ''}`}>
          <Link href="/" className={`${styles.navLink} ${styles.active}`}>Home</Link>
            <Link href="/new" className={styles.navLink}>New Arrivals</Link>
            <Link href="/men" className={styles.navLink}>Men</Link>
            <Link href="/women" className={styles.navLink}>Women</Link>
            <Link href="/contacts" className={styles.navLink}>Contact</Link>
          </div>
          
          <div className={styles.navActions}>
          <Search />
            
            {!isEmbeddedConnected ? (<DynamicWalletMultiButton></DynamicWalletMultiButton>) : ('')}
            <Cart />

            <Link href="/history" className={styles.orderHistoryButton}>
              <ClipboardList size={16} className={styles.iconOrderHistory} />
            </Link>
            
              <button 
              className={styles.languageButton} 
              onClick={language === 'IT'? () => {
                setLanguage('EN');
                router.push('/..');
              } : () => {
                setLanguage('IT')
                router.push('/it')
              } }
            >
              <Globe size={16} className={styles.iconGlobe} />
              <span>{language}</span>
              <ChevronDown size={14} className={styles.iconChevron} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Aconsy's E-Commerce</h1>
          <p className={styles.heroSubtitle}>
            Authentic and traceable clothing powered by blockchain technology
          </p>
          <div className={styles.heroButtons}>
            <Link href="/new" className={`${styles.button} ${styles.primaryButton}`}>
              Explore New Arrivals
            </Link>
            <Link href="/about" className={`${styles.button} ${styles.secondaryButton}`}>
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Shield size={32} className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>Guaranteed Authenticity</h3>
            <p className={styles.featureDescription}>
              Each product is authenticated via NFT on the Solana blockchain
            </p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <CreditCard size={32} className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>Crypto Payments</h3>
            <p className={styles.featureDescription}>
              Pay with USDT or USDC for fast and secure transactions
            </p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Truck size={32} className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>Complete Traceability</h3>
            <p className={styles.featureDescription}>
              Track the origin and history of each garment
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.products}>
        <h2 className={styles.sectionTitle}>New arrivals</h2>
        <div className={styles.productGrid}>
          {featuredProducts.map(product => (
            <div key={product.nft_address} className={styles.productCard}>
              <div className={styles.productImageContainer}>
              {product.image_url ? (
                <Link href={`/product/${product.nft_address}`}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={styles.productImage} 
                />
                </Link>
              ) : (
                <div className={styles.imagePlaceholder}></div>
              )}
              <div className={styles.productNftBadge}>NFT Verified</div>
            </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productDetails}>
                  <span className={styles.productPrice}>€{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.viewAllContainer}>
          <Link href="/new" className={`${styles.button} ${styles.outlineButton}`}>
            View All New Arrivals
            <ArrowRight size={16} className={styles.iconArrow} />
          </Link>
        </div>
      </section>

      {/* Blockchain Advantage */}
      <section className={styles.blockchainAdvantage}>
        <div className={styles.blockchainContainer}>
          <div className={styles.blockchainContent}>
            <h2 className={styles.blockchainTitle}>Blockchain Advantages</h2>
            <p className={styles.blockchainDescription}>
              Our integration with Solana provides authenticity, security, and transparency.
              Each product is linked to a unique NFT that certifies its originality.
            </p>
            <Link href="/blockchain" className={`${styles.button} ${styles.primaryButton}`}>
              Learn More
              <ArrowRight size={16} className={styles.iconArrow} />
            </Link>
          </div>
          <img src="bAdvantages.png" alt="Blockchain Advantage" className={styles.blockchainImage} />
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
            <div className={styles.footerSocial}>
              <a href="#" className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 6.5H17.51M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2ZM16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
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
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Customer Service</h4>
              <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
              <Link href="/shipping" className={styles.footerLink}>Shipping & Returns</Link>
              <Link href="/size-guide" className={styles.footerLink}>Size Guide</Link>
              <Link href="/support" className={styles.footerLink}>Support</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Aconsy. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerBottomLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.footerBottomLink}>Terms of Service</Link>
            <Link href="/cookies" className={styles.footerBottomLink}>Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
  
}