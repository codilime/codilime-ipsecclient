import { FC } from 'react';
import { useCreateVRFMainView } from 'hooks/';
import { Wrapper, Vlan, CryptoField, Field } from 'template';
import { Button } from 'common/';
import './styles.scss';

export const FormDetail: FC = () => {
  const { handleSubmit, submit, reset, hardware, errors, formAttributes } = useCreateVRFMainView();
  const { data, crypto, details, isDirty, setValue, register } = formAttributes;

  const displayDetails = details.map((el) => {
    if (el.name === 'crypto_ph1' || el.name === 'crypto_ph2') {
      return <CryptoField {...{ ...el, key: el.name, crypto: crypto[el.name], setValue, value: data[el.name], error: errors[el.name] }} />;
    }
    return <Field {...{ ...el, key: el.name, value: data[el.name], register: register(el.name), error: errors[el.name], className: 'field__detail' }} />;
  });

  return (
    <Wrapper title="VRF details">
      <form autoComplete="off" className="form" onSubmit={handleSubmit(submit)}>
        <fieldset className="form__fieldset">
          <div className="form__details">{displayDetails}</div>
          {!hardware && <Vlan {...{ setValue, reset, errorSchema: errors['vlan'] }} />}
        </fieldset>
        <Button className="form__btn" disabled={!isDirty}>
          Save changes
        </Button>
      </form>
    </Wrapper>
  );
};
