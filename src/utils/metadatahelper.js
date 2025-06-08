import Swal from 'sweetalert2';
import * as API from './API';

//Approval metaData helpers
const file_type_mapping = {
    'pdf': 'PDF Document',
    'doc': 'Microsoft Word Document',
    'docx': 'Microsoft Word Document',
    'xls': 'Microsoft Excel Spreadsheet',
    'xlsx': 'Microsoft Excel Spreadsheet',
    'ods': 'OpenDocument Spreadsheet (Ubuntu)',
    'odt': 'OpenDocument Text (Ubuntu)',
    'csv': 'CSV File',
    'ppt': 'Microsoft PowerPoint Presentation',
    'pptx': 'Microsoft PowerPoint Presentation',
    'txt': 'Text File',
    'rtf': 'Rich Text Format',
    'html': 'HTML File',
    'jpg': 'Image File',
    'jpeg': 'Image File',
    'png': 'Image File',
    'gif': 'Image File',
    'bmp': 'Image File',
    'tif': 'Image File',
    'tiff': 'Image File',
    'webp': 'Image File',
    'svg': 'SVG Image File',
    'mp4': 'Video File',
    'avi': 'Video File',
    'mov': 'Video File',
    'mkv': 'Video File',
    'wmv': 'Video File',
    'flv': 'Video File',
    'webm': 'Video File',
    'mp3': 'Audio File',
    'wav': 'Audio File',
    'ogg': 'Audio File',
    'flac': 'Audio File',
    'aac': 'Audio File',
    'm4a': 'Audio File',
    'wma': 'Audio File',
    'opus': 'Audio File',
    'aiff': 'Audio File',
    'alac': 'Audio File',
    'ogg': 'Audio File',
    'm4v': 'Video File'
}

async function isFileTypeSupported(ext) {

    let issupport = file_type_mapping[ext] || "Unknown type"
    if (issupport == "Unknown type") {
        return false
    }
    else {
        return true
    }
}

const showMetadataInfo = async (supported, nonsupported, notOwner) => {
    const buildFileListWithTooltip = (files, labelId) => {
        const firstTwo = files?.slice(0, 2);
        const extra = files?.length > 2 ? files.slice(2) : [];

        const listItems = firstTwo?.map(f => `<li>${f.name}</li>`).join('');

        const tooltipSpan = extra?.length
            ? `<span id="${labelId}" style="text-decoration: underline; cursor: pointer; display: inline-block; margin-top: 4px;">+${extra.length} more</span>`
            : '';

        return `
            <ul style="text-align: left; padding-left: 1.25rem; margin-bottom: 0;">
              ${listItems}
            </ul>
            ${tooltipSpan}
          `;
    };

    // ${supported?.length > 0 ? `<p style="margin-top: 1rem;"><strong>Supported Files:</strong></p>${buildFileListWithTooltip(supported, 'supported-more')}` : ''}
    const result = await Swal.fire({
        icon: 'info',
        title: 'Supported File Types',
        html: `
            <p>We will automatically extract metadata for the following document types:</p>
            <ul style="text-align: left; padding-left: 1.25rem;">
              <li><strong>Word</strong> (.doc, .docx)</li>
              <li><strong>Excel</strong> (.xls, .xlsx)</li>
              <li><strong>PDF</strong> (.pdf)</li>
              <li><strong>PowerPoint</strong> (.ppt, .pptx)</li>
              <li><strong>Video files</strong> (.mp4, .avi, .mov, etc.)</li>
            </ul>
            <p style="margin-top: 1rem;">For other file types, you will need to enter metadata manually.</p>
      
             ${nonsupported?.length > 0 ? `<p style="margin-top: 1rem;"><strong>Unsupported Files:</strong></p>${buildFileListWithTooltip(nonsupported, 'nonsupported-more')}` : ''}
             ${notOwner?.length > 0 ? `<p style="margin-top: 1rem;"><strong>Ownership restriction:</strong></p>${buildFileListWithTooltip(notOwner, 'notOwner-more')}` : ''}
          `,
        confirmButtonText: 'Okay',
        didOpen: () => {
            const setupTippy = async (id, extraFiles) => {
                const { default: tippy } = await import('tippy.js');

                const el = document.getElementById(id);
                if (el && extraFiles.length) {
                    tippy(el, {
                        content: extraFiles.map(f => f.name).join(', '),
                        placement: 'bottom',
                        maxWidth: 400,
                        allowHTML: true,
                    });
                }
            };

            setupTippy('supported-more', supported?.slice(2));
            setupTippy('nonsupported-more', nonsupported?.slice(2));
            setupTippy('notOwner-more', notOwner?.slice(2));

        },
    });

    return result?.isConfirmed;
};

const showGenerateMetadata = async (items) => {
    const supported = []
    const nonsupported = []
    const notOwner = []

    console.log(items, "items")
    const decideSupport = async (item) => {
        const isSupported = await isFileTypeSupported(item?.fileType)
        if (isSupported) supported.push(item)
        else nonsupported.push(item)
    }

    debugger
    for (const item of items) {
        const { type, createdBy } = item || {}

        if (createdBy != localStorage.getItem('userId')) {
            notOwner.push(item)
            continue;
        }

        if (type == "file") {
            await decideSupport(item)
        }
        else if (type == "folder") {
            const fulldata = await fetchFolderListRecursion(item)
            const hasFiles = fulldata?.files?.length > 0
            const hasForms = fulldata?.forms?.length > 0


            if (hasFiles) {
                for await (let fileItem of fulldata?.files) {
                    await decideSupport(fileItem)
                }
            }
            if (hasForms) {
                for await (let formItem of fulldata?.forms) {
                    nonsupported.push(formItem)
                }
            }
        }
        else if (type == "form") {
            nonsupported.push(item)
        }
        else {
            nonsupported.push(item)
        }
    }

    return { supported, nonsupported, notOwner }
}

async function extractFilesAndForms(folders) {
    let files = []
    let forms = []

    function traverse(folder) {
        if (folder.data) {
            if (folder.data.files) {
                files.push(...folder.data.files.map(file => ({ ...file, type: "file" })))
            }
            if (folder.data.forms) {
                forms.push(...folder.data.forms.map(form => ({ ...form, type: "form" })))
            }
        }
        if (folder.children && folder.children.length > 0) {
            folder.children.forEach(traverse)
        }
    }

    folders.forEach(traverse)
    return { files, forms }
}

const fetchFolderListRecursion = async (item) => {
    var childResponse = await API.getChildLevelsForFolders([item])
    var { status, data } = childResponse

    if (status) {
        var fulldata = await extractFilesAndForms(data)
        return fulldata
    }
    return fulldata || []
}

export {
    isFileTypeSupported,
    showMetadataInfo,
    showGenerateMetadata,
    extractFilesAndForms,
    fetchFolderListRecursion
}