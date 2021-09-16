import { FC } from 'react';
import { Endpoints, Modal, Visualization, FormDetail, PopupStatus, Cube } from 'template';
import { useModalLogic, useVrfLogic, useGetVrfs } from 'hooks/';
import { Button } from 'common/';
import { MatchProps } from 'interface/index';
import './styles.scss';

export const VrfView: FC<MatchProps> = ({ match }) => {
  const { show, handleToggleModal } = useModalLogic();
  const {} = useGetVrfs(match.params.id);

  const {
    client_name,
    handleDelete,
    vrf: { loading },
    hardware
  } = useVrfLogic();

  const vrfName = client_name ? client_name : 'New VRF';

  const deleteBtn = !hardware && (
    <Button btnDelete className="vrf__btn" onClick={handleToggleModal}>
      Delete VRF
    </Button>
  );

  return (
    <>
      <section className="vrf">
        <header className="vrf__header">
          <span className="vrf__breadcrumb">
            VRFs / <span className="vrf__name">{vrfName}</span>
          </span>
          {deleteBtn}
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
      <Cube {...{ loading }} />
      <PopupStatus />
    </>
  );
};
