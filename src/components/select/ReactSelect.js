// import React from "react";
// import Select from "react-select";

// const RSelect = ({ ...props }) => {
//   return (
//     <div className="form-control-select">
//       <Select
//         className={`react-select-container ${props.className ? props.className : ""}`}
//         classNamePrefix="react-select"
//         {...props}
//       />
//     </div>
//   );
// };

// export default RSelect;

import React,{useState} from "react";
import Select from "react-select";
import { Icon } from "../Component";
import * as API from '../../utils/API';
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useLocation } from "react-router";
import { Tooltip } from "reactstrap";


const RSelect = ({ ...props }) => {

  const location = useLocation();
  async function deleteSelection(e, role) {
    e.stopPropagation();
    const associatedUsers = await API.getUsersWithRole(role.id)
    if (!associatedUsers.status) {
      return toast.error('Error in Fetching Role Associated Users');
    }
    const associatedUsersList = associatedUsers.data.map((member) => member.userName).join(", ")
    Swal.fire({
      title: `Are you sure you want to delete ${role.label}?`,
      text: associatedUsersList.length > 0 ? `${associatedUsersList} have the role ${role.label} associated` : '',
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResponse = await API.deleteRole(role.id);
        if (!deleteResponse.status) {
          return toast.error('Error in Deleting Role!');
        }
        // toast.success(`Role ${role.label} Deleted`);
        props.setRoleUpdateFlag(prev => !prev)
        Swal.fire("Deleted!", `Role ${role.label} Deleted`, "success");
      }
    });

  }

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
      setTooltipOpen((prevState) => ({
        ...prevState,
        [id]: !prevState[id],
      }));
    };
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="custom-option select_option"
        style={{ display: "flex", alignItems: "center", paddingInline: '0.3rem', justifyContent: "space-between" }}
      >
        <span >{data.label}</span>
        {(location.pathname.includes('accessOverview') && data.label != 'Super Admin' && localStorage.getItem('role') == 'Super Admin') &&
          <>
            <Icon id={`delete_role`} title={`Delete Role`} className={'custom-error-message'} onClick={(e) => deleteSelection(e, data)} name="trash" ></Icon>
            {/* <Tooltip
              placement="bottom"
              isOpen={tooltipOpen[`delete_role`] || false}
              target={`delete_role`}
              toggle={() => toolTipToggle(`delete_role`)}
            >
              {`Delete Role`}
            </Tooltip> */}
          </>
        }
      </div>
    );
  };

  return (
    <div className="form-control-select">
      <Select
        className={`roleselector react-select-container ${props.className ? props.className : ""}`}
        classNamePrefix="react-select"
        isSearchable={false}
        components={{
          Option: customOption,
        }}
        {...props}
      />
    </div>
  );
};

export default RSelect;
