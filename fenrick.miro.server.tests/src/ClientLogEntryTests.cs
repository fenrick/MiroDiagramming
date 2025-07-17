using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Fenrick.Miro.Api;
using Xunit;

namespace Fenrick.Miro.Server.Tests;

public class ClientLogEntryTests
{
    [Fact]
    public void Validation_Fails_WhenMissingRequiredFields()
    {
        var entry = new ClientLogEntry(DateTime.UtcNow, null!, "msg", null);
        var ctx = new ValidationContext(entry);
        var results = new List<ValidationResult>();

        var valid = Validator.TryValidateObject(entry, ctx, results, true);

        Assert.False(valid);
        Assert.NotEmpty(results);
    }

    [Fact]
    public void Validation_Succeeds_WithAllFields()
    {
        var entry = new ClientLogEntry(DateTime.UtcNow, "info", "msg", null);
        var ctx = new ValidationContext(entry);
        var results = new List<ValidationResult>();

        var valid = Validator.TryValidateObject(entry, ctx, results, true);

        Assert.True(valid);
        Assert.Empty(results);
    }
}
