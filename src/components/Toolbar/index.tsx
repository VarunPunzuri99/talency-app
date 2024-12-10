import React, { useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Heading1, Heading2, ListOrdered, List, Undo, Redo, Table, Trash,
    Trash2, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle, ArrowDownCircle, Image,
    Palette
} from 'lucide-react';
import styles from './index.module.css';
import { uploadFiles } from '@/services/api.service';

interface ToolbarProps {
    editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isPaletteVisible, setPaletteVisible] = useState(false);
    if (!editor) return null;
    
    // Function to handle image insertion
    // const insertImage = () => {
    //     const url = prompt("Enter the image URL:");
    //     if (url) {
    //         editor.chain().focus().setImage({ src: url }).run();
    //     }
    // };

    // Check if table is selected
    const isTableSelected = editor.isActive('table');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        try {
            // Assuming uploadFiles returns an array of file objects with { originalName, _id, locationUrl }
            const uploadedFiles = await uploadFiles(files);

            // Take the first uploaded file (assuming single image upload)
            const uploadedFile = uploadedFiles[0];
            const imageUrl = uploadedFile.locationUrl;  // Extract the URL from the response

            // Insert the uploaded image into the Tiptap editor
            editor.chain().focus().setImage({ src: imageUrl }).run();

            // Optionally, show success toast or perform other state updates
            //   toast({
            //     title: "Success",
            //     description: "Image uploaded and inserted successfully!",
            //     variant: "success",
            //   });
        } catch (error) {
            console.error("Error uploading image:", error);
            //   toast({
            //     title: "Error",
            //     description: "Failed to upload image.",
            //     variant: "destructive",
            //   });
        }
    };

    const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF69B4', '#6A5ACD', '#000000', '#FFFFFF'];

    const applyColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
    };

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
                    className={editor.isActive('orderedList') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={18} />
                </button>

                <button
                    type='button'
                    className={editor.isActive('bulletList') ? styles.active : ''}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={18} />
                </button>

                <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept='image/*'
                    onChange={handleFileChange}
                />

                {/* Button to trigger file input */}
                <button type='button' onClick={() => fileInputRef.current?.click()}>
                    <Image size={18}  />
                </button>

                <button
                type="button"
                onClick={() => setPaletteVisible((prev) => !prev)}
                className={styles.paletteButton}
                aria-label="Toggle color palette"
            >
                <Palette size={16} />
            </button>

            {/* Show Palette */}
            {isPaletteVisible && (
                <div className={styles.colorPalette}>
                    {colorPalette.map((color) => (
                        <button
                            key={color}
                            className={styles.colorButton}
                            style={{ backgroundColor: color }}
                            onClick={() => applyColor(color)}
                            aria-label={`Apply color ${color}`}
                        />
                    ))}
                </div>
            )}

                <button type='button' onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <Table size={18} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().deleteTable().run()}
                >
                    <Trash size={18} />
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