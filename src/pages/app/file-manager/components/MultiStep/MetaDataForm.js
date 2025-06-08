import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import CreatableSelect from 'react-select/creatable';
import { Icon } from "../../../../../components/Component";
import * as API from '../../../../../utils/API';
import { addNewFile, saveCurrentSection, setFiles } from "../../../../../redux/folderSlice";
import toast from "react-hot-toast";


const MetaDataForm = ({
    defaultMetaData,

    dropdownOpen, setDropdownOpen,
    customMetaDataOptions, setCustomMetaDataOptions,
    selectedMetaDataOptions, setSelectedMetaDataOptions,
    customMetaData, setCustomMetaData,
    handleSubmit,

    docNum, setDocNum,
    notes, setNotes,
    docTypeData, setDocTypeData,
    secdocTypeData, setSecDocTypeData,

    keywordsData, setKeywordsData,
    docTypeOptionsData, setDocTypeOptionsData,
    secdocTypeOptionsData, setsecDocTypeOptionsData,

    keywordOptionsData, setKeywordOptionsData,

    toggleCustomMetaModal = null

}) => {

    const metadataRef = useRef(null);

    useEffect(() => {
        const handleEnterPress = (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        };
        document.querySelector('.metadata_form').addEventListener('keydown', handleEnterPress);
        return () => {
            // console.log(document.querySelector('.metadata_form'),"metadata_form")
            // document.querySelector('.metadata_form').removeEventListener('keydown', handleEnterPress);
        };
    }, []);

    const inputRef = useRef(null);


    useEffect(() => {
        inputRef.current.focus();
    }, []);


    const selectOptions = (item) => {
        if (item['id'] == 'doctype') {
            let op = item.placeholder?.includes('Primary') ? 'primary' : 'secondary'
            return op == 'primary' ? [...docTypeOptionsData] : [...secdocTypeOptionsData]
        }

        if (item['id'] == 'keywords') {
            return [...keywordOptionsData]
        }

    }

    const handleChange = (item, newvalue) => {


        if (item['id'] == 'doctype') {
            let op = item.placeholder?.includes('Primary') ? 'primary' : 'secondary'
            op == 'primary' ? setDocTypeData(newvalue) : setSecDocTypeData(newvalue)
        }

        if (item['id'] == 'keywords') {
            setKeywordsData(newvalue)
        }

    }

    const selectableSetValues = (item) => {

        if (item['id'] == 'doctype') {
            let op = item.placeholder?.includes('Primary') ? 'primary' : 'secondary'
            return op == 'primary' ? docTypeData : secdocTypeData
        }

        if (item['id'] == 'keywords') {
            return keywordsData
        }
    }

    const handleCreate = async (item, inputValue) => {

        const newOption = { value: inputValue, label: inputValue };

        if (item['id'] == 'doctype') {
            let op = item?.placeholder.includes('Primary') ? 'primary' : 'secondary'
            let docResponse = await API.createDocumentType(op, inputValue)
            if (docResponse['status']) {
                if (op == 'primary') {
                    setDocTypeOptionsData((prevOptions) => [...prevOptions, newOption])
                    setDocTypeData((prevSelected) => [...prevSelected, newOption])
                }
                else {
                    setsecDocTypeOptionsData((prevOptions) => [...prevOptions, newOption])
                    setSecDocTypeData((prevSelected) => [...prevSelected, newOption])
                }
            }
        }

        if (item['id'] == 'keywords') {
            let keywordResponse = await API.createKeywords(inputValue)
            if (keywordResponse['status']) {
                setKeywordOptionsData((prevOptions) => [...prevOptions, newOption])
                setKeywordsData((prevSelected) => [...prevSelected, newOption])
            }
        }

    }

    const textSetValues = (item) => {
        if (item['id'] == 'docNum') {
            return docNum.concat('')
        }
    }

    const textareaSetValues = (item) => {
        if (item['id'] == 'notes') {
            return notes.concat()
        }
    }

    const handleTextChange = (e, item) => {
        e.preventDefault()
        e.stopPropagation()
        e.persist()
        if (item['id'] == 'docNum') {
            setDocNum(e.target.value)
        }
    }


    const handleTextareaChange = (e, item) => {
        if (item['id'] == 'notes') {
            setNotes(e.target.value)
        }
    }

    const toggleDropdown = useCallback(() => setDropdownOpen(prevState => !prevState), [dropdownOpen]);


    const handleClickedMetaOptions = (item) => {
        setSelectedMetaDataOptions(prev => [...prev, item])
        setCustomMetaData(prevMetaData => ({
            ...prevMetaData,
            [item._id]: { name: item?.name, value: null }
        }))

        var options = customMetaDataOptions?.filter(opt => opt['_id'] != item['_id'])
        setCustomMetaDataOptions(options)

    }

    const handleDeleteInput = (e, item) => {
        e.preventDefault();

        var options = customMetaDataOptions
        options.push(item)

        setCustomMetaDataOptions(options)


        var selectedFields = selectedMetaDataOptions?.filter(sid => sid['_id'] != item['_id'])
        setSelectedMetaDataOptions(selectedFields)

        setCustomMetaData(prevState => {
            const newObj = { ...prevState }
            delete newObj[item['_id']]
            return newObj
        })
    }

    const handleCustomMetaData = (e, item) => {
        // e.preventDefault();
        const newValue = e.target.value;

        setCustomMetaData(prevMetaData => ({
            ...prevMetaData,
            [item._id]: { name: item?.name, value: newValue }
        }))
    }

    return (
        <>
            {!defaultMetaData && <center>No Meta is to Display!</center>}
            {defaultMetaData?.map((item, idx) => (
                <div id="metadata_form" ref={metadataRef} className="form-group metadata_form" key={`${idx + ""}`}>
                    <label className="form-label">{item?.fieldName} </label> {/* {item.required && <span style={{ color: 'red' }}> *</span>} */}

                    {item?.type == 'text' &&
                        <input
                            type="text"
                            id={item?.id}
                            placeholder={item?.placeholder}
                            className="form-control"
                            name={item?.fieldName}
                            value={textSetValues(item)}
                            onChange={(e) => handleTextChange(e, item)}
                            ref={inputRef}
                        />
                    }

                    {item?.type == 'tag' &&
                        <CreatableSelect
                            isMulti
                            value={selectableSetValues(item)}
                            placeholder={item?.placeholder}
                            onCreateOption={(inputValue) => handleCreate(item, inputValue)}
                            onChange={(newvalue) => handleChange(item, newvalue)}
                            options={selectOptions(item)}
                        />
                    }

                    {item.type == "textarea" &&
                        <textarea
                            id={item?.id}
                            placeholder={item?.placeholder}
                            className="form-control"
                            name={item.fieldName}
                            value={textareaSetValues(item)}
                            onChange={(e) => handleTextareaChange(e, item)}
                        />
                    }

                </div>
            ))}

            <div className="form-group" >
                <label className="form-label"> Custom MetaData Fields </label>

                <div class='row'>
                    {selectedMetaDataOptions && selectedMetaDataOptions?.map(item => (
                        <>
                            <div class="col-md-6 mt-3"><input type="text" class="form-control" value={item?.name} disabled /></div>

                            <div class="listOptions-icons col-md-6 mt-3">

                                {item?.type == 'string' &&
                                    <input
                                        type="text"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter a string"
                                    />
                                }

                                {item?.type === 'boolean' && (
                                    <div className="form-control-wrap">
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name={`radio_${item._id}`}
                                                id={`radio_yes_${item._id}`}
                                                value="yes"
                                                checked={customMetaData[item._id]?.['value'] === 'yes'}
                                                onChange={(e) => handleCustomMetaData(e, item)}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`radio_yes_${item._id}`}
                                            >
                                                Yes
                                            </label>
                                        </div>

                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name={`radio_${item._id}`}
                                                id={`radio_no_${item._id}`}
                                                value="no"
                                                checked={customMetaData[item._id]?.['value'] === 'no'}
                                                onChange={(e) => handleCustomMetaData(e, item)}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`radio_no_${item._id}`}
                                            >
                                                No
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {item?.type == 'list' &&
                                    <select className="form-select" value={customMetaData[item._id]?.['value'] || null} onChange={(e) => handleCustomMetaData(e, item)}>
                                        <option value="">Select an option</option>
                                        {item.options && item.options.map((opt, index) => (<option key={index} value={`${opt}`}>{opt}</option>))}
                                    </select>
                                }

                                {item?.type == 'date' &&

                                    <input
                                        type="date"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                    />
                                }

                                {item?.type == 'datetime' &&
                                    <input
                                        type="datetime-local"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                    />
                                }

                                {item?.type == 'email' &&
                                    <input
                                        type="email"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter a email"
                                    />
                                }

                                {item?.type == 'integer' &&
                                    <input
                                        type="number"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter a number"
                                        min={0}
                                        step={1}
                                    />
                                }


                                {item?.type == 'decimal' &&
                                    <input
                                        type="number"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter a Decimal number"
                                        min={0}
                                        step={0.01}
                                    />
                                }

                                {item?.type == 'text' &&
                                    <textarea
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter your text here"
                                        rows={4}
                                        cols={50}
                                    />
                                }

                                {item?.type == 'time' &&
                                    <input
                                        type="time"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Select time"
                                    />
                                }

                                {item?.type == 'url' &&
                                    <input
                                        type="url"
                                        value={customMetaData[item._id]?.['value'] || ''}
                                        className="form-control"
                                        name={item?.name}
                                        onChange={(e) => handleCustomMetaData(e, item)}
                                        placeholder="Enter a URL"
                                    />
                                }

                                <Icon name="trash-empty" className='deleteclass mx-2' onClick={(e) => handleDeleteInput(e, item)} />
                            </div>

                        </>
                    ))}
                </div>

                <div className='mt-3'>
                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle tag="span">
                            <Icon name="plus" style={{ cursor: 'pointer' }} />
                        </DropdownToggle>
                        <DropdownMenu>
                            {customMetaDataOptions && customMetaDataOptions?.map(item => (
                                <DropdownItem onClick={() => handleClickedMetaOptions(item)}>
                                    {item.name}
                                </DropdownItem>
                            ))}

                            <DropdownItem onClick={toggleCustomMetaModal}>
                                +
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>

            </div>


            {/* <Button className="mx-3"
                // onClick={() => prev()}
                color="light">
                Previous
            </Button>

            <Button color="primary" onClick={upload}>
                Submit
            </Button> */}
        </>
    )
}

export default MetaDataForm