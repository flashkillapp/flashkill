import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import { LitElement, css, html, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import './PlayerProfiles';
import { FaceitInfo, Player } from '../model';
import { customTheme } from '../util/theme';
import {
  get99PlayerLink,
} from '../util/getLink';

export interface MemberTableItem {
  player: Player;
  faceitInfo?: FaceitInfo;
}

export const flashkillMemberTable = 'flashkill-member-table';

@customElement(flashkillMemberTable)
class MemberTable extends LitElement {
  @property({ type: Array }) memberItems!: MemberTableItem[];
  @property() remainingSubstitutions?: string;

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

  render() {
    return html`
      <div class="header">
        <h1>Spieler</h1>
        ${this.remainingSubstitutions && html`
          <h3>${this.remainingSubstitutions}</h3>
        `}
      </div>
      <vaadin-grid .items="${this.memberItems}" .allRowsVisible=${true}>
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
          text-align="center"
          .renderer="${this.profilesRenderer}"
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
