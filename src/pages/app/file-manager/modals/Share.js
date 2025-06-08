import React, { useContext, useEffect, useState } from "react";
import { Button, Badge } from "reactstrap";
import { Icon, UserAvatar } from "../../../../components/Component";
import { CheckPicker, Stack, SelectPicker, Tabs, Placeholder, Table, IconButton } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import { findLogoName } from "../../../../utils/Utils";
import { useSelector, useDispatch } from "react-redux";
import { updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import Swal from "sweetalert2";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getFileType } from "../../../../utils/helper";
import moment from "moment";


const Share = ({ file, toggle }) => {
  const [users, setusers] = useState([]);
  const dispatch = useDispatch();
  const [userGroups, setUserGroups] = useState([]);
  const currentsection = useSelector(state => state.folders.currentSection);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserGroups, setSelectedUserGroups] = useState([]);
  const [externalinput, setExternalinput] = useState({ items: [], value: "", error: null });

  const [activeKey, setActiveKey] = useState('1');

  const [usersAccess, setUsersAccess] = useState('view');
  const [userGroupsAccess, setUserGroupsAccess] = useState('view');
  const [externalAccess, setExternalAccess] = useState('view');

  const [sharedWithUsers, setSharedWithUsers] = useState([]);
  const [sharedWithGroups, setSharedWithGroups] = useState([]);
  const [sharedWithExternal, setSharedWithExternal] = useState([]);
  const [ignoredUsersFromGroup, setignoredUsersFromGroup] = useState([]);
  const [ignoredUsersFromSingle, setignoredUsersFromSingle] = useState([]);

  const [sharedUpdateFlag, setSharedUpdateFlag] = useState(false);
  const loaderFlag = useSelector(state => state.folders.loader);
  const [documentFormat, setDocumentFormat] = useState('');
  const [clipboardText, setClipboardText] = useState('')
  const [copied, setCopied] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [cansharetoexternal, setCansharetoexternal] = useState(false)

  const [accessList, setAccessList] = useState([]);
  const handleUserAccess = event => {
    if (event == 'View') {
      setUsersAccess('view')
    } else {
      setUsersAccess('edit')
    }
  }

  const handleUserGroupAccess = event => {
    if (event == 'View') {
      setUserGroupsAccess('view')
    } else {
      setUserGroupsAccess('edit')
    }
  }

  const handleExternalAccess = event => {
    if (event == 'View') {
      setExternalAccess('view')
    } else {
      setExternalAccess('edit')
    }
  }

  const onSubmit = async () => {
    dispatch(updateLoaderFlag({ loader: true, text: "Sharing" }));
    const sharedTime = new Date();
    const loggedInUser = localStorage.getItem('userId');
    const usersArray = [];
    const userGroupsArray = [];
    const externalemails = [];
    selectedUsers.forEach(elem => {
      usersArray.push({
        user: elem,
        sharedAt: sharedTime,
        sharedBy: loggedInUser,
        access: usersAccess,
        inherit: false
      })
    })
    selectedUserGroups.forEach(elem => {
      userGroupsArray.push({
        group: elem,
        sharedAt: sharedTime,
        sharedBy: loggedInUser,
        access: userGroupsAccess,
        inherit: false
      })
    })

    externalinput.items.forEach(elem => {
      externalemails.push({
        email: elem,
        sharedAt: sharedTime,
        sharedBy: loggedInUser,
        access: externalAccess,
        inherit: false
      })
    })


    // const shareRespo = await API.shareDocument(file._id, file.type, selectedUsers,selectedUserGroups,currentsection);
    let shareRespo;
    if (file.type == 'folder') {
      shareRespo = await API.multiShareDocument([], [file._id], [], usersArray, userGroupsArray, externalemails);
    } else if (file.type == "form") {
      shareRespo = await API.multiShareDocument([], [], [file._id], usersArray, userGroupsArray, externalemails);
    } else {
      shareRespo = await API.multiShareDocument([file._id], [], [], usersArray, userGroupsArray, externalemails);
    }
    if (!shareRespo.status) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error(`Error : ${shareRespo.message} in sharing ${file.type} ${file.name}`.replace(/\b\w/g, char => char.toUpperCase()))
    }
    dispatch(updateLoaderFlag({ loader: false, text: "" }));
    // dispatch(updateMoveFlag({}));
    toast.success(`${file.name} shared successfully`)//${file.type} 
    setSharedUpdateFlag(x => !x);
    setSelectedUserGroups([]);
    setSelectedUsers([])
    setExternalinput({ items: [], value: "", error: null });
    // toggle();
  };

  useEffect(() => {
    fetchData();
    accessOptions()
    if (file.type == 'folder') {
      setDocumentFormat('folder');
      setCansharetoexternal(false);
    } else if (file.type == 'file') {
      const docType = getFileType(file.fileType);
      setDocumentFormat(docType);
      setCansharetoexternal(true);
    } else {
      setCansharetoexternal(true);
    }
  }, [sharedUpdateFlag])

  const { Column, HeaderCell, Cell } = Table;

  function generateAvatarBase64(char, backgroundColor) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 24;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, size / 2, size / 2);

    return canvas.toDataURL();
  }

  const accessOptions = async () => {
    const userId = localStorage.getItem('userId');
    if ((file.createdBy == userId) || (file.owner == userId)) {
      // return ['View', 'Edit'];
      setAccessList(['View', 'Edit'])
    } else {
      dispatch(updateLoaderFlag({ loader: true, text: "Please Wait" }));
      const docResponse = await API.getDetails(file._id);
      const memberTeamsResponse = await API.getAllGroupsContainingUser();
      let memberTeams = memberTeamsResponse.data;
      let editAccess = false;
      let viewAccess = false;
      if (docResponse?.data?.data?.sharedWith?.users.some(val => val.user == userId)) {
        const shareStatus = docResponse?.data?.data?.sharedWith.users.find(val => val.user == userId);
        if (shareStatus.access == 'edit') {
          editAccess = true;
          dispatch(updateLoaderFlag({ loader: false, text: "" }));
          // return ['View', 'Edit'];
          setAccessList(['View', 'Edit'])
        } else if (shareStatus.access == 'view') {
          viewAccess = true;
          // return ['View'];
          dispatch(updateLoaderFlag({ loader: false, text: "" }));
          setAccessList(['View'])
        }
      } else {
        const userGroups = memberTeams;
        const sharedUserGroups = docResponse?.data?.data?.sharedWith?.userGroups || [];
        const isGroupShared = sharedUserGroups.some(group =>
          userGroups.some(userGroup =>
            userGroup._id?.toString() == group.group?.toString()
          )
        );

        if (isGroupShared) {
          const groupAccess = sharedUserGroups.find(group =>
            userGroups.some(userGroup =>
              userGroup._id?.toString() == group?.group?.toString()
            )
          )?.access;
          if (groupAccess === 'edit') {
            editAccess = true;
            // return ['View', 'Edit'];
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            setAccessList(['View', 'Edit'])
          } else if (groupAccess === 'view') {
            viewAccess = true;
            // return ['View'];
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            setAccessList(['View'])
          }
        }
      }
    }
  };

  async function fetchData() {
    // const usersArr = file.sharedWith["users"];
    // const userGroupsArr = file.sharedWith["userGroups"];
    // setSelectedUsers(usersArr)
    // setSelectedUserGroups(userGroupsArr)
    let document;
    if (file.type == 'file') {
      setClipboardText(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${file._id}`)
      document = await API.getDetails(file._id); (file._id);
    } else if (file.type == 'folder') {
      setClipboardText(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/share/${file._id}`)
      document = await API.getDetails(file._id); (file._id);
    }

    const sharedWithMembers = await API.getSharedWithMembers(file._id, file.type);
    if (!sharedWithMembers.status) return toast.error('shared members fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
    setSharedWithUsers(sharedWithMembers.data?.sharedWithUsers);
    setSharedWithGroups(sharedWithMembers.data?.sharedWithGroups);
    if (typeof sharedWithMembers.data?.sharedWithExternal !== "undefined")
      setSharedWithExternal(sharedWithMembers.data?.sharedWithExternal)
    if (typeof sharedWithMembers.data?.ignoredUsersFromGroup !== "undefined")
      setignoredUsersFromGroup(sharedWithMembers.data?.ignoredUsersFromGroup)
    if (typeof sharedWithMembers.data?.ignoredUsersFromSingle !== "undefined")
      setignoredUsersFromSingle(sharedWithMembers.data?.ignoredUsersFromSingle)

    if (Array.isArray(sharedWithMembers.data?.ignoredUsersFromGroup) && sharedWithMembers.data?.ignoredUsersFromGroup.length == 0) {
      setActiveKey('1');
    }
    if (Array.isArray(sharedWithMembers.data?.ignoredUsersFromSingle) && sharedWithMembers.data?.ignoredUsersFromSingle.length == 0) {
      setActiveKey('1');
    }

    const documentData = await API.getDetails(file._id); (file._id);
    const usersList = await API.getAllUsers();
    if (!usersList.status) return toast.error('users fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
    const userGroupList = await API.getAllUserGroups();
    if (!userGroupList.status) return toast.error('user groups fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
    const arr = [];
    for (let i = 0; i < usersList.data.length; i++) {
      if (document?.sharedWith?.users?.some(user => user.user === usersList.data[i]._id.toString())) {
        continue;
      }
      if (documentData?.data?.data?.sharedWith?.users?.some(user => user.user === usersList.data[i]._id.toString())) {
        continue;
      }
      if (usersList.data[i]._id.toString() == localStorage.getItem('userId')) {
        continue;
      }
      arr.push({
        label: usersList.data[i].userName,
        value: usersList.data[i]._id,
        email: usersList.data[i].email,
        imgUrl: usersList.data[i].imgUrl ? usersList.data[i].imgUrl : generateAvatarBase64(
          usersList.data[i].userName[0].toUpperCase(),
          '#ccc'
        )
      })
    }
    setusers(arr);
    const temp = [];
    // arr.splice(0, arr.length);
    for (let i = 0; i < userGroupList.data.length; i++) {
      if (document?.sharedWith?.userGroups?.some(group => group.group === userGroupList.data[i]._id.toString())) {
        continue;
      }
      temp.push({
        label: userGroupList.data[i].groupName,
        value: userGroupList.data[i]._id,
        imgurl: <div className="user-avatar-group">
          {userGroupList.data[i].members.length <= 4 ? userGroupList.data[i].members.slice(0, 4).map((member, index) =>
            <div key={index} className="user-avatar xs members_avatar">
              {member.profileImg ?
                <img src={member.profileImg} alt="" /> :
                <span>{member.username.charAt(0).toUpperCase()}</span>
              }
            </div>
          ) : userGroupList.data[i].members.slice(0, 3).map((member, index) =>
            <div key={index} className="user-avatar xs members_avatar">
              {member.profileImg ?
                <img src={member.profileImg} alt="" /> :
                <span>{member.username.charAt(0).toUpperCase()}</span>
              }
            </div>
          )}
          {userGroupList.data[i].members.length > 4 &&
            <div className="user-avatar xs members_avatar">
              <span>{userGroupList.data[i].members.length - 3}+</span>
            </div>
          }
        </div>
      })
    }
    setUserGroups(temp)
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function updatedShared(memberId, action, value, isGroup, row) {
    console.log(row, "rowData")
    let name = '';
    let grouptype = "user";
    if (row.group) {
      name = row.group["groupName"];
      grouptype = "group";
    } else if (row.user) {
      name = row.user["userName"];
      grouptype = "user";
    } else if (row.email) {
      name = row.email;
      grouptype = "email";
    }
    if (action == 'remove') {
      Swal.fire({
        title: `Do you want to remove access to ${name}?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Yes, Remove",
        denyButtonText: `Cancel`
      }).then(async (result) => {
        if (result.isDenied) {
          return;
        } else if (result.isConfirmed) {
          dispatch(updateLoaderFlag({ loader: true, text: "Removing Access" }));
          const shareUpdateResponse = await API.updateSharedWithMembers(file._id, file.type, grouptype, memberId, action, value.toString());
          if (!shareUpdateResponse.status) {
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            return toast.error('share update error'.replace(/\b\w/g, char => char.toUpperCase()));
          }
          dispatch(updateLoaderFlag({ loader: false, text: "" }));
          setSharedUpdateFlag(prev => !prev);
          toast.success(`Access Removed`);
          // dispatch(updateMoveFlag({}))
        }
      });
    } else {
      dispatch(updateLoaderFlag({ loader: true, text: "Updating Access" }));
      const shareUpdateResponse = await API.updateSharedWithMembers(file._id, file.type, grouptype, memberId, action, value.toString());
      if (!shareUpdateResponse.status) {
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        return toast.error('Share Update Error');
      }
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      setSharedUpdateFlag(prev => !prev);
      // dispatch(updateMoveFlag({}))
    }
  }


  const handleKeyDown = (evt) => {
    if (["Enter", "Tab", ","].includes(evt.key)) {
      evt.preventDefault();

      var value = externalinput.value.trim();
      updateemailinput(value);
    } else {
      setExternalinput({
        items: externalinput.items,
        value: evt.target.value,
        error: null
      })
    }

  };

  const updateemailinput = (value) => {
    if (value && isValid(value)) {
      if (externalinput.items.filter(item => item.email.toLowerCase() == value.toLowerCase()).length > 0) {
        setExternalinput({
          items: externalinput.items,
          value: externalinput.value,
          error: "You have already shared to this email"
        })
      } else if (users.filter(item => item.email.toLowerCase() == value.toLowerCase()).length > 0) {
        setExternalinput({
          items: externalinput.items,
          value: externalinput.value,
          error: "This email is exists in your workspace"
        })
      } else if (localStorage.getItem("email").toLowerCase() == value.toLowerCase()) {
        setExternalinput({
          items: externalinput.items,
          value: externalinput.value,
          error: "You can't share to your self"
        })
      } else {
        setExternalinput({
          // items: [...externalinput.items, externalinput.value],
          items: [...externalinput.items, value],
          value: "",
          error: externalinput.error
        });
      }
    }
    else {
      setExternalinput({
        items: externalinput.items,
        value: value,
        error: "Invalid email"
      })
    }

  }


  const handleChange = (evt) => {
    setExternalinput({
      items: externalinput.items,
      value: evt.target.value,
      error: externalinput.error
    });
  };

  const handleDelete = (item) => {
    setExternalinput({
      items: externalinput.items.filter(i => i !== item),
      value: externalinput.value,
      error: externalinput.error
    });
  };

  const handlePaste = (evt) => {
    evt.preventDefault();
    var paste = evt.clipboardData.getData("text")?.trim();
    updateemailinput(paste)
  };

  const isValid = (email) => {
    let error = null;

    if (isInList(email)) {
      error = `${email} has already been added.`;
    }

    if (!isEmail(email)) {
      error = `${email} is not a valid email address.`;
    }

    if (error) {
      setExternalinput({ error });

      return false;
    }

    return true;
  };

  const isInList = (email) => {
    return externalinput.items.includes(email);
  };

  const isEmail = (email) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
  };


  async function restoreAccessForGroup(user) {
    const restoreDocuments = {
      files: [],
      folders: [],
      forms: []
    }
    if (file.type == 'file') {
      restoreDocuments.files.push(file._id)
    } else if (file.type == 'folder') {
      restoreDocuments.folders.push(file._id)
    } else {
      restoreDocuments.forms.push(file._id)
    }
    dispatch(updateLoaderFlag({ loader: true, text: "Access Restore" }));
    const restoreResponse = await API.restoreShareAccessForGroupUser(restoreDocuments.files, restoreDocuments.folders, restoreDocuments.forms, user);
    if (!restoreResponse.status) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error('Access Restore Error');
    }
    dispatch(updateLoaderFlag({ loader: false, text: "" }));

    setSharedUpdateFlag(prev => !prev);
    // if(fileProp.sharedWith?.ignoredUsersFromGroup?.length==0){
    //   setActiveKey('1');
    // }
    // setSharedUpdateFlag(prev => !prev);
    // dispatch(updateMoveFlag({}))
  }

  async function restoreAccessForMember(user) {
    const restoreDocuments = {
      files: [],
      folders: [],
      forms: []
    }
    if (file.type == 'file') {
      restoreDocuments.files.push(file._id)
    } else if (file.type == 'folder') {
      restoreDocuments.folders.push(file._id)
    } else {
      restoreDocuments.forms.push(file._id)
    }
    dispatch(updateLoaderFlag({ loader: true, text: "Access Restore" }));
    const restoreResponse = await API.restoreShareAccessForMember(restoreDocuments.files, restoreDocuments.folders, restoreDocuments.forms, user);
    if (!restoreResponse.status) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error('Access Restore Error');
    }
    dispatch(updateLoaderFlag({ loader: false, text: "" }));

    setSharedUpdateFlag(prev => !prev);
    // if(fileProp.sharedWith?.ignoredUsersFromGroup?.length==0){
    //   setActiveKey('1');
    // }
    // setSharedUpdateFlag(prev => !prev);
    // dispatch(updateMoveFlag({}))
  }


  return (
    <React.Fragment>
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
      <div className={loaderFlag ? "modal-body modal-body-md loading" : "modal-body modal-body-md"}>
        <div className="nk-upload-form mb-0">
          <h5 className="title mb-3 document-title">Share {file.name}</h5>
          <form>
            <div className="form-group">
              <label className="form-label">Share With</label>

              <Tabs activeKey={activeKey} onSelect={(e) => {
                setActiveKey(e)
              }}>
                <Tabs.Tab eventKey="1" title="Users" icon={<Icon name="user-fill"></Icon>}>
                  <Stack spacing={10} direction="row" alignItems="flex-start">
                    <CheckPicker
                      data={users}
                      style={{ width: 350 }}
                      renderMenuItem={(label, item) => (
                        <div>
                          <img
                            src={item.imgUrl}
                            alt={label}
                            style={{ width: 24, height: 24, marginRight: 10, borderRadius: '50%' }}
                          />
                          {label}
                        </div>
                      )}
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e)}
                    />
                    <SelectPicker
                      data={accessList.map(
                        item => ({ label: item, value: item })
                      )}
                      defaultValue="View"
                      searchable={false}
                      onChange={handleUserAccess}
                      style={{ width: 150 }}
                      placeholder="Access"
                    />
                  </Stack>
                </Tabs.Tab>
                <Tabs.Tab eventKey="2" title="User Groups" icon={<Icon name="users-fill"></Icon>}>
                  <Stack spacing={10} direction="row" alignItems="flex-start">
                    <CheckPicker
                      data={userGroups}
                      style={{ width: 350 }}
                      renderMenuItem={(label, item) => (
                        <div style={{ display: 'flex' }}>
                          {label}
                          {item.imgurl}
                        </div>
                      )}
                      value={selectedUserGroups}
                      onChange={(e) => setSelectedUserGroups(e)}
                    />
                    <SelectPicker
                      data={accessList.map(
                        item => ({ label: item, value: item })
                      )}
                      defaultValue="View"
                      searchable={false}
                      onChange={handleUserGroupAccess}
                      style={{ width: 150 }}
                      placeholder="Access"
                    />
                  </Stack>
                </Tabs.Tab>
                {
                  cansharetoexternal == true ?
                    <><Tabs.Tab eventKey="3" title="External User" icon={<Icon name="users-fill"></Icon>}>
                      <div className="sharetoexternal">
                        <Stack spacing={10} direction="row" alignItems="flex-start">

                          <input
                            className={"input " + (externalinput.error && " has-error")}
                            value={externalinput.value}
                            placeholder="Type or paste email addresses and press `Enter`..."
                            onKeyDown={handleKeyDown}
                            onChange={handleChange}
                            onPaste={handlePaste}
                          />

                          <SelectPicker
                            data={accessList.map(
                              item => ({ label: item, value: item })
                            )}
                            disabled={true}
                            defaultValue="View"
                            searchable={false}
                            //onChange={handleExternalAccess}
                            style={{ width: 150 }}
                            placeholder="Access"
                          />
                        </Stack>
                        {externalinput.error && <p className="error">{externalinput.error}</p>}

                        {externalinput.items.map(item => (
                          <div className="tag-item" key={item}>
                            {item}
                            <button
                              type="button"
                              className="button"
                              onClick={() => handleDelete(item)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}

                      </div>
                    </Tabs.Tab></> : <></>
                }
                {ignoredUsersFromGroup.length > 0 && (file.createdBy == localStorage.getItem('userId')) &&
                  <Tabs.Tab eventKey="4" title="Unlinked Members" icon={<Icon style={{ color: 'red' }} name="users-fill"></Icon>}>
                    <Stack spacing={10} direction="row" alignItems="flex-start">

                      <Table data={ignoredUsersFromGroup}>
                        <Column width={200} align="left" fixed>
                          <HeaderCell>Name</HeaderCell>
                          {/* <Cell dataKey="user.userName" /> */}
                          <Cell>
                            {rowData => (
                              <span>
                                <span>
                                  <img style={{ height: '30px', width: '30px', marginRight: '1rem' }} src={rowData?.imgUrl || generateAvatarBase64(rowData?.userName?.slice(0, 1)?.toUpperCase(), '#ccc')} />
                                </span>
                                <span >{rowData?.userName}</span>
                              </span>
                            )}
                          </Cell>
                        </Column>

                        <Column width={200} align="center">
                          <HeaderCell>Deleted Time</HeaderCell>
                          <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                            {rowData => (
                              <p className="accessPrint">
                                {moment(rowData?.deletedTime).format('LLL')}
                              </p>
                            )}
                          </Cell>
                        </Column>

                        <Column width={100} align="center">
                          <HeaderCell>Restore</HeaderCell>
                          <Cell>
                            {rowData => (
                              <span style={{ cursor: 'pointer' }}
                                onClick={(e) => restoreAccessForGroup(rowData.user)}
                              >
                                <Icon name={'undo'} />
                              </span>
                            )}
                          </Cell>
                        </Column>
                      </Table>

                    </Stack>
                  </Tabs.Tab>}
                {ignoredUsersFromSingle.length > 0 && (file.createdBy == localStorage.getItem('userId')) &&
                  <Tabs.Tab eventKey="5" title="Unlinked Users" icon={<Icon style={{ color: 'red' }} name="user-fill"></Icon>}>
                    <Stack spacing={10} direction="row" alignItems="flex-start">

                      <Table data={ignoredUsersFromSingle}>
                        <Column width={200} align="left" fixed>
                          <HeaderCell>Name</HeaderCell>
                          {/* <Cell dataKey="user.userName" /> */}
                          <Cell>
                            {rowData => (
                              <span>
                                <span>
                                  <img style={{ height: '30px', width: '30px', marginRight: '1rem' }} src={rowData?.imgUrl || generateAvatarBase64(rowData?.userName?.slice(0, 1)?.toUpperCase(), '#ccc')} />
                                </span>
                                <span >{rowData?.userName}</span>
                              </span>
                            )}
                          </Cell>
                        </Column>

                        <Column width={200} align="center">
                          <HeaderCell>Deleted Time</HeaderCell>
                          <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                            {rowData => (
                              <p className="accessPrint">
                                {moment(rowData?.deletedTime).format('LLL')}
                              </p>
                            )}
                          </Cell>
                        </Column>

                        <Column width={100} align="center">
                          <HeaderCell>Restore</HeaderCell>
                          <Cell>
                            {rowData => (
                              <span style={{ cursor: 'pointer' }}
                                onClick={(e) => restoreAccessForMember(rowData.user)}
                              >
                                <Icon name={'undo'} />
                              </span>
                            )}
                          </Cell>
                        </Column>
                      </Table>

                    </Stack>
                  </Tabs.Tab>}
              </Tabs>
            </div>
            {(activeKey != '4' && activeKey != '5') && <div className="justify-space-between">
              <ul className={(documentFormat == 'word' || documentFormat == 'excel' || documentFormat == 'ppt' || documentFormat == 'pdf' || documentFormat == 'folder') ? "btn-toolbar g-4 align-center flex-row-reverse" : "btn-toolbar g-4 align-center justify-content-end"}>
                {(documentFormat == 'word' || documentFormat == 'excel' || documentFormat == 'ppt' || documentFormat == 'pdf' || documentFormat == 'folder') && <li className="leftalign">
                  {copied && <Badge style={{ marginRight: "1rem" }} color="success">Copied!</Badge>}
                  <CopyToClipboard text={clipboardText} onCopy={handleCopy}>
                    <Button onClick={e => e.preventDefault()} className="btn btn-light">Copy Link <Icon name="copy"></Icon></Button>
                  </CopyToClipboard>

                </li>}
                <li>
                  <a
                    href="#"
                    className="link link-primary"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggle();
                    }}
                  >
                    Cancel
                  </a>
                </li>
                <li>
                  <Button
                    color="primary"
                    type="submit"
                    onClick={(ev) => {
                      ev.preventDefault();
                      onSubmit()
                    }}
                  >
                    Share
                  </Button>
                </li>
              </ul>
            </div>}
          </form>
          {/* <label className="form-label">Shared With</label> */}
          
          {(activeKey != '4' && activeKey != '5') && <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>

            {(sharedWithUsers.length > 0) ?
              <>
                <label className="form-label">Users</label>
                <Table data={sharedWithUsers} autoHeight={true}>
                  <Column width={200} align="left" fixed>
                    <HeaderCell>Name</HeaderCell>
                    {/* <Cell dataKey="user.userName" /> */}
                    <Cell>
                      {rowData => (
                        <span>
                          <span>
                            <img style={{ height: '30px', width: '30px', marginRight: '1rem' }} src={rowData?.user?.imgUrl || generateAvatarBase64(rowData?.user?.userName?.slice(0, 1)?.toUpperCase(), '#ccc')} />
                          </span>
                          <span >{rowData?.user?.userName}</span>
                        </span>
                      )}
                    </Cell>
                  </Column>

                  <Column width={200} align="center">
                    <HeaderCell>Access</HeaderCell>
                    <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                      {rowData => {
                        if ((file.createdBy == localStorage.getItem('userId')) || (file.owner == localStorage.getItem('userId')) || (rowData.sharedBy == localStorage.getItem('userId'))) {
                          return <SelectPicker
                            searchable={false}
                            data={accessList.map(
                              item => ({ label: item, value: item.toLowerCase() })
                            )}
                            value={rowData.access}
                            // Update the role on change
                            onChange={(e) => updatedShared(rowData.user["_id"], 'edit', e, false, rowData)}
                            cleanable={false}
                            style={{ width: 150 }}
                          />
                        } else {
                          return <p className="accessPrint">{rowData.access}</p>
                        }
                      }}
                    </Cell>
                  </Column>

                  {file.createdBy == localStorage.getItem('userId') && <Column width={100} align="center">
                    <HeaderCell>Action</HeaderCell>
                    <Cell>
                      {rowData => (
                        <span style={{ color: 'red', cursor: 'pointer' }}
                          onClick={(e) => updatedShared(rowData.user["_id"], 'remove', e, false, rowData)}
                        >
                          <Icon name={'trash'} />
                        </span>
                      )}
                    </Cell>
                  </Column>}
                </Table>
              </> :
              // <div className="text-center">Not Shared With Any Users</div>
              <></>
            }


            {(sharedWithGroups.length > 0) ?
              <>
                <label className="form-label mt-2">User Groups</label>
                <Table data={sharedWithGroups} autoHeight={true}>
                  <Column width={200} align="left" fixed>
                    <HeaderCell>Name</HeaderCell>
                    <Cell dataKey="group.groupName" />
                  </Column>

                  <Column width={200} align="center">
                    <HeaderCell>Access</HeaderCell>
                    <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                      {rowData => {
                        if ((file.createdBy == localStorage.getItem('userId')) || (file.owner == localStorage.getItem('userId')) || (rowData.sharedBy == localStorage.getItem('userId'))) {
                          return <SelectPicker
                            searchable={false}
                            data={accessList.map(
                              item => ({ label: item, value: item.toLowerCase() })
                            )}
                            value={rowData.access}
                            onChange={(e) => updatedShared(rowData.group["_id"], 'edit', e, true, rowData)}
                            cleanable={false}
                            style={{ width: 150 }}
                          />
                        } else {
                          return <p className="accessPrint">{rowData.access}</p>
                        }
                      }}
                    </Cell>
                  </Column>

                  {file.createdBy == localStorage.getItem('userId') && <Column width={100} align="center">
                    <HeaderCell>Action</HeaderCell>
                    <Cell>
                      {rowData => (
                        <span style={{ color: 'red', cursor: 'pointer' }}
                          onClick={(e) => updatedShared(rowData.group["_id"], 'remove', e, true, rowData)}
                        >
                          <Icon name={'trash'} />
                        </span>
                      )}
                    </Cell>
                  </Column>}
                </Table></> :
              // <div className="text-center">Not Shared With Any Group</div>
              <></>
            }

            {(sharedWithExternal.length > 0) ?
              <>
                <label className="form-label mt-2">External Users</label>
                <Table data={sharedWithExternal} autoHeight={true}>
                  <Column width={200} align="left" fixed>
                    <HeaderCell>Email</HeaderCell>
                    <Cell dataKey="email" />
                  </Column>

                  <Column width={200} align="center">
                    <HeaderCell>Access</HeaderCell>
                    <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                      {rowData => {
                        return <SelectPicker
                          searchable={false}
                          data={accessList.map(
                            item => ({ label: item, value: item.toLowerCase() })
                          )}
                          disabled={true}
                          value={rowData.access}
                          onChange={(e) => updatedShared(rowData.email, 'edit', e, true, rowData)}
                          cleanable={false}
                          style={{ width: 150 }}
                        />

                      }}
                    </Cell>
                  </Column>

                  {file.createdBy == localStorage.getItem('userId') && <Column width={100} align="center">
                    <HeaderCell>Action</HeaderCell>
                    <Cell>
                      {rowData => (
                        <span style={{ color: 'red', cursor: 'pointer' }}
                          onClick={(e) => updatedShared(rowData.email, 'remove', e, true, rowData)}
                        >
                          <Icon name={'trash'} />
                        </span>
                      )}
                    </Cell>
                  </Column>}
                </Table></> :
              // <div className="text-center">Not Shared With Any Group</div>
              <></>
            }
          </div>}

        </div>
        <Toaster />
      </div>
    </React.Fragment>
  );
};

export default Share;
