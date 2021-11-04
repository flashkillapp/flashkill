import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { customTheme } from '../util/theme';

const hideMemberCardsButton = 'flashkill-hide-member-cards-button';

@customElement(hideMemberCardsButton)
class HideMemberCardsButton extends LitElement {
  @state() private memberCardsHidden = true;

  constructor() {
    super();
    this.hideMemberCards();
  }

  static styles = css`
    ${customTheme}
  `;

  private getMemberCards(): Element | null {
    return document.querySelector('.league-team-members .section-content');
  }

  private hideMemberCards(): void {
    this.getMemberCards()?.classList.add('hidden');
  }

  private showMemberCards(): void {
    this.getMemberCards()?.classList.remove('hidden');
  }

  private toggleMemberCards(): void {
    this.memberCardsHidden = !this.memberCardsHidden;
    this.requestUpdate();

    if (this.memberCardsHidden) {
      this.hideMemberCards();
    } else {
      this.showMemberCards();
    }
  }

  render() {
    return html`
      <vaadin-button @click=${this.toggleMemberCards}>
        Mitglieder ${this.memberCardsHidden ? 'ein' : 'aus'}blenden
      </vaadin-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [hideMemberCardsButton]: HideMemberCardsButton,
  }
}
