import format from "date-fns/format"
import { CircleX, Forward, MoreVertical, Reply, ReplyAll, Trash2, } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { replyEmail, forwardEmail, moveTrashMail, deleteMail, markUnSeen, uploadFiles } from "@/services/api.service"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
// import TiptapEditor from "@/utils/TiptapEditor";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Loader from "@/components/Loader"
import TiptapEditor from "@/components/TiptapEditor"

export interface Attachment {
  filename: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  contentId: string;
  content: string; // Base64 encoded content
}


export interface ToEmail {
  email: string;
}

export interface Mail {
  uid: string;
  name: string;
  subject: string;
  fromEmail: string;
  toEmail: ToEmail[] | string;
  cc?: string[];
  bcc?: string[];
  date: string; // or Date depending on your API response
  body: string;
  read: boolean;
  folder: string;
  attachments?: Attachment[] | string;
  labels: string[];
}

interface MailDisplayProps {
  mail: Mail | null
}

export default function MailDisplay({ mail }: MailDisplayProps) {
  const [expandedEmails, setExpandedEmails] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cc, setCc] = useState<string>(""); // State for CC
  const [bcc, setBcc] = useState<string>(""); // State for BCC
  const [showCc, setShowCc] = useState(false); // Toggle for CC
  const [showBcc, setShowBcc] = useState(false); // Toggle for BCC
  const [toMail, setToMail] = useState<string[]>([mail?.fromEmail || ""]);  // State for "To" email
  const [forwardBody, setForwardBody] = useState("");
  const [toForMail, setToForMail] = useState<string[]>([""]); // State for "To" email
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [replyBody, setReplyBody] = useState<string>("");
  const [replyAll, setReplyAll] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; id: string }[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]); // Store file IDs here
  const [subject, setSubject] = useState("");
  const [sub, setSub] = useState("");


  useEffect(() => {
    if (mail) {
      setReplyBody(""); // Reset reply body when the mail changes
      setCc("");
      setBcc("");
      setSubject(mail.subject);
      setToMail([mail.fromEmail]);
      setShowCc(false); // Reset CC visibility
      setShowBcc(false); // Reset BCC visibility
      setAttachments([]);
    }
  }, [mail]);

  useEffect(() => {
    if (replyAll && mail) {
      setCc(mail.cc ? mail.cc.join(", ") : ""); // Populate CC
      setBcc(mail.bcc ? mail.bcc.join(", ") : ""); // Populate BCC
    } else {
      setCc(""); // Reset CC
      setBcc(""); // Reset BCC
    }
  }, [replyAll, mail]);
  

  // Reset forward body and toMail when the mail changes
  useEffect(() => {
    if (mail) {
      setForwardBody(mail.body); // Pre-fill the body with the original email
      setSub(mail.subject)
      setToForMail([]); // Reset "To" field
      setShowCc(false); // Reset CC visibility
      setShowBcc(false); // Reset BCC visibility
    }
  }, [mail]);

  // Ensure `toEmails` is an array
  const toEmails = Array.isArray(mail?.toEmail)
    ? (mail.toEmail as ToEmail[])
    : mail?.toEmail.split(',').map((email) => ({ email: email.trim() }));

  const isExpanded = expandedEmails[mail?.uid] || false;
  const isCcExpanded = expandedEmails[mail?.uid] || false;

  const toggleExpand = () => {
    setExpandedEmails((prev) => ({
      ...prev,
      [mail.uid]: !isExpanded,
    }))
  }

  const toggleCcExpand = () => {
    setExpandedEmails((prev) => ({
      ...prev,
      [mail.uid]: !isCcExpanded,
    }))
  }

  console.log("selected mail", mail)

  const handleReplySubmit = async () => {
    setIsSending(true); // Start loading state
    const replyData = {
      to: toMail.map(email => email.trim()),  // Join the emails into a single string for the API
      subject: subject,
      uid: mail.uid,
      folder: mail.folder,
      body: replyBody,
      cc: replyAll && cc ? cc.split(",").map(email => email.trim()) : undefined,
      bcc: replyAll && bcc ? bcc.split(",").map(email => email.trim()) : undefined,
      attachments: [...formattedAttachments, ...attachments],
      replyAll,
    }

    try {
      await replyEmail(replyData);
      // Show success toast
      toast({
        title: "Success",
        description: "Reply sent successfully!",
        variant: "success",
      });
      setIsDialogOpen(false);
      setReplyBody(""); // Clear the reply body after sending
      setCc(""); // Clear CC field
      setBcc(""); // Clear BCC field
      setSubject("");
      setAttachments([]);
      setReplyAll(false);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false); // End loading state
    }
  };

  // New functions to handle CC and BCC visibility
  const toggleCc = () => setShowCc(prev => !prev);
  const toggleBcc = () => setShowBcc(prev => !prev);


  const formattedAttachments = Array.isArray(mail?.attachments)
    ? mail.attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    }))
    : [];


  const handleForwardSubmit = async () => {
    setIsSending(true); // Start loading state
    const forwardData = {
      subject: sub,
      uid: mail.uid,
      to: toForMail.map(email => email.trim()), // Clean up email list
      folder: mail.folder,
      body: forwardBody, // Use the body filled with original email content
      attachments: [...formattedAttachments, ...attachments],
    };

    try {
      await forwardEmail(forwardData);
      // Show success toast
      toast({
        title: "Success",
        description: "Forward sent successfully!",
        variant: "success",
      });
      setIsForwardDialogOpen(false);
      setToForMail([""]); // Reset the "To" email field
    } catch (error) {
      console.error("Error sending forward:", error);
    } finally {
      setIsSending(false); // End loading state
    }
  };

  const handleDeleteConfirm = async () => {
    if (mail) {
      setIsDeleting(true); // Start loading state
      try {
        await deleteMail(mail.uid);
        // Show success toast
        toast({
          title: "Success",
          description: "Mail deleted Permenantly!",
          variant: "success",
        });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting mail:", error);
      } finally {
        setIsDeleting(false); // End loading state
      }
    }
  };


  const handleMoveToTrash = async () => {
    if (mail) {
      try {
        await moveTrashMail(mail.folder, mail.uid)
        // Show success toast
        toast({
          title: "Success",
          description: "Mail move to trash!",
          variant: "success",
        });
        // You might want to trigger a state update here to reflect the change in UI
      } catch (error) {
        console.error("Error moving mail to trash:", error);
      }
    }
  };

  const handleMailAction = () => {
    if (mail?.folder === "Trash") {
      setIsDeleteDialogOpen(true); // Open confirmation dialog if in Trash
    } else {
      handleMoveToTrash(); // Move mail to Trash if not already there
    }
  };


  const renderAttachment = (attachment: Attachment) => {
    const { filename, contentType, content } = attachment;

    // Display only the filename as a download link for all attachment types
    return (
      <div key={filename} className="attachment-item flex items-center gap-2">
        <a
          href={`data:${contentType};base64,${content}`}
          download={filename}
          className="text-blue-600 underline"
        >
          {filename}
        </a>
      </div>
    );
  };


  const handleMarkAsUnread = async () => {
    if (mail) {
      try {
        // Call the markUnSeen function with relevant parameters
        await markUnSeen(mail.folder, mail.uid);

        // Show success toast notification
        toast({
          title: "Success",
          description: "Mail marked as unread.",
          variant: "success", // Use the default variant for success
        });

        // Optionally, update local state if needed
        mail.read = false;
      } catch (error) {
        console.error("Error marking mail as unread:", error);

        // Show error toast notification
        toast({
          title: "Error",
          description: "Failed to mark mail as unread.",
          variant: "error",
        });
      }
    }
  };

  // Add a function to handle file uploads
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    try {
      const uploadedFiles = await uploadFiles(files);
      const newFiles = uploadedFiles.map(file => ({ name: file.originalName, id: file._id }));
      setUploadedFiles(prev => [...prev, ...newFiles]); // Update state with file details
      setAttachments(prev => [...prev, ...newFiles.map(file => file.id)]); // Update attachments state
      toast({
        title: "Success",
        description: "File uploaded successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
    }
  };


  // File removal handler
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId)); // Remove file from list
    setAttachments(prev => prev.filter(id => id !== fileId)); // Update attachments state
  };


  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col w-full">
        <div className="flex items-center p-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!mail}
                    onClick={handleMailAction}
                  >
                    {mail && mail.folder === "Trash" ? (
                      <Trash2 className="h-4 w-4" /> // Show delete icon if in Trash
                    ) : (
                      <Trash2 className="h-4 w-4" /> // Show move to trash icon for other folders
                    )}
                    <span className="sr-only" >
                      {mail && mail.folder === "Trash" ? "Delete permanently" : "Move to trash"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent style={{ marginTop: '8px' }}>
                  {mail && mail.folder === "Trash" ? "Delete permanently" : "Move to trash"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className=" flex justify-between  ml-auto items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={() => { setIsDialogOpen(true); setReplyAll(false); }}>
                    <Reply className="h-4 w-4" />
                    <span className="sr-only">Reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={() => {
                    setReplyAll(true);
                    setIsDialogOpen(true);
                    setShowCc(false); // Show CC field
                    setShowBcc(false); // Show BCC field
                  }}>
                    <ReplyAll className="h-4 w-4" />
                    <span className="sr-only">Reply all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply all</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={() => setIsForwardDialogOpen(true)}>
                    <Forward className="h-4 w-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* <Separator orientation="vertical" className="mx-2 h-6" /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mail}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkAsUnread}>Mark as unread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator className="bg-gray-200 h-[1px]" />

        {mail ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-start p-4">
              <div className="flex items-start gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt={mail.name} />
                  <AvatarFallback>
                    {mail.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  {/* <div className="font-semibold">{mail.name}</div> */}
                  <div className="line-clamp-1 text-xs"><span className="font-medium">Subject:</span> {mail.subject}</div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">From:</span> {mail.fromEmail}
                  </div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">To:</span>
                    {toEmails.length > 0 ? (
                      !isExpanded ? (
                        <>
                          {toEmails.slice(0, 1).map((recipient, index) => (
                            <span key={index} className="text-xs mr-2"> {recipient.email}</span>
                          ))}
                          {toEmails.length > 1 && (
                            <button onClick={toggleExpand} className="text-blue-500">
                              +{toEmails.length - 1} more
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-wrap space-x-2">
                          {toEmails.map((recipient, index) => (
                            <span key={index} className="text-xs">
                              {recipient.email}
                              {index < toEmails.length - 1 && '\u00A0,'}
                            </span>
                          ))}
                        </div>
                      )
                    ) : (
                      <span>No recipients</span>
                    )}
                  </div>
                  {mail.cc && mail.cc.length > 0 && (
            <div className="line-clamp-1 text-xs">
              <span className="font-medium">Cc:</span>
              {mail.cc.length > 0 ? (
                !isCcExpanded ? (
                  <>
                    {mail.cc.slice(0, 1).map((recipient, index) => (
                      <span key={index} className="text-xs mr-2"> {recipient}</span>
                    ))}
                    {mail.cc.length > 1 && (
                      <button onClick={toggleCcExpand} className="text-blue-500">
                        +{mail.cc.length - 1} more
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap space-x-2">
                    {mail.cc.map((recipient, index) => (
                      <span key={index} className="text-xs">
                        {recipient}
                        {index < mail.cc.length - 1 && '\u00A0,'}
                      </span>
                    ))}
                  </div>
                )
              ) : (
                <span>No CC recipients</span>
              )}
            </div>
          )}

                </div>
              </div>
              {mail.date && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(mail.date), "PPpp")}
                </div>
              )}
            </div>
            <Separator className="bg-gray-200 h-[1px]" />

            <ScrollArea className="h-[100vhvh]">
              <div className="flex flex-col p-4 ">
                <div className="text-sm"
                  style={{
                    overflowY: 'auto',

                    //  height: '27rem'
                  }}
                  // className="overflow-y-auto h-80"
                  dangerouslySetInnerHTML={{ __html: mail.body }} />
                <div className='text-md mt-4'>
                  {Array.isArray(mail?.attachments) && mail.attachments.length > 0 && (
                    <div className="attachments-section">
                      <div className="attachments-list">
                        {mail.attachments.map((attachment) => renderAttachment(attachment))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* <Separator className="bg-gray-200 h-[1px]"  /> */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{replyAll ? "Reply All" : "Reply"}</DialogTitle>
                  <DialogDescription>
                    {replyAll ? "Replying to all recipients." : "Replying to the sender."}
                  </DialogDescription>
                </DialogHeader>
                {isSending ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        placeholder="To"
                        className="flex-grow p-2 border rounded"
                        value={toMail.join(", ")}
                        onChange={(e) =>
                          setToMail(e.target.value.split(",").map(email => email.trim()))
                        }
                      />
                      {replyAll && (
                        <div className="flex items-center space-x-2 w-[10%]">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={toggleCc} // Toggle CC field
                          >
                            CC
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={toggleBcc} // Toggle BCC field
                          >
                            BCC
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Conditionally render CC and BCC fields */}
                    {showCc && (
                      <input
                        placeholder="CC"
                        className="w-full p-2 border rounded"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                      />
                    )}
                    {showBcc && (
                      <input
                        placeholder="BCC"
                        className="w-full p-2 border rounded"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                      />
                    )}

                    <input
                      placeholder="Subject"
                      className="w-full p-2 border rounded"
                      value={subject} // Bind to state variable
                      onChange={(e) => setSubject(e.target.value)} 
                    />
                    <TiptapEditor
                      value={replyBody}
                      onChange={(newBody) => setReplyBody(newBody)} // Update emailBody on editor change
                    />
                    <div>
                      {/* {Array.isArray(mail?.attachments) && mail.attachments.length > 0 && (

<div>
  <h3 className="text-lg font-semibold">Attachments</h3>
  <ul className="space-y-2">
    {mail.attachments.map((attachment, index) => (
      <li key={index} className="flex items-center space-x-2">
        <a
          href={`data:${attachment.contentType};base64,${attachment.content}`}
          download={attachment.filename}
          className="text-blue-600 underline"
        >
          {attachment.filename}
        </a>
        <span className="text-gray-600 text-sm">({attachment.size} bytes)</span>
      </li>
    ))}
  </ul>
</div>
)} */}
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />

                        {/* Custom label acting as a button */}
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Choose File
                        </label>

                        {/* List of uploaded files */}
                        <ul className="mt-2 space-y-2">
                          {uploadedFiles.map(file => (
                            <li key={file.id} className="flex items-center space-x-4">
                              <span className="truncate">{file.name}</span>
                              <CircleX
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-red-500 hover:underline cursor-pointer"
                              />
                              {/* Remove
                              </button> */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                )}
                {!isSending && (
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        className="bg-gray-500 text-white hover:bg-gray-600"
                      >Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="default" // Use one of the supported variants
                      className="bg-orange-500 text-white hover:bg-orange-600" // Add custom styling
                      onClick={handleReplySubmit}>Send</Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
              <DialogTrigger asChild>
                {/* Your Trigger Button Here, if needed */}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Forward</DialogTitle>
                  <DialogDescription>
                    Forwarding this email to a recipient.
                  </DialogDescription>
                </DialogHeader>
                {isSending ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        placeholder="To"
                        className="flex-grow p-2 border rounded"
                        value={toForMail.join(", ")}
                        onChange={(e) =>
                          setToForMail(e.target.value.split(",").map(email => email.trim()))
                        }
                      />
                      <div className="flex items-center space-x-2 w-[10%]">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={toggleCc}
                        >
                          CC
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={toggleBcc}
                        >
                          BCC
                        </Button>
                      </div>
                    </div>

                    {/* Conditionally render CC and BCC fields */}
                    {showCc && (
                      <input
                        placeholder="CC"
                        className="w-full p-2 border rounded"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                      />
                    )}
                    {showBcc && (
                      <input
                        placeholder="BCC"
                        className="w-full p-2 border rounded"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                      />
                    )}
                    <input
                      placeholder="Subject"
                      className="w-full p-2 border rounded"
                      value={sub} // Bind to state variable
                      onChange={(e) => setSub(e.target.value)} // Update state on change
                    />
                    <div className="flex flex-col">
                      <TiptapEditor
                        value={forwardBody}
                        onChange={(newValue) => setForwardBody(newValue)}
                      />
                    </div>
                    <div className="space-y-3">
                      {Array.isArray(mail?.attachments) && mail.attachments.length > 0 && (

                        <div>
                          <h3 className="text-lg font-semibold">Attachments</h3>
                          <ul className="space-y-2">
                            {mail.attachments.map((attachment, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <a
                                  href={`data:${attachment.contentType};base64,${attachment.content}`}
                                  download={attachment.filename}
                                  className="text-blue-600 underline"
                                >
                                  {attachment.filename}
                                </a>
                                <span className="text-gray-600 text-sm">({attachment.size} bytes)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />

                        {/* Custom label acting as a button */}
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Choose File
                        </label>

                        <ul className="mt-2 space-y-2">
                          {uploadedFiles.map(file => (
                            <li key={file.id} className="flex items-center space-x-4">
                              <span className="truncate">{file.name}</span>
                              <CircleX
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-red-500 hover:underline cursor-pointer"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {!isSending && (

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline"
                        className="bg-gray-500 text-white hover:bg-gray-600"
                      >Cancel
                      </Button>
                    </DialogClose>
                    <Button onClick={handleForwardSubmit}
                      className="bg-orange-500 text-white hover:bg-orange-600" // Add custom styling
                    >Send
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No message selected
          </div>
        )
        }
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Permanently</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this email? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {isDeleting ? (
              <div className="flex justify-center items-center p-4">
                <Loader />
              </div>
            ) : (
              <DialogFooter>
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-600"  // Add custom styling 
                  onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive"
                  className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>


      </div >
    </>
  )
}
