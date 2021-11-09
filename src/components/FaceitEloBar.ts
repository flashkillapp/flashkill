import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getFaceitLevel } from '../util/getFaceitLevel';

const faceitEloBar = 'flashkill-faceit-elo-bar';

@customElement(faceitEloBar)
class FaceitEloBar extends LitElement {
  @property({ type: Number }) elo1!: number;
  @property({ type: Number }) elo2!: number;

  static styles = css`
    .root {
      width: 100%;
      height: 30px;
    }

    .divider {
      width: 4px;
      height: 30px;
    }

    .bar {
      height: 30px;
    }

    .eloBar {
      fill-opacity: 0.8;
      clip-path: url(#round-corners);
    }

    .eloText {
      stroke-width: 1px;
      text-anchor: middle;
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
        .divider {
          transform: translateX(calc(${percentage}% - 2px));
        }

        .eloTextLeft {
          transform: translateX(calc(${percentage / 2}%)) translateY(calc(50% + 22px));
        }

        .eloTextRight {
          transform: translateX(calc(${percentage + ((100 - percentage) / 2)}%)) translateY(calc(50% + 22px));
        }
      </style>

      <svg class="root">
        <defs y="50%">
          <clipPath id="round-corners" >
            <rect class="bar" x="0px" width="100%" rx="20"/>
          </clipPath>
        </defs>

        <rect class="bar eloBar" fill=${colors[0]} width="${percentage}%"/>
        <rect class="bar eloBar" fill=${colors[1]} width="${remainder}%" x="${percentage}%"/>
        <rect class="divider"/>

        <text class="eloText eloTextLeft" y="-50%">
          ${`${roundedElos[0]} Elo`}
        </text>

        <text class="eloText eloTextRight" y="-50%">
          ${`${ roundedElos[1] } Elo`}
        </text>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [faceitEloBar]: FaceitEloBar,
  }
}
