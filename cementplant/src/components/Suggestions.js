import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc } from "firebase/firestore";

function Suggestions({ onAllHandled }) {
  const [latestMetric, setLatestMetric] = useState(null);
  const [suggestionsByMetric, setSuggestionsByMetric] = useState({ temperature: [], pressure: [], emissions: [] });
  const [targets, setTargets] = useState({ temperature: null, pressure: null, emissions: null });
  const [loading, setLoading] = useState(true);
  const [handledMetrics, setHandledMetrics] = useState({});

  useEffect(() => {
    const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { ...docSnap.data(), docId: docSnap.id };
        setLatestMetric(data);
        setHandledMetrics({});
        fetchSuggestions(data);
      } else {
        setLatestMetric(null);
        setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
      }
    });
    return () => unsub();
  }, []);

  const fetchSuggestions = async (metrics) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestionsByMetric(data.suggestions);
        if (data.target) setTargets(data.target);
      } else {
        setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
      }
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (metricKey) => {
    if (!latestMetric) return;
    try {
      const suggested = suggestionsByMetric[metricKey]?.[0] ?? latestMetric[metricKey];
      const numericValue = parseFloat(String(suggested).match(/\d+(\.\d+)?/)?.[0] ?? latestMetric[metricKey]);
      await setDoc(doc(db, "approvedSuggestions", metricKey), {
        metricId: latestMetric.docId,
        metric: metricKey,
        approvedAt: new Date(),
        approvedValue: numericValue,
        suggestions: suggestionsByMetric[metricKey] || [],
      });
      setHandledMetrics((prev) => ({ ...prev, [metricKey]: "approved" }));
      checkAllHandled({ ...handledMetrics, [metricKey]: "approved" });
    } catch (err) {
      console.error("Error approving metric:", err);
    }
  };

  const handleReject = (metricKey) => {
    setHandledMetrics((prev) => ({ ...prev, [metricKey]: "rejected" }));
    checkAllHandled({ ...handledMetrics, [metricKey]: "rejected" });
  };

  const checkAllHandled = (metricsState) => {
    const allHandled = ["temperature", "pressure", "emissions"].every((m) => metricsState[m]);
    if (allHandled && onAllHandled) onAllHandled();
  };

  const highlightNumbers = (text) => {
    if (!text) return null;
    return String(text)
      .split(/(\d+(\.\d+)?)/g)
      .map((part, idx) => /\d/.test(part) ? <strong key={idx} className="text-success">{part}</strong> : part);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">AI Suggestions (LLM)</h2>
      {loading && <p className="text-muted">Generating suggestions...</p>}
      {!latestMetric && !loading && <p className="text-muted">No metrics found</p>}
      {!loading && latestMetric && ["temperature", "pressure", "emissions"].map((metric) => (
        <div className="card mb-3 shadow-sm p-3" key={metric}>
          <h5 className="text-primary text-capitalize">{metric} suggestions:</h5>
          <p className="fw-bold">Target: {highlightNumbers(targets[metric])}</p>
          <ul className="list-group mb-2">
            {suggestionsByMetric[metric]?.length > 0 ? (
              suggestionsByMetric[metric].map((s, idx) => (
                <li className="list-group-item list-group-item-warning" key={idx}>
                  {highlightNumbers(s)}
                </li>
              ))
            ) : (
              <li className="list-group-item text-muted">No suggestions available</li>
            )}
          </ul>
          {!handledMetrics[metric] && (
            <div>
              <button className="btn btn-success me-2" onClick={() => handleApprove(metric)}>Approve</button>
              <button className="btn btn-danger" onClick={() => handleReject(metric)}>Reject</button>
            </div>
          )}
          {handledMetrics[metric] && (
            <p className={`fw-bold mt-2 text-${handledMetrics[metric] === "approved" ? "success" : "danger"}`}>
              {handledMetrics[metric].toUpperCase()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Suggestions;






// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, setDoc, doc } from "firebase/firestore";

// function Suggestions({ onAllHandled }) {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [suggestionsByMetric, setSuggestionsByMetric] = useState({
//     temperature: [],
//     pressure: [],
//     emissions: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [handledMetrics, setHandledMetrics] = useState({}); // tracks approved/rejected

//   // Fetch latest metric
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docSnap = snapshot.docs[0];
//         const data = { ...docSnap.data(), docId: docSnap.id };
//         setLatestMetric(data);
//         setHandledMetrics({}); // reset approvals for new metric
//         fetchSuggestions(data);
//       } else {
//         setLatestMetric(null);
//         setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Fetch AI suggestions
//   const fetchSuggestions = async (metrics) => {
//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ metrics }),
//       });
//       const data = await res.json();
//       if (data.suggestions) {
//         setSuggestionsByMetric(data.suggestions);
//       } else {
//         setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
//       }
//     } catch (err) {
//       console.error("Error fetching AI suggestions:", err);
//       setSuggestionsByMetric({ temperature: [], pressure: [], emissions: [] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Approve suggestions
//   const handleApprove = async (metricKey) => {
//     if (!latestMetric) return;
//     try {
//       const suggested = suggestionsByMetric[metricKey]?.[0] ?? latestMetric[metricKey];
//       const numericValue = parseFloat(
//         String(suggested).match(/\d+(\.\d+)?/)?.[0] ?? latestMetric[metricKey]
//       );

//       await setDoc(doc(db, "approvedSuggestions", metricKey), {
//         metricId: latestMetric.docId,
//         metric: metricKey,
//         approvedAt: new Date(),
//         approvedValue: numericValue, // <-- store actual approved numeric value
//         suggestions: suggestionsByMetric[metricKey] || [],
//       });

//       setHandledMetrics((prev) => ({ ...prev, [metricKey]: "approved" }));
//       checkAllHandled({ ...handledMetrics, [metricKey]: "approved" });
//     } catch (err) {
//       console.error("Error approving metric:", err);
//     }
//   };

//   // Reject suggestions
//   const handleReject = (metricKey) => {
//     setHandledMetrics((prev) => ({ ...prev, [metricKey]: "rejected" }));
//     checkAllHandled({ ...handledMetrics, [metricKey]: "rejected" });
//   };

//   const checkAllHandled = (metricsState) => {
//     const allHandled = ["temperature", "pressure", "emissions"].every((m) => metricsState[m]);
//     if (allHandled && onAllHandled) onAllHandled();
//   };

//   const highlightNumbers = (text) => {
//     if (!text) return null;
//     return String(text)
//       .split(/(\d+(\.\d+)?)/g)
//       .map((part, idx) =>
//         /\d/.test(part) ? <strong key={idx} className="text-success">{part}</strong> : part
//       );
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">AI Suggestions (LLM)</h2>

//       {loading && <p className="text-muted">Generating suggestions...</p>}
//       {!latestMetric && !loading && <p className="text-muted">No metrics submitted yet.</p>}

//       {latestMetric && !loading &&
//         ["temperature", "pressure", "emissions"].map((metric) => (
//           <div key={metric} className="mb-3">
//             <h5 className="text-primary text-capitalize">{metric} suggestions:</h5>
//             <ul className="list-group mb-2">
//               {suggestionsByMetric[metric]?.length > 0 ? (
//                 suggestionsByMetric[metric].map((s, idx) => (
//                   <li className="list-group-item list-group-item-warning" key={idx}>
//                     {highlightNumbers(s)}
//                   </li>
//                 ))
//               ) : (
//                 <li className="list-group-item text-muted">No suggestions available</li>
//               )}
//             </ul>
//             <button
//               className="btn btn-success me-2"
//               onClick={() => handleApprove(metric)}
//               disabled={handledMetrics[metric] || loading}
//             >
//               {handledMetrics[metric] === "approved" ? "Approved ✅" : `Approve ${metric}`}
//             </button>
//             <button
//               className="btn btn-danger"
//               onClick={() => handleReject(metric)}
//               disabled={handledMetrics[metric] || loading}
//             >
//               {handledMetrics[metric] === "rejected" ? "Rejected ❌" : `Do Not Approve`}
//             </button>
//           </div>
//         ))
//       }
//     </div>
//   );
// }

// export default Suggestions;








// //---------------------trying to change, to extract from suggestions itself instead fo firestore--------------
// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, setDoc, doc } from "firebase/firestore";

// function Suggestions({ onAllHandled }) {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [suggestionsByMetric, setSuggestionsByMetric] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [handledMetrics, setHandledMetrics] = useState({}); // tracks approved/rejected

//   // Fetch latest metric from Firestore
//   useEffect(() => {
//     const q = query(
//       collection(db, "metrics"),
//       orderBy("createdAt", "desc"),
//       limit(1)
//     );

//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docSnap = snapshot.docs[0];
//         const data = docSnap.data();
//         data.docId = docSnap.id; // store document ID for approvals
//         setLatestMetric(data);
//         fetchSuggestions(data); 
//       }
//     });

//     return () => unsub();
//   }, []);

//   // Call backend API to fetch AI suggestions
//   const fetchSuggestions = async (metrics) => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:5000/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ metrics }),
//       });

//       const data = await res.json();
//       if (data.suggestions) {
//         const tempList = data.suggestions
//           .split(/\n|\*|-/)
//           .map((s) => s.trim())
//           .filter(Boolean);

//         const byMetric = { temperature: [], pressure: [], emissions: [] };
//         let currentMetric = null;

//         tempList.forEach((line) => {
//           if (line.toLowerCase().includes("temperature")) currentMetric = "temperature";
//           else if (line.toLowerCase().includes("pressure")) currentMetric = "pressure";
//           else if (line.toLowerCase().includes("emission")) currentMetric = "emissions";
//           else if (currentMetric) byMetric[currentMetric].push(line);
//         });

//         setSuggestionsByMetric(byMetric);
//       } else {
//         setSuggestionsByMetric({});
//       }
//     } catch (err) {
//       console.error("Error fetching AI suggestions:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Approve suggestions
//   const handleApprove = async (metricKey) => {
//     if (!latestMetric) return;
//     try {
//       await setDoc(doc(db, "approvedSuggestions", metricKey), {
//         metricId: latestMetric.docId,
//         metric: metricKey,
//         approvedAt: new Date(),
//         suggestions: suggestionsByMetric[metricKey] || [],
//       });
//       setHandledMetrics((prev) => ({ ...prev, [metricKey]: "approved" }));
//       checkAllHandled({ ...handledMetrics, [metricKey]: "approved" });
//     } catch (err) {
//       console.error("Error approving metric:", err);
//     }
//   };

//   // Reject suggestions
//   const handleReject = (metricKey) => {
//     setHandledMetrics((prev) => ({ ...prev, [metricKey]: "rejected" }));
//     checkAllHandled({ ...handledMetrics, [metricKey]: "rejected" });
//   };

//   // Check if all metrics are handled
//   const checkAllHandled = (metricsState) => {
//     const allHandled = ["temperature", "pressure", "emissions"].every(
//       (m) => metricsState[m]
//     );
//     if (allHandled && onAllHandled) onAllHandled(); // switch to Autonomous Mode
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">AI Suggestions (LLM)</h2>
//       {loading && <p className="text-muted">Generating suggestions...</p>}
//       {latestMetric ? (
//         <>
//           {["temperature", "pressure", "emissions"].map((metric) => (
//             <div key={metric} className="mb-3">
//               <h5 className="text-primary text-capitalize">{metric} suggestions:</h5>
//               <ul className="list-group mb-2">
//                 {suggestionsByMetric[metric]?.map((s, idx) => (
//                   <li className="list-group-item list-group-item-warning" key={idx}>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 className="btn btn-success me-2"
//                 onClick={() => handleApprove(metric)}
//                 disabled={handledMetrics[metric]}
//               >
//                 {handledMetrics[metric] === "approved" ? "Approved ✅" : `Approve ${metric}`}
//               </button>
//               <button
//                 className="btn btn-danger"
//                 onClick={() => handleReject(metric)}
//                 disabled={handledMetrics[metric]}
//               >
//                 {handledMetrics[metric] === "rejected" ? "Rejected ❌" : `Do Not Approve`}
//               </button>
//             </div>
//           ))}
//         </>
//       ) : (
//         <p className="text-muted">No metrics submitted yet.</p>
//       )}
//     </div>
//   );
// }

// export default Suggestions;





// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit, setDoc, doc } from "firebase/firestore";

// function Suggestions() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [suggestionsByMetric, setSuggestionsByMetric] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [approvedMetrics, setApprovedMetrics] = useState({});

//   // Fetch latest metric from Firestore
//   useEffect(() => {
//     const q = query(
//       collection(db, "metrics"),
//       orderBy("createdAt", "desc"),
//       limit(1)
//     );

//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const docSnap = snapshot.docs[0];
//         const data = docSnap.data();
//         data.docId = docSnap.id; // store document ID for approvals
//         setLatestMetric(data);
//         fetchSuggestions(data); // call backend when new metric arrives
//       }
//     });

//     return () => unsub();
//   }, []);

//   // Call backend API with latest metric
//   const fetchSuggestions = async (metrics) => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:5000/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ metrics }),
//       });

//       const data = await res.json();

//       if (data.suggestions) {
//         const tempList = data.suggestions.split(/\n|\*|-/).map((s) => s.trim()).filter(Boolean);

//         // Split suggestions by metric: Temperature, Pressure, Emissions
//         const byMetric = { temperature: [], pressure: [], emissions: [] };
//         let currentMetric = null;

//         tempList.forEach((line) => {
//           if (line.toLowerCase().includes("temperature")) currentMetric = "temperature";
//           else if (line.toLowerCase().includes("pressure")) currentMetric = "pressure";
//           else if (line.toLowerCase().includes("emission")) currentMetric = "emissions";
//           else if (currentMetric) byMetric[currentMetric].push(line);
//         });

//         setSuggestions(tempList);
//         setSuggestionsByMetric(byMetric);
//       } else {
//         setSuggestions([]);
//         setSuggestionsByMetric({});
//       }
//     } catch (err) {
//       console.error("Error fetching AI suggestions:", err);
//       setSuggestions(["⚠️ Failed to fetch AI suggestions"]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Approve suggestions for a metric
//   const handleApprove = async (metricKey) => {
//     if (!latestMetric) return;

//     try {
//       await setDoc(doc(db, "approvedSuggestions", metricKey), {
//         metricId: latestMetric.docId,
//         metric: metricKey,
//         approvedAt: new Date(),
//         suggestions: suggestionsByMetric[metricKey] || [],
//       });

//       setApprovedMetrics((prev) => ({ ...prev, [metricKey]: true }));
//     } catch (err) {
//       console.error("Error approving metric:", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">AI Suggestions (LLM)</h2>

//       {loading && <p className="text-muted">Generating suggestions...</p>}

//       {latestMetric ? (
//         <>
//           {["temperature", "pressure", "emissions"].map((metric) => (
//             <div key={metric} className="mb-3">
//               <h5 className="text-primary text-capitalize">{metric} suggestions:</h5>
//               <ul className="list-group mb-2">
//                 {suggestionsByMetric[metric]?.map((s, idx) => (
//                   <li className="list-group-item list-group-item-warning" key={idx}>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 className="btn btn-success"
//                 onClick={() => handleApprove(metric)}
//                 disabled={approvedMetrics[metric]}
//               >
//                 {approvedMetrics[metric] ? "Approved ✅" : `Approve ${metric}`}
//               </button>
//             </div>
//           ))}
//         </>
//       ) : (
//         <p className="text-muted">No metrics submitted yet.</p>
//       )}
//     </div>
//   );
// }

// export default Suggestions;


// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// function Suggestions() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch latest metric from Firestore
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();
//         data.id = snapshot.docs[0].id; // store Firestore doc id
//         setLatestMetric(data);
//         fetchSuggestions(data); // generate AI suggestions
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Fetch AI suggestions from backend
//   const fetchSuggestions = async (metrics) => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:5000/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ metrics }),
//       });
//       const data = await res.json();
//       if (data.suggestions) {
//         const list = data.suggestions
//           .split(/\n|•|-/)
//           .map((s) => s.trim())
//           .filter((s) => s.length > 0);
//         setSuggestions(list);
//       } else setSuggestions([]);
//     } catch (err) {
//       console.error("Error fetching AI suggestions:", err);
//       setSuggestions(["⚠️ Failed to fetch AI suggestions"]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Approve a suggestion and store it in Firestore via backend
//   const handleApprove = async (suggestion) => {
//     if (!latestMetric) return;
//     try {
//       await fetch("http://localhost:5000/api/approve-suggestion", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           suggestion,
//           metricId: latestMetric.id,
//           metrics: latestMetric, // approved metrics
//         }),
//       });
//       alert("✅ Suggestion approved!");
//     } catch (err) {
//       console.error("Failed to approve suggestion:", err);
//       alert("⚠️ Failed to approve suggestion");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">AI Suggestions (LLM)</h2>

//       {loading && <p className="text-muted">Generating suggestions...</p>}

//       {latestMetric ? (
//         suggestions.length > 0 ? (
//           <ul className="list-group">
//             {suggestions.map((s, idx) => (
//               <li
//                 className="list-group-item list-group-item-warning d-flex justify-content-between align-items-center"
//                 key={idx}
//               >
//                 <span>{s}</span>
//                 <button
//                   className="btn btn-sm btn-success"
//                   onClick={() => handleApprove(s)}
//                 >
//                   Approve
//                 </button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           !loading && <p className="text-success">No suggestions needed for current metrics.</p>
//         )
//       ) : (
//         <p className="text-muted">No metrics submitted yet.</p>
//       )}
//     </div>
//   );
// }

// export default Suggestions;




// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// function Suggestions() {
//   const [latestMetric, setLatestMetric] = useState(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch latest metric from Firestore
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "desc"), limit(1));
//     const unsub = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();
//         setLatestMetric(data);
//         fetchSuggestions(data); // call backend when new metric arrives
//       }
//     });
//     return () => unsub();
//   }, []);

//   // Call backend API with latest metric
//   const fetchSuggestions = async (metrics) => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:5000/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ metrics }),
//       });

//       const data = await res.json();
//       if (data.suggestions) {
//         // Gemini may return long text, split into bullet points
//         const list = data.suggestions
//           .split(/\n|•|-/)
//           .map((s) => s.trim())
//           .filter((s) => s.length > 0);
//         setSuggestions(list);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (err) {
//       console.error("Error fetching AI suggestions:", err);
//       setSuggestions(["⚠️ Failed to fetch AI suggestions"]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">AI Suggestions (LLM)</h2>

//       {loading && <p className="text-muted">Generating suggestions...</p>}

//       {latestMetric ? (
//         suggestions.length > 0 ? (
//           <ul className="list-group">
//             {suggestions.map((s, idx) => (
//               <li className="list-group-item list-group-item-warning" key={idx}>
//                 {s}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           !loading && <p className="text-success">No suggestions needed for current metrics.</p>
//         )
//       ) : (
//         <p className="text-muted">No metrics submitted yet.</p>
//       )}
//     </div>
//   );
// }

// export default Suggestions;

// // import React, { useEffect, useState } from "react";
// // import { db } from "../firebase";
// // import { collection, onSnapshot } from "firebase/firestore";
 
// // const generateSuggestions = (metrics) => {
// //   if (!metrics) return [];
// //   const { temperature, pressure, emissions, millEnergy, clinkerQuality, fuelFossilPercent, utilitiesConsumption, flow } = metrics;
// //   const suggestions = [];
 
// //   if (temperature > 1450) suggestions.push("Reduce fuel input or increase cooling.");
// //   if (pressure > 60) suggestions.push("Check valves or adjust pressure release.");
// //   if (emissions > 300) suggestions.push("Check filters or adjust combustion process.");
// //   if (temperature < 1420) suggestions.push("Increase fuel input to maintain optimal temperature.");
// //   if (millEnergy > 1050) suggestions.push("Optimize grinding efficiency to reduce energy consumption.");
// //   if (clinkerQuality < 85) suggestions.push("Adjust raw mix to improve clinker quality.");
// //   if (fuelFossilPercent > 40) suggestions.push("Reduce fossil fuel usage and increase alternative fuel ratio.");
// //   if (utilitiesConsumption > 500) suggestions.push("Check utility consumption and optimize processes.");
// //   if (flow < 100) suggestions.push("Increase clinker flow to maintain production target.");
 
// //   return suggestions;
// // };
 
// // function Suggestions() {
// //   const [latestMetric, setLatestMetric] = useState(null);
// //   const [suggestions, setSuggestions] = useState([]);
 
// //   useEffect(() => {
// //     const unsub = onSnapshot(collection(db, "metrics"), (snapshot) => {
// //       if (!snapshot.empty) {
// //         const metrics = snapshot.docs[snapshot.docs.length - 1].data();
// //         setLatestMetric(metrics);
// //         setSuggestions(generateSuggestions(metrics));
// //       }
// //     });
// //     return () => unsub();
// //   }, []);
 
// //   return (
// //     <div className="container mt-4">
// //       <h2 className="mb-4">AI Suggestions</h2>
 
// //       {latestMetric ? (
// //         suggestions.length > 0 ? (
// //           <ul className="list-group">
// //             {suggestions.map((s, idx) => (
// //               <li className="list-group-item list-group-item-warning" key={idx}>{s}</li>
// //             ))}
// //           </ul>
// //         ) : (
// //           <p className="text-success">No suggestions needed for current metrics.</p>
// //         )
// //       ) : (
// //         <p className="text-muted">No metrics submitted yet.</p>
// //       )}
// //     </div>
// //   );
// // }
 
// // export default Suggestions;