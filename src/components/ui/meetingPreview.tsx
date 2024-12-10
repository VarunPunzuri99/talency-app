import { useEffect, useState } from 'react';

import IconButton from './icon-button';
import Mic from './icons/Mic';
import MicOff from './icons/MicOff';
import Videocam from './icons/Videocam';
import VideocamOff from './icons/VideocamOff';

import { useAppDispatch, useAppSelector } from '@/redux';
import { videoActions, muteAction } from '@/redux/meet'

let stream = null;
const MeetingPreview = () => {

  const { isMute, isVideo } = useAppSelector((state) => state.meet);
  const dispatch = useAppDispatch();
  const [devicesEnabled, setDevicesEnabled] = useState(false);
  // const [isMute, setIsMute] = useState(true);
  // const [isVideo, setIsVideo] = useState(true);

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
  useEffect(() => {
    async function startPreview() {
      stream = await getMediaStream();
      const video = document.getElementById('preview') as HTMLVideoElement;
      video.style.transform = 'scaleX(-1)';
      if (stream) {
        video.srcObject = stream as MediaStream; // Type assertion
      }
    }

    startPreview();
    return () => {
      if (stream) {
        // Stop all video tracks
        stream.getVideoTracks().forEach((track) => track.stop());

        // Stop all audio tracks
        stream.getAudioTracks().forEach((track) => track.stop());

        stream = null; // Clear the stream reference
      }
    }
  }, [])
  //   useEffect(() => {
  //     const enableMicAndCam = async () => {
  //       try {
  //         await camera.enable();
  //       } catch (error) {
  //         console.error(error);
  //       }
  //       try {
  //         await microphone.enable();
  //       } catch (error) {
  //         console.error(error);
  //       }
  //       setDevicesEnabled(true);
  //     };

  //     enableMicAndCam();
  //   }, [camera, microphone]);

  //   useEffect(() => {
  //     if (hasMicrophonePermission === undefined) return;
  //     if (
  //       (hasMicrophonePermission && microphoneStatus) ||
  //       !hasMicrophonePermission
  //     ) {
  //       setDisplaySelectors(true);
  //     }
  //   }, [microphoneStatus, hasMicrophonePermission]);

  //   const toggleCamera = async () => {
  //     try {
  //       setVideoPreviewText((prev) =>
  //         prev === '' || prev === 'Camera is off'
  //           ? 'Camera is starting'
  //           : 'Camera is off'
  //       );
  //       await camera.toggle();
  //       setVideoPreviewText((prev) =>
  //         prev === 'Camera is off' ? 'Camera is starting' : 'Camera is off'
  //       );
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   const toggleMicrophone = async () => {
  //     try {
  //       await microphone.toggle();
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  return (
    <div className="w-full max-w-3xl lg:pr-2 lg:mt-8">
      <div className="relative w-full rounded-lg max-w-185 aspect-video mx-auto shadow-md">
        {/* Background */}
        <div className="absolute z-0 left-0 w-full h-full rounded-lg bg-meet-black" />
        {/* Gradient overlay */}
        <div className="absolute z-2 bg-gradient-overlay left-0 w-full h-full rounded-lg" />
        {/* Video preview */}
        <div className="absolute w-full h-full [&>div]:w-auto [&>div]:h-auto z-1 flex items-center justify-center rounded-lg overflow-hidden [&_video]:-scale-x-100">
          <video id="preview" autoPlay className='w-full' />

        </div>
        {devicesEnabled && (
          <div className="z-3 justify-center w-full absolute bottom-4  flex items-center gap-6">
            {/* Microphone control  */}
            <IconButton
              icon={isMute ? <Mic /> : <MicOff />}
              title={
                isMute ? 'Turn on microphone' : 'Turn off microphone'
              }
              onClick={() => {
                if (stream) {
                  stream.getAudioTracks().forEach(track => {
                    track.enabled = !isMute; // Enable or disable audio track
                  });
                  // setIsMute(!isMute)
                  dispatch(muteAction())
                }
              }
              }
              active={isMute}
              variant="secondary"
            />
            {/* Camera control  */}
            <IconButton
              icon={isVideo ? <Videocam /> : <VideocamOff />}
              title={isVideo ? 'Turn on camera' : 'Turn off camera'}
              active={isVideo}
              onClick={() => {
                if (stream) {
                  stream.getVideoTracks().forEach(track => {
                    track.enabled = !isVideo; // Enable or disable video track
                  });
                  dispatch(videoActions())
                }

              }}
              variant="secondary"
            />
          </div>
        )}
        {/* User name */}
        {/* {devicesEnabled && hasCameraPermission && (
          <div className="z-3 max-w-94 h-8 absolute left-0 top-3 mt-1.5 mb-1 mx-4 truncate text-white text-sm font-medium leading-5 flex items-center justify-start cursor-default select-none">
            {user?.name}
          </div>
        )} */}

      </div>
    </div>
  );
};

export const DisabledVideoPreview = (videoPreviewText: string) => {
  return (
    <div className="text-2xl font-roboto text-white">{videoPreviewText}</div>
  );
};

export default MeetingPreview;
