import React from 'react';
import { Endpoints, Modal, Visualization, FormDetail } from 'template';
import { useModalLogic, useVrfLogic } from 'hooks';
import { Button, Spinner } from 'common';
import './styles.scss';

const VrfView = () => {
  const { show, handleToggleModal } = useModalLogic();
  const { client_name, handleDelete } = useVrfLogic();

  const vrfName = client_name ? client_name : 'New VRF';
  return (
    <section className="vrf">
      <header className="vrf__header">
        <span>
          VRFs / <span className="vrf__name">{vrfName}</span>
        </span>
        <Button btnDelete className="vrf__btn" onClick={handleToggleModal}>
          Delete VRF
        </Button>
      </header>
      <article>
        <FormDetail />
        <Endpoints />
        <Spinner />
        <Visualization />
      </article>
      <Modal btnDelete {...{ show, handleToggleModal, handleDelete }} header="Delete VRF" leftButton="cancel" rightButton="delete">
        Are you sure you want to delete this VRF? this action cannot be undone
      </Modal>
    </section>
  );
};
export default VrfView;
