import React, { FC } from 'react';
import { FiLogOut } from 'react-icons/fi';

import { TopSideIcon } from 'common';
import { useLoginLogic } from 'hooks';

export const Logout: FC = () => {
  const { handleLogout } = useLoginLogic();
  return (
    <TopSideIcon>
      <FiLogOut className="topBar__icon" onClick={handleLogout} />
    </TopSideIcon>
  );
};
