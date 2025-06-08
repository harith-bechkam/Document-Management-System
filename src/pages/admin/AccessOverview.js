import React, { useState, useEffect } from "react";
import Content from "../../layout/content/Content";
import { Icon, Row, Col, InputSwitch, RSelect, Button, Block, BlockTitle } from "../../components/Component";
import { Breadcrumb, BreadcrumbItem, Card, Modal } from 'reactstrap';
import classnames from "classnames";
import { TabContent, TabPane } from "reactstrap";
import Head from "../../layout/head/Head";
import * as API from "../../utils/API";
import AddRole from "../app/file-manager/modals/AddRole";
import { camelCaseToWords } from "../../utils/Utils";
import FileManagerLayout from "../app/file-manager/components/Layout";
import FilesBody from "../app/file-manager/components/Body";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateSelectedModule } from "../../redux/folderSlice";

const AccessOverview = () => {
    const [roleData, setRoleData] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const currentSelectedModule = useSelector(state => state.folders.selectedModule);
    const [selectedModule, setSelectedModule] = useState(currentSelectedModule);
    const [roleModal, setRoleModal] = useState(false);
    const [roleUpdateFlag, setRoleUpdateFlag] = useState(false);
    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const dispatch = useDispatch();

    useEffect(() => {
        fetchData('fetch')
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [roleUpdateFlag])

    const fetchData = async (val) => {
        try {
            const roleDataResponse = await API.getAllRoles()
            if (roleDataResponse.status) {
                const transformedRoleData = transformModulePrivileges(roleDataResponse.data)
                setRoleData(transformedRoleData)

                const options = transformedRoleData.map((role, index) => ({
                    // id: `${index + 1}`,
                    id: role._id.toString(),
                    value: role.role,
                    label: role.role
                }))
                setRoleOptions(options)

                if (val == 'fetch') {
                    setSelectedOption(options[0])
                    setSelectedModule(transformedRoleData.find(item => item.role === options[0]?.value)?.modulePrivileges?.find((_, index) => index === 0)['module'])
                }
                // debugger
                // setSelectedModule(currentSelectedModule);
            }
        } catch (error) {
            console.error('Error fetching role data - ', error);
        }
    }

    const transformModulePrivileges = (roles) => {
        return roles.map(role => {
            const modulePrivilegeArray = Object.entries(role.modulePrivileges).map(([moduleName, moduleObj]) => ({
                module: moduleName,
                methods: Object.entries(moduleObj).map(([action, permission]) => ({
                    action,
                    permission
                }))
            }))
            return { ...role, modulePrivileges: modulePrivilegeArray }
        })
    }

    const toggleRoleModal = () => {
        setRoleModal(!roleModal)
    }

    const handleRoleChange = (option) => {
        setSelectedOption(option);
        setSelectedModule(roleData.find(item => item.role === selectedOption?.value)?.modulePrivileges?.find((_, index) => index === 0)['module'])
    }

    function formatRoleTitle(module){
        if(module=='workflow'){
            return 'Forms & Workflow'
        }
        return camelCaseToWords(module)
    }

    return (
        <FileManagerLayout>
            <FilesBody

                title={
                    <BlockTitle page>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Breadcrumb className="breadcrumb-arrow">
                            <BreadcrumbItem>
                                <span
                                    className="breadcrumbforward"
                                >
                                    Access Overview
                                </span>

                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </BlockTitle>
                        
            }
                
            >
            <Head title={'Access Overview'} />
            < Card className="card-bordered" >
                <div className="card-aside-wrap">
                    <div className="card-inner card-inner-lg">

                        <Block>
                            <div className="nk-data data-list">
                                <Row className="g-gs">

                                    <Col>
                                        <div className='form-inline' style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: '2%' }}>
                                            <div className="form-group" style={{ width: '25%' }}>
                                                <label className="form-label align-items-start">Role</label>

                                                <RSelect
                                                    options={roleOptions}
                                                    value={selectedOption}
                                                    onChange={handleRoleChange}
                                                    setRoleUpdateFlag={setRoleUpdateFlag}
                                                />
                                                <small class="text-danger">Note: Super Admin privileges can't be modified</small>
                                            </div>
                                            <div>
                                                {Privilege.accessOverview.addRole &&
                                                    <Button className={'role-create-button'} size="md" color="primary" onClick={toggleRoleModal}>
                                                        <Icon name="plus" />
                                                        <span>Create Role</span>
                                                    </Button>
                                                }
                                            </div>
                                        </div>

                                    </Col>

                                    <Col md={4}>
                                        <ul className="nav link-list-menu border round m-0 bg-white access-overview-sidemenu">
                                            {roleData.find(item => item.role === selectedOption?.value)?.modulePrivileges?.map((item, idx) => (
                                                <li
                                                    className={selectedModule == item.module ? 'active moduleselected' : ''}
                                                    key={idx}>
                                                    <a
                                                        href="#tab"
                                                        // className={classnames({
                                                        //     active: selectedModule === item.module,
                                                        // })}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedModule(item.module);
                                                            dispatch(updateSelectedModule(item.module));
                                                        }}
                                                    >

                                                        <Icon name="user" />
                                                        <span>{formatRoleTitle(item.module)}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </Col>


                                    <Col md={8}>

                                        <TabContent activeTab={selectedModule}>
                                            <TabPane tabId={selectedModule}>
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Action</th>
                                                            <th scope="col">Permission</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {roleData.find(item => item.role === selectedOption?.value)?.modulePrivileges
                                                            ?.find(item => item.module === selectedModule)?.methods?.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{camelCaseToWords(item.action)}</td>
                                                                    <td>
                                                                        <div className="custom-control custom-switch">
                                                                            <InputSwitch
                                                                                privilege={selectedOption?.value == 'Super Admin' ? false : Privilege.accessOverview.updateAcccessOverview}
                                                                                id={`custom-switch-${item.action}-${index}`}
                                                                                checked={item.permission}
                                                                                action={item.action}
                                                                                role={selectedOption.value}
                                                                                module={selectedModule}
                                                                                fetchRoles={() => fetchData('update')}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </TabPane>
                                        </TabContent>
                                    </Col>

                                </Row>
                            </div>
                        </Block>
                    </div>
                </div>
            </Card>


            <Modal isOpen={roleModal} size="sm" toggle={toggleRoleModal}>
                <AddRole
                    toggle={toggleRoleModal}
                    modulePrivileges={{
                        accessOverview: {
                            addRole: false,
                            viewAccessOverview: false,
                            updateAcccessOverview: false
                        },
                        metaData: {
                            addMetaData: false,
                            viewMetaData: false,
                            updateMetaData: false,
                            deleteMetaData: false
                        },
                        workflow: {
                            addWorkflow: false,
                            viewWorkflow: false,
                            updateWorkflow: false,
                            deleteWorkflow: false
                        },
                        user: {
                            viewUser: false,
                            addUser: false,
                            deleteUser: false,
                            updateUser: false
                        },
                        section: {
                            viewSection: false,
                            addSection: false,
                            deleteSection: false,
                            updateSection: false
                        },
                        userGroup: {
                            viewuserGroup: false,
                            adduserGroup: false,
                            deleteuserGroup: false,
                            updateuserGroup: false
                        }
                    }}
                    fetchRoles={() => fetchData('fetch')}
                />
            </Modal>
        </FilesBody>
        </FileManagerLayout >
    );
};

export default AccessOverview;
