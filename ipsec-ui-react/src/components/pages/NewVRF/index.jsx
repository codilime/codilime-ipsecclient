import React from 'react';
import { Endpoints, Modal, Visualization } from 'template';
import { Button } from 'common';
import { useModalLogic } from 'hooks';
import './styles.scss';

export const NewVRF = () => {
  const { show, handleToggleModal } = useModalLogic();

  return (
    <section className="vrf">
      <header className="vrf__header">
        <span>Vrfs / New VRF</span>
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
