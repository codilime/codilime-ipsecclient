import React from 'react';
import './styles.scss';

export const Spinner = () => {
  const spinner = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((dot, index) => (
    <div className="spinner__container" style={{ transform: `rotate(calc(18deg * ${index + 1}))` }} key={index}>
      <span className="spinner__cirlce" style={{ animationDelay: `calc(0.1s*${index + 1})` }}></span>
    </div>
  ));
  return <div className="spinner">{spinner}</div>;
};
