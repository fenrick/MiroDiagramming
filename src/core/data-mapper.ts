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
 * Build a metadata object for the provided row. Always includes a `rowId`
 * derived from either the `idColumn` or the row index.
 */
export function buildMetadata(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  index: number,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  if (mapping.textColumn && row[mapping.textColumn] != null) {
    metadata.text = row[mapping.textColumn];
  }
  const extra = mapping.metadataColumns ?? {};
  Object.entries(extra).forEach(([key, col]) => {
    const value = row[col];
    if (value != null) metadata[key] = value;
  });
  const idVal = mapping.idColumn ? row[mapping.idColumn] : undefined;
  metadata.rowId = idVal != null ? String(idVal) : String(index);
  return metadata;
}

/**
 * Resolve identifier, label and type values from the given row.
 */
export function resolveIdLabelType(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  index: number,
): { id: string; label: string; type: string } {
  const idVal = mapping.idColumn ? row[mapping.idColumn] : undefined;
  const labelVal = mapping.labelColumn ? row[mapping.labelColumn] : undefined;
  const typeVal = mapping.templateColumn
    ? row[mapping.templateColumn]
    : undefined;
  return {
    id: idVal != null ? String(idVal) : String(index),
    label: labelVal != null ? String(labelVal) : '',
    type: typeVal != null ? String(typeVal) : 'default',
  };
}

/**
 * Convert an array of Excel rows into {@link NodeDefinition} objects.
 *
 * @param rows - Parsed rows from {@link ExcelLoader}.
 * @param mapping - Column mapping configuration.
 */
export function mapRowToNode(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  index: number,
): NodeDefinition {
  const { id, label, type } = resolveIdLabelType(row, mapping, index);
  const metadata = buildMetadata(row, mapping, index);
  return { id, label, type, metadata };
}

export function mapRowsToNodes(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping,
): NodeDefinition[] {
  return rows.map((row, index) => mapRowToNode(row, mapping, index));
}

/**
 * Convert an array of Excel rows into {@link CardDefinition} objects.
 *
 * @param rows - Parsed rows from {@link ExcelLoader}.
 * @param mapping - Column mapping configuration.
 */
export function mapRowToCard(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
): CardDefinition {
  const card: CardDefinition = { title: '' };
  if (mapping.labelColumn && row[mapping.labelColumn] != null) {
    card.title = String(row[mapping.labelColumn]);
  }
  if (mapping.idColumn && row[mapping.idColumn] != null) {
    card.id = String(row[mapping.idColumn]);
  }
  if (mapping.textColumn && row[mapping.textColumn] != null) {
    card.description = String(row[mapping.textColumn]);
  }
  if (mapping.templateColumn && row[mapping.templateColumn] != null) {
    card.style = { cardTheme: String(row[mapping.templateColumn]) };
  }
  return card;
}

export function mapRowsToCards(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping,
): CardDefinition[] {
  return rows.map((row) => mapRowToCard(row, mapping));
}
