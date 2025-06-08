import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import { Card, Modal } from "reactstrap";
import Head from "../../../layout/head/Head";
import {
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  Block,
  PreviewCard,
  ReactDataTable,
  Filter2
} from "../../../components/Component";
import UserProfileAside from "./UserProfileAside";
import * as API from '../../../utils/API';
import { userTimezone } from "../../../utils/Utils";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import UpdateProfileModal from "./UpdateProfileModal";

const UserProfileActivityPage = () => {

  const dispatch = useDispatch()
  const [data, setData] = useState([])
  const [usroptions, setUsrOptions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPageS, setRowsPerPage] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState({
    user: null,
  })

  const [profileModal, setProfileModal] = useState(false);

  const toggleProfileModal = () => {
    setProfileModal(!profileModal);
  }
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const [sortOrder, setsortOrder] = useState(null)
  const dataTableColumns = [
    {
      name: "UserName",
      selector: (row) => row?.userName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row?.email,
      sortable: true,
    },
    {
      name: "Device",
      selector: (row) => row?.device,
      sortable: true,
    },
    {
      name: "Ip Address",
      selector: (row) => row?.ipAddress,
      sortable: true,
      hide: 370,
      hide: "sm",
    },
    {
      name: "loggedIn Time",
      selector: (row) => row?.loggedInTime, //userTimezone(row.loggedInTime, localStorage.getItem("timeZone")),
      sortable: true,
    }
  ]

  // function to change the design view under 990 px
  const viewChange = () => {

    if (window.innerWidth < 990) {
      setMobileView(true);
    }
    else {
      setMobileView(false);
      updateSm(false);
    }

  }

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);


  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchData()
  }, [currentPage, rowsPerPageS, searchText, filter, sortOrder])


  const fetchData = async (
    // search = "",
    // user = ""
  ) => {

    dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Activities' }))

    var { user } = filter
    if (user) user = user?.['value'] ?? null;

    let response = await API.loginActivity('All', currentPage, rowsPerPageS, searchText, user, sortOrder)
    var { status, ...rem } = response

    if (status) {
      setData({
        data: response['data'],
        ...rem
      })
    }
    dispatch(updateLoaderFlag({ loader: false, text: '' }))

  }

  const fetchUsers = async () => {
    let usrResponse = await API.getAllUsers()
    if (usrResponse['status']) {
      const usrOptions = usrResponse['data'].map((usr, index) => ({
        value: usr._id,
        label: usr.userName
      }))
      setUsrOptions(usrOptions)
    }
  }


  const handlePagination = (pageNumber) => setCurrentPage(pageNumber)


  const sortData = (keycolumnName, sort) => {

    //keycolumnName - dbcol
    const mappings = {
      UserName: "userName",
      Email: "email",
      Device: "device",
      "Ip Address": "ipAddress",
      "loggedIn Time": "loggedInTime",
    }

    var dbcol = mappings[keycolumnName]

    // setsortOrder(prev => ({
    //     ...prev,
    //     [dbcol]: prev[dbcol] == 1 ? -1 : 1
    // }))


    // setsortOrder(prev => {
    //     let newSortOrder = {}
    //     for (let key in prev) {
    //         newSortOrder[key] = key == dbcol ? (prev[key] == 1 ? -1 : 1) : 1
    //     }
    //     return newSortOrder
    // })

    setsortOrder({ [dbcol]: sort == "asc" ? 1 : -1 })

  }

  const onSearchChange = (e) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  return (
    <React.Fragment>
      <Head title="User List - Profile"></Head>
      <Content>
        <Card className="card-bordered">
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${sm ? "content-active" : ""
                }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} setModal={setProfileModal}/>
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Login Activity</BlockTitle>
                    <BlockDes>
                      <p>
                        Here is your last login activities log {" "}
                        <span className="text-soft">
                          <Icon name="info" />
                        </span>
                      </p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block size="lg">
                <PreviewCard>
                  <ReactDataTable
                    data={data}
                    fetchData={fetchData}
                    columns={dataTableColumns}
                    expandableRows
                    actions
                    onSearchChange={onSearchChange}
                    rowsPerPageS={rowsPerPageS}
                    setRowsPerPage={setRowsPerPage}
                    handlePagination={handlePagination}
                    sortData={sortData}
                    filterComp={
                      <Filter2
                        filter={filter}
                        setFilter={setFilter}
                        usroptions={usroptions}
                        setCurrentPage={setCurrentPage}
                      // fetchData={fetchData}
                      // searchText={searchText}
                      />
                    }
                  />
                </PreviewCard>
              </Block>

            </div>
          </div>
        </Card>
      </Content>
      <Modal isOpen={profileModal} size="lg" toggle={toggleProfileModal}>
        <UpdateProfileModal toggle={toggleProfileModal} />
      </Modal>
    </React.Fragment>
  );
};

export default UserProfileActivityPage;