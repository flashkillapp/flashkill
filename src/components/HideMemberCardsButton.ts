import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { customTheme } from '../util/theme';

const hideMemberCardsButton = 'flashkill-hide-member-cards-button';

@customElement(hideMemberCardsButton)
class HideMemberCardsButton extends LitElement {
  static styles = css`
    ${customTheme}
  `;

  render() {
    return html`
      <vaadin-button @click=${this.toggleMemberCards}>Mitglieder ein-/ausblenden</vaadin-button>
    `;
  }

  private toggleMemberCards() {
    const seasonSelection = document.querySelector('.league-team-members .section-content');
    seasonSelection?.classList.toggle('hidden');
  }

}

declare global {
  interface HTMLElementTagNameMap {
    [hideMemberCardsButton]: HideMemberCardsButton,
  }
}
