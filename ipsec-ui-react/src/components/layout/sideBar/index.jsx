import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { VrfsContext } from "context";
import { Button } from "common";
import "./styles.scss";

export const SideBar = () => {
    const location = useLocation();
    const activeVrf = parseInt(location.pathname.split("/vrf/")[1]);
    const { vrfs } = useContext(VrfsContext);    const listContext =
        vrfs !== [] ? (
            vrfs.map(({ client_name, id }) => (
                <li
                    className={`sideBar__eachVrf ${
                        id === activeVrf ? "sideBar__eachVrf--active" : ""
                    }`}
                    key={id}
                >
                    <Link to={`/vrf/${id}`} className="sideBar__link">
                        {client_name}
                    </Link>
                </li>
            ))
        ) : (
            <li>no connections</li>
        );    return (
        <div className="sideBar">
            <ul className="sideBar__list">{listContext}</ul>
            <div className="sideBar__addNew">
                <Button className="sideBar__btn"><Link to='/vrf/create' className='sideBar__btnLink'>Add a new VRF</Link></Button>
            </div>
        </div>
    );
};