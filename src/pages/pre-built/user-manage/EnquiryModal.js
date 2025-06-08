import { useForm, Controller } from "react-hook-form";
import { Button, Col, ModalBody, Row, Spinner } from "reactstrap";
import * as API from '../../../utils/API'
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";


const EnquiryModal = ({ toggle, enquiryProduct }) => {
    const {
        control, handleSubmit, register, watch,
        formState: { errors }
    } = useForm({
        // defaultValues: {
        //     product: enquiryProduct
        // }
    })
    // const selectedProduct = watch("product");

    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)

        if (!localStorage.getItem('workspace_id')) {
            return toast.error("Workspace ID not found")
        }
        data.product = enquiryProduct
        if (!data['message']) {
            data['message'] = null
        }
        if (!data['address']) {
            data['address'] = null
        }

        let enquiryResponse = await API.createEnquiry(localStorage.getItem('workspace_id'), data)
        let { status, message } = enquiryResponse

        if (status) {
            toggle()

            setTimeout(() => {
                Swal.fire({
                    icon: "success",
                    title: "Enquiry Submitted",
                    text: "Our team will contact you shortly",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                })
            }, 300)
        }
        else {
            toast.error(`Error While Submitting Enquiry - ${message}`)
        }

        setLoading(false)
    }


    return (
        <>
            <ModalBody>
                <div className="p-3">
                    <h5 className="title mb-4">Purchase Details</h5>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <Row className="gy-3">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="full-name">Name</label>
                                    <input
                                        type="text"
                                        id="full-name"
                                        className={`form-control ${errors.userName ? "is-invalid" : ""}`}
                                        {...register("userName", { required: "Name is required" })}
                                        placeholder="Enter your name"
                                    />
                                    {errors.userName && <span className="invalid">{errors.userName.message}</span>}
                                </div>
                            </Col>
                        </Row>

                        <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        {...register('email', {
                                            required: true,
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && errors.email.type == "required" && <span className="invalid">Email is required</span>}
                                    {errors.email && errors.email.type == "pattern" && (
                                        <span className="invalid">{errors.email.message}</span>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="phone">Mobile Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                        {...register("phone", { required: "Phone number is required" })}
                                        placeholder="Enter your phone number"
                                    />
                                    {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                                </div>
                            </Col>
                        </Row>

                        <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                        // {...register("address", { required: "Address is required" })}
                                        {...register("address")}
                                        placeholder="Enter your address"
                                    />
                                    {errors.address && <span className="invalid">{errors.address.message}</span>}
                                </div>
                            </Col>
                        </Row>

                        {/* <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label">Select Product</label>
                                    <Controller
                                        name="product"
                                        control={control}
                                        disabled={!!(selectedProduct)}
                                        rules={{ required: "Please select a product" }}
                                        render={({ field }) => (
                                            <select className={`form-control ${errors.product ? "is-invalid" : ""}`} {...field}>
                                                <option value="">Select a product</option>
                                                <option value="Starter">Starter</option>
                                                <option value="Pro">Pro</option>
                                                <option value="Enterprise">Enterprise</option>
                                                <option value="Custom">Custom</option>
                                            </select>
                                        )}
                                    />
                                    {errors.product && <span className="invalid">{errors.product.message}</span>}
                                </div>
                            </Col>
                        </Row> */}

                        {/* <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label">Payment Method</label>
                                    <Controller
                                        name="paymentMethod"
                                        control={control}
                                        rules={{ required: "Please select a payment method" }}
                                        render={({ field }) => (
                                            <select className={`form-control ${errors.paymentMethod ? "is-invalid" : ""}`} {...field}>
                                                <option value="">Select a payment method</option>
                                                <option value="COD">Cash On Delivery</option>
                                            </select>
                                        )}
                                    />
                                    {errors.paymentMethod && <span className="invalid">{errors.paymentMethod.message}</span>}
                                </div>
                            </Col>
                        </Row> */}

                        <Row className="gy-3 mt-1">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label">Enter Your Message</label>
                                    <Controller
                                        name="message"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                className="form-control"
                                                placeholder="Type your message here..."
                                                {...field}
                                            />
                                        )}
                                    />
                                    <small className="text-muted">This field is optional</small>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-4 d-flex justify-content-end">
                            <Col xs="auto">
                                <Button color="danger" size="md" onClick={toggle}>
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs="auto">
                                <Button color="primary" size="md" type="submit">
                                    {loading && <Spinner size="sm" color="light" />} Submit
                                </Button>
                            </Col>
                        </Row>
                    </form>
                </div>
            </ModalBody>
        </>
    )
}

export default EnquiryModal
