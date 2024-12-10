import Popup from './Popup';
  
  const ChatPopup = ({isOpen, onClose } ) => {
    return (
      <Popup
        open={isOpen}
        onClose={onClose}
        title={<h2>In-call messages</h2>}
        className="bottom-[5rem] right-4 left-auto h-[calc(100svh-6rem)] animate-none"
      >
        <div className="px-0 pb-3 pt-0 h-[calc(100%-66px)]">
        </div>
      </Popup>
    );
  };
  
  export default ChatPopup;
  