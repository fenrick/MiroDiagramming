namespace Fenrick.Miro.Server.Resources;

/// <summary>
///     Constant log messages for server components.
/// </summary>
internal static class LogMessages
{
    public const string LoadingWorkbook = "Loading workbook";
    public const string WorkbookLoaded = "Workbook loaded with {0} sheets";
    public const string ListingSheets = "Listing sheets";
    public const string ListingTables = "Listing named tables";
    public const string LoadingSheet = "Loading sheet {0}";
    public const string LoadingTable = "Loading table {0}";
    public const string StreamingSheet = "Streaming sheet {0}";
    public const string StreamingTable = "Streaming table {0}";
    public const string WorkbookNotLoaded = "Workbook not loaded";
    public const string UnknownSheet = "Unknown sheet: {0}";
    public const string UnknownTable = "Unknown table: {0}";
    public const string MissingSheetForTable = "Missing sheet for table: {0}";
    public const string DisposingWorkbook = "Disposing workbook";
}
