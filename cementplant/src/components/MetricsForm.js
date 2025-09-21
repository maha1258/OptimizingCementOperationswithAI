import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

const MetricsForm = ({ onMetricsSaved }) => {
  const [formData, setFormData] = useState({
    temperature: "", pressure: "", emissions: "",
    fuelType: "", rawMaterial: "", kilnType: ""
  });
  const [metrics, setMetrics] = useState([]);
  const [latestMetric, setLatestMetric] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "metrics"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString() : "",
      }));
      setMetrics(data);
      if (data.length > 0) setLatestMetric(data[data.length - 1]);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "metrics"), {
        ...formData,
        temperature: parseFloat(formData.temperature),
        pressure: parseFloat(formData.pressure),
        emissions: parseFloat(formData.emissions),
        createdAt: serverTimestamp(),
      });
      setFormData({ temperature: "", pressure: "", emissions: "", fuelType: "", rawMaterial: "", kilnType: "" });
      if (onMetricsSaved) onMetricsSaved(docRef.id);
    } catch (err) {
      console.error("Error saving metrics:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Plant Metrics Dashboard</h2>

      <div className="card shadow-sm p-4 mb-4">
        <h5 className="mb-3">Add New Metrics</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {["temperature","pressure","emissions","fuelType","rawMaterial","kilnType"].map(key => (
              <div className="col-md-4" key={key}>
                <input
                  type={["temperature","pressure","emissions"].includes(key) ? "number" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  className="form-control"
                  required
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success mt-3">Save Metrics</button>
        </form>
      </div>

      {latestMetric && (
        <div className="row g-3 mb-4">
          {["temperature","pressure","emissions"].map(key => (
            <div className="col-md-4" key={key}>
              <div className="card text-center shadow-sm p-3 border-start border-5 border-primary">
                <h6 className="text-muted">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                <h3>{latestMetric[key]}{key === "temperature" ? " °C" : key === "pressure" ? " bar" : " ppm"}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsForm;
















// import React, { useState, useEffect } from "react";
// import { db } from "../firebase";
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   query,
//   orderBy,
//   serverTimestamp,
// } from "firebase/firestore";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
 
// const MetricsForm = () => {
//   const [formData, setFormData] = useState({ temperature: "", pressure: "", emissions: "" });
//   const [metrics, setMetrics] = useState([]);
//   const [latestMetric, setLatestMetric] = useState(null);
 
//   // Fetch metrics in real-time
//   useEffect(() => {
//     const q = query(collection(db, "metrics"), orderBy("createdAt", "asc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const data = snapshot.docs.map((doc) => {
//         const docData = doc.data();
//         return {
//           id: doc.id,
//           temperature: docData.temperature,
//           pressure: docData.pressure,
//           emissions: docData.emissions,
//           createdAt: docData.createdAt ? docData.createdAt.toDate().toLocaleString() : "",
//         };
//       });
//       setMetrics(data);
//       if (data.length > 0) setLatestMetric(data[data.length - 1]);
//     });
//     return () => unsubscribe();
//   }, []);
 
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };
 
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await addDoc(collection(db, "metrics"), {
//         temperature: parseFloat(formData.temperature),
//         pressure: parseFloat(formData.pressure),
//         emissions: parseFloat(formData.emissions),
//         createdAt: serverTimestamp(),
//       });
//       setFormData({ temperature: "", pressure: "", emissions: "" });
//     } catch (err) {
//       console.error("Error saving metrics:", err);
//     }
//   };
 
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white border p-2 shadow-sm">
//           <p className="fw-bold">{label}</p>
//           {payload.map((p) => (
//             <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
//               {p.dataKey}: {p.value}
//               {p.dataKey === "temperature" ? " °C" : p.dataKey === "pressure" ? " bar" : " ppm"}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };
 
//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Plant Metrics Dashboard</h2>
 
//       {/* Input Form */}
//       <div className="card shadow-sm p-4 mb-4">
//         <h5 className="mb-3">Add New Metrics</h5>
//         <form onSubmit={handleSubmit}>
//           <div className="row g-3">
//             <div className="col-md-4">
//               <input
//                 type="number"
//                 name="temperature"
//                 value={formData.temperature}
//                 onChange={handleChange}
//                 placeholder="Temperature (°C)"
//                 className="form-control"
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <input
//                 type="number"
//                 name="pressure"
//                 value={formData.pressure}
//                 onChange={handleChange}
//                 placeholder="Pressure (bar)"
//                 className="form-control"
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <input
//                 type="number"
//                 name="emissions"
//                 value={formData.emissions}
//                 onChange={handleChange}
//                 placeholder="Emissions (ppm)"
//                 className="form-control"
//                 required
//               />
//             </div>
//           </div>
//           <button type="submit" className="btn btn-success mt-3">
//             Save Metrics
//           </button>
//         </form>
//       </div>
 
//       {/* Current Metrics */}
//       {latestMetric && (
//         <div className="row g-3 mb-4">
//           {["temperature", "pressure", "emissions"].map((key) => (
//             <div className="col-md-4" key={key}>
//               <div className="card text-center shadow-sm p-3 border-start border-5 border-primary">
//                 <h6 className="text-muted">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
//                 <h3>
//                   {latestMetric[key]}
//                   {key === "temperature" ? " °C" : key === "pressure" ? " bar" : " ppm"}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
 
//       {/* Trend Chart */}
//       <div className="card shadow-sm p-3">
//         <h5 className="mb-3">Metrics Trend</h5>
//         <ResponsiveContainer width="100%" height={350}>
//           <LineChart data={metrics}>
//             <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
//             <XAxis dataKey="createdAt" angle={-45} textAnchor="end" interval={0} height={60} />
//             <YAxis />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend verticalAlign="top" height={36} />
//             <Line type="monotone" dataKey="temperature" stroke="#FF5733" strokeWidth={2} />
//             <Line type="monotone" dataKey="pressure" stroke="#337AFF" strokeWidth={2} />
//             <Line type="monotone" dataKey="emissions" stroke="#33CC33" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };
 
// export default MetricsForm;
 