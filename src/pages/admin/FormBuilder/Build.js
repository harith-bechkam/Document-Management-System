import React, { useState, useEffect, forwardRef, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, PreviewCard, BlockDes, Button, Icon, Block } from "../../../components/Component";
import * as API from "../../../utils/API";
import toast, { Toaster } from "react-hot-toast";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import { useDispatch, useSelector } from "react-redux";

import { saveformBuilderId, saveformBuilderjson, updateLoaderFlag } from "../../../redux/folderSlice";
import { Card, CardBody, CardHeader, Modal, CardTitle, CardText } from "reactstrap";
import FormBuilder, { Registry, ReactFormGenerator } from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';


// import { ReactFormBuilder, ReactFormGenerator } from 'react-form-builder2';
// import 'react-form-builder2/dist/app.css';




const Build = () => {

    // const [name, setName] = useState('')
    const [name, setName] = useState("Untitled Form");
    const [editingName, setEditingName] = useState(false);
    const nameInputRef = useRef(null);
    const [error, setError] = useState(false)
    const [windowType, setWindowType] = useState({ id: null, op: 'add' })

    const [preview, setPreview] = useState(false)
    const [previewData, setPreviewData] = useState([])

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    let { formBuilderId, formBuilderName } = useParams()
    const store = useSelector(state => state.folders)


    useEffect(() => {
        alignFormBuilder()
        checkWindowType()
    }, [])


    const alignFormBuilder = () => {
        const builderDivs = document.querySelectorAll('.react-form-builder');

        if (builderDivs.length > 0) {
            builderDivs.forEach(builderDiv => {
                let siblingDiv = builderDiv.parentElement.querySelector('div:not(.react-form-builder)');

                if (siblingDiv && siblingDiv !== builderDiv) {
                    siblingDiv.classList.add('row')
                    siblingDiv.style.margin = '0.2rem'
                }
            })
        }
    }

    const checkWindowType = async () => {

        let id = formBuilderId
        dispatch(saveformBuilderId(id))

        if (id) {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            var formResponse = await API.getFormBuilder(formBuilderId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))


            dispatch(saveformBuilderjson(formResponse['data']))
            setPreviewData(formResponse['data'])
            setWindowType({ id, op: 'edit' })
            setName(formBuilderName)
        }
        else {
            setWindowType({ id: null, op: 'add' })
        }
    }

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please Fill Name Field")
            setError(true)
            return
        }

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let formResponse = await API.saveFormBuilder(name, store['formBuilderjson'], 'single')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (!formResponse['status'])
            return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        navigate(`/formBuild`)
        toast.success(`${formResponse['message']}`)
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please Fill Name Field")
            setError(true)
            return
        }

        if (!formBuilderId) {
            toast.error('Id is Missing')
            return
        }

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let formResponse = await API.updateFormBuilder(formBuilderId, name, store['formBuilderjson'])
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (!formResponse['status'])
            return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        navigate(`/formBuild`)
        toast.success(`${formResponse['message']}`)
    }

    const handlePreview = async (e) => {
        e.preventDefault();

        setPreview(true)
        setPreviewData(store['formBuilderjson'])
    }

    const togglePreview = () => {
        setPreview(!preview)
    }

    const handleNameClick = () => {
        setEditingName(true);
        setTimeout(() => {
            nameInputRef.current && nameInputRef.current.focus();
        }, 0);
    };

    return (
        // <React.Fragment>
        //     <Head title={'Forms'} />
        //     <FileManagerLayout>
        //         <FilesBody>
        //             <Content>

        //                 <div className="form-group">
        //                     <label className="form-label"> Form Name </label>
        //                     <input
        //                         type="text"
        //                         placeholder={"Enter your Form Name"}
        //                         className={`form-control ${error ? 'error' : ''}`}
        //                         name="form-name"
        //                         value={name}
        //                         onChange={(e) => {
        //                             setError(false)
        //                             setName(e.target.value)
        //                         }}
        //                     />
        //                     <div className="previewBtn"><Button color="primary" className="mx-3" onClick={handlePreview}>Preview Form</Button> </div>
        //                 </div>

        // <div className="formbuilder">
        //     <FormBuilder.ReactFormBuilder
        //         url={formBuilderId && `${process.env.REACT_APP_BE_URL}/form/get/${formBuilderId}`}
        //         saveUrl={`${process.env.REACT_APP_BE_URL}/form/add`}
        //     />
        //     {/* <FormBuilder.ReactFormBuilder
        //         url=""
        //         saveUrl=""
        //     /> */}
        // </div>

        //                 <div className="form-builder-footer">

        //                     <Button color="primary" onClick={formBuilderId ? handleUpdate : handleSave}>
        //                         {formBuilderId ? 'Save' : 'Create'} Form
        //                     </Button>
        //                     <Button className="mx-3"
        //                         onClick={() => navigate(`/formBuild`)}
        //                         color="light"
        //                     >
        //                         Cancel
        //                     </Button>
        //                 </div>

        // <Modal isOpen={preview} size="xl">
        //     <>
        //         <a
        //             href="#close"
        //             onClick={(ev) => {
        //                 ev.preventDefault();
        //                 togglePreview();
        //             }}
        //             className="close"
        //         >
        //             <Icon name="cross-sm"></Icon>
        //         </a>
        //         <div className="modal-body modal-body-md">
        //             <div className="nk-upload-form mb-0">
        //                 {/* <h5 className="title mb-3">Preview {name}</h5> */}

        //                 <div className="formbuilder">
        //                     <ReactFormGenerator
        //                         data={previewData}
        //                         read_only={false}
        //                         hide_actions={true}
        //                     />
        //                 </div>

        //                 <ul className="btn-toolbar g-4 align-center justify-end">
        //                     <li>
        //                         <Button
        //                             color="primary"
        //                             onClick={(ev) => {
        //                                 ev.preventDefault()
        //                                 togglePreview()
        //                                 setPreview(false)
        //                             }}
        //                         > Close </Button>
        //                     </li>
        //                 </ul>

        //             </div>
        //         </div>
        //     </>
        // </Modal>

        //             </Content>
        //         </FilesBody>
        //     </FileManagerLayout>
        // </React.Fragment>

        <Card className="card-bordered">
            <CardHeader className="form-builder-custom-card-header border-bottom">
                <div className="d-flex align-items-center justify-content-between py-1">

                    <div className="d-flex align-items-center">
                        <Icon style={{ fontWeight: 'bold', cursor: 'pointer', marginInline: '1rem' }} onClick={() => navigate(`/formBuild`)} name="arrow-long-left" />
                        <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                            {editingName ? (
                                <input
                                    type="text"
                                    ref={nameInputRef}
                                    className={`form-control ${error ? "error" : ""}`}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (e.target.value.trim() === "") {
                                            setError(true);
                                        } else {
                                            setError(false);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (name.trim() === "") {
                                            setError(true);
                                        } else {
                                            setEditingName(false);
                                        }
                                    }}
                                />
                            ) : (
                                <label className="form-label mb-0" onClick={handleNameClick} style={{ cursor: "pointer" }}>
                                    {name}
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="d-flex align-items-center">

                        <Button color="btn btn-primary mx-3 form-builder-preview-button" className="mx-3" onClick={handlePreview}>Preview</Button>

                        <Button color="primary" className={'form-builder-save-button'} onClick={formBuilderId ? handleUpdate : handleSave}>
                            {formBuilderId ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </div>

            </CardHeader>
            <CardBody className="form-builder-custom-card-body card-inner">
                {/* <Content> */}

                <div className="formbuilder mt-5">
                    <FormBuilder.ReactFormBuilder
                        url={formBuilderId && `${process.env.REACT_APP_BE_URL}/form/get/${formBuilderId}`}
                        saveUrl={`${process.env.REACT_APP_BE_URL}/form/add`}
                    />
                    {/* <FormBuilder.ReactFormBuilder
                                url=""
                                saveUrl=""
                            /> */}
                </div>


                <Modal isOpen={preview} size="xl">
                    <>
                        <a
                            href="#close"
                            onClick={(ev) => {
                                ev.preventDefault();
                                togglePreview();
                            }}
                            className="close"
                        >
                            <Icon name="cross-sm"></Icon>
                        </a>
                        <div className="modal-body modal-body-md">
                            <div className="nk-upload-form mb-0">
                                {/* <h5 className="title mb-3">Preview {name}</h5> */}

                                <div className="formbuilder">
                                    <ReactFormGenerator
                                        data={previewData}
                                        read_only={false}
                                        hide_actions={true}
                                    />
                                </div>

                                <ul className="btn-toolbar g-4 align-center justify-end">
                                    <li>
                                        <Button
                                            color="primary"
                                            onClick={(ev) => {
                                                ev.preventDefault()
                                                togglePreview()
                                                setPreview(false)
                                            }}
                                        > Close </Button>
                                    </li>
                                </ul>

                            </div>
                        </div>
                    </>
                </Modal>

                {/* </Content> */}
            </CardBody>
        </Card>
    )
}

export default Build;