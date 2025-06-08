import { createSlice } from '@reduxjs/toolkit';
import { fi } from 'date-fns/locale';
import axios from 'axios';

const initialState = {
    navigation: [
        {
            id: 0,
            text: "Recent Files",
            icon: "home-alt",
            link: "/home",
            selected: false
        },
        {
            id: 1,
            text: "Starred",
            icon: "star",
            link: "/starred",
            selected: false
        },
        {
            id: 2,
            text: "Shared With Me",
            icon: "share-alt",
            link: "/shared",
            selected: false
        },
        {
            id: 3,
            text: "Recovery",
            icon: "trash",
            link: "/recovery",
            selected: false
        },
        {
            id: 4,
            text: "Folder Tree",
            icon: "tree-structure-fill",
            link: "/foldertree",
            selected: false
        }
    ],
    myworkspace: [],
    userStorage: '',
    appFeatures: {},


    customMetaData: [],

    searchPagination: {
        currentPage: 1,
        perPage: 10,
        totalCount: 0
    },

    formBuilderId: '',
    formBuilderjson: [],

    //normal Loader -> we can use it for all pages if need
    loader: false,
    loaderText: "",
    downloadLoader: false,
    downloadLoaderText: "",


    folders: [],
    currentSection: '',
    fileRepo: [],
    starredRepo: [],
    recentRepo: [],
    trashRepo: [],
    sharedRepo: [],
    accessedDrive: {},
    currentDirectory: [],
    moveFlag: false,
    docLoaderFlag: false,
    asideFlag: false,
    folderName: '',
    sharedDocumentsAccessed: '',
    formSubmitted: false,
    profileUpdate: false,
    documentUrl: '',
    //WORKFLOW
    currClickedItem: null,
    selectedModule: 'accessOverview',
    notifyData:null,


    //SEARCH
    disableModal: false,
    filterEnabledInSearchModal: '',
    search: '',
    searchCurrentDirectory: [],
    myHierarchy: [],
    myHierarchyIDs: [],
    joyridestate: null,
    inlineAddWorkflow: false,
    inlineWorkflowCreated: {},
    inlineEditWorkflow: {},
    inheritSaveCurrentDirectory: '',
    inheritWorflowNavigate: '',
    workflowCloned: {},
    viewSingleWorkflow: {},
    inlineFormModalOpened: false,
    inlineAddFormTemplateClicked: false,
    inlineEditFormTemplateClicked: false,
    inlineEditFormTemplate: {},
    formData: null,
    inlineFormCreated: {},
    inlineFormEdited: {},
    inlineFormChosen: {},
    inlineSingleFormView: {},
    openGraphArgs: {},
};

const icons = [
    {
        ext: 'ts',
        icon: 'fileCode',
    },
    {
        ext: 'tsx',
        icon: 'fileCode',
    },
    {
        ext: 'zip',
        icon: 'fileZip',
    },
    {
        ext: 'xlsx',
        icon: 'fileSheet'
    },
    {
        ext: 'xls',
        icon: 'fileSheet'
    },
    {
        ext: 'doc',
        icon: 'fileDoc'
    },
    {
        ext: 'docx',
        icon: 'fileDoc'
    },
    {
        ext: 'txt',
        icon: 'fileText'
    },
    {
        ext: 'psd',
        icon: 'fileMedia'
    },
    {
        ext: 'mp4',
        icon: 'fileMovie'
    },
    {
        ext: 'ppt',
        icon: 'filePPT'
    },
    // {
    //     ext: 'html',
    //     icon: 'html5',
    // },
    {
        ext: 'js',
        icon: 'fileJS',
    },
    {
        ext: 'json',
        icon: 'fileCode'
    },
    {
        ext: 'pdf',
        icon: 'filePDF'
    },
    {
        ext: 'pptx',
        icon: 'filePPT'
    },
    {
        ext: 'mp3',
        icon: 'fileMusic'
    },
    {
        ext: 'jpeg',
        icon: 'fileMedia'
    },
    {
        ext: 'jpg',
        icon: 'fileMedia'
    }, {
        ext: 'png',
        icon: 'fileMedia'
    }, {
        ext: 'py',
        icon: 'filePython'
    }, {
        ext: 'java',
        icon: 'fileJava'
    }, {
        ext: 'css',
        icon: 'fileHTML'
    }, {
        ext: 'ts',
        icon: 'fileJS'
    }, {
        ext: 'html',
        icon: 'fileHTML'
    }, {
        ext: 'pdfShortcut',
        icon: 'Shortcut'
    }, {
        ext: 'csv',
        icon: 'fileCSV'
    }
]

