import React, { useState, useEffect, useContext } from "react";

import Body from "./components/Body";
import Home from "./views/Home";
import Layout from "./components/Layout";

import { BlockTitle } from "../../../components/Component";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { saveSearchDirectory } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";

const FileManager = () => {
  const isLinkClicked = useSelector(state => state.folders.documentUrl);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory([]))
    // if (isLinkClicked) {
      // navigate(isLinkClicked)
      // window.open(isLinkClicked, '_blank', 'noopener,noreferrer');
      // window.location = isLinkClicked
      // navigate(`${isLinkClicked.split("#")[1]}`)
    // }
  }, [])
  return (
    <Layout>
      <Body 
      // title={
      //   <BlockTitle page>Home</BlockTitle>
      // }
      >
        <Home />
      </Body>
    </Layout>
  );
};

export default FileManager;
