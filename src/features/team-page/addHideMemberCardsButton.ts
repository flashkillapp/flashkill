import '../../components/HideMemberCardsButton';

export const addHideMemberCardsButton = (): void => {
  const membersHeader = document.querySelector('.league-team-members .section-title');
  const button = document.createElement('flashkill-hide-member-cards-button');
  membersHeader?.appendChild(button);
};
