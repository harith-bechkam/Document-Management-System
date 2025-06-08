// import React from "react";
// import { Link } from "react-router-dom";
// import { Block, BlockContent, Button } from "../../components/Component";
// import Head from "../../layout/head/Head";

// const InvalidCreatePasswordToken = () => {
//     return (
//         <>
//             <Head title="Reset-Password" />
//             <Block className="nk-block-middle wide-xs mx-auto">
//                 <BlockContent className="nk-error-ld text-center">
//                     <h1 className="nk-error-head">401</h1>
//                     <h3 className="nk-error-title text-white">Oops! Invalid Token!</h3>
//                     <p className="nk-error-text text-white">
//                         It seems you're trying to access a Create Password page that may have not been accessible, or you don't have the necessary permissions to view it.
//                     </p>
//                     <Link to={`${process.env.PUBLIC_URL}/`}>
//                         <Button color="primary" size="lg" className="mt-2">
//                             Back To Home
//                         </Button>
//                     </Link>
//                 </BlockContent>
//             </Block>
//         </>
//     )
// }

// export default InvalidCreatePasswordToken;



import React from "react";
import { Link } from "react-router-dom";
import { Block, BlockContent, Button } from "../../components/Component";
import Head from "../../layout/head/Head";

const InvalidCreatePasswordToken = () => {
    return (
        <>
            <Head title="Invalid Token" />
            <Block className="nk-block-middle wide-xs mx-auto">
                <BlockContent className="nk-error-ld text-center">
                    <h1 className="nk-error-head">401</h1>
                    <h3 className="nk-error-title text-white">Invalid or Expired Token</h3>
                    <p className="nk-error-text text-white">
                        The link you used to create a password is either invalid or has expired.  
                        If you believe this is a mistake, please request a new password reset link.
                    </p>
                    <Link to={`${process.env.PUBLIC_URL}/`}>
                        <Button color="primary" size="lg" className="mt-2">
                            Back to Home
                        </Button>
                    </Link>
                </BlockContent>
            </Block>
        </>
    );
};

export default InvalidCreatePasswordToken;
