import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import { LitElement, css, html, render, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { FaceitInfo, Player } from '../model';
import { customTheme } from '../util/theme';
import { get99PlayerLink, getSteamLink } from '../util/getLink';

const getSteamLogo = (): string => (
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/28px-Steam_icon_logo.svg.png'
);

const getFaceitLevelLogo = (faceitLevel: number): string => (
  `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`
);

const getFaceitLink = (name: string): string => (
  `https://www.faceit.com/en/players/${name}`
);

export interface PlayerTableItem {
  player: Player;
  faceitInfo: FaceitInfo | null;
}

const playerTable = 'flashkill-player-table';

@customElement(playerTable)
class PlayerTable extends LitElement {
  @property({ type: Array }) playerItems!: PlayerTableItem[];
  @property() remainingSubstitutions!: string;

  static styles = css`
    ${customTheme}

    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .profiles {
      display: flex;
      gap: 8px;
    }

    .steam-logo {
      display: inline-block;
      vertical-align: middle;
      width: 28px;
      height: 28px;
    }

    .faceit-logo {
      display: inline-block;
      vertical-align: middle;
      width: 28px;
      height: 28px;
    }
  `;

  render() {
    return html`
      <div class="header">
        <h1>Spieler</h1>
        <h3>${this.remainingSubstitutions}</h3>
      </div>
      <vaadin-grid .items="${this.playerItems}">
        <vaadin-grid-column
          header="Name"
          auto-width
          .renderer="${this.nameRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Rolle"
          auto-width
          path="player.role"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Status"
          auto-width
          path="player.status"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Faceit Elo"
          path="faceitInfo.games.csgo.faceit_elo"
          text-align="end"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Profiles"
          .renderer="${this.profilesRenderer}"
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private nameRenderer(
    root: HTMLElement,
    _: GridColumnElement<PlayerTableItem>,
    rowData: GridItemModel<PlayerTableItem>,
  ) {
    render(
      html`
        <a href="${get99PlayerLink(rowData.item.player.id)}" target="_blank">
          ${rowData.item.player.name}
        </a>
      `,
      root,
    );
  }

  private profilesRenderer(
    root: HTMLElement,
    _: GridColumnElement<PlayerTableItem>,
    rowData: GridItemModel<PlayerTableItem>,
  ) {
    const faceitRenderer = (faceitInfo: FaceitInfo | null): TemplateResult<1> => {
      if (faceitInfo === null) {
        return html``;
      }

      const faceitLevel = faceitInfo.games.csgo.skill_level;

      return html`
        <a href=${getFaceitLink(faceitInfo.nickname)} target="_blank">
          <img
            class="faceit-logo"
            src="${getFaceitLevelLogo(faceitLevel)}"
            alt="${faceitLevel}"
          />
        </a>
      `;
    };

    const steamRenderer = (steamId64: string | null): TemplateResult<1> => {
      if (steamId64 === null) {
        return html``;
      }

      return html`
        <a href=${getSteamLink(steamId64)} target="_blank">
          <img class="steam-logo" src="${getSteamLogo()}"/>
        </a>
      `;
    };

    render(
      html`
        <div class="profiles">
          ${faceitRenderer(rowData.item.faceitInfo)}
          ${steamRenderer(rowData.item.player.steamId64)}
        </div>
      `,
      root,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [playerTable]: PlayerTable,
  }
}
