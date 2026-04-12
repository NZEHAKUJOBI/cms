import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LowStockBanner() {
  const { isAdmin, isFacilityManager } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock-banner'],
    queryFn: () => inventoryApi.getLowStockAlerts(),
    enabled: (isAdmin || isFacilityManager) && !dismissed,
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || lowStockItems.length === 0) return null;

  const outOfStock = lowStockItems.filter((i) => i.currentStock === 0).length;
  const lowOnly = lowStockItems.length - outOfStock;
  const isRed = outOfStock > 0;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
        isRed
          ? 'bg-red-50 border-b border-red-200 text-red-800'
          : 'bg-amber-50 border-b border-amber-200 text-amber-800'
      }`}
    >
      <AlertTriangle size={16} className="flex-shrink-0" />
      <span className="flex-1">
        {outOfStock > 0 && <strong>{outOfStock} out of stock</strong>}
        {outOfStock > 0 && lowOnly > 0 && ' and '}
        {lowOnly > 0 && <strong>{lowOnly} low stock</strong>}
        {' '}item{lowStockItems.length !== 1 ? 's' : ''}.{' '}
        <Link to="/inventory" className="underline font-medium">
          View inventory →
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:bg-black/10"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
