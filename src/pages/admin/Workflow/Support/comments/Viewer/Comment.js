import { useDispatch } from "react-redux";
import { UserAvatar } from "../../../../../../components/Component";
import { userTimezone } from "../../../../../../utils/Utils";
import CommentForm from "../CommentForm";
import { updateLoaderFlag } from "../../../../../../redux/folderSlice";
// import { formatdate } from "../../../../../customHooks/helper";
import * as API from "../../../../../../utils/API";

const Comment = ({
    historyId,
    fileId,
    type,
    comment,
    replies,
    setActiveComment,
    activeComment,
    updateComment,
    deleteComment,
    addComment,
    parentId = null,
    currentUserId,
}) => {
    const isEditing =
        activeComment &&
        activeComment.id === comment.id &&
        activeComment.type === "editing";
    const isReplying =
        activeComment &&
        activeComment.id === comment.id &&
        activeComment.type === "replying";
    const fiveMinutes = 300000;
    const timePassed = new Date() - new Date(comment.createdAt) > fiveMinutes;
    const canDelete =
        currentUserId === comment.userId && replies.length === 0 && !timePassed;
    const canReply = Boolean(currentUserId);
    const canEdit = currentUserId === comment.userId && !timePassed;
    const replyId = parentId ? parentId : comment.id;
    const createdAt = userTimezone(comment.createdAt.toString()) //new Date(comment.createdAt).toLocaleDateString();

    const userDetails = JSON.parse(localStorage.getItem('user'));

    const dispatch = useDispatch()

    const commentFileDownload = async (e, file) => {

        e.preventDefault()

        // dispatch(updateLoaderFlag({ loader: true, text: 'downloading File' }))
        dispatch(setDownloadFileAction([{ file: `commentsDownload-${historyId}-${type}-${fileId}-${JSON.stringify(file)}`, folder: [], fileName: file['fileName'], extension: file['ext'], APIType: 'fileDownloadAPI', type: "single" }]))
        // await API.downloadedFile(`commentsDownload-${historyId}-${type}-${fileId}-${JSON.stringify(file)}`, file['fileName'], file["contentType"], file['ext'])
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

console.log('tester',userDetails);
    return (
        <div key={comment.id} className="comment">
            <div className="comment-image-container">
                <div className="d-flex align-items-center fs-3 btn btn-primary justify-content-center text-white rounded-circle fw-bold usericon">
                    <UserAvatar image={comment?.imgUrl} theme="primary" text={comment.userName[0].toUpperCase()} />
                </div>
            </div>
            <div className="comment-right-part">
                <div className="comment-content">
                    <div className="comment-author">{comment.userName}</div>
                    <div className="createdat">{createdAt}</div>
                </div>
                {!isEditing &&
                    <div className="comment-text">
                        {comment.body}
                        {comment.file.map(file => (
                            <div className='comment-file'>
                                {/* <a href={file} target="_blank" className="comment-filename" rel="noopener noreferrer"> */}
                                <span onClick={(e) => commentFileDownload(e, file)} style={{ cursor: "pointer" }}>
                                    <i class="bi bi-file-earmark-arrow-down"></i>&nbsp;
                                    {file['fileName']}
                                </span>
                                {/* </a> */}
                            </div>
                        ))}
                    </div>
                }
                {isEditing && (
                    <CommentForm
                        submitLabel="Update"
                        hasCancelButton
                        initialText={comment.body}
                        handleSubmit={(text, file, stepId) => updateComment(text, comment.id, file, stepId)}
                        handleCancel={() => {
                            setActiveComment(null);
                        }}
                    />
                )}
                <div className="comment-actions">
                    {/* {canReply && (
                        <div
                            className="comment-action"
                            onClick={() =>
                                setActiveComment({ id: comment.id, type: "replying" })
                            }
                        >
                            Reply
                        </div>
                    )} */}
                    {/* {canEdit && (
                        <div
                            className="comment-action"
                            onClick={() =>
                                setActiveComment({ id: comment.id, type: "editing" })
                            }
                        >
                            Edit
                        </div>
                    )} */}
                    {/* {canDelete && (
                        <div
                            className="comment-action"
                            onClick={() => deleteComment(comment.id)}
                        >
                            Delete
                        </div>
                    )} */}
                </div>
                {isReplying && (
                    <CommentForm
                        submitLabel="Reply"
                        handleSubmit={(text, file, stepId) => addComment(text, replyId, file, stepId)}
                    />
                )}
                {replies.length > 0 && (
                    <div className="replies">
                        {replies.map((reply) => (
                            <Comment
                                comment={reply}
                                key={reply.id}
                                setActiveComment={setActiveComment}
                                activeComment={activeComment}
                                updateComment={updateComment}
                                deleteComment={deleteComment}
                                addComment={addComment}
                                parentId={comment.id}
                                replies={[]}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;
