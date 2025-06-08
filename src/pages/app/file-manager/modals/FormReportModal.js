import React, { useEffect, useState } from "react";
import { CodeBlock, Icon, UserAvatar } from "../../../../components/Component";
import icons from "../components/Icons";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import { updateLoaderFlag } from "../../../../redux/folderSlice";
import { CardTitle } from "reactstrap";
import { CheckPicker, VStack } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { activityData } from "../../../../components/partials/default/recent-activity/ActivityData";

const FormRevisionHistories = ({ toggle, formId }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const loaderFlag = useSelector(state => state.folders.loader);

  const [responseHistory, setResponseHistory] = useState([]);
  const [backUpResponseHistory, setBackUpResponseHistory] = useState([])
  const [fieldnameOptions, setFieldnameOptions] = useState([]);
  const [selectedFiledNames, setSelectedFieldnames] = useState([]);
  const [selectedUsers, setSelectedusers] = useState([]);
  const [userNameOptions, setUserNameOptions] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State to toggle filter box

  async function getResponseHistory() {
    const formResponse = await API.getForm(formId);
    const temp = [];
    for (let key in formResponse.data.templateSchema[0]) {
      formResponse.data.templateSchema[0][key]["task_data"].forEach(elem => {
        temp.push({
          label: elem.label,
          value: elem.id,
          type: elem.element
        })
      })
    }
    setFieldnameOptions(temp)
    if (!formResponse.status) {
      return toast.error('cannot get form'.replace(/\b\w/g, char => char.toUpperCase()));
    }
    const historyResponse = await API.getFormResponseHistory(formId);
    if (!historyResponse.status) {
      return toast.error('cannot get history'.replace(/\b\w/g, char => char.toUpperCase()));
    }

    const arr = [];


    historyResponse.data.forEach(elem => {
      arr.push({
        img: elem.img,
        name: elem.name,
        userId: elem.userId,
        fieldtype: elem.fieldtype,
        fieldlabel: elem.fieldlabel,
        fieldId: elem.fieldId,
        description: elem.description,
        currentValue: elem.currentValue,
        previousValue: elem.previousValue,
        time: elem.time,
        activity: elem.previousValue !== 'inserted'
          ? (
            <>
              {elem.name} added <del>{elem.previousValue}</del> {elem.currentValue} at {elem.fieldlabel}
            </>
          )
          : `${elem.name} added ${elem.currentValue} at ${ elem.fieldlabel}`,
      });
    });
    // debugger
    const tempUserArr = [];
    historyResponse.data.forEach(elem => {
      const checkExist = tempUserArr.find(val => val.value == elem.userId);
      if (!checkExist)
        tempUserArr.push({
          value: elem.userId,
          label: elem.name,
        });
    });
   
    setBackUpResponseHistory(arr);
    setResponseHistory(arr);
    setUserNameOptions(tempUserArr);
  }

  useEffect(() => {
    getResponseHistory();
  }, []);


  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // function updateHistoryData() {
  //   let filteredOptionsData =[];
  //   let filteredUsersData = [];
  //   if(selectedFiledNames.length>0){
  //     filteredOptionsData = responseHistory.filter(item => selectedFiledNames.includes(item.fieldId));
  //   }
  //   if(selectedUsers.length>0){
  //     filteredUsersData = responseHistory.filter(item => selectedUsers.includes(item.userId));
  //   }
  //   setResponseHistory([...filteredOptionsData,...filteredUsersData])
  // }


  function updateHistoryData() {
    let filteredOptionsData = responseHistory;
    let filteredUsersData = responseHistory;
  
    if (selectedFiledNames.length > 0) {
      filteredOptionsData = responseHistory.filter(item => selectedFiledNames.includes(item.fieldId));
    }
  
    if (selectedUsers.length > 0) {
      filteredUsersData = responseHistory.filter(item => selectedUsers.includes(item.userId));
    }
  
    // Combine both filters and remove duplicates
    const combinedFilteredData = [...new Set([...filteredOptionsData, ...filteredUsersData])];
  
    setResponseHistory(combinedFilteredData);
  }
  function resetHistoryData() {
    setSelectedFieldnames([]);
    setSelectedusers([]);
    setResponseHistory(backUpResponseHistory);
  }

  return (
    <React.Fragment>
      <div className={loaderFlag ? "modal-header align-center modalheader border-bottom-0 loading" : "modal-header align-center modalheader border-bottom-0"}>
        <h5 className="modal-title"></h5>
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
        <div className="nk-fmg-listing is-scrollable">
          <div className="nk-files nk-files-view-list is-compact">
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <CardTitle>
                  <h6 className="title">Revision History</h6>
                </CardTitle>
                <div className="card-tools" style={{ position: 'relative' }}>
                  <ul className="card-tools-nav">
                    <Icon
                      style={{ cursor: 'pointer' }}
                      name={'filter-alt'}
                      onClick={toggleFilter}
                    />
                    {isFilterOpen && (
                      <div
                        className="filter-box"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          zIndex: 10,
                          background: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '10px',
                          boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                          width: '250px',
                        }}
                      >
                        <div 
                        // style={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                          <label>Field Name</label>
                          <CheckPicker
                            style={{ width: 350 }}
                            data={fieldnameOptions}
                            value={selectedFiledNames}
                            onChange={(e) => setSelectedFieldnames(e)}
                          />
                        </div>
                        <div 
                        style={{ marginTop: '10px',
                          //  display: 'flex',
                          //   justifyContent: 'space-between'
                           }}
                        >
                          <label>User</label>
                          <CheckPicker
                            style={{ width: 350,marginBottom:'10px' }}
                            data={userNameOptions}
                            value={selectedUsers}
                            onChange={(e) => setSelectedusers(e)}
                          />
                        </div>
                        <div 
                        style={{ marginTop:'5px',
                          // display: 'flex', 
                          // justifyContent: 'space-between' 
                        }}
                        >
                          <button onClick={()=>updateHistoryData()} className="btn btn-primary">Filter</button>
                          <button style={{marginLeft:'10px'}} onClick={()=>resetHistoryData()} className="btn btn-secondary">Reset</button>
                        </div>
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <ul>
              {responseHistory.map((item) => (
                <li className="nk-activity-item" key={item.name}>
                  <UserAvatar
                    className="nk-activity-media"
                    theme="success"
                    image={item.img}
                    text={item.name[0]}
                  ></UserAvatar>
                  <div style={{ paddingLeft: '20px' }} className="nk-activity-data">
                    <div className="label">{item.activity}</div>
                    <span className="time">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="modal-footer bg-light">
        <div className="modal-footer-between"></div>
        <Toaster />
      </div>
    </React.Fragment>
  );
};

export default FormRevisionHistories;
