import React from "react";
import { Link } from "react-router-dom";
import { Block, BlockContent, Button } from "../../../components/Component";

const WorkflowError = () => {
    return (
        <>
            <Block className="nk-block-middle wide-xs mx-auto">
                <BlockContent className="nk-error-ld text-center">
                    <h1 className="nk-error-head">404</h1>
                    <h3 className="nk-error-title">Oops! Workflow has been Completed!</h3>
                    <p className="nk-error-text">
                        It seems you're trying to access a page that may have been finished, or you don't have the necessary permissions to view it.
                    </p>
                    <Link to={`${process.env.PUBLIC_URL}/`}>
                        <Button color="primary" size="lg" className="mt-2">
                            Back To Home
                        </Button>
                    </Link>
                </BlockContent>
            </Block>
        </>
    );
};
export default WorkflowError;
