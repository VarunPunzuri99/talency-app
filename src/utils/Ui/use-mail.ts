import { atom, useAtom } from "jotai"
interface ToEmail {
  email: string;
}

interface Mail {
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
  labels: string[];
}

type Config = {
  selected: Mail["uid"] | null
}

// Assuming you no longer have mails statically and rely on fetched data:
const configAtom = atom<Config>({
  selected: null, // Set the initial value to `null` as there's no static data
})

export function useMail() {
  return useAtom(configAtom)
}

