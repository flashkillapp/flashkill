import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox-group';
import type { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { LitElement, html, css, render, HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { customTheme } from '../util/theme';
import { Division, Season, Team, DraftMap } from '../model';
import { getDay } from '../util/dateHelpers';
import { get99MatchLink, get99TeamLink } from '../util/getLink';
import { isUndefined, notUndefined } from '../util';

registerStyles('vaadin-grid', css`
  .win { background-color: #374c37 !important; }
  .loss { background-color: #422315 !important; }
  .draw { background-color: #283d42 !important; }
`);

export interface MatchTableItem {
  match_id: number;
  division: Division;
  time: number;
  team_1: Team;
  team_2: Team;
  score_1: number;
  score_2: number;
  season?: Season;
  map?: DraftMap;
}

const matchesTable = 'flashkill-matches-table';

@customElement(matchesTable)
class MatchesTable extends LitElement {
  @property({ type: Array }) matchItems!: MatchTableItem[];

  @state() private seasonSelectMenuOpen = false;
  @state() private selectedSeasons: number[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.selectedSeasons = this.getSeasons().map((season) => season.id);
  }

  static styles = css`
    ${customTheme}

    .button-wrapper {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .hidden {
      display: none;
    }

    .map-image {
      width: 100px;
    }
  `;

  private getSeasons()  {
    const allSeasons = this.matchItems
      .map((matchItem) => matchItem.season)
      .filter(notUndefined);

    const uniqueSeasonIds = Array.from(
      new Set(allSeasons.map(({ id }) => id)),
    );

    return uniqueSeasonIds.map((id) => (
      allSeasons.find((season) => season.id === id)
    )).filter(notUndefined).sort((a: Season, b: Season) => b.order - a.order);
  }

  private updateSeasonSelection() {
    const checkboxGroup = this.shadowRoot?.querySelector('vaadin-checkbox-group') as CheckboxGroupElement;
    this.selectedSeasons = checkboxGroup?.value.map(
      (stringId: string) => Number.parseInt(stringId, 10),
    ) ?? [];
    this.requestUpdate();
  }

  private getSelectedMatches() {
    return this.matchItems.filter((matchItem) => (
      matchItem.season && this.selectedSeasons.includes(matchItem.season.id)
    ));
  }

  private toggleSeasonSelection() {
    this.seasonSelectMenuOpen = !this.seasonSelectMenuOpen;
    this.requestUpdate();
  }

  private dateRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    render(
      html`<span>${getDay(rowData.item.time)}</span>`,
      root,
    );
  }

  private divisionRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    render(
      html`
        <a href=${rowData.item.division.url}>
          ${rowData.item.division.name.replace('Division', 'Div')}
        </a>
      `,
      root,
    );
  }

  private mapRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    if (isUndefined(rowData.item.map)) return;

    render(
      html`
        <img
          class="map-image"
          src=${rowData.item.map.picture}
          alt=${rowData.item.map.title}
        />
      `,
      root,
    );
  }

  private matchRoomRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    render(
      html`<a href=${get99MatchLink(rowData.item.match_id)}>mehr</a>`,
      root,
    );
  }

  private cellClassNameGenerator(
    column: GridColumnElement<MatchTableItem>, model: GridItemModel<MatchTableItem>,
  ) {
    if (column.path !== 'score_1' && column.path !== 'score_2') return '';

    const roundDiff = model.item.score_1 - model.item.score_2;

    if (roundDiff === 0) return 'draw';
    if (roundDiff > 0) return 'win';
    if (roundDiff < 0) return 'loss';

    return '';
  }

  private teamRenderer(
    root: HTMLElement,
    column: GridColumnElement<MatchTableItem> & { path: 'team_1' | 'team_2' },
    rowData: GridItemModel<MatchTableItem>,
  ) {
    const team = rowData.item[column.path];
    render(
      html`
        <a href=${get99TeamLink(team.id)}>${team.name}</a>
      `,
      root,
    );
  }

  private renderHeader(): HTMLTemplateResult {
    return html`
      <div class="button-wrapper">
        <h1>Ergebnisse</h1>
        <vaadin-button @click=${this.toggleSeasonSelection}>Saisons auswählen</vaadin-button>
      </div>
    `;
  }

  private renderSeasonSelection(): HTMLTemplateResult {
    return html`
      <div class=${classMap({ hidden: !this.seasonSelectMenuOpen })}>
        <vaadin-checkbox-group
          @change=${this.updateSeasonSelection}
          .value="${this.selectedSeasons.map((id) => `${id}`)}"
        >
          ${this.getSeasons().map((season) => html`
            <vaadin-checkbox value="${season.id}">${season.name}</vaadin-checkbox>
          `)}
        </vaadin-checkbox-group>
      </div>
    `;
  }

  private renderGrid(): HTMLTemplateResult {
    return html`
      <vaadin-grid
        .items="${this.getSelectedMatches()}"
        .cellClassNameGenerator="${this.cellClassNameGenerator}"
      >
        <vaadin-grid-column
          header="Datum"
          text-align="center"
          auto-width
          .renderer="${this.dateRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Division"
          auto-width
          .renderer="${this.divisionRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Team 1"
          path="team_1"
          text-align="end"
          .renderer="${this.teamRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Scores" text-align="center">
          ${[1, 2].map((teamNumber) => html`
            <vaadin-grid-column
              header=""
              path="score_${teamNumber}"
              text-align="center"
              width="45px"
            ></vaadin-grid-column>
          `)}
        </vaadin-grid-column-group>
        <vaadin-grid-column
          header="Team 2"
          path="team_2"
          .renderer="${this.teamRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Map"
          text-align="center"
          .renderer="${this.mapRenderer}"
        ></vaadin-grid-column>
        <vaadin-grid-column
          header="Link"
          text-align="center"
          auto-width
          .renderer="${this.matchRoomRenderer}"
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  render() {
    return html`
      ${this.renderHeader()}
      ${this.renderSeasonSelection()}
      ${this.renderGrid()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [matchesTable]: MatchesTable,
  }
}
