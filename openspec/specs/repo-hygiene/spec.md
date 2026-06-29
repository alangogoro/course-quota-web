# repo-hygiene Specification

## Purpose

TBD - created by archiving change 'add-project-gitignore'. Update Purpose after archive.

## Requirements

### Requirement: Ignore Node and Vite build artifacts

The project's `.gitignore` SHALL exclude all Node and Vite build artifacts from version control. At minimum, the following patterns MUST be present: `node_modules/`, `dist/`, `.vite/`.

#### Scenario: Build output directories are not tracked

- **WHEN** a developer runs `npm install` or `npm run build`
- **THEN** `node_modules/`, `dist/`, and `.vite/` MUST NOT appear as untracked or modified files in `git status`

---
### Requirement: Ignore IDE configuration directories

The project's `.gitignore` SHALL exclude editor-specific configuration directories. The `.vscode/` directory MUST be ignored in its entirety so no VS Code workspace settings, extension recommendations, or debug configs are tracked.

#### Scenario: VS Code workspace files are not tracked

- **WHEN** VS Code creates or modifies any file under `.vscode/`
- **THEN** those files MUST NOT appear in `git status`

---
### Requirement: Ignore manual acceptance test screenshots

The project's `.gitignore` SHALL exclude a designated screenshots directory used for manual acceptance testing. The `screenshots/` directory MUST be ignored so that test images do not accumulate in the repo.

#### Scenario: Screenshot test files are not tracked

- **WHEN** a developer places a file (e.g., `test.png`) inside `screenshots/`
- **THEN** that file MUST NOT appear in `git status`

---
### Requirement: Ignore browser profile directories

The project's `.gitignore` SHALL exclude directories commonly created when running browser automation or manual testing with custom user data, such as `user-data-dir/`, `.playwright/`, and `playwright-user-data/`.

#### Scenario: Browser profile directories are not tracked

- **WHEN** a browser automation tool or manual test creates a `user-data-dir/` or `.playwright/` directory
- **THEN** those directories MUST NOT appear in `git status`

---
### Requirement: Ignore OS and log artifacts

The project's `.gitignore` SHALL exclude common OS-generated files and log files. At minimum: `.DS_Store` and `*.log` MUST be ignored.

#### Scenario: macOS metadata files are not tracked

- **WHEN** macOS creates a `.DS_Store` file in any project directory
- **THEN** that file MUST NOT appear in `git status`

---
### Requirement: Preserve production assets

The `.gitignore` rules SHALL NOT exclude production assets required for the application to function. Specifically, the following MUST remain tracked: app icons under `public/icons/`, `public/favicon.ico` (or equivalent), and any image files referenced by `manifest.webmanifest`.

#### Scenario: Production icon files remain tracked

- **WHEN** a developer runs `git status` after committing production icon files
- **THEN** files in `public/icons/` MUST NOT be shown as ignored

