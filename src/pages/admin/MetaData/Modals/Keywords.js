import { useState, useEffect, useRef } from "react";
import { Button, Icon } from "../../../../components/Component";
import toast from "react-hot-toast";
import * as API from '../../../../utils/API';
import PropTypes from 'prop-types';


const Keywords = ({ toggle, addnewkeyword, updateKeywordData = null }) => {

    const [formData, setFormData] = useState({
        name: ''
    })

    const [keywordError, setKeywordError] = useState('');
    const [keywordErr, setKeywordErr] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {

        if (updateKeywordData) {
            setFormData({
                name: updateKeywordData['name'],
            })
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }

    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target
        setKeywordError('');
        setKeywordErr(false);
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const onSubmit = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        let { name } = formData;

        if (!name) {
            setKeywordError('Enter the Keyword Name!');
            setKeywordErr(true);
            return;

        }

        let keywordsResponse = !updateKeywordData ?
            await API.createKeywords(name)
            : await API.updateKeyword(updateKeywordData.id, name)

        let { status } = keywordsResponse
        if (!status) return toast.error(`${keywordsResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        addnewkeyword()
        toggle()
    }

    const keyPress = e =>{
        if(e.key=='Enter'){
            onSubmit(e)
        }
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
                    <h5 className="title mb-3">{!updateKeywordData ? 'Create' : 'Edit'} Keyword</h5>
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
                                onKeyDown={keyPress}
                                ref={inputRef}
                            />
                            {keywordErr&&<p className="custom-error-message">{keywordError}</p>}
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
                                <Button color="primary" type="submit"> {!updateKeywordData ? 'Create' : 'Update'} </Button>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Keywords;
