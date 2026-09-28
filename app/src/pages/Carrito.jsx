import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Carrito = () => {
    const navigate = useNavigate();
    const [carrito, setCarrito] = useState(null);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    
    // Estado para controlar la vista de éxito tras la compra
    const [reservaExitosa, setReservaExitosa] = useState(false);
    const [reservaRealizada, setReservaRealizada] = useState(null);

    // Datos de contacto necesarios para el checkout
    const [datosContacto, setDatosContacto] = useState({
        telefono: '',
        email: ''
    });
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const token = localStorage.getItem('token');

    const cargarCarrito = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get('http://localhost:3000/api/carrito', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarrito(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCarrito();
    }, []);

    const handleEliminarItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:3000/api/carrito/items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarCarrito();
        } catch (error) {
            console.error("Error al eliminar el ítem:", error);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!datosContacto.telefono || !datosContacto.email) {
            setMensaje({ tipo: 'danger', texto: 'Por favor ingresá tu teléfono y email de contacto.' });
            return;
        }

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const response = await axios.post(
                'http://localhost:3000/api/reservas/checkout',
                {
                    telefono: datosContacto.telefono,
                    email: datosContacto.email
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Guardamos la reserva creada para mostrar datos si el backend los devuelve
            setReservaRealizada(response.data);
            setReservaExitosa(true);
        } catch (error) {
            console.error("Error al procesar la reserva:", error);
            setMensaje({ 
                tipo: 'danger', 
                texto: error.response?.data?.mensaje || 'Ocurrió un error al procesar tu reserva.' 
            });
            setProcesando(false);
        }
    };

    if (loading) {
        return <div className="container py-5 text-center fw-bold">Cargando tu carrito...</div>;
    }

    // --- VISTA DE CONFIRMACIÓN DE RESERVA EXITOSA ---
    if (reservaExitosa) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 text-center">
                        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                            {/* Ícono animado de éxito */}
                            <div 
                                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 text-success bg-success-subtle" 
                                style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                            >
                                ✓
                            </div>

                            <h2 className="fw-bold text-dark mb-2">¡Reserva Confirmada!</h2>
                            <p className="text-secondary fs-6 mb-4">
                                Te enviamos la confirmación e itinerario completo de tu experiencia a <strong>{datosContacto.email}</strong>.
                            </p>

                            {reservaRealizada?.reserva?.id && (
                                <div className="bg-light rounded-3 p-3 mb-4 d-inline-block border">
                                    <span className="text-muted small d-block">Número de Reserva</span>
                                    <strong className="fs-5 text-dark">#{reservaRealizada.reserva.id}</strong>
                                </div>
                            )}

                            <div className="d-grid gap-2">
                                {/* Botón a Gmail */}
                                <a 
                                    href="https://mail.google.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-danger btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    <span>Abrir Gmail</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                                    </svg>
                                </a>

                                {/* Link a Mis Reservas */}
                                <button 
                                    onClick={() => navigate('/Reservas')} 
                                    className="btn btn-dark btn-lg rounded-pill fw-bold mt-2"
                                >
                                    Ver mis Reservas
                                </button>

                                {/* Volver al inicio */}
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="btn btn-link text-muted text-decoration-none mt-1"
                                >
                                    Volver al inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const items = carrito?.ItemCarritos || [];
    const totalCarrito = items.reduce((acc, item) => acc + (Number(item.Actividad?.precio || 0) * item.cantidad), 0);

    if (items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h2 className="fw-bold text-dark">Tu carrito está vacío</h2>
                <p className="text-muted">Explorá nuestras actividades y empezá a planificar tu aventura.</p>
                <button onClick={() => navigate('/actividades')} className="btn btn-dark rounded-pill px-4 mt-3 fw-bold">
                    Ver Excursiones
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-4 text-dark">Carrito de Reservas</h1>

            <div className="row g-4">
                {/* LISTA DE ÍTEMS EN EL CARRITO */}
                <div className="col-lg-8">
                    {items.map((item) => (
                        <div key={item.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
                            <div className="row align-items-center">
                                <div className="col-md-3">
                                    <img 
                                        src={item.Actividad?.imagen || 'https://via.placeholder.com/150'} 
                                        alt={item.Actividad?.titulo} 
                                        className="img-fluid rounded-3 w-100"
                                        style={{ height: '110px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-6 my-2 my-md-0">
                                    <h5 className="fw-bold text-dark mb-1">{item.Actividad?.titulo}</h5>
                                    <p className="text-muted small mb-1">
                                         <strong>Fecha:</strong> {item.fecha_reserva || 'A confirmar'} |  <strong>Turno:</strong> {item.turno || 'Sin turno'}
                                    </p>
                                    <p className="text-secondary small mb-0">
                                         <strong>Personas:</strong> {item.cantidad_adultos || item.cantidad} Adulto(s)
                                        {item.cantidad_menores > 0 && `, ${item.cantidad_menores} Menor(es)`}
                                    </p>
                                </div>
                                <div className="col-md-3 text-md-end">
                                    <h5 className="fw-bold text-dark mb-2">
                                        ${(Number(item.Actividad?.precio || 0) * item.cantidad).toLocaleString('es-AR')}
                                    </h5>
                                    <button 
                                        onClick={() => handleEliminarItem(item.id)}
                                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FORMULARIO DE CHECKOUT Y RESUMEN */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h4 className="fw-bold text-dark mb-3">Resumen de Compra</h4>
                        
                        <div className="d-flex justify-content-between fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                            <span>Total a pagar:</span>
                            <span>${totalCarrito.toLocaleString('es-AR')} ARS</span>
                        </div>

                        <form onSubmit={handleCheckout}>
                            <h6 className="fw-bold text-dark mb-3">Datos de Contacto para la Reserva:</h6>
                            
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Teléfono de contacto</label>
                                <input 
                                    type="tel" 
                                    className="form-control rounded-3" 
                                    placeholder="Ej: +54 9 351 123 4567"
                                    required
                                    value={datosContacto.telefono}
                                    onChange={(e) => setDatosContacto({ ...datosContacto, telefono: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">Email de confirmación</label>
                                <input 
                                    type="email" 
                                    className="form-control rounded-3" 
                                    placeholder="ejemplo@correo.com"
                                    required
                                    value={datosContacto.email}
                                    onChange={(e) => setDatosContacto({ ...datosContacto, email: e.target.value })}
                                />
                            </div>

                            {mensaje.texto && (
                                <div className={`alert alert-${mensaje.tipo} py-2 rounded-3 text-center mb-3 small`} role="alert">
                                    {mensaje.texto}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={procesando}
                                className="btn btn-dark btn-lg w-100 fw-bold rounded-pill shadow"
                            >
                                {procesando ? 'PROCESANDO...' : 'CONFIRMAR RESERVA'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};