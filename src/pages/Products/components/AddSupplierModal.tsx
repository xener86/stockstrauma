// src/pages/Products/components/AddSupplierModal.tsx
import React, { useState } from 'react';
import { ProductSupplier, Supplier } from '../../../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (productSupplier: Omit<ProductSupplier, 'id'>) => void;
  suppliers: Supplier[];
  productId: string;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onAddSupplier,
  suppliers,
  productId
}) => {
  const [formData, setFormData] = useState<Omit<ProductSupplier, 'id'>>({
    productId,
    supplierId: '',
    isPreferred: false,
    supplierReference: '',
    unitPrice: undefined,
    leadTimeDays: undefined
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const availableSuppliers = suppliers.filter(supplier => supplier.isActive);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (name === 'supplierId') {
      setFormData(prev => ({
        ...prev,
        supplierId: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
      
    if (!isNaN(numValue) && numValue >= 0) {
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
    
    if (!formData.supplierId) {
      errors.supplierId = 'Veuillez sélectionner un fournisseur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Trouver le fournisseur sélectionné pour l'ajouter à l'objet
      const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
      
      if (selectedSupplier) {
        const productSupplier: Omit<ProductSupplier, 'id'> = {
          ...formData,
          // Au lieu d'ajouter la propriété supplier, ajoutez supplierDetails qui est compatible avec votre type
          supplierDetails: {
            id: selectedSupplier.id,
            name: selectedSupplier.name,
            contactName: selectedSupplier.contactName,
            email: selectedSupplier.email,
            phone: selectedSupplier.phone,
            isActive: selectedSupplier.isActive
          }
        };
        
        onAddSupplier(productSupplier);
      } else {
        setFormErrors({
          supplierId: 'Fournisseur invalide'
        });
      }
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
                  Ajouter un fournisseur
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
                          Fournisseur *
                        </label>
                        <select
                          id="supplierId"
                          name="supplierId"
                          value={formData.supplierId}
                          onChange={handleChange}
                          className={`form-select ${formErrors.supplierId ? 'border-red-500' : ''}`}
                          required
                        >
                          <option value="">Sélectionner un fournisseur</option>
                          {availableSuppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                        {formErrors.supplierId && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.supplierId}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="supplierReference" className="block text-sm font-medium text-gray-700">
                          Référence chez le fournisseur
                        </label>
                        <input
                          type="text"
                          id="supplierReference"
                          name="supplierReference"
                          value={formData.supplierReference || ''}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Ex: REF-12345"
                        />
                      </div>

                      <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
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
                      </div>

                      <div>
                        <label htmlFor="leadTimeDays" className="block text-sm font-medium text-gray-700">
                          Délai de livraison (jours)
                        </label>
                        <input
                          type="number"
                          id="leadTimeDays"
                          name="leadTimeDays"
                          value={formData.leadTimeDays === undefined ? '' : formData.leadTimeDays}
                          onChange={handleNumberChange}
                          className="form-input"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPreferred"
                          name="isPreferred"
                          checked={formData.isPreferred}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="isPreferred" className="ml-2 block text-sm text-gray-700">
                          Définir comme fournisseur préféré
                        </label>
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

export default AddSupplierModal;