import { FC } from 'react';
import { EndpointButton } from 'common/';
import { EachEndpoint, Wrapper } from 'template';
import { useCreateEndpointTable } from 'hooks/';
import { newVrf, endpointTableConst } from 'constant/';
import classNames from 'classnames';
import './styles.scss';

const { pskCertificates, nat, bgp, action, remote } = endpointTableConst;

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

  const createNewEndpoint = open && currentLocation !== newVrf && <EachEndpoint {...{ active: true, currentEndpoint: EndpointSchema, handleActionVrfEndpoints, id: null }} />;

  const newEndpointButton = open ? 'Close' : 'Add a new endpoint';

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
              <EndpointButton disabled={currentLocation === newVrf} onClick={handleToggle} className="table__btn">
                {newEndpointButton}
              </EndpointButton>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  );
};
