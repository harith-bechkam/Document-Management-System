import React, { useEffect, useState } from "react";
import { Icon } from "../../../../components/Component";
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from "../components/Icons"
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment/moment';
import { folderCopy, updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import Swal from "sweetalert2";
import { Tooltip } from 'reactstrap';


const Move = ({ totalfiles, file, toggle, toggleCreate, copySelected, multiselected, setSelectedFiles }) => {
  const location = useLocation();
  const navigationBar = useSelector(state => state.folders.navigation);
  const currentPath = useSelector(state => state.folders.currentDirectory);
  const currentSection = useSelector(state => state.folders.currentSection);
  const dispatch = useDispatch();

  const [checked, setChecked] = useState(null);
  const [checkedData, setCheckedData] = useState(null);


  const [tempArr, setTempArr] = useState([]);
  const [directoryPath, setDirectoryPath] = useState([]);
  const loaderFlag = useSelector(state => state.folders.loader);

  // const [tooltipOpen, setTooltipOpen] = useState(false);
  // const toggleTooltip = () => setTooltipOpen(!tooltipOpen);


  async function getFirstLevel() {
    setDirectoryPath([])
    const folderRespo = await API.getNextFolderListMove('0', '', currentSection);
    if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
    setTempArr(folderRespo.data)
  }

  useEffect(() => {
    getFirstLevel();
    debugger
    if (copySelected && copySelected.sharedWith?.users?.some(userObj => userObj.inherit)) {
      sharedUsersAlert();
    }
  }, [])

  const [selected, setSelected] = useState("");

  function sharedUsersAlert() {
    Swal.fire({
      title: "Change who has access?",
      text: `Everyone who can see ${copySelected.parentFolder?.name} will lose access to ${copySelected.name} unless this item is shared directly with them`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Accept",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
      } else if (result.isDenied) {
        toggle()
      }
    });
  }


  async function findChildren(item) {
    let folderRespo;
    if (item.type == 'folder') {
      folderRespo = await API.getNextFolderListMove(`1`, item._id, null);
      setDirectoryPath(directoryPath => {
        const index = directoryPath.findIndex(val => val._id === item._id);
        if (index === -1) {
          return [...directoryPath, item];
        } else {
          return directoryPath.slice(0, index + 1);
        }
      });
    } else {
      setDirectoryPath(directoryPath => {
        const index = directoryPath.findIndex(val => val._id === item._id);
        if (index === -1) {
          return [...directoryPath, item];
        } else {
          return directoryPath.slice(0, index + 1);
        }
      });
      folderRespo = await API.getNextFolderListMove(`1`, item._id, item._id);
    }
    if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
    setTempArr(folderRespo.data)
  }

  const continueMultiMoveProcess = async (permission) => {

    dispatch(updateLoaderFlag({ loader: true, text: "Moving" }));

    const moveRespo = await API.docsMove(multiselected.files, multiselected.folders, multiselected.forms, multiselected.shortcutFiles, multiselected.shortcutFolders, multiselected.shortcutForms, checked, permission)
    if (!moveRespo) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error('error occured during moving documents'.replace(/\b\w/g, char => char.toUpperCase()))
    }

    dispatch(updateLoaderFlag({ loader: false, text: "" }));

    dispatch(updateMoveFlag({}))
    toast.success(`Documents moved successfully`);
    setSelectedFiles([])
    toggle()
  }



  async function extractFilesAndForms(folders) {
    let files = []
    let forms = []

    function traverse(folder) {
      if (folder.data) {
        if (folder.data.files) {
          files.push(...folder.data.files.map(file => ({ ...file, type: "file" })))
        }
        if (folder.data.forms) {
          forms.push(...folder.data.forms.map(form => ({ ...form, type: "form" })))
        }
      }
      if (folder.children && folder.children.length > 0) {
        folder.children.forEach(traverse)
      }
    }

    folders.forEach(traverse)
    return { files, forms }
  }

  async function moveSelectedFile(bool = false) {
    if (!bool) return;

    //if folder is selected
    //all files inside folders is starting workflow by calling updateWorklfowInFilesAPI
    //leave that folder alone
    //remaining multi select folder move - using continueMultomoveprocesss
    //remaining single select folder move - using continueprocesss

    if (multiselected) {

      // console.log(multiselected, "multiselected")

      let showfiles = ``
      var fullScenario = [...totalfiles]
      let idsToFind = new Set()
      var hasFolder = false
      var fulldata = null

      if (multiselected.folders?.length != 0) {
        hasFolder = true
        fullScenario = fullScenario.filter(it => it['type'] != 'folder')

        try {
          var childResponse = await API.getChildLevelsForFolders(multiselected.folders)
          var { status, data } = childResponse

          if (status) {
            fulldata = await extractFilesAndForms(data)

            if (fulldata['files'].length != 0) {
              showfiles = fulldata['files'].map((da) => `${da.name}`).join("<br>");
              fullScenario.push(...fulldata['files'])
            }

            if (fulldata['forms'].length != 0) {
              showfiles = fulldata['forms'].map((da) => `${da.name}`).join("<br>");
              fullScenario.push(...fulldata['forms'])
            }

          }
        }
        catch (err) {
          toast.error(`An Error Occurred While getting Child Level Folders - ${err}`)
          console.error('An Error Occurred While getting Child Level Folders -', err)
        }
      }

      if (hasFolder) {
        var a = fulldata['forms'].map(it => it['_id'])
        var b = fulldata['files'].map(it => it['_id'])

        if (a.length == 0 && b.length == 0) {
          await acceptPermissions()
          return
        }

        idsToFind = new Set([...multiselected.files, ...a, ...b, ...multiselected.forms])
      }
      else {
        idsToFind = new Set([...multiselected.files, ...multiselected.folders, ...multiselected.forms])
      }

      // console.log(idsToFind, "idsToFind")
      // console.log(fullScenario, "fullScenario")
      const matchedItems = fullScenario?.filter(item => idsToFind.has(item._id))?.map(item => ({ ...item, ishavingworkflow: item.WorkflowHistoryId != null && item.WorkflowHistoryId != '' }))
      // console.log(matchedItems, "matchedItems")

      if (checkedData['workflow']) {

        var noneworkflow = matchedItems.every(item => item.ishavingworkflow == false)
        var allHaveWorkflow = matchedItems.every(item => item.ishavingworkflow == true)

        if (noneworkflow) {
          showfiles = ''
          showfiles += matchedItems.map((da) => `${da.name}`).join("<br>");

          let showText = `
                    <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                    <p>Do you want to inherit the parent workflow for your moving items?</p>
                    <hr>
                    <h5>Selected Items:</h5>
                    <p>     ${showfiles.split("<br>")
              .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
              .join("<br>")
            }</p>
                  `;

          Swal.fire({
            title: "Workflow Permission",
            html: showText,
            icon: "question",
            showDenyButton: true,
            confirmButtonText: "Inherit Workflow",
            denyButtonText: "Skip",
            showCloseButton: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "450px",
            customClass: {
              popup: "swal-custom-popup",
              title: "swal-custom-title",
              confirmButton: "swal-custom-button",
              denyButton: "swal-custom-deny-button",
            }
          }).then(async (result) => {
            if (result.isConfirmed) {
              for await (let item of matchedItems) {

                await checkAndStartWorkflow(item, checkedData)
              }
              // await continueMultiMoveProcess()
              await acceptPermissions();
            }
            else if (result.isDenied) {
              // await continueMultiMoveProcess()
            }
          })
        }
        else if (allHaveWorkflow) {
          var showText = ``
          showfiles = ''
          matchedItems.map((da, idx) => {
            showfiles += `<li>${idx + 1}. ${da['name']}</li><br>`
          })

          showText = `
          <p style="font-size: 14px; color: #555;">The following items already have an active workflow:</p>
          <ul style="text-align: left; padding-left: 20px; font-size: 14px; color: #333;">
                 ${showfiles
              .split("<br>")
              .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
              .join("<br>")
            }
          </ul>
        `;

          Swal.fire({
            title: "Workflow Notification",
            html: showText,
            icon: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "400px",
            customClass: {
              popup: "swal-custom-popup",
              title: "swal-custom-title",
              confirmButton: "swal-custom-button"
            }
          }).then(async (result) => {
            if (result.isConfirmed) {
              // await continueMultiMoveProcess()
              await acceptPermissions()
            }
          })
        }
        else {
          //  mixed 
          let havingFiles = matchedItems
            .filter((da) => da?.ishavingworkflow)
            .map((da) => `${da.name}`)
            .join("\n<br>");

          let notHavingFiles = matchedItems
            .filter((da) => !da?.ishavingworkflow)
            .map((da) => `${da.name}`)
            .join("\n<br>");


          let havingFilesArray = havingFiles.split("<br>");
          let notHavingFilesArray = notHavingFiles.split("<br>");

          let limitedHavingFiles = havingFilesArray.slice(0, 3).join("<br>");
          let remainingHavingFiles = havingFilesArray.slice(3).join("\n");

          let limitedNotHavingFiles = notHavingFilesArray.slice(0, 3).join("<br>");
          let remainingNotHavingFiles = notHavingFilesArray.slice(3).join("\n");

          let showText = `
                <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                <p>Do you want to inherit the parent workflow for your moving items?</p>
                <hr>
                ${notHavingFiles.length > 0
              ? `<h5>Items Without Workflow (Will Inherit Workflow)</h5>
                      <p>
                        ${limitedNotHavingFiles}
                        ${remainingNotHavingFiles ? `<span class="text-muted" data-toggle="tooltip" title="${remainingNotHavingFiles}"> + ${notHavingFilesArray.length - 3} more</span>` : ""}
                      </p><hr>`
              : ""}
                
                ${havingFiles.length > 0
              ? `<h5>Items Already Having a Workflow</h5>
                      <p>
                        ${limitedHavingFiles}
                        ${remainingHavingFiles ? `<span class="text-muted" data-toggle="tooltip" title="${remainingHavingFiles}"> + ${havingFilesArray.length - 3} more</span>` : ""}
                      </p>`
              : ""}
              `;


          Swal.fire({
            title: "Workflow Permission",
            html: showText,
            icon: "question",
            showDenyButton: true,
            confirmButtonText: "Inherit Workflow",
            denyButtonText: "Skip",
            showCloseButton: true,

            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "450px",
            customClass: {
              popup: "swal-custom-popup",
              title: "swal-custom-title",
              confirmButton: "swal-custom-button",
              denyButton: "swal-custom-deny-button"
            },

          }).then(async (result) => {
            if (result.isConfirmed) {
              for await (let item of matchedItems) {
                if (!item?.ishavingworkflow) {
                  await checkAndStartWorkflow(item, checkedData)
                }
              }
              // await continueMultiMoveProcess()
              await acceptPermissions()
            }
            else if (result.isDenied) {
              // await continueMultiMoveProcess()
            }
          })
        }

      }
      else {
        // destination folder not having workflow || folder is selected || someother tye is selected
        // await continueMultiMoveProcess()
        await acceptPermissions()
      }




    }
    //single move
    else {

      if (checkedData['workflow']) {//(copySelected.type == 'file' || copySelected.type == 'form') && 
        //destination folder having workflow
        var showText = ''
        var showFiles = ''
        var hasFolder = false
        if (copySelected['type'] == 'folder') {
          try {
            var childResponse = await API.getChildLevelsForFolders([copySelected?._id])
            var { status, data } = childResponse
            hasFolder = true

            if (status) {
              fulldata = await extractFilesAndForms(data)

              if (fulldata['files'].length != 0) {
                showFiles = fulldata['files'].map((da) => `${da.name}`).join("<br>");
              }

              if (fulldata['forms'].length != 0) {
                showFiles = fulldata['forms'].map((da) => `${da.name}`).join("<br>");
              }
            }

          }
          catch (err) {
            toast.error(`An Error Occurred While getting Child Level Folders - ${err}`)
            console.error('An Error Occurred While getting Child Level Folders -', err)
          }

        }
        else {
          showFiles = copySelected['name']
        }

        if (hasFolder) {
          let havingFiles = fulldata['files']
            .filter((da) => da?.WorkflowHistoryId != null && da?.WorkflowHistoryId != "")
            .map((da) => `${da.name}`)
            .join("<br>");

          havingFiles += fulldata['forms']
            .filter((da) => da?.WorkflowHistoryId != null && da?.WorkflowHistoryId != "")
            .map((da) => `${da.name}`)
            .join("<br>");

          let notHavingFiles = fulldata['files']
            .filter((da) => da?.WorkflowHistoryId === null || da?.WorkflowHistoryId === "")
            .map((da) => `${da.name}`)
            .join("<br>");

          notHavingFiles += fulldata['forms']
            .filter((da) => da?.WorkflowHistoryId === null || da?.WorkflowHistoryId === "")
            .map((da) => `${da.name}`)
            .join("<br>");


          if (havingFiles.length == 0 && notHavingFiles.length == 0) {
            await acceptPermissions();
            return;
          }
          let havingFilesArray = havingFiles.split("<br>");
          let notHavingFilesArray = notHavingFiles.split("<br>");

          let limitedHavingFiles = havingFilesArray.slice(0, 3).join("<br>");
          let remainingHavingFiles = havingFilesArray.slice(3).join("\n"); // Using newline for tooltip content

          let limitedNotHavingFiles = notHavingFilesArray.slice(0, 3).join("<br>");
          let remainingNotHavingFiles = notHavingFilesArray.slice(3).join("\n"); // Using newline for tooltip content


          let showText = `
            <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
            <p>Do you want to inherit the parent workflow for your moving items?</p>
            <hr>
            ${notHavingFiles.length > 0
              ? `<h5>Items Without Workflow (Will Inherit Workflow)</h5>
                    <p>
                      ${limitedNotHavingFiles}
                      ${remainingNotHavingFiles ? `<span class="text-muted" style="cursor: pointer;" data-toggle="tooltip" title="${remainingNotHavingFiles}"> + ${notHavingFilesArray.length - 3} more</span>` : ""}
                    </p><hr>`
              : ""}
              
            ${havingFiles.length > 0
              ? `<h5>Items Already Having a Workflow</h5>
                    <p>
                      ${limitedHavingFiles}
                      ${remainingHavingFiles ? `<span class="text-muted" style="cursor: pointer;" data-toggle="tooltip" title="${remainingHavingFiles}"> + ${havingFilesArray.length - 3} more</span>` : ""}
                    </p>`
              : ""}
          `;

          Swal.fire({
            title: "Workflow Permission",
            html: showText,
            icon: "question",
            showDenyButton: true,
            confirmButtonText: "Inherit Workflow",
            denyButtonText: "Skip",
            showCloseButton: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "450px",
            customClass: {
              popup: "swal-custom-popup",
              title: "swal-custom-title",
              confirmButton: "swal-custom-button",
              denyButton: "swal-custom-deny-button"
            },
            // didOpen: () => {
            //   // Trigger tooltips after the Swal is opened
            //   $(function () {
            //     $('[data-toggle="tooltip"]').tooltip();
            //   });
            // }
          }).then(async (result) => {
            if (result.isConfirmed) {
              await checkAndStartWorkflow(copySelected, checkedData);
              await acceptPermissions();
              // await continueProcess();
            } else if (result.isDenied) {
              // await continueMultiMoveProcess()
            }
          });
        }
        else {
          // Current file doesn't have workflow
          if (copySelected['WorkflowHistoryId'] == null || copySelected['WorkflowHistoryId'] == "") {
            let showText = `
            <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
            <p>Do you want to inherit the parent workflow for your moving Items?</p>
            <hr>
            <h5>Selected Item:</h5>
            <p>${showFiles.split("<br>")
                .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                .join("<br>")
              }</p>
          `;

            const result = await Swal.fire({
              title: "Workflow Permission",
              html: showText,
              icon: "warning",
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: "Inherit Workflow",
              denyButtonText: "Skip",
              showCloseButton: true,
              width: "400px",
              customClass: {
                popup: "swal-custom-popup",
                title: "swal-custom-title",
                confirmButton: "swal-custom-button",
                denyButton: "swal-custom-deny",
                cancelButton: "swal-custom-cancel-button"
              }
            })

            if (result.isConfirmed) {
              await checkAndStartWorkflow(copySelected, checkedData)
              // await continueProcess()
              await acceptPermissions();
            }
            else if (result.isDenied) {
              // await continueProcess()
            }

          }
          else {
            // Assuming `showFiles` is a list of file names or an array of objects containing file names
            let showText = `
              <p>The selected items already have an active workflow</p>
              <hr>
              <h5>Item Name:</h5>
              <p>
                ${showFiles
                .split("<br>")
                .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                .join("<br>")
              }
              </p>
            `;

            await Swal.fire({
              title: "Workflow Notification",
              html: showText,
              icon: "info",
              confirmButtonText: "OK",
              allowOutsideClick: true,
              allowEscapeKey: true,
              width: "400px",
              customClass: {
                popup: "swal-custom-popup",
                title: "swal-custom-title",
                confirmButton: "swal-custom-button"
              },
              // didOpen: () => {
              //   // Initialize tooltips for all items
              //   $(function () {
              //     $('[data-toggle="tooltip"]').tooltip();
              //   });
              // }
            }).then(async (result) => {
              if (result.isConfirmed) {
                // await continueProcess();
                await acceptPermissions();
              }
            });
          }

        }
      }
      else {
        // destination folder not having workflow || folder is selected || someother tye is selected
        // await continueProcess()
        await acceptPermissions()
      }


    }
    // toggle()
  }


  const checkAndStartWorkflow = async (item, parentData) => {
    dispatch(updateLoaderFlag({ loader: true, text: "Moving" }));

    if (item['type'] == 'folder') {

      try {
        await API.updateWorkflowInFoldersRecursively(item, parentData)
      }
      catch (err) {
        toast.error(`An Error Occurred While Starting Workflow - ${err}`)
        console.error('An Error Occurred While Starting Workflow -', err)
      }
    }
    else {
      //check himself
      let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item['_id'], item['type'])
      if (lastRevisionNo == '' || !lastRevisionNo || lastRevisionNo == undefined || lastRevisionNo == '-') {
        lastRevisionNo = 0
      }

      if (message == "File is in under Workflow!") {
        toast("This file is already in a workflow" || message, { icon: '⚠️' });
        return
      }


      let togoName = item['type']
      let togoId = item['_id']
      let lastRevisionNo1 = lastRevisionNo = '-' ? 0 : Number(lastRevisionNo)
      parentData = {
        ...parentData,
        workflow: { ...(parentData.workflow || {}), revisionNo: (lastRevisionNo1 + 1) || 1 }
      }

      try {
        await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, lastRevisionNo1 + 1 || 1)
      }
      catch (err) {
        dispatch(updateLoaderFlag({ loader: false, text: "" }))
        toast.error(`An Error Occurred While Starting Workflow - ${err}`)
        console.error('An Error Occurred While Starting Workflow -', err)
      }
    }
    dispatch(updateLoaderFlag({ loader: false, text: "" }))

  }


  const checkBeforeEnableThisBtn = async (detailsId, detailsType) => {
    let workflowDetailResponse = await API.checkFileInWorkflow(detailsId, detailsType)
    let { status, message, lastRevisionNo } = workflowDetailResponse
    return { status, message, lastRevisionNo }
  }


  const continueProcess = async (permission) => {
    let moveRespo;

    dispatch(updateLoaderFlag({ loader: true, text: "Moving" }));

    if (copySelected.type == 'folder') {
      if (copySelected.isShortcut) {
        moveRespo = await API.docsMove([], [], [], [], [copySelected.shortcutId], [], checked, permission)
      } else {
        moveRespo = await API.docsMove([], [copySelected._id], [], [], [], [], checked, permission)
      }

    }

    else if (copySelected.type == 'form') {
      if (copySelected.isShortcut) {
        moveRespo = await API.docsMove([], [], [], [], [], [copySelected.shortcutId], checked, permission)
      } else {
        moveRespo = await API.docsMove([], [], [copySelected._id], [], [], [], checked, permission)
      }
    }

    else if (copySelected.type == 'file') {
      if (copySelected.isShortcut) {
        moveRespo = await API.docsMove([], [], [], [copySelected.shortcutId], [], [], checked, permission);
      } else {
        moveRespo = await API.docsMove([copySelected._id], [], [], [], [], [], checked, permission);
      }

    }

    if (!moveRespo) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error('error occured during moving document'.replace(/\b\w/g, char => char.toUpperCase()))
    }
    dispatch(updateLoaderFlag({ loader: false, text: "" }));
    dispatch(updateMoveFlag({}))
    toast.success(`${copySelected.type.replace(/\b\w/g, char => char.toUpperCase())} ${copySelected.name} moved successfully`);
    toggle()
  }

  async function acceptPermissions() {
    let selectedPermission = "combine";

    let htmlText = `<div class="container mt-4">
      <div class="card p-3">
          <h5 class="mb-3">Select Permission Type for Selected Document</h5>
          <div class="form-check">
              <input class="form-check-input" type="radio" name="permissionOptions" id="combinePermissions" value="combine" checked>
              <label class="form-check-label" for="combinePermissions">
                  Combine Permissions
              </label>
          </div>
          <div class="form-check">
              <input class="form-check-input" type="radio" name="permissionOptions" id="resetPermissions" value="reset">
              <label class="form-check-label" for="resetPermissions">
                  Reset to Destination Permissions
              </label>
          </div>
          <div class="form-check">
              <input class="form-check-input" type="radio" name="permissionOptions" id="retainPermissions" value="retain">
              <label class="form-check-label" for="retainPermissions">
                  Retain Source Permissions
              </label>
          </div>
      </div>
    </div>`;

    Swal.fire({
      html: htmlText,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Next",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
      width: "450px",
      didOpen: () => {
        document.querySelectorAll('input[name="permissionOptions"]').forEach((radio) => {
          radio.addEventListener("change", (event) => {
            selectedPermission = event.target.value;
          });
        });
      },
      preConfirm: () => {
        debugger
        return selectedPermission;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (multiselected) {
          await continueMultiMoveProcess(result.value)
        } else {
          await continueProcess(result.value)
        }
      }
    });
  }

  return (
    <React.Fragment>
      <div className={loaderFlag ? "modal-header align-center modalheader border-bottom-0 loading" : "modal-header align-center modalheader border-bottom-0"}>
        <h5 className="modal-title">Move item to...</h5>
        <a
          href="#close"
          onClick={(ev) => {
            ev.preventDefault();
            toggle();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
      </div>
      <div className="modal-body pt-0 mt-n2">
        <ul className="breadcrumb breadcrumb-alt breadcrumb-xs breadcrumb-arrow mb-1 members_avatar">
          <li className="" style={{ paddingRight: '0.25rem' }} onClick={() => getFirstLevel()}><Icon name="chevrons-left"></Icon></li>
          {directoryPath.map((item, index) =>
            <li key={item._id} onClick={() => findChildren(item)} className="breadcrumb-item">{item.name}</li>
          )}
        </ul>
        <div className="nk-fmg-listing is-scrollable">
          <div className="nk-files nk-files-view-list is-compact">
            <div className="nk-files-list">
              {tempArr
                .map((item, index) => {
                  return (
                    <div
                      className={`nk-file-item nk-file ${item._id === selected ? "selected" : ""}`}
                      key={item._id}
                      onClick={() => { setSelected(item._id) }}
                      onDoubleClick={() => {
                        setChecked(null);
                        setCheckedData(null)
                        findChildren(item)
                      }}
                    >
                      <div className="nk-file-info">
                        <a className="nk-file-link" onClick={() => {
                          setChecked(item._id)
                          setCheckedData(item)
                        }}>
                          <div className="nk-file-title">
                            <div className="nk-file-icon"><div className="nk-file-icon-type">{icons[item.icon]}</div></div>
                            <div className="nk-file-name">
                              <div className="nk-file-name-text">
                                <span className="title destinationFinder">{item.name.split('.')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="nk-file-actions">
                        <a
                          onClick={() => {
                            setChecked(null);
                            setCheckedData(null)
                            findChildren(item)
                          }}
                          className="btn btn-sm btn-icon btn-trigger"
                        >
                          <Icon name="chevron-right"></Icon>
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer bg-light">
        <div className="modal-footer-between">
          <div className="g">
            <a
              href="link"
              onClick={(ev) => {
                ev.preventDefault();
                toggle();
                toggleCreate();
              }}
              className="link link-primary"
            >
              {/* Create New Folder */}
            </a>
          </div>
          <div className="g">
            <ul className="btn-toolbar g-3">
              <li>
                <a
                  href="#file-share"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle();
                  }}
                  className="btn btn-outline-light btn-white"
                >
                  Cancel
                </a>
              </li>
              <li>
                <button
                  onClick={() => moveSelectedFile(true)}
                  disabled={!checked}
                  className="btn btn-primary file-dl-toast"
                >
                  Move
                </button>
              </li>
            </ul>
          </div>
        </div>
        <Toaster />
      </div>
    </React.Fragment>
  );
};

export default Move;
