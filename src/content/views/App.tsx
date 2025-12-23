import { useState } from "react";
import Logo from "@/assets/crx.svg";
import "./App.css";

function App() {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);

  return (
    <div className="popup-container">
      {show && (
        <div className={`popup-content ${show ? "opacity-100" : "opacity-0"}`}>
          <h1>HELLO CRXJS</h1>
        </div>
      )}
      <button className="toggle-button" onClick={toggle}>
        <img alt="CRXJS logo" className="button-icon" src={Logo} />
      </button>
    </div>
  );
}

export default App;
