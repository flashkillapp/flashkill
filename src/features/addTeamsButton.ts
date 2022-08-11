import { baseURL99 } from '../util/getLink';

export const addTeamsButton = (): void => {
  const nextLi = document.querySelector('#header-nav > nav > ul > li:nth-child(3)');

  const teamsA = document.createElement('a');
  teamsA.href = `${baseURL99}/leagues/teams`;
  teamsA.textContent = 'Teams';
  const teamsLi = document.createElement('li');
  teamsLi.appendChild(teamsA);

  nextLi?.parentNode?.insertBefore(teamsLi, nextLi);
};