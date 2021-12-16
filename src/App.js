/** @jsxImportSource @emotion/react */

import "./App.css";
import { useEffect, useState } from "react";
import CreateEvent from "./pages/CreateEvent/CreateEvent";
import Lobby from "./pages/Lobby/Lobby";
import Main from "./pages/Main";
import "nahtuh-components";
import { nahtuhClient } from "nahtuh-client";

function App() {
  const [currentPage, setCurrentPage] = useState("/");
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    window.nahtuhClient = nahtuhClient;
  }, []);

  const onStart = (data) => {
    console.log(data);
    setEventId(data.eventInfo.eventId);
    setCurrentPage("/lobby");
  };

  const renderGame = () => {
    console.log("superrrr");
    setCurrentPage("/main");
  };

  if (currentPage == "/") {
    return (
      <div className="App">
        <CreateEvent onStart={onStart}></CreateEvent>
      </div>
    );
  } else if (currentPage == "/lobby" && eventId) {
    return (
      <div className="App">
        <Lobby eventId={eventId} renderGame={renderGame}></Lobby>
      </div>
    );
  } else {
    return (
      <div className="App">
        <Main></Main>
      </div>
    );
  }
}

export default App;
