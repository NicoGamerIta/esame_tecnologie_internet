import { supabase } from "../utils/supabaseClient";
import {Product} from "./productService";

interface User {
  wallet_address: string;
  purchase_history?: string[];
}

export interface Order {
  nft_address: string[];
  id_transaction?: string;
  status: 'pending' | 'completed' | 'failed' | 'shipped';
  wallet_buyer: string;
  creation_date: string;
  shipping_address: string
}


 //Create or update a user in the database when wallet connects
export async function createOrUpdateUser(walletAddress: string): Promise<User | null> {
  if (!walletAddress) return null;
  
  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('user')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError);
    return null;
  }
  
  // If user doesn't exist, create a new one
  if (!existingUser) {
    const { data: newUser, error: insertError } = await supabase
      .from('user')
      .insert([
        { wallet_address: walletAddress }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return null;
    }
    
    return newUser;
  }
  
  return existingUser;
}


 //Create a new order in the database

export async function createOrder(order: Order): Promise<Order | null> {
  // Insert order into the database
  const { data: newOrder, error: orderError } = await supabase
    .from('order')
    .insert([order])
    .select()
    .single();
  
  if (orderError) {
    console.error('Error creating order:', orderError);
    return null;
  }

  const { data: productData, error: productError } = await supabase
    .from('product')
    .select('*')
    .eq('nft_address', order.nft_address);

  if (productData && productData.length > 0) {
  for (const product of productData) {
    const { error: updateError } = await supabase
      .from('product')
      .update({ isAvailable: false })
      .eq('nft_address', order.nft_address);

    if (updateError) {
      console.error(`Errore nell'aggiornamento del prodotto ${product.id}:`, updateError);
    }
  }
}

  
  const { error } = await supabase
    .from('product')
    .update({ isAvailable: false })
    .in('nft_address', order.nft_address);
  
  return newOrder;
}

 //Get all orders for a specific wallet address

export async function getUserOrders(walletAddress: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('order')
    .select('*')
    .eq('wallet_buyer', walletAddress);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data || [];
}