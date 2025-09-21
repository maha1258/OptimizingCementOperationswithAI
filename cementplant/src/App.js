import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;




  




// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
// import "bootstrap/dist/css/bootstrap.min.css";
 
// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Main Dashboard with Tabs */}
//         <Route path="/" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   );
// }
 
// export default App;