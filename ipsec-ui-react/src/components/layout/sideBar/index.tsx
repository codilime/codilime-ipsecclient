import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'common/';
import { useGetLocation, useGetVrfs, useThemeContext } from 'hooks/';
import { IoHardwareChip } from 'react-icons/io5';
import { HardwareId } from 'constant/';
import classNames from 'classnames';
import Logo from 'images/codilimeLogo.png';
import WhiteLogo from 'images/white_logo.png';
import './styles.scss';

export const SideBar: FC = () => {
  const { vrf } = useGetVrfs();
  const { currentLocation } = useGetLocation();
  const { theme } = useThemeContext();

  const listVrf = vrf.length
    ? vrf.sort((a, b): any => {
        if (a.id && b.id) {
          return a.id - b.id;
        }
      })
    : vrf;

  const listContext = vrf ? (
    listVrf.map(({ client_name, id }) => (
      <li className={classNames('sideBar__eachVrf', { sideBar__eachVrf__active: id == parseInt(currentLocation) })} key={id}>
        <Link to={`/vrf/${id}`} className={classNames('sideBar__link')}>
          {client_name} {id === parseInt(HardwareId) && <IoHardwareChip className="sideBar__icon" />}
        </Link>
      </li>
    ))
  ) : (
    <li>no connections</li>
  );

  return (
    <div className="sideBar">
      <div className="sideBar__logo">
        <img src={theme === 'dark' ? WhiteLogo : Logo} alt="Codilime logo" className="sideBar__image" />
      </div>
      <ul className="sideBar__list">{listContext}</ul>
      <div className="sideBar__addNew">
        <Button className="sideBar__btn">
          <Link to="/vrf/create" className="sideBar__btnLink">
            Add new VRF
          </Link>
        </Button>
      </div>
    </div>
  );
};
