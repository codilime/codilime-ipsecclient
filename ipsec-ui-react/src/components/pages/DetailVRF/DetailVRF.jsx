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
            Vrfs / <span className="newVrf__name">{vrf.client_name}</span>
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
