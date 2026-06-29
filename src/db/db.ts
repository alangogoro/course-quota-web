import {
  migrateLegacyRecords,
  normalizeCourseRecord,
  parseNewCourseRecordInput,
  sumAttendedCounts,
  type CourseRecord,
  type CourseRecordLike,
} from "./courseRecordRules";

const DB_NAME = "course-tracker";
const DB_VERSION = 2;

export interface Settings {
  key: "singleton";
  name: string;
  maxCourseCount: number;
}

interface SequenceEntry {
  key: "sequence";
  value: number;
}

export type { CourseRecord } from "./courseRecordRules";

let _db: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (_db) return _db;
  _db = await openDB();
  await seedIfNeeded(_db);
  return _db;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("records")) {
        db.createObjectStore("records", { keyPath: "courseNumber" });
      }
      migrateLegacyRecordsIfNeeded(req.transaction);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function migrateLegacyRecordsIfNeeded(tx: IDBTransaction | null): void {
  if (!tx) return;

  const store = tx.objectStore("records");
  const readReq = store.getAll();
  readReq.onsuccess = () => {
    const migration = migrateLegacyRecords(readReq.result as CourseRecordLike[]);

    for (const courseNumber of migration.recordsToDelete) {
      store.delete(courseNumber);
    }

    for (const record of migration.recordsToPut) {
      store.put(record);
    }
  };
}

// Seeds settings on first open; no-op if singleton already exists.
function seedIfNeeded(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    const check = store.get("singleton");
    check.onsuccess = () => {
      if (!check.result) {
        store.put({ key: "singleton", name: "Cindy", maxCourseCount: 100 } as Settings);
        // sequence.value is the LAST ASSIGNED courseNumber; 0 means none assigned yet.
        store.put({ key: "sequence", value: 0 } as SequenceEntry);
      }
    };
    check.onerror = () => reject(check.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readonly");
    const req = tx.objectStore("settings").get("singleton");
    req.onsuccess = () => resolve(req.result as Settings);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSettings(name: string, maxCourseCount: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    tx.objectStore("settings").put({ key: "singleton", name, maxCourseCount } as Settings);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function countAttended(): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readonly");
    const req = tx.objectStore("records").getAll();
    req.onsuccess = () => {
      resolve(sumAttendedCounts(req.result as CourseRecordLike[]));
    };
    req.onerror = () => reject(req.error);
  });
}

// Atomic: reads sequence, writes record with sequence+1, updates sequence. All in one transaction.
export async function addCourse(
  attendedDate: string,
  weekday: number,
  count: unknown = 1,
  note: unknown = ""
): Promise<void> {
  const parsed = parseNewCourseRecordInput({
    attendedDate,
    weekday,
    count,
    note,
  });
  if (!parsed.ok) {
    throw new Error(Object.values(parsed.errors).filter(Boolean).join("；"));
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["settings", "records"], "readwrite");
    const settingsStore = tx.objectStore("settings");
    const recordsStore = tx.objectStore("records");
    const seqReq = settingsStore.get("sequence");
    seqReq.onsuccess = () => {
      const seq = seqReq.result as SequenceEntry;
      const courseNumber = seq.value + 1;
      recordsStore.put({
        courseNumber,
        ...parsed.record,
      } as CourseRecord);
      settingsStore.put({ key: "sequence", value: courseNumber } as SequenceEntry);
    };
    seqReq.onerror = () => reject(seqReq.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllRecords(): Promise<CourseRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readonly");
    const req = tx.objectStore("records").getAll();
    req.onsuccess = () => {
    const records = (req.result as CourseRecord[]).sort(
      (a, b) => b.courseNumber - a.courseNumber
    ).map(normalizeCourseRecord);
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

// Clears records store only. settings (name, maxCourseCount, sequence) are untouched.
export async function clearRecords(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readwrite");
    tx.objectStore("records").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCourseRecord(courseNumber: number): Promise<void> {
  if (!Number.isInteger(courseNumber) || courseNumber < 1) {
    throw new Error("courseNumber must be a positive integer");
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readwrite");
    tx.objectStore("records").delete(courseNumber);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
