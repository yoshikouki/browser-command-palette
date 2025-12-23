import crxLogo from "@/assets/crx.svg";
import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import HelloWorld from "@/components/HelloWorld";
import "./App.css";

export default function App() {
  return (
    <div>
      <a href="https://vite.dev" rel="noreferrer" target="_blank">
        <img alt="Vite logo" className="logo" src={viteLogo} />
      </a>
      <a href="https://reactjs.org/" rel="noreferrer" target="_blank">
        <img alt="React logo" className="logo react" src={reactLogo} />
      </a>
      <a href="https://crxjs.dev/vite-plugin" rel="noreferrer" target="_blank">
        <img alt="crx logo" className="logo crx" src={crxLogo} />
      </a>
      <HelloWorld msg="Vite + React + CRXJS" />
    </div>
  );
}
