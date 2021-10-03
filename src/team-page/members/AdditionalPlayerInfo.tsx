import React from 'dom-chef';
import { PlayerInfo } from "../../model/PlayerInfo";
import { getSteamLink } from "../../util/getSteamLink";

const getFaceitLevel = (faceitLevel: number): string => (
  `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`
);

const getFaceitLink = (name: string): string => (
  `https://www.faceit.com/en/players/${name}`
);


interface AdditionalPlayerInfoProps {
  playerInfo: PlayerInfo;
}

export const AdditionalPlayerInfo = ({
  playerInfo: { steamId, steamName, faceitInfo },
}: AdditionalPlayerInfoProps): JSX.Element | null => {
  const {
    nickname,
    games: {
      csgo: {
        faceit_elo,
        skill_level,
      }
    }
  } = faceitInfo;

  return (
    <div style={{ display: 'inline-block' }}>
      <div
        className="txt-subtitle"
        style={{
          paddingTop: 5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        Steam:
        <a href={getSteamLink(steamId)} target="_blank">
          {steamName}
        </a>
      </div>
      {faceitInfo !== null && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="txt-subtitle" style={{ marginBottom: 0 }}>
            FACEIT:
            <a href={getFaceitLink(nickname)} target="_blank">
              {faceit_elo}
            </a>
          </div>
          <a href={getFaceitLink(nickname)} target="_blank">
            <img
              src={getFaceitLevel(skill_level)}
              alt={`${skill_level}`}
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                width: 28,
                height: 28,
              }}
            />
          </a>
        </div>
      )}
    </div>
  );
};
