export const MAX_COURSE_COUNT_PER_RECORD = 10;
export const MAX_NOTE_LENGTH = 50;

export interface CourseRecord {
  courseNumber: number;
  attended: boolean;
  attendedDate: string;
  weekday: number;
  count: number;
  note: string;
}

export interface CourseRecordLike {
  courseNumber: number;
  attended: boolean;
  attendedDate: string;
  weekday: number;
  count?: unknown;
  note?: unknown;
}

export interface NewCourseRecordInput {
  attendedDate: string;
  weekday: number;
  count: unknown;
  note: unknown;
}

export type ParsedNewCourseRecordInput =
  | {
      ok: true;
      record: Omit<CourseRecord, "courseNumber">;
    }
  | {
      ok: false;
      errors: {
        count?: string;
        note?: string;
      };
    };

export interface LegacyMigrationPlan {
  recordsToPut: CourseRecord[];
  recordsToDelete: number[];
}

export function isValidCourseCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_COURSE_COUNT_PER_RECORD
  );
}

export function normalizeCourseRecord(record: CourseRecordLike): CourseRecord {
  const count = isValidCourseCount(record.count) ? record.count : 1;

  return {
    courseNumber: record.courseNumber,
    attended: record.attended,
    attendedDate: record.attendedDate,
    weekday: record.weekday,
    count,
    note: normalizeNote(record.note),
  };
}

export function parseNewCourseRecordInput(
  input: NewCourseRecordInput
): ParsedNewCourseRecordInput {
  const errors: { count?: string; note?: string } = {};
  const count = parseCountInput(input.count);
  const note = normalizeNote(input.note);

  if (!isValidCourseCount(count)) {
    errors.count = "請輸入 1 到 10 之間的整數";
  }

  if (userPerceivedLength(note) > MAX_NOTE_LENGTH) {
    errors.note = "備註最多 50 個字";
  }

  if (errors.count || errors.note) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    record: {
      attended: true,
      attendedDate: input.attendedDate,
      weekday: input.weekday,
      count,
      note,
    },
  };
}

export function sumAttendedCounts(records: readonly CourseRecordLike[]): number {
  return records.reduce((total, record) => {
    if (!record.attended) return total;
    return total + normalizeCourseRecord(record).count;
  }, 0);
}

export function migrateLegacyRecords(
  records: readonly CourseRecordLike[]
): LegacyMigrationPlan {
  const groups = new Map<string, CourseRecordLike[]>();

  for (const record of records) {
    if (isValidCourseCount(record.count)) continue;
    const currentGroup = groups.get(record.attendedDate) ?? [];
    currentGroup.push(record);
    groups.set(record.attendedDate, currentGroup);
  }

  const recordsToPut: CourseRecord[] = [];
  const recordsToDelete: number[] = [];

  for (const group of groups.values()) {
    const sortedGroup = [...group].sort(
      (a, b) => a.courseNumber - b.courseNumber
    );

    for (
      let chunkStart = 0;
      chunkStart < sortedGroup.length;
      chunkStart += MAX_COURSE_COUNT_PER_RECORD
    ) {
      const chunk = sortedGroup.slice(
        chunkStart,
        chunkStart + MAX_COURSE_COUNT_PER_RECORD
      );
      const representative = chunk[chunk.length - 1];
      if (!representative) continue;

      for (const record of chunk) {
        if (record.courseNumber !== representative.courseNumber) {
          recordsToDelete.push(record.courseNumber);
        }
      }

      recordsToPut.push({
        courseNumber: representative.courseNumber,
        attended: representative.attended,
        attendedDate: representative.attendedDate,
        weekday: representative.weekday,
        note: combineLegacyNotes(chunk),
        count: chunk.length,
      });
    }
  }

  recordsToPut.sort((a, b) => a.courseNumber - b.courseNumber);
  recordsToDelete.sort((a, b) => a - b);

  return { recordsToPut, recordsToDelete };
}

function parseCountInput(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue === "") return Number.NaN;
    return Number(trimmedValue);
  }
  return Number.NaN;
}

function normalizeNote(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function combineLegacyNotes(records: readonly CourseRecordLike[]): string {
  const notes: string[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const note = normalizeNote(record.note);
    if (note === "" || seen.has(note)) continue;
    notes.push(note);
    seen.add(note);
  }

  return trimToUserPerceivedLength(notes.join("；"), MAX_NOTE_LENGTH);
}

function trimToUserPerceivedLength(value: string, maxLength: number): string {
  const characters = userPerceivedCharacters(value);
  return characters.length <= maxLength
    ? value
    : characters.slice(0, maxLength).join("");
}

function userPerceivedLength(value: string): number {
  return userPerceivedCharacters(value).length;
}

function userPerceivedCharacters(value: string): string[] {
  const segmenter = getSegmenter();
  if (!segmenter) return Array.from(value);
  return Array.from(segmenter.segment(value), (segment) => segment.segment);
}

function getSegmenter():
  | { segment(value: string): Iterable<{ segment: string }> }
  | undefined {
  type SegmenterConstructor = new (
    locale?: string,
    options?: { granularity?: "grapheme" }
  ) => { segment(value: string): Iterable<{ segment: string }> };

  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterConstructor })
    .Segmenter;
  return Segmenter ? new Segmenter("zh-Hant", { granularity: "grapheme" }) : undefined;
}
