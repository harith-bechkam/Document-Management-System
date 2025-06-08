// eslint-disable-next-line max-classes-per-file
import fetch from 'isomorphic-fetch';
import { saveAs } from 'file-saver';
import React from 'react';
import Select from 'react-select';
import SignaturePad from 'react-signature-canvas';
// import ReactBootstrapSlider from 'react-bootstrap-slider';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

import StarRating from './star-rating';
import DatePicker from './date-picker';
import ComponentHeader from './component-header';
import ComponentLabel from './component-label';
import myxss from './myxss';
import { Lightbox } from "react-modal-image";
import icons from '../../../../../app/file-manager/components/Icons';


const FormElements = {};

class Header extends React.Component {
  render() {
    // const headerClasses = `dynamic-input ${this.props.data.element}-input`;
    let classNames = 'static';
    if (this.props.data.bold) { classNames += ' bold'; }
    if (this.props.data.italic) { classNames += ' italic'; }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <h3 className={classNames} dangerouslySetInnerHTML={{ __html: myxss.process(this.props.data.content) }} />
      </div>
    );
  }
}

class Paragraph extends React.Component {
  render() {
    let classNames = 'static';
    if (this.props.data.bold) { classNames += ' bold'; }
    if (this.props.data.italic) { classNames += ' italic'; }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <p className={classNames} dangerouslySetInnerHTML={{ __html: myxss.process(this.props.data.content) }} />
      </div>
    );
  }
}

class Label extends React.Component {
  render() {
    let classNames = 'static';
    if (this.props.data.bold) { classNames += ' bold'; }
    if (this.props.data.italic) { classNames += ' italic'; }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <label className={`${classNames} form-label`} dangerouslySetInnerHTML={{ __html: myxss.process(this.props.data.content) }} />
      </div>
    );
  }
}

class LineBreak extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <hr />
      </div>
    );
  }
}

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class EmailInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class PhoneNumber extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'tel';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'number';
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class TextArea extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <textarea {...props} />
        </div>
      </div>
    );
  }
}

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group custom-select-wrapper">
          <ComponentLabel {...this.props} />
          <select {...props} className='custom-select'>
            {this.props.data.options.map((option) => {
              const this_key = `preview_${option.key}`;
              return <option value={option.value} key={this_key}>{option.text}</option>;
            })}
          </select>
        </div>
      </div>
    );
  }
}

class Signature extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: props.defaultValue,
    };
    this.inputField = React.createRef();
    this.canvas = React.createRef();
  }

  clear = () => {
    if (this.state.defaultValue) {
      this.setState({ defaultValue: '' });
    } else if (this.canvas.current) {
      this.canvas.current.clear();
    }
  }

  render() {
    const { defaultValue } = this.state;
    let canClear = !!defaultValue;
    const props = {};
    props.type = 'hidden';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = defaultValue;
      props.ref = this.inputField;
    }
    const pad_props = {};
    // umd requires canvasProps={{ width: 400, height: 150 }}
    if (this.props.mutable) {
      pad_props.defaultValue = defaultValue;
      pad_props.ref = this.canvas;
      canClear = !this.props.read_only;
    }
    pad_props.clearOnResize = false;

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    let sourceDataURL;
    if (defaultValue && defaultValue.length > 0) {
      sourceDataURL = `data:image/png;base64,${defaultValue}`;
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true || !!sourceDataURL
            ? (<img src={sourceDataURL} />)
            : (<SignaturePad {...pad_props} />)
          }
          {canClear && (
            <i className="fas fa-times clear-signature" onClick={this.clear} title="Clear Signature"></i>)}
          <input {...props} />
        </div>
      </div>
    );
  }
}

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    const { defaultValue, data } = props;
    this.state = { value: this.getDefaultValue(defaultValue, data.options) };
  }

  getDefaultValue(defaultValue, options) {
    if (defaultValue) {
      if (typeof defaultValue === 'string') {
        const vals = defaultValue.split(',').map(x => x.trim());
        return options.filter(x => vals.indexOf(x.value) > -1);
      }
      return options.filter(x => defaultValue.indexOf(x.value) > -1);
    }
    return [];
  }

  // state = { value: this.props.defaultValue !== undefined ? this.props.defaultValue.split(',') : [] };

  handleChange = (e) => {
    // debugger
    console.log('first', e)
    this.setState({ value: e });
  };

  render() {
    // debugger
    // const options = this.props.data.options.map(option => {
    //   option.label = option.text;
    //   return option;
    // });
    let options = [];
    if (this.props.mutable && !this.props.read_only) {
      options = this.props.data.options.map(option => {
        return {
          ...option,
          label: option.text
        };
      });
    } else {
      options = this.props.data.options.map(option => {
        option.label = option.text;
        return option;
      });
    }
    // const options = this.props.data.options.map(option => {
    //   return {
    //     ...option,
    //     label: option.text
    //   };
    // });
    const props = {};
    props.isMulti = true;
    props.name = this.props.data.field_name;
    // debugger

    props.onChange = this.handleChange;
    // debugger
    props.options = options;
    if (!this.props.mutable) { props.value = options[0].text; } // to show a sample of what tags looks like
    if (this.props.mutable) {
      props.isDisabled = this.props.read_only;
      props.value = this.state.value;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <Select className='tag-select' {...props}
          // onChange={this.props.onChange}
          />
        </div>
      </div>
    );
  }
}

