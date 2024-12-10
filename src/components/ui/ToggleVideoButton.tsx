import clsx from 'clsx';
import CallControlButton from './CallControlButton';
import Videocam from './icons/Videocam';
import VideocamOff from './icons/VideocamOff';

const ICON_SIZE = 20;

const ToggleVideoButton = ({toggleCamera, isVideo}) => {
    // here also we need to plan the use context
//   const { useCameraState } = useCallStateHooks();
//   const {
//     camera,
//     optimisticIsMute: isCameraMute,
//     hasBrowserPermission,
//   } = useCameraState();


// we need to change it custom one
//   const toggleCamera = async () => {
//     try {
//       await camera.toggle();
//     } catch (error) {
//       console.error(error);
//     }
//   };

  return (
      <CallControlButton
        icon={
          !isVideo ? (
            <VideocamOff width={ICON_SIZE} height={ICON_SIZE} />
          ) : (
            <Videocam width={ICON_SIZE} height={ICON_SIZE} />
          )
        }
        title={isVideo ? 'Turn on camera' : 'Turn off camera'}
        // onClick={toggleCamera}
        onClick={toggleCamera}
        active={isVideo}
        alert={false}
        className={clsx(isVideo && 'toggle-button-alert')}
      />
  );
};

export default ToggleVideoButton;
