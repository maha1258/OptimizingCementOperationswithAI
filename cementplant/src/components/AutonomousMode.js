import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";

function AutonomousMode() {
  const [latestMetric, setLatestMetric] = useState(null);
  const [approvedMetricsValues, setApprovedMetricsValues] = useState({
    temperature: null,
    pressure: null,
    emissions: null,
  });
  const [loading, setLoading] = useState(true);
  const [implemented, setImplemented] = useState(false); // Tracks Ready to Implement

  useEffect(() => {
    const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const docId = snapshot.docs[0].id;
        setLatestMetric({ ...docData, docId });
      } else {
        setLatestMetric(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!latestMetric) return;

    setLoading(true);
    const metrics = ["temperature", "pressure", "emissions"];
    const unsubscribers = [];

    metrics.forEach((metric) => {
      const docRef = doc(db, "approvedSuggestions", metric);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const value =
            data.metricId === latestMetric.docId && data.approvedAt
              ? data.approvedValue ?? latestMetric[metric]
              : `${latestMetric[metric]} (Unchanged)`;
          setApprovedMetricsValues((prev) => ({
            ...prev,
            [metric]: value,
          }));
        } else {
          setApprovedMetricsValues((prev) => ({
            ...prev,
            [metric]: `${latestMetric[metric]} (Unchanged)`,
          }));
        }
      });
      unsubscribers.push(unsub);
    });

    setLoading(false);
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [latestMetric]);

  const highlightNumbers = (text) => {
    if (text === null || text === undefined) return null;
    return String(text)
      .split(/(\d+(\.\d+)?)/g)
      .map((part, idx) =>
        /\d/.test(part) ? <strong key={idx} className="text-success">{part}</strong> : part
      );
  };

  const handleReadyToImplement = () => setImplemented(true);
  const handleCloseOverlay = () => setImplemented(false);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Autonomous Mode</h2>

      {!latestMetric || loading ? (
        <p className="text-muted">Loading metrics and approved suggestions...</p>
      ) : (
        <>
          {/* Metrics Containers */}
          <div className="row">
            <div className="col-md-6">
              <h4>Current Metrics:</h4>
              <ul className="list-group mb-4">
                <li className="list-group-item">
                  Temperature: {highlightNumbers(latestMetric.temperature)}
                </li>
                <li className="list-group-item">
                  Pressure: {highlightNumbers(latestMetric.pressure)}
                </li>
                <li className="list-group-item">
                  Emissions: {highlightNumbers(latestMetric.emissions)}
                </li>
              </ul>
            </div>

            <div className="col-md-6">
              <h4>Approved Metrics:</h4>
              <ul className="list-group mb-4">
                <li className="list-group-item">
                  Temperature: {highlightNumbers(approvedMetricsValues.temperature)}
                </li>
                <li className="list-group-item">
                  Pressure: {highlightNumbers(approvedMetricsValues.pressure)}
                </li>
                <li className="list-group-item">
                  Emissions: {highlightNumbers(approvedMetricsValues.emissions)}
                </li>
              </ul>
            </div>
          </div>

          {/* Ready to Implement Button BELOW the Metrics Containers */}
          <div className="text-center mb-4">
            <button
              className="btn btn-primary"
              onClick={handleReadyToImplement}
              disabled={implemented}
            >
              Ready to Implement
            </button>
          </div>

          {/* Approved AI Suggestions Section */}
          <h4>Approved AI Suggestions:</h4>
          {["temperature", "pressure", "emissions"].map((metric) => (
            <div key={metric} className="mb-3">
              <h5 className="text-primary">{metric.charAt(0).toUpperCase() + metric.slice(1)}</h5>
              {approvedMetricsValues[metric] &&
              typeof approvedMetricsValues[metric] === "string" &&
              approvedMetricsValues[metric].includes("(Unchanged)") ? (
                <p className="text-muted">No approved suggestions.</p>
              ) : (
                <p className="text-success">Approved suggestions applied.</p>
              )}
            </div>
          ))}

          {/* Modal Overlay for Successfully Implemented */}
          {implemented && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  position: "relative",
                  backgroundColor: "#fff",
                  padding: "2rem 3rem",
                  borderRadius: "10px",
                  boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                  textAlign: "center",
                  minWidth: "300px",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseOverlay}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>

                <h2 className="text-success">Successfully Implemented ✅</h2>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AutonomousMode;












// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";

// function AutonomousMode() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [approvedMetricsValues, setApprovedMetricsValues] = useState({
//     temperature: null,
//     pressure: null,
//     emissions: null,
//   });
//   const [loading, setLoading] = useState(true);

//   // Fetch latest metric
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docData = snapshot.docs[0].data();
//         const docId = snapshot.docs[0].id;
//         setLatestMetric({ ...docData, docId });
//       } else {
//         setLatestMetric(null);
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Fetch approved metrics values
//   useEffect(() => {
//     if (!latestMetric) return;

//     setLoading(true);
//     const metrics = ["temperature", "pressure", "emissions"];
//     const unsubscribers = [];

//     metrics.forEach((metric) => {
//       const docRef = doc(db, "approvedSuggestions", metric);
//       const unsub = onSnapshot(docRef, (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           // Use numeric value if approved, otherwise show unchanged
//           const value =
//             data.metricId === latestMetric.docId && data.approvedAt
//               ? data.approvedValue ?? latestMetric[metric]
//               : `${latestMetric[metric]} (Unchanged)`;
//           setApprovedMetricsValues((prev) => ({
//             ...prev,
//             [metric]: value,
//           }));
//         } else {
//           setApprovedMetricsValues((prev) => ({
//             ...prev,
//             [metric]: `${latestMetric[metric]} (Unchanged)`,
//           }));
//         }
//       });
//       unsubscribers.push(unsub);
//     });

//     setLoading(false);
//     return () => unsubscribers.forEach((unsub) => unsub());
//   }, [latestMetric]);

//   const highlightNumbers = (text) => {
//     if (text === null || text === undefined) return null;
//     return String(text)
//       .split(/(\d+(\.\d+)?)/g)
//       .map((part, idx) =>
//         /\d/.test(part) ? <strong key={idx} className="text-success">{part}</strong> : part
//       );
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Autonomous Mode</h2>

//       {!latestMetric || loading ? (
//         <p className="text-muted">Loading metrics and approved suggestions...</p>
//       ) : (
//         <>
//           <div className="row">
//             <div className="col-md-6">
//               <h4>Current Metrics:</h4>
//               <ul className="list-group mb-4">
//                 <li className="list-group-item">
//                   Temperature: {highlightNumbers(latestMetric.temperature)}
//                 </li>
//                 <li className="list-group-item">
//                   Pressure: {highlightNumbers(latestMetric.pressure)}
//                 </li>
//                 <li className="list-group-item">
//                   Emissions: {highlightNumbers(latestMetric.emissions)}
//                 </li>
//               </ul>
//             </div>

//             <div className="col-md-6">
//               <h4>Approved Metrics:</h4>
//               <ul className="list-group mb-4">
//                 <li className="list-group-item">
//                   Temperature: {highlightNumbers(approvedMetricsValues.temperature)}
//                 </li>
//                 <li className="list-group-item">
//                   Pressure: {highlightNumbers(approvedMetricsValues.pressure)}
//                 </li>
//                 <li className="list-group-item">
//                   Emissions: {highlightNumbers(approvedMetricsValues.emissions)}
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <h4>Approved AI Suggestions:</h4>
//           {["temperature", "pressure", "emissions"].map((metric) => (
//             <div key={metric} className="mb-3">
//               <h5 className="text-primary">{metric.charAt(0).toUpperCase() + metric.slice(1)}</h5>
//               {approvedMetricsValues[metric] && typeof approvedMetricsValues[metric] === "string" &&
//               approvedMetricsValues[metric].includes("(Unchanged)") ? (
//                 <p className="text-muted">No approved suggestions.</p>
//               ) : (
//                 <p className="text-success">Approved suggestions applied.</p>
//               )}
//             </div>
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

// export default AutonomousMode;











// //------------------last (wrote in suggestions.js)
// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";

// function AutonomousMode() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [approvedMetricsValues, setApprovedMetricsValues] = useState({
//     temperature: null,
//     pressure: null,
//     emissions: null,
//   });

//   // Fetch latest metric
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docData = snapshot.docs[0].data();
//         const docId = snapshot.docs[0].id;
//         setLatestMetric({ ...docData, docId });
//       } else {
//         setLatestMetric(null);
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Fetch approved metrics values
//   useEffect(() => {
//     if (!latestMetric) return;

//     const metrics = ["temperature", "pressure", "emissions"];
//     const unsubscribers = [];

//     metrics.forEach((metric) => {
//       const docRef = doc(db, "approvedSuggestions", metric);
//       const unsub = onSnapshot(docRef, (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           // If approved for this latest metric, show AI value
//           if (data.metricId === latestMetric.docId && data.approvedAt) {
//             const value = data.suggestedNumericValue || latestMetric[metric]; // AI numeric value if provided
//             setApprovedMetricsValues((prev) => ({
//               ...prev,
//               [metric]: `${value}`,
//             }));
//           } else {
//             // If not approved, show current metric + "(Unchanged)"
//             setApprovedMetricsValues((prev) => ({
//               ...prev,
//               [metric]: `${latestMetric[metric]} (Unchanged)`,
//             }));
//           }
//         } else {
//           // No approval document, show "(Unchanged)"
//           setApprovedMetricsValues((prev) => ({
//             ...prev,
//             [metric]: `${latestMetric[metric]} (Unchanged)`,
//           }));
//         }
//       });

//       unsubscribers.push(unsub);
//     });

//     return () => unsubscribers.forEach((unsub) => unsub());
//   }, [latestMetric]);

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Autonomous Mode</h2>

//       {latestMetric ? (
//         <>
//           <div className="row">
//             <div className="col-md-6">
//               <h4>Current Metrics:</h4>
//               <ul className="list-group mb-4">
//                 <li className="list-group-item">Temperature: {latestMetric.temperature} °C</li>
//                 <li className="list-group-item">Pressure: {latestMetric.pressure} bar</li>
//                 <li className="list-group-item">Emissions: {latestMetric.emissions} ppm</li>
//               </ul>
//             </div>

//             <div className="col-md-6">
//               <h4>Approved Metrics:</h4>
//               <ul className="list-group mb-4">
//                 <li className="list-group-item">Temperature: {approvedMetricsValues.temperature}</li>
//                 <li className="list-group-item">Pressure: {approvedMetricsValues.pressure}</li>
//                 <li className="list-group-item">Emissions: {approvedMetricsValues.emissions}</li>
//               </ul>
//             </div>
//           </div>

//           <h4>Approved AI Suggestions:</h4>
//           {["temperature", "pressure", "emissions"].map((metric) => (
//             <div key={metric} className="mb-3">
//               <h5 className="text-primary">{metric.charAt(0).toUpperCase() + metric.slice(1)}</h5>
//               {approvedMetricsValues[metric] && approvedMetricsValues[metric].includes("(Unchanged)") ? (
//                 <p className="text-muted">No approved suggestions.</p>
//               ) : (
//                 <p className="text-success">
//                   Approved suggestions applied.
//                 </p>
//               )}
//             </div>
//           ))}
//         </>
//       ) : (
//         <p className="text-muted">No metrics available yet.</p>
//       )}
//     </div>
//   );
// }

// export default AutonomousMode;










// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore";

// function AutonomousMode() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [approvedSuggestions, setApprovedSuggestions] = useState({
//     temperature: [],
//     pressure: [],
//     emissions: [],
//   });

//   // Fetch latest metric
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docData = snapshot.docs[0].data();
//         const docId = snapshot.docs[0].id;
//         setLatestMetric({ ...docData, docId });
//       } else {
//         setLatestMetric(null);
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Fetch approved suggestions for the latest metric
//   useEffect(() => {
//     if (!latestMetric) return;

//     const metrics = ["temperature", "pressure", "emissions"];
//     const unsubscribers = [];

//     metrics.forEach((metric) => {
//       const q = doc(db, "approvedSuggestions", metric);
//       const unsub = onSnapshot(q, (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           // Only show suggestions for the current latest metric
//           if (data.metricId === latestMetric.docId) {
//             setApprovedSuggestions((prev) => ({
//               ...prev,
//               [metric]: data.suggestions || [],
//             }));
//           } else {
//             // Clear previous metric's suggestions
//             setApprovedSuggestions((prev) => ({
//               ...prev,
//               [metric]: [],
//             }));
//           }
//         } else {
//           setApprovedSuggestions((prev) => ({
//             ...prev,
//             [metric]: [],
//           }));
//         }
//       });

//       unsubscribers.push(unsub);
//     });

//     return () => {
//       unsubscribers.forEach((unsub) => unsub());
//     };
//   }, [latestMetric]);

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Autonomous Mode</h2>

//       {latestMetric ? (
//         <>
//           <h4>Current Metrics:</h4>
//           <ul className="list-group mb-4">
//             <li className="list-group-item">Temperature: {latestMetric.temperature} °C</li>
//             <li className="list-group-item">Pressure: {latestMetric.pressure} bar</li>
//             <li className="list-group-item">Emissions: {latestMetric.emissions} ppm</li>
//           </ul>

//           <h4>Approved AI Suggestions:</h4>
//           {["temperature", "pressure", "emissions"].map((metric) => (
//             <div key={metric} className="mb-3">
//               <h5 className="text-primary">{metric.charAt(0).toUpperCase() + metric.slice(1)}</h5>
//               {approvedSuggestions[metric].length > 0 ? (
//                 <ul className="list-group">
//                   {approvedSuggestions[metric].map((s, idx) => (
//                     <li className="list-group-item list-group-item-success" key={idx}>
//                       {s}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-muted">No approved suggestions yet.</p>
//               )}
//             </div>
//           ))}
//         </>
//       ) : (
//         <p className="text-muted">No metrics available yet.</p>
//       )}
//     </div>
//   );
// }

// export default AutonomousMode;



// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// function AutonomousMode() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [approvedSuggestions, setApprovedSuggestions] = useState([]);

//   useEffect(() => {
//     // Fetch current metrics
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();
//         setLatestMetric(data);
//       }
//     });

//     // Fetch approved suggestions
//     const suggQuery = query(collection(db, "approvedSuggestions"), orderBy("timestamp", "desc"));
//     const unsubSugg = onSnapshot(suggQuery, (snapshot) => {
//       const list = snapshot.docs.map((d) => d.data());
//       setApprovedSuggestions(list);
//     });

//     return () => {
//       unsub();
//       unsubSugg();
//     };
//   }, []);

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Autonomous Mode</h2>

//       {latestMetric ? (
//         <div className="row g-3 mb-4">
//           {["temperature", "pressure", "emissions"].map((key) => (
//             <div className="col-md-4" key={key}>
//               <div className="card text-center shadow-sm p-3 border-start border-5 border-warning">
//                 <h6 className="text-muted">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
//                 <h3>
//                   {latestMetric[key]}
//                   {key === "temperature" ? " °C" : key === "pressure" ? " bar" : " ppm"}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No metrics available.</p>
//       )}

//       <div className="card shadow-sm p-3">
//         <h5>Approved AI Suggestions</h5>
//         {approvedSuggestions.length === 0 ? (
//           <p>No suggestions approved yet.</p>
//         ) : (
//           <ul className="list-group list-group-flush">
//             {approvedSuggestions.map((a, idx) => (
//               <li className="list-group-item" key={idx}>
//                 {a.suggestion} (Metrics: {JSON.stringify(a.approvedMetrics)})
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// export default AutonomousMode;




// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, getDocs, limit } from "firebase/firestore";
 
// function AutonomousMode() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [currentActions, setCurrentActions] = useState([]);
//   const [allActions, setAllActions] = useState([]);
//   const [showAll, setShowAll] = useState(false);
 
//   const generateActions = (metrics) => {
//     const actions = [];
//     if (metrics.temperature > 1450) actions.push("Reduce fuel input or increase cooling.");
//     if (metrics.emissions > 300) actions.push("Check filters or adjust combustion.");
//     if (metrics.pressure > 60) actions.push("Adjust kiln operation to lower pressure.");
//     return actions;
//   };
 
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, async (snapshot) => {
//       if (!snapshot.empty) {
//         const docSnap = snapshot.docs[0];
//         const data = { id: docSnap.id, ...docSnap.data() };
//         setLatestMetric(data);
 
//         if (!data.actionsGenerated) {
//           const newActions = generateActions(data);
//           for (const action of newActions) {
//             await addDoc(collection(db, "actions"), {
//               message: action,
//               metricId: data.id,
//               timestamp: new Date(),
//             });
//           }
//           await updateDoc(doc(db, "metrics", data.id), { actionsGenerated: true });
//         }
 
//         const actionsSnap = await getDocs(query(collection(db, "actions"), orderBy("timestamp", "desc")));
//         setCurrentActions(actionsSnap.docs.map((d) => d.data()).filter((a) => a.metricId === data.id));
//       }
//     });
//     return () => unsub();
//   }, []);
 
//   const handleShowAll = async () => {
//     const actionsSnap = await getDocs(query(collection(db, "actions"), orderBy("timestamp", "desc")));
//     setAllActions(actionsSnap.docs.map((d) => d.data()));
//     setShowAll(true);
//   };
 
//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Autonomous Mode</h2>
 
//       {latestMetric ? (
//         <div className="row g-3 mb-4">
//           {["temperature", "pressure", "emissions"].map((key) => (
//             <div className="col-md-4" key={key}>
//               <div className="card text-center shadow-sm p-3 border-start border-5 border-warning">
//                 <h6 className="text-muted">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
//                 <h3>
//                   {latestMetric[key]}
//                   {key === "temperature" ? " °C" : key === "pressure" ? " bar" : " ppm"}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No metrics available.</p>
//       )}
 
//       <div className="card shadow-sm p-3 mb-3">
//         <h5>Actions Log (Current Metric)</h5>
//         {currentActions.length === 0 ? (
//           <p>No actions generated yet.</p>
//         ) : (
//           <ul className="list-group list-group-flush">
//             {currentActions.map((a, idx) => (
//               <li className="list-group-item" key={idx}>{a.message}</li>
//             ))}
//           </ul>
//         )}
//       </div>
 
//       <button className="btn btn-primary mb-3" onClick={handleShowAll}>
//         Show All Logs
//       </button>
 
//       {showAll && (
//         <div className="card shadow-sm p-3">
//           <h5>All Actions Log</h5>
//           <ul className="list-group list-group-flush">
//             {allActions.map((a, idx) => (
//               <li className="list-group-item" key={idx}>{a.message}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
 
// export default AutonomousMode;