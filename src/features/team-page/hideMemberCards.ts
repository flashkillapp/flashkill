import '../../components/HideMemberCardsButton';

export const hideMemberCards = (): void => {
  const membersHeader = document.querySelector('.league-team-members .section-title');
  const button = document.createElement('flashkill-hide-member-cards-button');
  membersHeader?.appendChild(button);

  const membersContent = document.querySelector('.league-team-members .section-content');
  membersContent?.classList.toggle('hidden');
};
