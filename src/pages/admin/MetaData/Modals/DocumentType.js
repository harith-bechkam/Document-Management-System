import { useState, useEffect } from "react";
import { Button, Icon } from "../../../../components/Component";
import toast from "react-hot-toast";
import * as API from '../../../../utils/API';
import PropTypes from 'prop-types';


const DocumentType = ({ op, toggle, addnewdefaultmetadata, updateDocTypeData = null }) => {

    const [formData, setFormData] = useState({
        name: ''
    })

    useEffect(() => {

        if (updateDocTypeData) {
            setFormData({
                name: updateDocTypeData['name'],
            })
        }

    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const onSubmit = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        let { name } = formData;

        if (!name) return toast.error('Please Fill Mandatory Fields');


        let documentTypeResponse = !updateDocTypeData ? await API.createDocumentType(op, name) : await API.updateDocumentType(op, updateDocTypeData.id, name)

        let { status } = documentTypeResponse
        if (!status) return toast.error(`${documentTypeResponse['message']}`)

        addnewdefaultmetadata()
        toggle()
    }


    return (
        <>
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
                    <h5 className="title mb-3">{!updateDocTypeData ? 'Create' : 'Edit'} {op == 'primary' ? 'Primary' : 'Secondary'} Document Type</h5>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Name<span style={{ color: 'red' }}> *</span></label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                name="name"
                                value={formData['name']}
                                onChange={handleChange}
                            />
                        </div>

                        <ul className="btn-toolbar g-4 align-center justify-end">
                            <li>
                                <button
                                    type="button"
                                    className="link link-primary"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        toggle();
                                    }}
                                >
                                    Cancel
                                </button>
                            </li>
                            <li>
                                <Button color="primary" type="submit"> {!updateDocTypeData ? 'Create' : 'Update'} </Button>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>

        </>
    )
}

export default DocumentType;
