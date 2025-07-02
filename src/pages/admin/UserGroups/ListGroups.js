import React, { useState, useEffect } from "react";
import {
    BlockHead, BlockBetween, BlockHeadContent, BlockTitle,
    BlockDes, Button, Icon, RegularTable
} from "../../../components/Component";
import * as API from "../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import { Modal } from "reactstrap";
import CreateGroup from "./AddUserGroup";
import EditGroup from "./EditUserGroup";
import UserGroupFilter from "../../../components/Filter/UserGroupFilter";
import { useDispatch } from "react-redux";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import moment from "moment";

const columnMappings = {
    groupName: "groupName",
    members: "members.username",
    isActive: "isActive",
    created: "createdAt",
    updated: "updatedAt"
};

const List = () => {
    const dispatch = useDispatch();

    const [sm, setSm] = useState(false);
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
    const [selectedGrp, setSelectedGrp] = useState('');
    const [selectedGrpId, setSelectedGrpId] = useState('');
    const [onSearchText, setOnSearchText] = useState("");
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [sortOrder, setsortOrder] = useState(null);
    const [rsuiteState, setRsuiteState] = useState(false);
    const [filter, setFilter] = useState({ users: [], status: [] });

    const [columns, setColumns] = useState([
        { label: "User Group Name", name: "groupName", sort: true, sortOrder: 0, show: true },
        { label: "Members", name: "members", sort: true, sortOrder: 0, show: true },
        { label: "Status", name: "isActive", sort: true, sortOrder: 0, show: true },
        { label: "Created", name: "created", sort: true, sortOrder: 0, show: true },
        { label: "Modified", name: "updated", sort: true, sortOrder: 0, show: true }
    ]);

    const [extraColumns, setExtraColumns] = useState([
        { label: "Country", name: "country", checked: false },
        { label: "State", name: "state", checked: false }
    ]);

    const Privilege = JSON.parse(localStorage.getItem('privileges'));

    useEffect(() => {
        getAllUsers();
    }, []);

    useEffect(() => {
        fetchData();
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter]);

    const toggleCreateModal = () => setCreateModal(prev => !prev);
    const toggleEditModal = () => setEditModal(prev => !prev);

    const fetchData = async (exportData = false) => {
        const { users, status } = filter;
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching UserGroup' }));

        const userResponse = await API.getUserGroupList(
            currentPage, itemPerPage, onSearchText,
            status || [], users, sortOrder, exportData
        );

        if (!exportData && userResponse?.status) {
            const { status, data, ...rest } = userResponse;
            setData({ data, ...rest });
        }

        dispatch(updateLoaderFlag({ loader: false, text: '' }));
    };

    const generateAvatarBase64 = (char, backgroundColor) => {
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
    };

    const getAllUsers = async () => {
        const res = await API.getAllUsers();
        if (res.status) {
            const formatted = res.data.map(u => ({
                label: u.userName,
                value: u._id,
                imgUrl: u.imgUrl || generateAvatarBase64(u.userName[0].toUpperCase(), '#ccc')
            }));
            setUsers(formatted);
        }
    };

    const getSelectedGroup = async (grpId) => {
        await getAllUsers();
        const res = await API.getUserGroup(grpId);
        if (res.status && res.data?.[0]) {
            const group = res.data[0];
            setSelectedGrp(group.groupName);
            setSelectedGrpId(group._id);
            setSelectedGroupUsers(group.members.map(m => ({ label: m.username, value: m.userId })));
            toggleEditModal();
        }
    };

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber);

    const suspendUser = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure you want to delete this usergroup?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            const res = await API.deleteUserGroup(id);
            if (res.status) {
                Swal.fire("Deleted!", "User Group has been Deleted", "success");
                fetchData();
            } else {
                Swal.fire("Error", "Unable to delete User Group", "error");
            }
        }
    };

    const sortData = (key, isAsc) => {
        const dbKey = columnMappings[key];
        setsortOrder({ [dbKey]: isAsc ? 1 : -1 });
        setCurrentPage(1);
        setColumns(cols =>
            cols.map(col => ({
                ...col,
                sortOrder: col.name === key ? (col.sortOrder === 1 ? -1 : 1) : 0
            }))
        );
    };

    const onSearch = (e) => {
        setOnSearchText(e.target.value);
        setCurrentPage(1);
    };

    const newUseradded = () => {
        setCurrentPage(1);
        setsortOrder({ createdAt: -1 });
    };

    const exportUsers = () => {
        fetchData(true);
    };

    return (
        <FileManagerLayout>
            <FilesBody>
                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>User Group List</BlockTitle>
                            <BlockDes className="text-soft">
                                <p>There are {data?.totalCount || 0} groups</p>
                            </BlockDes>
                        </BlockHeadContent>
                        <BlockHeadContent>
                            <div className="toggle-wrap nk-block-tools-toggle">
                                <Button className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`} onClick={() => setSm(!sm)}>
                                    <Icon name="menu-alt-r" />
                                </Button>
                                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <ul className="nk-block-tools g-3">
                                        <li>
                                            <Button onClick={exportUsers} color="light" outline className="btn-white">
                                                <Icon name="download-cloud" /><span>Export</span>
                                            </Button>
                                        </li>
                                        {Privilege?.userGroup?.adduserGroup && (
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary" onClick={toggleCreateModal}>
                                                    <Icon name="plus" /><span>Add Group</span>
                                                </Button>
                                            </li>
                                        )}
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
                        editAccess: Privilege?.userGroup?.updateuserGroup,
                        deleteAccess: Privilege?.userGroup?.deleteuserGroup
                    }}
                    onEditClick={getSelectedGroup}
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
    );
};

export default List;
