import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getSteamLink, getSteamLogoLink } from '../util/getLink';

const flashkillSteamLogo = 'flashkill-steam-logo';

@customElement(flashkillSteamLogo)
class SteamLogo extends LitElement {
  @property() steamId64!: string;

  static styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      width: 28px;
      height: 28px;
    }
  `;

  render() {
    return html`
      <a href=${getSteamLink(this.steamId64)} target="_blank">
        <img class="steam-logo" src=${getSteamLogoLink()} />
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillSteamLogo]: SteamLogo,
  }
}
