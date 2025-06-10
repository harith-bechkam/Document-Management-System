import React from "react";
import Head from "../../../layout/head/Head";
import Content from "../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BackTo,
  NSComponent,
  PreviewCard,
  CodeBlock,
  PreviewTable,
} from "../../../components/Component";
import { Row, Col } from "reactstrap";

const NumberSpinner = () => {
  const spinnerConfigs = [
    {
      label: "Number Spinner Basic",
      props: { defaultVal: 5, color: "light", outline: true },
    },
    {
      label: "Number Spinner Step (10)",
      props: { defaultVal: 50, color: "light", outline: true, step: 10 },
    },
    {
      label: "Number Spinner Min Max (15-80)",
      props: { defaultVal: 20, color: "light", outline: true, min: 15, max: 80 },
    },
    {
      label: "Number Spinner with Primary Button",
      props: { defaultVal: 20, color: "primary" },
    },
  ];

  return (
    <>
      <Head title="Number Spinner" />
      <Content page="component">
        <BlockHead size="lg">
          <BlockHeadContent>
            <BackTo link="/components" icon="arrow-left">
              Components
            </BackTo>
            <BlockTitle tag="h2" className="fw-normal">
              Number Spinner
            </BlockTitle>
            <BlockDes>
              <p className="lead">Examples and usage guidelines for number spinner with basic number type input.</p>
            </BlockDes>
          </BlockHeadContent>
        </BlockHead>

        <Block size="lg">
          <BlockHead>
            <BlockHeadContent>
              <BlockTitle tag="h5">Number Spinner</BlockTitle>
              <p>With number spinner component you can use min, max, step, and many other props.</p>
            </BlockHeadContent>
          </BlockHead>

          <PreviewCard>
            <Row className="g-4">
              {spinnerConfigs.map((config, index) => (
                <Col sm="6" key={index}>
                  <div className="form-group">
                    <label className="form-label">{config.label}</label>
                    <NSComponent {...config.props} />
                  </div>
                </Col>
              ))}
            </Row>
          </PreviewCard>

          <CodeBlock language="jsx">
            {`import NSComponent from "../../components/Component";

<NSComponent defaultVal={5} color="light" outline />`}
          </CodeBlock>

          <PreviewTable>
            <thead className="table-light">
              <tr>
                <th className="overline-title w-300px">Props Reference</th>
                <th className="overline-title">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>max={`{number}`}</code>
                </td>
                <td>Specifies the max limit for the input.</td>
              </tr>
              <tr>
                <td>
                  <code>min={`{number}`}</code>
                </td>
                <td>Specifies the min limit for the input.</td>
              </tr>
              <tr>
                <td>
                  <code>step={`{number}`}</code>
                </td>
                <td>
                  Specifies the number with which to increment or decrement the value.
                </td>
              </tr>
              <tr>
                <td>
                  <code>outline={`{boolean}`}</code>
                </td>
                <td>Determines whether an outline is shown on the button.</td>
              </tr>
              <tr>
                <td>
                  <code>color={`{color}`}</code>
                </td>
                <td>Specifies the color of the button.</td>
              </tr>
              <tr>
                <td>
                  <code>defaultVal={`{number}`}</code>
                </td>
                <td>Specifies the default value of the input.</td>
              </tr>
            </tbody>
          </PreviewTable>
        </Block>
      </Content>
    </>
  );
};

export default NumberSpinner;
