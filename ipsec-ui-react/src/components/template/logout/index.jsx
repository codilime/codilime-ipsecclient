import React from 'react';
import { TopSideIcon } from 'common';
import { FiLogOut } from 'react-icons/fi';
import { useLoginLogic } from 'hooks';

export const Logout = () => {
  const { handleLogout } = useLoginLogic();
  return (
    <TopSideIcon>
      <FiLogOut className="topBar__icon" onClick={handleLogout} />
    </TopSideIcon>
  );
};
