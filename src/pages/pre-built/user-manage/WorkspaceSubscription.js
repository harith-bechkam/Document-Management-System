import React, { useState, useEffect } from "react"
import Content from "../../../layout/content/Content"
import { Card, Badge, Modal, Row, Col } from "reactstrap"
import Head from "../../../layout/head/Head"
import {
    Block,
    BlockBetween,
    BlockDes,
    BlockHead,
    BlockHeadContent,
    BlockTitle,
    Button,
    BlockContent,
    Icon,
} from "../../../components/Component"
import UserProfileAside from "./UserProfileAside"
import * as API from '../../../utils/API'
import { useDispatch } from "react-redux"
import { updateLoaderFlag } from "../../../redux/folderSlice"
import toast from "react-hot-toast"

import PlanS1 from "../../../images/icons/plan-s1.svg"
import PlanS2 from "../../../images/icons/plan-s2.svg"
import PlanS3 from "../../../images/icons/plan-s3.svg"
import EnquiryModal from "./EnquiryModal"

const WorkspaceSubscription = () => {
    const dispatch = useDispatch()
    const [sm, updateSm] = useState(false)
    const [enquiryModal, setEnquiryModal] = useState(false)
    const [enquiryProduct, setEnquiryProduct] = useState(null)
    const [data, setData] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Plans' }))
        let planResponse = await API.getPlanByWorkspaceId(localStorage.getItem('workspace_id'))
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { status, message, ...rem } = planResponse
        if (status) {
            setData(planResponse['data'])
        } else {
            toast.error(message == 'Permission Denied' ? message : `Error While Fetching Plans - ${message}`)
        }
    }


    const toggleEnquiryModal = () => {
        setEnquiryModal(!enquiryModal);
    }

    const chooseOption = async (item) => {

        if (item.active == false) {
            setEnquiryModal(true)
            setEnquiryProduct(item['name'])
        }

    }

    return (
        <>
            <Head title="Workspace Subscription"></Head>
            <Content>
                <Card className="card-bordered">
                    <div className="card-aside-wrap">
                        <div className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${sm ? "content-active" : ""}`}>
                            <UserProfileAside updateSm={updateSm} sm={sm} />
                        </div>
                        <div className="card-inner card-inner-lg">
                            <Block size="lg">
                                <BlockHead>
                                    <BlockBetween className="g-3">
                                        <BlockContent>
                                            <BlockTitle>Workspace Subscription</BlockTitle>
                                            <BlockDes className="text-soft">
                                                <p>Choose your pricing plan and start enjoying our service</p>
                                            </BlockDes>
                                        </BlockContent>
                                    </BlockBetween>
                                </BlockHead>

                                <Row className="g-gs justify-content-center">
                                    {data?.length > 0 && data.map((item) => (
                                        <Col md={4} xxl={3} key={item.id}>
                                            <Card className={`card-bordered pricing-card text-center ${item.tags ? "recommend" : ""}`}>
                                                {item.tags && (
                                                    <Badge color="primary" className="pricing-badge">
                                                        Recommend
                                                    </Badge>
                                                )}
                                                {item?.is_custom_plan && (
                                                    <Badge color="success" className="custom-badge">
                                                        Custom
                                                    </Badge>
                                                )}
                                                <div className="pricing-body">
                                                    <div className="pricing-media">
                                                        <img
                                                            src={
                                                                item.logo == 'PlanS1' ? PlanS1 :
                                                                    item.logo == 'PlanS2' ? PlanS2 :
                                                                        item.logo == 'PlanS3' ? PlanS3 : null
                                                            }
                                                            alt="Plan"
                                                            className="pricing-logo"
                                                        />
                                                    </div>
                                                    <div className="pricing-title w-220px mx-auto">
                                                        <h5 className="title">{item.name}</h5>
                                                        <span className="sub-text">{item.desc}</span>
                                                    </div>


                                                    <div className="pricing-features">
                                                        {item.features.length > 0 ? (
                                                            <ul className="features-list">
                                                                {item.features.map((feature, index) => (
                                                                    <li key={index} className="feature-item">
                                                                        <span className="feature-name">{feature?.displayName}</span>
                                                                        <span className="feature-value">
                                                                            {feature.value.toLowerCase() == "yes" ? (
                                                                                <Icon name="check" className="icon-check" />
                                                                            ) : feature.value.toLowerCase() == "no" ? (
                                                                                <Icon name="cross" className="icon-cross" />
                                                                            ) : (
                                                                                feature?.value
                                                                            )}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-muted">No additional features</p>
                                                        )}
                                                    </div>


                                                    <div className="pricing-amount">
                                                        <div className="amount">
                                                            ₹{item.price} <span>/yr</span>
                                                        </div>

                                                        <span className="bill"> {item.name.toLowerCase() != 'starter' ? `You will be billed Yearly` : `Starter plan comes at no cost`}</span>

                                                    </div>
                                                    <div className="pricing-action">

                                                        <Button
                                                            color={item.active ? "success" : "primary"}
                                                            onClick={() => chooseOption(item)}
                                                        >
                                                            {item.active ? "Active" : "Contact Sales"}
                                                        </Button>

                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <Row className="g-gs justify-content-center mt-3 text-center">
                                    <Col md={6} xxl={3} >
                                        <span className="underline-hover" onClick={() => {
                                            setEnquiryModal(true)
                                            setEnquiryProduct('Custom')
                                        }}>CONFIGURE YOUR OWN PLAN <Icon name="forward-ios"></Icon></span>
                                    </Col>
                                </Row>

                            </Block>
                        </div>
                    </div>
                </Card>
            </Content>

            <Modal isOpen={enquiryModal} size="lg" toggle={toggleEnquiryModal}>
                <EnquiryModal toggle={toggleEnquiryModal} enquiryProduct={enquiryProduct} />
            </Modal>
        </>
    )
}

export default WorkspaceSubscription
