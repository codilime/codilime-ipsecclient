import { FC } from 'react';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicRestConfForm } from 'db';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { restConfSchema } from 'schema/';
import { RestConfType } from 'interface/index';

interface RestConfFormType {
  handleSendRestConf: (data: RestConfType) => void;
}

export const RestConfForm: FC<RestConfFormType> = ({ handleSendRestConf }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(restConfSchema) });

  const displayForm = DynamicRestConfForm.map((input) => <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false }} />);

  return (
    <form className="loginForm" onSubmit={handleSubmit(handleSendRestConf)}>
      <fieldset className="loginForm__fieldset">
        {displayForm}
        <div className="loginForm__submit">
          <Button className="loginForm__btn">Save changes</Button>
        </div>
      </fieldset>
    </form>
  );
};
