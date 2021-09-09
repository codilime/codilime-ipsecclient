import React, { FC } from 'react';

import { useCreateVRFMainView } from 'hooks';
import { Wrapper, Vlan } from 'template';
import { Button } from 'common';

import './styles.scss';

export const FormDetail: FC = () => {
  const { handleSubmit, submit, isDirty, displayDetails, setValue, hardware } = useCreateVRFMainView();

  return (
    <Wrapper title="VRF details">
      <form autoComplete="off" className="form" onSubmit={handleSubmit(submit)}>
        <fieldset className="form__fieldset">
          <div className="form__details">{displayDetails}</div>
          {!hardware && <Vlan {...{ setValue }} />}
        </fieldset>
        <Button className="form__btn" disabled={!isDirty}>
          Save changes
        </Button>
      </form>
    </Wrapper>
  );
};
