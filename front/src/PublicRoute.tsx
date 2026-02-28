import { Navigate } from "react-router-dom";

export function PublicRoute({children}) {
    const token = localStorage.getItem("token")

    if(token) {
        return <Navigate to="/profile" replace/>
    }
    return children
}