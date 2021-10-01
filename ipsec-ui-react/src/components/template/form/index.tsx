import { FC } from 'react';
import { useCreateVRFMainView } from 'hooks/';
import { Wrapper, Vlan } from 'template';
import { Button } from 'common/';
import './styles.scss';

export const FormDetail: FC = () => {
  const { handleSubmit, submit, setValue, reset, isDirty, displayDetails, hardware, errors } = useCreateVRFMainView();

  return (
    <Wrapper title="VRF details">
      <form autoComplete="off" className="form" onSubmit={handleSubmit(submit)}>
        <fieldset className="form__fieldset">
          <div className="form__details">{displayDetails}</div>
          {!hardware && <Vlan {...{ setValue, reset, errorSchema: errors['vlans'] }} />}
        </fieldset>
        <Button className="form__btn" disabled={!isDirty}>
          Save changes
        </Button>
      </form>
    </Wrapper>
  );
};
