/**
 * Mapping configuration describing column headers for various fields.
 */
export interface ColumnMapping {
  /** Column used for the optional unique identifier. */
  idColumn?: string;
  /** Column providing the template or type value. */
  templateColumn?: string;
  /** Column containing the node label or card title. */
  labelColumn?: string;
  /** Column used for free form text such as descriptions. */
  textColumn?: string;
  /** Mapping of metadata keys to column headers. */
  metadataColumns?: Record<string, string>;
}

export interface NodeDefinition {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface CardDefinition {
  id?: string;
  title: string;
  description?: string;
  style?: { cardTheme?: string };
}

/**
 * Convert an array of Excel rows into {@link NodeDefinition} objects.
 *
 * @param rows - Parsed rows from {@link ExcelLoader}.
 * @param mapping - Column mapping configuration.
 */
export function mapRowsToNodes(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping,
): NodeDefinition[] {
  return rows.map((row, index) => {
    const metadata: Record<string, unknown> = {};
    if (mapping.textColumn && row[mapping.textColumn] != null) {
      metadata.text = row[mapping.textColumn];
    }
    const metaCols = mapping.metadataColumns ?? {};
    Object.keys(metaCols).forEach((key) => {
      const col = metaCols[key];
      const value = row[col];
      if (value != null) metadata[key] = value;
    });
    const idVal = mapping.idColumn ? row[mapping.idColumn] : undefined;
    const typeVal = mapping.templateColumn
      ? row[mapping.templateColumn]
      : undefined;
    const labelVal = mapping.labelColumn ? row[mapping.labelColumn] : undefined;
    return {
      id: idVal != null ? String(idVal) : String(index),
      label: labelVal != null ? String(labelVal) : '',
      type: typeVal != null ? String(typeVal) : 'default',
      metadata: Object.keys(metadata).length ? metadata : undefined,
    };
  });
}

/**
 * Convert an array of Excel rows into {@link CardDefinition} objects.
 *
 * @param rows - Parsed rows from {@link ExcelLoader}.
 * @param mapping - Column mapping configuration.
 */
export function mapRowsToCards(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping,
): CardDefinition[] {
  return rows.map((row) => {
    const idVal = mapping.idColumn ? row[mapping.idColumn] : undefined;
    const titleVal = mapping.labelColumn ? row[mapping.labelColumn] : undefined;
    const descVal = mapping.textColumn ? row[mapping.textColumn] : undefined;
    const themeVal = mapping.templateColumn
      ? row[mapping.templateColumn]
      : undefined;
    const card: CardDefinition = {
      title: titleVal != null ? String(titleVal) : '',
    };
    if (idVal != null) card.id = String(idVal);
    if (descVal != null) card.description = String(descVal);
    if (themeVal != null) card.style = { cardTheme: String(themeVal) };
    return card;
  });
}
