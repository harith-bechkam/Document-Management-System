export const createComment = async (text, parentId = null, file,stepId) => {
    return {
        id: Math.random().toString(36).substring(2, 9),
        body: text,
        parentId,
        file,
        stepId,
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        createdAt: new Date().toISOString(),
    }
}

export const updateComment = async (text, file,stepId) => {
    return { text, file,stepId };
};

export const deleteComment = async () => {
    return {};
};
