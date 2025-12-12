/*
** CONFIGURE INLINE CKEDITOR PLUGINS
*/

import { callAPI, handleError } from "deploy_callAPI";

let endpoint;
let words;

export const init = async (element) => {
    let CK_CSS, CK_JS;

    const data = await callAPI('ckeditor/:ID',"GET");
    CK_CSS  = data.ckeditor_css;
    CK_JS  = data.ckeditor_js;

    /* Close menulist popup */
    document.getElementById("menulist").hidePopover();
    
    endpoint = element.dataset.endpoint;
    
    /* Add CKEDITOR CSS to document <head> */
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', CK_CSS);
    document.head.appendChild(link);


    /* Get apprpriate set of plugins from CKEDITOR CDN */
    const { InlineEditor, 
            Essentials, 
            Alignment, 
            Autosave, 
            BlockQuote, 
            Bold,
            ButtonView, 
            Clipboard, 
            Code, 
            CodeBlock, 
            FontSize, 
            FontColor, 
            FontBackgroundColor,
            Heading,
            HorizontalLine,
            Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageInsert, ImageInsertViaUrl,
            Italic, 
            Link, 
            LinkImage,
            List, 
            MenuBarMenuListItemButtonView, 
            Paragraph,
            Plugin, 
            SelectAll, 
            ShowBlocks, 
            Table,
			TableCaption,
			TableCellProperties, 
			TableColumnResize,
			TableProperties, 
			TableToolbar,
            Underline, 
            WordCount
            } = await import(CK_JS)
            .catch((error) => {
                handleError(error);
                return;
            })


    /* Add "Upload Image" button to toolbar */
    class UploadImage extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'uploadImage', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'Upload Image',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M1.201 1C.538 1 0 1.47 0 2.1v14.363c0 .64.534 1.037 1.186 1.037h9.494a3 3 0 0 1-.414-.287 3 3 0 0 1-1.055-2.03 3 3 0 0 1 .693-2.185l.383-.455-.02.018-3.65-3.41a.695.695 0 0 0-.957-.034L1.5 13.6V2.5h15v5.535a2.97 2.97 0 0 1 1.412.932l.088.105V2.1c0-.63-.547-1.1-1.2-1.1zm11.713 2.803a2.146 2.146 0 0 0-2.049 1.992 2.14 2.14 0 0 0 1.28 2.096 2.13 2.13 0 0 0 2.644-3.11 2.13 2.13 0 0 0-1.875-.978"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/></svg>',
                    tooltip: 'Upload Image',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(false,"image");
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_upload-media");
                    });
                });
                return button;
            } );
        }
    }

    /* Add "Upload Images" button to toolbar */
    class UploadImages extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'uploadImages', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'Upload multiple images',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M1.201 1C.538 1 0 1.47 0 2.1v14.363c0 .64.534 1.037 1.186 1.037h9.494a3 3 0 0 1-.414-.287 3 3 0 0 1-1.055-2.03 3 3 0 0 1 .693-2.185l.383-.455-.02.018-3.65-3.41a.695.695 0 0 0-.957-.034L1.5 13.6V2.5h15v5.535a2.97 2.97 0 0 1 1.412.932l.088.105V2.1c0-.63-.547-1.1-1.2-1.1zm11.713 2.803a2.146 2.146 0 0 0-2.049 1.992 2.14 2.14 0 0 0 1.28 2.096 2.13 2.13 0 0 0 2.644-3.11 2.13 2.13 0 0 0-1.875-.978"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/></svg>',
                    tooltip: 'Upload multiple images',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(true,"image");
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_upload-media");
                    });
                });
                return button;
            } );
        }
    }

    /* Add "Upload PDF" button to toolbar */
    class UploadPdf extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'uploadPdf', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'Upload PDF files',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M208 48L96 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16l80 0 0 48-80 0c-35.3 0-64-28.7-64-64L32 64C32 28.7 60.7 0 96 0L229.5 0c17 0 33.3 6.7 45.3 18.7L397.3 141.3c12 12 18.7 28.3 18.7 45.3l0 149.5-48 0 0-128-88 0c-39.8 0-72-32.2-72-72l0-88zM348.1 160L256 67.9 256 136c0 13.3 10.7 24 24 24l68.1 0zM240 380l32 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zm32 80c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40 12 0zm96-80l32 0c28.7 0 52 23.3 52 52l0 64c0 28.7-23.3 52-52 52l-32 0c-11 0-20-9-20-20l0-128c0-11 9-20 20-20zm32 128c6.6 0 12-5.4 12-12l0-64c0-6.6-5.4-12-12-12l-12 0 0 88 12 0zm76-108c0-11 9-20 20-20l48 0c11 0 20 9 20 20s-9 20-20 20l-28 0 0 24 28 0c11 0 20 9 20 20s-9 20-20 20l-28 0 0 44c0 11-9 20-20 20s-20-9-20-20l0-128z"/></svg>',
                    tooltip: 'Upload PDF files',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(true,"pdf");
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_upload-media");
                    });
                });
                return button;
            } );
        }
    }

    /* Add "Upload ZIP" button to toolbar */
    class UploadZip extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'uploadZip', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'Upload ZIP files',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M64 48l112 0 0 88c0 39.8 32.2 72 72 72l88 0 0 240c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16zM224 67.9l92.1 92.1-68.1 0c-13.3 0-24-10.7-24-24l0-68.1zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-261.5c0-17-6.7-33.3-18.7-45.3L242.7 18.7C230.7 6.7 214.5 0 197.5 0L64 0zM80 104c0 13.3 10.7 24 24 24l16 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0c-13.3 0-24 10.7-24 24zm0 80c0 13.3 10.7 24 24 24l32 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-32 0c-13.3 0-24 10.7-24 24zm64 56l-32 0c-17.7 0-32 14.3-32 32l0 48c0 26.5 21.5 48 48 48s48-21.5 48-48l0-48c0-17.7-14.3-32-32-32zm-16 64a16 16 0 1 1 0 32 16 16 0 1 1 0-32z"/></svg>',
                    tooltip: 'Upload ZIP files',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(true,"zip");
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_upload-media");
                    });
                });
                return button;
            } );
        }
    }
    
    /* Add "List Images" button to toolbar */
    class ListImages extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'listImages', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'List All Images',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5 2.801a.7.7 0 0 0-.7.7v11.5a.8.8 0 0 1-1.6 0v-11.5a2.3 2.3 0 0 1 2.3-2.3h6.5a.8.8 0 0 1 0 1.6zm.7 3.7a2.3 2.3 0 0 1 2.3-2.3h7a2.3 2.3 0 0 1 2.3 2.3v10a2.3 2.3 0 0 1-2.3 2.3H8a2.3 2.3 0 0 1-2.3-2.3zm2.3-.7a.7.7 0 0 0-.7.7v10a.7.7 0 0 0 .7.7h7a.7.7 0 0 0 .7-.7v-10a.7.7 0 0 0-.7-.7z"/></svg>',
					tooltip: 'List All Images',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_select-media")
                    .then((module) => {
                        module.init();
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_select-media");
                    });
                });
                return button;
            } );
        }
    }

    /* Add "List Images" button to toolbar */
    class SelectFonts extends Plugin {
        init() {
            const editor = this.editor;
            editor.ui.componentFactory.add( 'selectFonts', () => {
                const button = new ButtonView();
                button.set( {
                    label: 'Google Fonts',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11.03 3h6.149a.75.75 0 1 1 0 1.5h-5.514zm1.27 3h4.879a.75.75 0 1 1 0 1.5h-4.244zm1.27 3h3.609a.75.75 0 1 1 0 1.5h-2.973zm-2.754 2.5L8.038 4.785 5.261 11.5zm.62 1.5H4.641l-1.666 4.028H1.312l5.789-14h1.875l5.789 14h-1.663z"/></svg>',
                    tooltip: 'Google Fonts',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_fonts")
                    .then((module) => {
                        module.init();
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Failed to load module deploy_fonts");
                    });
                });
                return button;
            } );
        }
    }

    /*
    function CustomTitleExtension(editor) {
        editor.model.schema.addAttributeCheck((context, attributeName) => {
            if (context.endsWith('title-content $text') && ['italic','fontSize','fontColor','underline'].includes(attributeName)) {
                return true;
            }
        })
    }
    */

    const headerConfig = {
        plugins: [ Essentials, Alignment, Autosave, Bold, FontSize, FontColor, Heading, Italic, Paragraph, Underline, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar ],
        toolbar: [ 'heading', 'paragraph', '|', 'undo', 'redo',  '|', 'italic', 'bold', 'underline','|', 'fontSize', 'fontColor', '|', 'alignment', '|', 'insertTable'],
        // licenseKey: "GPL",
        heading: {
            options: [
                { model: 'heading1', view: 'h1', title: 'Title', class: 'ck-heading_heading1' },
                { model: 'paragraph', title: 'Subtitle', class: 'ck-heading_paragraph' },
            ]
        },
        table: {
            tableCaption: {
                useCaptionElement: true
            },
            contentToolbar: [ 'toggleTableCaption', 'tableColumn', 'tableRow', 'mergeTableCells', 'TableProperties', 'TableCellProperties'],
        },
        autosave: {
                waitingTime: 2000,
                save( editor ) {
                    return saveData( editor.getData(), endpoint, 'header' );
                }
        },
        content: "header",
    };

    /* Main Config */
    const main = document.getElementById("main");
    main.insertAdjacentHTML("afterend",'<div style="opacity:0.5;text-align:center"><small class="wordcount"></small></div>');
    const wordcount = document.querySelector(".wordcount");

    const mainConfig = {
        plugins: [ Essentials,  Alignment, Autosave, BlockQuote, Bold, Clipboard, Code, CodeBlock,
                    FontSize, FontColor, FontBackgroundColor,
                    Heading, HorizontalLine, 
                    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageInsertViaUrl, 
                    Italic, Link, LinkImage, List, ListImages, Paragraph, 
                    SelectAll, SelectFonts, ShowBlocks, 
                    Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar,
                    Underline, UploadImage, UploadImages, UploadPdf, UploadZip, WordCount ],
        toolbar: [ 'heading', '|', 'undo', 'redo',  '|',  'selectFonts', 'bold', 'italic', 'fontSize', 'fontColor', 'fontBackgroundColor',
                    '|', 'link', 
                    '|', 'uploadImage', 
                    {
                        label: 'More Upload Options',
                        icon: 'threeVerticalDots',
                        items: [ 'uploadImages', 'uploadPdf' , 'uploadZip']
                    },
                    'listImages', 'insertImage', 
                    '|', 'insertTable' ],
        menuBar: {
            isVisible: true
        },
        alignment: {
            options: [
                {name:'left', className: 'align-left'},
                {name:'right', className: 'align-right'},
                {name:'center', className: 'align-center'},
                {name:'justify', className: 'align-justify'}
            ]
        },
        autosave: {
            waitingTime: 2000,
            save( editor ) {
                return saveData( editor.getData(), endpoint, 'main' );
            }
        },
        codeBlock: {
            languages: [
            { language: 'css', label: 'CSS' },
            { language: 'html', label: 'HTML' },
            { language: 'javascript', label: 'Javascript' },
            { language: 'sql', label: 'SQL' },
            { language: 'plsql', label: 'PL/SQL' },
            { language: 'shell', label: 'shell' }
            ]
        },
        image: {
            insert: {
                type: 'auto',
                integrations: ['url']
            },
            toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
				'imageStyle:side',
                '|',
                'imageStyle:wrapText',
				'imageStyle:breakText',
                '|',
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'linkImage'
            ]
        },
        link: {
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                },
                openInNewTab: {
                    mode: 'manual',
                    label: 'Open in a new tab',
                    defaultValue: true,			// This option will be selected by default.
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }
                }
            }
        },
        list: {
            properties: {
                styles: true,
                startIndex: true,
                reversed: true
            }
        },
        table: {
            tableCaption: {
                useCaptionElement: true
            },
            contentToolbar: [ 'toggleTableCaption', 'tableColumn', 'tableRow', 'mergeTableCells', 'TableProperties', 'TableCellProperties'],
        },
        wordCount: {
            onUpdate: stats => {
                wordcount.textContent = `Word count: ${ stats.words }`;
                words = stats.words;
            }
        },
        content: "main",
    };

    const footerConfig = {
        plugins: [ Essentials, Autosave, Paragraph, Heading, List, FontSize, FontColor, FontBackgroundColor, Bold, Italic, Link, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar ],
        toolbar: [ 'heading', '|', 'undo', 'redo',  '|', 'bold', 'italic', '|', 'fontSize', 'fontColor', 'fontBackgroundColor','|', 'insertTable', '|', 'link' ],
        table: {
            tableCaption: {
                useCaptionElement: true
            },
            contentToolbar: [ 'toggleTableCaption', 'tableColumn', 'tableRow', 'mergeTableCells', 'TableProperties', 'TableCellProperties'],
        },
        autosave: {
            waitingTime: 2000,
            save( editor ) {
                return saveData( editor.getData(), endpoint, 'footer' );
            }
        },
        content: "footer",
    }

    const editors = [
        'header', 'main', 'footer'
    ];

    editors.forEach(id => {
        const element = document.getElementById( id );

        if ( !element ) {
            return;
        }

        if (element.hasAttribute("nocontent")) {
            element.insertAdjacentHTML("beforeend",'<p class="align-center"><span class="text-big">Click to add ' + id + ' content</span></p>');
        }

        let config;
        switch (id) {
            case "header" : 
                config = headerConfig;
                break;
            case "main" : 
                config = mainConfig;
                break;
            case "footer" : 
                config = footerConfig;
                break;
            default:
                console.error(id + "not supported");
        }

        /* Remove deployed srcset attribute from all images */
        const images = document.getElementsByTagName('img'); 
        for (let i=0; i < images.length; i++) {
            const  currentSrc=images[i].currentSrc;
            images[i].removeAttribute("srcset");
            images[i].src = currentSrc;
        }

        InlineEditor.create(
            element,
            config
        )
            .then( editor => {
                window.editor = editor;
                editor.editing.view.change( writer => {
                    const viewEditableRoot = editor.editing.view.document.getRoot();
                    writer.removeClass( 'ck-editor__editable_inline', viewEditableRoot );
                });
            } )
            .catch( error => {
                console.error( error.stack );
            } );
    })
}

/*
** SAVE CHANGED DATA TO SERVER. TRACK EDITED PAGES IN ORDER TO INITIALIZE EDITOR ON SESSION VISITS.
*/

const pages_edited = JSON.parse(sessionStorage.getItem("pages_edited"));
const pages_set = new Set(pages_edited);
const page_id = Number(document.body.dataset.articleid);


const saveData = async ( data, endpoint, id ) => {

    // callAPI(endpoint,'PUT', {body_html: data, word_count: wordcount.textContent, id: id})
    callAPI(endpoint,'PUT', {body_html: data, id: id, words: words})
        .then((data) => {
            console.log(data.message);
            if (!pages_set.has(page_id)) {
                pages_set.add(page_id);
                sessionStorage.setItem("pages_edited",JSON.stringify(Array.from(pages_set)));
            }
        })
        .catch((error) => {
            handleError(error);
        })
}
