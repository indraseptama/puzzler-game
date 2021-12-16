import { useEffect, useRef } from "react";

function CreateEvent({ onStart }) {
  const createEventComponent = useRef(null);

  useEffect(() => {
    if (createEventComponent != null) {
      createEventComponent.current.onStart = onStart;
      createEventComponent.current.onAlert = onAlert;
    }
  }, [createEventComponent]);

  const onAlert = (message) => {
    alert(message);
  };

  return (
    <div>
      <create-event-component
        id="create-event"
        ref={createEventComponent}
      ></create-event-component>
    </div>
  );
}

export default CreateEvent;