class Checkboxes extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    // debugger
    const self = this;
    let classNames = 'custom-control custom-checkbox';
    if (this.props.data.inline) { classNames += ' option-inline'; }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options.map((option) => {
            const this_key = `preview_${option.key}`;
            const props = {};
            props.name = `option_${option.key}`;

            props.type = 'checkbox';
            // debugger
            props.value = option.value;
            if (self.props.mutable) {
              // props.defaultChecked = self.props.defaultValue !== undefined && self.props.defaultValue.indexOf(option.key) > -1;
              props.defaultChecked = self.props.defaultValue !== undefined && self.props.defaultValue.indexOf(option.value) > -1;
            }
            if (this.props.read_only) {
              props.disabled = 'disabled';
            }
            const uniqueId = crypto.randomUUID();
            return (
              <div className={classNames} key={this_key}>
                <input id={`fid_${this_key}_${uniqueId}`} className="custom-control-input" ref={c => {
                  if (c && self.props.mutable) {
                    self.options[`child_ref_${option.key}`] = c;
                  }
                }} {...props} />
                <label className="custom-control-label" htmlFor={`fid_${this_key}_${uniqueId}`}>{option.text}</label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class RadioButtons extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    const self = this;
    let classNames = 'custom-control custom-radio';
    if (this.props.data.inline) { classNames += ' option-inline'; }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options.map((option) => {
            const this_key = `preview_${option.key}`;
            const props = {};
            props.name = self.props.data.field_name;

            props.type = 'radio';
            props.value = option.value;
            if (self.props.mutable) {
              props.defaultChecked = (self.props.defaultValue !== undefined &&
                (self.props.defaultValue.indexOf(option.key) > -1 || self.props.defaultValue.indexOf(option.value) > -1));
            }
            if (this.props.read_only) {
              props.disabled = 'disabled';
            }
            const uniqueId = crypto.randomUUID();
            return (
              <div className={classNames} key={this_key}>
                <input id={`fid_${this_key}_${uniqueId}`} className="custom-control-input" ref={c => {
                  if (c && self.props.mutable) {
                    self.options[`child_ref_${option.key}`] = c;
                  }
                }} {...props} />
                <label className="custom-control-label" htmlFor={`fid_${this_key}_${uniqueId}`}>{option.text}</label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Image extends React.Component {
  render() {
    const style = (this.props.data.center) ? { textAlign: 'center' } : null;

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style, ...style }} className={baseClasses} >
        <ComponentHeader {...this.props} />
        {this.props.data.src &&
          <img src={this.props.data.src} width={this.props.data.width} height={this.props.data.height} />
        }
        {!this.props.data.src &&
          <div className="no-image">No Image</div>
        }
      </div>
    );
  }
}

class Rating extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.name = this.props.data.field_name;
    props.ratingAmount = 5;

    if (this.props.mutable) {
      props.rating = (this.props.defaultValue !== undefined) ? parseFloat(this.props.defaultValue, 10) : 0;
      props.editing = true;
      props.disabled = this.props.read_only;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <StarRating {...props} />
        </div>
      </div>
    );
  }
}

class HyperLink extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <label className={'form-label'}>
            <a target="_blank" href={this.props.data.href} dangerouslySetInnerHTML={{ __html: myxss.process(this.props.data.content) }} />
          </label>
        </div>
      </div>
    );
  }
}

