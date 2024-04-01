import { useEffect } from "react";
import { drawSample } from "vexflow-repl"

export default function App() {
  useEffect(() => {
    const div = document.getElementById("output")
    if (div instanceof HTMLDivElement) {
      drawSample(div)
    }
  }, [])
  return <div id="output"></div>
}
