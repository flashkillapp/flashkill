import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox';
import '@vaadin/vaadin-dialog/theme/material/vaadin-dialog';
import '@vaadin/vaadin-checkbox/theme/material/vaadin-checkbox-group';
import type { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import { LitElement, html, css, render } from 'lit';
import { customElement, property } from 'lit/decorators';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { customTheme } from '../util/theme';
import { Division, Season } from '../model';
import { getDay } from '../util/dateHelpers';
import { get99DamageMatchLink } from '../util/getLink';
import { notNull } from '../util/notNull';

const matchesTable = 'flashkill-matches-table';

export interface MatchTableItem {
  match_id: number;
  division: Division;
  season: Season | null;
  time: number;
  score_1: number;
  score_2: number;
}

@customElement(matchesTable)
class MatchesTable extends LitElement {
  @property({ type: Array }) matchItems!: MatchTableItem[];

  static styles = css`
    ${customTheme}

    .button-wrapper {
      width: 100%;
    }

    .season-selection {
      height: 150px;
      overflow-y: scroll;
    }
    
    .hidden {
      display: none;
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
        <vaadin-button @click=${this.openSeasonSelection}>Select seasons</vaadin-button>
      </div>
      <div class="season-selection hidden">
        <vaadin-checkbox-group @change=${this.updateSeasonSelection} label="Department" theme="vertical">
          ${this.getSeasons().map((season) => html`
            <vaadin-checkbox value="${season.id}">${season.name}</vaadin-checkbox>
          `)}
        </vaadin-checkbox-group>
      </div>
      <vaadin-grid .items="${this.matchItems}">
        <vaadin-grid-column .renderer="${this.dateRenderer}" header="Datum" text-align="end"></vaadin-grid-column>
        <vaadin-grid-column .renderer="${this.divisionRenderer}" header="Division"></vaadin-grid-column>
        <vaadin-grid-column path="score_1" header="Score 1" text-align="end"></vaadin-grid-column>
        <vaadin-grid-column path="score_2" header="Score 2" text-align="start"></vaadin-grid-column>
        <vaadin-grid-column .renderer="${this.moreRenderer}" header="Matchroom"></vaadin-grid-column>
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

    if (seasonIds.length === 0) {
      grid.items = this.matchItems;
    } else {
      grid.items = this.matchItems.filter((matchItem) => (
        matchItem.season !== null
        && seasonIds.includes(matchItem.season.id)
      ));
    }
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
        <a href="${rowData.item.division.url}">${rowData.item.division.name}</a>
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
        <a href="${get99DamageMatchLink(rowData.item.match_id)}">mehr</a>
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
