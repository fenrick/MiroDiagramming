namespace Fenrick.Miro.Server.Resources;

/// <summary>
///     Constant log messages for server components.
/// </summary>
internal static class LogMessages
{
    public const string LoadingWorkbook = $"Loading workbook";

    public const string WorkbookLoaded = $"Workbook loaded with {{SheetCount}} sheets";

    public const string ListingSheets = $"Listing sheets";
    public const string ListingTables = $"Listing named tables";
    public const string LoadingSheet = $"Loading sheet {{SheetName}}";
    public const string LoadingTable = $"Loading table {{TableName}}";
    public const string StreamingSheet = $"Streaming sheet {{SheetName}}";
    public const string StreamingTable = $"Streaming table {{TableName}}";
    public const string WorkbookNotLoaded = $"Workbook not loaded";
    public const string UnknownSheet = $"Unknown sheet: {{SheetName}}";
    public const string UnknownTable = $"Unknown table: {{TableName}}";

    public const string MissingSheetForTable = $"Missing sheet for table: {{TableName}}";

    public const string DisposingWorkbook = $"Disposing workbook";
}
