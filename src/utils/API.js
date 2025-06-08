import axios from 'axios';
import { saveAs } from 'file-saver';
import { Buffer } from "buffer";

const login = async (email, password) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/login`, { email, password })
        .then(res => {
            const { status, message, userId, authToken, userName, email, role, privileges, timeZone, user, workspace } = res.data
            if (status) {
                response = {
                    status: true,
                    userId, authToken, userName, email, role, privileges, timeZone, user, workspace, message
                }
            }
            else {
                response = {
                    status: false,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })

    return response
}

const setloginstoragechanges = (response) => {
    debugger
    localStorage.setItem("accessToken", response?.authToken);
    localStorage.setItem("privileges", JSON.stringify(response?.privileges));
    localStorage.setItem("userId", response?.userId);
    localStorage.setItem("userName", response?.userName);
    localStorage.setItem("email", response?.email);
    localStorage.setItem("role", response?.role?.role);
    localStorage.setItem("timeZone", response?.timeZone);
    localStorage.setItem("user", JSON.stringify(response?.user));
    localStorage.setItem("userImg", JSON.stringify(response?.user?.imgUrl));
    localStorage.setItem("workspace_id", response?.workspace?.workspace_id);
    window.dispatchEvent(new Event('storage')); // Notify components of change
    return true
}

const handleSSO = async (provider, authurl) => {
    // Open new window for authentication
    const authWindow = window.open(authurl, provider + "_Login", "width=600,height=600");
    // Listen for messages from the new window
    const receiveMessage = (event) => {
        console.log(event.origin, "tette")
        if (event.origin.startsWith(process.env.REACT_APP_BE_URL) == false) return;
        let response = JSON.parse(event.data);
        if (response?.type === "AUTH_SUCCESS") {

            setloginstoragechanges(response)
            window.location.href = `/#/${response?.workspace?.workspace_id}/home`; // Redirect to dashboard
            //window.location.reload();
            window.removeEventListener("message", receiveMessage);
        }
    };

    window.addEventListener("message", receiveMessage);

}



const registernewuser = async (data) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/registernewuser`, data)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message: message
                }
            } else {
                response = {
                    status: false,
                    message: message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: "Server Error, Please try again later"
            }
        })

    return response
}


const checkEmailIdExists = async (email) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/checkEmailIdExists`, { email })
        .then(res => {
            const { status, emailexistsstatus } = res.data
            if (status) {
                response = {
                    status: true,
                    emailexistsstatus: emailexistsstatus
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })

    return response
}




const forgotPassword = async (email) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/forgotPassword`, { email })
        .then(res => {
            const { success, message } = res.data
            if (success) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const checkLinkValidity = async (fullLink, resettoken) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/linkValidity`, { fullLink, resettoken })
        .then(res => {
            const { status, message, statusCode } = res.data
            response = {
                status,
                statusCode,
                message
            }
        })
        .catch((err) => {

            let status = err.response?.data.status || false
            let statusCode = err.response?.data.statusCode || 500
            let message = err.response?.data?.message || "Something Went Wrong";

            response = {
                status,
                statusCode,
                message
            }
            return response

        })
    return response
}

const resetPassword = async (password, id) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/resetPassword/${id}`, { password })
        .then(res => {
            const { status, message, statusCode } = res.data
            response = {
                status,
                statusCode,
                message
            }
        })
        .catch((err) => {
            let status = err.response?.data.status || false
            let statusCode = err.response?.data.statusCode || 500
            let message = err.response?.data?.message || "Something Went Wrong";

            response = {
                status,
                statusCode,
                message
            }
            return response
        })
    return response
}

const createPassword = async (password, id) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/createPassword/${id}`, { password })
        .then(res => {
            const { status, message, statusCode } = res.data
            response = {
                status,
                statusCode,
                message
            }
        })
        .catch((err) => {
            let status = err.response?.data.status || false
            let statusCode = err.response?.data.statusCode || 500
            let message = err.response?.data?.message || "Something went wrong in createPassword api";

            response = {
                status,
                statusCode,
                message
            }
            return response
        })
    return response
}

const getAllRoles = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/role/getAllRoles`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}


const getAllUsers = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/getAllUsers`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const addUser = async (data) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/addUser`, { ...data })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const saveFormBuilder = async (name = "", data = [], type) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/saveFormBuilder`, { name, data, type })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const saveFormResponse = async (formObj, workspace_id = null) => {
    let response
    workspace_id = (workspace_id == null) ? localStorage.getItem("workspace_id") : workspace_id;
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/saveFormResponse/${workspace_id}`, formObj)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const updateFormBuilder = async (id = "", name = "", data = []) => {
    let response
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/form/updateFormBuilder/${id}`, { name, data })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const ssoLogin = async (data) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/ssoLogin`, { ...data })
        .then(res => {
            const { status, userId, authToken, userName, email, role, privileges } = res.data
            if (status) {
                response = {
                    status: true,
                    userId, authToken, userName, email, role, privileges
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const updateUser = async (userId, data) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/updateUser`, { userId, ...data })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const deleteUser = async (userId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/user/deleteUser/${userId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const restoreUser = async (userId) => {
    let response
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/user/restoreUser/${userId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const deleteFormBuilder = async (id) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/form/delete/${id}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const searchUsers = async (searchTerm) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/searchUsers`, { searchTerm })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const getUsersList = async (page, perPage, search, status, role, sortOrder, exportData = false) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/getUsersList?page=${page}&perPage=${perPage}`, { search, role, status, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Users-List.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getUser = async (userId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/getUser/${userId}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const getForm = async (formId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/getForm/${formId}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const getSubmission = async (formId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/getSubmission/${formId}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: null
            }
        })
    return response
}

const getSubmissionDatas = async (formId, search, page, perPage) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/getSubmissionDatas?page=${page}&perPage=${perPage}`, { formId, search })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const formValidity = async (formId = "", type = "") => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/formValidity/${formId}/${type}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: null
            }
        })
    return response
}

const getAllFormBuilder = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/getAllFormBuilder`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: false
            }
        })
    return response
}

