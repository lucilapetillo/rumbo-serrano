import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('token');

    const [cantidadCarrito, setCantidadCarrito] = useState(0);

    // Función para obtener la cantidad actual de ítems en el carrito
    const obtenerCantidadCarrito = async () => {
        if (!token) {
            setCantidadCarrito(0);
            return;
        }

        try {
            const res = await axios.get('http://localhost:3000/api/carrito', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const items = res.data?.ItemCarritos || [];
            
            // Sumamos la cantidad total de ítems
            const totalItems = items.reduce((acc, item) => acc + (item.cantidad || 1), 0);
            setCantidadCarrito(totalItems);
        } catch (error) {
            console.error("Error al obtener items del carrito:", error);
            setCantidadCarrito(0);
        }
    };

    // Actualizamos el contador cada vez que cambia la ruta en la aplicación
    useEffect(() => {
        obtenerCantidadCarrito();
    }, [location.pathname]);

    // Permitir acceso al panel a administradores y operadores
    const puedeAccederPanel = usuario && (usuario.rol === 'admin' || usuario.rol === 'operador');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setCantidadCarrito(0);
        navigate('/login');
    };

    return (
        <nav 
            className="navbar navbar-expand-lg px-3 px-md-4 py-3 sticky-top" 
            style={{ 
                backgroundColor: '#121212', 
                borderBottom: '1px solid #2A2A2A',
                zIndex: 1000 
            }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                
                {/* Logo / Branding */}
                <Link to="/home" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
                    <img 
                        src="/logo.png" 
                        alt="Logo Rumbo Serrano" 
                        style={{ width: '38px', height: '38px', objectFit: 'contain' }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    
                    <div className="lh-sm">
                        <span 
                            className="d-block text-uppercase fw-bold text-white" 
                            style={{ letterSpacing: '1.5px', fontSize: '1rem', lineHeight: '1' }}
                        >
                            RUMBO
                        </span>
                        <span 
                            className="fst-italic" 
                            style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#A0A0A0' }}
                        >
                            Serrano
                        </span>
                    </div>
                </Link>

                {/* Links de Navegación Principal */}
                <div 
                    className="d-none d-md-flex align-items-center gap-4 fw-semibold text-uppercase" 
                    style={{ fontSize: '0.825rem', letterSpacing: '1px' }}
                >
                    <Link 
                        to="/home" 
                        className="text-decoration-none text-white-50 hover-white"
                        style={{ transition: 'color 0.2s ease' }}
                    >
                        Inicio
                    </Link>
                    <Link 
                        to="/actividades" 
                        className="text-decoration-none text-white-50 hover-white"
                        style={{ transition: 'color 0.2s ease' }}
                    >
                        Actividades
                    </Link>
                    <Link 
                        to="/Reservas" 
                        className="text-decoration-none text-white-50 hover-white"
                        style={{ transition: 'color 0.2s ease' }}
                    >
                        Reservas
                    </Link>
                </div>

                {/* Sección de Usuario / Acceso */}
                <div className="d-flex align-items-center gap-3">
                    
                    {/* Botón Carrito con Navegación e Insignia */}
                    <Link 
                        to="/carrito" 
                        className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 text-white position-relative text-decoration-none" 
                        title="Carrito de compras"
                        style={{ width: '38px', height: '38px', backgroundColor: '#242424' }}
                    >
                        🛒
                        {cantidadCarrito > 0 && (
                            <span 
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ fontSize: '0.65rem' }}
                            >
                                {cantidadCarrito}
                            </span>
                        )}
                    </Link>

                    {usuario ? (
                        <div className="d-flex align-items-center gap-2">
                            {/* Insignia de Usuario */}
                            <span 
                                className="badge text-white fw-semibold px-3 py-2 border" 
                                style={{ borderRadius: '20px', fontSize: '0.8rem', backgroundColor: '#1E1E1E', borderColor: '#333333' }}
                            >
                                Usuario: {usuario.nombre_usuario}
                            </span>

                            {/* Acceso al Panel si corresponde */}
                            {puedeAccederPanel && (
                                <Link 
                                    to="/admin" 
                                    className="btn btn-light btn-sm fw-semibold px-3 py-1.5"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    Panel
                                </Link>
                            )}

                            {/* Botón Salir */}
                            <button 
                                onClick={handleLogout} 
                                className="btn btn-outline-danger btn-sm px-3 py-1.5 fw-medium" 
                                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex gap-2">
                            <Link 
                                to="/login" 
                                className="btn btn-outline-light btn-sm fw-semibold px-3 py-2" 
                                style={{ borderRadius: '8px', fontSize: '0.825rem' }}
                            >
                                Ingresar
                            </Link>
                            <Link 
                                to="/registro" 
                                className="btn btn-light btn-sm fw-semibold px-3 py-2 text-dark" 
                                style={{ borderRadius: '8px', fontSize: '0.825rem' }}
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
};