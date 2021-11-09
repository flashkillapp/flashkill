import '../../components/ToggleContentButton';
import { flashkillToggleContentButton } from '../../components/ToggleContentButton';
import { component } from '../../util/component';

export const addHideMemberCardsButton = (): void => {
  const membersHeader = document.querySelector('.league-team-members .section-title');
  const toggleMemberCardsButton = component(
    flashkillToggleContentButton,
    {
      label: 'Mitglieder',
      selector: '.league-team-members .section-content',
    },
  );
  membersHeader?.appendChild(toggleMemberCardsButton);
};
