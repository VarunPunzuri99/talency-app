import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { cn } from "@/utils/Ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail as DisplayMail } from "./mail-display";
import { useMail } from "@/utils/Ui/use-mail"
import { markSeen } from "@/services/api.service";
import { useEffect, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";


interface MailListProps {
  items: DisplayMail[]; // Items will be passed down from the parent component
  sourceFolder: string; // Current folder of the emails
  onUpdateItem: (updatedItem: DisplayMail) => void;
}

export default function MailList({ items = [], onUpdateItem }: MailListProps) {
  const [mail, setMail] = useMail();
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    return () => {
      setMail({ ...mail, selected: null }); // Clear the selected state on unmount
    };
  }, []);

  const itemsPerPage = 10; // Customize the items per page if needed

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const handleMailClick = async (item: DisplayMail) => {
    setMail({ ...mail, selected: item.uid });

    // Mark the email as seen if it's not already read
    if (!item.read) {
      try {
        await markSeen(item.folder, item.uid);

        // Update the item status in the parent component
        onUpdateItem({ ...item, read: true });
      } catch (error) {
        console.error("Failed to mark email as seen:", error);
      }
    }
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate the range of items to display based on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  if (!items || items.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500" >No emails found</div>;
  }

  return (
    <div className="flex flex-col h-[75vh]">
      <ScrollArea className="h-screen">
        {/* <Loader /> */}
        <Droppable droppableId="mailList">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2 p-4 pt-0"
            >
              {paginatedItems.map((item, index) => (
                <Draggable
                  key={item.uid}
                  draggableId={item.uid}
                  index={startIndex + index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-gray-100",
                        mail.selected === item.uid ? "bg-gray-200 border-gray-100" : ""
                      )}
                      onClick={() => handleMailClick(item)}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div className={cn("font-semibold", item.read ? "text-gray-800" : "text-gray-800")}>
                              {item.name === "Unknown sender" ? item.fromEmail.split("@")[0] : item.name.split("@")[0]}
                            </div>
                            {!item.read && (
                              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "ml-auto text-xs",
                              mail.selected === item.uid
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.date && !isNaN(new Date(item.date).getTime())
                              ? formatDistanceToNow(new Date(item.date), { addSuffix: true })
                              : 'Unknown date'}
                          </div>
                        </div>
                        <div className={cn("text-xs font-medium", item.read ? "text-gray-800" : "text-orange-800")}>
                          {item.subject}
                        </div>
                        <div className={cn("text-xs font-medium", item.read ? "text-gray-600" : "text-orange-800")}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: item.body.length > 30 ? `${item.body.slice(0, 30)}...` : item.body
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
      <Pagination style={{ color: "#e56a48" }}>
        <PaginationContent>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => handlePageChange(index + 1)}
                style={{
                  fontWeight: currentPage === index + 1 ? 'bold' : 'normal',
                  color: currentPage === index + 1 ? '#e56a48' : 'inherit',
                }} >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

