import '@webcomponents/custom-elements';
import { LitElement, css, html, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { FaceitInfo, PlayerInfo } from '../model';
import { getSteamLink } from '../util/getLink';

const getFaceitLevelLogo = (faceitLevel: number): string => (
  `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`
);

const getFaceitLink = (name: string): string => (
  `https://www.faceit.com/en/players/${name}`
);

const additionalPlayerInfo = 'flashkill-additional-player-info';

@customElement(additionalPlayerInfo)
class AdditionalPlayerInfo extends LitElement {
  @property({ type: Object }) playerInfo!: PlayerInfo;

  static styles = css`
    .root {
      display: inline-block;
    }

    div {
      font: normal normal 300 14px/20px Roboto,sans-serif;
      color: #c5c5c5;
      vertical-align: middle;
    }

    a {
      text-decoration: none;
      color: #faa61b;
    }

    .steam-info {
      margin-top: 5px;
      white-space: nowrap;
      overflow: hidden;
    }

    .faceit-info {
      display: flex;
      align-items: center;
    }

    .faceit-text {
      font: normal normal 300 14px/20px Roboto,sans-serif;
      color: #c5c5c5;
      vertical-align: middle;
      margin-bottom: 0px;
    }

    .faceit-logo {
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
      width: 28px;
      height: 28px;
    }
  `;

  private renderFaceitInfo(faceitInfo: FaceitInfo): HTMLTemplateResult {
    const {
      nickname,
      games: { csgo: { faceit_elo, skill_level } },
    } = faceitInfo;

    return html`
      <div class="faceit-info">
        <div class="faceit-text">
          ${'FACEIT: '}
          <a href=${getFaceitLink(nickname)} target="_blank">
            ${faceit_elo}
            <img class="faceit-logo" src=${getFaceitLevelLogo(skill_level)} alt=${skill_level} />
          </a>
        </div>
      </div>
    `;
  }

  render() {
    const { steamId64, steamName, faceitInfo } = this.playerInfo;

    return html`
      <div class="root">
        <div class="steam-info">
          ${'Steam: '}
          <a href=${getSteamLink(steamId64)} target="_blank">
            ${steamName ?? '-'}
          </a>
        </div>
        ${faceitInfo && this.renderFaceitInfo(faceitInfo)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [additionalPlayerInfo]: AdditionalPlayerInfo,
  }
}
