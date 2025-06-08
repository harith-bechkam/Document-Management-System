// import React from "react";
// import { Link } from "react-router-dom";
// import { Block, BlockContent, Button } from "../../components/Component";
// import Head from "../../layout/head/Head";

// const InvalidRecoverToken = () => {
//     return (
//         <>
//             <Head title="Reset-Password" />
//             <Block className="nk-block-middle wide-xs mx-auto">
//                 <BlockContent className="nk-error-ld text-center">
//                     <h1 className="nk-error-head">401</h1>
//                     <h3 className="nk-error-title text-white">Oops! Invalid Recover Token!</h3>
//                     <p className="nk-error-text text-white">
//                         It seems you're trying to access a Recover page that may have not been accessible, or you don't have the necessary permissions to view it.
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

// export default InvalidRecoverToken;


import React from "react";
import { Link } from "react-router-dom";
import { Block, BlockContent, Button } from "../../components/Component";
import Head from "../../layout/head/Head";

const InvalidRecoverToken = () => {
    return (
        <>
            <Head title="Invalid Recovery Token" />
            <Block className="nk-block-middle wide-xs mx-auto">
                <BlockContent className="nk-error-ld text-center">
                    <h1 className="nk-error-head">401</h1>
                    <h3 className="nk-error-title text-white">Invalid or Expired Recovery Token</h3>
                    <p className="nk-error-text text-white">
                        The link you used to recover your account is either invalid or has expired.
                        Please request a new recovery link to proceed.
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

export default InvalidRecoverToken;
