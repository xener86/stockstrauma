// src/pages/Orders/components/AddOrderItemModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product, Location, OrderItem } from '../../../types';

interface AddOrderItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<OrderItem, 'id' | 'order'>) => void;
  products: Product[];
  locations: Location[];
  selectedSupplierId: string;
  initialProductId: string | null;
}

export const AddOrderItemModal: React.FC<AddOrderItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  products,
  locations,
  selectedSupplierId,
  initialProductId
}) => {
  const [formData, setFormData] = useState<{
    productId: string;
    destinationLocationId: string;
    quantity: number;
    unitPrice: number | undefined;
    notes: string;
  }>({
    productId: initialProductId || '',
    destinationLocationId: '',
    quantity: 1,
    unitPrice: undefined,
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  // Charger les informations du fournisseur pour le produit sélectionné
  useEffect(() => {
    if (formData.productId && selectedSupplierId) {
      fetchProductSupplierInfo(formData.productId, selectedSupplierId);
    }
  }, [formData.productId, selectedSupplierId]);

  const fetchProductSupplierInfo = async (productId: string, supplierId: string) => {
    try {
      setIsLoadingSuppliers(true);
      
      const { data, error } = await supabase
        .from('product_suppliers')
        .select('*')
        .eq('product_id', productId)
        .eq('supplier_id', supplierId)
        .maybeSingle(); // Utiliser maybeSingle car il peut ne pas y avoir de relation
      
      if (error) throw error;
      
      if (data) {
        // Pré-remplir le prix unitaire si disponible
        setFormData(prev => ({
          ...prev,
          unitPrice: data.unit_price || undefined
        }));
      }
      
    } catch (err) {
      console.error('Error fetching product supplier info:', err);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: undefined
      }));
      return;
    }
    
    const numValue = name === 'unitPrice' 
      ? parseFloat(value)
      : parseInt(value, 10);
      
    if (!isNaN(numValue) && numValue > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.productId) {
      errors.productId = 'Veuillez sélectionner un produit';
    }
    
    if (!formData.destinationLocationId) {
      errors.destinationLocationId = 'Veuillez sélectionner un lieu de destination';
    }
    
    if (formData.quantity <= 0) {
      errors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddItem({
        orderId: '', // Sera défini lors de la création de la commande
        productId: formData.productId,
        destinationLocationId: formData.destinationLocationId,
        quantity: formData.quantity,
        receivedQuantity: 0,
        unitPrice: formData.unitPrice,
        notes: formData.notes
      });
    }
  };

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Ajouter un article à la commande
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                          Produit *
                        </label>
                        <select
                          id="productId"
                          name="productId"
                          value={formData.productId}
                          onChange={handleChange}
                          className={`form-select ${formErrors.productId ? 'border-red-500' : ''}`}
                          required
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}{product.sku ? ` (${product.sku})` : ''}
                            </option>
                          ))}
                        </select>
                        {formErrors.productId && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.productId}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="destinationLocationId" className="block text-sm font-medium text-gray-700 mb-1">
                          Lieu de destination *
                        </label>
                        <select
                          id="destinationLocationId"
                          name="destinationLocationId"
                          value={formData.destinationLocationId}
                          onChange={handleChange}
                          className={`form-select ${formErrors.destinationLocationId ? 'border-red-500' : ''}`}
                          required
                        >
                          <option value="">Sélectionner un lieu de destination</option>
                          {locations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                        {formErrors.destinationLocationId && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.destinationLocationId}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité *
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleNumberChange}
                            min="1"
                            className={`form-input flex-1 ${formErrors.quantity ? 'border-red-500' : ''}`}
                            required
                          />
                          <span className="ml-2 text-gray-500">
                            {selectedProduct?.unitOfMeasure || 'unité(s)'}
                          </span>
                        </div>
                        {formErrors.quantity && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Prix unitaire (€)
                        </label>
                        <input
                          type="number"
                          id="unitPrice"
                          name="unitPrice"
                          value={formData.unitPrice === undefined ? '' : formData.unitPrice}
                          onChange={handleNumberChange}
                          className="form-input"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                        {isLoadingSuppliers && (
                          <p className="mt-1 text-xs text-gray-500">Chargement des informations fournisseur...</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="form-input"
                          placeholder="Informations supplémentaires pour cet article..."
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
              onClick={handleSubmit}
            >
              Ajouter
            </button>
            <button
              type="button"
              className="mt-3 w-full sm:mt-0 sm:w-auto btn btn-secondary"
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderItemModal;