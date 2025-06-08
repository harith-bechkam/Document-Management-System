import React, { useState, useEffect } from "react";
import menu from "./MenuData";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge } from "reactstrap";

const MenuHeader = ({ item }) => {
  return (
    <li className="nk-menu-heading">
      <h6 className="overline-title text-primary">{item}-=</h6>
    </li>
  );
};

const MenuItem = ({ item, headActive }) => {
  const store = useSelector(state => state?.folders)

  const { subMenu, subPanel, text, link, newTab, badge, header } = item;

  if (header) {
    return <MenuHeader item={header}></MenuHeader>;
  } else
    return (
      <li
        className={`nk-menu-item ${subMenu ? "has-sub" : ""} ${process.env.PUBLIC_URL + link === window.location.pathname ? "active current-page" : ""
          } ${headActive ? "active current-page" : ""}`}
      >
        {newTab ? (
          <Link
            className="nk-menu-link"
            target="_blank"
            rel="noopener noreferrer"
            to={`${process.env.PUBLIC_URL + link}`}
          >
            <span className="nk-menu-text">{text}</span>
            {subPanel && <span className="nk-menu-badge">Hot</span>}
          </Link>
        ) : subMenu ? (
          <React.Fragment>
            <a
              href="#toggle"
              className="nk-menu-link nk-menu-toggle"
              onClick={(ev) => {
                ev.preventDefault();
              }}
            >
              <span className="nk-menu-text">{text}</span>
            </a>
            <MenuSub subMenu={subMenu} />
          </React.Fragment>
        ) : (
          <>
            <Link className="nk-menu-link" to={process.env.PUBLIC_URL + link}>
              <div>
                <span className="nk-menu-text position-relative d-inline-block">{text}</span>
                {badge && store?.notifyData?.metaCount != 0 && (
                  <Badge color="danger" pill className="position-absolute translate-middle metaapproval-badge-custom">
                    {store?.notifyData?.metaCount}
                  </Badge>
                )}
              </div>
              {/* {badge && <span className="nk-menu-badge">{store?.notifyData?.metaCount}</span>} */}
            </Link>

          </>
        )}
      </li>
    );
};

const MenuSub = ({ subMenu }) => {
  return (
    <ul className="nk-menu-sub">
      {subMenu.map((sub, index) => (
        <MenuItem item={sub} key={index} />
      ))}
    </ul>
  );
};

const checkMenuUrl = (data) => {
  for (const node of data.subMenu) {
    if (process.env.PUBLIC_URL + node.link === window.location.pathname) {
      return node;
    } else {
      const newNode = node.subMenu ? checkMenuUrl(node) : undefined;
      if (newNode) return newNode;
    }
  }
};

const findActiveHead = () => {

  let found;
  menu.forEach((item) => {

    if (item.subMenu) {
      let finding = item.subMenu.find((s) => process.env.PUBLIC_URL + s.link === window.location.pathname);
      if (finding) {
        found = item;
      } else {
        item.subMenu.forEach((p) => {
          if (p.subMenu) {
            let finding = checkMenuUrl(p);
            if (finding) {
              found = item;
            }
          }
        });
      }
    }

  });
  return found;
};

const Menu = () => {
  const [head, setHead] = useState("Admin Tools");
  let findingActiveHead = findActiveHead();

  const Privilege = JSON?.parse(localStorage.getItem('privileges'));
  const Role = localStorage.getItem('role');

  useEffect(() => {
    if (findingActiveHead) {
      setHead(findingActiveHead.text);
    }
  }, [window.location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps



  //mainMenu 
  if (Role !== 'Super Admin') {

    let filteredMenu = []
    const privileges = {
      viewUser: Privilege?.user?.viewUser,
      viewUserGrp: Privilege?.userGroup?.viewuserGroup,
      viewWorkflow: Privilege?.workflow?.viewWorkflow,
      viewAccessOverview: Privilege?.accessOverview?.viewAccessOverview,
      viewMetaData: Privilege?.metaData?.viewMetaData,
    }

    // const filteredMenu = menu.filter(item => item.text !== 'Admin Tools');

    if (privileges.viewUser == false) {
      filteredMenu = menu.filter(item => item.text !== 'Users');
      menu.length = 0;
      menu.push(...filteredMenu);
    }
    if (privileges.viewUserGrp == false) {
      filteredMenu = menu.filter(item => item.text !== 'User Groups');
      menu.length = 0;
      menu.push(...filteredMenu);
    }

    if (privileges.viewMetaData == false) {
      filteredMenu = menu.filter(item => item.text !== 'Metadata Approval');
      menu.length = 0;
      menu.push(...filteredMenu);
    }

    if (privileges.viewWorkflow == false) {
      // filteredMenu = menu.filter(item => item.text !== 'Workflow');
      // menu.length = 0;
      // menu.push(...filteredMenu);
      menu.forEach(item => {
        if (item.text === "Admin Tools") {
          item.subMenu = item.subMenu.filter(subItem => subItem.text !== "Templates");
        }
      });
      const filteredMenu = [...menu].filter(item => item.text !== 'Workflow');
      menu.length = 0;
      menu.push(...filteredMenu);

    }

    if (privileges.viewAccessOverview == false) {
      menu.forEach(item => {
        if (item.text === "Admin Tools") {
          item.subMenu = item.subMenu.filter(subItem => subItem.text !== "Access Overview");
        }
      });
    }

    if (privileges.viewMetaData === false) {
      menu.forEach(item => {
        if (item.text === "Admin Tools") {
          item.subMenu = item.subMenu.filter(subItem => subItem.text !== "Metadata");
        }
      });
    }



  }


  //subMenu
  menu.map(mainmenu => {
    if (mainmenu.text === 'Admin Tools') {

      const privileges = {
        viewAccessOverview: Privilege?.accessOverview?.viewAccessOverview,
        viewMetaData: Privilege?.metaData?.viewMetaData,
        viewWorkflow: Privilege?.workflow?.viewWorkflow,
      }

      mainmenu.subMenu = mainmenu.subMenu.filter(submenu => {
        if (submenu.link === '/accessOverview' && !privileges.viewAccessOverview) {
          return false
        }
        if (submenu.link === '/metaData' && !privileges.viewMetaData) {
          return false
        }
        if (submenu.link === '/workflow' && !privileges.viewWorkflow) {
          return false
        }

        return true
      })
    }
  })

  console.log(menu, "menu")
  return (
    <ul className="nk-menu nk-menu-main ui-s2">
      {menu.map((item, index) => {

        if (item.text == 'Metadata Approval') {
          return <MenuItem key={index} item={item} />
        }
        else {
          return <MenuItem key={index} item={item} />;
        }
        // if (item.text === head) {
        //   return <MenuItem key={index} item={item} headActive={true} />;
        // }
        // else 
      })}
    </ul>


  );
};

export default Menu;
