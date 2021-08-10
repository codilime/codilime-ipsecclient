import React from 'react';

import { FormDetail } from 'template';
import { useVrfLogic } from 'hooks';

import { Button } from 'common';
import { Endpoints } from '../../template';

export function DetailViewVrf() {
  const { vrf } = useVrfLogic();
  console.log(vrf);

  return (
    <section>
      <article>
        <header className="vrf__header">
          <span>
            VRFs / <span className="newVrf__name">{vrf.client_name}</span>
            <Button btnDelete className="button">
              Delete
            </Button>
          </span>
        </header>
        <article>
          <FormDetail />
          <Endpoints />
        </article>
      </article>
    </section>
  );
}
