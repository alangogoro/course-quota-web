import {
  getSettings,
  countAttended,
  addCourse,
  getAllRecords,
  clearRecords,
  deleteCourseRecord,
  type CourseRecord,
} from "./db/db";
import {
  MAX_COURSE_COUNT_PER_RECORD,
  MAX_NOTE_LENGTH,
  parseNewCourseRecordInput,
} from "./db/courseRecordRules";
import { showSettings } from "./features/settings/index";

type Page = "home" | "history" | "confirm-clear" | "settings";

// Non-null assertion is safe: index.html always includes <main id="app">.
const app = document.querySelector<HTMLElement>("#app") as HTMLElement;

const WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

const CLEAR_PHRASE = "刪除全部上課紀錄";

// ─── Router ──────────────────────────────────────────────────────────────────

async function navigate(page: Page): Promise<void> {
  app.innerHTML = "";
  try {
    switch (page) {
      case "home":
        await showHome();
        break;
      case "history":
        await showHistory();
        break;
      case "confirm-clear":
        showConfirmClear();
        break;
      case "settings":
        await showSettings(app, navigate);
        break;
    }
  } catch (err) {
    console.error("Navigation error:", err);
    app.innerHTML =
      '<p class="text-muted" style="padding:1rem">載入失敗，請重新整理頁面。</p>';
  }
}

// ─── Home ─────────────────────────────────────────────────────────────────────

async function showHome(): Promise<void> {
  const [settings, usedCount] = await Promise.all([
    getSettings(),
    countAttended(),
  ]);

  const pct =
    settings.maxCourseCount > 0
      ? Math.min(100, Math.round((usedCount / settings.maxCourseCount) * 100))
      : 0;

  app.innerHTML = `
    <div class="page">
      <div class="home-header">
        <img
          class="home-header__icon"
          src="icons/table-tennis-home.png"
          alt="桌球拍與球圖示"
        />
        <button class="btn-settings" id="btn-settings" type="button" aria-label="設定">
          ${gearSVG()}
          設定
        </button>
      </div>
      <div class="home-hero">
        <h1 class="home-hero__greeting">嗨，${escHtml(settings.name)}</h1>
        <p class="home-hero__label">已上課堂數</p>
        <p class="home-hero__count" aria-label="已上課 ${usedCount} 堂，目標 ${settings.maxCourseCount} 堂">
          ${usedCount}<span class="home-hero__count-sep">/</span><span class="home-hero__count-max">${settings.maxCourseCount}</span>
        </p>
        <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="進度 ${pct}%">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <p class="home-hero__pct">${pct}%</p>
      </div>
      <div class="btn-stack">
        <button class="btn-primary btn-full" id="btn-add" type="button">新增上課紀錄</button>
        <button class="btn-ghost btn-full" id="btn-history" type="button">查看上課紀錄</button>
      </div>
    </div>
  `;

  app.querySelector("#btn-settings")!.addEventListener("click", () =>
    navigate("settings")
  );
  app.querySelector("#btn-add")!.addEventListener("click", () =>
    openAddRecordModal()
  );
  app.querySelector("#btn-history")!.addEventListener("click", () =>
    navigate("history")
  );
}

// ─── Add Record Modal ────────────────────────────────────────────────────────

