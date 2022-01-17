import { FC } from 'react';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicRestConfForm } from 'db';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { restConfSchema } from 'schema/';
import { RestConfType } from 'interface/index';
import classNames from 'classnames';

interface RestConfFormType {
  handleSendRestConf: (data: RestConfType) => void;
  handleToggle: () => void;
}

export const RestConfForm: FC<RestConfFormType> = ({ handleSendRestConf, handleToggle }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(restConfSchema) });

  const displayForm = DynamicRestConfForm.map((input) => (
    <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false, className: 'loginForm__field' }} />
  ));

  return (
    <>
      <form className="loginForm">
        <fieldset className="loginForm__fieldset">{displayForm}</fieldset>
      </form>
      <div className="loginForm__submit">
        <Button className="loginForm__cancel" onClick={handleToggle}>
          cancel
        </Button>
        <Button className="loginForm__btn" onClick={handleSubmit(handleSendRestConf)}>
          Save changes
        </Button>
      </div>
    </>
  );
};
