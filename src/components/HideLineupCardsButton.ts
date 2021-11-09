import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { customTheme } from '../util/theme';

const hideLineupCardsButton = 'flashkill-hide-lineup-cards-button';

@customElement(hideLineupCardsButton)
class HideLineupCardsButton extends LitElement {
  @state() private lineupCardsHidden = true;

  constructor() {
    super();
    this.hideLineupCards();
  }

  static styles = css`
    ${customTheme}
  `;

  private getLineupCards(): Element | null {
    return document.querySelector('.content-match-lineups');
  }

  private hideLineupCards(): void {
    this.getLineupCards()?.classList.add('hidden');
  }

  private showLineupCards(): void {
    this.getLineupCards()?.classList.remove('hidden');
  }

  private toggleLineupCards(): void {
    this.lineupCardsHidden = !this.lineupCardsHidden;
    this.requestUpdate();

    if (this.lineupCardsHidden) {
      this.hideLineupCards();
    } else {
      this.showLineupCards();
    }
  }

  render() {
    return html`
      <vaadin-button @click=${this.toggleLineupCards}>
        Original ${this.lineupCardsHidden ? 'ein' : 'aus'}blenden
      </vaadin-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [hideLineupCardsButton]: HideLineupCardsButton,
  }
}
