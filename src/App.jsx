// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Pedhinamu from "./pages/Pedhinamu";
// import FullForm from "./pages/FullForm";
// import Records from "./pages/Records";
// import RecordView from "./pages/RecordView";
// import PedhinamuList from "./pages/PedhinamuList";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/pedhinamu" element={<Pedhinamu />} />
//         <Route path="/pedhinamu/form/:id" element={<FullForm />} />
//         <Route path="/pedhinamu/list" element={<PedhinamuList />} />
//         <Route path="/pedhinamu/edit/:id" element={<Pedhinamu />} />
//         <Route path="/records" element={<Records />} />
//         <Route path="/records/view/:id" element={<RecordView />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// NEW SCREEN
import PedhinamuHome from "./pages/PedhinamuHome";

import Pedhinamu from "./pages/Pedhinamu";            // Create / Edit
import FullForm from "./pages/FullForm";

import PedhinamuList from "./pages/PedhinamuList";   // View list
import PedhinamuView from "./pages/PedhinamuView";   // Tree structure

import Records from "./pages/Records";
import RecordView from "./pages/RecordView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Core */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* NEW MIDDLE SCREEN */}
        <Route path="/pedhinamu" element={<PedhinamuHome />} />

        {/* Create new */}
        <Route path="/pedhinamu/create" element={<Pedhinamu />} />

        {/* Edit existing */}
        <Route path="/pedhinamu/edit/:id" element={<Pedhinamu />} />

        {/* View Tree Structure */}
        <Route path="/pedhinamu/view/:id" element={<PedhinamuView />} />

        {/* Full form */}
        <Route path="/pedhinamu/form/:id" element={<FullForm />} />

        {/* List */}
        <Route path="/pedhinamu/list" element={<PedhinamuList />} />

        {/* Certificate Pages */}
        <Route path="/records" element={<Records />} />
        <Route path="/records/view/:id" element={<RecordView />} />

      </Routes>
    </BrowserRouter>
  );
}
