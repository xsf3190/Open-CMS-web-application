/*
** CONFIGURE INLINE CKEDITOR PLUGINS
*/

import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

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
                    tooltip: 'Upload Image and crop',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(false);
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
                    label: 'Upload Images',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M1.201 1C.538 1 0 1.47 0 2.1v14.363c0 .64.534 1.037 1.186 1.037h9.494a3 3 0 0 1-.414-.287 3 3 0 0 1-1.055-2.03 3 3 0 0 1 .693-2.185l.383-.455-.02.018-3.65-3.41a.695.695 0 0 0-.957-.034L1.5 13.6V2.5h15v5.535a2.97 2.97 0 0 1 1.412.932l.088.105V2.1c0-.63-.547-1.1-1.2-1.1zm11.713 2.803a2.146 2.146 0 0 0-2.049 1.992 2.14 2.14 0 0 0 1.28 2.096 2.13 2.13 0 0 0 2.644-3.11 2.13 2.13 0 0 0-1.875-.978"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/><path d="M15.522 19.1a.79.79 0 0 0 .79-.79v-5.373l2.059 2.455a.79.79 0 1 0 1.211-1.015l-3.352-3.995a.79.79 0 0 0-.995-.179.8.8 0 0 0-.299.221l-3.35 3.99a.79.79 0 1 0 1.21 1.017l1.936-2.306v5.185c0 .436.353.79.79.79"/></svg>',
                    tooltip: 'Upload Images (no crop)',
                    withText: false
                } );
                button.on('execute', (_) => {
                    import("deploy_upload-media")
                    .then((module) => {
                        module.init(true);
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
                    label: 'List Image URLs',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5 2.801a.7.7 0 0 0-.7.7v11.5a.8.8 0 0 1-1.6 0v-11.5a2.3 2.3 0 0 1 2.3-2.3h6.5a.8.8 0 0 1 0 1.6zm.7 3.7a2.3 2.3 0 0 1 2.3-2.3h7a2.3 2.3 0 0 1 2.3 2.3v10a2.3 2.3 0 0 1-2.3 2.3H8a2.3 2.3 0 0 1-2.3-2.3zm2.3-.7a.7.7 0 0 0-.7.7v10a.7.7 0 0 0 .7.7h7a.7.7 0 0 0 .7-.7v-10a.7.7 0 0 0-.7-.7z"/></svg>',
					tooltip: 'Copy Image URL',
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
    const wordcount = document.querySelector(".wordcount");

    const mainConfig = {
        plugins: [ Essentials,  Alignment, Autosave, BlockQuote, Bold, Clipboard, Code, CodeBlock,
                    FontSize, FontColor, FontBackgroundColor,
                    Heading, HorizontalLine, 
                    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageInsertViaUrl, 
                    Italic, Link, LinkImage, List, ListImages, Paragraph, 
                    SelectAll, SelectFonts, ShowBlocks, 
                    Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar,
                    Underline, UploadImage, UploadImages, WordCount ],
        toolbar: [ 'heading', '|', 'undo', 'redo',  '|',  'selectFonts', 'bold', 'italic', 'fontSize', 'fontColor', 'fontBackgroundColor',
                    '|', 'link', 
                    '|', 'uploadImage', 'uploadImages', 'listImages', 'insertImage', 
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
                element.insertAdjacentHTML("afterend",'<div style="opacity:0.5;text-align:center"><small class="wordcount"></small></div>');
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
    const word_count = document.querySelector(".ck-word-count__words").textContent;

    callAPI(endpoint,'PUT', {body_html: data, word_count: word_count, id: id})
        .then((data) => {
            // editor_status.textContent = data.message;
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
