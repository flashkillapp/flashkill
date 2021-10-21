import '@webcomponents/custom-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators';

const teamEloHeader = 'flashkill-team-elo-header';

@customElement(teamEloHeader)
class TeamEloHeader extends LitElement {
  @property({ type: Number }) avgElo!: number;

  static styles = css`
    :host {
      font: normal normal 600 25px/30px Roboto Condensed,sans-serif;
      color: #fff;
    }
  `;

  render() {
    const roundedElo = Math.round(this.avgElo);

    return html`
      <h2 title="Durchschnittliche FACEIT Elo">
        FACEIT Elo: ${Number.isFinite(roundedElo) ? roundedElo : '-'}
      </h2>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [teamEloHeader]: TeamEloHeader,
  }
}
