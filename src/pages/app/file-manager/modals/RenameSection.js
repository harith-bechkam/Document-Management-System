import React, { useState, useEffect, useRef } from "react";
import { Icon } from "../../../../components/Component";
import { Button, Modal } from "reactstrap";
import './MultiStepLoader.css'
import * as API from '../../../../utils/API';
import { updateAsideFlag, updateMoveFlag, updateSectionName } from "../../../../redux/folderSlice";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";


const RenameSection = ({ toggle, section }) => {

    const dispatch = useDispatch();
    const sections = useSelector(state => state.folders.navigation);
    const [sectionName, setSectionName] = useState(sections.find(val => val.id == section).text)
    const [errorState, setErrorState] = useState('');
    const [emptyName, setEmptyName] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    let handleSubmit = async (check = false) => {
        if (check) {
            if(sectionName==''){
                setErrorState('Section Name cannot be Empty')
                setEmptyName(true);
                return;
            }
            const renameRespo = await API.sectionRename(section, sectionName);
            if (!renameRespo.status){ 
                setErrorState(renameRespo.message)
                setEmptyName(true);
                return;
            }
            toast.success('Section renamed successfully');
            dispatch(updateAsideFlag({}));
            dispatch(updateMoveFlag({}))
            dispatch(updateSectionName({
                id:section,
                name:sectionName
            }))
        }
        toggle()

    };

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
                <Icon name="cross-sm" />
            </a>
            <div className="modal-body modal-body-md">
                <div className="nk-upload-form mb-0">
                    <h5 className="title mb-3">Rename {'Section'}</h5>
                    <form>
                        <div className="form-group">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={sectionName}
                                    onChange={(e) => {setErrorState('');setEmptyName(false);setSectionName(e.target.value)}}
                                    ref={inputRef}
                                />
                            </div>
                        </div>
                        {emptyName&&<p style={{color:'red'}}>{errorState}</p>}
                        <ul className="btn-toolbar g-4 align-center justify-end">
                            <li>
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
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
                                    handleSubmit(true);
                                }}>
                                    Submit
                                </Button>
                            </li>
                        </ul>
                    </form>
                </div>

            </div>


        </React.Fragment >

    );
};

export default RenameSection;