const getFormBuilder = async (id = "") => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/getFormBuilder/${id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const getDetails = async (id) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getDetails/${id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const getOnlyOfficeDetails = async (id, workspace_id) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/getOnlyOfficeDetails/${id}/${workspace_id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const verifymicrosofttoken = async () => {
    return  axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/integration/validate/microsoft`)
        .then(res => {
            const { status, data } = res
            if (status) {
                let response = {
                    status: true,
                    data
                }
                return response
            }else{
                let response = {
                    status: false,
                    data
                }
                return response
            }
        })
        .catch((err) => {
            let response = {
                status: false,
                message: err?.response?.data?.message
            }
            return response
        })
}

const getsitelist = async () => {
    return  axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/integration/getsitelist/microsoft`)
        .then(res => {
            const { status, data } = res
            if (status) {
                let response = {
                    status: true,
                    data
                }
                return response
            }else{
                let response = {
                    status: false,
                    data
                }
                return response
            }
        })
        .catch((err) => {
            let response = {
                status: false,
                message: err?.response?.data?.message
            }
            return response
        })
}

const removeonedriveaccess = async () => {
    return  axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/integration/removeaccess/microsoft`)
        .then(res => {
            const { status, data } = res
            if (status) {
                let response = {
                    status: true,
                    data
                }
                return response
            }else{
                let response = {
                    status: false,
                    data
                }
                return response
            }
        })
        .catch((err) => {
            let response = {
                status: false,
                message: err?.response?.data?.message
            }
            return response
        })
}

const syncNow = async () => {
    return  axios
        .post(`${process.env.REACT_APP_BE_URL}/registerMigratorEventsForMe`)
        .then(res => {
            const { status, data } = res
            if (status) {
                let response = {
                    status: true,
                    data
                }
                return response
            }else{
                let response = {
                    status: false,
                    data
                }
                return response
            }
        })
        .catch((err) => {
            let response = {
                status: false,
                message: err?.response?.data?.message
            }
            return response
        })
}


const savemicrosoftsitelist = async (siteIds) => {
    return  axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/integration/savesitelist/microsoft`,{siteIds:siteIds})
        .then(res => {
            const { status, data } = res
            if (status) {
                let response = {
                    status: true,
                    data
                }
                return response
            }else{
                let response = {
                    status: false,
                    sites:[]
                }
                return response
            }
        })
        .catch((err) => {
            let response = {
                status: false,
                message: err?.response?.data?.message
            }
            return response
        })
}

//BELOW IS ASYNC
const getSearch = async (payload, page, pageSize, cancelToken) => {
    try {
        if (payload['page']) {
            page = payload['page']
        }
        if (page == 0) { page = 1 }

        const res = await axios.post(
            `${process.env.REACT_APP_BE_URL}/search`,
            { payload, page, pageSize },
            { cancelToken }
        )
        const { status, data, currentPage, perPage, totalCount } = res.data

        if (status) {
            return {
                status: true,
                data,
                currentPage,
                perPage,
                totalCount,
            }
        }
    }
    catch (err) {

        if (err?.['name'] == "CanceledError") {
            return {
                status: false,
                message: err?.message || "Previous Request Cancelled"
            }
        }
        else {
            return {
                status: false,
                message: err?.response?.data?.message || "An Error Occurred - While Calling Search API",
            }
        }
    }
}

const uploadImage = async (file) => {
    let response

    const formData = new FormData();
    formData.append('pic', file);

    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/uploadImage`, formData)
        .then(res => {
            const { status, imageurl } = res.data
            if (status) {
                response = {
                    status: true,
                    imageurl
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const updateRole = async (role, module, action, permission) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/role/updateRole`, { role, module, action, permission })
        .then(res => {
            const { status } = res.data
            if (status) {
                response = {
                    status: true,
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const createRole = async (role, modulePrivileges) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/role/createRole`, { role, modulePrivileges })
        .then(res => {
            const { status } = res.data
            if (status) {
                response = {
                    status: true,
                }
            }
        })
        .catch((err) => {
            alert(`${err?.response?.data?.message}`)
            response = {
                status: false,
            }
        })
    return response
}

const loginActivity = async (id, page, perPage, search = "", user = "", sortOrder) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/loginActivity/${id}?page=${page || 1}&perPage=${perPage || 10}`, { search, user, sortOrder })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const createSection = async (sectionName) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/section/createSection`, { sectionName })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}
const updateworkspace = async (workspace_name, workspace_id, marketingDetails = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workspace/updateworkspace`, { "workspace_id": workspace_id, "name": workspace_name, marketingDetails })
        .then(res => {
            const { status, data } = res.data
            if (status == 200) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}
const getmyworkspaceinfo = async () => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workspace/getworkspaceinfo`, { "email": localStorage.getItem("email") })
        .then(res => {
            const { status, data } = res.data
            if (status == 200) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const activateworkspaceuser = async (token = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workspace/activateworkspaceuser`, { "token": token })
        .then(res => {
            const { status, message } = res.data
            if (status == true) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const resenduseractivaionlink = async (token = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workspace/resenduseractivaionlink`, { "token": token })
        .then(res => {
            const { status, message } = res.data
            if (status == 200) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}
const getAllSections = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/section/getAllSections`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getUserStorage = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/storage`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getSection = async (sectionId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/section/getSection`, { sectionId })
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getUserGroupList = async (page, perPage, search, status, users, sortOrder, exportData = false) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/listusergroups?page=${page}&perPage=${perPage}`, { search, status, users, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Usergroups.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const addUserGroup = async (data) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/addusergroup`, { ...data })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const getUserGroup = async (groupId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/getusergroup/${groupId}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: []
            }
        })
    return response
}

const editUserGroup = async (data) => {
    let response
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/user/editusergroup`, { ...data })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const deleteUserGroup = async (groupId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/user/deleteusergroup/${groupId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}


const createStep = async (stepName) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/section/createStep`, { stepName })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateStep = async (stepId, stepName) => {
    let response
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/section/updateStep`, { stepId, stepName })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getStepsList = async (body, page = 1) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/section/listSteps?page=${page}&perPage=${10}`, body)
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const createWorkflow = async (workflowName, stepsInfo, workflowSteps, workflowDescription) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/createWorkflow`, { workflowName, stepsInfo, workflowSteps, workflowDescription })
        .then(res => {
            const { status, data, type } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getWorkflowHistoryUsingHistoryId = async (workflowHistoryId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowHistoryUsingHistoryId`, { workflowHistoryId })
        .then(res => {
            const { status, message, data } = res.data

            if (status) {
                response = {
                    status: true,
                    data
                }
            }
            else {
                response = {
                    status: false,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getWorkflowHistory = async (fileType, fileId, workflowHistoryId, role, tz) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowHistory`, { fileId, workflowHistoryId, fileType, role, tz })
        .then(res => {
            const { status, message, data } = res.data

            if (status) {
                response = {
                    status: true,
                    data
                }
            }
            else {
                response = {
                    status: false,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getWorkflowComments = async (type, workflowHistoryId, getFullDetails = false, fornow = '') => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/comments/getWorkflowComments`, { type, workflowHistoryId, getFullDetails, fornow })
        .then(res => {
            const { status, message, data } = res.data

            if (status) {
                response = {
                    status: true,
                    data
                }
            }
            else {
                response = {
                    status: false,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const setWorkflowComments = async (fileId, workflowHistoryId, comments, stepId, stepName, type) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/comments/setWorkflowComments`, { fileId, workflowHistoryId, comments, stepId, stepName, type })
        .then(res => {

            const { status, message } = res.data

            if (status) {
                response = {
                    status: true
                }
            }
            else {
                response = {
                    status: false,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getParticularWorkflowDetailsWhichNotPresentinWorkflowCollection = async (documentId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getParticularWorkflowDetailsWhichNotPresentinWorkflowCollection`, { documentId })
        .then(res => {
            const { status, data, message } = res.data
            if (status) {
                response = {
                    status: true,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const deleteWorkflowInFiles = async (togoName, togoId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/deleteWorkflowInFiles`, { togoName, togoId })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const checkFileInWorkflow = async (togoId, togoName) => { // workflow, togoName, togoId, versionNo = null
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/checkFileInWorkflow`, { togoId, togoName })
        .then(res => {
            const { status, data, message, lastRevisionNo } = res.data
            if (status) {
                response = {
                    status: true,
                    data,
                    lastRevisionNo,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getChildLevelsForFolders = async (item) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/getChildLevelsForFolders`, { currentFolder: item })
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getAIMetadata = async (inputItems) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/meta/getAIMetadata`, { inputItems })
        .then(res => {
            const { success, message } = res.data
            if (success) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateWorkflowInFoldersRecursively = async (item, parentData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/updateWorkflowInFoldersRecursively`, { currentFolder: item, DestinationFolder: parentData })
        .then(res => {
            const { status } = res.data
            if (status) {
                response = {
                    status: true
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const updateWorkflowInFiles = async (workflow, togoName, togoId, versionNo = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/updateWorkflowInFiles`, { workflow, togoName, togoId, versionNo })
        .then(res => {
            const { status, data, message } = res.data
            if (status) {
                response = {
                    status: true,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateWorkflow = async (workflowId, workflowName, stepsInfo, workflowSteps, workflowDescription) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/updateWorkflow`, { workflowId, workflowName, stepsInfo, workflowSteps, workflowDescription })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getWorkflowPendingsList = async (page, perPage, search, sortOrder) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowPendingsList?page=${page}&perPage=${perPage}`, { search, sortOrder, tz: localStorage.getItem('timeZone') })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const myStepOnwardsHistory = async (page, perPage, search, sortOrder) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/myStepOnwardsHistory?page=${page}&perPage=${perPage}`, { search, sortOrder, tz: localStorage.getItem('timeZone') })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const OwnerHistory = async (page, perPage, search, sortOrder) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/OwnerHistory?page=${page}&perPage=${perPage}`, { search, sortOrder, tz: localStorage.getItem('timeZone') })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getPlanByWorkspaceId = async (workspaceId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/plan/getPlanByWorkspaceId/${workspaceId}`)
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err['response']['data']['message']
            }

        })
    return response
}


const getWorkflowList = async (page, perPage, search, status, workflow, sortOrder, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowList?page=${page}&perPage=${perPage}`, { search, workflow, status, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Workflow-Templates.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getAllWorkflows = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/workflow/getAllWorkflows`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getWorkflowById = async (workflowId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowById/${workflowId}`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const deleteWorkflow = async (workflowId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/workflow/deleteWorkflow/${workflowId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getAllSteps = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/section/listAllSteps`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const extractErrorMessage = (error) => {
    try {
        if (typeof error === 'string' && error.startsWith('<!DOCTYPE html>')) {
            const regex = /<pre>(.*?)<\/pre>/s;
            const match = regex.exec(error);
            if (match && match[1]) {
                const errorMessage = match[1]
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/<[^>]+>/g, '');

                const specificErrorRegex = /Error: .*/;
                const specificErrorMatch = specificErrorRegex.exec(errorMessage);
                if (specificErrorMatch && specificErrorMatch[0]) {
                    return specificErrorMatch[0].trim();
                }
                return errorMessage.trim();
            }
        }
        return error?.message || "An unknown error occurred.";
    } catch (extractionError) {
        console.error("Error extracting message:", extractionError);
        return "Failed to extract error message.";
    }
};

const getAllFilesAndFoldersListBySectionId = async (sectionId, sortingOrder = 'createdAt', sortingBy = 'desc', userId = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/section/getListBySectionId`, { sectionId, sortingOrder, sortingBy, userId })
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}


const createFolder = async (folderName, sectionId, parentId, defaultMetaData, customMetaData, metadataMode = 'skip') => {
    let response;
    let urlString;
    urlString = `${process.env.REACT_APP_BE_URL}/folder/createFolder?sectionId=${sectionId}&parentId=${parentId}`

    await axios
        .post(urlString, { folderName, defaultMetaData, customMetaData, metadataMode })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const createForm = async (formName, formType, formTemplate, isEditResponseAllowed, sectionId, folderId, defaultMetaData, customMetaData, metadataMode = 'skip') => {
    let response;
    let urlString;
    urlString = `${process.env.REACT_APP_BE_URL}/form/createForm?sectionId=${sectionId}&folderId=${folderId}`

    formType = formType['value']
    formTemplate = formTemplate['value']

    await axios
        .post(urlString, { formName, formType, formTemplate, isEditResponseAllowed, defaultMetaData, customMetaData, metadataMode })
        .then(res => {
            const { status, data, message } = res.data
            if (status) {
                response = {
                    status: true,
                    data,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const createEnquiry = async (workspaceId, details) => {
    let response;
    let urlString;
    urlString = `${process.env.REACT_APP_BE_URL}/plan/createEnquiry/${workspaceId}`

    await axios
        .post(urlString, { ...details })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const getAllFilesAndFoldersListByFolderId = async (folderId, op, sortingOrder = 'createdAt', sortingBy = 'desc', userId = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/getListByFolderId`, { folderId, op, sortingOrder, sortingBy, userId })
        .then(res => {
            const { success, data, sectionId } = res.data
            if (success) {
                response = {
                    status: true,
                    data,
                    sectionId
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getDirectoryPath = async (folderId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/section/getdirectory/${folderId}`,)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const cancelWorkflow = async (id, type) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/cancelWorkflow`, { id, type })
        .then(res => {
            const { success, message } = res.data
            if (success) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getAllUserGroups = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/getallusergroups`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}
const uploadFolder = async (folders, sectionId, folderId, defaultMetaData, customMetaData, metadataMode = 'skip', metaOperation = false) => {
    let response

    const formData = new FormData();
    let paths = []

    for (let folder of folders) {
        paths.push(folder.webkitRelativePath)
        formData.append('folder', folder)
    }

    formData.append('paths', JSON.stringify(paths))
    formData.append('sectionId', JSON.stringify(sectionId))
    formData.append('folderId', JSON.stringify(folderId))

    formData.append('defaultMetaData', JSON.stringify(defaultMetaData));
    formData.append('customMetaData', JSON.stringify(customMetaData));
    formData.append('metadataMode', metadataMode.toString());
    formData.append('metaOperation', metaOperation.toString());


    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/uploadFolder`, formData)
        .then(res => {
            const { status, fileInfos } = res.data
            if (status) {
                response = {
                    status: true,
                    fileInfos
                }
            }
        })
        .catch((err) => {
            const errorMessage = extractErrorMessage(err?.response?.data || err?.message);
            console.log(errorMessage, "error");

            response = {
                status: false,
                message: errorMessage
            }
        })
    return response
}

const updateStarred = async (id, type, click) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/starred`, { id, type, click })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const shareDocument = async (documentId, docType, users, userGroups, sectionId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/shareDocument`, { documentId, docType, users, userGroups, sectionId })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const getStarredList = async (page = 1, sortingOrder = 'createdAt', sortingBy = 'desc') => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getStarredList?page=${page}&perPage=${15}&sortingOrder=${sortingOrder}&sortingBy=${sortingBy}`)
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getSharedDocuments = async (sortingOrder = 'createdAt', sortingBy = 'desc') => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_BE_URL}/getshared?sortingOrder=${sortingOrder}&sortingBy=${sortingBy}`);
        const { status, data } = res.data;

        return {
            status: true,
            data
        };
    } catch (err) {
        const { message } = err.response?.data || { message: 'An error occurred' };
        return {
            status: false,
            message
        };
    }
};

const downloadedFile = async (fileId, filename, contentType, extension) => {
    await axios({
        url: `${process.env.REACT_APP_BE_URL}/file/readFile`,
        method: "POST",
        data: { fileId },
        responseType: "blob",
    })
        .then((response) => {

            if (response.data) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                filename = filename + "." + extension;
                link.setAttribute("download", `${filename}`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        })
        .catch((er) => {
            // ErrorToast(er.response.data.message);
        });

}

const getNextFolderList = async (level, folderId, sectionId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/getChildList`, { level, folderId, sectionId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const createCustomMetaData = async (name, desc, type, options) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/createCustomMetaData`, { name, desc, type, options })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const updateCustomMetaData = async (id, name, desc, type = null, options = []) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updateCustomMetaData`, { id, name, desc, type, options })
        .then(res => {
            const { status } = res.data
            if (status) {
                response = {
                    status: true,
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getCustomMetaDataList = async (page, perPage, search, sortOrder, type, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/getCustomMetaDataList?page=${page}&perPage=${perPage}`, { search, sortOrder, type, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Custom-Metadata.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getApprovalMetaDataList = async (page, perPage, search, sortOrder, type, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/meta/getApprovalMetaDataList?page=${page}&perPage=${perPage}`, { search, sortOrder, type, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Custom-Metadata.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const approveMetaData = async (selectedRowsData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/meta/approveMetaData`, {
            metaDataIds: selectedRowsData
        })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const rejectMetaData = async (selectedRowsData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/meta/rejectMetaData`, {
            metaDataIds: selectedRowsData
        })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const getDocumentTypeList = async (op, page, perPage, search, sortOrder, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/getDocumentTypeList?page=${page}&perPage=${perPage}`, { op, search, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Document-Types.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getWorkflowVersionsList = async (page, perPage, search, fileType, fileId, tz) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowVersionsList?page=${page}&perPage=${perPage}`, { search, fileType, fileId, tz })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getNotify = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/workflow/getNotify`)
        .then(res => {
            const { success, data, ...rest } = res.data
            if (success) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const markAllAsRead = async () => {
    let response
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/workflow/markAllAsRead`)
        .then(res => {
            const { success, data, ...rest } = res.data
            if (success) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const markParticularMsgToRead = async (id) => {
    let response
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/workflow/markParticularMsgToRead`, { id })
        .then(res => {
            const { success, data, ...rest } = res.data
            if (success) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getFormBuilderList = async (page, perPage, search, sortOrder, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/getFormBuilderList?page=${page}&perPage=${perPage}`, { search, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Form-Templates.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getKeywordsList = async (page, perPage, search, sortOrder, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/getKeywordsList?page=${page}&perPage=${perPage}`, { search, sortOrder, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Keywords.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getAIResult = async (searchTerm, search_summary) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/AIsearch`, { searchTerm, search_summary })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            console.log(err, "err")
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const getAllCustomMetaDataList = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getAllCustomMetaDataList`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getReferencesOnCustomMetaData = async (id) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getReferencesOnCustomMetaData/${id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: null
            }
        })
    return response
}

const getReferencesOnDocumentType = async (op, id) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getReferencesOnDocumentType/${id}/${op}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: null
            }
        })
    return response
}


const getReferencesOnKeyword = async (id) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getReferencesOnKeyword/${id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                data: null
            }
        })
    return response
}

const deleteCustomMetaData = async (id, reference) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/deleteCustomMetaData/${id}/${reference}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const deleteDocumentType = async (op, id, reference) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/deleteDocumentType/${id}/${reference}/${op}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const deleteKeyword = async (id, reference) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/deleteKeyword/${id}/${reference}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}


const getAllMetApproverList = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/meta/getAllMetApproverList`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getMetaApprovalQueueCnt = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/meta/getMetaApprovalQueueCnt`)
        .then(res => {
            const { status, count } = res.data
            if (status) {
                response = {
                    status: true,
                    count
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getAllDocumentType = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getAllDocumentType`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getAllKeywords = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getAllKeywords`)
        .then(res => {
            const { success, data } = res.data
            if (success) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const createDocumentType = async (op, name) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/createDocumentType`, { op, name })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateDocumentType = async (op, id, name) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updateDocumentType`, { op, id, name })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const createKeywords = async (name) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/createKeywords`, { name })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateKeyword = async (id, name) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updateKeyword`, { id, name })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const getNextFolderListMove = async (level, folderId, sectionId, userId = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/getChildListMove`, { level, folderId, sectionId, userId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const getMyHierarchy = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/folder/getMyHierarchy`)
        .then(res => {
            const { status, message, data, allIDs } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data,
                    allIDs
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const getAllFolders = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getAllFolders`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const fileMove = async (docId, newParentId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/file/movefile`, { docId, newParentId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const folderMove = async (docId, newParentId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/folder/movefolder`, { docId, newParentId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const updateMetaDetails = async (id, type, defaultMetaData, customMetaData) => {
    let response
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/updateMetaDetails`, { id, type, defaultMetaData, customMetaData })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const filesCopy = async (fileIds, newParentId, shortcutFiles, makeACopy = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/file/copyFiles`, { fileIds, newParentId, shortcutFiles, makeACopy })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const rename = async (docId, name, folder = false) => {
    let response;
    let urlString;
    if (!folder) {
        urlString = `folder/renamefolder`;
    } else {
        urlString = `file/renamefile`;
    }
    console.log(urlString, 'urlString')
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/${urlString}`, { docId, name })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const docsMove = async (files, folders, forms, shortcutFiles, shortcutFolders, shortcutForms, newParentId, permission) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/movedocuments`, { files, folders, forms, shortcutFiles, shortcutFolders, shortcutForms, newParentId, permission })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const multiShareDocument = async (files, folders, forms = [], users, userGroups, externalusers = []) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/sharedocuments`, { files, folders, forms, users, userGroups, externalusers })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const multiDeleteDocument = async (files, folders, forms, shortcuts) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/deletedocuments`, { files, folders, forms, shortcuts })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const restoreDocuments = async (files, folders, forms, sections) => {
    debugger
    let response
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/restoredocuments`, { files, folders, forms, sections })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const getActivityLog = async (docId, search, page, perPage, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/activitylogs?page=${page}&perPage=${perPage}`, { docId, search, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Activities.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, message, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        message,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const getRevisionLog = async (docId, search, page, perPage, exportData) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/revisionhistorylogs?page=${page}&perPage=${perPage}`, { docId, search, exportData })
        .then(res => {
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Revisions.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, message, data } = res.data
                if (status) {
                    response = {
                        status: true,
                        message,
                        data
                    }
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const deletePermenantly = async (files, folders, forms, sections) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/permanentdelete`, { files, folders, forms, sections })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const changeVersion = async (form) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/file/changeversion`, form)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const revertVersion = async (body) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/file/filerevision`, body)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const getRecentDocuments = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/recentfiles`)
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const bulkDocsDownload = async (files, folders) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/documentzipdownload`, { files, folders }, {
            responseType: 'arraybuffer'
        })
        .then(response => {
            if (response.data) {
                const url = window.URL.createObjectURL(new Blob([response.data, { type: 'application/zip' }]));
                const link = document.createElement("a");
                link.href = url;
                const zipName = response.headers['content-disposition'].split('=')[1]
                link.setAttribute("download", zipName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

















const getSharedWithMembers = async (docId, type) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/sharedmembers`, { docId, type })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const updateSharedWithMembers = async (docId, type, grouptype, memberId, action, access) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updateshareaccess`, { docId, type, grouptype, memberId, action, access })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const formsCopy = async (formIds, newParentId, shortcutForms, makeACopy = null) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/copyforms`, { formIds, newParentId, makeACopy, shortcutForms })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const renameForm = async (docId, name) => {
    let response;
    let urlString;

    console.log(urlString, 'urlString')
    await axios
        .patch(`${process.env.REACT_APP_BE_URL}/form/renameforms`, { docId, name })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const checkSectionChildren = async (sectionId) => {
    let response;
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/section/checksectionchildren/${sectionId}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const sectionDelete = async (sectionId) => {
    let response;
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/section/deletesection/${sectionId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const sectionRename = async (sectionId, name) => {
    let response;
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/section/rename/${sectionId}`, { name })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const changeStatus = async (historyId, role, fileId, status, type) => {
    let response;
    await axios
        .put(`${process.env.REACT_APP_BE_URL}/workflow/changeStatus`, { historyId, role, fileId, status, type })
        .then(res => {
            const { success, message, isCurrStepCompleted, isLastStepCompleted } = res.data
            if (success) {
                response = {
                    status: true,
                    message,
                    isCurrStepCompleted,
                    isLastStepCompleted
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getWorkflowActivities = async (historyId, type) => {
    let tz = localStorage.getItem('timeZone')
    let response;
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/getWorkflowActivities`, { historyId, tz, type })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const restoreWorkflow = async (fileId, hisId, item) => {
    let response;
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/restoreWorkflow`, { fileId, hisId, item })
        .then(res => {
            const { success, message } = res.data
            if (success) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const EmptyTrash = async () => {
    let response;
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/emptytrash`,)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const deleteresponse = async (responseId, formId, userId) => {
    let response;
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/deleteresponse`, { responseId, formId, userId })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const readFile = async (fileId) => {
    let response;
    await axios({
        url: `${process.env.REACT_APP_BE_URL}/file/readFile`,
        method: "POST",
        data: { fileId },
        responseType: "arraybuffer",
    })
        .then((respo) => {

            if (respo.data) {
                const decoder = new TextDecoder('utf-8');
                const content = decoder.decode(new Uint8Array(respo.data));
                response = {
                    status: true,
                    content
                }
            }


        })
        .catch((er) => {
            response = {
                status: false,
                message: er
            }
        });
    return response;
}

const readBackupFile = async (fileId) => {
    let response;
    await axios({
        url: `${process.env.REACT_APP_BE_URL}/file/readFile`,
        method: "post",
        data: { fileId },
        responseType: "blob",
    })
        .then((respo) => {

            const { data } = respo;
            // debugger
            if (data) {

                console.log("cadasd", data)
                let fileName = fileId.split('#')[5]

                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement("a");
                link.href = url;
                const filename = `${fileName}`;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        })
        .catch((er) => {
            response = {
                status: false,
                message: er
            }
        });
    return response;
}


const getSharedWithDirectoryPath = async (folderId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/folder/sharedwithdirectory/${folderId}`,)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getFormResponseHistory = async (formId, submissionId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/formresponsehistory`, { formId, submissionId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getexternaluserinfo = async (objectId, token, workspace_id) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/getexternaluserinfo/${workspace_id}`, { "objectId": objectId, "token": token })
        .then(res => {
            const { status, data, filepermission } = res.data
            if (status) {
                response = {
                    status: true,
                    data,
                    filepermission
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getAllGroupsContainingUser = async () => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/user/getcurrentusergroups`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}


const updatePassword = async (email, currentPassword, password) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/auth/changePassword`, { email, currentPassword, password })
        .then(res => {
            const { status, userId, authToken, userName, email, role, privileges, timeZone, user, message } = res.data
            if (status) {
                response = {
                    status: true,
                    userId, authToken, userName, email, role, privileges, timeZone, user
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })

    return response
}

const deleteRole = async (roleId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/role/deleteRole/${roleId}`,)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getUsersWithRole = async (roleId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/role/getAllUsersWithRole/${roleId}`,)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const getSharedWithDirectoryDetailsPath = async (folderId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/folder/sharedwithdirectorydetails/${folderId}`,)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.response?.data?.message
            }
        })
    return response
}

const getRestoreDetails = async (id) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/getRestoreDetails/${id}`)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}

const getMyFolderStructure = async (userId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/foldertree`, { userId })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const restoreShareAccessForGroupUser = async (files, folders, forms, user) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/restoreignoredusersfromgroup`, { files, folders, forms, user })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const deleteStep = async (stepId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/section/deletestep/${stepId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err.message
            }
        })
    return response
}

const getUsersDataFromArray = async (userIds) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/user/getuserdetails`, { userIds })
        .then(res => {
            const { status, data, ...rest } = res.data
            if (status) {
                response = {
                    status: true,
                    data, ...rest
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const updateSectionOwnership = async (newOwner, sectionId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updatesectionownership`, { newOwner, sectionId })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const updateFolderOwnership = async (selectedFolder, newParentId, newOwner) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/updatefolderownership`, { selectedFolder, newParentId, newOwner })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const createShortcut = async (files, folders, forms, destination) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/createshortcut`, { files, folders, forms, destination })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const copyShortcut = async (files, folders, forms, destination) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/copyshortcut`, { files, folders, forms, destination })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const moveShortcut = async (files, folders, forms, destination) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/moveshortcut`, { files, folders, forms, destination })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const renameShortcut = async (shortcutId, newname) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/renameshortcut`, { shortcutId, newname })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}

const deleteShortcut = async (shortcutId) => {
    let response
    await axios
        .delete(`${process.env.REACT_APP_BE_URL}/deleteshortcut/${shortcutId}`)
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}
const checkredirectURL = async () => {
    if (localStorage.getItem("accessToken") && localStorage.getItem("workspace_id")) {
        let haslinks = window.location.hash.split("/");
        let workspace_id = (haslinks.length > 1 && haslinks[0] == "#") ? haslinks[1] : "";
        if (workspace_id != "" && localStorage.getItem("workspace_id") != workspace_id) {
            let workspaceResponse = await getmyworkspaceinfo()
            let { status, data } = workspaceResponse;
            if (status) {
                let isvalidurl = false;
                let workspaceinfo = {};
                for (let work of data) {
                    if (work._id == workspace_id) {
                        isvalidurl = true;
                        workspaceinfo = work.userinfo;
                        break;
                    }
                }
                if (isvalidurl == true) {
                    setloginstoragechanges(workspaceinfo);
                } else {
                    window.location.replace(`/#/${localStorage.getItem("workspace_id")}/home`); // Redirect to 404 or landing
                }
            }
        } else if ((window.location.hash === "" || window.location.hash === "/" || window.location.hash === "/#" || window.location.hash === "/#/")) {
            window.location.replace(`/#/${localStorage.getItem("workspace_id")}/home`); // Redirect to 404 or landing
        }
    }
}


const restoreShareAccessForMember = async (files, folders, forms, user) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/restoreignoredusersfromshared`, { files, folders, forms, user })
        .then(res => {
            const { status, message } = res.data
            if (status) {
                response = {
                    status: true,
                    message
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const cloneWorkflow = async (workflowName, workflowId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/workflow/cloneWorkflow`, { workflowName, workflowId })
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}








































const getOutdatedDocuments = async (workflowId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/workflow/outdateddocuments/${workflowId}`,)
        .then(res => {
            const { status, data } = res.data
            if (status) {
                response = {
                    status: true,
                    data
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
                message: err?.response?.data?.message
            }
        })
    return response
}


const cloneFormBuilder = async (id, clonnedName) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/cloneForm`, { id, clonnedName })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const getListOfOutdatedForms = async (templateId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/outdatedForms/${templateId}`)
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

















































const generateFormSubmissionsExcel = async (formId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/submissionsexcel/${localStorage.getItem('workspace_id')}`, { formId })
        .then(res => {
            debugger
            if (res.headers?.['content-type']?.includes('officedocument')) {
                const buff = Buffer.from(res.data.blob, "base64");
                let blobdata = new Blob([buff], { type: res.headers["content-type"] });
                var fileName = "Submissions.xlsx"
                saveAs(blobdata, fileName);
            } else {
                const { status, data, ...rest } = res.data
                if (status) {
                    response = {
                        status: true,
                        data, ...rest
                    }
                }
            }
        })
        .catch((err) => {
            response = {
                status: false,
            }
        })
    return response
}


const getFormReports = async (formId) => {
    let response
    await axios
        .get(`${process.env.REACT_APP_BE_URL}/form/reports/${formId}/${localStorage.getItem('workspace_id')}`)
        .then(res => {
            const { status, message, data, exists, formResponses, dataTypes } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data,
                    exists,
                    formResponses,
                    dataTypes
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const savePivotReports = async (pivotTableData, formId, stepId = null, stepName) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/savepivotreport`, { pivotTableData, formId, stepId, stepName })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const addPivotReportStep = async (stepId, stepName, formId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/addpivotreportstep`, { stepId, stepName, formId })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

const editPivotReportStep = async (stepId, formId, action, stepName = '') => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/editpivotreportstep`, { stepId, formId, action, stepName })
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}


const getTabReport = async (formId, stepId) => {
    let response
    await axios
        .post(`${process.env.REACT_APP_BE_URL}/form/tabreport/${localStorage.getItem('workspace_id')}`,{formId, stepId})
        .then(res => {
            const { status, message, data } = res.data
            if (status) {
                response = {
                    status: true,
                    message,
                    data,
                }
            }
        })
        .catch((err) => {
            const { message } = err.response.data
            response = {
                status: false,
                message
            }
        })
    return response
}

export {
    checkredirectURL,
    getSearch,
    getAIResult,

    login,
    forgotPassword,
    resetPassword,
    createPassword,
    ssoLogin,

    getAllRoles,
    getUsersWithRole,
    updateRole,
    createRole,
    deleteRole,
    loginActivity,
    uploadImage,

    addUser,
    getUser,
    getUsersList,
    getAllUsers,
    updateUser,
    searchUsers,
    deleteUser,

    createSection,
    getSection,
    getAllSections,

    getUserGroupList,
    addUserGroup,
    getUserGroup,
    editUserGroup,
    deleteUserGroup,
    createStep,
    updateStep,
    getStepsList,
    getAllSteps,

    createWorkflow,
    checkFileInWorkflow,
    updateWorkflowInFiles,
    updateWorkflowInFoldersRecursively,
    deleteWorkflowInFiles,
    getParticularWorkflowDetailsWhichNotPresentinWorkflowCollection,
    updateWorkflow,
    getWorkflowList,
    getWorkflowPendingsList,
    getAllWorkflows,
    getWorkflowById,
    deleteWorkflow,
    getexternaluserinfo,
    // uploadFile,
    getAllFilesAndFoldersListBySectionId,
    fileMove,
    createFolder,
    getAllFilesAndFoldersListByFolderId,
    folderMove,
    getDirectoryPath,
    cancelWorkflow,

    getAllUserGroups,
    uploadFolder,


    updateStarred,

    shareDocument,
    getSharedDocuments,
    getStarredList,


    downloadedFile,
    getNextFolderList,

    //FORM BUILDER
    updateFormBuilder,
    saveFormBuilder,
    getFormBuilderList,
    getFormBuilder,
    getAllFormBuilder,
    deleteFormBuilder,

    //FORM
    createForm,
    getForm,
    saveFormResponse,
    formValidity,
    getSubmission,
    getSubmissionDatas,


    //CUSTOM META DATA
    createCustomMetaData,
    getCustomMetaDataList,
    getAllCustomMetaDataList,
    updateCustomMetaData,
    getReferencesOnCustomMetaData,
    deleteCustomMetaData,

    //DOCUMENT TYPE
    createDocumentType,
    getAllDocumentType,
    updateDocumentType,
    getReferencesOnDocumentType,
    deleteDocumentType,
    getDocumentTypeList,

    //KEYWORDS
    getKeywordsList,
    createKeywords,
    getAllKeywords,
    updateKeyword,
    getReferencesOnKeyword,
    deleteKeyword,
    getNextFolderListMove,
    getDetails,
    getOnlyOfficeDetails,
    updateMetaDetails,
    filesCopy,
    rename,
    docsMove,
    multiShareDocument,
    multiDeleteDocument,
    restoreDocuments,
    getActivityLog,
    getRevisionLog,
    deletePermenantly,
    changeVersion,
    revertVersion,
    getRecentDocuments,
    bulkDocsDownload,
    formsCopy,
    getSharedWithMembers,
    updateSharedWithMembers,
    renameForm,
    checkSectionChildren,
    getAllFolders,
    getMyHierarchy,
    sectionDelete,
    sectionRename,
    changeStatus,
    EmptyTrash,
    restoreWorkflow,
    deleteresponse,
    readFile,
    readBackupFile,
    getSharedWithDirectoryPath,
    getWorkflowHistory,
    getWorkflowHistoryUsingHistoryId,
    getChildLevelsForFolders,
    getFormResponseHistory,
    setWorkflowComments,
    getWorkflowComments,
    getWorkflowVersionsList,
    getWorkflowActivities,
    getAllGroupsContainingUser,
    getApprovalMetaDataList,
    updatePassword,
    getUserStorage,
    restoreUser,
    getNotify,
    markParticularMsgToRead,
    markAllAsRead,
    myStepOnwardsHistory,
    OwnerHistory,
    getSharedWithDirectoryDetailsPath,
    getRestoreDetails,
    getMyFolderStructure,
    restoreShareAccessForGroupUser,
    deleteStep,
    getUsersDataFromArray,
    checkLinkValidity,
    updateSectionOwnership,
    updateFolderOwnership,
    checkEmailIdExists,
    registernewuser,
    getmyworkspaceinfo,
    resenduseractivaionlink,
    activateworkspaceuser,
    updateworkspace,
    approveMetaData,
    rejectMetaData,
    getAIMetadata,
    getPlanByWorkspaceId,
    createEnquiry,
    getMetaApprovalQueueCnt,
    getAllMetApproverList,
    setloginstoragechanges,
    handleSSO,
    createShortcut,
    renameShortcut,
    copyShortcut,
    moveShortcut,
    deleteShortcut,
    restoreShareAccessForMember,
    cloneWorkflow,
    getOutdatedDocuments,
    cloneFormBuilder,
    getListOfOutdatedForms,
    generateFormSubmissionsExcel,
    getFormReports,
    savePivotReports,
    addPivotReportStep,
    editPivotReportStep,
    getTabReport,
    verifymicrosofttoken,
    getsitelist,
    savemicrosoftsitelist,
    removeonedriveaccess,
    syncNow
}