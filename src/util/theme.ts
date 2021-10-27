import { css } from 'lit';

export const customTheme = css`
  :host {
    --material-body-text-color: var(--dark-theme-text-color, rgba(255, 255, 255, 1));
    --material-secondary-text-color: var(--dark-theme-secondary-color, rgba(255, 255, 255, 0.7));
    --material-disabled-text-color: var(--dark-theme-disabled-color, rgba(255, 255, 255, 0.5));
    --material-primary-color: var(--light-primary-color, #01942d);
    --material-primary-text-color: #94f6a4;
    --material-error-color: var(--error-color, #de2839);
    --material-error-text-color: var(--material-error-color);
    --material-background-color: var(--dark-theme-background-color, #303030);
    --material-secondary-background-color: var(--dark-theme-secondary-background-color, #3b3b3b);
    --material-disabled-color: rgba(255, 255, 255, 0.3);
    --material-divider-color: rgba(255, 255, 255, 0.12);
    --_material-text-field-input-line-background-color: #fff;
    --_material-text-field-input-line-opacity: 0.7;
    --_material-text-field-input-line-hover-opacity: 1;
    --_material-text-field-focused-label-opacity: 1;
    --_material-button-raised-background-color: rgba(255, 255, 255, 0.08);
    --_material-button-outline-color: rgba(255, 255, 255, 0.2);
    --_material-grid-row-hover-background-color: rgba(255, 255, 255, 0.08);
    --_material-grid-row-selected-overlay-opacity: 0.16;
    --_material-split-layout-splitter-background-color: rgba(255, 255, 255, 0.8);
    color: var(--material-body-text-color);
  }

  a {
    color: var(--material-body-text-color);
  }
`;
