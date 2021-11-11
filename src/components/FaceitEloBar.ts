import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getFaceitLevel } from '../util/getFaceitLevel';

const flashkillFaceitEloBar = 'flashkill-faceit-elo-bar';

@customElement(flashkillFaceitEloBar)
class FaceitEloBar extends LitElement {
  @property({ type: Number }) elo1!: number;
  @property({ type: Number }) elo2!: number;

  private static height = 30;

  static styles = css`
    .root {
      width: 100%;
      height: ${FaceitEloBar.height}px;
    }

    .mask-rect {
      width: 100%;
      fill: white;
    }

    .mask-divider {
      width: 4px;
      height: ${FaceitEloBar.height}px;
    }

    .mask-text {
      font-weight: bold;
      stroke-width: 1px;
      text-anchor: middle;
    }

    .bar {
      height: ${FaceitEloBar.height}px;
    }

    .eloBar {
      fill-opacity: 0.8;
      mask: url(#mask);
    }
  `;

  render() {
    const roundedElos = [this.elo1, this.elo2].map((elo) => Math.floor(elo));
    const colors = roundedElos.map((roundedElo) => getFaceitLevel(roundedElo)?.color);
    const totalElo = roundedElos[0] + roundedElos[1];
    const percentage = (100 * roundedElos[0]) / totalElo;
    const remainder = 100 - percentage;

    return html`
      <style>
        .mask-divider {
          transform: translateX(calc(${percentage}% - 2px));
        }

        .eloLeft {
          transform: translateX(calc(${percentage / 2}%)) translateY(calc(50% + 22px));
        }

        .eloRight {
          transform: translateX(calc(${percentage + ((100 - percentage) / 2)}%)) translateY(calc(50% + 22px));
        }
      </style>

      <svg class="root">
        <defs y="50%">
          <mask id="mask">
            <rect class="bar mask-rect" x="0px" rx="20"/>
            <rect class="mask-divider"/>
            <text class="mask-text eloLeft" y="-50%">
              ${`${roundedElos[0]} Elo`}
            </text>
            <text class="mask-text eloRight" y="-50%">
              ${`${ roundedElos[1] } Elo`}
            </text>
          </mask>
        </defs>

        <rect class="bar eloBar" fill=${colors[0]} width="${percentage}%"/>
        <rect class="bar eloBar" fill=${colors[1]} width="${remainder}%" x="${percentage}%"/>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [flashkillFaceitEloBar]: FaceitEloBar,
  }
}
