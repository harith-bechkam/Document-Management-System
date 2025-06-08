import React, { useState, useEffect, useRef } from "react";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { required } from "../../../../../utils/formvalidator";


const CreateFolderForm = ({ folderName, setFolderName, folderCreationError, setFolderCreationError, folderCreationErr, setFolderCreationErr, handleNext }) => {

    const inputRef = useRef(null);
    const handlePress = (e) => {
        if(e.key=='Enter'){
            handleNext();
        }
    }

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    return (
        <>
            {/* <div>
                <Form ref={formRef}>
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Folder Name <span className="required">*</span>
                        </label>
                        <Input
                            type="text"
                            id="folderName"
                            name="folderName"
                            className={"form-control"}
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                            }}
                            validations={[required]}
                        />
                    </div>
                </Form>
            </div> */}
            <div className="form-group mb-3">
                <label className="form-label">Folder Name <span className="required">*</span> </label>
                <input
                    type="text"
                    id="folderName"
                    name='folderName'
                    className={folderCreationErr ? "form-control foldername_error" : "form-control"}
                    value={folderName}
                    onChange={(e) => {
                        setFolderName(e.target.value)
                        setFolderCreationErr(false);
                        setFolderCreationError('')
                    }}
                    ref={inputRef}
                    onKeyDown={handlePress}
                />
                {folderCreationErr && <p style={{ color: 'red' }}>{folderCreationError}</p>}
            </div>
        </>
    );
};

export default CreateFolderForm;
