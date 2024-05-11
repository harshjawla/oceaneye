import { Route, Routes } from "react-router-dom";
import Classified from "./components/Classified";
import TimeZone from "./components/TimeZone";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Classified />} /> 
      <Route path="/timezone" element={<TimeZone />} />
    </Routes>
  );
}

export default App;
