import React, { useState, useEffect, useRef } from "react"
import * as API from "../../../../utils/API"
import toast from "react-hot-toast"
import { getOnlyOfficeDocumentType } from "../../../../utils/helper"

let lastDocType = null, lastKey = null

export default function FileRender({ fileId, setLoading, containerRef, editorRef }) {
    const [fileData, setFileData] = useState(null)
    const BACKEND_URL = `${process.env.REACT_APP_BE_URL}`
    const workspaceId = localStorage.getItem("workspace_id")
    const user = JSON.parse(localStorage.getItem("user"))

    // const lastDocType = useRef(null)
    // const lastKey = useRef(null)

    // const [lastDocType, setLastDocType] = useState(null)
    // const [lastKey, setLastKey] = useState(null)


    useEffect(() => {
        getFileDetails()
        return () => {
            // setLoading(false)
            // destroyEditor()
        }
    }, [fileId])


    const destroyEditor = () => {
        if (editorRef.current) {
            try {
                editorRef.current.destroyEditor()
                editorRef.current = null
                if (containerRef.current) containerRef.current.innerHTML = ""
            } catch (err) {
                console.error("Error destroying editor", err)
            }
        }
    }

    const createEditor = (config) => {
        if (editorRef.current) {
            editorRef.current.destroyEditor?.()
        }

        if (containerRef.current) {
            containerRef.current.innerHTML = ""
        }

        if (window.DocsAPI) {
            editorRef.current = new DocsAPI.DocEditor("onlyoffice-editor", config)
        } else {
            console.error("DocsAPI is not available.")
        }

    }

    const updateDocument = (config) => {
        if (editorRef.current) {
            if (editorRef.current.openDocument) {
                // debugger
                editorRef.current.openDocument({
                    fileType: config.document.fileType,
                    key: config.document.key,
                    title: config.document.title,
                    url: config.document.url,
                })
            } else {
                console.error("openDocument is undefined.")
            }
        } else {
            console.error("Editor is not initialized.")
        }
    }

    const getFileDetails = async () => {
        try {
            setLoading(true)
            if (!fileId) {
                toast.error("File ID is not available")
                setLoading(false)
                return
            }
            if (!workspaceId) {
                toast.error("WorkspaceId is not available")
                setLoading(false)
                return
            }
            const fileResponse = await API.getOnlyOfficeDetails(fileId, workspaceId)
            if (!fileResponse?.status) {
                toast.error(fileResponse?.message || "Can't fetch editor file details")
                return
            }

            const { data, version } = fileResponse?.data
            const docType = await getOnlyOfficeDocumentType(data?.fileType?.toLowerCase()) || 'word'

            const key = `${data._id}_${version}`
            const url = `${BACKEND_URL}/file/documentreader/${data._id}/${workspaceId}`

            const sameType = docType == lastDocType
            const sameKey = key == lastKey

            const config = {
                document: {
                    fileType: data?.fileType,
                    key: `${data?._id}_${version}`,
                    title: data?.name,
                    url,
                    permissions: {
                        edit: false,
                        download: true,
                        print: true,
                        comment: false,
                        fillForms: false,
                        review: false,
                    },
                },
                documentType: docType,
                editorConfig: {
                    callbackUrl: `${BACKEND_URL}/file/onlyofficecallback/${workspaceId}`,
                    mode: "view",
                    zoom: "page-width",
                    // plugins: {
                    //     autostart: ["load-doc-plugin"],
                    // },
                    customization: {
                        logo: {
                            image: "https://ikomet.idoks.ai/static/media/logo2x.4c5ecef1ef62c40807a5.png",
                            imageDark: "https://ikomet.idoks.ai/static/media/logo2x.4c5ecef1ef62c40807a5.png",
                            visible: true,
                        },
                        uiTheme: "theme-classic-light",
                        customer: {
                            logo: "https://api.onlyoffice.com/content/img/docbuilder/examples/blue_cloud.png",
                            logoDark: "https://api.onlyoffice.com/content/img/docbuilder/examples/user-profile.png",
                            mail: user?.email,
                            name: user?.userName,
                        },
                        user: {
                            group: "iDoks",
                            id: user?._id || "Guest",
                            image: user?.imgUrl || "https://ikomet.idoks.ai/static/media/logo2x.4c5ecef1ef62c40807a5.png",
                            name: user?.userName?.trim() || "iDoks"
                        },
                        lang: "en",
                        location: "us",
                    },
                }
            }

            // console.log("Same", docType, key, " - ", lastDocType, lastKey)
            // console.log(sameType, !sameKey, editorRef.current?.openDocument, editorRef.current, "answer")

            // if (sameType && !sameKey && editorRef.current?.openDocument) {
            // console.log("Updating document")
            // updateDocument(config)
            // lastKey = key
            // setFileData(data)
            // setLoading(false)
            // return
            // }

            // console.log("Reinitializing editor")
            // lastDocType = docType
            // lastKey = key
            setFileData(data)
            createEditor(config)
            setLoading(false)

        } catch (error) {
            // debugger
            console.error("Error fetching file details", error)
            toast.error("An error occurred while fetching file details")
        }
    }


    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div id="onlyoffice-editor" ref={containerRef} style={{ height: "100%", width: "100%" }} />
        </div>
    )
}
