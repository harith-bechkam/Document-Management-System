/**
  * <FormValidator />
  */

import React from 'react';
import xss from 'xss';
import IntlMessages from './language-provider/IntlMessages';

const myxss = new xss.FilterXSS({
  whiteList: {
    u: [],
    br: [],
    b: [],
    i: [],
    ol: ['style'],
    ul: ['style'],
    li: [],
    p: ['style'],
    sub: [],
    sup: [],
    div: ['style'],
    em: [],
    strong: [],
    span: ['style'],
  },
});

export default class FormValidator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
    };
    this.errorRef = React.createRef();
  }

  componentDidMount() {
    this.subscription = this.props.emitter.addListener('formValidation', (errors) => {
      // this.setState({ errors });
      this.setState({ errors }, () => {
        if (errors.length > 0 && this.errorRef?.current) {
          window.scrollTo(0, 0);
          this.errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
    if (this.state.errors.length > 0) {
      window.scrollTo(0, 0);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Scroll to top if errors have changed
    console.log(this.state.errors)
    if (this.state?.errors?.length > 0 && this.errorRef?.current) {
      // window.scrollTo(0,0);
      // return
      this.errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (prevState.errors !== this.state.errors && this.state.errors.length > 0) {
      window.scrollTo(0, 0)
    }
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  dismissModal(e) {
    e.preventDefault();
    this.setState({ errors: [] });
  }

  render() {
    const errors = this.state.errors.map((error, index) => <li style={{ paddingLeft: '0.5rem' }} key={`error_${index}`} dangerouslySetInnerHTML={{ __html: myxss.process(error) }} />);

    return (
      <div style={{ position: 'relative', zIndex: 2 }}>
        {this.state.errors.length > 0 && (
          this.state.errors.length === 1 ? (
            <div style={{display:'flex',justifyContent:'space-between'}} ref={this.errorRef} className="alert alert-danger validation-error">
              <div className="clearfix">
                <i className="fas fa-exclamation-triangle float-left" style={{ paddingTop: '0.2rem' }}></i>
                <ul className="float-left">
                  {errors}
                </ul>
              </div>
              <div className="clearfix">
                <a className="float-right btn btn-default btn-sm btn-danger" onClick={this.dismissModal.bind(this)}>
                  <IntlMessages id="dismiss" />
                </a>
              </div>
            </div>
          ) : (
            <div ref={this.errorRef} className="alert alert-danger validation-error">
              <div className="clearfix">
                <i className="fas fa-exclamation-triangle float-left" style={{ paddingTop: '0.2rem' }}></i>
                <ul className="float-left">
                  {errors}
                </ul>
              </div>
              <div className="clearfix">
                <a className="float-right btn btn-default btn-sm btn-danger" onClick={this.dismissModal.bind(this)}>
                  <IntlMessages id="dismiss" />
                </a>
              </div>
            </div>
          )
        )}
      </div>
    );
  }
}
