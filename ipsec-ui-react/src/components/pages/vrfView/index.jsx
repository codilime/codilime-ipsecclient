import React from 'react';
import { Endpoints, Modal, Visualization, FormDetail, StatusModal } from 'template';
import { useModalLogic, useVrfLogic } from 'hooks';
import { Button, Spinner } from 'common';
import './styles.scss';

export const VrfView = () => {
  const { show, handleToggleModal } = useModalLogic();
  const {
    client_name,
    handleDelete,
    vrf: { loading },
    hardware,
    error,
    success
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
      <Spinner {...{ loading }} />
      <StatusModal {...{ error, success, text: error }} />
    </>
  );
};
