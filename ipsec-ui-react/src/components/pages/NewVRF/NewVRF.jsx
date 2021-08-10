import React from 'react';

import './NewVRF.scss';

import { FormDetail, Endpoints } from 'template';

export function NewVRF() {
  return (
      <section>
          <article>
              <header className="vrf__header">
          <span>
            Vrfs / <span className="newVrf__name">New VRF</span>
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
