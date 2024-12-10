import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from '@/utils/MentionList'

const suggestion = (placeholders) => ({
    items: ({ query }) => {

        const items = placeholders
            .filter(item => item.name.toLowerCase().startsWith(query.toLowerCase()))
            .map(item => item.name);

        console.log("Filtered items for suggestion:", items);
        return items;
    },

    render: () => {
        let component;
        let popup;

        return {
            onStart: props => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
    char: '#',
});

export default suggestion;