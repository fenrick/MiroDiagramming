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
 * Add a property to the target object when the provided value is defined.
 *
 * @param target - Object to modify.
 * @param key - Property key.
 * @param value - Value to assign if defined.
 */
function assignIfDefined<T extends object, K extends PropertyKey, V>(
  target: T,
  key: K,
  value: V | undefined,
): void {
  if (value != null) {
    (target as Record<PropertyKey, V>)[key] = value;
  }
}

/**
 * Retrieve a cell value from a row based on the provided column header.
 *
 * @param row - Data row parsed from Excel.
 * @param column - Column header to read.
 * @returns The cell value or `undefined` when no column is mapped.
 */
function readColumn(row: Record<string, unknown>, column?: string): unknown {
  return column ? row[column] : undefined;
}

/**
 * Convert an array of Excel rows into {@link NodeDefinition} objects.
 *
 * @param rows - Parsed rows from {@link ExcelLoader}.
 * @param mapping - Column mapping configuration.
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
  const idVal = readColumn(row, mapping.idColumn);
  const titleVal = readColumn(row, mapping.labelColumn);
  const descVal = readColumn(row, mapping.textColumn);
  const themeVal = readColumn(row, mapping.templateColumn);
  const card: CardDefinition = {
    title: titleVal != null ? String(titleVal) : '',
  };
  assignIfDefined(card, 'id', idVal != null ? String(idVal) : undefined);
  assignIfDefined(
    card,
    'description',
    descVal != null ? String(descVal) : undefined,
  );
  assignIfDefined(
    card,
    'style',
    themeVal != null ? { cardTheme: String(themeVal) } : undefined,
  );
  return card;
}

export function mapRowsToCards(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping,
): CardDefinition[] {
  return rows.map((row) => mapRowToCard(row, mapping));
}
