import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LowStockBanner() {
  const { isAdmin, isStateManager, isLaboratory, isPharmacist } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock-banner'],
    queryFn: () => inventoryApi.getLowStockAlerts(),
    enabled: (isAdmin || isStateManager || isLaboratory || isPharmacist) && !dismissed,
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || lowStockItems.length === 0) return null;

  const outOfStock = lowStockItems.filter((i) => i.currentStock === 0).length;
  const lowOnly = lowStockItems.length - outOfStock;
  const isRed = outOfStock > 0;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm animate-slide-up ${
        isRed
          ? 'bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200/60 text-rose-800'
          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200/60 text-amber-800'
      }`}
    >
      <div className={`p-1 rounded-lg ${isRed ? 'bg-rose-100' : 'bg-amber-100'}`}>
        <AlertTriangle size={14} className="flex-shrink-0" />
      </div>
      <span className="flex-1">
        {outOfStock > 0 && <strong>{outOfStock} out of stock</strong>}
        {outOfStock > 0 && lowOnly > 0 && ' and '}
        {lowOnly > 0 && <strong>{lowOnly} low stock</strong>}
        {' '}item{lowStockItems.length !== 1 ? 's' : ''}.{' '}
        <Link to="/inventory" className="underline font-medium hover:no-underline">
          View inventory →
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className={`p-1 rounded-lg transition-colors ${isRed ? 'hover:bg-rose-100' : 'hover:bg-amber-100'}`}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
