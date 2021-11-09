import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { customTheme } from '../util/theme';

export const flashkillToggleContentButton = 'flashkill-toggle-content-button';

@customElement(flashkillToggleContentButton)
class ToggleContentButton extends LitElement {
  @property() label!: string;
  @property() selector!: string;
  @state() private contentHidden = true;

  connectedCallback() {
    super.connectedCallback();
    this.hideContent();
  }

  static styles = css`
    ${customTheme}
  `;

  private getContent(): Element | null {
    return document.querySelector(this.selector);
  }

  private hideContent(): void {
    this.getContent()?.classList.add('hidden');
  }

  private showContent(): void {
    this.getContent()?.classList.remove('hidden');
  }

  private toggleContent(): void {
    this.contentHidden = !this.contentHidden;
    this.requestUpdate();

    if (this.contentHidden) {
      this.hideContent();
    } else {
      this.showContent();
    }
  }

  render() {
    return html`
      <vaadin-button @click=${this.toggleContent}>
        ${this.label} ${this.contentHidden ? 'ein' : 'aus'}blenden
      </vaadin-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillToggleContentButton]: ToggleContentButton,
  }
}
