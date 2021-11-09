import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { FaceitInfo } from '../model';
import { getFaceitLevelLogoLink, getFaceitLink } from '../util/getLink';

const flashkillFaceitLogo = 'flashkill-faceit-logo';

@customElement(flashkillFaceitLogo)
class FaceitLogo extends LitElement {
  @property({ type: Object }) faceitInfo!: FaceitInfo;

  static styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      width: 28px;
      height: 28px;
    }
  `;

  render() {
    const faceitLevel = this.faceitInfo.games.csgo.skill_level;

    return html`
      <a href=${getFaceitLink(this.faceitInfo.nickname)} target="_blank">
        <img
          src=${getFaceitLevelLogoLink(faceitLevel)}
          alt=${faceitLevel}
        />
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillFaceitLogo]: FaceitLogo,
  }
}
