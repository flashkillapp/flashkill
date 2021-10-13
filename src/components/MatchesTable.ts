import '@webcomponents/custom-elements';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import { LitElement, html, css, render } from 'lit';
import { customElement, property } from 'lit/decorators';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { Division } from '../model';
import { getDay } from '../util/dateHelpers';
import { get99DamageMatchLink } from '../util/getLink';

const matchesTable = 'flashkill-matches-table';

export interface MatchTableItem {
  match_id: number;
  division: Division;
  time: number;
  score_1: number;
  score_2: number;
}

@customElement(matchesTable)
class MatchesTable extends LitElement {
  @property({ type: Array }) matchItems!: MatchTableItem[];

  static styles = css`
    :host {
      background-color: #1b1b1b !important;
      color: white;
    }

    a {
      color: orange;
    }
  `;

  render() {
    return html`
      <vaadin-grid .items="${this.matchItems}">
        <vaadin-grid-column .renderer="${this.dateRenderer}" header="Datum" text-align="end"></vaadin-grid-column>
        <vaadin-grid-column .renderer="${this.divisionRenderer}" header="Division"></vaadin-grid-column>
        <vaadin-grid-column path="score_1" header="Score 1" text-align="end"></vaadin-grid-column>
        <vaadin-grid-column path="score_2" header="Score 2" text-align="start"></vaadin-grid-column>
        <vaadin-grid-column .renderer="${this.moreRenderer}" header="Matchroom"></vaadin-grid-column>
      </vaadin-grid>
    `;
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
