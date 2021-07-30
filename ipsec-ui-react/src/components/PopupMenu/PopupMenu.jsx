import React, { Component } from "react";

class PopupMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showMenu: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        this.setState({ showMenu: true }, () => {
            document.addEventListener("click", this.closeMenu, {
                capture: true,
            });
        });
    }

    closeMenu(event) {
        if (this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
            this.setState({ showMenu: false }, () => {
                document.removeEventListener("click", this.closeMenu);
            });
        }
    }

    render() {
        let menu = (
            <ul
                className="popupContents"
                ref={(element) => {
                    this.dropdownMenu = element;
                }}
            >
                {this.props.children}
            </ul>
        );

        return (
            <span className="popupMenu" {...this.props}>
                <i
                    className="popupTrigger fas fa-ellipsis-v"
                    onClick={this.showMenu}
                />
                {this.state.showMenu ? menu : null}
            </span>
        );
    }
}

export default PopupMenu;
