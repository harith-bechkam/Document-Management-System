import React, { useState, useEffect } from "react"
import { Modal, ModalBody, Button, Progress, Input, Spinner } from "reactstrap"
import iDoks from "../../../../images/iDoks.png"
import { useSelector } from "react-redux"
import { Icon } from "../../../../components/Component"
import * as API from '../../../../utils/API'
import { setmyworkspaceinfo } from "../../../../redux/folderSlice"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"

const steps = [
    {
        title: "What would you like to use iDoks for?",
        isMultiSelect: false,
        tileOptions: ["Work", "Personal", "School"]
    },
    {
        title: "What would you like to manage?",
        isMultiSelect: false,
        tileOptions: ["Personal Use", "Sales & CRM", "IT", "Software Developement", "PMO", "Professional Services", "Other"]
    },
    {
        title: "How did you hear about us?",
        isMultiSelect: false,
        tileOptions: ["Search Engine (Google,Bing etc.)", "Software Review Sites", "Facebook/Instagram", "Other"]
    },
    {
        title: "Which feature are you interested in trying?",
        isMultiSelect: true,
        tileOptions: ["AI Search", "Workflow", "Form", "Storage"]
    },
    {
        title: "Lastly, What would you like to name your Workspace?",
        isMultiSelect: false,
        tileOptions: [],

    }
]


const stepMessages = [
    "",
    "Don't worry, you can always add more in the future",
    "",
    "Don't worry, you'll have access to all of these features in your Workspace",
    "By completing this form, you agree to our Terms of Service and Privacy Policy"
]


