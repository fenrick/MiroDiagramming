using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage(
    "Usage",
    "MA0165:Make interpolated string",
    Justification = "Serilog message templates require braces, not interpolation.")]
[assembly: SuppressMessage(
    "AsyncUsage",
    "UseAsyncSuffix",
    Justification = "Top-level statements generate a Main method named '<Main>$' without the Async suffix.")]