const folderSlice = createSlice({
    name: 'folders',
    initialState,
    reducers: {

        saveCustomMetaList: (state, action) => {
            state.customMetaData = action.payload
        },
        saveformBuilderId: (state, action) => {
            state.formBuilderId = action.payload
        },
        saveformBuilderjson: (state, action) => {
            state.formBuilderjson = action.payload
        },
        updateDocumentUrl: (state, action) => {
            if (action.payload.status == 'append') {
                state.documentUrl = action.payload.link;
            } else if (action.payload.status == 'remove') {
                state.documentUrl = '';
            }
        },
        saveCurrentSection: (state, action) => {
            state.currentSection = action.payload
        },

        createSection: (state, action) => {
            const uid = action.payload.id
            const newSection = {
                id: uid,
                text: action.payload.name,
                icon: 'folder-fill',
                type: 'section',
                link: `/section/${uid}`,
                deleted: false
            }
            state.navigation.push(newSection);
        },

        setmyworkspaceinfo: (state, action) => {
            let { data } = action.payload
            state.myworkspace = data
        },

        getAllSections: (state, action) => {

            const pathname = window.location.hash;

            let { sections } = action.payload

            sections.forEach(item => {
                if (!state.navigation.find(sect => sect.id == item['_id']))
                    state.navigation.push({
                        id: item['_id'],
                        text: item['sectionName'],
                        icon: 'folder-fill',
                        type: 'section',
                        link: `/section/${item['_id']}`,
                        deleted: false,
                        selected: pathname == `#/section/${item['_id']}`
                    })
            })


        },

        setFiles: (state, action) => {

            for (let file of action.payload.files) {
                file['starredDisplay'] = file.starredWith['users'].some(item => item == localStorage.getItem('userId'))
                // debugger
                const hasSectionId = 'sectionId' in file;
                const hasFolderId = 'folderId' in file;
                file['type'] = (hasSectionId && hasFolderId) ? 'file' : 'folder'
                if (file['type'] == 'folder') {
                    file['icon'] = 'folder'
                }
                else {
                    let iconIdx = icons.findIndex(item => item.ext == file.fileType)
                    // file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
                    file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileUnknown"
                }
            }
            // state.fileRepo = action.payload
            if (action.payload.location == 'recovery') {
                // state.trashRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.trashRepo = action.payload.files;
            } else if (action.payload.location == 'starred') {
                // state.starredRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                state.starredRepo = action.payload.files;
            }
            else if (action.payload.location == 'shared') {
                // state.sharedRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published")).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.sharedRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published"));
            }
            else if (action.payload.location == 'home') {
                // state.recentRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId'))).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.recentRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId')));
            } else {
                // state.fileRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId'))).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.fileRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId')));
            }
        },

        addNewFile: function (state, action) {

            let file = action.payload
            file['starredDisplay'] = file.starredWith['users'].some(item => item == localStorage.getItem('userId'))

            const hasSectionId = 'sectionId' in file;
            const hasFolderId = 'folderId' in file;

            //FORM
            if (file?.['type'] == 'Single Submission' || file?.['type'] == 'Multiple Submission') {
                file['responseType'] = file?.['type']
                file['type'] = 'form'
                file['icon'] = 'googleFORM'
                state.fileRepo = [...state.fileRepo, file]
                return
            }

            file['type'] = (hasSectionId && hasFolderId) ? 'file' : 'folder'

            if (file['type'] == 'folder') {
                file['icon'] = 'folder'
            }
            else {
                let iconIdx = icons.findIndex(item => item.ext == file.fileType)
                file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileUnknown"
            }
            let sortBy = localStorage.getItem('sortBy');
            let sortOrder = localStorage.getItem('sortOrder');
            if (!sortBy) {
                sortBy = 'createdAt';
            }
            if (!sortOrder) {
                sortOrder = 'desc';
            }
            let arr = JSON.parse(JSON.stringify(state.fileRepo))
            console.log(arr, 'file', file)
            const checkIfFileExist = arr.filter(val => val._id == file._id);
            if (checkIfFileExist.length > 0) {
                //do nothing
            } else {
                arr = [file, ...arr]
                if (sortBy === 'name' && sortOrder === 'asc') {
                    arr.sort((a, b) => {
                        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                    });
                }

                if (sortBy === 'name' && sortOrder === 'desc') {
                    arr.sort((a, b) => {
                        if (a.name.toLowerCase() < b.name.toLowerCase()) return 1;
                        if (a.name.toLowerCase() > b.name.toLowerCase()) return -1;
                        return 0;
                    });
                }

                if (sortBy === 'createdAt' && sortOrder === 'asc') {
                    arr.sort((a, b) => {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    });
                }

                if (sortBy === 'createdAt' && sortOrder === 'desc') {
                    arr.sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                }
                state.fileRepo = arr;
            }

            // state.fileRepo = [file, ...state.fileRepo]
        },

        toggleStarred: function (state, action) {
            let { index, userisPresent, file } = action.payload
            let currentFile = file
            if (userisPresent) {
                // debugger
                // state.starredRepo[index]['starredWith']['users'].shift()

                const toggledFile = state.starredRepo.find(val => val._id == currentFile._id);



                // let strepo = [...state.starredRepo];
                // let filerepo = [...state.fileRepo]

                // strepo[index]['starredDisplay'] = "abc";
                // filerepo[index]['starredDisplay'] = "abc"

                // state.starredRepo = strepo
                // state.fileRepo = filerepo
                const toggledFileIndex = state.starredRepo.findIndex(val => val._id === currentFile._id);
                const toggledFileRepoIndex = state.fileRepo.findIndex(val => val._id === currentFile._id);
                const toggledSharedRepoIndex = state.sharedRepo.findIndex(val => val._id === currentFile._id);

                // if (toggledFileIndex != -1) {
                //     let strepo = [...state.starredRepo];
                //     let filerepo = [...state.fileRepo];

                //     strepo[toggledFileIndex]['starredDisplay'] = false;
                //     filerepo[toggledFileRepoIndex]['starredDisplay'] = false;

                //     state.starredRepo = strepo;
                //     state.fileRepo = filerepo;
                // }

                if (toggledFileIndex !== -1) {
                    let strepo = [...state.starredRepo];
                    let filerepo = [...state.fileRepo];
                    let sharerepo = [...state.sharedRepo];

                    if (toggledFileIndex !== -1) {
                        strepo[toggledFileIndex].starredDisplay = false;
                    }
                    if (toggledFileRepoIndex !== -1) {
                        filerepo[toggledFileRepoIndex].starredDisplay = false;
                    }
                    if (toggledSharedRepoIndex !== -1) {
                        sharerepo[toggledSharedRepoIndex].starredDisplay = false;
                    }

                    state.starredRepo = strepo;
                    state.fileRepo = filerepo;
                    state.sharedRepo = sharerepo;
                }


            }
            else {
                // debugger

                let starredUsers = [localStorage.getItem('userId'), ...currentFile.starredWith.users]; // Prepend userId

                let updatedFile = {
                    ...currentFile,
                    starredWith: { users: starredUsers },
                    starredDisplay: true
                };
                state.starredRepo.push(updatedFile);

                const updatedFileRepo = state.fileRepo.map(file =>
                    file._id === updatedFile._id ? updatedFile : file
                );
                const updatedSharedRepo = state.sharedRepo.map(file =>
                    file._id === updatedFile._id ? updatedFile : file
                );
                state.fileRepo = updatedFileRepo;
                state.sharedRepo = updatedSharedRepo;
                // debugger
            }
        },


        addFolderName: function (state, action) {
            state.folderName = action.payload
        },

        setDocuments: (state, action) => {
            // for (let file of action.payload.files) {

            //     //FILE
            //     if (file.hasOwnProperty('fileSize') && file.hasOwnProperty('fileType')) {
            //         file['type'] = 'file'
            //         let iconIdx = icons.findIndex(item => item.ext == file.fileType)
            //         file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
            //     }

            //     //FORM
            //     else if (file?.['type'] == 'Single Submission' || file?.['type'] == 'Multiple Submission') {
            //         file['responseType'] = file?.['type']
            //         file['type'] = 'form'
            //         file['icon'] = 'googleFORM'
            //     }

            //     //FOLDER
            //     else if (file.hasOwnProperty('sectionId') && file.hasOwnProperty('parentId')) {
            //         file['type'] = 'folder'
            //         file['icon'] = 'folder'
            //     }

            //     //DIFFERNET TYPE DETECTED
            //     else {
            //         file['type'] = 'file'
            //         file['icon'] = 'fileDoc'
            //     }

            // }

            for (let file of action.payload.files) {
                if (file.starredWith?.users?.includes(localStorage.getItem('userId'))) {
                    file["starredDisplay"] = true
                } else {
                    file["starredDisplay"] = false
                }
                if (file["name"]?.includes('.')) {
                    if (file.hasOwnProperty('fileSize')) {
                        file['type'] = 'file'
                    } else if (file.hasOwnProperty('templateId')) {
                        file['type'] = 'form'
                    } else {
                        file['type'] = 'folder'
                    }
                }
                //FORM
                else if (file?.['type'] == 'Single Submission' || file?.['type'] == 'Multiple Submission') {
                    // debugger
                    file['responseType'] = file?.['type']
                    file['type'] = 'form'
                }
                else if (file.hasOwnProperty('sectionName')) {
                    file['type'] = 'section';
                }
                else if (file.hasOwnProperty('destinationInfo')) {
                    file['type'] = 'shortcut';
                }
                else if (file['type'] == 'form') {
                    file['type'] = 'form';
                }
                else {
                    // debugger
                    file['type'] = 'folder'
                }

                if (file['type'] == 'folder') {
                    file['icon'] = 'folder'
                }
                else if (file['type'] == 'section') {
                    file['icon'] = 'folder'
                }
                //FORM
                else if (file['type'] == 'form') {
                    file['icon'] = 'googleFORM'
                }
                // else if (file['isShortcut']) {
                //     if (file['type'] == 'file') {
                //         let extension = `${file.fileType}Shortcut`
                //         let iconIdx = icons.findIndex(item => item.ext == extension)
                //         file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
                //     }else if (file['type'] == 'folder') {
                //         file['icon'] = 'folderShortcut'
                //     }
                // }
                else {
                    let iconIdx = icons.findIndex(item => item.ext == file.fileType)
                    // file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
                    file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
                }
            }

            if (action.payload.location == 'recovery') {
                // state.trashRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.trashRepo = action.payload.files;
            } else if (action.payload.location == 'starred') {
                // state.starredRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                state.starredRepo = action.payload.files;
            }
            else if (action.payload.location == 'shared') {
                // state.sharedRepo = action.payload.files.filter(item => (item['type'] == 'file' || item['viewStatus'] == "Published")).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                // state.sharedRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.sharedRepo = action.payload.files;
            }
            else if (action.payload.location == 'home') {
                // state.recentRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId'))).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                // state.recentRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.recentRepo = action.payload.files;

            } else {
                // state.fileRepo = action.payload.files.filter(item => (item['type'] == 'folder' || item['viewStatus'] == "Published" || item['createdBy'] == localStorage.getItem('userId'))).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                // state.fileRepo = action.payload.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                state.fileRepo = action.payload.files;

            }
        },


        createSubFolder: (state, action) => {
            const newFolder = {
                id: action.payload.id,
                name: action.payload.name,
                parentId: action.payload.parent,
                parentName: action.payload.parentName,
                owner: action.payload.owner,
                ownerName: action.payload.ownerName,
                ext: action.payload.ext,
                icon: action.payload.icon,
                time: action.payload.createdAt.slice(12),
                date: action.payload.createdAt.slice(0, 11),
                meta: action.payload.meta,
                createdAt: action.payload.createdAt,
                size: 41.5,
                type: action.payload.type,
                starred: false,
                access: ['uid001', 'uid003', 'uid004', 'uid005'],
                folder: 0,
                isDeleted: false
            };
            state.folders.push(newFolder);
        },

        deleteSubFolder: (state, action) => {
            let selectedFolder = state.folders.find(elem => elem.id == action.payload);
            selectedFolder["deleted"] = true;
        },

        renameFolder: (state, action) => {
            let selectedFolder = state.folders.find(elem => elem.id == action.payload.id);
            selectedFolder["name"] = action.payload.name;
        },

        uploadFolder: (state, action) => {
            action.payload.forEach(elem => {
                state.folders.push(elem);
            })
        },
        resetNavigation: (state, action) => {
            state.navigation = state.navigation.map(elem => ({
                ...elem,
                selected: false
            }))
        },
        updateNavigation: (state, action) => {

            state.navigation?.forEach(item => {
                item.selected = item.id === action.payload.id;
            })
            
        },
        folderMove: (state, action) => {

            const index = state.folders.findIndex(elem => elem.id === action.payload.id);

            if (index === -1) {
                return state;
            }
            const updatedFolder = {
                ...state.folders[index],
                parentId: action.payload.parent,
                parentName: action.payload.parentName[0]
            };

            const updatedFolders = [
                ...state.folders.slice(0, index),
                updatedFolder,
                ...state.folders.slice(index + 1)
            ];

            return {
                ...state,
                folders: updatedFolders
            };
        },

        folderCopy: (state, action) => {
            const newFolder = {
                id: action.payload.id,
                name: action.payload.name,
                parentId: action.payload.parent,
                parentName: action.payload.parentName[0],
                owner: action.payload.owner,
                ownerName: action.payload.ownerName,
                ext: action.payload.ext,
                icon: action.payload.icon,
                time: action.payload.createdAt.slice(12),
                date: action.payload.createdAt.slice(0, 11),
                meta: action.payload.meta,
                createdAt: action.payload.createdAt,
                size: 41.5,
                type: action.payload.type,
                starred: false,
                access: ['uid001', 'uid003', 'uid004', 'uid005'],
                folder: 0,
                isDeleted: false
            };
            state.folders.push(newFolder);
        },
        saveDirectory: (state, action) => {
            state.currentDirectory = action.payload
        },
        updateMoveFlag: (state, action) => {
            state.moveFlag = !state.moveFlag
        },
        updateDocumentLoaderFlag: (state, action) => {
            state.docLoaderFlag = !state.docLoaderFlag
        },
        updateProfileFlag: (state, action) => {
            state.profileUpdate = !state.profileUpdate
        },
        updateLoaderFlag: (state, action) => {
            state.loader = action.payload.loader
            state.loaderText = action.payload.text
        },

        //downlaod
        updateDownloadLoaderFlag: (state, action) => {
            state.downloadLoader = action.payload.loader
            state.downloadLoaderText = action.payload.text
        },

        updateAsideFlag: (state, action) => {
            state.asideFlag = !state.asideFlag
        },
        updateSharedAccessed: (state, action) => {
            state.sharedDocumentsAccessed = action.payload.access
        },
        updateSectionName: (state, action) => {
            const section = state.navigation.find(elem => elem.id == action.payload.id);
            section.text = action.payload.name;
        },
        updateCurrentLocation: (state, action) => {
            state.accessedDrive = action.payload.drive;
        },
        pullSection: (state, action) => {
            state.navigation = state.navigation.filter(elem => elem.id != action.payload.id);
        },
        updateFormSubmit: (state, action) => {
            state.formSubmitted = !state.formSubmitted
        },

        //WORKFLOW
        saveWorkflowCurrClickedItem: (state, action) => {
            state.currClickedItem = action.payload
        },
        updateSelectedModule: (state, action) => {
            state.selectedModule = action.payload
        },
        getUsetStorageData: (state, action) => {
            let { storage } = action.payload
            state.userStorage = { storage }
        },
        setAppFeatures: (state, action) => {
            debugger;
            state.appFeatures = action.payload
        },

        //SEARCH
        disableSearchModal: (state, action) => {
            state.disableModal = true
        },
        saveSearch: (state, action) => {
            state.search = action.payload
        },
        setUpfilterEnabledInSearchModal: (state, action) => {
            let { filter } = action.payload
            state.filterEnabledInSearchModal = filter
        },
        saveSearchPagination: (state, action) => {
            state.searchPagination = action.payload
        },

        //storing breadcrumbs directory path from all other components - it will only work for search modal & when main search page refresh we will use localstorage key
        saveSearchDirectory: (state, action) => {
            state.searchCurrentDirectory = action.payload
        },

        //Not used
        saveMyHierarchy: (state, action) => {
            state.myHierarchy = action.payload
        },
        saveMyHierarchyIDS: (state, action) => {
            state.myHierarchyIDs = action.payload
        },

        //metadata approval
        doesMetaMultiSelectClicked: (state, action) => {
            state.metaApprovalmultiSelectClicked = action.payload
        },
        //notificationData
        notify: (state, action) => {
            state.notifyData = action.payload
        },

        showjoyride: (state, action) => {
            state.joyridestate = action.payload
        },
        triggerInlineAddWorkflow: (state, action) => {
            state.inlineAddWorkflow = action.payload.active
        },
        triggerInlinePrintWorkflow: (state, action) => {
            state.inlineWorkflowCreated["id"] = action.payload.id
            state.inlineWorkflowCreated["name"] = action.payload.name
            state.inlineWorkflowCreated["status"] = action.payload.active
        },
        triggerInlineEditWorkflow: (state, action) => {
            state.inlineEditWorkflow["id"] = action.payload.id
            state.inlineEditWorkflow["name"] = action.payload.name
            state.inlineEditWorkflow["status"] = action.payload.active
        },
        triggerInlineModalNavigate: (state, action) => {
            state.inheritWorflowNavigate = action.payload.link
        },
        triggerCurrentDirectorySave: (state, action) => {
            state.inheritSaveCurrentDirectory = action.payload.location
        },
        triggerWorkflowCloned: (state, action) => {
            state.workflowCloned["status"] = action.payload.active
            state.workflowCloned["id"] = action.payload.id
            state.workflowCloned["name"] = action.payload.name
        },
        triggerSingleWorkflowView: (state, action) => {
            state.viewSingleWorkflow["status"] = action.payload.active
            state.viewSingleWorkflow["id"] = action.payload.id
            state.viewSingleWorkflow["name"] = action.payload.name
        },
        triggerInlineAddFormTemplateClick: (state, action) => {
            state.inlineAddFormTemplateClicked = action.payload.action
        },
        triggerInlineFormClick: (state, action) => {
            state.inlineFormModalOpened = action.payload.action
        },
        triggerInlineEditFormTemplateClick: (state, action) => {
            state.inlineEditFormTemplateClicked = action.payload.active
        },
        storeInlineEditFormTemplate: (state, action) => {
            state.inlineEditFormTemplate["status"] = action.payload.active
            state.inlineEditFormTemplate["id"] = action.payload.id
            state.inlineEditFormTemplate["name"] = action.payload.name
        },
        triggerSetFormData: (state, action) => {
            state.formData = action.payload;
        },
        triggerInlineFormAdded: (state, action) => {
            state.inlineFormCreated["status"] = action.payload.active
            state.inlineFormCreated["id"] = action.payload.id
            state.inlineFormCreated["name"] = action.payload.name
        },
        triggerInlineFormEdited: (state, action) => {
            state.inlineFormEdited["status"] = action.payload.active
            state.inlineFormEdited["id"] = action.payload.id
            state.inlineFormEdited["name"] = action.payload.name
        },
        triggerInlineFormChosen: (state, action) => {
            state.inlineFormChosen["status"] = action.payload.active
            state.inlineFormChosen["id"] = action.payload.id
            state.inlineFormChosen["name"] = action.payload.name
        },
        triggerInlineSingleFormView: (state, action) => {
            state.inlineSingleFormView["status"] = action.payload.active
            state.inlineSingleFormView["id"] = action.payload.id
            state.inlineSingleFormView["name"] = action.payload.name
        },
        triggerOpenGraphArgs: (state, action) => {
            state.openGraphArgs["fileName"] = action.payload.fileName
            state.openGraphArgs["image"] = action.payload.image
            state.openGraphArgs["url"] = action.payload.url
            state.openGraphArgs["type"] = action.payload.type
            state.openGraphArgs["desc"] = action.payload.desc
        }


    }
})

