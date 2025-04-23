// src/pages/Suppliers/SupplierDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertBanner } from '../../components/common/AlertBanner';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <AlertBanner 
        title="Page en développement" 
        message={`La page de détail du fournisseur (ID: ${id}) sera disponible prochainement.`}
        severity="info"
        onAction={() => navigate('/suppliers')}
        actionLabel="Retour aux fournisseurs"
      />
    </div>
  );
};

export default SupplierDetail;
