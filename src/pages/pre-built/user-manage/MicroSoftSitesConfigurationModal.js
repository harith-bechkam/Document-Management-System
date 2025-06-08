import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { Button, Col, Label, Modal, ModalBody, Row, Spinner } from 'reactstrap';
import { savemicrosoftsitelist } from '../../../utils/API';
import toast from "react-hot-toast";

function MicroSoftSitesConfigurationModal({ toggle, sites, isloading }) {
    const [selectedSites, setSelectedSites] = useState([]);
    useEffect(() => {
        if(sites.length>0){
            let selected=[];
            for(let site of sites){
                if(site.selected==true){
                    selected.push({"id":site.id,"driveType":site.driveType})
                }
            }
            setSelectedSites(prev => [...selected])
        }
    }, [sites])

    async function handleSubmit() {
        let selectedsitList=selectedSites;
        selectedsitList=[...new Set(selectedsitList)];
        savemicrosoftsitelist(selectedSites).then((res) => {
            if(res.status==true){
                toast.success(`Sites saved successfully!`)
            }else{
                toast.error(`Failed to save sites. Try again.`)
            }
         })
    }
    if(isloading){
    return (
        <div style={{minHeight:"80vh"}}>
            <Button disabled color="primary" className="position-absolute top-50 start-50 translate-middle">
                <Spinner size="sm" />
                <span> Loading... </span>
            </Button>
        </div>
    );
    }    return (
        <ModalBody>
            <div className="p-2">
                <h5 className="title mb-4">Select Sites to Migrate</h5>
                <div className="tab-content">
                     <p className="mb-4 text-muted">
                        Below are the list of sites available in your Microsoft account.
                        Please select the sites you want to <strong>migrate to iDoks</strong>.
                    </p>
                    <div className={`tab-pan active modal-body-scroll`} id="personal" >
                       
                        <Row className="gy-4">
                            <Col md="12">
                                <h6>OneDrive</h6>
                            </Col>
                            {
                             sites.map(site => (
                                (site["driveType"]=="business" || site["driveType"]=="personal")?
                                <Col md="12">
                                    <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id={site.id} data-type={site.driveType}
                                        checked={selectedSites.some(s => s.id === site.id)}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            const id = site.id;
                                            const driveType = e.target.getAttribute('data-type'); // read from attribute
                                            if (isChecked) {
                                                setSelectedSites(prev => [...prev, { id, driveType }]);
                                            } else {
                                                setSelectedSites(prev => prev.filter(site => site.id !== id));
                                            }
                                        }} />
                                        <label className="custom-control-label" htmlFor={site.id}>
                                        {site.displayName}
                                        </label>
                                    </div>
                                </Col>:<></>    
                             ))
                            }
                            <Col md="12">
                                <h6>SharePoint</h6>
                            </Col>
                            {
                              sites.map(site => (
                                (site["driveType"]!="personal" && site["driveType"]!="business")?
                                <Col md="12">
                                    <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id={site.id} data-type={site.driveType}
                                        checked={selectedSites.some(s => s.id === site.id)}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            const id = site.id;
                                            const driveType = e.target.getAttribute('data-type'); // read from attribute
                                            if (isChecked) {
                                                setSelectedSites(prev => [...prev, { id, driveType }]);
                                            } else {
                                                setSelectedSites(prev => prev.filter(site => site.id !== id));
                                            }
                                        }} />
                                        <label className="custom-control-label" htmlFor={site.id}>
                                        {site.displayName}
                                        </label>
                                    </div>
                                </Col>:<></>    
                             ))
                            }
                        </Row>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                            <li>
                                <Button
                                    color="primary"
                                    size="lg"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    Update
                                </Button>
                            </li>
                            <li>
                                 <Button
                                    color="danger"
                                    size="lg"
                                    onClick={(ev) => {
                                         ev.preventDefault();
                                        toggle()
                                    }}
                                >
                                    Cancel
                                </Button>
                               
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ModalBody>
    )
}

export default MicroSoftSitesConfigurationModal