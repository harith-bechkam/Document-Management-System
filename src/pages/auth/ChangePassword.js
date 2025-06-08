import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Head from "../../layout/head/Head";
import {
    Block,
    BlockContent,
    BlockHead,
    BlockTitle,
    Button,
    PreviewCard
} from "../../components/Component";
import { Spinner } from "reactstrap";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../utils/API';

const ChangePassword = ({ toggle }) => {

    const inputRef = useRef(null)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        confirmPassword: "",
        newPassword: ""
    });

    const [errors, setErrors] = useState({
        currentPassword: "",
        confirmPassword: "",
        newPassword: ""
    });

    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/;

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, [id]: "" });
    };

    useEffect(()=>{
        if(inputRef.current){
            inputRef.current.focus();
        }
    },[])

    const validateField = (field) => {
        const value = formData[field];
        switch (field) {
            case "currentPassword":
                if (!passwordRegex.test(value) && value != '') {
                    setErrors({
                        ...errors,
                        currentPassword: "Password must be 6-20 characters with uppercase, lowercase, number, and special character."
                    });
                }
                break;
            case "confirmPassword":
                if (value !== formData.newPassword) {
                    setErrors({
                        ...errors,
                        confirmPassword: "Passwords do not match."
                    });
                }
                break;
            case "newPassword":
                if (!passwordRegex.test(value)) {
                    setErrors({
                        ...errors,
                        newPassword: "Password must be 6-20 characters with uppercase, lowercase, number, and special character."
                    });
                } else if (value === formData.currentPassword) {
                    setErrors({
                        ...errors,
                        newPassword: "New password cannot be the same as the current password."
                    });
                }
                break;
            default:
                break;
        }
    };

    const submit = async () => {
        const { currentPassword, confirmPassword, newPassword } = formData;


        let hasErrors = false;
        if (!passwordRegex.test(currentPassword)) {
            setErrors((prev) => ({
                ...prev,
                currentPassword: "Password must be 6-20 characters with uppercase, lowercase, number, and special character."
            }));
            hasErrors = true;
        }
        if (confirmPassword !== newPassword) {
            debugger
            setErrors((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match."
            }));
            hasErrors = true;
        }
        if (!passwordRegex.test(newPassword)) {
            setErrors((prev) => ({
                ...prev,
                newPassword: "Password must be 6-20 characters with uppercase, lowercase, number, and special character."
            }));
            hasErrors = true;
        } else if (newPassword === currentPassword) {
            setErrors((prev) => ({
                ...prev,
                newPassword: "New password cannot be the same as the current password."
            }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);
        const updateResponse = await API.updatePassword(localStorage.getItem('email'), formData.currentPassword, formData.newPassword);
        if (!updateResponse.status) {
            setLoading(false);
            if (updateResponse.message == 'Incorrect Password') {
                setErrors((prev) => ({
                    ...prev,
                    currentPassword: updateResponse.message
                }));
                hasErrors = true;
            }
            return
        }
        setLoading(false);
        toast.success("Password changed successfully");
        toggle();
    };

    const handlePress = (e) => {
        if(e.key=='Enter'){
            submit();
        }
    }

    return (
        <>
            <Head title="Forgot-Password" />
            <Block className="nk-block-middle nk-auth-body wide-xs">
                <PreviewCard bodyClass="card-inner-lg">
                    <BlockHead>
                        <BlockContent>
                            <BlockTitle tag="h5">Reset password</BlockTitle>
                        </BlockContent>
                    </BlockHead>
                    <div className="form-group">
                        <div className="form-label-group">
                            <label className="form-label" htmlFor="currentPassword">Current Password</label>
                        </div>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            id="currentPassword"
                            placeholder="Enter your current password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            onBlur={() => validateField("currentPassword")}
                            onKeyDown={handlePress}
                            ref={inputRef}
                        />
                        {errors.currentPassword && (
                            <p style={{ color: "red" }}>{errors.currentPassword}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <div className="form-label-group">
                            <label className="form-label" htmlFor="newPassword">New Password</label>
                        </div>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            id="newPassword"
                            placeholder="Enter your new password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            onBlur={() => validateField("newPassword")}
                            onKeyDown={handlePress}
                        />
                        {errors.newPassword && (
                            <p style={{ color: "red" }}>{errors.newPassword}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <div className="form-label-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        </div>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onBlur={() => validateField("confirmPassword")}
                            onKeyDown={handlePress}
                        />
                        {errors.confirmPassword && (
                            <p style={{ color: "red" }}>{errors.confirmPassword}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <Button onClick={submit} color="primary" size="lg" className="btn-block">
                            {loading ? <Spinner size="sm" color="light" /> : "Submit"}
                        </Button>
                    </div>
                </PreviewCard>
            </Block>
            <Toaster />
        </>
    );
};

export default ChangePassword;
