import ReactPlayer from 'react-player';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';


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
    {
        ext: 'html',
        icon: 'html5',
    },
    {
        ext: 'js',
        icon: 'fileCode',
    },
    {
        ext: 'json',
        icon: 'fileCode'
    }
]

const addfileAttributes = async (file) => {
    file['starredDisplay'] = file.starredWith['users'].some(item => item == localStorage.getItem('userId'))

    const hasSectionId = 'sectionId' in file;
    const hasFolderId = 'folderId' in file;

    file['type'] = (hasSectionId && hasFolderId) ? 'file' : 'folder'

    if (file['type'] == 'folder') {
        file['icon'] = 'folder'
    }
    else {
        let iconIdx = icons.findIndex(item => item.ext == file.fileType)
        file['icon'] = iconIdx != -1 ? icons[iconIdx]['icon'] : "fileDoc"
    }

}

const defaultMetaData = [
    {
        fieldName: 'Document Number',
        type: 'text',
        id: "docNum",
        placeholder: "Enter Document Number",
        required: false
    },
    {
        fieldName: 'Primary Document Type',
        type: 'tag',
        id: "primarydoctype",
        placeholder: "Enter Primary Document Type",
        required: true,
    },
    {
        fieldName: 'Secondary Document Type',
        type: 'tag',
        id: "secondarydoctype",
        placeholder: "Enter Secondary Document Type",
        required: true,
    },
    {
        fieldName: 'Keywords',
        type: 'tag',
        id: "keywords",
        placeholder: "Enter Keywords",
        required: false,
    },
    {
        fieldName: 'Notes',
        type: 'textarea',
        id: "notes",
        placeholder: "Enter Notes",
        required: false
    },
]