function openAddRecordModal(): void {
  const initialDate = selectedDateFromLocalToday();
  const modal = document.createElement("div");
  modal.className = "modal-scrim";
  modal.innerHTML = `
    <section class="modal-card add-record-modal" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
      <h2 class="modal-title" id="add-modal-title">今天是 ${initialDate.month} 月 ${initialDate.day} 日 星期${WEEKDAY_ZH[initialDate.weekday]}</h2>

      <div class="modal-field">
        <p class="modal-label" id="label-date">上課日期</p>
        <div class="date-controls" aria-labelledby="label-date">
          <label class="date-control">
            <span>月份</span>
            <select id="input-month" aria-label="月份">
              ${monthOptionsHTML(initialDate.month)}
            </select>
          </label>
          <label class="date-control">
            <span>日期</span>
            <input id="input-day" type="number" inputmode="numeric" min="1" max="${daysInMonth(initialDate.year, initialDate.month)}" value="${initialDate.day}" aria-label="日期" />
          </label>
        </div>
      </div>

      <div class="modal-field">
        <label class="modal-label" for="input-count">上課人數</label>
        <div class="count-stepper">
          <button class="btn-stepper" id="btn-count-dec" type="button" aria-label="減少上課人數">-</button>
          <input id="input-count" type="number" inputmode="numeric" min="1" max="${MAX_COURSE_COUNT_PER_RECORD}" value="1" aria-describedby="error-count" />
          <button class="btn-stepper" id="btn-count-inc" type="button" aria-label="增加上課人數">+</button>
        </div>
        <p class="field-error" id="error-count" role="alert" aria-live="polite"></p>
      </div>

      <div class="modal-field">
        <label class="modal-label" for="input-note">備註</label>
        <textarea id="input-note" rows="3" aria-describedby="error-note note-hint" placeholder="可留空"></textarea>
        <p class="field-hint" id="note-hint">最多 ${MAX_NOTE_LENGTH} 個字</p>
        <p class="field-error" id="error-note" role="alert" aria-live="polite"></p>
      </div>

      <div class="modal-actions">
        <button class="btn-ghost btn-modal" id="btn-cancel-add" type="button">取消</button>
        <button class="btn-primary btn-modal" id="btn-confirm-add" type="button">確認新增</button>
      </div>
    </section>
  `;

  app.appendChild(modal);

  const title = modal.querySelector<HTMLHeadingElement>("#add-modal-title")!;
  const monthInput = modal.querySelector<HTMLSelectElement>("#input-month")!;
  const dayInput = modal.querySelector<HTMLInputElement>("#input-day")!;
  const countInput = modal.querySelector<HTMLInputElement>("#input-count")!;
  const noteInput = modal.querySelector<HTMLTextAreaElement>("#input-note")!;
  const countError = modal.querySelector<HTMLParagraphElement>("#error-count")!;
  const noteError = modal.querySelector<HTMLParagraphElement>("#error-note")!;
  const confirmBtn = modal.querySelector<HTMLButtonElement>("#btn-confirm-add")!;
  const cancelBtn = modal.querySelector<HTMLButtonElement>("#btn-cancel-add")!;

  let selectedDate = initialDate;

  const closeModal = () => {
    document.removeEventListener("keydown", onKeyDown);
    modal.remove();
    app.querySelector<HTMLButtonElement>("#btn-add")?.focus();
  };

  const syncSelectedDate = () => {
    const month = clampNumber(Number(monthInput.value), 1, 12);
    const maxDay = daysInMonth(selectedDate.year, month);
    const day = clampNumber(Number(dayInput.value), 1, maxDay);
    selectedDate = selectedDateFromParts(selectedDate.year, month, day);
    dayInput.max = String(maxDay);
    dayInput.value = String(selectedDate.day);
    title.textContent = `今天是 ${selectedDate.month} 月 ${selectedDate.day} 日 星期${WEEKDAY_ZH[selectedDate.weekday]}`;
  };

  const validate = () => {
    const parsed = parseNewCourseRecordInput({
      attendedDate: selectedDate.iso,
      weekday: selectedDate.weekday,
      count: countInput.value,
      note: noteInput.value,
    });

    countError.textContent = parsed.ok ? "" : parsed.errors.count ?? "";
    noteError.textContent = parsed.ok ? "" : parsed.errors.note ?? "";
    countInput.setAttribute("aria-invalid", String(!parsed.ok && Boolean(parsed.errors.count)));
    noteInput.setAttribute("aria-invalid", String(!parsed.ok && Boolean(parsed.errors.note)));
    confirmBtn.disabled = !parsed.ok;
    return parsed;
  };

  const stepCount = (delta: number) => {
    const current = Number(countInput.value);
    const next = clampNumber(
      Number.isFinite(current) ? current + delta : 1,
      1,
      MAX_COURSE_COUNT_PER_RECORD
    );
    countInput.value = String(next);
    validate();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") closeModal();
  };

  monthInput.addEventListener("change", () => {
    syncSelectedDate();
    validate();
  });
  dayInput.addEventListener("change", () => {
    syncSelectedDate();
    validate();
  });
  dayInput.addEventListener("input", () => {
    syncSelectedDate();
    validate();
  });
  countInput.addEventListener("input", validate);
  noteInput.addEventListener("input", validate);
  modal.querySelector("#btn-count-dec")!.addEventListener("click", () => stepCount(-1));
  modal.querySelector("#btn-count-inc")!.addEventListener("click", () => stepCount(1));
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", onKeyDown);

  confirmBtn.addEventListener("click", async () => {
    syncSelectedDate();
    const parsed = validate();
    if (!parsed.ok) return;
    confirmBtn.disabled = true;
    await addCourse(
      selectedDate.iso,
      selectedDate.weekday,
      parsed.record.count,
      parsed.record.note
    );
    await navigate("home");
  });

  validate();
  monthInput.focus();
}

