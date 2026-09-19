import { Timestamp } from "firebase-admin/firestore";
import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";

export function docToObject<T>(
  snap: DocumentSnapshot | QueryDocumentSnapshot
): T {
  const data = snap.data() ?? {};
  const result: Record<string, unknown> = { id: snap.id };
  for (const [key, value] of Object.entries(data)) {
    result[key] = value instanceof Timestamp ? value.toDate().toISOString() : value;
  }
  return result as T;
}
