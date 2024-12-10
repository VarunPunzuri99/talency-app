"use client"

import * as React from "react"
import {
  Archive,
  Inbox,
  Search,
  Send,
  Trash2,
  Plus,
  FolderClosed,
  FolderPlus,
  RefreshCw,
  CircleX,
} from "lucide-react"
import { cn } from "@/utils/Ui"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MailDisplay, { Mail as DisplayMail } from "./mail-display";
import MailList from "./mail-list"
import Nav from "./nav"
import { useMail } from "@/utils/Ui/use-mail"
import { Button } from "@/components/ui/button"
import { getMailboxFolders, getMailsByFolders, getUnreadCount, mailFolders, moveEmails, searchMail, sendEmail, uploadFiles } from "@/services/api.service"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import TiptapEditor from "@/components/TiptapEditor"
import { useState } from "react"
import Loader from "@/components/Loader"
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { DragDropContext } from "@hello-pangea/dnd"

interface MailProps {
  mails: DisplayMail[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}


export default function Mail({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {

  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useMail()
  const [folders, setFolders] = React.useState([]);
  const [mailData, setMailData] = React.useState<DisplayMail[]>([]);
  const [filteredMailData, setFilteredMailData] = React.useState<DisplayMail[]>([]);
  const [selectedFolder, setSelectedFolder] = React.useState("INBOX"); // Default to INBOX or another folder
  const [unreadCounts, setUnreadCounts] = React.useState<{ [key: string]: number }>({}); // Store unread counts
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = React.useState(true);
  const [isComposeOpen, setIsComposeOpen] = React.useState(false); // New state to manage compose dialog visibility
  const [unreadMails, setUnreadMails] = React.useState<DisplayMail[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; id: string }[]>([]);
  // ... existing state variables
  const [toError, setToError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const { toast } = useToast();
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = React.useState(false); // State to manage sending loader in compose dialog
  const [attachments, setAttachments] = useState<string[]>([]); // Store file IDs here
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false); // Modal visibility
  const [newFolderName, setNewFolderName] = React.useState(""); // Folder name input


  // Function to handle toggling of CC and BCC fields
  const toggleCcField = () => setShowCc((prev) => !prev);
  const toggleBccField = () => setShowBcc((prev) => !prev);
  const fallbackIcons = [FolderClosed];

  const folderIcons = {
    INBOX: Inbox,
    Sent: Send,
    Spam: Archive,
    Trash: Trash2,
    // Add more mappings as needed based on your folders
  };

  React.useEffect(() => {
    async function fetchFolders() {
      setLoading(true);
      try {
        const folderResponse = await getMailboxFolders(); // Fetch mailbox folders
        setFolders(folderResponse);

        // Set default folder as INBOX and load its emails
        if (folderResponse.includes("INBOX")) {
          setSelectedFolder("INBOX");
          await handleFolderClick("INBOX"); // Load emails for INBOX
        } else if (folderResponse.length > 0) {
          // Fallback to the first folder if INBOX is not available
          setSelectedFolder(folderResponse[0]);
          await handleFolderClick(folderResponse[0]);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch folders on component mount
    fetchFolders();
  }, []);

  React.useEffect(() => {
    async function fetchUnreadCount() {
      if (!selectedFolder) return; // Ensure a folder is selected

      try {
        const countResponse = await getUnreadCount(selectedFolder);
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [selectedFolder]: countResponse.unreadCount, // Update only the selected folder's count
        }));
      } catch (error) {
        console.error(`Error fetching unread count for ${selectedFolder}:`, error);
      }
    }

    // Fetch unread count whenever the selected folder changes
    fetchUnreadCount();
  }, [selectedFolder]);


  React.useEffect(() => {
    // Only set the default folder if no folder is already selected
    if (!selectedFolder) {
      setSelectedFolder("INBOX");
    }
  }, [selectedFolder]);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };


  // Function to handle folder click and fetch its emails
  const handleFolderClick = async (folder: string) => {
    setLoading(true);
    console.log(`Folder clicked: ${folder}`);
    setMailData([]);
    setSelectedFolder(folder);
    setSearchTerm("");

    try {
      const emailsResponse = await getMailsByFolders( folder);
      const emails = emailsResponse?.emails || emailsResponse?.data?.emails || [];

      if (!Array.isArray(emails)) {
        console.error("Expected an array but got:", emails);
        return;
      }

      const transformedEmails = emails.map((data) => transformEmailData(data, folder));
      setMailData(transformedEmails);
      setUnreadMails(transformedEmails.filter((email) => !email.read));
    } catch (error) {
      console.error(`Error fetching emails for folder ${folder}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const transformEmailData = (data: any, selectedFolders: string): DisplayMail => {
    const fromEmail = data.headers.FromEmail || "";
    const toEmail = data.headers.To.map((recipient: any) => recipient.email).join(", ");
    const date = new Date(data.headers.Date).toISOString();
    const { body, attachments } = data;
    const read = data.flags.includes("\\Seen");
    return {
      uid: data.uid,
      name: data.headers.FromName?.trim() || fromEmail,
      fromEmail,
      toEmail,
      subject: data.headers.Subject || "",
      date,
      body,
      read,
      folder: selectedFolders,
      attachments: attachments.map(({ filename, contentType, contentDisposition, size, contentId, content }) => ({
        filename, contentType, contentDisposition, size, contentId, content
      })),
      labels: [] // Replace with logic for labels if applicable
    };
  };



  // Function to handle sending the email
  const handleSendEmail = async () => {
    let hasError = false;

    // Validate required fields
    if (!to) {
      setToError("To field is required."); // Set error message for To
      hasError = true;
    } else if (!isValidEmail(to)) {
      setToError("Please enter a valid email address.");
      hasError = true
    } else {
      setToError(""); // Clear error message
    }

    if (!subject) {
      setSubjectError("Subject field is required."); // Set error message for Subject
      hasError = true;
    } else {
      setSubjectError(""); // Clear error message
    }

    if (!emailBody) {
      setBodyError("Email body is required."); // Set error message for Body
      hasError = true;
    } else {
      setBodyError(""); // Clear error message
    }

    if (hasError) return; // Prevent sending email if there are validation errors

    const emailData = {
      to: to.split(",").map(email => email.trim()), // Split by comma for multiple recipients
      cc: cc ? cc.split(",").map(email => email.trim()) : [], // Convert to array, or leave empty if no CC
      bcc: bcc ? bcc.split(",").map(email => email.trim()) : [], // Convert to array, or leave empty if no BCC
      subject,
      body: emailBody,
      attachments, // Add any attachments if needed
    };


    try {
      setIsSending(true); // Start sending state
      resetComposeForm(); // Clear form fields immediately
      const response = await sendEmail(emailData);
      console.log("Email sent successfully:", response);

      // Close the dialog and reset fields
      setIsComposeOpen(false);

      // Show success toast
      toast({
        title: "Success",
        description: "Email sent successfully!",
        variant: "success",
      });

    } catch (error) {
      console.error("Error while sending email:", error);
    } finally {
      setIsSending(false); // End sending state
      setIsComposeOpen(false); // Close the modal after sending
    }
  };

  // Function to handle dropping emails onto folders


  const fetchAndSetMails = async (folder: string, term: string) => {
    try {
      const emailsResponse = await searchMail( folder, term);
      const listOfMails = Object.keys(emailsResponse)
      const emails = Array.isArray(emailsResponse[listOfMails[0]]) ? emailsResponse[listOfMails[0]] : [];
      const transformedEmails = emails.map((data) => transformEmailData(data, folder));

      setFilteredMailData(transformedEmails);
      if (term) {
        setFilteredMailData(transformedEmails);
        console.log("filtered data for the term:", transformedEmails)
      } else {
        setMailData(transformedEmails);
        setFilteredMailData([]); // Reset filtered data when no search term
      }
    } catch (error) {
      console.error(`Error fetching emails for folder ${folder}:`, error);
    }
  };


  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    await fetchAndSetMails(selectedFolder, term);
  };

  const handleRefreshFolders = async () => {
    try {
      setLoading(true); // Show loader during the refresh
      const refreshedFolders = await getMailboxFolders(); // Fetch folders using your endpoint
      setFolders(refreshedFolders);

      // Optional: Reload the emails in the selected folder
      if (selectedFolder) {
        await handleFolderClick(selectedFolder);
      }

      toast({
        title: "Folders refreshed",
        description: "Mailbox folders have been successfully refreshed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing folders:", error);
      toast({
        title: "Error",
        description: "Failed to refresh mailbox folders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Hide loader after the refresh is done
    }
  };



  // Function to get folder icon (use default if not found)
  const getFolderIcon = (folder: string) => {
    return folderIcons[folder] || fallbackIcons[Math.floor(Math.random() * fallbackIcons.length)];
  };
  if (loading) {
    return <Loader />;
  }

  const handleUpdateMailItem = (updatedItem: DisplayMail) => {
    setMailData((prevData) =>
      prevData.map((item) =>
        item.uid === updatedItem.uid ? updatedItem : item
      )
    );

    setFilteredMailData((prevData) =>
      prevData.map((item) =>
        item.uid === updatedItem.uid ? updatedItem : item
      )
    );

    setUnreadMails((prevData) =>
      prevData.filter((item) => item.uid !== updatedItem.uid) // Remove from unread if marked read
    );
  };

  const resetComposeForm = () => {
    [setTo, setCc, setBcc, setSubject, setEmailBody, setToError, setSubjectError, setBodyError].forEach(fn => fn(""));
    setAttachments([]);
  };

  const handleCreateFolder = async () => {
    const trimmedFolderName = newFolderName.trim();
    if (!trimmedFolderName) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      await mailFolders({ folderName: trimmedFolderName });
      toast({
        title: "Success",
        description: `Folder "${trimmedFolderName}" created successfully!`,
        variant: "success",
      });
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      setFolders(await getMailboxFolders());
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create the folder.",
        variant: "destructive",
      });
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

  const handleDropEmail = async (folder: string, emailUIDs: string[]) => {
    const sanitizedFolderName = folder.replace(/\s\(\d+\)$/, "");
    setLoading(true);
    try {
      await moveEmails({
        sourceFolder: selectedFolder,
        destinationFolder: sanitizedFolderName,
        emailUIDs,
      });
      setMailData((prev) =>
        prev.filter((email) => !emailUIDs.includes(email.uid))
      );
      // setSelectedFolder(folder);
      toast({
        title: "Success",
        description: `Emails successfully moved to folder "${sanitizedFolderName}".`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error moving emails:", error);
      toast({
        title: "Error",
        description: "Failed to move emails.",
        variant: "destructive",
      });
    } finally {
      // Hide the loading indicator
      setLoading(false);
    }
  };
  // Handle drag end
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const emailUIDs = [draggableId];
    const destinationFolder = destination.droppableId;

    if (source.droppableId !== destinationFolder) {
      handleDropEmail(destinationFolder, emailUIDs);
    }
  };



  return (
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <DragDropContext onDragEnd={onDragEnd}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            localStorage.setItem('react-resizable-panels:layout:mail', JSON.stringify(sizes))
          }}
          className="h-[100vh] items-stretch makeItfullHeight"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true)
              localStorage.setItem('react-resizable-panels:collapsed', JSON.stringify(true))
            }}
            onResize={() => {
              setIsCollapsed(false)
              localStorage.setItem('react-resizable-panels:collapsed', JSON.stringify(true))
            }}
            className={cn(
              isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
            )}
          >

            <div
              className={cn(
                "flex h-[52px] items-center justify-center space-x-4",
                isCollapsed ? "h-[52px]" : "px-2"
              )}
            >
              {isCollapsed ? (
                <>
                  <Plus
                    style={{ color: "#e56a48", fontSize: "35px", height: "1.5rem", width: "1.5rem" }}
                    onClick={() => setIsComposeOpen(true)} // Open compose dialog
                  />
                  <FolderPlus
                    style={{ color: "#e56a48", fontSize: "35px", height: "1.5rem", width: "1.5rem" }}
                    onClick={() => setIsCreateFolderOpen(true)} // Open folder creation modal
                  />
                </>
              ) : (
                <>

                  <Dialog open={isComposeOpen} onOpenChange={(isOpen) => {
                    setIsComposeOpen(isOpen);
                    if (!isOpen) resetComposeForm(); // Reset form when the dialog is closed
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full hover:shadow-lg hover:shadow-[#f1d0c6] transition-shadow"
                      ><Plus style={{ color: '#e56a48', fontSize: '35px', height: '1.5rem', width: '1.5rem' }} />Compose</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Compose New Email</DialogTitle>
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
                              className="flex-grow p-2 border rounded" // Takes around 80% width
                              value={to}
                              onChange={(e) => setTo(e.target.value)}
                            />
                            {toError && <p className="text-red-600">{toError}</p>}
                            <div className="flex items-center space-x-2 w-[10%]">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={toggleCcField}
                              >
                                CC
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={toggleBccField}
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
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                          {subjectError && <p className="text-red-600">{subjectError}</p>}
                          <TiptapEditor
                            value={emailBody}
                            onChange={(newBody) => setEmailBody(newBody)} // Update emailBody on editor change
                          />
                          {bodyError && <p className="text-red-600">{bodyError}</p>}

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
                      )}
                      {!isSending && (
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary"
                              className="bg-gray-500 text-white hover:bg-gray-600" // Add custom styling
                            >Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleSendEmail}
                            className="bg-orange-500 text-white hover:bg-orange-600" // Add custom styling
                          >Send</Button>
                        </DialogFooter>
                      )}


                    </DialogContent>
                  </Dialog>
                  <div
                    className="h-[32px] w-[1px] bg-gray-300 shadow-md"
                    style={{
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Optional custom shadow
                    }}
                  ></div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FolderPlus
                          style={{ color: "#e56a48", fontSize: "35px", height: "1.7rem", width: "1.7rem", cursor: "pointer", }}
                          onClick={() => setIsCreateFolderOpen(true)} // Open modal on click
                        />
                        <TooltipContent style={{ marginTop: "8px" }}>
                          New Folder
                        </TooltipContent>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Create Folder Modal */}
                  <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                    <DialogContent  >
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Folder Name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="secondary"
                          onClick={() => setIsCreateFolderOpen(false)} // Close modal
                          className="bg-gray-500 text-white hover:bg-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateFolder}
                          className="bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
            <Separator className="bg-gray-200 h-[1px]" />
            <Nav
              isCollapsed={isCollapsed}
              selectedFolder={selectedFolder} // Pass selectedFolder state here
              links={folders?.map((folder) => {
                const unreadCount = unreadCounts[folder] || 0;

                const isInbox = folder === "INBOX";
                const folderDisplayName = isInbox
                  ? `Inbox (${unreadCount})`
                  : `${folder} (${unreadCount})`; // Display logic for UI only


                return {
                  title: unreadCount > 0 ? folderDisplayName : folder, // Use display name only for UI
                  icon: getFolderIcon(folder), // Use dynamic icon assignment
                  variant: "default", // Or use a custom variant based on your design
                  onClick: () => {
                    console.log(`Clicked on folder: ${folder}`);
                    if (selectedFolder !== folder) {
                      setSelectedFolder(folder); // Update selected folder
                      handleFolderClick(folder); // Fetch emails for the folder
                    }
                  },
                };
              })}
              onDropEmail={(folder, emailUIDs) => handleDropEmail(folder, emailUIDs)}
            />

          </ResizablePanel>
          <ResizableHandle withHandle className="bg-gray-300 w-[1px]" />
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            <Tabs defaultValue="all">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-xl font-bold">{selectedFolder}</h1>
                <TabsList className="ml-auto bg-gray-100">
                  <TabsTrigger
                    value="all"
                    className={cn(
                      "text-zinc-600 dark:text-zinc-200",
                      "hover:bg-[#f1d0c6]", // Hover effect
                      "data-[state=active]:bg-[#e56a48] data-[state=active]:text-white" // Orange background and white text when active
                    )}
                  >
                    All mail
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className={cn(
                      "text-zinc-600 dark:text-zinc-200",
                      "hover:bg-[#f1d0c6]", // Hover effect
                      "data-[state=active]:bg-[#e56a48] data-[state=active]:text-white" // Orange background and white text when active
                    )}
                  >
                    Unread
                  </TabsTrigger>
                </TabsList>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        className="ml-4 p-2 rounded-full"
                        style={{ color: "#e56a48", fontSize: "35px", height: "2rem", width: "2rem" }}
                        onClick={handleRefreshFolders} // This is where onClick is added
                        disabled={loading} // Disable while loading
                      >
                        <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                      </button>
                      <TooltipContent style={{ marginTop: "8px" }}>
                        Refresh
                      </TooltipContent>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator className="bg-gray-200 h-[1px]" />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" value={searchTerm} onChange={handleSearchChange} className="pl-8" />
                  </div>
                </form>
              </div>
              <TabsContent value="all" className="m-0">
                {searchTerm ? (
                  <MailList items={filteredMailData} onUpdateItem={handleUpdateMailItem}  // Pass the user ID for API calls
                    sourceFolder={selectedFolder} // Pass the current folder
                  />
                ) : (
                  <MailList items={mailData} onUpdateItem={handleUpdateMailItem} // Pass the user ID for API calls
                    sourceFolder={selectedFolder} // Pass the current folder
                  />
                )}
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                <MailList items={unreadMails} onUpdateItem={handleUpdateMailItem} // Pass the user ID for API calls
                  sourceFolder={selectedFolder}
                // Pass the current folder
                />
              </TabsContent>

            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-gray-300 w-[1px]" />
          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
            <MailDisplay
              mail={mailData.find((item) => item.uid === mail.selected) || null}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </DragDropContext>
    </TooltipProvider>
  )
}
