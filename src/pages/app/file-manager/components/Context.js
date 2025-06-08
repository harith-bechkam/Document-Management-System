import React, { useState, createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from "react-router";
// import data, {files} from "../Data"; 

const FileManager = createContext();

const FileManagerUpdate = createContext();

export function useFileManager() {
  return useContext(FileManager);
}

export function useFileManagerUpdate() {
  return useContext(FileManagerUpdate);
}

const FileManagerProvider = ({ ...props }) => {

  const store = useSelector(state => state.folders);

  let fileRepo = store.fileRepo;

  const defaultFileManager = {
    filesView: localStorage.getItem('fileView') || 'list',
    search: '',
    asideVisibility: false,
    recoveryFilter: false,
    currentPlan: 'planid01',
    contentHeight: 0
  }
  const [fileManager, setFileManager] = useState(defaultFileManager);

  const fileManagerUpdate = {

    // toTrash: function (selector, value) {
    //   let index = fileManager.files.findIndex((item) => item.id === selector);
    //   fileManager.files[index].deleted = value;
    //   setFileManager({ ...fileManager })
    // },
    asideVisibility: function () {
      setFileManager({ ...fileManager, asideVisibility: !fileManager.asideVisibility })
    },
    asideHide: function () {
      setFileManager({ ...fileManager, asideVisibility: false })
    },
    filesView: function (value) {
      // debugger
      setFileManager({ ...fileManager, filesView: value })
    },
    recoveryFilter: function () {
      setFileManager({ ...fileManager, recoveryFilter: !fileManager.recoveryFilter })
    },
    currentPlan: function (value) {
      setFileManager({ ...fileManager, currentPlan: value })
    },
    search: function (value) {
      setFileManager({ ...fileManager, search: value })
    },
    contentHeight: function (value) {
      setFileManager({ ...fileManager, contentHeight: value })
    },
    // deleteFolder: function (folderId) {
    //   let index = fileManager.files.findIndex((item) => item.id === folderId);
    //   fileManager.files[index].deleted = true;
    //   setFileManager({ ...fileManager })
    // },
    // renameFolder: (folderId, newName) => {
    //   let index = fileManager.files.findIndex((item) => item.id === folderId);
    //   fileManager.files[index].name = newName;
    //   fileManager.files = fileManager.files.map(item => {
    //     if (item.parentId === folderId) {
    //       return {
    //         ...item,
    //         parentName: newName
    //       };
    //     }
    //     return item;
    //   });
    //   setFileManager({ ...fileManager });
    // },
    // uploadFolder: (arr) => {
    //   let folders = fileManager.files;
    //   folders = [...folders, ...arr]
    //   setFileManager({ ...fileManager, files: folders })
    // },
    // folderMove: (id, newParentId, newParentName) => {
    //   setFileManager(prev => ({
    //     ...prev,
    //     files: prev.files.map(folder => {
    //       if (folder.id === id) {
    //         return {
    //           ...folder,
    //           parentId: newParentId,
    //           parentName: newParentName
    //         };
    //       }
    //       return folder;
    //     })
    //   }));
    // },

  };



  return (
    <FileManager.Provider value={{ fileManager }}>
      <FileManagerUpdate.Provider value={{ fileManagerUpdate }}>
        {props.children}
      </FileManagerUpdate.Provider>
    </FileManager.Provider>
  );
};

export default FileManagerProvider;