/**
  * <ReactFormBuilder />
*/

import React from 'react';
import { DndProvider } from 'react-dnd-old';
import { HTML5Backend } from 'react-dnd-html5-old-backend';
import { IntlProvider } from 'react-intl';
import Preview from './preview';
import Toolbar from './toolbar';
import FormGenerator from './form';
import store from './stores/store';
import Registry from './stores/registry';
import AppLocale from './language-provider';
import StickyBox from "react-sticky-box";

class ReactFormBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editElement: null,
    };
    this.editModeOn = this.editModeOn.bind(this);
  }

  editModeOn(data, e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.editMode) {
      this.setState({ editMode: !this.state.editMode, editElement: null });
    } else {
      this.setState({ editMode: !this.state.editMode, editElement: data });
    }
  }

  manualEditModeOff() {
    if (this.state.editMode) {
      this.setState({
        editMode: false,
        editElement: null,
      });
    }
  }

  render() {
    const toolbarProps = {
      showDescription: this.props.show_description,
    };

    const language = this.props.locale ? this.props.locale : 'en';
    const currentAppLocale = AppLocale[language];
    if (this.props.toolbarItems) { toolbarProps.items = this.props.toolbarItems; }
    return (
      <DndProvider backend={HTML5Backend} context={window}>
        <IntlProvider
          locale={currentAppLocale.locale}
          messages={currentAppLocale.messages}>
          <div>
            {/* <div>
           <p>
             It is easy to implement a sortable interface with React DnD. Just make
             the same component both a drag source and a drop target, and reorder
             the data in the <code>hover</code> handler.
           </p>
           <Container />
         </div> */}
            {/* <div className="react-form-builder clearfix">
              <div className='row'>
                <Preview
                  files={this.props.files}
                  manualEditModeOff={this.manualEditModeOff.bind(this)}
                  showCorrectColumn={this.props.showCorrectColumn}
                  parent={this}
                  data={this.props.data}
                  url={this.props.url}
                  saveUrl={this.props.saveUrl}
                  onLoad={this.props.onLoad}
                  onPost={this.props.onPost}
                  editModeOn={this.editModeOn}
                  editMode={this.state.editMode}
                  variables={this.props.variables}
                  registry={Registry}
                  editElement={this.state.editElement}
                  renderEditForm={this.props.renderEditForm}
                  saveAlways={this.props.saveAlways}
                />
                  <Toolbar {...toolbarProps} customItems={this.props.customToolbarItems} />
              </div>
            </div> */}
            <div className="react-form-builder clearfix">
              <div className="toolbar-custom-row row">
                <div className="col-9"> 
                  <Preview
                    files={this.props.files}
                    manualEditModeOff={this.manualEditModeOff.bind(this)}
                    showCorrectColumn={this.props.showCorrectColumn}
                    parent={this}
                    data={this.props.data}
                    url={this.props.url}
                    saveUrl={this.props.saveUrl}
                    onLoad={this.props.onLoad}
                    onPost={this.props.onPost}
                    editModeOn={this.editModeOn}
                    editMode={this.state.editMode}
                    variables={this.props.variables}
                    registry={Registry}
                    editElement={this.state.editElement}
                    renderEditForm={this.props.renderEditForm}
                    saveAlways={this.props.saveAlways}
                  />
                </div>

                <div className="col-3">
                  <StickyBox offsetTop={10} offsetBottom={20}>
                    <Toolbar {...toolbarProps} customItems={this.props.customToolbarItems} />
                  </StickyBox>
                </div>
              </div>
            </div>

          </div>
        </IntlProvider>
      </DndProvider>
    );
  }
}

function ReactFormGenerator(props) {
  const language = props.locale ? props.locale : 'en';
  const currentAppLocale = AppLocale[language];
  return (
    <IntlProvider
      locale={currentAppLocale.locale}
      messages={currentAppLocale.messages}>
      <FormGenerator {...props} />
    </IntlProvider>
  );
}

const FormBuilders = {};
FormBuilders.ReactFormBuilder = ReactFormBuilder;
FormBuilders.ReactFormGenerator = ReactFormGenerator;
FormBuilders.ElementStore = store;
FormBuilders.Registry = Registry;

export default FormBuilders;

export {
  ReactFormBuilder, ReactFormGenerator, store as ElementStore, Registry,
};
