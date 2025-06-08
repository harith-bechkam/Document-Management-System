import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, Button, Icon, RegularTable, Filter1 } from "../../../components/Component";
import * as API from "../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import toast, { Toaster } from "react-hot-toast";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { Spinner } from "reactstrap";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";



const List = () => {

    const [sm, updateSm] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [data, setData] = useState({})
    const [roleData, setRoleData] = useState([])
    const [onSearchText, setSearchText] = useState("");
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);


    const [sortOrder, setsortOrder] = useState(null)
    const [columns, setColumns] = useState([
        {
            label: "Users",
            name: "userName",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Mobile",
            name: "mobile",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Role",
            name: "roleDetails",
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
        role: [],
        status: []
    })

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));



    useEffect(() => {
        fetchRoles()
    }, [])

    useEffect(() => {
        fetchData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])

    const fetchData = async (
        exportData = false
    ) => {
        // setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Users' }))
        var { role, status } = filter
        // const statusvalue = status?.['value'] ?? []
        const statusvalue = status
        let userResponse = await API.getUsersList(currentPage, itemPerPage, onSearchText, statusvalue, role, sortOrder, exportData)
        if (!exportData) {
            var { status, ...rem } = userResponse
            if (status) {
                setData({
                    data: userResponse['data'],
                    ...rem
                })

            }
            // setLoader(false)
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

    const fetchRoles = async () => {
        let roleResponse = await API.getAllRoles()
        if (roleResponse['status']) {
            const rolesOptions = roleResponse['data'].map((role, index) => ({
                value: role._id,
                label: role.role
            }))
            setRoleData(rolesOptions)
        }
    }


    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const suspendUser = (id) => {
        const userDetails = data.data.find(val => val._id == id);
        if (!userDetails?.isActive) {
            Swal.fire({
                title: `Are you sure you want to restore ${userDetails.userName}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, restore it!",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // let userResponse = await API.restoreUser(id);
                    // if (userResponse['status']) {
                    //     Swal.fire("Restored!", "User has been restored", "success");
                    //     fetchData()
                    // }
                    // else {
                    //     Swal.fire("Error", "Unable to restore user", "error");
                    // }
                }
            });
        } else {
            Swal.fire({
                title: "Are you sure you want to delete this user?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let userResponse = await API.deleteUser(id);
                    if (userResponse['status']) {
                        Swal.fire("Deleted!", "User has been deleted", "success");
                        fetchData()
                    }
                    else {
                        Swal.fire("Error", "Unable to delete user", "error");
                    }
                }
            });
        }

    }

    const sortData = (keycolumnName, sort) => {

        //keycolumnName - dbcol
        const mappings = {
            userName: "userName",
            mobile: "mobile",
            roleDetails: "roleroleDetails.role",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
        }
        var dbcol = mappings[keycolumnName]

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
        setsortOrder({ [dbcol]: sort ? 1 : -1 })
        setCurrentPage(1)


    }

    const onSearch = (e) => {
        setSearchText(e.target.value)
        setCurrentPage(1)
    }

    async function exportUsers() {
        // const excelInput = data.data.map(item => ({
        //     userName: item.userName,
        //     email: item.email,
        //     role: item.roleDetails?.role,
        //     mobile: item.mobile ? item.mobile : '-',
        //     dob: item.dob ? moment(item.dob).format('ll') : '-'
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Users');
        // usersSheet.columns = [
        //     { header: 'User', key: 'userName', width: 15 },
        //     { header: 'Email', key: 'email', width: 35 },
        //     { header: 'Role', key: `role`, width: 20 },
        //     { header: 'Contact', key: 'mobile', width: 20 },
        //     { header: 'Date of birth', key: 'dob', width: 25 }
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'users.xlsx');
        // });
        console.log(data);
        fetchData(true)
    }

    const addUserCall = async () => {
        navigate('/users/add')
    }

    return (
        <FileManagerLayout>
            <FilesBody>
                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                Users Lists
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>You have total {data['totalCount']} users</p>
                            </BlockDes>
                        </BlockHeadContent>
                        <BlockHeadContent>
                            <div className="toggle-wrap nk-block-tools-toggle">
                                <Button
                                    className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                                    onClick={() => updateSm(!sm)}
                                >
                                    <Icon name="menu-alt-r"></Icon>
                                </Button>
                                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <ul className="nk-block-tools g-3">
                                        <li>
                                            <Button color="light" outline className="btn-white" onClick={() => exportUsers()}>
                                                <Icon name="download-cloud"></Icon>
                                                <span>Export</span>
                                            </Button>
                                        </li>
                                        {Privilege['user']['addUser'] &&
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary" onClick={addUserCall}>
                                                    <Icon name="plus"></Icon>
                                                    <span>Add User</span>
                                                </Button>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </BlockHeadContent>
                    </BlockBetween>
                </BlockHead>
                {loader ?
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Spinner size="sm" />
                    </div>
                    :
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
                            editAccess: Privilege['user']['updateUser'],
                            deleteAccess: Privilege['user']['deleteUser']
                        }}
                        onEditClick={(id) => navigate(`/users/edit/${id}`)}
                        suspendUser={suspendUser}
                        sortData={sortData}
                        filterComp={
                            <Filter1
                                onSearchText={onSearchText}
                                setFilter={setFilter}
                                filter={filter}
                                roleData={roleData}
                                setCurrentPage={setCurrentPage}

                            />
                        }
                    />
                }
                <Toaster />
            </FilesBody>
        </FileManagerLayout>

    )
}

export default List;