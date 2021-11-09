import '../../components/ToggleContentButton';
import { component } from '../../util/component';

export const addHideMemberCardsButton = (): void => {
  const membersHeader = document.querySelector('.league-team-members .section-title');
  const button = component(
    'flashkill-toggle-content-button',
    {
      label: 'Mitglieder',
      selector: '.league-team-members .section-content',
    },
  );
  membersHeader?.appendChild(button);
};
