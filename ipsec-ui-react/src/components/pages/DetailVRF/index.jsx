import React from 'react';

import { Endpoints, Modal, Visualization } from 'template';
import { Button } from 'common';
import { useModalLogic, useVrfLogic } from 'hooks';
import { FormDetail } from "template";

export const DetailViewVrf = () => {
  const { vrf } = useVrfLogic();
  const { show, handleToggleModal } = useModalLogic();

  return (
    <section className="vrf">
      <header className="vrf__header">
        <span>
          VRFs / <span className="vrf__name">{vrf.client_name}</span>
        </span>
        <Button btnDelete className="vrf__btn" onClick={handleToggleModal}>
          Delete VRF
        </Button>
      </header>
      <article>
        <FormDetail />
        <Endpoints />
        <Visualization />
      </article>
      <Modal btnDelete {...{ show, handleToggleModal }} header="Delete VRF" leftButton="cancel" rightButton="delete">
        Are you sure you want to delete this VRF? this action cannot be undone
      </Modal>
    </section>
  );
};
