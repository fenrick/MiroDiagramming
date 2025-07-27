using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage(
    "Usage",
    "MA0165:Make interpolated string",
    Justification = "Serilog message templates require braces, not interpolation.")]
