import { useEffect, useRef } from "react";

function Lobby({eventId, renderGame}) {
  const lobyComponent = useRef(null);

  useEffect(() => {
    if(lobyComponent != null){
      lobyComponent.current.onStart = renderGame;
      lobyComponent.current.onAlert = onAlert;
      lobyComponent.current.eventId = eventId;
      console.log(eventId);
    }
  }, [lobyComponent])

  const onAlert = (message) => {
    alert(message);
  }

  return (
    <div>
      <lobby-component
        eventId={eventId}
        ref={lobyComponent}>
      </lobby-component>
    </div>
  );
}

export default Lobby;