import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import exportFromJSON from "export-from-json";
import CopyToClipboard from "react-copy-to-clipboard";
import { Col, Modal, ModalBody, Row, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import { DataTablePagination, Icon, PaginationComponent, RSelect } from "../Component";
import { useLocation } from "react-router";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import * as API from '../../utils/API';
import moment from "moment";

const Export = ({ data, modalTab, fetchData, docId }) => {
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (modal === true) {
      setTimeout(() => setModal(false), 2000);
    }
  }, [modal]);

  const fileName = "user-data";

  const exportCSV = () => {
    const exportType = exportFromJSON.types.csv;
    exportFromJSON({ data, fileName, exportType });
  };

  function determineCurrentValue(type, value) {
    switch (type) {
      case 'Dropdown':
        return value;
      case 'TextInput':
        return value;
      case 'NumberInput':
        return value;
      case 'PhoneNumber':
        return value;
      case 'Rating':
        return value;
      case 'DatePicker':
        return value;
    }
    if (type == "Range") {
      return `Range ${value[1]} out of ${value[0] + value[1]}`;
    }
    if (type == "Tags") {
      return value.map(tag => tag.text).join(', ');
    }
    if (type == "Checkboxes" || type == "RadioButtons") {
      return value.join(', ');
    }
    if (type == "Camera" || type == "FileUpload") {
      return value[0].filename;
    }
    if (type == "Signature") {
      return 'Signature'
    }
  }

  function extractFormData(data) {
    if (data[0].formIdObj.templateType == 'step') {
      return data.map((form) => {
        const result = [];


        const updatedAt = form.updatedAt;
        const user = form.user;
        form.response.forEach((step) => {
          step.forEach((field) => {
            const fieldId = field.id;
            const fieldValue = field.value;

            form.formIdObj.templateSchema.forEach((stepObj) => {
              Object.values(stepObj).forEach((stepData) => {
                const taskData = stepData.task_data.find((task) => task.id === fieldId);
                if (taskData) {
                  const cell = determineCurrentValue(taskData.element, fieldValue);
                  result.push({
                    formId: form._id,
                    updatedAt: moment(updatedAt).format('LLL'),
                    user,
                    fieldType: taskData.element,
                    fieldName: taskData.label,
                    value: cell
                  });
                }
              });
            });
          });
        });

        return result;
      }).flat();
    } else {
      return data.map((form) => {
        const result = [];


        const updatedAt = form.updatedAt;
        const user = form.user;
        // debugger
        form.response.forEach((step) => {
          // step.forEach((field) => {
          const fieldId = step.id;
          const fieldValue = step.value;

          form.formIdObj.templateSchema.forEach((stepObj) => {
            debugger
            // Object.values(stepObj).forEach((stepData) => {
            // const taskData = stepData.task_data.find((task) => task.id === fieldId);

            if (stepObj.id == fieldId) {
              result.push({
                formId: form._id,
                updatedAt: moment(updatedAt).format('LLL'),
                user,
                fieldType: stepObj.element,
                fieldName: stepObj.label,
                value: Array.isArray(fieldValue) ? (fieldValue).join(',') : fieldValue
              });
            }
            // });
          });
          // });
        });

        return result;
      }).flat();
    }

  }

  const exportExcel = async () => {
    // console.log(data)
    //test
    if (data[0]["formId"] && !data[0]["action"]) {

      const formExcel = extractFormData(data);
      const groupedData = formExcel.reduce((acc, item) => {
        const { formId, updatedAt, user, fieldName, value } = item;

        if (!acc[formId] && fieldName) {
          acc[formId] = { updatedAt, user };
        }

        acc[formId][fieldName] = value;

        return acc;
      }, {});



      let result = Object.keys(groupedData).map(formId => ({

        ...groupedData[formId]
      }));

      result = result.map(obj => {
        const filteredObj = { ...obj };

        delete filteredObj.Undefined;
        delete filteredObj.undefined;

        return filteredObj;
      });

      const workbook = new ExcelJS.Workbook();
      const formSheet = workbook.addWorksheet('Form Name Submissions');

      const headers = Object.keys(result[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1),
        key: key,
        width: 20,
      }));

      formSheet.columns = headers;

      formSheet.getRow(1).font = { bold: true };
      formSheet.getRow(1).alignment = { horizontal: 'center' };

      result.forEach(item => {
        formSheet.addRow(item);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Form_Submissions.xlsx');
    }
    // const exportType = exportFromJSON.types.xls;
    // exportFromJSON({ data, fileName, exportType });
  };

  const copyToClipboard = () => {
    setModal(true);
  };

  function exportRevisions() {

  }

  function exportActivities() {

  }

  async function exportData() {
    console.log(modalTab);
    if (modalTab == '3') {
      // exportExcel();
      await API.generateFormSubmissionsExcel(data[0]["formId"])
    } else if (modalTab == '1') {
      // exportActivities()
      fetchData('',{},docId,true);
    } else if (modalTab == '2') {
      // exportRevisions()
      fetchData('',{},docId,true);
    }
  }

  function renderExportBtn() {
    // console.log(modalTab)
    // debugger
    // if (modalTab == '3') {
    return <div className="dt-export-buttons d-flex align-center">
      <div className="dt-export-title d-none d-md-inline-block">Export</div>
      <div className="dt-buttons btn-group flex-wrap">
        <button className="btn btn-secondary buttons-excel buttons-html5" type="button" onClick={() => exportData()}>
          <span>Excel</span>
        </button>{" "}
      </div>
    </div>
    // }
  }

  console.log('modaltab',modalTab)

  return (
    <React.Fragment>
      {renderExportBtn()}
      <Modal isOpen={modal} className="modal-dialog-centered text-center" size="sm">
        <ModalBody className="text-center m-2">
          <h5>Copied to clipboard</h5>
        </ModalBody>
        <div className="p-3 bg-light">
          <div className="text-center">Copied {data?.length} rows to clipboard</div>
        </div>
      </Modal>
    </React.Fragment>
  );
};