// ─── History ──────────────────────────────────────────────────────────────────

async function showHistory(): Promise<void> {
  const records = await getAllRecords();

  const listHTML =
    records.length === 0
      ? '<p class="text-muted">尚無上課紀錄。</p>'
      : `<ul class="record-list" aria-label="上課紀錄列表">${records.map(recordItemHTML).join("")}</ul>`;

  app.innerHTML = `
    <div class="page">
      <div class="page-nav">
        <button class="btn-back-nav" id="btn-back" type="button" aria-label="返回首頁">
          ${chevronLeftSVG()}
          返回
        </button>
        <h1 class="page-title">上課紀錄</h1>
      </div>
      <div class="history-meta">
        <span class="history-count">共 ${records.length} 筆</span>
        <button class="btn-danger-ghost" id="btn-clear-entry" type="button">
          ${trashSVG()}
          清空紀錄
        </button>
      </div>
      ${listHTML}
    </div>
  `;

  app.querySelector("#btn-back")!.addEventListener("click", () =>
    navigate("home")
  );
  app.querySelector("#btn-clear-entry")!.addEventListener("click", () =>
    navigate("confirm-clear")
  );
  setupRecordSwipeHandlers(records);
}

function recordItemHTML(r: CourseRecord): string {
  const { dateStr, weekStr } = formatRecordDateParts(r);
  const note = r.note.trim();
  const noteHTML = note
    ? `<p class="record-item__note">${escHtml(note)}</p>`
    : "";
  return `
    <li class="record-swipe" data-course-number="${r.courseNumber}">
      <button class="record-delete-action" type="button" aria-label="刪除 ${dateStr} ${weekStr} ${r.count}人">刪除</button>
      <div class="record-item">
        <div class="record-item__top">
          <div class="record-item__date">${dateStr} ${weekStr}</div>
          <div class="record-item__badge badge--count">${r.count}人</div>
        </div>
        ${noteHTML}
      </div>
    </li>
  `;
}

function setupRecordSwipeHandlers(records: CourseRecord[]): void {
  const rows = Array.from(app.querySelectorAll<HTMLLIElement>(".record-swipe"));
  const recordsByNumber = new Map(
    records.map((record) => [record.courseNumber, record])
  );
  let openRow: HTMLLIElement | null = null;

  const closeRow = (row: HTMLLIElement) => {
    row.classList.remove("is-open");
    if (openRow === row) openRow = null;
  };

  const openSelectedRow = (row: HTMLLIElement) => {
    if (openRow && openRow !== row) closeRow(openRow);
    row.classList.add("is-open");
    openRow = row;
  };

  for (const row of rows) {
    const card = row.querySelector<HTMLElement>(".record-item");
    if (!card) continue;

    let startX = 0;
    let startY = 0;
    let pointerId: number | null = null;

    card.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startY = event.clientY;
      pointerId = event.pointerId;
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointerup", (event) => {
      if (pointerId !== event.pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      pointerId = null;

      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (deltaX < -48) {
        openSelectedRow(row);
      } else if (deltaX > 24) {
        closeRow(row);
      }
    });

    card.addEventListener("pointercancel", () => {
      pointerId = null;
    });

    row
      .querySelector<HTMLButtonElement>(".record-delete-action")
      ?.addEventListener("click", () => {
        const courseNumber = Number(row.dataset.courseNumber);
        const record = recordsByNumber.get(courseNumber);
        if (record) openDeleteRecordModal(record);
      });
  }
}

