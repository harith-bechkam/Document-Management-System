import React from "react";
import { Link } from "react-router-dom";
import { Block, BlockContent, Button } from "../../components/Component";

const Error404Classic = () => {
  return (
    <>
      <Block className="nk-block-middle wide-xs mx-auto">
        <BlockContent className="nk-error-ld text-center">
          <h1 className="nk-error-head">401</h1>
          <h3 className="nk-error-title">You do not have access to this page!</h3>
          <p className="nk-error-text">
          It seems you're trying to access a page that may have been removed, or you don't have the necessary permissions to view it.
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
export default Error404Classic;
