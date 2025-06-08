import { useState, useRef } from "react";
// import ReactQuill from 'react-quilljs';
// import 'react-quill/dist/quill.snow.css';
import { Uploader, Button } from "rsuite";
// import { Button } from "../../../../../components/Component";


const CommentForm = ({
  handleSubmit,
  submitLabel,
  hasCancelButton = false,
  handleCancel,
  initialText = "",
  historyId,
  fileId,
  type

}) => {
  const [text, setText] = useState(initialText);
  // const [value, setValue] = useState('');
  const [file, setFile] = useState([]);
  const [save, setSave] = useState([])

  // let file = useRef([])

  const isTextareaDisabled = text.length === 0;

  const URL = process.env.REACT_APP_BE_URL
  const apiURL = `${URL}/workflow/comments/uploadfile?historyId=${historyId}&fileId=${fileId}&type=${type}`


  const onSubmit = (event) => {
    event.preventDefault();
    submitLabel == 'Post' ? handleSubmit(text, null, save) : handleSubmit(text, save);
    setText("");
    setFile([])
    setSave([])
  };
  const uploadBtn = 'Upload files...'
  // const fileList = []

  // const handlefile = async (e) => {
  //   const form = new FormData();


  //   for (var i = 0; i < e.target.files.length; i++) {
  //     form.append('files', e.target.files[i])
  //   }

  //   await axios.post(`${URL}/upload/uploadfile`, form)
  //     .then(res => {
  //       file.current = res.data.url
  //     })
  //     .catch(err => {
  //       console.log(err, "err")
  //     })

  // }

  const token = localStorage.getItem('accessToken');
  const workspace_id = localStorage.getItem('workspace_id');

  return (
    <>
      <form onSubmit={onSubmit}>
        <textarea
          className="comment-form-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* <input type='file' multiple onChange={handlefile} /> */}

        {/* <div className="d-flex align-items-end gap-3 mt-4"> */}
        <Uploader
          listType="picture-text"
          fileList={file}
          action={apiURL}
          multiple={true}
          onChange={setFile}
          onSuccess={(response, file) => {
            // const res = `${URL}/${response?.url}`
            setSave(save => [...save, response?.url])
          }}
          headers={{
            Authorization: `Bearer ${token} ${workspace_id}`,
          }}
        >
          <Button>Upload files...</Button>
          {/* <Button className="btn-dim" color="light">{uploadBtn}</Button> */}
        </Uploader>
        <button className="comment-form-button" disabled={isTextareaDisabled}>
          {submitLabel}
        </button>
        {/* <Button className="btn-dim" color="light" disabled={isTextareaDisabled}>{submitLabel}</Button> */}

        {/* </div> */}

        {hasCancelButton && (
          <button
            type="button"
            className="comment-form-button comment-form-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          // <Button className="btn-dim mt-2" color="light" onClick={handleCancel}>Cancel</Button>

        )}
      </form>
      {/* <ReactQuill theme="snow" value={value} onChange={setValue} />; */}

    </>
  );
};

export default CommentForm;
