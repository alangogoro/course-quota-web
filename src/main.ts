import {
  getSettings,
  countAttended,
  addCourse,
  getAllRecords,
  clearRecords,
  type CourseRecord,
} from "./db/db";
import { showSettings } from "./features/settings/index";

type Page = "home" | "confirm-add" | "history" | "confirm-clear" | "settings";

// Non-null assertion is safe: index.html always includes <main id="app">.
const app = document.querySelector<HTMLElement>("#app") as HTMLElement;

const WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

// Captured once when navigating to confirm-add to keep date/time consistent.
let pendingDate = { iso: "", weekday: 0, label: "", datePart: "", weekPart: "" };

const CLEAR_PHRASE = "刪除全部上課紀錄";

// ─── Router ──────────────────────────────────────────────────────────────────

async function navigate(page: Page): Promise<void> {
  if (page === "confirm-add") {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const m = now.getMonth() + 1;
    const day = now.getDate();
    const w = now.getDay();
    pendingDate = {
      iso: `${y}-${mo}-${d}`,
      weekday: w,
      label: `今天是 ${m} 月 ${day} 日 星期${WEEKDAY_ZH[w]}`,
      datePart: `今天是 ${m} 月 ${day} 日`,
      weekPart: `星期${WEEKDAY_ZH[w]}`,
    };
  }
  app.innerHTML = "";
  try {
    switch (page) {
      case "home":
        await showHome();
        break;
      case "confirm-add":
        showConfirmAdd();
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
    navigate("confirm-add")
  );
  app.querySelector("#btn-history")!.addEventListener("click", () =>
    navigate("history")
  );
}

// ─── Confirm Add ──────────────────────────────────────────────────────────────

function showConfirmAdd(): void {
  app.innerHTML = `
    <div class="page">
      <div class="confirm-hero">
        <p class="confirm-hero__date">${pendingDate.datePart}</p>
        <p class="confirm-hero__weekday">${pendingDate.weekPart}</p>
        <p class="confirm-hero__note">確認後將記錄今天的上課</p>
      </div>
      <div class="btn-stack">
        <button class="btn-primary btn-full" id="btn-confirm-add" type="button">確認新增</button>
        <button class="btn-ghost btn-full" id="btn-cancel-add" type="button">取消</button>
      </div>
    </div>
  `;

  app.querySelector("#btn-cancel-add")!.addEventListener("click", () =>
    navigate("home")
  );

  const confirmBtn =
    app.querySelector<HTMLButtonElement>("#btn-confirm-add")!;
  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    await addCourse(pendingDate.iso, pendingDate.weekday);
    navigate("home");
  });
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
}

function recordItemHTML(r: CourseRecord): string {
  // Use slice to avoid noUncheckedIndexedAccess on split() result.
  const m = parseInt(r.attendedDate.slice(5, 7), 10);
  const d = parseInt(r.attendedDate.slice(8, 10), 10);
  const dateStr = `${m}月${d}日`;
  const weekStr = `星期${WEEKDAY_ZH[r.weekday]}`;
  const badgeClass = r.attended ? "badge--present" : "badge--absent";
  const badgeText = r.attended ? "✓ 上課" : "✗ 缺席";
  const noteHTML = r.note
    ? `<p class="record-item__note">${escHtml(r.note)}</p>`
    : "";
  return `
    <li class="record-item">
      <div class="record-item__top">
        <div class="record-item__date">${dateStr} ${weekStr}</div>
        <div class="record-item__badge ${badgeClass}">${badgeText}</div>
      </div>
      ${noteHTML}
    </li>
  `;
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