export const {

    saveCustomMetaList,

    saveformBuilderId,
    saveformBuilderjson,
    saveCurrentSection,

    setFiles,
    addNewFile,
    toggleStarred,
    addFolderName,

    createSection,
    setmyworkspaceinfo,
    getAllSections,
    getUsetStorageData,

    createSubFolder,
    deleteSubFolder,
    updateSharedAccessed,

    renameFolder,
    uploadFolder,

    folderMove,
    folderCopy,

    resetNavigation,
    updateNavigation,
    setDocuments,
    saveDirectory,
    updateMoveFlag,
    updateLoaderFlag,

    //DOWNLOAD
    updateDownloadLoaderFlag,
    addDownloadController,
    removeDownloadController,
    cancelDownloadRequest,

    updateAsideFlag,
    updateSectionName,
    pullSection,
    updateFormSubmit,
    updateCurrentLocation,
    updateProfileFlag,
    updateDocumentUrl,
    //WORKFLOW
    saveWorkflowCurrClickedItem,
    updateSelectedModule,
    updateDocumentLoaderFlag,

    //SEARCH
    disableSearchModal,
    setUpfilterEnabledInSearchModal,
    saveSearch,
    saveSearchDirectory,
    saveMyHierarchy,
    saveMyHierarchyIDS,
    saveSearchPagination,
    
    //METADATA & NOTIFY
    doesMetaMultiSelectClicked,
    notify,

    setAppFeatures,
    showjoyride,
    triggerInlineAddWorkflow,
    triggerInlinePrintWorkflow,
    triggerInlineEditWorkflow,
    triggerCurrentDirectorySave,
    triggerInlineModalNavigate,
    triggerWorkflowCloned,
    triggerSingleWorkflowView,
    triggerInlineFormClick,
    triggerInlineAddFormTemplateClick,
    triggerInlineEditFormTemplateClick,
    storeInlineEditFormTemplate,
    triggerSetFormData,
    triggerInlineFormAdded,
    triggerInlineFormEdited,
    triggerInlineFormChosen,
    triggerInlineSingleFormView,
    triggerOpenGraphArgs
} = folderSlice.actions;

export default folderSlice.reducer;
