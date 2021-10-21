import '@webcomponents/custom-elements';
import '@vaadin/vaadin-material-styles';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column-group';
import { LitElement, css, html, render, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { GridColumnElement, GridItemModel } from '@vaadin/vaadin-grid';

import { notNull } from '../util/index';
import { FaceitInfo } from '../model';
import { customTheme } from '../util/theme';
import { getSteamLink } from '../util/getLink';

const playerTable = 'flashkill-player-table';

interface PlayerTableItem {
  steamId64: string;
  steamName: string | null;
  faceitInfo: FaceitInfo | null;
}

const getSteamLogo = (): string => (
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/28px-Steam_icon_logo.svg.png'
);

const getFaceitLevelLogo = (faceitLevel: number): string => (
  `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`
);

const getFaceitLink = (name: string): string => (
  `https://www.faceit.com/en/players/${name}`
);

const arrayAvg = (arr: number[]): number => (
  arr.reduce((p, c) => p + c, 0) / arr.length
);

const avgFaceitElo = (faceitInfos: Array<FaceitInfo | null>): number => {
  return arrayAvg(
    faceitInfos
      .filter(notNull)
      .map(({ games }) => games.csgo.faceit_elo),
  );
};


@customElement(playerTable)
class PlayerTable extends LitElement {
  @property({ type: Array }) playerItems!: PlayerTableItem[];

  static styles = css`
    ${customTheme}

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
      <vaadin-grid .items="${this.playerItems}">
        <vaadin-grid-column path="faceitInfo.nickname" header="Faceit name"></vaadin-grid-column>
        <vaadin-grid-column
          path="faceitInfo.games.csgo.faceit_elo"
          header="Faceit Elo"
          text-align="end"
        ></vaadin-grid-column>
        <vaadin-grid-column header="Profile" .renderer="${this.profilesRenderer}"></vaadin-grid-column>
      </vaadin-grid>
    `;
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

    render(
      html`
        <div class="profiles">
          ${faceitRenderer(rowData.item.faceitInfo)}
          <a href=${getSteamLink(rowData.item.steamId64)} target="_blank">
            <img class="steam-logo" src="${getSteamLogo()}"/>
          </a>
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
