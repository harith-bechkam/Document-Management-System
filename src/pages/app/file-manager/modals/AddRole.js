import React, { useState, useRef, useEffect } from "react";
import { Icon, RSelect } from "../../../../components/Component";
import { Button } from "reactstrap";
import data from "../Data"
import * as API from "../../../../utils/API";
import toast from "react-hot-toast"

const AddRole = ({ toggle, modulePrivileges, fetchRoles }) => {

  const [role, setRole] = useState('');
  const inputRef = useRef(null);

  const [roleError, setRoleError] = useState('');
  const [roleErr, setRoleErr] = useState(false);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleCreateRole = async () => {
    if (!role || role == '') {
      setRoleError('Enter a Role!');
      setRoleErr(true);
      return;
    }
    if (role) {
      let response = await API.createRole(role, modulePrivileges)
      if (response.status) {
        toast.success(`Role created successfully`)
        fetchRoles()
        toggle();
      }
    }
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
      <div className="modal-body modal-body-md">
        <div className="nk-upload-form mb-0">
          <h5 className="title mb-3">Create Role</h5>
          <form>
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input type="text" className="form-control" value={role} ref={inputRef} onChange={(e) => {
                setRole(e.target.value)
                setRoleError('');
                setRoleErr(false);
              }}></input>
              {roleErr && <p style={{ color: 'red' }}>{roleError}</p>}
            </div>

            <ul className="btn-toolbar g-4 align-center justify-end">
              <li>
                <a
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle();
                  }}
                  className="link link-primary"
                >
                  Cancel
                </a>
              </li>
              <li>
                <Button color="primary" type="submit" onClick={(ev) => {
                  ev.preventDefault();
                  handleCreateRole()
                }}>
                  Create
                </Button>
              </li>
            </ul>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AddRole;
