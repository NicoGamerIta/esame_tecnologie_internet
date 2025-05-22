"use client";

import { supabase } from '../utils/supabaseClient';

export interface Product {
  nft_address: string;
  name: string;
  description: string;
  image_url: string;
  price: string;
  size: string;
  color: string;
  gender: string;
  isNew: boolean;
  quantity: number;
  isAvailable: boolean;
  variants: {
    size: string;
  }[];
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductByAddress = async (nft_address: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('nft_address', nft_address)
      .single();
    
    if (error) {
      console.error(`Error fetching product with Nft address ${nft_address}:`, error);
      return undefined;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching product with Nft address ${nft_address}:`, error);
    return undefined;
  }
};

export const getNewProducts = async (): Promise<Product[]> => {
  try {
    // Fetch new products from Supabase
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('isNew', true)
    
    if (error) {
      console.error('Errore fetching new products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Errore fetching new products:', error);
    return [];
  }
};

export const getNewProductsWithLimit = async (): Promise<Product[]> => {
  try {
    // Fetch new products from Supabase
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('isNew', true)
      .limit(4);
    
    if (error) {
      console.error('Errore fetching new products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Errore fetching new products:', error);
    return [];
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      return [];
    }
    
    // Construct the search query using Supabase's or() method
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .or(searchTerms.map(term => `name.ilike.%${term}%,description.ilike.%${term}%`).join(','));
    
    if (error) {
      console.error('Error searching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getProductsBySize = async (size: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('size', size);
    
    if (error) {
      console.error(`Error fetching products with size ${size}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching products with size ${size}:`, error);
    return [];
  }
};

export const getProductsByColor = async (color: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('color', color);
    
    if (error) {
      console.error(`Error fetching products with color ${color}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Errore durante il recupero dei prodotti con colore ${color}:`, error);
    return [];
  }
};

export const getProductsByGender = async (gender: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('gender', gender);
    
    if (error) {
      console.error(`Error fetching products with size ${gender}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching products with size ${gender}:`, error);
    return [];
  }
};