// src/types/index.ts

// Types utilisateur et authentification
export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: 'admin' | 'operator';
  }
  
  // Types pour les produits
  export interface Category {
    id: string;
    name: string;
    description?: string;
  }
  
  export interface ProductVariant {
    id: string;
    name: string;
    attributes?: Record<string, any>;
  }
  
// Mise à jour de la définition du type Product dans src/types/index.ts

export interface Product {
  id: string;
  name: string;
  description?: string | null; // Modifié pour accepter null
  sku?: string | null;         // Modifié pour accepter null
  barcode?: string | null;     // Modifié pour accepter null
  unitOfMeasure: string;
  minStockLevel: number;
  warningStockLevel: number;
  hasExpiry: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  variant?: {
    id: string;
    name: string;
    attributes?: Record<string, any>;
  } | null;
  quantity?: number;
  reservedQuantity?: number;
  details?: string;
}
  
  // Types pour les fournisseurs
  export interface Supplier {
    id: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
  }
  
  export interface ProductSupplier {
    id: string;
    productId: string;
    variantId?: string;
    supplierId: string;
    supplierReference?: string;
    unitPrice?: number;
    isPreferred: boolean;
    leadTimeDays?: number;
  }
  
  // Types pour les lieux de stockage
  export interface Location {
    id: string;
    name: string;
    description?: string;
    address?: string;
    isActive: boolean;
    products?: Product[];
  }
  
  // Types pour l'inventaire
  export interface InventoryItem {
    locationId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    reservedQuantity: number;
    lastCountedAt?: Date;
  }
  
  export interface Batch {
    id: string;
    productId: string;
    variantId?: string;
    batchNumber: string;
    expiryDate?: Date;
    manufacturedDate?: Date;
    notes?: string;
  }
  
  export interface BatchInventory {
    locationId: string;
    batchId: string;
    productId: string;
    variantId?: string;
    quantity: number;
  }
  
  export interface InventoryMovement {
    id: string;
    type: 'in' | 'out' | 'transfer' | 'adjustment' | 'consumption';
    productId: string;
    variantId?: string;
    batchId?: string;
    sourceLocationId?: string;
    destinationLocationId?: string;
    quantity: number;
    movedBy: string;
    referenceNumber?: string;
    notes?: string;
    createdAt: Date;
  }
  
  export interface InventorySummary {
    totalItems: number;
    itemsToOrder: number;
    estimatedOrderValue?: number;
    locationsCount: number;
  }
  
  // Types pour les commandes
  export interface Order {
    id: string;
    referenceNumber: string;
    status: 'draft' | 'pending' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
    supplier: {
      id: string;
      name: string;
    };
    orderedBy: {
      id: string;
      name: string;
      email: string;
    };
    orderedDate?: Date | null;
    expectedDeliveryDate?: Date | null;
    receivedDate?: Date | null;
    notes?: string;
    createdAt: Date;
    items?: OrderItem[];
  }
  
  export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice?: number;
    destinationLocationId: string;
    notes?: string;
    product?: {
      name: string;
      sku?: string;
    };
    variant?: {
      name: string;
    };
    destination?: {
      name: string;
    };
  }
  
  // Types pour les alertes
  export interface Alert {
    id: string;
    type: "low_stock" | "expiry" | "order_update" | "system";
    message: string;
    severity: string;
    isRead: boolean;
    createdAt: Date;
    product?: {
      id: string;
      name: string;
      sku?: string;
    } | null;
    variant?: {
      id: string;
      name: string;
    } | null;
    location?: {
      id: string;
      name: string;
    } | null;
  }