import React from 'react';

import './NewVRF.scss';

import { FormDetail } from 'template';

export function NewVRF() {
  return (
    <div className="new-vrf-connection-wrapper">
      <div className="new-vrf-top-bar">
      </div>
      <div className="new-vrf-data-container">
        <div className="vrf-section-header">VRF Details</div>
        <form>
          <FormDetail />
        </form>
      </div>
    </div>
  );
}
