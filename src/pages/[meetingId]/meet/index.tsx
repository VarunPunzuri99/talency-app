'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import {
//   CallingState,
//   hasScreenShare,
//   isPinned,
//   RecordCallButton,
//   StreamTheme,
//   useCall,
//   useCallStateHooks,
//   useConnectedUser,
// } from '@stream-io/video-react-sdk';
// import { Channel } from 'stream-chat';
// import { DefaultStreamChatGenerics, useChatContext } from 'stream-chat-react';
import CallEndFilled from '@/components/ui/icons/CallEndFilled';
import CallControlButton from '@/components/ui/CallControlButton';
import Chat from '@/components/ui/icons/Chat';
import ChatFilled from '@/components/ui/icons/ChatFilled';
import ChatPopup from '@/components/ui/ChatPopup';
import PresentToAll from '@/components/ui/icons/PresentToAll';
import MeetingPopup from '@/components/ui/MeetingPopup';
import MoreVert from '@/components/ui/icons/moreVert';
import RecordingsPopup from '@/components/ui/RecordingsPopup';
import GridLayout from '@/components/ui/GridLayout';
import SpeakerLayout from '@/components/ui/SpeakerLayout';
import ToggleAudioButton from '@/components/ui/ToggleAudioButton';
import ToggleVideoButton from '@/components/ui/ToggleVideoButton';
import CallInfoButton from '@/components/ui/CallInfoButton';
import useTime from '@/hooks/useTime';
import { useAppDispatch, useAppSelector } from '@/redux';
import { muteAction, videoActions } from '@/redux/meet';
import ClosedCaptions from '@/components/ui/icons/ClosedCaptions';

let stream = null;
const Meeting = () => {
  const param = useParams();
  const {meetingId}  = param || {};
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  // const call = useCall();
  // const user = useConnectedUser();
  // const { client: chatClient } = useChatContext();
  // const { useCallCallingState, useParticipants, useScreenShareState } =
  //   useCallStateHooks();

  const { currentTime } = useTime();
  // const participants = useParticipants();
  const participants = []
  // const { screenShare } = useScreenShareState();
  // const callingState = useCallCallingState();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecordingListOpen, setIsRecordingListOpen] = useState(false);
  const [,setDevicesEnabled] = useState(false);
  const [prevParticipantsCount, setPrevParticipantsCount] = useState(0);
  
const [transcription, setTranscription] = useState("");
const [isListening, setIsListening] = useState(false);
const recognitionRef = useRef(null);
  // const { transcript, error } = useTranscribeAudio();
  // console.log(error, "transcript error")
  // console.log(transcript, "transcript mssage")

  // const isCreator = call?.state.createdBy?.id === user?.id;
  
  const {isMute, isVideo} = useAppSelector((state) => state.meet);
  const dispatch = useAppDispatch();

  const isCreator = 1234;
  useEffect(() => {
    audioRef.current?.play();
  }, [])
  
async function getMediaStream() {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: isMute,
      });
      setDevicesEnabled(true);
      return stream;
  } catch (err) {
      setDevicesEnabled(false);
      console.error('Error accessing media devices.', err);
  }
}
async function startPreview() {
    stream = await getMediaStream();
    const video = document.getElementById('preview2') as HTMLVideoElement;
    video.style.transform = 'scaleX(-1)';
    if (stream ) {
        video.srcObject = stream as MediaStream; // Type assertion
        return true
    }
}
  useEffect(() => {
      if(isVideo) {
        startPreview();
      }
      return () => {
        if (stream) {
          // Stop all video tracks
    stream.getVideoTracks().forEach((track) => track.stop());
    
    // Stop all audio tracks
    stream.getAudioTracks().forEach((track) => track.stop());
    
    stream = null; // Clear the stream reference
        }
      }
      
  }, [isVideo])

  const makeItMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
          track.enabled = !isMute; // Enable or disable audio track
      });
    // setIsMute(!isMute)
    dispatch(muteAction())
  }
  }
const toggleCamera = async () => {
  
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      track.enabled = !isVideo; // Enable or disable video track
    });
    dispatch(videoActions())
} else {
  dispatch(videoActions())
}
}


useEffect(() => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Your browser does not support the Web Speech API.");
    return;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const interimTranscript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");

    setTranscription(interimTranscript);
  };

  recognition.onend = () => {
    if (isListening) recognition.start(); // Restart recognition if still listening
  };

  recognitionRef.current = recognition;
}, [isListening]);


