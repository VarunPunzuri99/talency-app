import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from './index.module.scss'; // Adjust the path as needed
import Toolbar from '../Toolbar';
import Mention from '@tiptap/extension-mention';
import { ToastContainer } from 'react-toastify';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style'


interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
    console.log("tiptap value:", value)
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: styles.editor, // Apply your custom class here
            },
            transformPastedText(text) {
                return text.toUpperCase();
            },
        },
        content: value,
        extensions: [
            StarterKit,
            TextStyle, 
            Color,
            Image.configure({
                HTMLAttributes: {
                    class: styles.smallImage,
                },
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: styles.mention,
                },
            }),
            Table.configure({
                HTMLAttributes: {
                    style: 'border-collapse: collapse; width: 100%; table-layout: fixed;', // Fixed layout to control column widths
                },
                resizable: true,
            }),
            TableRow.configure({
                HTMLAttributes: { style: 'border: 1px solid #ddd;' },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; width: 150px;', // Set column width
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; background-color: #e9e9f2; font-weight: bold; width: 150px;', // Set column width for headers
                },
            }),

        ],
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor) {
            const updateContent = () => {
                const editorContent = editor.getHTML();
                onChange(editorContent);  // Call onChange to update the parent
            };

            editor.on('update', updateContent);

            return () => {
                editor.off('update', updateContent);  // Cleanup event listener
            };
        }
    }, [editor, onChange]);

    return (
        <div>
            <ToastContainer />
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;