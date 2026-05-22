// ─── API wrapper ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  role: string;
  facilityId?: string;
}

export interface AuthResponseDto {
  token: string;
  username: string;
  email: string;
  role: string;
  facilityId?: string;
  expiresAt: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  facilityId?: string;
  facilityName?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: string;
  facilityId?: string;
}

export interface UpdateUserDto {
  role?: string;
  facilityId?: string;
  isActive?: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface ProductDto {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  minimumStockLevel: number;
  description?: string;
  requiresColdChain: boolean;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  minimumStockLevel: number;
  description?: string;
  requiresColdChain?: boolean;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
}

export interface UpdateProductDto {
  name?: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  minimumStockLevel?: number;
  description?: string;
  isActive?: boolean;
  requiresColdChain?: boolean;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
}

// ─── Facility ─────────────────────────────────────────────────────────────────
export interface FacilityDto {
  id: string;
  name: string;
  code: string;
  type: string;
  state: string;
  district: string;
  region: string;
  contactPerson: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFacilityDto {
  name: string;
  code: string;
  type: string;
  state: string;
  district: string;
  region: string;
  contactPerson: string;
  phone: string;
  email?: string;
}

export interface UpdateFacilityDto {
  name?: string;
  type?: string;
  state?: string;
  district?: string;
  region?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryDto {
  id: string;
  facilityId: string;
  facilityName: string;
  productId: string;
  productName: string;
  productUnit: string;
  currentStock: number;
  reorderLevel: number;
  minimumStockLevel: number;
  isLowStock: boolean;
  batchNumber?: string;
  expiryDate?: string;
  isNearExpiry: boolean;
  lastUpdated: string;
}

export interface CreateInventoryDto {
  facilityId: string;
  productId: string;
  currentStock: number;
  reorderLevel: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpdateInventoryDto {
  currentStock?: number;
  reorderLevel?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface AdjustStockDto {
  quantity: number;
  adjustmentType: 'Add' | 'Subtract';
  reason: string;
}

export interface SetStockDto {
  stockOnHand: number;
  reason?: string;
}

export interface StockLedgerDto {
  id: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: string;
  reason?: string;
  changedAt: string;
}

export interface WeeklySnapshotDto {
  id: string;
  stockOnHand: number;
  weekStartDate: string;
  recordedAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  notes?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  facilityId: string;
  facilityName: string;
  status: string;
  orderDate: string;
  requiredDate?: string;
  notes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  orderItems: OrderItemDto[];
  createdAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  requestedQuantity: number;
  notes?: string;
}

export interface CreateOrderDto {
  facilityId: string;
  requiredDate?: string;
  notes?: string;
  orderItems: CreateOrderItemDto[];
}

export interface ApproveOrderItemDto {
  orderItemId: string;
  approvedQuantity: number;
}

export interface ApproveOrderDto {
  items: ApproveOrderItemDto[];
  notes?: string;
}

export interface RejectOrderDto {
  reason: string;
}

// ─── Shipment ─────────────────────────────────────────────────────────────────
export interface ShipmentItemDto {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface ShipmentDto {
  id: string;
  shipmentNumber: string;
  orderId?: string;
  orderNumber?: string;
  facilityId: string;
  facilityName: string;
  status: string;
  shipmentDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  shipmentItems: ShipmentItemDto[];
  createdAt: string;
}

export interface CreateShipmentItemDto {
  productId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface CreateShipmentDto {
  orderId?: string;
  facilityId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  shipmentItems: CreateShipmentItemDto[];
}

export interface UpdateShipmentStatusDto {
  status: string;
  actualDeliveryDate?: string;
  notes?: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface FacilityStockSummaryDto {
  facilityId: string;
  facilityName: string;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  nearExpiryCount: number;
}

export interface DashboardSummaryDto {
  totalFacilities: number;
  totalProducts: number;
  pendingOrders: number;
  activeShipments: number;
  lowStockAlerts: number;
  nearExpiryAlerts: number;
  facilitySummaries: FacilityStockSummaryDto[];
}

export interface StockReportItemDto {
  productName: string;
  genericName: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  minimumStockLevel: number;
  stockStatus: string;
  expiryDate?: string;
}

export interface StockReportDto {
  facilityId: string;
  facilityName: string;
  facilityRegion: string;
  reportDate: string;
  items: StockReportItemDto[];
}

export interface OrderSummaryDto {
  orderNumber: string;
  facilityName: string;
  status: string;
  orderDate: string;
  totalItems: number;
}

export interface OrderReportDto {
  fromDate: string;
  toDate: string;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  fulfilledOrders: number;
  orders: OrderSummaryDto[];
}

export interface CategoryStockDto {
  category: string;
  itemCount: number;
  lowCount: number;
}

export interface LowStockAlertItemDto {
  productName: string;
  currentStock: number;
  reorderLevel: number;
  isOutOfStock: boolean;
}

export interface FacilityDashboardDto {
  facilityId: string;
  facilityName: string;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  nearExpiryItems: number;
  pendingOrders: number;
  incomingShipments: number;
  categoryBreakdown: CategoryStockDto[];
  topLowStockItems: LowStockAlertItemDto[];
}

// ─── New features ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  type: string;
  title: string;
  message: string;
  linkId?: string;
  createdAt: string;
}

export interface BulkImportResultDto {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface BulkImportRowDto {
  facilityCode: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  batchNumber?: string;
  expiryDate?: string;
}


export interface CategoryChartItem {
  category: string;
  count: number;
}

export interface DosageFormChartItem {
  dosageForm: string;
  count: number;
}

export interface DrugAvailabilityItem {
  name: string;
  category: string;
  totalStock: number;
  facilityCount: number;
}

export interface DrugChartDataDto {
  productsByCategory: CategoryChartItem[];
  productsByDosageForm: DosageFormChartItem[];
  drugAvailability: DrugAvailabilityItem[];
  totalDrugs: number;
  activeDrugs: number;
  inactiveDrugs: number;
}

// ─── Cold Chain (extended Product fields) ────────────────────────────────────
// ProductDto already extended in backend; add here for TS awareness
declare module './index' {}

// ─── Demand Forecasting ───────────────────────────────────────────────────────
export interface DemandForecastDto {
  inventoryId: string;
  productName: string;
  facilityName: string;
  currentStock: number;
  reorderLevel: number;
  avgWeeklyConsumption: number;
  weeksUntilStockout: number | null;
  forecastedStockIn4Weeks: number;
  suggestedReorderQuantity: number;
  riskLevel: 'Critical' | 'Warning' | 'OK';
  snapshots: WeeklySnapshotDto[];
  modelUsed: 'SSA' | 'Average';
  forecastedWeeklyDemand: number[];
  confidenceLower: number[];
  confidenceUpper: number[];
}

export interface RiskItemDto {
  inventoryId: string;
  productName: string;
  facilityName: string;
  currentStock: number;
  reorderLevel: number;
  avgWeeklyConsumption: number;
  weeksUntilStockout: number | null;
  riskLevel: 'Critical' | 'Warning' | 'OK';
}

export interface FacilityRiskDto {
  facilityName: string;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  totalItems: number;
}

export interface RiskSummaryDto {
  criticalCount: number;
  warningCount: number;
  okCount: number;
  totalItems: number;
  topRiskItems: RiskItemDto[];
  facilityBreakdown: FacilityRiskDto[];
}

// ─── GRN (Goods Receipt Note) ─────────────────────────────────────────────────
export interface GrnItemDto {
  id: string;
  productId: string;
  productName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  condition: 'Good' | 'Damaged' | 'Expired';
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface GrnDto {
  id: string;
  grnNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  facilityId: string;
  facilityName: string;
  status: 'Accepted' | 'PartiallyAccepted' | 'Rejected';
  overallNotes?: string;
  inspectedByName: string;
  inspectedAt: string;
  items: GrnItemDto[];
}

export interface SubmitGrnItemDto {
  productId: string;
  expectedQuantity: number;
  receivedQuantity: number;
  condition: 'Good' | 'Damaged' | 'Expired';
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface SubmitGrnDto {
  overallNotes?: string;
  items: SubmitGrnItemDto[];
}

// ─── Stock Transfer ───────────────────────────────────────────────────────────
export interface StockTransferItemDto {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface StockTransferDto {
  id: string;
  transferNumber: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  status: 'Pending' | 'Approved' | 'InTransit' | 'Completed' | 'Cancelled';
  transferDate: string;
  notes?: string;
  requestedByName: string;
  approvedByName?: string;
  createdAt: string;
  items: StockTransferItemDto[];
}

export interface CreateStockTransferItemDto {
  productId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface CreateStockTransferDto {
  sourceFacilityId: string;
  destinationFacilityId: string;
  notes?: string;
  items: CreateStockTransferItemDto[];
}

export interface UpdateTransferStatusDto {
  status: 'Approved' | 'InTransit' | 'Completed' | 'Cancelled';
  notes?: string;
}
