// src/hooks/useProducts.ts - version corrigée
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [expiredProductsCount, setExpiredProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer tous les produits
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `);
        
        if (productsError) throw productsError;
        
        // Récupérer les lots expirés
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        const { data: expiredBatchesData, error: batchesError } = await supabase
          .from('batches')
          .select(`
            id,
            product_id,
            batch_number,
            expiry_date,
            batch_inventory (
              quantity
            )
          `)
          .lt('expiry_date', today)
          .gt('batch_inventory.quantity', 0);
        
        if (batchesError) throw batchesError;
        
        // Compter le nombre de produits avec des lots expirés
        const expiredProductIds = new Set(
          expiredBatchesData
            .filter(batch => 
              batch.batch_inventory && 
              batch.batch_inventory.some(inv => inv.quantity > 0)
            )
            .map(batch => batch.product_id)
        );
        
        setExpiredProductsCount(expiredProductIds.size);
        
        // Transformer les données des produits
        const formattedProducts: Product[] = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,   // Accepte null maintenant
          sku: product.sku,                   // Accepte null maintenant
          barcode: product.barcode,           // Accepte null maintenant
          unitOfMeasure: product.unit_of_measure,
          minStockLevel: product.min_stock_level,
          warningStockLevel: product.warning_stock_level,
          hasExpiry: product.has_expiry,
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : null
        }));
        
        setProducts(formattedProducts);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return { products, expiredProductsCount, isLoading, error };
};