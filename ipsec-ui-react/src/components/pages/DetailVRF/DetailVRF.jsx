import React from 'react';

import { FormDetail } from 'template';

import { Button } from 'common';

export function DetailViewVrf() {

  return (
    <div>
      <div className="vrf-detail-container">
        <Button className="btn red-btn delete-btn" textValue="Delete VRF" />
        <div className="vrf-detail-section-container">
          <div className="vrf-section-header">VRF Details</div>
          <FormDetail />
        </div>
      </div>
    </div>
  );
}
