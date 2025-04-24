// src/pages/Products/components/EditProductModal.tsx
import React, { useState } from 'react';
import { Product, Category } from '../../../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (product: Product) => void;
  product: Product;
  categories: Category[];
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onUpdateProduct,
  product,
  categories
}) => {
  const [formData, setFormData] = useState<Product>({
    ...product
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (name === 'category') {
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          category: null
        }));
      } else {
        const selectedCategory = categories.find(cat => cat.id === value);
        if (selectedCategory) {
          setFormData(prev => ({
            ...prev,
            category: {
              id: selectedCategory.id,
              name: selectedCategory.name
            }
          }));
        }
      }
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
    const numValue = parseInt(value, 10);
    
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
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom du produit est requis';
    }
    
    if (formData.minStockLevel < 0) {
      errors.minStockLevel = 'Le seuil minimal doit être supérieur ou égal à 0';
    }
    
    if (formData.warningStockLevel < 0) {
      errors.warningStockLevel = 'Le seuil d\'alerte doit être supérieur ou égal à 0';
    }
    
    if (formData.warningStockLevel < formData.minStockLevel) {
      errors.warningStockLevel = 'Le seuil d\'alerte doit être supérieur au seuil minimal';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdateProduct(formData);
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
                  Modifier {product.name}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nom du produit *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                          required
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          value={formData.description || ''}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                            SKU / Référence
                          </label>
                          <input
                            type="text"
                            name="sku"
                            id="sku"
                            value={formData.sku || ''}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                            Code barre
                          </label>
                          <input
                            type="text"
                            name="barcode"
                            id="barcode"
                            value={formData.barcode || ''}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Catégorie
                        </label>
                        <select
                          name="category"
                          id="category"
                          value={formData.category?.id || ''}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Non catégorisé</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">
                          Unité de mesure
                        </label>
                        <input
                          type="text"
                          name="unitOfMeasure"
                          id="unitOfMeasure"
                          value={formData.unitOfMeasure}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="unité, boîte, kg, litre..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
                            Seuil minimal (critique)
                          </label>
                          <input
                            type="number"
                            name="minStockLevel"
                            id="minStockLevel"
                            value={formData.minStockLevel}
                            onChange={handleNumberChange}
                            min="0"
                            className={`form-input ${formErrors.minStockLevel ? 'border-red-500' : ''}`}
                          />
                          {formErrors.minStockLevel && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.minStockLevel}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="warningStockLevel" className="block text-sm font-medium text-gray-700">
                            Seuil d'alerte
                          </label>
                          <input
                            type="number"
                            name="warningStockLevel"
                            id="warningStockLevel"
                            value={formData.warningStockLevel}
                            onChange={handleNumberChange}
                            min="0"
                            className={`form-input ${formErrors.warningStockLevel ? 'border-red-500' : ''}`}
                          />
                          {formErrors.warningStockLevel && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.warningStockLevel}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="hasExpiry"
                          id="hasExpiry"
                          checked={formData.hasExpiry}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="hasExpiry" className="ml-2 block text-sm text-gray-700">
                          Ce produit a une date de péremption (DLUO)
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
              Enregistrer
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

export default EditProductModal;