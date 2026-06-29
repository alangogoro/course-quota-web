## ADDED Requirements

### Requirement: Settings entry button on home screen

The home screen SHALL display a settings entry button that navigates to the settings page when clicked. The button MUST display a visible Traditional Chinese text label (e.g., "設定"). An optional icon (e.g., gear icon) and an `aria-label` attribute are permitted as supplementary aids, but SHALL NOT replace the visible text label.

#### Scenario: Settings entry button has visible text label

- **WHEN** the home screen is rendered
- **THEN** the settings entry button SHALL display a visible Traditional Chinese text label (e.g., "設定") that is readable without assistive technology

#### Scenario: Settings entry button navigates to settings page

- **WHEN** the user clicks the settings entry button
- **THEN** the system SHALL navigate to the settings page route

### Requirement: Settings entry button position

The settings entry button SHALL be placed in the top-right area of the home screen. Its tap target SHALL be at least 48×48 CSS px.

#### Scenario: Settings entry button meets tap target size

- **WHEN** the settings entry button is rendered
- **THEN** the button's clickable area SHALL be at least 48 CSS px in both width and height

### Requirement: Home screen layout

The home screen layout SHALL include a dedicated slot (`.home-header`) in the top area for the settings entry button.

#### Scenario: Home header renders settings entry button slot

- **WHEN** the home screen is rendered
- **THEN** a `.home-header` container SHALL exist at the top of the `.page` element, containing the settings entry button aligned to the right

### Requirement: 設定頁高齡友善標準

All settings page form elements SHALL meet the following senior-friendly accessibility standards:
- Field labels SHALL have a font size of at least 18 CSS px
- Button labels SHALL have a font size of at least 24 CSS px
- All interactive elements SHALL have a tap target of at least 48×48 CSS px

#### Scenario: Field labels meet minimum font size

- **WHEN** the settings page is rendered
- **THEN** all field labels (e.g., "您的名稱", "目標上課堂數") SHALL have a computed font size of at least 18 CSS px

#### Scenario: Button labels meet minimum font size

- **WHEN** the settings page is rendered
- **THEN** the "儲存" and "取消" button labels SHALL have a computed font size of at least 24 CSS px

#### Scenario: Buttons meet minimum tap target size

- **WHEN** the settings page is rendered
- **THEN** the "儲存" and "取消" buttons SHALL each have a clickable area of at least 48 CSS px in both width and height
