/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Button } from 'common/';
import { EachEndpoint, Wrapper } from 'template';
import { useCreateEndpointTable } from 'hooks/';
import classNames from 'classnames';
import { EndpointTableConst, newVrf } from 'interface/enum';
import './styles.scss';

const { pskCertificates, nat, bgp, action, remote } = EndpointTableConst;

export const Endpoints: FC = () => {
  const { currentLocation, open, EndpointSchema, vrfEndpoints, headerSchema, handleActionVrfEndpoints, handleToggle } = useCreateEndpointTable();

  const dynamicHeader = headerSchema.map(({ header }) => (
    <th
      key={header}
      className={classNames('table__header__column', {
        table__bool: header === nat || header == bgp || header === action || header == remote,
        table__psk: header === pskCertificates
      })}
    >
      {header}
    </th>
  ));

  const dynamicCreateEndpoint = vrfEndpoints && vrfEndpoints.map((el, index) => <EachEndpoint key={index} {...{ active: false, currentEndpoint: el, id: index, handleActionVrfEndpoints }} />);

  const createNewEndpoint = open && currentLocation !== newVrf && <EachEndpoint {...{ active: true, currentEndpoint: EndpointSchema,vrfEndpoints,  handleActionVrfEndpoints, id: null }} />;

  return (
    <Wrapper {...{ wrapperClass: 'table__wrapper', className: 'table__wrapper', title: 'Endpoints' }}>
      <table className="table">
        <thead className="table__header">
          <tr className="table__row--header">{dynamicHeader}</tr>
        </thead>
        <tbody className="table__body">
          {dynamicCreateEndpoint}
          {createNewEndpoint}
          <tr className="table__addBtn">
            <td className="table__columnBtn">
              <Button disabled={currentLocation === newVrf} onClick={handleToggle} className="table__btn">
                {open ? 'Close' : 'Add a new endpoint'}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  );
};
