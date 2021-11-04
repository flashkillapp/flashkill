import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import { LitElement, css, html, render, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { FaceitInfo, Player } from '../model';
import { customTheme } from '../util/theme';
import {
  get99PlayerLink,
  getFaceitLevelLogoLink,
  getFaceitLink,
  getSteamLink,
  getSteamLogoLink,
} from '../util/getLink';

function faceitRenderer(faceitInfo: FaceitInfo): HTMLTemplateResult {
  const faceitLevel = faceitInfo.games.csgo.skill_level;

  return html`
    <a href=${getFaceitLink(faceitInfo.nickname)} target="_blank">
      <img
        class="faceit-logo"
        src=${getFaceitLevelLogoLink(faceitLevel)}
        alt=${faceitLevel}
      />
    </a>
  `;
}

function steamRenderer(steamId64: string): HTMLTemplateResult {
  return html`
    <a href=${getSteamLink(steamId64)} target="_blank">
      <img class="steam-logo" src=${getSteamLogoLink()} />
    </a>
  `;
}

export interface PlayerTableItem {
  player: Player;
  faceitInfo?: FaceitInfo;
}

const playerTable = 'flashkill-player-table';

@customElement(playerTable)
class PlayerTable extends LitElement {
  @property({ type: Array }) playerItems!: PlayerTableItem[];
  @property() remainingSubstitutions?: string;

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
    const { faceitInfo, player: {steamId64} } = rowData.item;

    render(
      html`
        <div class="profiles">
          ${faceitInfo && faceitRenderer(faceitInfo)}
          ${steamId64 && steamRenderer(steamId64)}
        </div>
      `,
      root,
    );
  }

  render() {
    return html`
      <div class="header">
        <h1>Spieler</h1>
        ${this.remainingSubstitutions && html`
          <h3>${this.remainingSubstitutions}</h3>
        `}
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
}

declare global {
  interface HTMLElementTagNameMap {
    [playerTable]: PlayerTable,
  }
}
