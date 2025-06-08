import { useState, useEffect } from "react";
import { Button, Icon } from "../../../../components/Component";
import Select from "react-select";
import toast from "react-hot-toast";
import * as API from '../../../../utils/API';
import PropTypes from 'prop-types';
import { useRef } from "react";

const CustomMetaData = ({ toggle, addnewcustommetadata, updateCustomMetaData = null, op = null, setCustomMetaDataOptions }) => {

    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        type: ''
    })
    const [typeOptions, setTypeOptions] = useState([])
    const [listOptions, setListOptions] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        let options = [
            { value: "string", label: "String" },
            { value: "boolean", label: "Boolean" },
            { value: "date", label: "Date" },
            { value: "datetime", label: "Datetime" },
            { value: "decimal", label: "Decimal" },
            { value: "email", label: "E-mail" },
            { value: "integer", label: "Integer" },
            { value: "list", label: "List" },
            { value: "text", label: "Long text" },
            { value: "time", label: "Time" },
            { value: "url", label: "URL" }
        ]

        setTypeOptions(options)

        if (op != 'Normal Modal') {

            if (updateCustomMetaData) {

                let typeIdx = options.findIndex(item => item['value'] == updateCustomMetaData['type'])

                setFormData({
                    name: updateCustomMetaData['name'],
                    desc: updateCustomMetaData['desc'],
                    type: typeIdx != -1 ? options[typeIdx] : '',
                })
                setListOptions(updateCustomMetaData['options'])
            }

        }

        if(inputRef.current){
            inputRef.current.focus();
        }


    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleTypeChange = async (selectedOption) => {

        selectedOption['value'] == 'list' ? handleAddInput() : setListOptions([])

        setFormData({
            ...formData,
            type: selectedOption
        })
    }

    const handleAddInput = () => {
        setListOptions([...listOptions, ""]);
    };

    const handleOptionsChange = (index, e) => {
        e.preventDefault();
        e.stopPropagation();

        const newOptions = [...listOptions];
        newOptions[index] = e.target.value;
        setListOptions(newOptions);
    }

    const handleDeleteInput = (e, index) => {
        e.preventDefault();
        e.stopPropagation();

        let newOptions = [...listOptions];
        newOptions[index] = '';
        newOptions = newOptions.filter(item => item != '')
        setListOptions(newOptions);
    }

    const onSubmit = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        let { name, desc, type } = formData;

        if (!updateCustomMetaData) {
            if (!name || !type) return toast.error('Please fill Mandatory Fields'.replace(/\b\w/g, char => char.toUpperCase()));
        }
        else
            if (!name) return toast.error('Please fill Mandatory Fields'.replace(/\b\w/g, char => char.toUpperCase()));


        let metaResponse = !updateCustomMetaData ?
            await API.createCustomMetaData(name, desc, type['value'], listOptions)
            : await API.updateCustomMetaData(updateCustomMetaData.id, name, desc, type['value'], listOptions)

        let { status } = metaResponse
        if (!status) return toast.error(`${metaResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        if (op != 'Normal Modal') {
            addnewcustommetadata()
        }

        op == 'Normal Modal' && setCustomMetaDataOptions(prev => ([...prev, metaResponse['data']]))

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
                    <h5 className="title mb-3">{!updateCustomMetaData ? 'Create' : 'Edit'} Custom Metadata</h5>
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
                                ref={inputRef}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="desc">Description</label>
                            <input
                                type="text"
                                className="form-control"
                                name="desc"
                                id="desc"
                                value={formData['desc']}
                                onChange={handleChange}
                            />
                        </div>

                        {!updateCustomMetaData &&
                            <div className="form-group">
                                <label className="form-label" htmlFor="type">Type<span style={{ color: 'red' }}> *</span></label>
                                <Select
                                    id="type"
                                    options={typeOptions}
                                    value={formData['type']}
                                    placeholder='Select Type..'
                                    onChange={handleTypeChange}
                                />
                            </div>
                        }


                        {formData['type']?.['value'] == 'list' &&
                            <div className="form-group">
                                <label className="form-label" htmlFor="type">Options</label>

                                {listOptions.map((inputValue, index) => (
                                    <div key={`${index + ""}`} className={`input-group ${index > 0 ? 'listOptions' : ''}`}>
                                        <input
                                            type="text"
                                            id="type"
                                            className="form-control"
                                            name={`options-${index}`}
                                            value={inputValue}
                                            onChange={(e) => handleOptionsChange(index, e)}
                                        />
                                        <div className="listOptions-icons">
                                            <Icon name="plus" className="plusclass" onClick={handleAddInput} />
                                            <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleDeleteInput(e, index)} />
                                        </div>
                                    </div>
                                ))}

                            </div>
                        }

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
                                <Button color="primary" type="submit"> {!updateCustomMetaData ? 'Create' : 'Update'} </Button>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>
        </>
    )
}

CustomMetaData.propTypes = {
    toggle: PropTypes.func.isRequired,
    addnewcustommetadata: PropTypes.func.isRequired,
    updateCustomMetaData: PropTypes.func.isRequired
    // PropTypes.shape({
    //     id: PropTypes.string,
    //     name: PropTypes.string,
    //     desc: PropTypes.string,
    //     type: PropTypes.string,
    //     options: PropTypes.arrayOf(PropTypes.string),
    // })
};


export default CustomMetaData;