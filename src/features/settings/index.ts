import { getSettings, saveSettings } from "../../db/db";

export async function showSettings(
  app: HTMLElement,
  navigate: (page: "home") => unknown
): Promise<void> {
  const settings = await getSettings();

  app.innerHTML = `
    <div class="page">
      <div class="page-nav">
        <button class="btn-back-nav" id="btn-cancel-settings" type="button" aria-label="取消並返回">
          ${chevronLeftSVG()}
          取消
        </button>
        <h1 class="page-title">設定</h1>
      </div>
      <div class="settings-form">
        <div class="settings-field">
          <label class="settings-label" for="input-name">您的名稱</label>
          <input
            type="text"
            id="input-name"
            value="${escHtml(settings.name)}"
            maxlength="50"
            autocomplete="name"
            autocorrect="off"
            spellcheck="false"
            aria-describedby="error-name"
          />
          <p class="field-error" id="error-name" role="alert" aria-live="polite"></p>
        </div>
        <div class="settings-field">
          <label class="settings-label" for="input-max">目標上課堂數</label>
          <input
            type="text"
            id="input-max"
            inputmode="numeric"
            value="${settings.maxCourseCount}"
            autocomplete="off"
            aria-describedby="error-max"
          />
          <p class="field-error" id="error-max" role="alert" aria-live="polite"></p>
        </div>
      </div>
      <div class="btn-stack">
        <button class="btn-primary btn-full" id="btn-save-settings" type="button">儲存</button>
        <button class="btn-ghost btn-full" id="btn-cancel-settings-2" type="button">取消</button>
      </div>
    </div>
  `;

  const nameInput = app.querySelector<HTMLInputElement>("#input-name")!;
  const maxInput = app.querySelector<HTMLInputElement>("#input-max")!;
  const nameError = app.querySelector<HTMLParagraphElement>("#error-name")!;
  const maxError = app.querySelector<HTMLParagraphElement>("#error-max")!;
  const saveBtn = app.querySelector<HTMLButtonElement>("#btn-save-settings")!;

  function validate(): boolean {
    let valid = true;
    const name = nameInput.value.trim();
    if (name.length === 0) {
      nameError.textContent = "名稱不可空白";
      valid = false;
    } else if (name.length > 50) {
      nameError.textContent = "名稱最多 50 個字";
      valid = false;
    } else {
      nameError.textContent = "";
    }

    const maxRaw = maxInput.value.trim();
    const maxVal = Number(maxRaw);
    if (maxRaw === "" || !Number.isInteger(maxVal) || maxVal < 1 || maxVal > 9999) {
      maxError.textContent = "請輸入 1 到 9999 之間的整數";
      valid = false;
    } else {
      maxError.textContent = "";
    }

    return valid;
  }

  saveBtn.addEventListener("click", async () => {
    if (!validate()) return;
    saveBtn.disabled = true;
    await saveSettings(nameInput.value.trim(), Number(maxInput.value.trim()));
    navigate("home");
  });

  const cancelHandler = () => navigate("home");
  app.querySelector("#btn-cancel-settings")!.addEventListener("click", cancelHandler);
  app.querySelector("#btn-cancel-settings-2")!.addEventListener("click", cancelHandler);
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
