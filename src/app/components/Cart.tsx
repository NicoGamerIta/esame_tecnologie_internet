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
          <h3 className={styles.cartTitle}>Your Cart ({itemCount} items)</h3>
          <button className={styles.closeButton} onClick={toggleCart}>
            <X size={20} />
          </button>
        </div>
        
        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
            <button className={styles.continueShoppingButton} onClick={toggleCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {items.map(item => (
                <div key={item.nft_address} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <div className={styles.imagePlaceholder}>
                    <Link href={`/product/${item.nft_address}`}>
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
                  <span>Subtotal</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {publicKey ? (
                <Link href="/checkout" className={styles.checkoutButton}>
                  Proceed to Checkout
                </Link>
              ) : (
                <div className={styles.walletWarning}>
                  <p>Please connect your wallet to proceed to checkout</p>
                  <button disabled className={styles.disabledCheckoutButton}>
                    Connect Wallet to Checkout
                  </button>
                </div>
              )}
              
              <button className={styles.clearCartButton} onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};