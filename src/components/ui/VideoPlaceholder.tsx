import { forwardRef, useMemo } from 'react';
// import Image from 'next/image';
import clsx from 'clsx';

import useUserColor from '../hooks/useUserColor';
import { useAppSelector } from '@/redux';

export const placeholderClassName = 'participant-view-placeholder';
// const WIDTH = 160;

const VideoPlaceholder = forwardRef<HTMLDivElement>(
  function VideoPlaceholder(_, ref) {
    const color = useUserColor();
    // we need to create Context Ui
    // const { participant } = useParticipantViewContext();
    // const name = participant.name || participant.userId;
    const {name} = useAppSelector((state) => state.meet);
  

    const randomColor = useMemo(() => {
      return color(name);
    }, [color, name]);

    return (
      <div
        ref={ref}
        className={`absolute w-full h-full rounded-[inherit] bg-dark-gray flex items-center justify-center ${placeholderClassName}`}
      >
        {/* {participant.image && (
          <Image
            className="max-w-3/10 rounded-full overflow-hidden"
            src={participant.image}
            alt={participant.userId}
            width={WIDTH}
            height={WIDTH}
          />
        )} */}
        <div
          style={{
            backgroundColor: randomColor,
            width: '200px',
          }}
          className={clsx(
            // participant.image && 'hidden',
          (false) && 'hidden',
            'relative avatar w-3/10 max-w-40 aspect-square uppercase rounded-full text-white font-sans-serif font-medium flex items-center justify-center'
          )}
        >
          <span className="text-[clamp(30px,_calc(100vw_*_0.05),_65px)] select-none">
            {name && name?.[0]}
          </span>
        </div>
      </div>
    );
  }
);

export default VideoPlaceholder;
