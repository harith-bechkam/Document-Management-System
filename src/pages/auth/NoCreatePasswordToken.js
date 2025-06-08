// import React from "react";
// import { Link } from "react-router-dom";
// import { Block, BlockContent, Button } from "../../components/Component";
// import Head from "../../layout/head/Head";

// const NoCreatePasswordToken = () => {
//     return (
//         <>
//             <Head title="Reset-Password" />
//             <Block className="nk-block-middle wide-xs mx-auto">
//                 <BlockContent className="nk-error-ld text-center">
//                     {/* <h1 className="nk-error-head">401</h1> */}
//                     <h3 className="nk-error-title text-white">Oops! No Token is not Available!</h3>
//                     <h4 className="nk-error-title text-white">Create a new password!</h4>

//                     <p className="nk-error-text text-white">
//                         No Token!
//                     </p>
//                     {/* <Link to={`${process.env.PUBLIC_URL}/`}>
//                         <Button color="primary" size="lg" className="mt-2">
//                             Get one Here
//                         </Button>
//                     </Link> */}
//                 </BlockContent>
//             </Block>
//         </>
//     )
// }

// export default NoCreatePasswordToken;


import React from "react";
import { Link } from "react-router-dom";
import { Block, BlockContent, Button } from "../../components/Component";
import Head from "../../layout/head/Head";

const NoCreatePasswordToken = () => {
    return (
        <>
            <Head title="Create New Password" />
            <Block className="nk-block-middle wide-xs mx-auto">
                <BlockContent className="nk-error-ld text-center">
                    <h3 className="nk-error-title text-white">Oops! No Token Found</h3>
                    <h4 className="nk-error-title text-white">Request a new password reset link.</h4>

                    <p className="nk-error-text text-white">
                        It looks like the password reset token is missing or invalid.
                        Please request a new link to proceed.
                    </p>

                    {/* <Link to={`${process.env.PUBLIC_URL}/forgot-password`}>
                        <Button color="primary" size="lg" className="mt-2">
                            Request New Link
                        </Button>
                    </Link> */}
                </BlockContent>
            </Block>
        </>
    );
};

export default NoCreatePasswordToken;
