import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pedhinamu from "./pages/Pedhinamu";
import FullForm from "./pages/FullForm";
import Records from "./pages/Records";
import RecordView from "./pages/RecordView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedhinamu" element={<Pedhinamu />} />
        <Route path="/pedhinamu/form/:id" element={<FullForm />} />
        <Route path="/records" element={<Records />} />
        <Route path="/records/view/:id" element={<RecordView />} />
      </Routes>
    </BrowserRouter>
  );
}
