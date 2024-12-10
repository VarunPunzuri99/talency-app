import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';

const ChatBox = () => {
    const footerContent = (
        <div style={{ backgroundColor: "#D9D9D9", transform: "translateY(-10px)" }} className='border-round-md'>
            <InputTextarea
                className='col-12' rows={4} cols={10}
                placeholder='Type Message...'
                style={{ borderBottom: "1px solid transparent", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", resize: "vertical" }} />
            <div className="py-3 px-3 flex  align-items-center justify-content-between">
                <div className="flex gap-2">
                    <i className='pi pi-cloud-upload'></i>
                    <i className='pi pi-at'></i>
                </div>

                <Button style={{ padding: "4px 10px", background: " #06b6d4", border: "1px solid #06b6d4" }} label="Send" icon="pi pi-send" />
            </div>
        </div>
    );

    return (
        <Panel header="History" footerTemplate={footerContent}
            pt={{ content: { style: { borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", height: "100%" } } }}>
            <ScrollPanel pt={{
                barY: {
                    className: 'bg-primary'
                }
            }} style={{ width: '100%', height: '200px' }} className="custombar1">
                <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis error dolores aspernatur quasi exercitationem iste cumque mollitia sapiente assumenda esse. Accusantium unde excepturi rerum, quos modi, labore consequatur voluptate ab facere praesentium suscipit tenetur quidem non cum placeat vero, eos tempore eaque temporibus consequuntur reprehenderit recusandae hic et. Nemo corporis quis recusandae neque culpa sapiente mollitia similique error nesciunt aut saepe unde architecto distinctio nisi, minima sunt voluptatum repudiandae animi, dolores consequatur soluta! Temporibus sit itaque mollitia, animi excepturi commodi magnam tempore accusantium expedita reiciendis assumenda ducimus minus exercitationem sint asperiores doloribus pariatur libero natus architecto error odio illo! Consectetur at aliquam dolore molestias quia sed necessitatibus tempora. Blanditiis, porro molestiae rem minus tenetur eaque optio quod deserunt sint ullam animi voluptatum, voluptate perspiciatis quae soluta aut, alias quas cumque nostrum. Minus aut ullam iusto fugit iste natus blanditiis mollitia repudiandae nisi, qui perspiciatis optio itaque aspernatur corrupti dolorum animi autem quis totam porro repellendus soluta maxime? Quaerat consectetur blanditiis qui a facilis, deleniti ex iure autem, error necessitatibus exercitationem rem quae tempore nemo. Saepe, enim possimus facere quisquam explicabo veniam ad iusto impedit distinctio accusamus, deserunt culpa sint, nesciunt recusandae ipsum quaerat ea in fugiat? Commodi, aliquam sunt officiis molestias dolorum distinctio recusandae? Perferendis voluptates quaerat tempora voluptatum pariatur? Error nemo incidunt animi vitae cum sed commodi dolores, placeat dolorum culpa!
                </p>
            </ScrollPanel>
        </Panel>
    )
}

export default ChatBox