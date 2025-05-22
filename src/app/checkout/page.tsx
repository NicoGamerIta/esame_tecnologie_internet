"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCart } from '../components/CartContext';
import styles from '../../styles/checkout.module.css';
import { ArrowLeft, CreditCard, Lock, ChevronRight, MapPin } from 'lucide-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import {
  findAssociatedTokenPda,
  mplToolbox,
  transferTokens,
  transferSol,
  createAssociatedToken,
} from '@metaplex-foundation/mpl-toolbox'
import { publicKey as PK , sol} from '@metaplex-foundation/umi'
import { base58, set } from '@metaplex-foundation/umi/serializers'
import { Product } from '../service/productService';
import { createOrder, Order } from '../service/userService';

function randomId(length = 16) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * 36).toString(36)
  ).join('');
}

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export default function Checkout() {
  const wallet = useWallet()
  const [paymentToken, setPaymentToken] = useState('usdc'); // Default payment method
  let splToken;
  const { items, cartTotal, clearCart } = useCart();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    zipCode: '',
    country: ''
  });


  const transferSplTokens = async () => {
  const umi = createUmi("https://api.devnet.solana.com").use(mplToolbox())
  umi.use(walletAdapterIdentity(wallet))

  // The address of the Token you want to transfer.
  
  if (paymentToken === 'usdc') {
    splToken = PK("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); }
  else {
    splToken = PK("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"); }
  
  // The address of the wallet you want to transfer the Token to.
  const destinationWallet = PK("3iSdC28vy2pgEsDehthEv4Ps8Yp4ykHMZhZmkosuNVs9");


  if (paymentToken === 'usdc' || paymentToken === 'usdt') {
  try{
  // Find the associated token account for the SPL Token on the senders wallet.
  const sourceTokenAccount = await findAssociatedTokenPda(umi, {
    mint: splToken,
    owner: umi.identity.publicKey,
  });

  //await createAssociatedToken(umi, { mint: splToken, owner: destinationWallet, payer: umi.identity}).sendAndConfirm(umi)

  // Find the associated token account for the SPL Token on the receivers wallet.
  const destinationTokenAccount = await findAssociatedTokenPda(umi, {
    mint: splToken,
    owner: destinationWallet,
  });

 const decimals = 6;
let tokenAmount; 

if (cartTotal > 100) {
  tokenAmount = BigInt(Math.floor(cartTotal * 10 ** decimals));
} else {
  tokenAmount = BigInt(Math.floor((cartTotal + 10) * 10 ** decimals));
}

// Qui la variabile esiste!
const res = await transferTokens(umi, {
  source: sourceTokenAccount,
  destination: destinationTokenAccount,
  amount: tokenAmount,
}
).sendAndConfirm(umi);
console.log("risultato" + res.result);
// Finally we can deserialize the signature that we can check on chain.
  const signature = base58.deserialize(res.signature)[0];

  // Log out the signature and the links to the transaction and the NFT.
  console.log("\nTransfer Complete")
  console.log("View Transaction on SolanaFM");
  console.log(`https://solana.fm/tx/${signature}?cluster=devnet-alpha`);
  return true;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    return false;
  }
  }
  else if (paymentToken === 'sol') {
    try {
      const destination = PK(`1nc1nerator11111111111111111111111111111111`)

    const res = await transferSol(umi, {
      source: umi.identity,
      destination,
      amount: sol(cartTotal/180), // amount of SOL to transfer
    }).sendAndConfirm(umi)
    // Finally we can deserialize the signature that we can check on chain.
    const signature = base58.deserialize(res.signature)[0];

    // Log out the signature and the links to the transaction and the NFT.
    console.log("\nTransfer Complete")
    console.log("View Transaction on SolanaFM");
    console.log(`https://solana.fm/tx/${signature}?cluster=devnet-alpha`);
    return true;
        }
        catch (error) {
          console.error("Error transferring SOL:", error);
          return false;
        }
      }
  }


  
  // Redirect to home if cart is empty or wallet not connected
  useEffect(() => {
    if (!publicKey) {
      router.push('/');
    }
    
    if (items.length === 0 && !orderPlaced) {
      router.push('/');
    }
  }, [items, publicKey, router, orderPlaced]);

  // Handle payment method selection
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentToken(e.target.value);
  };

  // Handle shipping address input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isAddressComplete = () => {
    return (
      shippingAddress.fullName.trim() !== '' &&
      shippingAddress.street.trim() !== '' &&
      shippingAddress.city.trim() !== '' &&
      shippingAddress.zipCode.trim() !== '' &&
      shippingAddress.country.trim() !== ''
    );
  };

  const handleCheckout = async () => {
    if (!publicKey) {
      alert('Please connect your wallet to complete the purchase');
      return;
    }

    if (!paymentToken) {
      alert('Please select a payment method');
      return;
    }

    if (!isAddressComplete()) {
      alert('Please fill in all shipping address fields');
      return;
    }
    
    setLoading(true);

    const result = await transferSplTokens();
    if (result) {
      try {
      const newOrder: Order = {
        nft_address: items.map(item => item.nft_address),
        id_transaction: randomId(),
        status: 'completed',
        wallet_buyer: publicKey.toString(),
        creation_date: new Date().toISOString(),
        shipping_address: `${shippingAddress.fullName},${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode}, ${shippingAddress.country}`
      };
      
      const savedOrder = await createOrder(newOrder);
      
      if (!savedOrder) {
        console.error('Failed to save order to database');
      }
      // Simulate checkout process
    setTimeout(() => {
      setLoading(false);
      setOrderPlaced(true);
      clearCart();
    }, 2000);
    }catch (error) {
      console.error('Error saving order:', error);
    }
  }
    else{
      alert('Transaction failed. Please try again.');
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.orderSuccess}>
          <div className={styles.successIcon}>✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been confirmed and will be shipped soon.</p>
          <p>A confirmation NFT has been sent to your wallet.</p>
          <p>Wallet address: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}</p>
          <div className={styles.shippingConfirmation}>
            <p>Shipping to: {shippingAddress.fullName}</p>
            <p>{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.zipCode}, {shippingAddress.country}</p>
          </div>
          
          <Link href="/" className={styles.continueShopping}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutHeader}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Shopping
        </Link>
        <h1 className={styles.checkoutTitle}>Checkout</h1>
      </div>
      
      <div className={styles.checkoutContent}>
        <div className={styles.orderSummary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryItems}>
            {items.map(item => (
              <div key={item.nft_address} className={styles.summaryItem}>
                <div className={styles.itemImage}>
                  <div className={styles.imagePlaceholder}>
                    <img src={item.image_url} alt={item.name} className={styles.image} />
                  </div>
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>€{item.price} × {item.quantity}</p>
                </div>
                <span className={styles.itemTotal}>
                  €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className={styles.summaryTotals}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>€{cartTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              {(cartTotal >= 100) ? (
                <span>Free</span>
              ) : (
                <span>€10.00</span>
              )}
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>€{(cartTotal * 0.2).toFixed(2)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>€{(cartTotal >= 100) ? (
                <span>{cartTotal}</span>
              ) : (
                <span>{cartTotal+ 10.00}</span>
              )}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.paymentSection}>
          <h2 className={styles.paymentTitle}>Payment</h2>
          
          <div className={styles.walletInfo}>
            <h3 className={styles.walletTitle}>Connected Wallet</h3>
            <div className={styles.walletAddress}>
              <Lock size={16} />
              <span>{publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}</span>
            </div>
          </div>
          
          <div className={styles.shippingAddress}>
            <h3 className={styles.shippingTitle}>
              <MapPin size={16} />
              Shipping Address
            </h3>
            <div className={styles.addressForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="street">Street Address</label>
                <input 
                  type="text" 
                  id="street" 
                  name="street" 
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="New York"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="zipCode">ZIP / Postal Code</label>
                  <input 
                    type="text" 
                    id="zipCode" 
                    name="zipCode" 
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="country">Country</label>
                <input 
                  type="text" 
                  id="country" 
                  name="country" 
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>
            
          <div className={styles.paymentOptions}>
            <h3 className={styles.paymentMethodTitle}>Payment Method</h3>
            <div className={styles.paymentOption}>
              <input 
                type="radio" 
                id="usdc" 
                name="paymentMethod" 
                value="usdc" 
                checked={paymentToken === 'usdc'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="usdc" className={styles.paymentLabel}>
                <div className={styles.optionIcon}>
                  <img src="usdc.png" alt="USDC" className={styles.coinIcon} />
                </div>
                <div className={styles.optionDetails}>
                  <span className={styles.optionName}>USDC</span>
                  <span className={styles.optionInfo}>USD Coin on Solana</span>
                </div>
                <ChevronRight size={16} />
              </label>
            </div>
            
            <div className={styles.paymentOption}>
              <input 
                type="radio" 
                id="usdt" 
                name="paymentMethod" 
                value="usdt" 
                checked={paymentToken === 'usdt'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="usdt" className={styles.paymentLabel}>
                <div className={styles.optionIcon}>
                  <img src="usdt.svg" alt="USDT" className={styles.coinIcon} />
                </div>
                <div className={styles.optionDetails}>
                  <span className={styles.optionName}>USDT</span>
                  <span className={styles.optionInfo}>Tether on Solana</span>
                </div>
                <ChevronRight size={16} />
              </label>
            </div>
            
            <div className={styles.paymentOption}>
              <input 
                type="radio" 
                id="sol" 
                name="paymentMethod" 
                value="sol" 
                checked={paymentToken === 'sol'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="sol" className={styles.paymentLabel}>
                <div className={styles.optionIcon}>
                  <img src="solana.jpg" alt="SOL" className={styles.coinIcon} />
                </div>
                <div className={styles.optionDetails}>
                  <span className={styles.optionName}>SOL</span>
                  <span className={styles.optionInfo}>Native Solana</span>
                </div>
                <ChevronRight size={16} />
              </label>
            </div>
          </div>
          
          <button 
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                Complete Purchase <CreditCard size={16} />
              </>
            )}
          </button>
          
          <p className={styles.secureNote}>
            <Lock size={14} />
            All transactions are secure and encrypted. You will receive an NFT receipt in your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}