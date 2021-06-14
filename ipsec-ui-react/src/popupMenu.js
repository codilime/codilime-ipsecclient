// <PopupMenu style={{right: '-12px'}}>
//     <li onClick={() => handleOpenModalEdit(item.id)}>Edytuj</li>
//     <li onClick={() => confirmDelete(() => handleDelete(item.id))} className="red">Usuń</li>
// </PopupMenu>

// .popupMenu {
//     position: relative;
//     display: inline-block;
//     font-weight: normal;
//     text-align: left;
//
// .popupTrigger {
//         text-align: center;
//         width: 27px;
//         height: 32px;
//         padding-top: 8px;
//         color: #969AB8;
//         cursor: pointer;
//
//     &:hover {
//             color: @blackAlmost;
//         }
//     }
//
//     ul.popupContents {
//         position: absolute;
//         top: 32px;
//         right: 0;
//         z-index: 1;
//
//         list-style: none;
//         margin: 0;
//
//         color: @blackAlmost;
//         background-color: @white;
//         border: 1px solid @grey;
//         padding: 12px 18px;
//         border-radius: @borderRadius;
//
//         li {
//             white-space: nowrap;
//             word-break: keep-all;
//             margin-bottom: 8px;
//
//         &:hover {
//                 color: @greyDark;
//                 cursor: pointer;
//             }
//
//
//         &:last-of-type {
//                 margin-bottom: 0;
//             }
//
//             a { text-decoration: none; }
//         }
//     }
// }


import React, {Component} from 'react';

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
            document.addEventListener('click', this.closeMenu, {capture: true});
        });
    }

    closeMenu(event) {
        if (this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
            this.setState({ showMenu: false }, () => {
                document.removeEventListener('click', this.closeMenu);
            });
        }
    }

    render() {
        let menu = (
            <ul className="popupContents" ref={(element) => { this.dropdownMenu = element; }}>
                {this.props.children}
            </ul>
        );

        return (
            <span className="popupMenu" {...this.props}>
				<i className="popupTrigger fas fa-ellipsis-v" onClick={this.showMenu}/>
                {this.state.showMenu ? menu : null}
			</span>
        );
    }
}

export default PopupMenu