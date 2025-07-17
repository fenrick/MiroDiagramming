using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Fenrick.Miro.Api;
using Xunit;

namespace Fenrick.Miro.Api.Tests;

public class ClientLogEntryModelTests
{
    [Fact]
    public void Validation_Succeeds_WithRequiredFields()
    {
        var entry = new ClientLogEntry(DateTime.UtcNow, "info", "msg", new Dictionary<string, string>());
        var ctx = new ValidationContext(entry);
        Validator.ValidateObject(entry, ctx, validateAllProperties: true);
    }
}
