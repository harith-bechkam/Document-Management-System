import React, { useEffect, useState } from 'react';
import { Icon } from '../../../../components/Component';
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Card } from 'reactstrap';
import * as API from '../../../../utils/API';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import PivotTable from 'react-pivottable/PivotTable';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { updateLoaderFlag } from '../../../../redux/folderSlice';
import { useNavigate, useParams } from 'react-router';

function FormReports({ }) {
    const params = useParams();
    const formId = params.id;
    const globalLoader = useSelector(state => state.folders.loader);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [editingTabId, setEditingTabId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [newTabRawData, setNewTabRawData] = useState([]);
    const [tabDeleteFlag, setTabDeleteFlag] = useState(false);

    const [pivotResponses, setPivotResponses] = useState([]);
    const [pivotTableData, setPivotTableData] = useState([]);

    const PlotlyRenderers = createPlotlyRenderers(Plot);

    const toggleTab = (tabId) => setActiveTab(tabId);

    const [dataTypes, setDataTypes] = useState([]);
    const [defaultReport, setDefaultReport] = useState([])

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const reportPrivileges = {
        createReport: Privilege?.reports?.createReports,
        viewReport: Privilege?.reports?.viewReports,
        updateReport: Privilege?.reports?.updateReports,
        deleteReport: Privilege?.reports?.deleteReports,
    }

    const updateStep = async (action, stepId, stepName = '') => {
        const actionLabel = action === 'delete' ? 'Deleting' : 'Editing';
        dispatch(updateLoaderFlag({ loader: true, text: `${actionLabel} Tab...` }));
        const res = await API.editPivotReportStep(stepId, formId, action, stepName);
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        if (!res.status) {
            toast.error(`Unable to ${action} Pivot Step`);
            return false;
        }
        toast.success('Tab Updated');
        return true;
    };

    const handleEditTabTitle = async (tabId, title) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab && tab.title !== title) {
            const updated = await updateStep('edit', tabId, title);
            if (updated) {
                setTabs(tabs.map(tab => tab.id === tabId ? { ...tab, title } : tab));
            }
        }
        setEditingTabId(null);
    };

    const startEditingTab = (tabId, title) => {
        setEditingTabId(tabId);
        setEditingTitle(title);
    };

    const removeTab = async (tabId) => {
        const success = await updateStep('delete', tabId);
        if (!success) return;
        setTabDeleteFlag(prev => !prev);
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(updatedTabs);
        if (activeTab === tabId && updatedTabs.length > 0) {
            setActiveTab(updatedTabs[0].id);
        }
    };

    const addTab = async () => {
        const newTabIndex = tabs.length + 1;
        const newTabId = `tab${Date.now()}`;
        const newTitle = `Report ${newTabIndex}`;
        dispatch(updateLoaderFlag({ loader: true, text: "Creating Step..." }));

        const addTabRespo = await API.addPivotReportStep(newTabId, newTitle, formId);
        if (!addTabRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            return toast.error(`Unable to add Pivot Step`);
        }
        // debugger
        const newTab = {
            id: newTabId,
            title: newTitle,
            report: {
                data: newTabRawData,
                rows: [],
                cols: []
            }
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTab(newTabId);
        const report = {
            data: pivotResponses,
            rows: [],
            cols: [],
            aggregatorName: 'Count',
            vals: [],
            rendererName: 'Table',
        }
        // debugger
        setPivotTableData(report)
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
    };

    const getReports = async () => {
        dispatch(updateLoaderFlag({ loader: true, text: "" }));
        const responseList = await API.getFormReports(formId);
        dispatch(updateLoaderFlag({ loader: false, text: "" }));

        if (!responseList.status) return toast.error(`Unable to fetch Pivot Reports`);

        setDefaultReport(responseList.formResponses);
        setDataTypes(responseList.dataTypes);
        setPivotResponses(responseList.data)
        if (responseList.exists) {
            const fallbackReport = responseList.data[0]?.report?.data || [];
            setNewTabRawData(responseList.data[0]?.report?.data);
            const stepArr = responseList.data.map(elem => {
                if (elem.report?.data) {
                    return {
                        id: elem.stepId,
                        title: elem.stepName,
                        report: {
                            data: elem?.report?.data || [],
                            rows: elem?.report?.rows || [],
                            cols: elem?.report?.cols || [],
                            aggregatorName: elem?.report?.aggregatorName || 'Count', // ✅ this must match available aggregators
                            vals: elem?.report?.vals || [],
                            rendererName: elem?.report?.rendererName || 'Table',
                        }
                    }
                } else {
                    return {
                        id: elem.stepId,
                        title: elem.stepName,
                        report: {
                            data: fallbackReport,
                            rows: [],
                            cols: []
                        }
                    }
                }
            });
            // setTabs(stepArr);
            // setActiveTab(stepArr[0]?.id);
            setNewTabRawData(responseList.data);
            const defaultTab = {
                id: 'tab1',
                title: 'Report 1',
                report: {
                    data: responseList.data,
                    rows: [],
                    cols: []
                }
            };
            setTabs([defaultTab,...stepArr]);
            setActiveTab('tab1');
        } else {
            setNewTabRawData(responseList.data);
            const defaultTab = {
                id: 'tab1',
                title: 'Report 1',
                report: {
                    data: responseList.data,
                    rows: [],
                    cols: []
                }
            };
            setTabs([defaultTab]);
            setActiveTab('tab1');
        }
    };

    const handlePivotTableChange = async (newReport, stepId) => {
        const currentTab = tabs.find(t => t.id === stepId);
        if (!currentTab) return;

        const savePivotRespo = await API.savePivotReports(newReport, formId, stepId, currentTab.title);

        
        setPivotTableData(newReport);
    };

    useEffect(() => {
        getReports();
    }, [tabDeleteFlag]);

    async function getTabData(tabId) {
        dispatch(updateLoaderFlag({ loader: true, text: "Fetching..." }));
        const getTabRespo = await API.getTabReport(formId, tabId);
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        // debugger
        if (!getTabRespo.status) return toast.error(`Unable to save Pivot Report`);

        const report = {
            data: getTabRespo["data"][0]?.report?.data || [],
            rows: getTabRespo["data"][0]?.report?.rows || [],
            cols: getTabRespo["data"][0]?.report?.cols || [],
            aggregatorName: getTabRespo["data"][0]?.report?.aggregatorName || 'Count', // ✅ this must match available aggregators
            vals: getTabRespo["data"][0]?.report?.vals || [],
            rendererName: getTabRespo["data"][0]?.report?.rendererName || 'Table',
        }

        setPivotResponses(getTabRespo["data"][0]?.report?.data || [])

        setPivotTableData(report)

    }

    function printDefaultTab() {
        if (defaultReport.length > 0) {
            const result = {};

            defaultReport.forEach(response => {
                Object.keys(response).forEach(question => {
                    const { id, value } = response[question];

                    // If the question is not already in the result object
                    if (!result[question]) {
                        // Find matching dataType by id
                        const matchedType = dataTypes.find(dt => dt.id === id);
                        result[question] = {
                            chartType: matchedType ? matchedType.chartType : null,
                            values: []
                        };
                    }

                    result[question].values.push({ [question]: value });
                });
            });
            const cards = Object.keys(defaultReport[0]).length;
            console.log(result);
            // debugger
            return Object.entries(result).map(([question, { chartType, values }]) => (
                <Card className="card-bordered mt-4" >
                    <div className="card-aside-wrap">
                        <div className="card-inner card-inner-lg">
                            <p >
                                <strong>{question}</strong> - {values?.length} responses
                            </p>
                            <PivotTable
                                data={values}
                                rows={[question]}
                                cols={[]}
                                aggregatorName='Count'
                                vals={[]}
                                renderers={{ ...TableRenderers, ...PlotlyRenderers }}
                                rendererName={chartType}
                            />
                        </div>
                    </div>
                </Card>
            ));
        }
    }

    console.log(tabs,'adasfsdfsfsaf')

    return (
        <React.Fragment>
            <div className={`modal-header align-center modalheader border-bottom-0 ${globalLoader ? 'loading' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem' }}
            >
                <Icon className={`back-arrow-workflow`} onClick={() => navigate(-1)} name="arrow-long-left" />

                <Nav tabs>
                    {tabs.map((tab, index) => (
                        <NavItem onClick={() => {
                            if (tab.id != 'tab1') {
                                getTabData(tab.id)
                            }
                        }} key={tab.id}>
                            <NavLink
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={() => toggleTab(tab.id)}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                {editingTabId === tab.id ? (
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => handleEditTabTitle(tab.id, editingTitle)}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{tab.title}</span>
                                )}
                                <div className="step-icons">
                                    {tab.id != 'tab1' && <i
                                        className="fas fa-pen ml-2 step_edit_icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingTab(tab.id, tab.title);
                                        }}
                                    />}
                                    {reportPrivileges.deleteReport && tab.id != 'tab1' && <i
                                        className="fas fa-times ml-2 step_delete_icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeTab(tab.id);
                                        }}
                                    />}
                                    {reportPrivileges.createReport && index === tabs.length - 1 && (
                                        <i
                                            className="fas fa-plus ml-2 step_add_icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addTab();
                                            }}
                                        />
                                    )}
                                </div>
                            </NavLink>
                        </NavItem>
                    ))}
                </Nav>


            </div>

            <div className="modal-body pt-0 mt-n2">
                <TabContent activeTab={activeTab}>
                    {tabs.map((tab, index) => (
                        <TabPane tabId={tab.id} key={tab.id}>
                            <Row>
                                <Col sm="12">
                                    <Card body className={reportPrivileges.updateReport ? 'update-pivot-report' : 'disable-pivot-edit'}>
                                        {index == 0 && tab.id == 'tab1' ?
                                            printDefaultTab() : <PivotTableUI
                                                data={pivotResponses}
                                                onChange={(e) => handlePivotTableChange(e, tab.id)}
                                                renderers={{ ...TableRenderers, ...PlotlyRenderers }}
                                                {...pivotTableData}
                                            />}

                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                    ))}
                </TabContent>
            </div>
        </React.Fragment>
    );
}

export default FormReports;
