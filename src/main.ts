const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("#app root element is missing from index.html");
}

appRoot.innerHTML = `
  <p class="text-muted">
    專案骨架已就緒，等待後續任務實作畫面。
  </p>
`;
