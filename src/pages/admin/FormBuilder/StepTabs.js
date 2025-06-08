import React, { useEffect, useState } from 'react'
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Card } from 'reactstrap'
import FormBuilder from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';

const StepTabs = ({
    formsData, setFormsData,
    tabs, setTabs,
    activeTab, setActiveTab,
    editingTabId, setEditingTabId,
    editingTitle, setEditingTitle,
    handleEditTabTitle,
    setStart,
    isCreatePage
}) => {

    const [isInputValid, setIsInputValid] = useState(false);
    const location = useLocation();
    const inlineAddFormClicked = useSelector(state => state.folders.inlineAddFormTemplateClicked);

    useEffect(() => {
        const check = async () => {
            const result = await checkInput(formsData);  // Await the async function
            setIsInputValid(result);  // Update state with the result
        };
        check();
    }, [formsData]);

    const addTab = () => {
        const newId = tabs.length ? tabs[tabs.length - 1].id + 1 : 1;
        const newTab = { id: newId, title: `Step ${newId}` };
        setStart(false);
        setTabs([...tabs, newTab]);
        setActiveTab(newId);
        setFormsData({ ...formsData, [newId]: { task_data: [] } });
    };

    const removeTab = (id) => {
        setTabs(tabs.filter(tab => tab.id !== id));
        if (activeTab === id) {
            setActiveTab(tabs[tabs.length - 2]?.id || null);
        }
        const updatedForms = { ...formsData };
        delete updatedForms[id];
        setFormsData(updatedForms);
        setStart(false);
    };

    const toggleTab = (id) => {
        setActiveTab(id);
        setStart(false);
    };

    const loadFormData = (id = 1) => {
        // debugger
        return Promise.resolve(formsData[id]?.task_data || []);
    }

    const handleFormSave = (data, id) => {
        setStart(false);
        setFormsData((prevFormsData) => ({
            ...prevFormsData,
            [id]: { task_data: data.task_data },
        }));
    }

    async function checkInput(input) {
        // Check if the input is null or undefined or an empty object
        if (location.pathname.includes('add') || inlineAddFormClicked) {
            return true;
        }

        if (input === null || input === undefined || (Object.keys(input).length === 0 && input.constructor === Object)) {
            return false;
        }

        // Check if the structure has "1" with step_name and task_data
        if (input["1"] && (input["1"].step_name === "" || Array.isArray(input["1"].step_name) && input["1"].step_name.length === 0)) {
            return false;
        }

        return true;
    }
    console.log(isCreatePage, "isCreatePage")
    return (
        <>
            {isInputValid &&
                <div>
                    <Nav tabs>
                        {tabs.map((tab) => (
                            <NavItem key={tab.id}>
                                <NavLink
                                    className={activeTab === tab.id ? 'active' : ''}
                                    onClick={() => toggleTab(tab.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingTabId == tab.id ? (
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

                                    <div className='delete-step'>
                                        <i
                                            className="fas fa-times ml-2 step_delete_icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTab(tab.id);
                                            }}
                                        ></i>
                                    </div>
                                    <div className='edit-step'>
                                        <i
                                            className="fas fa-pen ml-2 step_edit_icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTabId(tab.id);
                                                setEditingTitle(tab.title);
                                            }}
                                        ></i>
                                    </div>
                                </NavLink>
                            </NavItem>
                        ))}
                        <NavItem>
                            <NavLink onClick={addTab}>
                                <i className="fas fa-plus add-step" style={{ cursor: 'pointer' }}></i>
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        {tabs.map((tab) => (
                            <TabPane tabId={tab.id} key={tab.id}>
                                <Row>
                                    <Col sm="12">
                                        <Card body>
                                            <div className="formbuilder">
                                                {activeTab == tab.id && (
                                                    <FormBuilder.ReactFormBuilder
                                                        onLoad={() => loadFormData(tab.id)}
                                                        onPost={(data) => handleFormSave(data, tab.id)}
                                                        editMode={true}
                                                        showCorrectColumn={false}
                                                    />
                                                )}
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </TabPane>
                        ))}
                    </TabContent>
                </div>
            }
        </>
    );
}

export default StepTabs;