const getFileType = (fileType) => {
    const fileTypeMap = {
        'doc': 'word',
        'docx': 'word',
        'odt': 'word',
        'rtf': 'word',       // Rich Text Format
        'wps': 'word',       // Microsoft Works Word Processor
        'wpd': 'word',       // WordPerfect Document
        'dot': 'word',       // Microsoft Word Template (old format)
        'dotx': 'word',      // Microsoft Word Template (modern format)
        'md': 'word',        // Markdown file

        'ppt': 'ppt',
        'pptx': 'ppt',

        'xls': 'excel',
        'xlsx': 'excel',

        'pdf': 'pdf',

        'mp3': 'audio',
        'MP3': 'audio',
        'wav': 'audio',
        'aac': 'audio',

        'jpeg': 'image',
        'JPEG': 'image',
        'jpg': 'image',
        'JPG': 'image',
        'png': 'image',
        'PNG': 'image',
        'gif': 'image',
        'bmp': 'image',
        'svg': 'image',

        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'mkv': 'video',


        'txt': 'code',
        'js': 'code',
        'py': 'code',
        'json': 'code',
        'java': 'code',
        'php': 'code',
        'cpp': 'code',
        "abap": "code",
        "abnf": "code",
        "actionscript": "code",
        "ada": "code",
        "agda": "code",
        "al": "code",
        "antlr4": "code",
        "apacheconf": "code",
        "apex": "code",
        "apl": "code",
        "applescript": "code",
        "aql": "code",
        "arduino": "code",
        "arff": "code",
        "asciidoc": "code",
        "asm6502": "code",
        "asmatmel": "code",
        "aspnet": "code",
        "autohotkey": "code",
        "autoit": "code",
        "avisynth": "code",
        "avroIdl": "code",
        "bash": "code",
        "basic": "code",
        "batch": "code",
        "bbcode": "code",
        "bicep": "code",
        "birb": "code",
        "bison": "code",
        "bnf": "code",
        "brainfuck": "code",
        "brightscript": "code",
        "bro": "code",
        "bsl": "code",
        "c": "code",
        "cfscript": "code",
        "chaiscript": "code",
        "cil": "code",
        "clike": "code",
        "clojure": "code",
        "cmake": "code",
        "cobol": "code",
        "coffeescript": "code",
        "concurnas": "code",
        "coq": "code",
        "cpp": "code",
        "crystal": "code",
        "csharp": "code",
        "cshtml": "code",
        "html": "code",
        "csp": "code",
        "cssExtras": "code",
        "css": "code",
        // "csv": "excel",
        "cypher": "code",
        "d": "code",
        "dart": "code",
        "dataweave": "code",
        "dax": "code",
        "dhall": "code",
        "diff": "code",
        "django": "code",
        "dnsZoneFile": "code",
        "docker": "code",
        "dot": "code",
        "ebnf": "code",
        "editorconfig": "code",
        "eiffel": "code",
        "ejs": "code",
        "elixir": "code",
        "elm": "code",
        "erb": "code",
        "erlang": "code",
        "etlua": "code",
        "excelFormula": "code",
        "factor": "code",
        "falselang": "code",
        "firestoreSecurityRules": "code",
        "flow": "code",
        "fortran": "code",
        "fsharp": "code",
        "ftl": "code",
        "gap": "code",
        "gcode": "code",
        "gdscript": "code",
        "gedcom": "code",
        "gherkin": "code",
        "git": "code",
        "glsl": "code",
        "gml": "code",
        "gn": "code",
        "goModule": "code",
        "go": "code",
        "graphql": "code",
        "groovy": "code",
        "haml": "code",
        "handlebars": "code",
        "haskell": "code",
        "haxe": "code",
        "hcl": "code",
        "hlsl": "code",
        "hoon": "code",
        "hpkp": "code",
        "hsts": "code",
        "http": "code",
        "ichigojam": "code",
        "icon": "code",
        "icuMessageFormat": "code",
        "idris": "code",
        "iecst": "code",
        "ignore": "code",
        "inform7": "code",
        "ini": "code",
        "io": "code",
        "j": "code",
        "java": "code",
        "javadoc": "code",
        "javadoclike": "code",
        "javascript": "code",
        "javastacktrace": "code",
        "jexl": "code",
        "jolie": "code",
        "jq": "code",
        "jsExtras": "code",
        "jsTemplates": "code",
        "jsdoc": "code",
        "json": "code",
        "json5": "code",
        "jsonp": "code",
        "jsstacktrace": "code",
        "jsx": "code",
        "julia": "code",
        "keepalived": "code",
        "keyman": "code",
        "kotlin": "code",
        "kumir": "code",
        "kusto": "code",
        "latex": "code",
        "latte": "code",
        "less": "code",
        "lilypond": "code",
        "liquid": "code",
        "lisp": "code",
        "livescript": "code",
        "llvm": "code",
        "log": "code",
        "lolcode": "code",
        "lua": "code",
        "magma": "code",
        "makefile": "code",
        "markdown": "code",
        "markupTemplating": "code",
        "markup": "code",
        "matlab": "code",
        "maxscript": "code",
        "mel": "code",
        "mermaid": "code",
        "mizar": "code",
        "mongodb": "code",
        "monkey": "code",
        "moonscript": "code",
        "n1ql": "code",
        "n4js": "code",
        "nand2tetrisHdl": "code",
        "naniscript": "code",
        "nasm": "code",
        "neon": "code",
        "nevod": "code",
        "nginx": "code",
        "nim": "code",
        "nix": "code",
        "nsis": "code",
        "objectivec": "code",
        "ocaml": "code",
        "opencl": "code",
        "openqasm": "code",
        "oz": "code",
        "parigp": "code",
        "parser": "code",
        "pascal": "code",
        "pascaligo": "code",
        "pcaxis": "code",
        "peoplecode": "code",
        "perl": "code",
        "phpExtras": "code",
        "php": "code",
        "phpdoc": "code",
        "plsql": "code",
        "powerquery": "code",
        "powershell": "code",
        "processing": "code",
        "prolog": "code",
        "promql": "code",
        "properties": "code",
        "protobuf": "code",
        "psl": "code",
        "pug": "code",
        "puppet": "code",
        "pure": "code",
        "purebasic": "code",
        "purescript": "code",
        "python": "code",
        "q": "code",
        "qml": "code",
        "qore": "code",
        "qsharp": "code",
        "r": "code",
        "racket": "code",
        "reason": "code",
        "regex": "code",
        "rego": "code",
        "renpy": "code",
        "rest": "code",
        "rip": "code",
        "roboconf": "code",
        "robotframework": "code",
        "ruby": "code",
        "rust": "code",
        "sas": "code",
        "sass": "code",
        "scala": "code",
        "scheme": "code",
        "scss": "code",
        "shellSession": "code",
        "smali": "code",
        "smalltalk": "code",
        "smarty": "code",
        "sml": "code",
        "solidity": "code",
        "solutionFile": "code",
        "soy": "code",
        "sparql": "code",
        "splunkSpl": "code",
        "sqf": "code",
        "sql": "code",
        "squirrel": "code",
        "stan": "code",
        "stylus": "code",
        "swift": "code",
        "systemd": "code",
        "t4Cs": "code",
        "t4Templating": "code",
        "t4Vb": "code",
        "tap": "code",
        "tcl": "code",
        "textile": "code",
        "toml": "code",
        "tremor": "code",
        "tsx": "code",
        "tt2": "code",
        "turtle": "code",
        "twig": "code",
        "typescript": "code",
        "typoscript": "code",
        "unrealscript": "code",
        "uorazor": "code",
        "uri": "code",
        "v": "code",
        "vala": "code",
        "vbnet": "code",
        "velocity": "code",
        "verilog": "code",
        "vhdl": "code",
        "vim": "code",
        "visualBasic": "code",
        "warpscript": "code",
        "wasm": "code",
        "webIdl": "code",
        "wiki": "code",
        "wolfram": "code",
        "wren": "code",
        "xeora": "code",
        "xmlDoc": "code",
        "xojo": "code",
        "xquery": "code",
        "yaml": "code",
        "yang": "code",
        "zig": "code"
    };

    const normalizedType = fileType ? fileType.toLowerCase() : '';

    return fileTypeMap[normalizedType] || 'unknown';
}

