"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/history.module.css';
import { getUserOrders } from '../service/userService';
import { getProductByAddress } from '../service/productService';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  XCircle,
  Truck,
  ChevronLeft,
  Home,
  Box
} from 'lucide-react';

// Create a type for the order with product details
interface OrderWithProducts {
  id?: string;
  nft_address: string[];
  id_transaction?: string;
  status: 'pending' | 'completed' | 'failed' | 'shipped';
  wallet_buyer: string;
  creation_date: string;
  shipping_address: string;
  products: {
    nft_address: string;
    name: string;
    image_url: string;
    price: string;
  }[];
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not connected
    if (!wallet.connected && !wallet.connecting) {
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      if (wallet.publicKey) {
        setLoading(true);
        try {
          const walletAddress = wallet.publicKey.toBase58();
          const userOrders = await getUserOrders(walletAddress);
          
          // Fetch product details for each order
          const ordersWithProducts = await Promise.all(
            userOrders.map(async (order) => {
              const products = await Promise.all(
                order.nft_address.map(async (nftAddress) => {
                  const product = await getProductByAddress(nftAddress);
                  return product ? {
                    nft_address: nftAddress,
                    name: product.name,
                    image_url: product.image_url,
                    price: product.price
                  } : {
                    nft_address: nftAddress,
                    name: 'Product not found',
                    image_url: '',
                    price: '0'
                  };
                })
              );
              
              return {
                ...order,
                products
              };
            })
          );
          
          setOrders(ordersWithProducts);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [wallet.publicKey, wallet.connected, wallet.connecting, router]);

  // Format address from string
  const formatAddress = (addressString: string) => {
    try {
      const parts = addressString.split(',');
      return {
        name: parts[0]?.trim() || '',
        street: parts[1]?.trim() || '',
        city: parts[2]?.trim() || '',
        zipCode: parts[3]?.trim() || '',
        country: parts[4]?.trim() || ''
      };
    } catch (e) {
      return {
        name: '',
        street: '',
        city: '',
        zipCode: '',
        country: addressString || ''
      };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className={styles.statusIconCompleted} size={20} />;
      case 'pending':
        return <Clock className={styles.statusIconPending} size={20} />;
      case 'shipped':
        return <Truck className={styles.statusIconShipped} size={20} />;
      case 'failed':
        return <XCircle className={styles.statusIconFailed} size={20} />;
      default:
        return <Clock className={styles.statusIconPending} size={20} />;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Calculate order total
  const calculateOrderTotal = (products: OrderWithProducts['products']) => {
    return products.reduce((total, product) => {
      return total + parseFloat(product.price || '0');
    }, 0).toFixed(2);
  };

  return (
    <div className={styles.ordersPage}>
      <div className={styles.ordersHeader}>
        <div className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>
            <Home size={16} />
            <span>Home</span>
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>My Orders</span>
        </div>
        <h1 className={styles.pageTitle}>
          <ShoppingBag className={styles.pageTitleIcon} size={24} />
          My Orders
        </h1>
        <p className={styles.pageDescription}>
          View and track all your order history
        </p>
      </div>

      <div className={styles.ordersContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loading}></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyOrders}>
            <Box size={48} className={styles.emptyIcon} />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link href="/new" className={`${styles.button} ${styles.primaryButton}`}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order, index) => {
              const address = formatAddress(order.shipping_address);
              return (
                <div key={index} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderDate}>
                        <span className={styles.orderLabel}>Order Date:</span>
                        <span className={styles.orderValue}>{formatDate(order.creation_date)}</span>
                      </div>
                      {order.id_transaction && (
                        <div className={styles.transactionId}>
                          <span className={styles.orderLabel}>Transaction:</span>
                          <span className={styles.orderValue}>
                            {order.id_transaction.substring(0, 8)}...{order.id_transaction.substring(order.id_transaction.length - 8)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles.orderStatus}>
                      {getStatusIcon(order.status)}
                      <span className={styles.statusText}>{getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.orderProducts}>
                    {order.products.map((product, productIndex) => (
                      <div key={productIndex} className={styles.productItem}>
                        <div className={styles.productImage}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            <div className={styles.noImage}></div>
                          )}
                        </div>
                        <div className={styles.productDetails}>
                          <Link href={`/product/${product.nft_address}`} className={styles.productName}>
                            {product.name}
                          </Link>
                          <div className={styles.productNft}>
                            <span className={styles.nftBadge}>NFT</span>
                            <span className={styles.nftAddress}>
                              {product.nft_address.substring(0, 6)}...{product.nft_address.substring(product.nft_address.length - 6)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.productPrice}>
                          €{product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.orderFooter}>
                    <div className={styles.shippingAddress}>
                      <h4>Shipping Address</h4>
                      <p className={styles.addressName}>{address.name}</p>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                    <div className={styles.orderSummary}>
                      <div className={styles.orderTotal}>
                        <span>Total:</span>
                        <span className={styles.totalAmount}>€{calculateOrderTotal(order.products)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.ordersActions}>
        <Link href="/" className={`${styles.button} ${styles.outlineButton}`}>
          <ChevronLeft size={16} />
          Back to Shopping
        </Link>
      </div>
    </div>
  );
}