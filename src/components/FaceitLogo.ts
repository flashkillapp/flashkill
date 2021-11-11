import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getFaceitLevelLogoLink, getFaceitLink } from '../util/getLink';

const flashkillFaceitLogo = 'flashkill-faceit-logo';

@customElement(flashkillFaceitLogo)
class FaceitLogo extends LitElement {
  @property() nickname!: string;
  @property({ type: Number }) skillLevel!: number;

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
      <a href=${getFaceitLink(this.nickname)} target="_blank">
        <img
          src=${getFaceitLevelLogoLink(this.skillLevel)}
          alt=${this.skillLevel}
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