function openDeleteRecordModal(record: CourseRecord): void {
  const { dateStr, weekStr } = formatRecordDateParts(record);
  const note = record.note.trim();
  const modal = document.createElement("div");
  modal.className = "modal-scrim";
  modal.innerHTML = `
    <section class="modal-card delete-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <h2 class="modal-title" id="delete-modal-title">確定刪除這筆上課紀錄？</h2>
      <div class="delete-record-summary">
        <p>${dateStr} ${weekStr}・${record.count}人</p>
        ${note ? `<p class="delete-record-note">${escHtml(note)}</p>` : ""}
      </div>
      <div class="modal-actions">
        <button class="btn-ghost btn-modal" id="btn-cancel-delete" type="button">取消</button>
        <button class="btn-danger btn-modal" id="btn-confirm-delete" type="button">刪除</button>
      </div>
    </section>
  `;

  app.appendChild(modal);

  const closeModal = () => {
    document.removeEventListener("keydown", onKeyDown);
    modal.remove();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") closeModal();
  };

  modal.querySelector("#btn-cancel-delete")!.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", onKeyDown);

  const confirmBtn =
    modal.querySelector<HTMLButtonElement>("#btn-confirm-delete")!;
  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    await deleteCourseRecord(record.courseNumber);
    await navigate("history");
  });

  modal.querySelector<HTMLButtonElement>("#btn-cancel-delete")?.focus();
}

// ─── Confirm Clear ────────────────────────────────────────────────────────────

function showConfirmClear(): void {
  app.innerHTML = `
    <div class="page">
      <div class="page-nav">
        <button class="btn-back-nav" id="btn-cancel-clear" type="button" aria-label="取消並返回">
          ${chevronLeftSVG()}
          取消
        </button>
        <h1 class="page-title">清空紀錄</h1>
      </div>
      <div class="warning-card" role="alert">
        <p class="warning-card__title">此操作無法復原</p>
        <p class="warning-card__body">清空後，所有上課紀錄將永久刪除，無法找回。</p>
      </div>
      <div>
        <p class="confirm-phrase__label">輸入以下文字以解鎖清空：</p>
        <p class="phrase-hint" aria-hidden="true">刪除全部上課紀錄</p>
        <input
          type="text"
          id="input-phrase"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="在此輸入確認文字"
          aria-label="輸入「刪除全部上課紀錄」以確認"
        />
      </div>
      <button class="btn-danger btn-full" id="btn-do-clear" type="button" disabled>清空全部紀錄</button>
    </div>
  `;

  const input = app.querySelector<HTMLInputElement>("#input-phrase")!;
  const clearBtn = app.querySelector<HTMLButtonElement>("#btn-do-clear")!;

  input.addEventListener("input", () => {
    clearBtn.disabled = input.value.normalize("NFC") !== CLEAR_PHRASE;
  });

  app.querySelector("#btn-cancel-clear")!.addEventListener("click", () =>
    navigate("history")
  );

  clearBtn.addEventListener("click", async () => {
    if (input.value.normalize("NFC") !== CLEAR_PHRASE) return;
    clearBtn.disabled = true;
    input.disabled = true;
    await clearRecords();
    navigate("home");
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

interface SelectedDate {
  year: number;
  month: number;
  day: number;
  weekday: number;
  iso: string;
}

function selectedDateFromLocalToday(): SelectedDate {
  const today = new Date();
  return selectedDateFromParts(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
}

function selectedDateFromParts(
  year: number,
  monthValue: number,
  dayValue: number
): SelectedDate {
  const month = clampNumber(monthValue, 1, 12);
  const day = clampNumber(dayValue, 1, daysInMonth(year, month));
  const date = new Date(year, month - 1, day);
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");

  return {
    year,
    month,
    day,
    weekday: date.getDay(),
    iso: `${year}-${paddedMonth}-${paddedDay}`,
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function monthOptionsHTML(selectedMonth: number): string {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const selected = month === selectedMonth ? " selected" : "";
    return `<option value="${month}"${selected}>${month} 月</option>`;
  }).join("");
}

function formatRecordDateParts(record: CourseRecord): {
  dateStr: string;
  weekStr: string;
} {
  const month = parseInt(record.attendedDate.slice(5, 7), 10);
  const day = parseInt(record.attendedDate.slice(8, 10), 10);
  return {
    dateStr: `${month}月${day}日`,
    weekStr: `星期${WEEKDAY_ZH[record.weekday]}`,
  };
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chevronLeftSVG(): string {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path d="M12 15l-5-5 5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function gearSVG(): string {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function trashSVG(): string {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

navigate("home");