const WorkspaceFill = ({ toggle }) => {
    const [stepIndex, setStepIndex] = useState(0)
    const store = useSelector(state => state.folders)
    const [myWorkspaceData, setMyWorkspaceData] = useState(null)
    const [selectedTiles, setSelectedTiles] = useState({})
    const [otherInput, setOtherInput] = useState({})
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()



    useEffect(() => {
        if (store.myworkspace.length > 0) {
            const workspace = store.myworkspace.find(item => item._id == localStorage.getItem("workspace_id"))
            if (workspace) {
                setMyWorkspaceData(workspace)
            }
        }
    }, [store.myworkspace])




    const handleTileClick = (option) => {
        setSelectedTiles(prev => {
            const isMultiSelect = steps[stepIndex].isMultiSelect

            if (isMultiSelect) {
                const updatedSelections = new Set(prev[stepIndex] || [])
                if (updatedSelections.has(option)) {
                    updatedSelections.delete(option)
                    if (option == "Other") setOtherInput(prev => ({ ...prev, [stepIndex]: "" }))
                } else {
                    updatedSelections.add(option)
                }
                return { ...prev, [stepIndex]: Array.from(updatedSelections) }
            } else {
                return prev[stepIndex]?.[0] == option ? { ...prev, [stepIndex]: [] } : { ...prev, [stepIndex]: [option] }
            }
        })
    }


    const handleOtherInputChange = (e) => {
        setOtherInput(prev => ({ ...prev, [stepIndex]: e.target.value }))
    }

    const formatSelectedTiles = async () => {
        const result = {}

        steps.forEach((step, index) => {
            const selected = selectedTiles[index]

            if (selected && selected.length > 0) {
                if (step.isMultiSelect) {
                    result[step.title] = selected
                } else {
                    if (selected[0] == "Other") {
                        result[step.title] = { key: "Other", value: otherInput[index] || "" }
                    } else {
                        result[step.title] = selected[0]
                    }
                }
            }
        })

        if (!result?.['Lastly, What would you like to name your Workspace?']) {
            result['Lastly, What would you like to name your Workspace?'] = myWorkspaceData?.name || "";
        }

        return result
    }


    const handleSubmit = async () => {
        try {
            const formattedData = await formatSelectedTiles()

            var name = formattedData?.['Lastly, What would you like to name your Workspace?']

            setLoading(true);
            let response = await API.updateworkspace(name, myWorkspaceData?.['_id'], formattedData)
            let { status, data } = response;
            if (response?.status) {
                toast.success("Workspace Updated successfully");
                let workspaceResponse = await API.getmyworkspaceinfo();
                let { status, data, message } = workspaceResponse

                if (status) {
                    dispatch(setmyworkspaceinfo({ data }))
                    for (let work of data) {
                        if (work._id == localStorage.getItem("workspace_id")) {

                            const planDetails = work?.planDetails
                            var aisummary = false
                            if (planDetails?.isActivePlan) {
                                aisummary = planDetails?.grantedFeatures?.hasOwnProperty('AISummary') && planDetails?.grantedFeatures?.AISummary == "yes"
                            }

                            let appFeatures = { aisummary }

                            if (work.owner == work.userinfo.userId && work.owner == localStorage.getItem('userId')) {
                                appFeatures['ismarketDetailsCompleted'] = work.ismarketDetailsCompleted
                            }

                            localStorage.setItem("appFeatures", JSON.stringify(appFeatures))
                            window.dispatchEvent(new Event("storage"));
                        }
                    }

                }
                setLoading(false);
            } else {
                toast.error("Serve Error, Please try again later")
                setLoading(false)
            }

        }
        catch (error) {
            console.error("Error submitting workspace", error);
            toast.error("Error submitting workspace")
            setLoading(false)
        }
    };

    const nextStep = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(stepIndex + 1)
        } else {
            handleSubmit()
        }
    }

    const prevStep = () => {
        if (stepIndex > 0) setStepIndex(stepIndex - 1)
    }

    return (
        <Modal isOpen={true} size="lg" backdrop="static" toggle={toggle}>
            <ModalBody>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <img src={iDoks} alt="iDoks" style={{ width: "5rem" }} />
                    <span className="fs-6">
                        {/* <b> */}
                        Welcome, {myWorkspaceData?.userinfo?.user?.userName}
                        {/* </b> */}
                    </span>
                </div>

                <div className="workspace-fill-body text-center">
                    <h4 className="mb-3">{steps[stepIndex].title}</h4>

                    {stepIndex == steps.length - 1 ? (
                        <Input
                            type="text"
                            placeholder="Workspace Name"
                            value={selectedTiles[stepIndex]?.[0] ?? myWorkspaceData?.name ?? ""}
                            onChange={(e) =>
                                setSelectedTiles(prev => ({
                                    ...prev,
                                    [stepIndex]: [e.target.value]
                                }))
                            }
                            className="mt-3 w-50 mx-auto text-center"
                        />


                    ) :
                        (
                            <>
                                <div className="d-flex flex-wrap justify-content-center gap3 my-5">
                                    {steps[stepIndex].tileOptions.map((option, index) => {
                                        const isSelected = selectedTiles[stepIndex]?.includes(option)

                                        return (
                                            <button
                                                key={index}
                                                className={`btn px-4 py-2 rounded-pill shadow-sm transition d-flex align-items-center justify-content-center`}
                                                style={{
                                                    fontSize: "0.95rem",
                                                    fontWeight: "500",
                                                    border: "1px solid #4B6382",
                                                    background: isSelected ? "#4B6382" : "#fff",
                                                    color: isSelected ? "#fff" : "#000",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onClick={() => handleTileClick(option)}
                                            >
                                                {steps[stepIndex].isMultiSelect && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        className="me-2"
                                                        readOnly
                                                    />
                                                )}
                                                {option}
                                            </button>
                                        )
                                    })}

                                </div>
                                {selectedTiles[stepIndex]?.includes("Other") && (
                                    <Input
                                        type="text"
                                        placeholder="Please specify..."
                                        value={otherInput[stepIndex] || ""}
                                        onChange={handleOtherInputChange}
                                        className="mt-2 w-50 mx-auto text-center"
                                    />
                                )}
                            </>
                        )}
                </div>

                <div className="mt-5">
                    <p className="text-muted text-center" >
                        {stepMessages[stepIndex]}
                    </p>
                    <Progress
                        className="progress-sm progress-bar-animated"
                        value={((stepIndex + 1) / steps.length) * 100}
                        style={{ height: "6px" }}
                    />
                </div>

                <div className="d-flex justify-content-between mt-4">
                    <Button color="primary" onClick={prevStep} disabled={stepIndex == 0}>
                        {/* <Icon name="back-ios" className={"me-2"} /> */}
                        Back
                    </Button>
                    <Button
                        color="primary"
                        onClick={nextStep}
                        disabled={
                            (stepIndex != steps.length - 1 && (
                                !selectedTiles[stepIndex] ||
                                selectedTiles[stepIndex].length == 0 ||
                                (selectedTiles[stepIndex]?.includes("Other") && !otherInput[stepIndex]?.trim())
                            )) || (stepIndex == steps.length - 1 && !myWorkspaceData?.name?.trim())
                        }
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" color="light" className="me-2" />
                                Finish
                            </>
                        ) : (
                            stepIndex == steps.length - 1 ? "Finish" : "Next"
                        )}
                    </Button>

                </div>
            </ModalBody>
        </Modal>
    )
}

export default WorkspaceFill
