/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { useCreateVRFMainView, useFetchData } from 'hooks/';
import { Wrapper, Vlan, CryptoField, Field } from 'template';
import { Button } from 'common/';
import classNames from 'classnames';
import './styles.scss';

export const FormDetail: FC = () => {
  const { handleSubmit, submit, reset, hardware, errors, formAttributes, control } = useCreateVRFMainView();
  const { fetchHardwareAlgoritm } = useFetchData();
  const { data, crypto, details, isDirty, setValue, register } = formAttributes;

  const displayDetails = details.map((el) => {
    if (el.name === 'crypto_ph1' || el.name === 'crypto_ph2') {
      return <CryptoField {...{ ...el, key: el.name, crypto: crypto[el.name], setValue, value: data[el.name], error: errors[el.name] }} />;
    }
    return <Field {...{ ...el, key: el.name, value: data[el.name], register: register(el.name), error: errors[el.name], className: 'field__detail' }} />;
  });

  return (
    <Wrapper title="VRF details">
      <form autoComplete="off" className="form">
        <fieldset className="form__fieldset">
          <div className={classNames('form__details', { form__details__hardware: hardware })}>
            {displayDetails}
            <div className="form__buttons">
              <Button className="form__btn" disabled={!isDirty} onSubmit={handleSubmit(submit)}>
                Save changes
              </Button>
              {hardware && (
                <Button className="form__btn" type="button" onClick={fetchHardwareAlgoritm}>
                  Crypto algorithms
                </Button>
              )}
            </div>
          </div>
          {!hardware && <Vlan {...{ control, reset, errorSchema: errors['vlan'] }} />}
        </fieldset>
      </form>
    </Wrapper>
  );
};
