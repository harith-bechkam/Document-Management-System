import React, { useState, useEffect } from "react";
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, Button, Icon, RegularTable } from "../../../components/Component";
import * as API from "../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import { Modal, Spinner } from "reactstrap";
import CreateGroup from "./AddUserGroup";
import EditGroup from "./EditUserGroup";
import UserGroupFilter from "../../../components/Filter/UserGroupFilter";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";

const List = () => {

    const dispatch = useDispatch()
    const [sm, setSm] = useState(false)
    const [data, setData] = useState({})
    const [users, setUsers] = useState([]);

    const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
    const [selectedGrp, setSelectedGrp] = useState('');
    const [selectedGrpId, setSelectedGrpId] = useState('');
    const [onSearchText, setOnSearchText] = useState("");

    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [loader, setLoader] = useState(false);
    const [sortOrder, setsortOrder] = useState(null)

    const [columns, setColumns] = useState([
        {
            label: "User Group Name",
            name: "groupName",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Members",
            name: "members",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Status",
            name: "isActive",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Created",
            name: "created",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Modified",
            name: "updated",
            sort: true,
            sortOrder: 0,
            show: true,
        }
    ])
    const [rsuiteState, setRsuiteState] = useState(false);

    const [extraColumns, setExtraColumns] = useState([
        {
            label: "Country",
            name: "country",
            checked: false
        },
        {
            label: "State",
            name: "state",
            checked: false
        }
    ])
    const [filter, setFilter] = useState({
        users: [],
        status: []
    })


    useEffect(() => {
        getAllUsers()
    }, [])


    useEffect(() => {
        fetchData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter])

    const toggleCreateModal = (change = false) => {
        setCreateModal(!createModal);
    }

    const toggleEditModal = (change = false) => {
        setEditModal(!editModal);
    }

    const fetchData = async (
        exportData = false
    ) => {
        // setLoader(true);

        var { users, status } = filter
        // let statusvalue = status?.['value'] ?? ""
        // if (statusvalue == "") {
        //     statusvalue = 'isActive'
        // }
        let statusvalue = status || []


        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching UserGroup' }))
        let userResponse = await API.getUserGroupList(currentPage, itemPerPage, onSearchText, statusvalue, users, sortOrder, exportData)
        if(!exportData){
            let { ...rem } = userResponse
            if (userResponse['status']) {
                setData({
                    data: userResponse['data'],
                    ...rem
                })
            }
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        // setLoader(false);

    }

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

    const getAllUsers = async () => {
        const respo = await API.getAllUsers();
        if (respo.status) {
            let arr = respo.data.map(item => ({
                label: item.userName, value: item._id, imgUrl: item.imgUrl ? item.imgUrl : generateAvatarBase64(
                    item.userName[0].toUpperCase(),
                    '#ccc'
                )
            }))
            setUsers(arr);
        }
    }

    const getSelectedGroup = async (grpId) => {
        await getAllUsers();
        const respo = await API.getUserGroup(grpId);
        if (respo.status) {
            debugger
            setSelectedGrp(respo.data[0].groupName);
            setSelectedGrpId(respo.data[0]._id.toString())
            let arr = respo.data[0].members.map(item => ({ label: item.username, value: item.userId }));
            setSelectedGroupUsers(arr)
        }
        toggleEditModal();
    }

    // const fetchRoles = async () => {
    //     let roleResponse = await API.getAllRoles()
    //     if (roleResponse['status']) {
    //         const rolesOptions = roleResponse['data'].map((role, index) => ({
    //             value: role.role,
    //             label: role.role
    //         }))
    //         setRoleData(rolesOptions)
    //     }
    // }

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));



    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const suspendUser = (id) => {
        Swal.fire({
            title: "Are you sure you want to delete this usergroup?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                let userResponse = await API.deleteUserGroup(id);
                if (userResponse['status']) {
                    Swal.fire("Deleted!", "User Group has been Deleted", "success");
                    fetchData()
                }
                else {
                    Swal.fire("Error", "Unable to delete User Group", "error");
                }
            }

        });
    }

    const sortData = (keycolumnName, sort) => {

        //keycolumnName - dbcol
        const mappings = {
            groupName: "groupName",
            members: "members.username",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
        }

        var dbcol = mappings[keycolumnName]

        setsortOrder({ [dbcol]: sort ? 1 : -1 })
        setCurrentPage(1)

        // setColumns(prevColumns =>
        //     prevColumns.map(column =>
        //         column.name === keycolumnName
        //             ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
        //             : column
        //     )
        // );

        setColumns(prevColumns =>
            prevColumns.map(column =>
                column.name === keycolumnName
                    ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
                    : { ...column, sortOrder: 0 }
            )
        );


        // let defaultData = data['data']

        // if (columnName != 'roleDetails') {
        //     if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        //     else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
        // }
        // else {
        //     !sort ? defaultData.sort((a, b) => a[`${columnName}`]['role'].toString().localeCompare(b[`${columnName}`]['role'].toString())) :
        //         defaultData.sort((a, b) => b[`${columnName}`]['role'].toString().localeCompare(a[`${columnName}`]['role'].toString()))
        // }
    }

    const onSearch = (e) => {

        setOnSearchText(e.target.value)
        setCurrentPage(1)
    }

    const newUseradded = async () => {
        setCurrentPage(1)
        setsortOrder({ createdAt: -1 })
    }

    async function exportUsers() {
        console.log(data);
        // debugger
        // const reformattedData = data.data.map((group) => ({
        //     groupName: group.groupName,
        //     numberOfMembers: group.members.length,
        //     createdAt: moment(group.createdAt).format('ll'),
        //     members: group.members.map((member) => member.username).join(", "),
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('User-Groups');
        // usersSheet.columns = [
        //     { header: 'Group Name', key: 'groupName', width: 15 },
        //     { header: 'No. of Members', key: 'numberOfMembers', width: 35 },
        //     { header: 'Group Created On', key: `createdAt`, width: 20 },
        //     { header: 'Members', key: 'members', width: 20 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(reformattedData);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'groups.xlsx');
        // });
        fetchData(true);
    }


    return (
        <FileManagerLayout>
            <FilesBody  >
                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                User Group List
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>There are {data['totalCount']} groups</p>
                            </BlockDes>
                        </BlockHeadContent>
                        <BlockHeadContent>
                            <div className="toggle-wrap nk-block-tools-toggle">
                                <Button
                                    className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                                    onClick={() => setSm(!sm)}
                                >
                                    <Icon name="menu-alt-r"></Icon>
                                </Button>
                                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <ul className="nk-block-tools g-3">
                                        <li>
                                            <Button onClick={() => exportUsers()} color="light" outline className="btn-white">
                                                <Icon name="download-cloud"></Icon>
                                                <span>Export</span>
                                            </Button>
                                        </li> 
                                        {Privilege['userGroup']['adduserGroup'] &&
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary"
                                                    onClick={() =>
                                                        toggleCreateModal()
                                                    }
                                                >
                                                    <Icon name="plus"></Icon>
                                                    <span>Add Group</span>
                                                </Button>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </BlockHeadContent>
                    </BlockBetween>
                </BlockHead>
                <RegularTable
                    columns={columns}
                    extraColumns={extraColumns}
                    setColumns={setColumns}
                    setExtraColumns={setExtraColumns}
                    data={data}
                    itemPerPage={itemPerPage}
                    setItemPerPage={setItemPerPage}
                    setCurrentPage={setCurrentPage}
                    handlePagination={handlePagination}
                    onSearchText={onSearchText}
                    onSearchChange={onSearch}

                    privilege={{
                        editAccess: Privilege['userGroup']['updateuserGroup'],
                        deleteAccess: Privilege['userGroup']['deleteuserGroup']
                    }}
                    // onEditClick={(id) => navigate(`/users/edit/${id}`)}
                    onEditClick={(id) => {
                        getSelectedGroup(id)
                    }}
                    suspendUser={suspendUser}
                    sortData={sortData}
                    filterComp={
                        <UserGroupFilter
                            rsuiteState={rsuiteState}
                            setRsuiteState={setRsuiteState}
                            onSearchText={onSearchText}
                            setFilter={setFilter}
                            filter={filter}
                            users={users}
                            fetchData={fetchData}
                            setCurrentPage={setCurrentPage}
                        />
                    }
                />
                <Modal isOpen={createModal} size="md" toggle={toggleCreateModal}>
                    <CreateGroup toggle={toggleCreateModal} users={users} newUseradded={newUseradded} />
                </Modal>
                <Modal isOpen={editModal} size="md" toggle={toggleEditModal}>
                    <EditGroup
                        toggle={toggleEditModal}
                        users={users}
                        fetchData={fetchData}
                        userGroupName={selectedGrp}
                        groupMembers={selectedGroupUsers}
                        groupId={selectedGrpId}
                    />
                </Modal>
            </FilesBody>
        </FileManagerLayout>

    )
}

export default List;