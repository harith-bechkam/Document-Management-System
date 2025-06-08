import React from "react";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import FileManagerAside from "./Aside";
import { useFileManager } from "./Context";
import { useSelector } from "react-redux";
import { Spinner } from "reactstrap"
import { useLocation } from "react-router";
import { useTheme } from "../../../../layout/provider/Theme";

import { findLogoName } from "../../../../utils/Utils";
import { LinkList, LinkItem } from "../../../../components/links/Links";
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";


const FileManagerLayout = ({ ...props }) => {
  const location = useLocation();
  const { fileManager } = useFileManager();
  const theme = useTheme();
  const store = useSelector(state => state.folders);
  const toggle = () => setOpen((prevState) => !prevState);

  return (
    <>
      <Head title={props.title || "File Manager"}></Head>
      <Content>
        <div className="nk-fmg">

          <FileManagerAside />

          <div
            className={`nk-fmg-body heightsetter ${store.loader ? "loading" : ""} ${location.pathname.includes('accessOverview') ? (theme.skin == 'light' ? "accessOverview" : '') : ""}`}
          >
            {props.children}
          </div>

          {store.loader &&
            <div className='loader'>
              <Spinner size="sm" />
              <span className="loading-text">{store.loaderText}...</span>
            </div>
          }

        </div>
      </Content>
    </>
  );
};

export default FileManagerLayout;
