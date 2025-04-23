// src/pages/Inventory/components/AddMovementModal.tsx
import React, { useState, useEffect } from 'react';
import { Product, Location, InventoryMovement } from '../../../types';

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovement: (movement: Omit<InventoryMovement, 'id' | 'createdAt' | 'movedByUser'>) => void;
  products: Product[];
  locations: Location[];
  initialProductId: string | null;
  initialLocationId: string | null;
}

export const AddMovementModal: React.FC<AddMovementModalProps> = ({
  isOpen,
  onClose,
  onAddMovement,
  products,
  locations,
  initialProductId,
  initialLocationId
}) => {
  const [formData, setFormData] = useState<{
    type: 'in' | 'out' | 'transfer' | 'adjustment' | 'consumption';
    productId: string;
    quantity: number;
    sourceLocationId?: string;
    destinationLocationId?: string;
    referenceNumber?: string;
    notes?: string;
  }>({
    type: 'in',
    productId: initialProductId || '',
    quantity: 1,
    sourceLocationId: initialLocationId || '',
    destinationLocationId: initialLocationId || '',
    referenceNumber: '',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mettre à jour le produit sélectionné lorsque l'ID du produit change
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

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
    const numValue = parseInt(value, 10);
    
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
    
    if (formData.quantity <= 0) {
      errors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    // Validation spécifique selon le type de mouvement
    if (formData.type === 'in' && !formData.destinationLocationId) {
      errors.destinationLocationId = 'Veuillez sélectionner un lieu de destination pour l\'entrée';
    }
    
    if (formData.type === 'out' && !formData.sourceLocationId) {
      errors.sourceLocationId = 'Veuillez sélectionner un lieu source pour la sortie';
    }
    
    if (formData.type === 'transfer') {
      if (!formData.sourceLocationId) {
        errors.sourceLocationId = 'Veuillez sélectionner un lieu source pour le transfert';
      }
      
      if (!formData.destinationLocationId) {
        errors.destinationLocationId = 'Veuillez sélectionner un lieu de destination pour le transfert';
      }
      
      if (formData.sourceLocationId === formData.destinationLocationId) {
        errors.destinationLocationId = 'Les lieux source et destination doivent être différents';
      }
    }
    
    if (formData.type === 'adjustment' && !formData.sourceLocationId) {
      errors.sourceLocationId = 'Veuillez sélectionner un lieu pour l\'ajustement';
    }
    
    if (formData.type === 'consumption' && !formData.sourceLocationId) {
      errors.sourceLocationId = 'Veuillez sélectionner un lieu pour la consommation';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Préparer l'objet de mouvement
      const movement: Omit<InventoryMovement, 'id' | 'createdAt' | 'movedByUser'> = {
        type: formData.type,
        productId: formData.productId,
        quantity: formData.quantity,
        movedBy: '', // Sera rempli par le backend avec l'ID de l'utilisateur
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      };
      
      // Ajouter les champs optionnels selon le type de mouvement
      if (['out', 'transfer', 'adjustment', 'consumption'].includes(formData.type)) {
        movement.sourceLocationId = formData.sourceLocationId;
      }
      
      if (['in', 'transfer'].includes(formData.type)) {
        movement.destinationLocationId = formData.destinationLocationId;
      }
      
      onAddMovement(movement);
    }
  };

  if (!isOpen) return null;

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
                  Ajouter un mouvement de stock
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Type de mouvement *
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="in">Entrée</option>
                          <option value="out">Sortie</option>
                          <option value="transfer">Transfert</option>
                          <option value="adjustment">Ajustement</option>
                          <option value="consumption">Consommation</option>
                        </select>
                      </div>

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
                          />
                          <span className="ml-2 text-gray-500">
                            {selectedProduct?.unitOfMeasure || 'unité(s)'}
                          </span>
                        </div>
                        {formErrors.quantity && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>
                        )}
                      </div>

                      {(formData.type === 'out' || formData.type === 'transfer' || 
                        formData.type === 'adjustment' || formData.type === 'consumption') && (
                        <div>
                          <label htmlFor="sourceLocationId" className="block text-sm font-medium text-gray-700 mb-1">
                            Lieu source *
                          </label>
                          <select
                            id="sourceLocationId"
                            name="sourceLocationId"
                            value={formData.sourceLocationId || ''}
                            onChange={handleChange}
                            className={`form-select ${formErrors.sourceLocationId ? 'border-red-500' : ''}`}
                          >
                            <option value="">Sélectionner un lieu</option>
                            {locations.map(location => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.sourceLocationId && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.sourceLocationId}</p>
                          )}
                        </div>
                      )}

                      {(formData.type === 'in' || formData.type === 'transfer') && (
                        <div>
                          <label htmlFor="destinationLocationId" className="block text-sm font-medium text-gray-700 mb-1">
                            Lieu destination *
                          </label>
                          <select
                            id="destinationLocationId"
                            name="destinationLocationId"
                            value={formData.destinationLocationId || ''}
                            onChange={handleChange}
                            className={`form-select ${formErrors.destinationLocationId ? 'border-red-500' : ''}`}
                          >
                            <option value="">Sélectionner un lieu</option>
                            {locations.map(location => (
                              <option 
                                key={location.id} 
                                value={location.id}
                                disabled={formData.type === 'transfer' && location.id === formData.sourceLocationId}
                              >
                                {location.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.destinationLocationId && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.destinationLocationId}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de référence
                        </label>
                        <input
                          type="text"
                          id="referenceNumber"
                          name="referenceNumber"
                          value={formData.referenceNumber || ''}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Ex: BON-12345"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes || ''}
                          onChange={handleChange}
                          rows={3}
                          className="form-input"
                          placeholder="Ajoutez des détails supplémentaires..."
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

export default AddMovementModal;