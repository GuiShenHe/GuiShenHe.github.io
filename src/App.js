import { useCallback, useRef, useState } from "react";
import "./App.css";
import Gallery from "./components/Gallery/Gallery";
const sections = [
  {
    title: "EYEGLASSES",
    leftColor: "#8266D4", // medium purple
    rightColor: "#3B5F8F", //mariner
    backgroundAsset: "sunnies.png",
    details: [],
  },
  {
    title: "SEATING",
    leftColor: "#F95B57", // tomato
    rightColor: "#8266D4", // medium purple
    backgroundAsset: "lawn_chair.png",
    details: [],
  },
  {
    title: "DECORATION",
    leftColor: "#F3A646", // My Sin
    rightColor: "#F95B57", // tomato
    backgroundAsset: "lipstick.png",
    details: [],
  },
  {
    title: "PROTECTION",
    leftColor: "white",
    rightColor: "#F95B57", // tomato
    backgroundAsset: "helmet.png",
    details: [],
  },
];

function App() {
  const [height, setHeight] = useState(812);
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);
  const defaultBounds = {
    maxHeight: Math.max(height, 812),
    midHeight: 256,
    minHeight: 90,
  };
  return (
    <div className="App" ref={measuredRef}>
      <Gallery sections={sections} {...defaultBounds} />
    </div>
  );
}

export default App;
