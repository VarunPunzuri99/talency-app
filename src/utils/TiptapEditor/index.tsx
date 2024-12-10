import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from './index.module.scss';
import Mention from '@tiptap/extension-mention';
import suggestion from './suggestion';
import Toolbar from '@/utils/Toolbar';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

const TiptapEditor = ({ id, onContentChange, name, maxLength = 2500, content = '', readOnly = false, placeholders = [] }) => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                id,
                class: styles.editor,
                'data-name': name,
            },
            editable: () => !readOnly,
            transformPastedText(text) {
                // console.log(text)
                return text.toLowerCase();
            }
        },
        content,
        editable: !readOnly, // Set editor to readonly mode based on prop

        extensions: [
            StarterKit,
            Link.configure({
                HTMLAttributes: { style: 'text-transform: lowercase;' },
                openOnClick: true,
                autolink: true,
                linkOnPaste: true,
                defaultProtocol: 'https',
            }),
            Mention.configure({
                HTMLAttributes: { class: styles.mention },
                suggestion: suggestion(placeholders),
            }),
            Table.configure({
                HTMLAttributes: {
                    style: 'border-collapse: collapse; width: 100%; table-layout: fixed;',
                },
                resizable: true,
            }),
            TableRow.configure({
                HTMLAttributes: { style: 'border: 1px solid #ddd;' },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; width: 150px;',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; background-color: #e9e9f2; font-weight: bold; width: 150px;',
                },
            }),
        ],
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!editor || readOnly) return;

        editor.on('update', () => {
            const htmlContent = editor.getHTML();

            if (htmlContent.length <= maxLength) {
                onContentChange(htmlContent);
            } else {
                editor.commands.undo(); // Undo the last action if it exceeds maxLength
            }
        });

        return () => {
            editor?.off('update');
        };
    }, [editor, onContentChange, maxLength, readOnly]);

    return (
        <div>
            {!readOnly && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;