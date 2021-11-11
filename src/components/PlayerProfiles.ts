import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './FaceitLogo';
import './SteamLogo';
import { FaceitInfo } from '../model';

const flashkillPlayerProfiles = 'flashkill-player-profiles';

@customElement(flashkillPlayerProfiles)
class PlayerProfiles extends LitElement {
  @property() steamId64?: string;
  @property({ type: Object }) faceitInfo?: FaceitInfo;

  static styles = css`
    :host {
      display: flex;
      gap: 8px;
      justify-content: space-evenly;
    }
  `;

  render() {
    return html`
      ${this.faceitInfo && html`
        <flashkill-faceit-logo
          .nickname=${this.faceitInfo.nickname}
          .skillLevel=${this.faceitInfo.games.csgo.skill_level}
        ></flashkill-faceit-logo>
      `}
      ${this.steamId64 && html`
        <flashkill-steam-logo .steamId64=${this.steamId64}></flashkill-steam-logo>
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillPlayerProfiles]: PlayerProfiles,
  }
}
