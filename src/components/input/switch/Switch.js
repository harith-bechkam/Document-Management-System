import React, { useEffect, useState } from "react";
import * as API from "../../../utils/API";

const InputSwitch = ({ label, privilege, id, checked, role, module, action, fetchRoles }) => {

  const [inputCheck, setCheck] = useState(checked ? true : false)

  useEffect(() => {
    setCheck(checked ? true : false)
  }, [checked])

  const handleClick = async () => {
    setCheck(!inputCheck)
    let response = await API.updateRole(role, module, action, !inputCheck)
    fetchRoles()
  }

  return (
    <React.Fragment>
      <input
        type="checkbox"
        className="custom-control-input"
        // defaultChecked={inputCheck}
        checked={inputCheck}
        onClick={privilege ? handleClick : null}
        id={id}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </React.Fragment>
  );
};

export default InputSwitch;
