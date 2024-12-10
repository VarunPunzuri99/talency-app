import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Heading1, Heading2, ListOrdered, List, Undo, Redo, Table, Trash,
    Trash2, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import styles from './index.module.scss';

interface ToolbarProps {
    editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
    if (!editor) return null;

    // Check if table is selected
    const isTableSelected = editor.isActive('table');

    return (
        <div className={styles.toolbar}>
            {/* General Toolbar Actions */}
            <div className={styles.generalActions}>
                <button
                    type='button'
                    className={editor.isActive('bold') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={16} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('italic') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={14} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 size={18} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 size={18} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('listItem') && editor.isActive('orderedList') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={18} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('listItem') && editor.isActive('bulletList') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={18} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().undo().run()} >
                    <Undo size={18} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().redo().run()} >
                    <Redo size={18} />
                </button>

                <button type='button' onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                    // const result = editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                    // console.log('Insert table result:', result);
                }}>
                    <Table size={18} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().deleteTable().run()}
                >
                    <Trash size={18} />
                </button>
            </div>

            {/* Table-related actions (only when a table is selected) */}
            {isTableSelected && (
                <div className={styles.tableActions}>
                    <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <ArrowLeftCircle size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <ArrowRightCircle size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <Trash2 size={16} />
                    </button>

                    <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <ArrowUpCircle size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <ArrowDownCircle size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Toolbar;