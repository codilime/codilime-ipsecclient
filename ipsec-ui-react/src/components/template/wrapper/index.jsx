import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

export const Wrapper = ({ title, children,references }) => {
  return (
    <section className="wrapper">
      <div className="wrapper__header">
        <h3 className="wrapper__title">{title}</h3>
      </div>
      <div className="wrapper__content" ref={references}>{children}</div>
    </section>
  );
};

Wrapper.propTypes = {
  title: PropTypes.string.isRequired,
  references:PropTypes.any
};
