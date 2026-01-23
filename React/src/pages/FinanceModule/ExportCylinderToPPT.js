// import React, { useState } from "react";
// import { useDropzone } from "react-dropzone";
// import PptxGenJS from "pptxgenjs";
// import { Button, Card, CardContent, Typography, CircularProgress } from "@mui/material";

// export default function ExportCylinderToPPT() {
//   const [files, setFiles] = useState([]);
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 1️⃣ Handle file upload
//   const onDrop = acceptedFiles => setFiles(prev => [...prev, ...acceptedFiles]);
//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: { "image/*": [] },
//   });

//   // 2️⃣ Mock AI Inspection (replace with real API call)
//   const analyzeImage = async (file) => {
//     return {
//       dent: Math.random() > 0.7 ? "Yes" : "No",
//       paint: Math.random() > 0.5 ? "Yes" : "No",
//       confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
//     };
//   };

//   // 3️⃣ Run inspection for all files
//   const runInspection = async () => {
//     if (!files.length) return;
//     setLoading(true);
//     const analysis = [];
//     for (const f of files) {
//       const res = await analyzeImage(f);
//       analysis.push({ name: f.name, ...res });
//     }
//     setResults(analysis);
//     setLoading(false);
//   };

//   // 4️⃣ Generate PPT
//   const generatePPT = async () => {
//     if (!results.length) return;
//     const pptx = new PptxGenJS();

//     for (let i = 0; i < files.length; i++) {
//       const f = files[i];
//       const result = results[i];

//       const arrayBuffer = await f.arrayBuffer();
//       const base64 = btoa(
//         new Uint8Array(arrayBuffer).reduce(
//           (data, byte) => data + String.fromCharCode(byte),
//           ""
//         )
//       );

//       const slide = pptx.addSlide();
//       slide.addText(`Inspection Report: ${f.name}`, { x: 0.5, y: 0.3, fontSize: 20, bold: true, color: "003366" });
//       slide.addImage({ data: `data:image/jpeg;base64,${base64}`, x: 0.5, y: 1, w: 6, h: 4 });
//       slide.addText(
//         `Dent: ${result.dent}\nPaint Issue: ${result.paint}\nConfidence: ${result.confidence}`,
//         { x: 0.5, y: 5.2, fontSize: 14, color: "000000" }
//       );
//     }

//     pptx.writeFile({ fileName: "GasCylinderInspection.pptx" });
//   };

//   return (
//     <Card style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
//       <CardContent>
//         <div
//           {...getRootProps()}
//           style={{
//             border: "2px dashed #888",
//             padding: 30,
//             textAlign: "center",
//             cursor: "pointer",
//             marginBottom: 20,
//             borderRadius: 8,
//           }}
//         >
//           <input {...getInputProps()} />
//           <Typography variant="h6">Drag & Drop or Click to Upload Images</Typography>
//           {files.length > 0 && <Typography>{files.length} file(s) selected</Typography>}
//         </div>

//         <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={runInspection}
//             disabled={!files.length || loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Run Inspection"}
//           </Button>

//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={generatePPT}
//             disabled={!results.length}
//           >
//             Generate PPT
//           </Button>
//         </div>

//         {results.length > 0 && (
//           <div>
//             <Typography variant="h6" gutterBottom>Inspection Results:</Typography>
//             <ul>
//               {results.map((r, idx) => (
//                 <li key={idx}>
//                   {r.name} - Dent: {r.dent}, Paint: {r.paint}, Confidence: {r.confidence}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
