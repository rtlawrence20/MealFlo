import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";

import Overview from "./pages/Overview.jsx";
import Recipes from "./pages/Recipes.jsx";
import Planner from "./pages/Planner.jsx";
import ShoppingList from "./pages/ShoppingList.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/shopping" element={<ShoppingList />} />
            </Route>
            <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
    );
}
