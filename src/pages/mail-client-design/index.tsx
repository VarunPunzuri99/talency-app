import Image from "next/image"
import  Mail  from "./components/mail"
import { getMailsFromFolders } from "@/services/api.service"
import { useEffect, useState } from "react"
import Loader from "@/components/Loader";

export default function MailPage({ userId }) {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  const defaultLayout =  undefined
  const defaultCollapsed =  undefined

  useEffect(() => {
    const fetchMails = async () => {
      setLoading(true); // Start loading
      try {
        const response = await getMailsFromFolders(); // Call your API function
        setMails(response); // Adjust according to your API response structure
      } catch (error) {
        setError(error.message); // Set error if fetching fails
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchMails(); // Invoke the fetching function
  }, [userId]);

  if (loading) {
    return <Loader />; // Display loader component during loading
  }


  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }



  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
