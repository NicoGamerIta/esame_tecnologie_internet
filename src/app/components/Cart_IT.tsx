// app/components/Cart/Cart.tsx
"use client";

import React from 'react';
import { useCart } from './CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import styles from '../../styles/cart.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal, isCartOpen, toggleCart, itemCount } = useCart();
  const { publicKey } = useWallet();

  if (!isCartOpen) {
    return (
      <button className={styles.cartButton} onClick={toggleCart}>
        <ShoppingBag size={20} />
        {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
      </button>
    );
  }

  return (
    <div className={styles.cartOverlay}>
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <h3 className={styles.cartTitle}>Il tuo Carrello ({itemCount} articoli)</h3>
          <button className={styles.closeButton} onClick={toggleCart}>
            <X size={20} />
          </button>
        </div>
        
        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <ShoppingBag size={48} />
            <p>Il tuo carrello è vuoto</p>
            <button className={styles.continueShoppingButton} onClick={toggleCart}>
              Continua a comprare
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {items.map(item => (
                <div key={item.nft_address} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <div className={styles.imagePlaceholder}>
                    <Link href={`/it/product/${item.nft_address}`}>
                    <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                    </Link>
                    </div>
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <p className={styles.itemPrice}>€{item.price}</p>
                    <div className={styles.quantityControls}>
                      <button 
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.nft_address, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button 
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.nft_address, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.nft_address)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className={styles.cartFooter}>
              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span>Subtotale</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Spedizione</span>
                  <span>Calcolato al checkout</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Totale</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {publicKey ? (
                <Link href="/it/checkout" className={styles.checkoutButton}>
                  Prcoedi al Pagamento
                </Link>
              ) : (
                <div className={styles.walletWarning}>
                  <p>Collega il tuo portafoglio per procedere al pagamento</p>
                  <button disabled className={styles.disabledCheckoutButton}>
                    Connetti Wallet per il Pagamento
                  </button>
                </div>
              )}
              
              <button className={styles.clearCartButton} onClick={clearCart}>
                Pulisci Carrello
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};