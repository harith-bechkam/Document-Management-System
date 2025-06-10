import React from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import FormValidationComponent from "../../../components/partials/form/FormValidation";
import {
  Block,
  BlockDes,
  PreviewCard,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BackTo,
} from "../../../components/Component";

const FormValidation = () => {
  const renderValidationBlock = (title, description, formId, alter = false) => (
    <Block size="lg">
      <BlockHead>
        <BlockHeadContent>
          <BlockTitle tag="h5">{title}</BlockTitle>
          <BlockDes>
            <p>{description}</p>
          </BlockDes>
        </BlockHeadContent>
      </BlockHead>
      <PreviewCard>
        <FormValidationComponent id={formId} {...(alter && { alter })} />
      </PreviewCard>
    </Block>
  );

  return (
    <>
      <Head title="Form Validation" />
      <Content page="component">
        <BlockHead size="lg">
          <BlockHeadContent>
            <BackTo link="/components" icon="arrow-left">
              Components
            </BackTo>
            <BlockTitle tag="h2" className="fw-normal">
              Form Validation
            </BlockTitle>
            <BlockDes>
              <p className="lead">
                With validation using the <strong>react-hook-form</strong> package, you can add client-side validation
                before submitting the form. See the{" "}
                <a target="_blank" rel="noreferrer" href="https://react-hook-form.com/">
                  official documentation
                </a>{" "}
                for more details.
              </p>
            </BlockDes>
          </BlockHeadContent>
        </BlockHead>

        {renderValidationBlock(
          "Validation - Regular Style",
          "Below example helps you to build your own form in a nice way.",
          "form-1"
        )}

        {renderValidationBlock(
          "Validation - Alternate Style",
          "Below example helps you to build your own form in a nice way.",
          "form-2",
          true
        )}
      </Content>
    </>
  );
};

export default FormValidation;