const getfileMimeType = (filename) => {
    var ext = path.extname(filename);
    ext = ext.replace(".", "");
    return getFileType(ext);
}
const getOnlyOfficeDocumentType = (fileType) => {
    const fileTypeMap = {
        // Document Types
        docx: 'word',
        doc: 'word',
        odt: 'word', // OpenDocument Text
        rtf: 'word',
        txt: 'text',

        // Spreadsheet Types
        xlsx: 'cell',
        xls: 'cell',
        ods: 'cell', // OpenDocument Spreadsheet
        // csv: 'cell',

        // Presentation Types
        pptx: 'slide',
        ppt: 'slide',
        odp: 'slide', // OpenDocument Presentation

        // PDF
        pdf: 'pdf',

        // Image Types
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        bmp: 'image',
        tiff: 'image',
        svg: 'image',

        // Video Types
        mp4: 'video',
        avi: 'video',
        mkv: 'video',
        mov: 'video',
        wmv: 'video',

        // Audio Types
        mp3: 'audio',
        wav: 'audio',
        ogg: 'audio',
        flac: 'audio',

        // Archive Types
        zip: 'archive',
        rar: 'archive',
        tar: 'archive',
        gz: 'archive',

        // Code/Script Types
        js: 'code',
        ts: 'code',
        json: 'code',
        xml: 'code',
        html: 'code',
        css: 'code',
        py: 'code',
        java: 'code',
        cpp: 'code',
        c: 'code',
        cs: 'code', // C#
        php: 'code',
        rb: 'code', // Ruby
        sh: 'code', // Shell Script

        // Other
        md: 'markdown', // Markdown
        log: 'log',      // Log files
    }

    const normalizedType = fileType ? fileType.toLowerCase() : '';

    return fileTypeMap[normalizedType] || 'unknown';
}

const playVideo = async (url) => {
    debugger
    return <ReactPlayer
        url={url}
        controls={true}
        width="100%"
        height="100%"
        playing={true}
        light={false}
        progressInterval={1000}
        onSeek={(e) => console.log('Seeking to:', e)}
        onEnded={() => console.log('Video ended')}
        config={{
            file: {
                attributes: {
                    preload: 'auto'
                }
            }
        }}
    />
}

const playAudio = (url) => {
    return (
        <AudioPlayer
            volume={0.8}
            showSkipControls={true}
            autoPlay
            src={url}
        />
    )
}





export {
    addfileAttributes,
    defaultMetaData,
    getFileType,
    playVideo,
    playAudio,
    getOnlyOfficeDocumentType,
    getfileMimeType
}