class Download extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <a href={`${this.props.download_path}?id=${this.props.data.file_path}`}>{this.props.data.content}</a>
        </div>
      </div>
    );
  }
}

class Camera extends React.Component {
  constructor(props) {
    super(props);
    this.state = { img: null, previewImg: null, imageFlag: false };

    if (this.props.defaultValue && this.props.defaultValue.length > 0 && !this.props.read_only) {
      this.state = {
        img: true,
        previewImg: `${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`,
        imageFlag: false
      }
    }

  }

  async getImage() {
    console.log(this.props.defaultValue)
    this.setState({
      ...this.state,
      imageFlag: true,
    });
  }

  displayImage = (e) => {
    // debugger
    const self = this;
    const target = e.target;
    if (target.files && target.files.length) {
      self.setState({ img: target.files[0], previewImg: URL.createObjectURL(target.files[0]) });
    }
  };

  clearImage = () => {
    this.setState({
      ...this.state,
      img: null,
      previewImg: null,
    });
  };

  removeImage = () => {

    this.setState({
      ...this.state,
      img: null,
      previewImg: null,
    });

  };

  getImageSizeProps({ width, height }) {
    const imgProps = { width: '50%' };
    if (width) {
      imgProps.width = width < window.innerWidth
        ? width
        : 0.9 * window.innerWidth;
    }
    if (height) {
      // imgProps.height = height;
      imgProps.height = '50px';
    }
    return imgProps;
  }

  saveFile = async (e) => {
    e.preventDefault();
    const sourceUrl = `${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`;
    await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.props.defaultValue[0].filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => console.error('Error fetching file:', error));
  };


  render() {
    // debugger

    const imageStyle = { objectFit: 'scale-down', objectPosition: (this.props.data.center) ? 'center' : 'left' };
    let baseClasses = 'SortableItem rfb-item';
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.img ? { display: 'none' } : null;
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }
    let sourceDataURL;


    // if (this.props.defaultValue && !this.props.read_only) {
    //   this.setState({
    //     ...this.state,
    //     img: true,
    //     previewImg: `${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}`
    //   })
    // }

    if (this.props.read_only === true && this.props.defaultValue && this.props.defaultValue.length > 0) {
      if (this.props.defaultValue.indexOf(name > -1)) {
        sourceDataURL = this.props.defaultValue;
      } else {
        sourceDataURL = `data:image/png;base64,${this.props.defaultValue}`;
      }
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true &&
            this.props.defaultValue &&
            this.props.defaultValue.length > 0 ? (
            <>
              <div>
                <img
                  style={{
                    height: '100px', width: '100px',
                    //  border: '1px solid blue' 
                  }}
                  src={`${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`}
                />

              </div>
              <button
                style={{ paddingTop: '1rem' }}
                className='btn btn-default'
                onClick={this.saveFile}
              >
                <i className='fas fa-download'></i> Download File
              </button>
            </>
          ) : (

            // edit option

            this.props.defaultValue && this.props.defaultValue.length > 0 && !this.props.read_only ?
              <div className="image-upload-container">
                <>
                  <div style={fileInputStyle}>
                    <input
                      name={name}
                      type="file"
                      accept="image/*"
                      capture="camera"
                      className="image-upload"
                      onChange={this.displayImage}
                    />
                    <div className="image-upload-control">
                      <div className="btn btn-default">
                        <i className="fas fa-camera"></i> Upload Photo
                      </div>
                      <p>Select an image from your computer or device.</p>
                    </div>
                  </div>
                </>

                {this.state.img && (
                  <div>
                    <img
                      onLoad={() => URL.revokeObjectURL(this.state.previewImg)}
                      src={this.state.previewImg}
                      height="100"
                      className="image-upload-preview"
                    />
                    <br />
                    <div
                      className="btn btn-image-clear"
                      onClick={() => this.removeImage()}
                    >
                      <i className="fas fa-times"></i> Clear Photo
                    </div>
                  </div>
                )}
              </div> :


              // create option

              <div className="image-upload-container">
                <div style={fileInputStyle}>
                  <input
                    name={name}
                    type="file"
                    accept="image/*"
                    capture="camera"
                    className="image-upload"
                    onChange={this.displayImage}
                  />
                  <div className="image-upload-control">
                    <div className="btn btn-default">
                      <i className="fas fa-camera"></i> Upload Photo
                    </div>
                    <p>Select an image from your computer or device.</p>
                  </div>
                </div>

                {this.state.img && (
                  <div>
                    <img
                      onLoad={() => URL.revokeObjectURL(this.state.previewImg)}
                      src={this.state.previewImg}
                      height="100"
                      className="image-upload-preview"
                    />
                    <br />
                    <div
                      className="btn btn-image-clear"
                      onClick={this.clearImage}
                    >
                      <i className="fas fa-times"></i> Clear Photo
                    </div>
                  </div>
                )}
              </div>
          )}
        </div>
        {this.state.imageFlag && <Lightbox
          medium={`${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`}
          large={`${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`}
          alt={this.props.defaultValue[0].filename}
          hideZoom={true}
          hideDownload={false}
          onClose={() => this.setState({
            ...this.state,
            imageFlag: false,
          })}
        />}
      </div>
    );
  }
}

