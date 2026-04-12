import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';
import {
  Building2,
  Package,
  ClipboardList,
  Truck,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  to,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  to?: string;
}) {
  const card = (
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 ${to ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard…</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Facilities"
          value={data.totalFacilities}
          icon={Building2}
          color="bg-blue-500"
          to="/facilities"
        />
        <StatCard
          label="Total Products"
          value={data.totalProducts}
          icon={Package}
          color="bg-indigo-500"
          to="/products"
        />
        <StatCard
          label="Pending Orders"
          value={data.pendingOrders}
          icon={ClipboardList}
          color="bg-amber-500"
          to="/orders"
        />
        <StatCard
          label="Active Shipments"
          value={data.activeShipments}
          icon={Truck}
          color="bg-green-500"
          to="/shipments"
        />
        <StatCard
          label="Low Stock Alerts"
          value={data.lowStockAlerts}
          icon={AlertTriangle}
          color="bg-red-500"
          to="/inventory"
        />
        <StatCard
          label="Near Expiry Alerts"
          value={data.nearExpiryAlerts}
          icon={Clock}
          color="bg-orange-500"
          to="/inventory"
        />
      </div>

      {data.facilitySummaries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Facility Stock Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Facility</th>
                  <th className="px-5 py-3 text-right">Products</th>
                  <th className="px-5 py-3 text-right">Low Stock</th>
                  <th className="px-5 py-3 text-right">Out of Stock</th>
                  <th className="px-5 py-3 text-right">Near Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.facilitySummaries.map((f) => (
                  <tr key={f.facilityId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{f.facilityName}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{f.totalProducts}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-medium ${f.lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}
                      >
                        {f.lowStockCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-medium ${f.outOfStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`}
                      >
                        {f.outOfStockCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-medium ${f.nearExpiryCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}
                      >
                        {f.nearExpiryCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
