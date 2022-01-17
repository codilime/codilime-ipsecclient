import { FC } from 'react';
import { useCreateVRFMainView } from 'hooks/';
import { Wrapper, Vlan, CryptoField, Field } from 'template';
import { Button } from 'common/';
import classNames from 'classnames';

import './styles.scss';

export const FormDetail: FC = () => {
  const { handleSubmit, submit, reset, hardware, errors, formAttributes, control } = useCreateVRFMainView();
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
          <div className={classNames('form__details', { form__details__hardware: hardware })}>
            {displayDetails}
            <div className="form__buttons">
              <Button className="form__btn" disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          </div>
          {!hardware && <Vlan {...{ control, reset, errorSchema: errors['vlan'] }} />}
        </fieldset>
      </form>
    </Wrapper>
  );
};
