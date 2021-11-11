import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import { LitElement, html, render, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import './FaceitEloBar';
import './ToggleContentButton';
import './PlayerProfiles';
import { customTheme } from '../util/theme';
import { FaceitInfo, LineupPlayer } from '../model';
import { get99PlayerLink } from '../util/getLink';
import { avgFaceitElo } from '../util/avgFaceitElo';

export interface LineupTableItem {
  player: LineupPlayer;
  faceitInfo?: FaceitInfo;
}

export const flashkillLineupTables = 'flashkill-lineup-tables';

@customElement(flashkillLineupTables)
class LineupTables extends LitElement {
  @property({ type: Array }) lineupItems1!: LineupTableItem[];
  @property({ type: Array }) lineupItems2!: LineupTableItem[];

  static styles = css`
    ${customTheme}

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    :host > .lineups {
      display: flex;
      gap: 4px;
    }
  `;

  private nameRenderer(
    root: HTMLElement,
    _: GridColumnElement<LineupTableItem>,
    rowData: GridItemModel<LineupTableItem>,
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
    _: GridColumnElement<LineupTableItem>,
    rowData: GridItemModel<LineupTableItem>,
  ) {
    const { faceitInfo, player: {steamId64} } = rowData.item;

    render(
      html`
        <flashkill-player-profiles
          .faceitInfo=${faceitInfo}
          .steamId64=${steamId64}
        ></flashkill-player-profiles>
      `,
      root,
    );
  }

  render() {
    return html`
      <div class="header">
        <h1>Lineups</h1>
        <flashkill-toggle-content-button
          label="Original"
          selector=".content-match-lineups"
        ></flashkill-toggle-content-button>
      </div>

      <flashkill-faceit-elo-bar
        .elo1=${avgFaceitElo(this.lineupItems1.map(({ faceitInfo }) => faceitInfo))}
        .elo2=${avgFaceitElo(this.lineupItems2.map(({ faceitInfo }) => faceitInfo))}
      ></flashkill-faceit-elo-bar>

      <div class="lineups">
        ${[this.lineupItems1, this.lineupItems2].map((lineupItems) => html`
          <vaadin-grid .items="${lineupItems}" .allRowsVisible=${true}>
            <vaadin-grid-column
              header="Name"
              auto-width
              text-align="start"
              .renderer="${this.nameRenderer}"
            ></vaadin-grid-column>
            <vaadin-grid-column
              header="Faceit Elo"
              path="faceitInfo.games.csgo.faceit_elo"
              text-align="end"
            ></vaadin-grid-column>
            <vaadin-grid-column
              header="Profiles"
              auto-width
              text-align="center"
              .renderer="${this.profilesRenderer}"
            ></vaadin-grid-column>
          </vaadin-grid>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillLineupTables]: LineupTables,
  }
}
