import React, { useState } from "react";
import MetricsForm from "./MetricsForm";
import AutonomousMode from "./AutonomousMode";
import Suggestions from "./Suggestions";
import { Tab, Nav, Container } from "react-bootstrap";

function Dashboard() {
  const [key, setKey] = useState("metrics");

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Cement Plant AI Control Dashboard</h2>

      <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
        <Nav variant="pills" className="justify-content-center mb-4">
          <Nav.Item>
            <Nav.Link eventKey="metrics">Metrics Input</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="autonomous">Autonomous Mode</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="suggestions">AI Suggestions</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="metrics">
            <MetricsForm onMetricsSaved={() => setKey("suggestions")} />
          </Tab.Pane>
          <Tab.Pane eventKey="autonomous">
            <AutonomousMode />
          </Tab.Pane>
          <Tab.Pane eventKey="suggestions">
            <Suggestions onAllHandled={() => setKey("autonomous")} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}

export default Dashboard;












// import React, { useState } from "react";
// import MetricsForm from "./MetricsForm";
// import AutonomousMode from "./AutonomousMode";
// import Suggestions from "./Suggestions";
// import { Tab, Nav, Container } from "react-bootstrap";
 
// function Dashboard() {
//   const [key, setKey] = useState("metrics");
 
//   return (
//     <Container className="mt-4">
//       <h2 className="text-center mb-4">Cement Plant AI Control Dashboard</h2>
 
//       <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
//         <Nav variant="pills" className="justify-content-center mb-4">
//           <Nav.Item>
//             <Nav.Link eventKey="metrics">Metrics Input</Nav.Link>
//           </Nav.Item>
//           <Nav.Item>
//             <Nav.Link eventKey="autonomous">Autonomous Mode</Nav.Link>
//           </Nav.Item>
//           <Nav.Item>
//             <Nav.Link eventKey="suggestions">AI Suggestions</Nav.Link>
//           </Nav.Item>
//         </Nav>
 
//         <Tab.Content>
//           <Tab.Pane eventKey="metrics">
//             <MetricsForm />
//           </Tab.Pane>
//           <Tab.Pane eventKey="autonomous">
//             <AutonomousMode />
//           </Tab.Pane>
//           <Tab.Pane eventKey="suggestions">
//              <Suggestions onAllHandled={() => setKey("autonomous")} />
//           </Tab.Pane>

//         </Tab.Content>
//       </Tab.Container>
//     </Container>
//   );
// }
 
// export default Dashboard;