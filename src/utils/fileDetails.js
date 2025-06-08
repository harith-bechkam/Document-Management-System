import { files } from "../pages/app/file-manager/Data";

export default function incomingFile(file,icon=false,type=false){
    const fileExtension = file.split('.').pop();
    const fileData = files.find(f => f.ext === fileExtension);

    if (!fileData) {
        return null; 
    }

    if (icon) {
        return fileData.icon;
    }

    if (type) {
        return fileData.type;
    }

    return null;    
}

export const formatFileSize =(bytes) => {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        const sizeInKB = (bytes / 1024).toFixed(2);
        return `${sizeInKB} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        const sizeInMB = (bytes / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
    } else {
        const sizeInGB = (bytes / (1024 * 1024 * 1024)).toFixed(2);
        return `${sizeInGB} GB`;
    }
}
