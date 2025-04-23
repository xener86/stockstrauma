// src/pages/Products/Products.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { ProductsTable } from './components/ProductsTable';
import { ProductFilters } from './components/ProductFilters';
import { AddProductModal } from './components/AddProductModal';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Charger les produits et les catégories au chargement de la page
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setIsLoading(true);
        
        // Charger toutes les catégories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        setCategories(categoriesData.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description
        })));
        
        // Charger tous les produits avec leurs catégories
        await fetchProducts();
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductsAndCategories();
  }, []);

  // Fonction pour charger les produits avec filtres optionnels
  const fetchProducts = async (categoryId?: string) => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name');
      
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformer les données pour correspondre au type Product
      const formattedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        unitOfMeasure: item.unit_of_measure,
        minStockLevel: item.min_stock_level,
        warningStockLevel: item.warning_stock_level,
        hasExpiry: item.has_expiry,
        category: item.categories ? {
          id: item.categories.id,
          name: item.categories.name
        } : null
      }));
      
      setProducts(formattedProducts);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Gestionnaires d'événements pour les filtres
  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    await fetchProducts(categoryId);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  // Filtrer les produits en fonction de la recherche
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.name.toLowerCase().includes(searchLower))
    );
  });

  // Gérer l'ajout d'un nouveau produit
  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      // Convertir les données du produit au format de la base de données
      const productToInsert = {
        name: newProduct.name,
        description: newProduct.description || null,
        sku: newProduct.sku || null,
        barcode: newProduct.barcode || null,
        unit_of_measure: newProduct.unitOfMeasure,
        min_stock_level: newProduct.minStockLevel,
        warning_stock_level: newProduct.warningStockLevel,
        has_expiry: newProduct.hasExpiry,
        category_id: newProduct.category?.id || null
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ajouter le nouveau produit à la liste
      const category = newProduct.category 
        ? { id: newProduct.category.id, name: newProduct.category.name }
        : null;
      
      const formattedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        sku: data.sku || '',
        barcode: data.barcode || '',
        unitOfMeasure: data.unit_of_measure,
        minStockLevel: data.min_stock_level,
        warningStockLevel: data.warning_stock_level,
        hasExpiry: data.has_expiry,
        category
      };
      
      setProducts(prevProducts => [...prevProducts, formattedProduct]);
      setIsAddModalOpen(false);
      
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        
        // Retirer le produit supprimé de la liste
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
        
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  // Naviguer vers la page de détail d'un produit
  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Erreur lors du chargement des produits: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            }
          >
            Ajouter un produit
          </Button>
        </div>
      </div>

      <ProductFilters 
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
      />

      <div className="mt-6">
        <ProductsTable 
          products={filteredProducts}
          onViewProduct={handleViewProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>

      {isAddModalOpen && (
        <AddProductModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAddProduct}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Products;