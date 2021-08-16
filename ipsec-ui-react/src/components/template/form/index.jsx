import React from 'react';
import { useCreateVRFMainView } from 'hooks';
import { Wrapper, CryptoField } from 'template';
import { Button } from 'common';
import './styles.scss';

export function FormDetail() {
  const { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView, handleSubmit, submit } = useCreateVRFMainView(open);

  return (
    <Wrapper title="VRF details">
      <form autoComplete="off" className="form" onSubmit={handleSubmit(submit)}>
        <fieldset className="form__fieldset">
          <div className="form__column">{VRFColumnOneView}</div>
          <div className="form__column">{VRFColumnTwoView}</div>
          <div className="form__column">{VRFColumnThreeView}</div>
        </fieldset>
        <Button className="form__btn">Save changes</Button>
      </form>
    </Wrapper>
  );
}
