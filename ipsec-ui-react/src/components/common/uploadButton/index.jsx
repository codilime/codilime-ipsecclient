import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const UploadButton = ({ onClick, children, name, edit, className }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className })}>
      {children}
    </button>
  );
};

UploadButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string
};
