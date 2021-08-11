import React from 'react';
import { Endpoints, Modal, Visualization } from 'template';
import { Button } from 'common';
import { useModalLogic, useVrfLogic } from 'hooks';

export const DetailViewVrf = () => {
  const { vrf } = useVrfLogic();
  const { show, handleToggleModal } = useModalLogic();

  return (
    <section>
      <header className="vrf__header">
        <span>
          Vrfs /<span className="newVrf__name">{vrf.client_name}</span>
        </span>
        <Button btnDelete className="vrf__btn" onClick={handleToggleModal}>
          Delete VRF
        </Button>
      </header>
      <article>
        <Endpoints />
        <Visualization />
      </article>
      <Modal btnDelete {...{ show, handleToggleModal }} header="Delete VRF" leftButton="cancel" rightButton="delete">
        Are you sure you want to delete this VRF? this action cannot be undone
      </Modal>
    </section>
  );
};
