import {useState} from "react";
import { useNavigate } from "react-router-dom";

import "../css/login.css";

function Login()
{
    //useState para manejar el estado del formulario
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); //para cambiar pantalla
    const BASE_URL="elarqui-api-h9d9aed5ggfrdpe8.centralus-01.azurewebsites.net";
    const handleLogin = async () =>
    {
        setLoading(true);
        setError("");

        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            navigate("/ventas");
        } else {
            setError(data.message);
        }

        
       ;

        setLoading(false);
    };

    return (
       <div className="login-container">
    <div className="login-card">

        <h1>El Arqui</h1>

        <form
            className="login-form"
            onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }}
        >
            <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                type="submit"
                className="login-btn"
                disabled={loading}
            >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
        </form>

        {error && (
            <p className="login-error">
                {error}
            </p>
        )}

    </div>
</div>
    );
}

export default Login;
