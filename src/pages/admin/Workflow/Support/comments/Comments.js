import { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import ViewerComment from "./Viewer/Comment";

import {
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
} from "../api";
import { useDispatch, useSelector } from "react-redux";
// import { getcommentfields, savesupport, updateGroupComment } from "../../../store/action";
import { useParams, useLocation } from "react-router-dom";

const Comments = ({ currentUserId, data, setdata, stepId, fileId, historyId, op, type }) => {
  const [activeComment, setActiveComment] = useState(null);

  // const dispatch = useDispatch();
  // const location = useLocation();
  // const paramsdata = useParams();
  // const opData = op == 'Viewer';

  const rootComments = data.filter(
    (backendComment) => backendComment.parentId === null
  )

  const getReplies = (commentId) =>
    data
      .filter((backendComment) => backendComment.parentId === commentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

  const addComment = (text, parentId, file) => {
    createCommentApi(text, parentId, file, stepId).then((comment) => {
      // setBackendComments([comment, ...data]);
      setdata([comment, ...data])
      setActiveComment(null);
    });
  };

  const updateComment = (text, commentId, file, stepId) => {
    updateCommentApi(text, file).then(() => {
      const updatedBackendComments = data.map((backendComment) => {
        if (backendComment.id === commentId) {
          return { ...backendComment, body: text, file, stepId };
        }
        return backendComment;
      });
      // setBackendComments(updatedBackendComments);
      setdata(updatedBackendComments)
      setActiveComment(null);
    });
  };

  const deleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to remove comment?")) {
      deleteCommentApi().then(() => {
        const updatedBackendComments = data.filter(
          (backendComment) => backendComment.id !== commentId
        );
        // setBackendComments(updatedBackendComments);
        setdata(updatedBackendComments)
      });
    }
  };

  useEffect(() => {
    // getCommentsApi().then((data) => {
    //   setBackendComments(data);
    // });
    // setBackendComments([]);
    // setdata([])
  }, []);


  return (
    <div className="comments">

      {op != 'Viewer' &&
        <>
          <div className="comment-form-title">Write comments</div>
          <CommentForm submitLabel="Post" handleSubmit={addComment} fileId={fileId} historyId={historyId} type={type} />
        </>
      }
      {op == 'Viewer' && <div className="comment-form-title">View comments</div>}
      <div className="comments-container">
        {op == 'Viewer' ?
          <>
            {rootComments.map((rootComment) => (
              <ViewerComment
                historyId={historyId}
                fileId={fileId}
                type={type}
                key={rootComment.id}
                comment={rootComment}
                replies={getReplies(rootComment.id)}
                activeComment={activeComment}
                setActiveComment={setActiveComment}
                addComment={addComment}
                deleteComment={deleteComment}
                updateComment={updateComment}
                currentUserId={currentUserId}
              />
            ))}
          </>
          :
          <>
            {rootComments.map((rootComment) => (
              <Comment
                historyId={historyId}
                fileId={fileId}
                type={type}
                key={rootComment.id}
                comment={rootComment}
                replies={getReplies(rootComment.id)}
                activeComment={activeComment}
                setActiveComment={setActiveComment}
                addComment={addComment}
                deleteComment={deleteComment}
                updateComment={updateComment}
                currentUserId={currentUserId}
              />
            ))}
          </>
        }

      </div>
    </div>
  );
};

export default Comments;
