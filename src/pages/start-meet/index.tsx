'use client';
import { useEffect, useState } from 'react';
import { customAlphabet } from 'nanoid';
import Image from 'next/image';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { ButtonWithIcon } from '@/components/ui/buttonWithIcon';
import { Input} from '@/components/ui/input';
import Videocall from '@/utils/icons/Videocall';
import { useRouter } from 'next/navigation';
import MeetNav from '@/components/ui/meet-nav';

const generateMeetingId = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 4);

  return `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
};


const Home = () => {
  const [code, setCode] = useState('');
  const [checkingCode] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (error) {
      timeout = setTimeout(() => {
        setError('');
      }, 3000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [error]);

//   const handleNewMeeting = () => {
//     setNewMeeting(true);
//     router.push(`/${generateMeetingId()}`);
//   };

//   const handleCode = async () => {
//     if (!MEETING_ID_REGEX.test(code)) return;
//     setCheckingCode(true);

//     const client = new StreamVideoClient({
//       apiKey: API_KEY,
//       user: GUEST_USER,
//     });
//     const call = client.call(CALL_TYPE, code);

//     try {
//       const response: GetCallResponse = await call.get();
//       if (response.call) {
//         router.push(`/${code}`);
//         return;
//       }
//     } catch (e: unknown) {
//       let err = e as ErrorFromResponse<GetCallResponse>;
//       console.error(err.message);
//       if (err.status === 404) {
//         setError("Couldn't find the meeting you're trying to join.");
//       }
//     }

//     setCheckingCode(false);
//   };

  return (
    <div>
      <MeetNav />
      <main
        className={clsx(
          'flex flex-col items-center justify-center px-6',
          'animate-fade-in' 
        )}
      >
        <div className="w-full max-w-2xl p-4 pt-7 text-center inline-flex flex-col items-center basis-auto shrink-0">
          <h1 className="text-5xl tracking-normal text-black pb-2">
            Video calls and meetings for everyone
          </h1>
          <p className="text-1x text-gray pb-8">
            Connect, collaborate, from anywhere with Talency Meet
          </p>
        </div>
        <div className="w-full max-w-xl flex justify-center">
          <div className="flex flex-col items-start sm:flex-row gap-6 sm:gap-2 sm:items-center justify-center">
            
              <ButtonWithIcon variant='secondary' icon={<Videocall />} onClick={() =>  router.push(`/${generateMeetingId()}/join`)}>
                New meeting
              </ButtonWithIcon>
            <div className="flex items-center gap-2 sm:ml-4">
              <Input
                name="code"
                placeholder="Enter a code or link"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button disabled={!code}>
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-xl mx-auto border-b border-b-border-gray self-stretch mt-8 mb-20" />
        <div className="flex flex-col items-center justify-center gap-8">
          <Image
            src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"
            alt="Get a link you can share"
            width={248}
            height={248}
          />
          <div className="flex flex-col gap-2 text-center max-w-sm">
            <h2 className="text-2xl tracking-normal text-black">
              Get a link you can share
            </h2>
            <p className="font-roboto text-sm text-black pb-8 grow">
              Click <span className="font-bold">New meeting</span> to get a link
              you can send to people you want to meet with
            </p>
          </div>
        </div>
        {checkingCode && (
          <div className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center text-white text-3xl bg-[#000] animate-transition-overlay-fade-in">
            Joining...
          </div>
        )}
        {error && (
          <div className="z-50 fixed bottom-0 left-0 pointer-events-none m-6 flex items-center justify-start">
            <div className="rounded p-4 font-roboto text-white text-sm bg-dark-gray shadow-[0_3px_5px_-1px_rgba(0,0,0,.2),0_6px_10px_0_rgba(0,0,0,.14),0_1px_18px_0_rgba(0,0,0,.12)]">
              {error}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
