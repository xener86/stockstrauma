// src/pages/Products/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product, Category, InventoryItem, Location, Supplier, ProductSupplier } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';
import { EditProductModal } from './components/EditProductModal';
import { InventoryTable } from './components/InventoryTable';
import { ProductSuppliersTable } from './components/ProductSuppliersTable';
import { AddSupplierModal } from './components/AddSupplierModal';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        
        // Charger le produit
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        
        if (!productData) {
          throw new Error('Produit non trouvé');
        }
        
        // Formater les données du produit
        const formattedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          sku: productData.sku || '',
          barcode: productData.barcode || '',
          unitOfMeasure: productData.unit_of_measure,
          minStockLevel: productData.min_stock_level,
          warningStockLevel: productData.warning_stock_level,
          hasExpiry: productData.has_expiry,
          category: productData.categories ? {
            id: productData.categories.id,
            name: productData.categories.name
          } : null
        };
        
        setProduct(formattedProduct);
        
        // Charger l'inventaire pour ce produit
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select(`
            *,
            locations (
              id,
              name
            ),
            product_variants (
              id,
              variant_name
            )
          `)
          .eq('product_id', id);
        
        if (inventoryError) throw inventoryError;
        
        // Formater les données d'inventaire
        const formattedInventory: InventoryItem[] = inventoryData.map(item => ({
          locationId: item.location_id,
          productId: item.product_id,
          variantId: item.variant_id || undefined,
          quantity: item.quantity,
          reservedQuantity: item.reserved_quantity,
          lastCountedAt: item.last_counted_at ? new Date(item.last_counted_at) : undefined,
          location: {
            id: item.locations.id,
            name: item.locations.name,
            isActive: true // Assumé actif car présent dans l'inventaire
          },
          variant: item.product_variants ? {
            id: item.product_variants.id,
            name: item.product_variants.variant_name
          } : undefined
        }));
        
        setInventory(formattedInventory);
        
        // Charger toutes les catégories pour le formulaire d'édition
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
        
        // Charger tous les lieux actifs
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (locationsError) throw locationsError;
        
        setLocations(locationsData.map(location => ({
          id: location.id,
          name: location.name,
          description: location.description,
          address: location.address,
          isActive: location.is_active
        })));
        
        // Charger les fournisseurs pour ce produit
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('product_suppliers')
          .select(`
            id,
            supplier_id,
            variant_id,
            supplier_reference,
            unit_price,
            is_preferred,
            lead_time_days,
            suppliers (
              id,
              name,
              contact_name,
              email,
              phone,
              is_active
            ),
            product_variants (
              id,
              variant_name
            )
          `)
          .eq('product_id', id);
        
        if (suppliersError) throw suppliersError;
        
        // Formater les données des fournisseurs
        const formattedProductSuppliers: ProductSupplier[] = suppliersData.map(item => ({
          id: item.id,
          productId: id,
          variantId: item.variant_id || undefined,
          supplierId: item.supplier_id,
          supplierReference: item.supplier_reference || undefined,
          unitPrice: item.unit_price || undefined,
          isPreferred: item.is_preferred,
          leadTimeDays: item.lead_time_days || undefined,
          // Ajouter supplierDetails au lieu de supplier
          supplierDetails: {
            id: item.suppliers.id,
            name: item.suppliers.name,
            contactName: item.suppliers.contact_name,
            email: item.suppliers.email,
            phone: item.suppliers.phone,
            isActive: item.suppliers.is_active
          },
          variant: item.product_variants ? {
            id: item.product_variants.id,
            name: item.product_variants.variant_name
          } : undefined
        }));
        
        setProductSuppliers(formattedProductSuppliers);
        
        // Charger tous les fournisseurs actifs pour le modal d'ajout de fournisseur
        const { data: allSuppliersData, error: allSuppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (allSuppliersError) throw allSuppliersError;
        
        setSuppliers(allSuppliersData.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contact_name || undefined,
          email: supplier.email || undefined,
          phone: supplier.phone || undefined,
          address: supplier.address || undefined,
          isActive: supplier.is_active
        })));
        
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

  // Mettre à jour les informations du produit
  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!id) return;
    
    try {
      const productToUpdate = {
        name: updatedProduct.name,
        description: updatedProduct.description || null,
        sku: updatedProduct.sku || null,
        barcode: updatedProduct.barcode || null,
        unit_of_measure: updatedProduct.unitOfMeasure,
        min_stock_level: updatedProduct.minStockLevel,
        warning_stock_level: updatedProduct.warningStockLevel,
        has_expiry: updatedProduct.hasExpiry,
        category_id: updatedProduct.category?.id || null
      };
      
      const { error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setProduct(updatedProduct);
      setIsEditModalOpen(false);
      
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Ajouter un fournisseur pour ce produit
  const handleAddSupplier = async (newProductSupplier: Omit<ProductSupplier, 'id'>) => {
    if (!id) return;
    
    try {
      const supplierToAdd = {
        product_id: id,
        supplier_id: newProductSupplier.supplierId,
        variant_id: newProductSupplier.variantId || null,
        supplier_reference: newProductSupplier.supplierReference || null,
        unit_price: newProductSupplier.unitPrice || null,
        is_preferred: newProductSupplier.isPreferred,
        lead_time_days: newProductSupplier.leadTimeDays || null
      };
      
      const { data, error } = await supabase
        .from('product_suppliers')
        .insert(supplierToAdd)
        .select(`
          id,
          supplier_id,
          variant_id,
          supplier_reference,
          unit_price,
          is_preferred,
          lead_time_days,
          suppliers (
            id,
            name,
            contact_name,
            email,
            phone,
            is_active
          ),
          product_variants (
            id,
            variant_name
          )
        `)
        .single();
      
      if (error) throw error;
      
      // Formater et ajouter le nouveau fournisseur à l'état local
      const formattedProductSupplier: ProductSupplier = {
        id: data.id,
        productId: id,
        variantId: data.variant_id || undefined,
        supplierId: data.supplier_id,
        supplierReference: data.supplier_reference || undefined,
        unitPrice: data.unit_price || undefined,
        isPreferred: data.is_preferred,
        leadTimeDays: data.lead_time_days || undefined,
        supplierDetails: {
          id: data.suppliers.id,
          name: data.suppliers.name,
          contactName: data.suppliers.contact_name,
          email: data.suppliers.email,
          phone: data.suppliers.phone,
          isActive: data.suppliers.is_active
        },
        variant: data.product_variants ? {
          id: data.product_variants.id,
          name: data.product_variants.variant_name
        } : undefined
      };
      
      setProductSuppliers(prev => [...prev, formattedProductSupplier]);
      setIsAddSupplierModalOpen(false);
      
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Supprimer un fournisseur pour ce produit
  const handleRemoveSupplier = async (supplierLinkId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur pour ce produit ?')) {
      try {
        const { error } = await supabase
          .from('product_suppliers')
          .delete()
          .eq('id', supplierLinkId);
        
        if (error) throw error;
        
        // Mettre à jour l'état local
        setProductSuppliers(prev => 
          prev.filter(ps => ps.id !== supplierLinkId)
        );
        
      } catch (err) {
        console.error('Error removing supplier:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  // Vérifier si le produit a des niveaux de stock critiques
  const hasCriticalStock = inventory.some(item => 
    item.quantity <= (product?.minStockLevel || 0)
  );

  // Vérifier si le produit a des niveaux de stock en alerte
  const hasWarningStock = inventory.some(item => 
    item.quantity <= (product?.warningStockLevel || 0) && 
    item.quantity > (product?.minStockLevel || 0)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AlertBanner 
          title="Erreur" 
          message={`Impossible de charger les détails du produit: ${error.message}`}
          severity="critical"
          onAction={() => navigate('/products')}
          actionLabel="Retour aux produits"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AlertBanner 
          title="Produit non trouvé" 
          message="Le produit demandé n'existe pas ou a été supprimé."
          severity="warning"
          onAction={() => navigate('/products')}
          actionLabel="Retour aux produits"
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/products')}
              className="mr-2 text-gray-500 hover:text-primary-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {product.name}
            </h1>
          </div>
          {product.sku && (
            <p className="mt-1 text-sm text-gray-500">
              SKU: {product.sku}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            Modifier
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/inventory?product=${product.id}`)}
          >
            Gérer le stock
          </Button>
        </div>
      </div>

      {(hasCriticalStock || hasWarningStock) && (
        <AlertBanner 
          title={hasCriticalStock ? "Stock critique" : "Stock bas"} 
          message={hasCriticalStock 
            ? "Ce produit est en dessous du seuil critique dans un ou plusieurs lieux de stockage." 
            : "Ce produit est en dessous du seuil d'alerte dans un ou plusieurs lieux de stockage."
          }
          severity={hasCriticalStock ? "critical" : "warning"}
          onAction={() => navigate('/orders/new', { state: { productId: product.id } })}
          actionLabel="Commander"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Informations générales" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{product.description || 'Aucune description'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Catégorie</h4>
              <p className="mt-1 text-sm text-gray-900">{product.category?.name || 'Non catégorisé'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Code barre</h4>
              <p className="mt-1 text-sm text-gray-900">{product.barcode || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Unité de mesure</h4>
              <p className="mt-1 text-sm text-gray-900">{product.unitOfMeasure}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">DLUO</h4>
              <p className="mt-1 text-sm text-gray-900">{product.hasExpiry ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </Card>

        <Card title="Niveaux de stock">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Seuil d'alerte</h4>
              <p className="mt-1 text-lg font-medium text-warning-600">{product.warningStockLevel} {product.unitOfMeasure}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Seuil critique</h4>
              <p className="mt-1 text-lg font-medium text-danger-600">{product.minStockLevel} {product.unitOfMeasure}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Stock total</h4>
              <p className="mt-1 text-lg font-medium text-primary-600">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)} {product.unitOfMeasure}
              </p>
              <p className="text-xs text-gray-500">
                {inventory.reduce((sum, item) => sum + item.reservedQuantity, 0)} {product.unitOfMeasure} réservés
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Stock par lieu</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory/add', { state: { productId: product.id } })}
          >
            Ajouter un mouvement
          </Button>
        </div>
        <InventoryTable 
          inventory={inventory}
          productUnit={product.unitOfMeasure}
          minStockLevel={product.minStockLevel}
          warningStockLevel={product.warningStockLevel}
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Fournisseurs</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsAddSupplierModalOpen(true)}
          >
            Ajouter un fournisseur
          </Button>
        </div>
        
        <ProductSuppliersTable 
          productSuppliers={productSuppliers}
          onRemoveSupplier={handleRemoveSupplier}
        />
      </div>

      {isEditModalOpen && product && (
        <EditProductModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateProduct={handleUpdateProduct}
          product={product}
          categories={categories}
        />
      )}

      {isAddSupplierModalOpen && (
        <AddSupplierModal 
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onAddSupplier={handleAddSupplier}
          suppliers={suppliers}
          productId={product.id}
        />
      )}
    </div>
  );
};

export default ProductDetail;