import type {
  AnyValue,
  KeyValue,
} from "../opentelemetry/proto/common/v1/common";

// Define a JSON‑friendly value type
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonRecord;

// A record/map whose values are JSON‑friendly
export interface JsonRecord {
  [key: string]: JsonValue;
}

// Converts an array of KeyValue pairs into a JSON record
export function otelAttributesToRecord<T extends JsonRecord>(
  attributes: KeyValue[],
): T {
  const record: JsonRecord = {};
  for (const { key, value } of attributes) {
    record[key] = toJsonValue(value);
  }
  return record as T;
}

// Recursively convert AnyValue into a JsonValue, ignoring bytesValue
function toJsonValue(value?: AnyValue): JsonValue {
  if (!value) {
    return null;
  }
  if (value.stringValue !== undefined) {
    return value.stringValue;
  }
  if (value.boolValue !== undefined) {
    return value.boolValue;
  }
  if (value.intValue !== undefined) {
    return value.intValue;
  }
  if (value.doubleValue !== undefined) {
    return value.doubleValue;
  }
  if (value.arrayValue !== undefined) {
    return value.arrayValue.values.map(toJsonValue);
  }
  if (value.kvlistValue !== undefined) {
    return otelAttributesToRecord(value.kvlistValue.values);
  }
  // bytesValue is intentionally ignored
  return null;
}
