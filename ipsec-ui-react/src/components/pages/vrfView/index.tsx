import React, { FC } from 'react';
import { Endpoints, Modal, Visualization, FormDetail, PopupLogs, PopupStatus, Spinner } from 'template';
import { useModalLogic, useVrfLogic, useToggle } from 'hooks/';
import { Button } from 'common/';
import './styles.scss';

export const VrfView: FC = () => {
  const { show, handleToggleModal } = useModalLogic();
  const { open, handleToggle } = useToggle();
  const {
    client_name,
    handleDelete,
    vrf: { loading },
    hardware
  } = useVrfLogic();

  const vrfName = client_name ? client_name : 'New VRF';

  const deleteBtn = !hardware && (
    <Button name="" btnDelete className="vrf__btn" onClick={handleToggleModal}>
      Delete VRF
    </Button>
  );

  const buttons = client_name && (
    <div className="vrf__box">
      <Button name="" className="vrf__btn" onClick={handleToggle}>
        View logs
      </Button>
      {deleteBtn}
    </div>
  );

  return (
    <>
      <section className="vrf">
        <header className="vrf__header">
          <span className="vrf__breadcrumb">
            VRFs / <span className="vrf__name">{vrfName}</span>
          </span>
          {buttons}
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
      <PopupLogs {...{ open, handleToggle }} />
      <PopupStatus />
    </>
  );
};
