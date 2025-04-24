// src/pages/Products/components/ProductSuppliersTable.tsx
import React from 'react';
import { ProductSupplier, Supplier } from '../../../types';

interface ProductSuppliersTableProps {
  productSuppliers: ProductSupplier[];
  onRemoveSupplier: (supplierLinkId: string) => void;
}

// Cette interface étend ProductSupplier pour inclure les détails du fournisseur
interface EnhancedProductSupplier extends ProductSupplier {
  supplierDetails?: Supplier;
}

export const ProductSuppliersTable: React.FC<ProductSuppliersTableProps> = ({
  productSuppliers,
  onRemoveSupplier
}) => {
  if (productSuppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Aucun fournisseur associé à ce produit.</p>
      </div>
    );
  }

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fournisseur
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Référence
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix unitaire
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Délai de livraison
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productSuppliers.map((supplier: EnhancedProductSupplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {supplier.supplierDetails?.name || "Fournisseur"}
                </div>
                {supplier.supplierDetails?.contactName && (
                  <div className="text-xs text-gray-500">
                    Contact: {supplier.supplierDetails.contactName}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.supplierReference || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {supplier.unitPrice 
                  ? `${supplier.unitPrice.toFixed(2)} €` 
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.leadTimeDays 
                  ? `${supplier.leadTimeDays} jour${supplier.leadTimeDays > 1 ? 's' : ''}` 
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {supplier.isPreferred ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-positive-100 text-positive-800">
                      Préféré
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Alternatif
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onRemoveSupplier(supplier.id)}
                  className="text-danger-600 hover:text-danger-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSuppliersTable;