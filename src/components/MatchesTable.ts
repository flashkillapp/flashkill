import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox';
import '@vaadin/vaadin-dialog/theme/material/vaadin-dialog';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox-group';
import type { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { LitElement, html, css, render } from 'lit';
import { customElement, property } from 'lit/decorators';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { customTheme } from '../util/theme';
import { Division, Season, Team, DraftMap } from '../model';
import { getDay } from '../util/dateHelpers';
import { get99MatchLink, get99TeamLink } from '../util/getLink';
import { notNull } from '../util/notNull';

registerStyles('vaadin-grid', css`
  .win { background-color: #374c37 !important; }
  .loss { background-color: #422315 !important; }
  .draw { background-color: #283d42 !important; }
`);

const matchesTable = 'flashkill-matches-table';

export interface MatchTableItem {
  match_id: number;
  division: Division;
  season: Season | null;
  time: number;
  team_1: Team;
  team_2: Team;
  score_1: number;
  score_2: number;
  map: DraftMap | null;
}

@customElement(matchesTable)
class MatchesTable extends LitElement {
  @property({ type: Array }) matchItems!: MatchTableItem[];

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

  private getSeasons() {
    return Array.from(
      new Set(this.matchItems?.map((matchItem) => matchItem.season).filter(notNull)),
    ).sort((a: Season, b: Season) => b.id - a.id);
  }

  render() {
    return html`
      <div class="button-wrapper">
        <h1>Ergebnisse</h1>
        <vaadin-button @click=${this.openSeasonSelection}>Saisons auswählen</vaadin-button>
      </div>
      <div class="season-selection hidden">
        <vaadin-checkbox-group @change=${this.updateSeasonSelection} .value="${this.getSeasons().map((season) => `${season.id}`)}">
          ${this.getSeasons().map((season) => html`
            <vaadin-checkbox value="${season.id}">${season.name}</vaadin-checkbox>
          `)}
        </vaadin-checkbox-group>
      </div>
      <vaadin-grid theme="compact" .items="${this.matchItems}" .cellClassNameGenerator="${this.cellClassNameGenerator}">
        <vaadin-grid-column .renderer="${this.dateRenderer}" header="Datum"></vaadin-grid-column>
        <vaadin-grid-column auto-width .renderer="${this.divisionRenderer}" header="Division"></vaadin-grid-column>
        <vaadin-grid-column path="team_1" .renderer="${this.teamRenderer}" header="Team 1" text-align="end"></vaadin-grid-column>
        <vaadin-grid-column-group header="Scores" text-align="center">
          <vaadin-grid-column path="score_1" header="" text-align="center" width="45px"></vaadin-grid-column>
          <vaadin-grid-column path="score_2" header="" text-align="center" width="45px"></vaadin-grid-column>
        </vaadin-grid-column-group>
        <vaadin-grid-column path="team_2" .renderer="${this.teamRenderer}" header="Team 2"></vaadin-grid-column>
        <vaadin-grid-column .renderer="${this.mapRenderer}" header="Map"></vaadin-grid-column>
        <vaadin-grid-column auto-width .renderer="${this.moreRenderer}" header="Link"></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private updateSeasonSelection() {
    const checkboxGroup = this.shadowRoot?.querySelector('vaadin-checkbox-group') as CheckboxGroupElement;
    if (checkboxGroup === null || checkboxGroup === undefined) return;
    const seasonIds = checkboxGroup.value.map(
      (stringId: string) => Number.parseInt(stringId, 10),
    );

    const grid = this.shadowRoot?.querySelector('vaadin-grid');

    if (grid === null || grid === undefined) return;

    grid.items = this.matchItems.filter((matchItem) => (
      matchItem.season !== null
      && seasonIds.includes(matchItem.season.id)
    ));
  }

  private openSeasonSelection() {
    const seasonSelection = this.shadowRoot?.querySelector('.season-selection');
    seasonSelection?.classList.toggle('hidden');
  }

  private dateRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    render(
      html`
        <span>${getDay(rowData.item.time)}</span>
      `,
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
        <a href="${rowData.item.division.url}">
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
    if (rowData.item.map === null) {
      render(html``, root);

      return;
    }

    render(
      html`
        <img
          class="map-image"
          src="${rowData.item.map.picture}"
          alt="${rowData.item.map.title}"
        />
      `,
      root,
    );
  }

  private moreRenderer(
    root: HTMLElement,
    _: GridColumnElement<MatchTableItem>,
    rowData: GridItemModel<MatchTableItem>,
  ) {
    render(
      html`
        <a href="${get99MatchLink(rowData.item.match_id)}">mehr</a>
      `,
      root,
    );
  }

  private cellClassNameGenerator(column: GridColumnElement<MatchTableItem>, model: GridItemModel<MatchTableItem>) {
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
        <a href="${get99TeamLink(team.id)}">${team.name}</a>
      `,
      root,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [matchesTable]: MatchesTable,
  }
}
