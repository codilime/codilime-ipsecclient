import React from 'react';
import { Endpoints, Modal, Visualization, FormDetail } from 'template';
import { Button } from 'common';
import { useModalLogic, useVrfLogic } from 'hooks';
import './styles.scss';

const VrfView = () => {
  const { show, handleToggleModal } = useModalLogic();
  const { client_name, handleDelete } = useVrfLogic(handleToggleModal);

  const vrfName = client_name ? client_name : 'New VRF';

  return (
    <section className="vrf">
      <header className="vrf__header">
        <span>Vrfs / {vrfName}</span>
        <Button btnDelete className="vrf__btn" onClick={handleToggleModal}>
          Delete VRF
        </Button>
      </header>
      <article>
        <FormDetail />
        <Endpoints />
        <Visualization />
      </article>
      <Modal btnDelete {...{ show, handleToggleModal, handleDelete }} header="Delete VRF" leftButton="cancel" rightButton="delete">
        Are you sure you want to delete this VRF? this action cannot be undone
      </Modal>
    </section>
  );
};
export default VrfView;
