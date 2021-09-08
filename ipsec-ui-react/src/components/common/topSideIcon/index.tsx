import React, { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

interface ITopSideIcon {
  children: ReactNode;
}

export const TopSideIcon: FC<ITopSideIcon> = ({ children }) => <div className="action__box">{children}</div>;