class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fileUpload: null };

    //edit
    if (this.props.defaultValue && this.props.defaultValue.length > 0 && !this.props.read_only) {
      console.log("editcalled", this.props.defaultValue)

      this.state = {
        fileUpload: this.props.defaultValue
      }
    }

  }

  // componentDidMount(){
  //   this.setState({
  //     fileUpload: this.props.defaultValue
  //   })
  // }

  displayFileUpload = (e) => {
    const self = this;
    const target = e.target;
    let file;
    if (target.files && target.files.length > 0) {
      file = target.files[0];

      self.setState({
        fileUpload: file
      });
    }
  };

  clearFileUpload = () => {
    this.setState({
      fileUpload: null,
    });
  };

  saveFile = async (e) => {
    e.preventDefault();
    const sourceUrl = `${process.env.REACT_APP_BE_URL}/form/attachment/${JSON.stringify(this.props.defaultValue[0])}/${localStorage.getItem("workspace_id")}`;
    await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.props.defaultValue[0].filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => console.error('Error fetching file:', error));
  };

  render() {
    console.log(this.state.fileUpload, "fileUpload")

    let baseClasses = 'SortableItem rfb-item';
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.fileUpload ? { display: 'none' } : null;
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }
    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true &&
            this.props.defaultValue &&
            this.props.defaultValue.length > 0 ? (
            <>
              <div className='file-upload-preview'>
                <div
                  style={{ display: 'inline-block', marginRight: '5px' }}
                >

                  {`Name: ${this.props.defaultValue[0].filename}`}
                </div>
              </div>
              <div>

                <button
                  style={{ paddingTop: '1rem' }}
                  className='btn btn-default'
                  onClick={this.saveFile}
                >
                  <i className='fas fa-download'></i> Download File
                </button>
              </div>
            </>
          ) : (
            this.props.defaultValue && this.props.defaultValue.length > 0 && !this.props.read_only ?
              // edit
              <div className='image-upload-container'>
                <div style={fileInputStyle}>
                  <input
                    name={name}
                    type='file'
                    accept={this.props.data.fileType || '*'}
                    className='image-upload'
                    onChange={this.displayFileUpload}
                  />
                  <div className='image-upload-control'>
                    <div className='btn btn-default'>
                      <i className='fas fa-file'></i> Upload File
                    </div>
                    <p>Select a file from your computer or device.</p>
                  </div>
                </div>

                {this.state.fileUpload && (
                  <div>
                    <div className='file-upload-preview'>
                      <div
                        style={{ display: 'inline-block', marginRight: '5px' }}
                      >
                        {`Name: ${typeof this.state.fileUpload?.[0]?.filename != "undefined" ? this.state.fileUpload?.[0]?.filename : this.state.fileUpload.name}`}
                      </div>

                    </div>
                    <br />
                    <div
                      className='btn btn-file-upload-clear'
                      onClick={this.clearFileUpload}
                    >
                      <i className='fas fa-times'></i> Clear File
                    </div>
                  </div>
                )}
              </div>

              :

              // create
              <div className='image-upload-container'>
                <div style={fileInputStyle}>
                  <input
                    name={name}
                    type='file'
                    accept={this.props.data.fileType || '*'}
                    className='image-upload'
                    onChange={this.displayFileUpload}
                  />
                  <div className='image-upload-control'>
                    <div className='btn btn-default'>
                      <i className='fas fa-file'></i> Upload File
                    </div>
                    <p>Select a file from your computer or device.</p>
                  </div>
                </div>

                {this.state.fileUpload && (
                  <div>
                    <div className='file-upload-preview'>
                      <div
                        style={{ display: 'inline-block', marginRight: '5px' }}
                      >
                        {`Name: ${this.state.fileUpload.name}`}
                      </div>
                      <div style={{ display: 'inline-block', marginLeft: '5px' }}>
                        {this.state.fileUpload.size.length > 6
                          ? `Size:  ${Math.ceil(
                            this.state.fileUpload.size / (1024 * 1024)
                          )} mb`
                          : `Size:  ${Math.ceil(
                            this.state.fileUpload.size / 1024
                          )} kb`}
                      </div>
                    </div>
                    <br />
                    <div
                      className='btn btn-file-upload-clear'
                      onClick={this.clearFileUpload}
                    >
                      <i className='fas fa-times'></i> Clear File
                    </div>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>
    );
  }
}


