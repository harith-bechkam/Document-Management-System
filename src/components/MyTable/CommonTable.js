import React, { useState, useEffect, useContext } from "react";
import {
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownItem,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  UserAvatar,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
  TooltipComponent,
} from "../Component";
import { bulkActionOptions, findLogoName, findUpper } from "../../utils/Utils";
import Head from "../../layout/head/Head";
import { userData, filterRole, filterStatus } from "../../pages/pre-built/user-manage/UserData";
import Content from "../../layout/content/Content";
import WorkflowFilter from "../Filter/WorkflowFilter";

const CommonTable = ({ ...props }) => {
  console.log(props, 'props')
  const [data, setData] = useState([])

  const navigate = useNavigate();
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();

  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);
  const [sort, setSortState] = useState("");

  // Sorting data
  const sortFunc = (params) => {
    let defaultData = data;
    if (params === "asc") {
      let sortedData = defaultData.sort((a, b) => a.name.localeCompare(b.name));
      setData([...sortedData]);
    } else if (params === "dsc") {
      let sortedData = defaultData.sort((a, b) => b.name.localeCompare(a.name));
      setData([...sortedData]);
    }
  };

  // unselects the data on mount
  useEffect(() => {
    let newData;
    newData = userData.map((item) => {
      item.checked = false;
      return item;
    });
    setData([...newData]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = userData.filter((item) => {
        return (
          item.name.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.email.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      setData([...userData]);
    }
  }, [onSearchText, setData]);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to change the selected property of an item
  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  // function to set the action to be taken in table header
  const onActionText = (e) => {
    setActionText(e.value);
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          name: item.name,
          email: item.email,
          status: item.status,
          phone: item.phone,
          balance: item.balance,
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // function to change to suspend property for an item
  const suspendUser = (id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].status = "Suspend";
    setData([...newData]);
  };

  // function which fires on applying selected action
  const onActionClick = (e) => {
    if (actionText === "suspend") {
      let newData = data.map((item) => {
        if (item.checked === true) item.status = "Suspend";
        return item;
      });
      setData([...newData]);
    } else if (actionText === "delete") {
      let newData;
      newData = data.filter((item) => item.checked !== true);
      setData([...newData]);
    }
  };

  // function which selects all the items
  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.checked = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  // Get current list, pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  function addNew() {
    if (props.isWorkflow) {
      navigate(`/addworkflow/${props.workflow["id"]}`)
    }
  }

  function editCell(cellId) {
    if (props.isWorkflow) {
      navigate(`/editworkflow/${props.workflow["id"]}/${cellId}`)
    }
  }

  console.log(data, "incdata");

  const getColumns = (item, columnName, col) => {
    switch (columnName) {
      case 'userName':
        return (
          <div className="user-card">
            <UserAvatar text={findLogoName(item.userName)} image={item['imgUrl']} className="sm" />
            <div className="user-info">
              <span className="tb-lead">
                {item.userName}{" "}
                <span
                  className={`dot dot-${item.isActive
                    ? "success"
                    : "danger"
                    } d-md-none ms-1`}></span>
              </span>
              <span>{item?.email}</span>
            </div>
          </div>
        )
      case 'mobile':
        return item.mobile
      case 'roleDetails':
        return item['roleDetails']['role']
      case 'city':
        return item.city
      case 'state':
        return item.state

      case 'country':
        return item.country

      case 'workflowName':
        return item.workflowName
      case 'documents':
        return item['documents']
      case 'city':
        return item.city

      case 'isActive':
        return (
          <span
            className={`tb-status text-${item['isActive'] ? "success" : item['isActive'] ? "warning" : "danger"
              }`}
          >
            {item['isActive'] ? "Active" : "InActive"}
          </span>
        )

      default:
        return '-'
    }
  }

  return (
    <React.Fragment>
      <div className="mainscreen">
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  {props?.isWorkflow ? `${props.workflow.text} ` : ''}{props?.pageTitle} List
                </BlockTitle>
                <BlockDes className="text-soft">
                  <p>You have total {props.data.length} {props?.pageTitle?.toLowerCase() || ''}s.</p>
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
                        <a
                          href="#export"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn btn-white btn-outline-light"
                        >
                          <Icon name="download-cloud"></Icon>
                          <span>Export</span>
                        </a>
                      </li>
                      <li className="nk-block-tools-opt">
                        <Button color="primary" className="btn-icon" onClick={addNew}>
                          <Icon name="plus"></Icon>
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <Block>
            <DataTable className="card-stretch">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    <div className="form-inline flex-nowrap gx-3">
                      <div className="form-wrap">
                        <RSelect
                          options={bulkActionOptions}
                          className="w-130px"
                          placeholder="Bulk Action"
                          onChange={(e) => onActionText(e)}
                        />
                      </div>
                      <div className="btn-wrap">
                        <span className="d-none d-md-block">
                          <Button
                            disabled={actionText !== "" ? false : true}
                            color="light"
                            outline
                            className="btn-dim"
                            onClick={(e) => onActionClick(e)}
                          >
                            Apply
                          </Button>
                        </span>
                        <span className="d-md-none">
                          <Button
                            color="light"
                            outline
                            disabled={actionText !== "" ? false : true}
                            className="btn-dim  btn-icon"
                            onClick={(e) => onActionClick(e)}
                          >
                            <Icon name="arrow-right"></Icon>
                          </Button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-tools me-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a
                          href="#search"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggle();
                          }}
                          className="btn btn-icon search-toggle toggle-search"
                        >
                          <Icon name="search"></Icon>
                        </a>
                      </li>
                      <li className="btn-toolbar-sep"></li>
                      <li>
                        <div className="toggle-wrap">
                          <Button
                            className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                            onClick={() => updateTableSm(true)}
                          >
                            <Icon name="menu-right"></Icon>
                          </Button>
                          <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                            <ul className="btn-toolbar gx-1">
                              <li className="toggle-close">
                                <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                  <Icon name="arrow-left"></Icon>
                                </Button>
                              </li>
                              <li>
                                {props.filtercomp}
                                {/* <WorkflowFilter/> */}
                                {/* <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                    <div className="dot dot-primary"></div>
                                    <Icon name="filter-alt"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu
                                    end
                                    className="filter-wg dropdown-menu-xl"
                                    style={{ overflow: "visible" }}
                                  >
                                    <div className="dropdown-head">
                                      <span className="sub-title dropdown-title">Filter Users</span>
                                      <div className="dropdown">
                                        <DropdownItem
                                          href="#more"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                          className="btn btn-sm btn-icon"
                                        >
                                          <Icon name="more-h"></Icon>
                                        </DropdownItem>
                                      </div>
                                    </div>
                                    <div className="dropdown-body dropdown-body-rg">
                                      <Row className="gx-6 gy-3">
                                        <Col size="6">
                                          <div className="custom-control custom-control-sm custom-checkbox">
                                            <input
                                              type="checkbox"
                                              className="custom-control-input"
                                              id="hasBalance"
                                            />
                                            <label className="custom-control-label" htmlFor="hasBalance">
                                              {" "}
                                              Have Balance
                                            </label>
                                          </div>
                                        </Col>
                                        <Col size="6">
                                          <div className="custom-control custom-control-sm custom-checkbox">
                                            <input
                                              type="checkbox"
                                              className="custom-control-input"
                                              id="hasKYC"
                                            />
                                            <label className="custom-control-label" htmlFor="hasKYC">
                                              {" "}
                                              KYC Verified
                                            </label>
                                          </div>
                                        </Col>
                                        <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Role</label>
                                            <RSelect options={filterRole} placeholder="Any Role" />
                                          </div>
                                        </Col>
                                        <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Status</label>
                                            <RSelect options={filterStatus} placeholder="Any Status" />
                                          </div>
                                        </Col>
                                        <Col size="12">
                                          <div className="form-group">
                                            <Button color="secondary">Filter</Button>
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="dropdown-foot between">
                                      <a
                                        href="#reset"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                        className="clickable"
                                      >
                                        Reset Filter
                                      </a>
                                      <a
                                        href="#save"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        Save Filter
                                      </a>
                                    </div>
                                  </DropdownMenu>
                                </UncontrolledDropdown> */}
                              </li>
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                    <Icon name="setting"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end className="dropdown-menu-xs">
                                    <ul className="link-check">
                                      <li>
                                        <span>Show</span>
                                      </li>
                                      <li className={itemPerPage === 10 ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setItemPerPage(10);
                                          }}
                                        >
                                          10
                                        </DropdownItem>
                                      </li>
                                      <li className={itemPerPage === 15 ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setItemPerPage(15);
                                          }}
                                        >
                                          15
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                    <ul className="link-check">
                                      <li>
                                        <span>Order</span>
                                      </li>
                                      <li className={sort === "dsc" ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSortState("dsc");
                                            sortFunc("dsc");
                                          }}
                                        >
                                          DESC
                                        </DropdownItem>
                                      </li>
                                      <li className={sort === "asc" ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSortState("asc");
                                            sortFunc("asc");
                                          }}
                                        >
                                          ASC
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                  <div className="card-body">
                    <div className="search-content">
                      <Button
                        className="search-back btn-icon toggle-search active"
                        onClick={() => {
                          setSearchText("");
                          toggle();
                        }}
                      >
                        <Icon name="arrow-left"></Icon>
                      </Button>
                      <input
                        type="text"
                        className="border-transparent form-focus-none form-control"
                        placeholder="Search by user or email"
                        value={onSearchText}
                        onChange={(e) => onFilterChange(e)}
                      />
                      <Button className="search-submit btn-icon">
                        <Icon name="search"></Icon>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <DataTableBody>
                <DataTableHead>
                  {props.columns.filter(item => item['show']).map((item) => (
                    <DataTableRow>
                      <span
                        className="sub-text"
                        size="lg"
                        onClick={() => {
                          setSort(prev => !prev)
                          sortData(item.name, sort)
                        }}
                      >
                        {item.label}
                        {item.sort &&
                          <span className="custom-sort">
                            <span>&darr;</span>
                            <span>&uarr;</span>
                          </span>
                        }
                      </span>

                    </DataTableRow>
                  ))}
                  <DataTableRow className="nk-tb-col-tools text-end">
                    <UncontrolledDropdown>
                      <DropdownToggle
                        color="tranparent"
                        className="btn btn-xs btn-outline-light btn-icon dropdown-toggle"
                      >
                        <Icon name="plus"></Icon>
                      </DropdownToggle>

                      <DropdownMenu end className="dropdown-menu-xs">
                        <ul className="link-tidy sm no-bdr">
                          {props.extraColumns && props.extraColumns.map((item) =>
                            <li>
                              <div className="custom-control custom-control-sm custom-checkbox">
                                <input
                                  type="checkbox"
                                  id={`${item.label}`}
                                  className="custom-control-input"
                                  onChange={() => extraToggleChecked(item.name, item.label)}
                                  checked={item.checked}
                                  value={item.checked}
                                />
                                <label className="custom-control-label" htmlFor={`${item.label}`}>
                                  {item.label}
                                </label>
                              </div>
                            </li>
                          )}
                        </ul>
                      </DropdownMenu>

                    </UncontrolledDropdown>
                  </DataTableRow>

                </DataTableHead>
                {props['data']?.length > 0
                  ? props['data']?.map((item) => {
                    return (
                      <DataTableItem key={item._id}>

                        {props.columns.map(column => (
                          <>
                            {column['show'] &&
                              <DataTableRow size="mb">
                                <span className="sub-text" size="lg">
                                  {getColumns(item, column.name, column)}
                                </span>
                              </DataTableRow>
                            }
                          </>
                        ))}

                        <DataTableRow className="nk-tb-col-tools" >
                          <ul className="nk-tb-actions gx-1">

                            {props.privilege && props.privilege['editAccess'] &&
                              <li className="nk-tb-action-hidden"
                                onClick={() => editCell(item['_id'])}
                              >
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon"
                                  id={"edit" + item['_id']}
                                  icon="edit-alt-fill"
                                  direction="top"
                                  text="Edit"
                                />
                              </li>
                            }
                            {props.privilege && props.privilege['deleteAccess'] &&
                              <li className="nk-tb-action-hidden"
                                onClick={() =>
                                  suspendUser(item['_id'])
                                }
                              >
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon"
                                  id={"suspend" + item['_id']}
                                  icon={`${props.deleteicon}`}
                                  direction="top"
                                  text="Delete"
                                />
                              </li>
                            }

                            {/* {iconDisplay} */}


                          

                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu end>
                                  <ul className="link-list-opt no-bdr">
                                    {props.privilege && props.privilege['editAccess'] &&
                                      <li onClick={() => editCell(item['_id'])}>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                        >
                                          <Icon name="edit"></Icon>
                                          <span>Edit</span>
                                        </DropdownItem>
                                      </li>
                                    }
                                    {props.privilege && props.privilege['deleteAccess'] && (
                                      <React.Fragment>
                                        <li className="divider"></li>
                                        <li
                                          onClick={() => suspendUser(item['_id'])}
                                        >
                                          <DropdownItem
                                            tag="a"
                                            href="#suspend"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                            }}
                                          >
                                            <Icon name="na"></Icon>
                                            <span>Delete User</span>
                                          </DropdownItem>
                                        </li>
                                      </React.Fragment>
                                    )}
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {currentItems.length > 0 ? (
                  <PaginationComponent
                    itemPerPage={itemPerPage}
                    totalItems={data.length}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )}
              </div>
            </DataTable>
          </Block>
        </Content>
      </div>
    </React.Fragment>
  );
};
export default CommonTable;