const startListening = () => {
  if (!isListening) {
    setIsListening(true);
    recognitionRef.current.start();
  }
};

const stopListening = () => {
  setIsListening(false);
  setTranscription('');
  recognitionRef.current.stop();
};

  // const isUnkownOrIdle =
  //   callingState === CallingState.UNKNOWN || callingState === CallingState.IDLE;
  const isUnkownOrIdle = false;

  useEffect(() => {
    const startup = async () => {
      // if (isUnkownOrIdle) {
      //   router.push(`/${meetingId}`);
      // } else if (chatClient) {
      //   // const channel = chatClient.channel('messaging', meetingId);
      //   setChatChannel(channel);
      // }
    };
    startup();
  }, [router, meetingId, isUnkownOrIdle]);

  useEffect(() => {
    if (participants.length > prevParticipantsCount) {
      audioRef.current?.play();
      setPrevParticipantsCount(participants.length);
    }
  }, [participants.length, prevParticipantsCount]);

  // const isSpeakerLayout = useMemo(() => {
  //   if (participantInSpotlight) {
  //     return (
  //       hasScreenShare(participantInSpotlight) ||
  //       isPinned(participantInSpotlight)
  //     );
  //   }
  //   return false;
  // }, [participantInSpotlight]);

  const isSpeakerLayout = false
// leave the call
  const leaveCall = async () => {
    // await call?.leave();
    router.push(`/${meetingId}/meet-end`);
  };

  const toggleScreenShare = async () => {
    try {
      // await screenShare.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleChatPopup = () => {
    setIsChatOpen((prev) => !prev);
  };

  const toggleRecordingsList = () => {
    setIsRecordingListOpen((prev) => !prev);
  };

  if (isUnkownOrIdle) return null;

  return (
      <div className={`relative w-svw ${transcription ? 'mainWrapper' : 'mainWrapper withccWrapper'} `}>
        {isSpeakerLayout && <SpeakerLayout />}
        {!isSpeakerLayout && <GridLayout isVideo={isVideo}/>}
        {transcription || isListening ? (<div className='ccWrapper'>{transcription || "Your transcription will appear here."}</div>) : null}
       
        <div className="absolute left-0 bottom-0 right-0 w-full h-20 bg-meet-black text-white text-center flex items-center justify-between">
          {/* Meeting ID */}
          <div className="hidden sm:flex grow shrink basis-1/4 items-center text-start justify-start ml-3 truncate max-w-full">
            <div className="flex items-center overflow-hidden mx-3 h-20 gap-3 select-none">
              <span className="font-medium text-black">{currentTime}</span>
              <span  className="text-black">{'|'}</span>
              <span className="font-medium truncate text-black">{meetingId}</span>
            </div>
          </div>
          {/* Meeting Controls */}
          <div className="relative flex grow shrink basis-1/4 items-center justify-center px-1.5 gap-3 ml-0">
            <ToggleAudioButton makeItMute={makeItMute} isMute={isMute}/>
            <ToggleVideoButton toggleCamera={toggleCamera} isVideo={isVideo}/>
            <CallControlButton
              onClick={toggleScreenShare}
              icon={<PresentToAll />}
              title={'Present now'}
            />
            <CallControlButton
            onClick={isListening ? stopListening : startListening}
                icon={<ClosedCaptions />}
                title={'Turn on captions'}
              />
            {/* <RecordCallButton /> */}
            <div className="hidden sm:block relative">
              <CallControlButton
                onClick={toggleRecordingsList}
                icon={<MoreVert />}
                title={'View recording list'}
              />
              <RecordingsPopup
                isOpen={isRecordingListOpen}
                onClose={() => setIsRecordingListOpen(false)}
              />
            </div>
            <CallControlButton
              onClick={leaveCall}
              icon={<CallEndFilled />}
              title={'Leave call'}
              className="leave-call-button"
            />
          </div>
          {/* Meeting Info */}
          <div className="hidden sm:flex grow shrink basis-1/4 items-center justify-end mr-3">
            <CallInfoButton
              onClick={toggleChatPopup}
              icon={
                isChatOpen ? <ChatFilled color="var(--icon-blue)" /> : <Chat />
              }
              title="Chat with everyone"
            />
          </div>
        </div>
        <ChatPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
        {isCreator && <MeetingPopup />}
        <audio
          ref={audioRef}
          src="https://www.gstatic.com/meet/sounds/join_call_6a6a67d6bcc7a4e373ed40fdeff3930a.ogg"
        />
      </div>
  );
};

export default Meeting;