const ExpandableRowComponent = ({ data }) => {
  return (
    <ul className="dtr-details p-2 border-bottom ms-1">
      <li className="d-block d-sm-none">
        <span className="dtr-title">Company</span> <span className="dtr-data">{data.company}</span>
      </li>
      <li className="d-block d-sm-none">
        <span className="dtr-title ">Gender</span> <span className="dtr-data">{data.gender}</span>
      </li>
      <li>
        <span className="dtr-title">Start Date</span> <span className="dtr-data">{data.startDate}</span>
      </li>
      <li>
        <span className="dtr-title">Salary</span> <span className="dtr-data">{data.salary}</span>
      </li>
    </ul>
  );
};

const CustomCheckbox = React.forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-control-sm custom-checkbox notext">
    <input
      id={rest.name}
      type="checkbox"
      className="custom-control-input"
      ref={ref}
      onClick={onClick}
      {...rest}
    />
    <label className="custom-control-label" htmlFor={rest.name} />
  </div>
));

const ReactDataTable = ({
  data,
  columns,
  actions,
  className,
  selectableRows,
  expandableRows,
  rowsPerPageS,
  setRowsPerPage,
  sortData,
  handlePagination,
  isUserBelongsToThisStep,
  onSearchChange,
  filterComp,
  modalTab,
  fetchData,
  docId
}) => {
  const [tableData, setTableData] = useState([])
  const [mobileView, setMobileView] = useState()
  const location = useLocation()

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  useEffect(() => {
    if (data) setTableData(data)
  }, [data])

  useEffect(() => {
    setTableData(data)
  }, [rowsPerPageS])


  useEffect(() => {
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    return () => {
      window.removeEventListener("resize", viewChange);
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // function to change the design view under 1200 px
  const viewChange = () => {
    if (window.innerWidth < 960 && expandableRows) {
      setMobileView(true);
    } else {
      setMobileView(false);
    }
  };

  const handleSort = (column, direction) => {

    setSortColumn(column.selector)
    setSortDirection(direction)
    sortData(column?.['name'], direction)
  }

  return (
    <div className={`dataTables_wrapper dt-bootstrap4 no-footer ${className ? className : ""}`}>
      <Row className={`justify-between g-2 ${actions ? "with-export" : ""}`}>
        {<Col className="col-7 text-start" sm="4">
          <div id="DataTables_Table_0_filter" className="dataTables_filter">
            <label>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder={location.pathname.includes('details') ? 'Search Activity' : "Search by User"}
                onChange={onSearchChange}
              />
            </label>
          </div>
        </Col>}

        <Col className="col-5 text-end" sm="8">
          <div className="datatable-filter">
            <div className="d-flex justify-content-end g-2">
              {actions && !location.pathname.includes('user-profile-activity') &&
                <Export modalTab={modalTab} data={tableData['data']} fetchData={fetchData} docId={docId}/>
              }
              <div className="d-flex justify-content-end g-2">
                {filterComp}
              </div>
              <div className="dataTables_length" id="DataTables_Table_0_length">
                <label>
                  <span className="d-none d-sm-inline-block">Show</span>
                  <div className="form-control-select">
                    {" "}
                    <select
                      name="DataTables_Table_0_length"
                      className="custom-select custom-select-sm form-control form-control-sm"
                      onChange={(e) => {
                        setRowsPerPage(e.target.value)
                      }}
                      value={rowsPerPageS}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="40">40</option>
                      <option value="50">50</option>
                    </select>{" "}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <DataTable
        data={tableData['data']}
        columns={columns}
        className={className}
        selectableRows={selectableRows}
        selectableRowsComponent={CustomCheckbox}
        expandableRowsComponent={ExpandableRowComponent}
        expandableRows={mobileView}
        noDataComponent={<div className="p-2">There are no Activities</div>}
        // sortServer
        onSort={handleSort}
        sortIcon={
          <div>
            <span>&darr;</span>
            <span>&uarr;</span>
          </div>
        }
      ></DataTable>

      {typeof tableData?.['data'] != "undefined" && tableData['data']?.length > 0 &&
        <PaginationComponent
          itemPerPage={Number(tableData['perPage'])}
          totalItems={tableData['totalCount']}
          paginate={(page) => {
            handlePagination(page)
          }}
          currentPage={tableData['currentPage']}
          customItemPerPage={rowsPerPageS}
          setRowsPerPage={setRowsPerPage}
        />
      }


    </div>
  );
};

export default ReactDataTable;
