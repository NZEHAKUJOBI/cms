using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Transforms.TimeSeries;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Auth;
using PSCMS.DTOs.Inventory;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db) => _db = db;

    public async Task<PagedResult<InventoryDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, bool? lowStockOnly)
    {
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .AsQueryable();

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);
        if (lowStockOnly == true) query = query.Where(i => i.CurrentStock <= i.ReorderLevel);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(i => i.Facility.Name).ThenBy(i => i.Product.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<InventoryDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<InventoryDto?> GetByIdAsync(Guid id)
    {
        var inv = await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == id);
        return inv is null ? null : ToDto(inv);
    }

    public async Task<List<InventoryDto>> GetByFacilityAsync(Guid facilityId)
    {
        return await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.FacilityId == facilityId)
            .OrderBy(i => i.Product.Name)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<InventoryDto> CreateAsync(CreateInventoryDto dto, Guid? createdBy = null)
    {
        var exists = await _db.Inventories.AnyAsync(i => i.FacilityId == dto.FacilityId && i.ProductId == dto.ProductId);
        if (exists) throw new InvalidOperationException("Inventory record already exists for this facility and product.");

        var inv = new Inventory
        {
            FacilityId = dto.FacilityId,
            ProductId = dto.ProductId,
            CurrentStock = dto.CurrentStock,
            ReorderLevel = dto.ReorderLevel,
            BatchNumber = dto.BatchNumber,
            ExpiryDate = dto.ExpiryDate.HasValue
                ? DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc)
                : null
        };
        _db.Inventories.Add(inv);

        // Record initial ledger entry
        await RecordLedgerAsync(inv, 0, inv.CurrentStock, "Initial", "Initial stock entry", createdBy);

        await _db.SaveChangesAsync();
        return await GetByIdAsync(inv.Id) ?? throw new InvalidOperationException("Failed to retrieve created inventory.");
    }

    public async Task<InventoryDto?> UpdateAsync(Guid id, UpdateInventoryDto dto)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        var stockChanged = dto.CurrentStock.HasValue && dto.CurrentStock.Value != previousStock;

        if (dto.CurrentStock.HasValue) inv.CurrentStock = dto.CurrentStock.Value;
        if (dto.ReorderLevel.HasValue) inv.ReorderLevel = dto.ReorderLevel.Value;
        if (dto.BatchNumber is not null) inv.BatchNumber = dto.BatchNumber;
        if (dto.ExpiryDate.HasValue) inv.ExpiryDate = DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc);
        inv.LastUpdated = DateTime.UtcNow;

        if (stockChanged)
            await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, "Set", "Manual edit", null);

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InventoryDto?> AdjustStockAsync(Guid id, AdjustStockDto dto, Guid? changedBy = null)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        if (dto.AdjustmentType == "Add")
            inv.CurrentStock += dto.Quantity;
        else if (dto.AdjustmentType == "Subtract")
            inv.CurrentStock = Math.Max(0, inv.CurrentStock - dto.Quantity);
        else
            throw new InvalidOperationException("AdjustmentType must be 'Add' or 'Subtract'.");

        inv.LastUpdated = DateTime.UtcNow;
        await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, dto.AdjustmentType, dto.Reason, changedBy);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InventoryDto?> SetStockAsync(Guid id, SetStockDto dto, Guid? changedBy = null)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        inv.CurrentStock = Math.Max(0, dto.StockOnHand);
        inv.LastUpdated = DateTime.UtcNow;

        await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, "Set", dto.Reason ?? "Physical count", changedBy);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<List<InventoryDto>> GetLowStockAlertsAsync(Guid? facilityId)
    {
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.CurrentStock <= i.ReorderLevel);

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);

        return (await query.ToListAsync()).Select(ToDto).ToList();
    }

    public async Task<List<InventoryDto>> GetNearExpiryAlertsAsync(int withinDays = 90, Guid? facilityId = null)
    {
        var threshold = DateTime.UtcNow.AddDays(withinDays);
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= threshold);

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);

        return await query
            .OrderBy(i => i.ExpiryDate)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<List<StockLedgerDto>> GetStockHistoryAsync(Guid inventoryId, int days = 90)
    {
        var since = DateTime.UtcNow.AddDays(-Math.Abs(days));
        return await _db.StockLedger
            .Where(sl => sl.InventoryId == inventoryId && sl.ChangedAt >= since)
            .OrderByDescending(sl => sl.ChangedAt)
            .Select(sl => new StockLedgerDto
            {
                Id = sl.Id,
                PreviousStock = sl.PreviousStock,
                NewStock = sl.NewStock,
                ChangeAmount = sl.ChangeAmount,
                ChangeType = sl.ChangeType,
                Reason = sl.Reason,
                ChangedAt = sl.ChangedAt
            })
            .ToListAsync();
    }

    public async Task<List<WeeklySnapshotDto>> GetWeeklySnapshotsAsync(Guid inventoryId, int weeks = 12)
    {
        var since = GetWeekStart(DateTime.UtcNow).AddDays(-7 * (Math.Max(1, weeks) - 1));
        return await _db.WeeklyStockSnapshots
            .Where(s => s.InventoryId == inventoryId && s.WeekStartDate >= since)
            .OrderBy(s => s.WeekStartDate)
            .Select(s => new WeeklySnapshotDto
            {
                Id = s.Id,
                StockOnHand = s.StockOnHand,
                WeekStartDate = s.WeekStartDate,
                RecordedAt = s.RecordedAt
            })
            .ToListAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Adds a StockLedger row and upserts the WeeklyStockSnapshot for the current week.</summary>
    private async Task RecordLedgerAsync(Inventory inv, int previousStock, int newStock, string changeType, string? reason, Guid? changedBy)
    {
        _db.StockLedger.Add(new StockLedger
        {
            InventoryId = inv.Id,
            FacilityId = inv.FacilityId,
            ProductId = inv.ProductId,
            PreviousStock = previousStock,
            NewStock = newStock,
            ChangeAmount = newStock - previousStock,
            ChangeType = changeType,
            Reason = reason,
            ChangedBy = changedBy,
            ChangedAt = DateTime.UtcNow
        });

        var weekStart = GetWeekStart(DateTime.UtcNow);
        var snapshot = await _db.WeeklyStockSnapshots
            .FirstOrDefaultAsync(s => s.InventoryId == inv.Id && s.WeekStartDate == weekStart);

        if (snapshot is null)
        {
            _db.WeeklyStockSnapshots.Add(new WeeklyStockSnapshot
            {
                InventoryId = inv.Id,
                FacilityId = inv.FacilityId,
                ProductId = inv.ProductId,
                StockOnHand = newStock,
                WeekStartDate = weekStart,
                RecordedAt = DateTime.UtcNow
            });
        }
        else
        {
            snapshot.StockOnHand = newStock;
            snapshot.RecordedAt = DateTime.UtcNow;
        }
    }

    /// <summary>Returns the Monday (UTC) of the week containing <paramref name="date"/>.</summary>
    private static DateTime GetWeekStart(DateTime date)
    {
        var d = date.Date;
        var offset = (int)d.DayOfWeek == 0 ? 6 : (int)d.DayOfWeek - 1;
        return DateTime.SpecifyKind(d.AddDays(-offset), DateTimeKind.Utc);
    }

    private static InventoryDto ToDto(Inventory i) => new()
    {
        Id = i.Id,
        FacilityId = i.FacilityId,
        FacilityName = i.Facility?.Name ?? string.Empty,
        ProductId = i.ProductId,
        ProductName = i.Product?.Name ?? string.Empty,
        ProductUnit = i.Product?.Unit ?? string.Empty,
        CurrentStock = i.CurrentStock,
        ReorderLevel = i.ReorderLevel,
        MinimumStockLevel = i.Product?.MinimumStockLevel ?? 0,
        IsLowStock = i.CurrentStock <= i.ReorderLevel,
        BatchNumber = i.BatchNumber,
        ExpiryDate = i.ExpiryDate,
        IsNearExpiry = i.ExpiryDate.HasValue && i.ExpiryDate.Value <= DateTime.UtcNow.AddDays(90),
        LastUpdated = i.LastUpdated
    };

    public async Task<DemandForecastDto?> GetForecastAsync(Guid inventoryId, int weeks = 12)
    {
        var inv = await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == inventoryId);

        if (inv is null) return null;

        var snapshots = await GetWeeklySnapshotsAsync(inventoryId, weeks);

        // Build weekly consumption series from snapshot deltas (stock decreases = demand)
        var consumptionSeries = new List<float>();
        for (int i = 1; i < snapshots.Count; i++)
        {
            var delta = snapshots[i - 1].StockOnHand - snapshots[i].StockOnHand;
            consumptionSeries.Add(delta > 0 ? (float)delta : 0f);
        }

        // SSA requires at least windowSize*2 points; fallback to simple average below that
        const int horizon = 4;
        const int windowSize = 4;
        const int minPointsForSsa = windowSize * 2; // 8 data points

        double avgWeeklyConsumption;
        string modelUsed;
        List<double> forecastedDemand;
        List<double> confLower;
        List<double> confUpper;

        if (consumptionSeries.Count >= minPointsForSsa)
        {
            // --- ML.NET SSA forecasting ---
            var mlContext = new MLContext(seed: 42);

            var timeSeriesData = consumptionSeries
                .Select(v => new DemandTimeSeriesInput { Value = v })
                .ToList();

            var dataView = mlContext.Data.LoadFromEnumerable(timeSeriesData);

            var pipeline = mlContext.Forecasting.ForecastBySsa(
                outputColumnName: "Forecast",
                inputColumnName: nameof(DemandTimeSeriesInput.Value),
                windowSize: windowSize,
                seriesLength: consumptionSeries.Count,
                trainSize: consumptionSeries.Count,
                horizon: horizon,
                confidenceLevel: 0.95f,
                confidenceLowerBoundColumn: "ConfLower",
                confidenceUpperBoundColumn: "ConfUpper"
            );

            var model = pipeline.Fit(dataView);
            var engine = model.CreateTimeSeriesEngine<DemandTimeSeriesInput, DemandForecastOutput>(mlContext);
            var prediction = engine.Predict();

            forecastedDemand = prediction.Forecast.Select(v => Math.Max(0d, Math.Round((double)v, 1))).ToList();
            confLower = prediction.ConfLower.Select(v => Math.Max(0d, Math.Round((double)v, 1))).ToList();
            confUpper = prediction.ConfUpper.Select(v => Math.Max(0d, Math.Round((double)v, 1))).ToList();
            avgWeeklyConsumption = forecastedDemand.Count > 0
                ? Math.Round(forecastedDemand.Average(), 1)
                : (consumptionSeries.Count > 0 ? Math.Round(consumptionSeries.Average(), 1) : 0);
            modelUsed = "SSA";
        }
        else
        {
            // --- Fallback: simple average ---
            avgWeeklyConsumption = consumptionSeries.Count > 0
                ? Math.Round(consumptionSeries.Average(), 1)
                : 0;
            forecastedDemand = Enumerable.Range(0, horizon)
                .Select(_ => avgWeeklyConsumption).ToList();
            confLower = forecastedDemand.Select(v => Math.Max(0, v * 0.7)).ToList();
            confUpper = forecastedDemand.Select(v => v * 1.3).ToList();
            modelUsed = "Average";
        }

        double? weeksUntilStockout = avgWeeklyConsumption > 0
            ? inv.CurrentStock / avgWeeklyConsumption
            : null;

        int forecastIn4Weeks = avgWeeklyConsumption > 0
            ? Math.Max(0, inv.CurrentStock - (int)Math.Round(forecastedDemand.Sum()))
            : inv.CurrentStock;

        int suggested = avgWeeklyConsumption > 0
            ? Math.Max(0, (int)Math.Round(8 * avgWeeklyConsumption) + inv.ReorderLevel - inv.CurrentStock)
            : 0;

        var risk = weeksUntilStockout switch
        {
            null => "OK",
            < 2 => "Critical",
            < 4 => "Warning",
            _ => "OK"
        };

        return new DemandForecastDto
        {
            InventoryId = inv.Id,
            ProductName = inv.Product?.Name ?? string.Empty,
            FacilityName = inv.Facility?.Name ?? string.Empty,
            CurrentStock = inv.CurrentStock,
            ReorderLevel = inv.ReorderLevel,
            AvgWeeklyConsumption = avgWeeklyConsumption,
            WeeksUntilStockout = weeksUntilStockout.HasValue ? Math.Round(weeksUntilStockout.Value, 1) : null,
            ForecastedStockIn4Weeks = forecastIn4Weeks,
            SuggestedReorderQuantity = suggested,
            RiskLevel = risk,
            Snapshots = snapshots,
            ModelUsed = modelUsed,
            ForecastedWeeklyDemand = forecastedDemand,
            ConfidenceLower = confLower,
            ConfidenceUpper = confUpper,
        };
    }

    // ML.NET input/output classes for SSA time-series forecasting
    private sealed class DemandTimeSeriesInput
    {
        public float Value { get; set; }
    }

    private sealed class DemandForecastOutput
    {
        public float[] Forecast { get; set; } = [];
        public float[] ConfLower { get; set; } = [];
        public float[] ConfUpper { get; set; } = [];
    }

    public async Task<RiskSummaryDto> GetRiskSummaryAsync(Guid? facilityId = null)
    {
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .AsQueryable();

        if (facilityId.HasValue)
            query = query.Where(i => i.FacilityId == facilityId);

        var inventories = await query.ToListAsync();

        // Fetch last 8 weekly snapshots for all items in one query
        var inventoryIds = inventories.Select(i => i.Id).ToList();
        var cutoff = DateTime.UtcNow.AddDays(-56); // 8 weeks
        var allSnapshots = await _db.WeeklyStockSnapshots
            .Where(s => inventoryIds.Contains(s.InventoryId) && s.WeekStartDate >= cutoff)
            .OrderByDescending(s => s.WeekStartDate)
            .ToListAsync();

        var snapshotsByInventory = allSnapshots.GroupBy(s => s.InventoryId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(s => s.WeekStartDate).ToList());

        var riskItems = new List<RiskItemDto>();

        foreach (var inv in inventories)
        {
            var snapshots = snapshotsByInventory.TryGetValue(inv.Id, out var s) ? s : new();

            double avgConsumption = 0;
            if (snapshots.Count >= 2)
            {
                var deltas = new List<double>();
                for (int i = 1; i < snapshots.Count; i++)
                {
                    var delta = snapshots[i - 1].StockOnHand - snapshots[i].StockOnHand;
                    if (delta > 0) deltas.Add(delta);
                }
                if (deltas.Count > 0) avgConsumption = deltas.Average();
            }

            double? weeksUntilStockout = avgConsumption > 0 ? inv.CurrentStock / avgConsumption : null;

            var risk = weeksUntilStockout switch
            {
                null => "OK",
                < 2 => "Critical",
                < 4 => "Warning",
                _ => "OK"
            };

            riskItems.Add(new RiskItemDto
            {
                InventoryId = inv.Id,
                ProductName = inv.Product?.Name ?? string.Empty,
                FacilityName = inv.Facility?.Name ?? string.Empty,
                CurrentStock = inv.CurrentStock,
                ReorderLevel = inv.ReorderLevel,
                AvgWeeklyConsumption = Math.Round(avgConsumption, 1),
                WeeksUntilStockout = weeksUntilStockout.HasValue ? Math.Round(weeksUntilStockout.Value, 1) : null,
                RiskLevel = risk,
            });
        }

        var topRisk = riskItems
            .Where(r => r.RiskLevel != "OK")
            .OrderBy(r => r.RiskLevel == "Critical" ? 0 : 1)
            .ThenBy(r => r.WeeksUntilStockout ?? 999)
            .Take(10)
            .ToList();

        return new RiskSummaryDto
        {
            TotalItems = riskItems.Count,
            CriticalCount = riskItems.Count(r => r.RiskLevel == "Critical"),
            WarningCount = riskItems.Count(r => r.RiskLevel == "Warning"),
            OkCount = riskItems.Count(r => r.RiskLevel == "OK"),
            TopRiskItems = topRisk,
        };
    }

    public async Task<BulkImportResultDto> BulkImportAsync(List<BulkImportRowDto> rows, Guid importedBy)
    {
        var result = new BulkImportResultDto();
        var facilities = await _db.Facilities.ToListAsync();
        var products = await _db.Products.ToListAsync();

        foreach (var (row, index) in rows.Select((r, i) => (r, i + 1)))
        {
            try
            {
                var facility = facilities.FirstOrDefault(f =>
                    string.Equals(f.Code, row.FacilityCode, StringComparison.OrdinalIgnoreCase));
                if (facility is null)
                {
                    result.Errors.Add($"Row {index}: Facility code '{row.FacilityCode}' not found.");
                    result.Skipped++;
                    continue;
                }

                var product = products.FirstOrDefault(p =>
                    string.Equals(p.Name, row.ProductName, StringComparison.OrdinalIgnoreCase));
                if (product is null)
                {
                    result.Errors.Add($"Row {index}: Product '{row.ProductName}' not found.");
                    result.Skipped++;
                    continue;
                }

                var existing = await _db.Inventories
                    .FirstOrDefaultAsync(i => i.FacilityId == facility.Id && i.ProductId == product.Id);

                if (existing is null)
                {
                    _db.Inventories.Add(new Inventory
                    {
                        FacilityId = facility.Id,
                        ProductId = product.Id,
                        CurrentStock = row.CurrentStock,
                        ReorderLevel = row.ReorderLevel,
                        BatchNumber = row.BatchNumber,
                        ExpiryDate = row.ExpiryDate,
                        LastUpdated = DateTime.UtcNow
                    });
                    result.Created++;
                }
                else
                {
                    existing.CurrentStock = row.CurrentStock;
                    existing.ReorderLevel = row.ReorderLevel;
                    if (row.BatchNumber is not null) existing.BatchNumber = row.BatchNumber;
                    if (row.ExpiryDate.HasValue) existing.ExpiryDate = row.ExpiryDate;
                    existing.LastUpdated = DateTime.UtcNow;
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Row {index}: Unexpected error — {ex.Message}");
                result.Skipped++;
            }
        }

        await _db.SaveChangesAsync();
        return result;
    }
}