class Range extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      value: [props.data.min_value, props.defaultValue || props.data.default_value],
    };
  }

  changeValue = (value) => {
    this.setState({ value });
  };

  render() {
    const { data, mutable, read_only, style } = this.props;
    const name = data.field_name;
    // debugger
    const sliderProps = {
      min: data.min_value,
      max: data.max_value,
      step: data.step,
      value: this.state.value,
      onInput: this.changeValue,
      thumbsDisabled: [true, false],
      rangeSlideDisabled: true,
      disabled: read_only,
    };

    if (mutable) {
      // sliderProps.ref = this.inputField;
      // sliderProps.ref = this.props.defaultValue;

      if (this.props.read_only) {
        sliderProps.value = this.props.defaultValue;
      } else {
        sliderProps.ref = this.inputField;
      }
      // if (this.props.defaultValue && this.props.defaultValue.length > 0) {
      //   sliderProps.value = this.props.defaultValue;
      // } else {
      //   sliderProps.ref = this.inputField;
      // }
    }

    const datalist = [];
    for (let i = parseInt(data.min_value, 10); i <= parseInt(data.max_value, 10); i += parseInt(data.step, 10)) {
      datalist.push(i);
    }

    const oneBig = 100 / (datalist.length - 1);

    const visible_marks = datalist.map((d, idx) => {
      const option_props = {};
      let w = oneBig;
      if (idx === 0 || idx === datalist.length - 1) { w = oneBig / 2; }
      option_props.key = `${name}_label_${idx}`;
      option_props.style = { width: `${w}%` };
      if (idx === datalist.length - 1) { option_props.style = { width: `${w}%`, textAlign: 'right' }; }
      return <label onClick={() => this.changeValue([this.state.value[0], d])} {...option_props}>{d}</label>;
    });

    let baseClasses = "SortableItem rfb-item";
    if (data.pageBreakBefore) { baseClasses += " alwaysbreak"; }

    return (
      <div style={{ ...style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div className="range">
            <div className="clearfix">
              <span className="float-left">{data.min_label}</span>
              <span className="float-right">{data.max_label}</span>
            </div>
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <RangeSlider {...sliderProps} />
            </div>
          </div>
          <div className="visible_marks">
            {visible_marks}
          </div>
          <input name={name} value={this.state.value[1]} type="hidden" />
          <datalist id={`tickmarks_${name}`}>
            {datalist.map((d, idx) => <option key={`${name}_option_${idx}`}>{d}</option>)}
          </datalist>
        </div>
      </div>
    );
  }
}

FormElements.Header = Header;
FormElements.Paragraph = Paragraph;
FormElements.Label = Label;
FormElements.LineBreak = LineBreak;
FormElements.TextInput = TextInput;
FormElements.EmailInput = EmailInput;
FormElements.PhoneNumber = PhoneNumber;
FormElements.NumberInput = NumberInput;
FormElements.TextArea = TextArea;
FormElements.Dropdown = Dropdown;
FormElements.Signature = Signature;
FormElements.Checkboxes = Checkboxes;
FormElements.DatePicker = DatePicker;
FormElements.RadioButtons = RadioButtons;
FormElements.Image = Image;
FormElements.Rating = Rating;
FormElements.Tags = Tags;
FormElements.HyperLink = HyperLink;
FormElements.Download = Download;
FormElements.Camera = Camera;
FormElements.FileUpload = FileUpload;
FormElements.Range = Range;

export default FormElements;
