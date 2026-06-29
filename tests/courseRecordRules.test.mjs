import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_COURSE_COUNT_PER_RECORD,
  MAX_NOTE_LENGTH,
  migrateLegacyRecords,
  normalizeCourseRecord,
  parseNewCourseRecordInput,
  sumAttendedCounts,
} from "../.tmp/test-dist/courseRecordRules.js";

describe("course record data rules", () => {
  it("normalizes records to the agreed course-only fields and falls back invalid count to 1", () => {
    const record = normalizeCourseRecord({
      courseNumber: 4,
      attended: true,
      attendedDate: "2026-06-29",
      weekday: 1,
      note: "  教練代課  ",
      count: 0,
      name: "Cindy",
      maxCourseCount: 100,
    });

    assert.deepEqual(Object.keys(record).sort(), [
      "attended",
      "attendedDate",
      "count",
      "courseNumber",
      "note",
      "weekday",
    ]);
    assert.equal(record.count, 1);
    assert.equal(record.note, "教練代課");
  });

  it("validates new count and note input boundaries", () => {
    for (const count of [1, 2, MAX_COURSE_COUNT_PER_RECORD]) {
      const result = parseNewCourseRecordInput({
        attendedDate: "2026-06-29",
        weekday: 1,
        count,
        note: "A".repeat(MAX_NOTE_LENGTH),
      });

      assert.equal(result.ok, true);
      assert.equal(result.ok && result.record.count, count);
      assert.equal(result.ok && result.record.note.length, MAX_NOTE_LENGTH);
    }

    for (const count of ["", 0, 11, 1.5, Number.NaN]) {
      const result = parseNewCourseRecordInput({
        attendedDate: "2026-06-29",
        weekday: 1,
        count,
        note: "",
      });

      assert.equal(result.ok, false);
      assert.equal(!result.ok && result.errors.count, "請輸入 1 到 10 之間的整數");
    }

    const tooLong = parseNewCourseRecordInput({
      attendedDate: "2026-06-29",
      weekday: 1,
      count: 1,
      note: "字".repeat(MAX_NOTE_LENGTH + 1),
    });

    assert.equal(tooLong.ok, false);
    assert.equal(!tooLong.ok && tooLong.errors.note, "備註最多 50 個字");
  });

  it("sums attended count values without capping at the course target", () => {
    assert.equal(
      sumAttendedCounts([
        { courseNumber: 1, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "", count: 1 },
        { courseNumber: 2, attended: true, attendedDate: "2026-06-30", weekday: 2, note: "", count: 3 },
      ]),
      4
    );

    assert.equal(
      sumAttendedCounts([
        { courseNumber: 1, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" },
        { courseNumber: 2, attended: true, attendedDate: "2026-06-30", weekday: 2, note: "", count: 2 },
      ]),
      3
    );

    const ninetyNineCounts = Array.from({ length: 33 }, (_, index) => ({
      courseNumber: index + 1,
      attended: true,
      attendedDate: "2026-06-29",
      weekday: 1,
      note: "",
      count: 3,
    }));

    assert.equal(
      sumAttendedCounts([
        ...ninetyNineCounts,
        { courseNumber: 34, attended: true, attendedDate: "2026-06-30", weekday: 2, note: "", count: 3 },
      ]),
      102
    );
  });

  it("migrates a single same-date legacy record to count one", () => {
    const migration = migrateLegacyRecords([
      { courseNumber: 4, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" },
    ]);

    assert.deepEqual(migration.recordsToDelete, []);
    assert.deepEqual(migration.recordsToPut, [
      { courseNumber: 4, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "", count: 1 },
    ]);
  });

  it("folds same-day legacy records into the highest courseNumber representative", () => {
    const migration = migrateLegacyRecords([
      { courseNumber: 4, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" },
      { courseNumber: 5, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" },
    ]);

    assert.deepEqual(migration.recordsToDelete, [4]);
    assert.deepEqual(migration.recordsToPut, [
      { courseNumber: 5, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "", count: 2 },
    ]);
  });

  it("splits over-ten same-day legacy records into capped chunks", () => {
    const legacyRecords = Array.from({ length: 12 }, (_, index) => ({
      courseNumber: index + 1,
      attended: true,
      attendedDate: "2026-06-29",
      weekday: 1,
      note: "",
    }));

    const migration = migrateLegacyRecords(legacyRecords);

    assert.deepEqual(
      migration.recordsToPut.map((record) => [record.courseNumber, record.count]),
      [
        [10, 10],
        [12, 2],
      ]
    );
    assert.equal(migration.recordsToPut.every((record) => record.count <= MAX_COURSE_COUNT_PER_RECORD), true);
    assert.deepEqual(migration.recordsToDelete, [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);
  });

  it("combines same-day legacy notes deterministically within fifty characters", () => {
    const migration = migrateLegacyRecords([
      { courseNumber: 1, attended: true, attendedDate: "2026-06-29", weekday: 1, note: " A " },
      { courseNumber: 2, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "B" },
      { courseNumber: 3, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "A" },
    ]);

    assert.deepEqual(migration.recordsToPut, [
      { courseNumber: 3, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "A；B", count: 3 },
    ]);
    assert.equal(Array.from(migration.recordsToPut[0].note).length <= MAX_NOTE_LENGTH, true);
  });
});
