import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-selection-column';
import { LitElement, css, html, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import './PlayerProfiles';
import { FaceitInfo, Player } from '../model';
import { customTheme } from '../util/theme';
import {
  get99PlayerLink,
} from '../util/getLink';
import { avgFaceitElo } from '../util/avgFaceitElo';

export interface MemberTableItem {
  player: Player;
  faceitInfo?: FaceitInfo;
}

export const flashkillMemberTable = 'flashkill-member-table';

@customElement(flashkillMemberTable)
class MemberTable extends LitElement {
  @property({ type: Array }) memberItems!: MemberTableItem[];
  @property() remainingSubstitutions?: string;
  @state() private selectedPlayers: MemberTableItem[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.selectedPlayers = this.memberItems;
  }

  static styles = css`
    ${customTheme}

    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  `;

  private nameRenderer(
    root: HTMLElement,
    _: GridColumnElement<MemberTableItem>,
    rowData: GridItemModel<MemberTableItem>,
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
    _: GridColumnElement<MemberTableItem>,
    rowData: GridItemModel<MemberTableItem>,
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

  private updatePlayerSelection(selection: CustomEvent<{ value: MemberTableItem[] }>): void {
    this.selectedPlayers = selection.detail.value;
    this.requestUpdate();
  }

  private getSelectedAvgElo(): number {
    return avgFaceitElo(this.selectedPlayers.map(({ faceitInfo }) => faceitInfo));
  }

  render() {
    const avgElo = Math.round(this.getSelectedAvgElo());

    return html`
      <h1>Mitglieder</h1>
      <div class="header">
        <h2 title="Durchschnittliche FACEIT-Elo">
          FACEIT-Elo: ${Number.isFinite(avgElo) ? avgElo : '-'}
        </h2>
        ${this.remainingSubstitutions && html`
          <h3>${this.remainingSubstitutions}</h3>
        `}
      </div>
      <vaadin-grid
        .items=${this.memberItems}
        .allRowsVisible=${true}
        @selected-items-changed=${this.updatePlayerSelection}
        .selectedItems=${this.selectedPlayers}
      >
        <vaadin-grid-selection-column
          auto-select
          select-all
        ></vaadin-grid-selection-column>
        <vaadin-grid-column
          header="Name"
          auto-width
          path="player.name"
          .renderer=${this.nameRenderer}
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
          text-align="center"
          .renderer=${this.profilesRenderer}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillMemberTable]: MemberTable,
  }
}
