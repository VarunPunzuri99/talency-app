import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
// import CallParticipants from '@/components/ui/CallParticipants';
// import Header from '@/components/ui/Header';
import MeetingPreview from '@/components/ui/meetingPreview';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {setUserName} from '@/redux/meet';
import { useAppDispatch } from '@/redux';



const Lobby = () => {
  const param = useParams();
  const {meetingId}  = param || {};
  const dispatch = useAppDispatch();
  const isSignedIn  = true;
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [errorFetchingMeeting] = useState(false);
  const [loading] = useState(false);
  const [joining] = useState(false);
  const isGuest = !isSignedIn;

//   useEffect(() => {
    // const leavePreviousCall = async () => {
    //   if (callingState === CallingState.JOINED) {
    //     await call?.leave();
    //   }
    // };

    // const getCurrentCall = async () => {
    //   try {
    //     const callData = await call?.get();
    //     setParticipants(callData?.call?.session?.participants || []);
    //   } catch (e) {
    //     const err = e as ErrorFromResponse<GetCallResponse>;
    //     console.error(err.message);
    //     setErrorFetchingMeeting(true);
    //   }
    //   setLoading(false);
    // };

    // const createCall = async () => {
    //   await call?.create({
    //     data: {
    //       members: [
    //         {
    //           user_id: connectedUser?.id!,
    //           role: 'host',
    //         },
    //       ],
    //     },
    //   });
    //   setLoading(false);
    // };

    // if (!joining && validMeetingId) {
    //   leavePreviousCall();
    //   if (!connectedUser) return;
    //   if (newMeeting) {
    //     createCall();
    //   } else {
    //     getCurrentCall();
    //   }
    // }
//   }, [call, callingState, joining]);

//   useEffect(() => {
//     setNewMeeting(newMeeting);

//     return () => {
//       setNewMeeting(false);
//     };
//   }, [newMeeting, setNewMeeting]);

  const heading = useMemo(() => {
    if (loading) return 'Getting ready...';
    return isGuest ? "What's your name?" : 'Ready to join?';
  }, [loading, isGuest]);

  // we need to add the user as per the users added in the room
  // const participantsUI = useMemo(() => {
  //   switch (true) {
  //     case loading:
  //       return "You'll be able to join in just a moment";
  //     case joining:
  //       return "You'll join the call in just a moment";
  //     case participants.length === 0:
  //       return 'No one else is here';
  //       // Need to check is the user are there before joing the call
  //     // case participants.length > 0:
  //     //   return <CallParticipants participants={participants} />;
  //     default:
  //       return null;
  //   }
  // }, [loading, joining, participants]);


//   const updateGuestName = async () => {
//     try {
//       await fetch('/api/user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           user: { id: connectedUser?.id, name: guestName },
//         }),
//       });
//       await chatClient.disconnectUser();
//       await chatClient.connectUser(
//         {
//           id: GUEST_ID,
//           type: 'guest',
//           name: guestName,
//         },
//         tokenProvider
//       );
//     } catch (error) {
//       console.error(error);
//     }
//   };

// when we setuop the room we need to allow users as need
//   const joinCall = async () => {
//     setJoining(true);
//     if (isGuest) {
//       await updateGuestName();
//     }
//     if (callingState !== CallingState.JOINED) {
//       await call?.join();
//     }
//     router.push(`/${meetingId}/meeting`);
//   };
const joinCall = () => {
  dispatch(setUserName(guestName));
  router.push(`/${meetingId}/meet`)
}

//   validate on BE setuup Done to validate the meeting

//   if (!validMeetingId)
//     return (
//       <div>
//         <Header />
//         <div className="w-full h-full flex flex-col items-center justify-center mt-[6.75rem]">
//           <h1 className="text-4xl leading-[2.75rem] font-normal text-dark-gray tracking-normal mb-12">
//             Invalid video call name.
//           </h1>
//           <Button size="sm" onClick={() => router.push('/')}>
//             Return to home screen
//           </Button>
//         </div>
//       </div>
//     );

  if (errorFetchingMeeting) {
    router.push(`/${meetingId}/meeting-end?invalid=true`);
  }

  return (
      <main className="lg:h-[100%] p-4 mt-3 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-8">
        <MeetingPreview />
        <div className="flex flex-col items-center lg:justify-center gap-4 grow-0 shrink-0 basis-112 h-135 mr-2 lg:mb-13">
          <h2 className="text-black text-3xl text-center truncate">
            {heading}
          </h2>
            <Input
              name="name"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            {/* Need if you need to know any already joined the call for that kind of it will return */}
          {/* <span className="text-meet-black font-medium text-center text-sm cursor-default">
            {participantsUI}
          </span> */}
          <div>
            {!joining && !loading && (
              <Button
                className="w-60 text-sm"
                variant="secondary"
                onClick={joinCall}
                disabled={guestName === ''}
              >
                Join now
              </Button>
            )}
            {(joining || loading) && (
              <div className="h-14 pb-2.5">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </main>
  );
};

export default Lobby;
