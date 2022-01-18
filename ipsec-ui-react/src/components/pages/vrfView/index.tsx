import { FC } from 'react';
import { Endpoints, Modal, Visualization, FormDetail } from 'template';
import { useModalLogic, useVrfLogic, useGetVrfs } from 'hooks/';
import { Button } from 'common/';
import { MatchProps } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

export const VrfView: FC<MatchProps> = ({ match }) => {
  const { show, handleToggleModal } = useModalLogic();
  const {} = useGetVrfs(match.params.id);
  const { handleDelete, hardware } = useVrfLogic();

  return (
    <section className="vrf">
      <header className="vrf__header">
        <Button btnDelete className={classNames('vrf__btn', { vrf__btn__disabled: hardware || !match.params.id })} disabled={hardware || !match.params.id} onClick={handleToggleModal}>
          Delete VRF
        </Button>
      </header>
      <article>
        <FormDetail />
        <Endpoints />
        <Visualization />
      </article>
      <Modal btnDelete {...{ show, handleToggleModal, handleDelete, header: 'Delete VRF', leftButton: 'Cancel', rightButton: 'Delete' }}>
        Are you sure you want to delete this VRF? this action cannot be undone
      </Modal>
    </section>
  );
};
