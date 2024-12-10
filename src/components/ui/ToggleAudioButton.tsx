import clsx from 'clsx';
import CallControlButton from './CallControlButton';
import MicFilled from './icons/MicFilled';
import MicOffFilled from './icons/MicOffFilled';

const ICON_SIZE = 20;

const ToggleAudioButton = ({makeItMute, isMute}) => {
//   const { useMicrophoneState } = useCallStateHooks();
//   const {
//     microphone,
//     optimisticIsMute: isMicrophoneMute,
//     hasBrowserPermission,
//   } = useMicrophoneState();

// ToggleMicPhone

//   const toggleMicrophone = async () => {
//     try {
//       await microphone.toggle();
//     } catch (error) {
//       console.error(error);
//     }
//   };

  return (
      <CallControlButton
        icon={
          !isMute ? (
            <MicOffFilled width={ICON_SIZE} height={ICON_SIZE} />
          ) : (
            <MicFilled width={ICON_SIZE} height={ICON_SIZE} />
          )
        }
        title={isMute ? 'Turn on microphone' : 'Turn off microphone'}
        // onClick={toggleMicrophone}
        onClick={makeItMute}
        alert={false}
        active={isMute}
        className={clsx('toggle-button-alert')}
      />
  );
};

export default ToggleAudioButton;
