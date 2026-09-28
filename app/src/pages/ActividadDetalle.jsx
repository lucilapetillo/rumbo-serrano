import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ActividadDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [actividad, setActividad] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para los parámetros de la reserva
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana (09:00 hs)');
    
    // Contadores para adultos y menores
    const [cantidadAdultos, setCantidadAdultos] = useState(1);
    const [cantidadMenores, setCantidadMenores] = useState(0);

    const [agregando, setAgregando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        axios.get(`http://localhost:3000/api/actividades/${id}`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setActividad(data);

                const salidas = data.fechas || data.salidas || data.turnos || [];
                if (salidas.length > 0) {
                    const primeraFecha = salidas[0].fecha || salidas[0];
                    setFechaSeleccionada(primeraFecha);
                } else if (data.fecha_inicio) {
                    setFechaSeleccionada(data.fecha_inicio.split('T')[0]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener detalle:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="container py-5 text-center fw-bold">Cargando experiencia...</div>;
    }

    if (!actividad) {
        return (
            <div className="container py-5 text-center">
                <h3>Actividad no encontrada</h3>
                <button onClick={() => navigate('/actividades')} className="btn btn-outline-dark mt-3 rounded-pill">
                    Volver a Actividades
                </button>
            </div>
        );
    }

    const listaFechas = actividad.fechas || actividad.salidas || [];
    const cupoDisponible = actividad.cupo_disponible ?? actividad.cupo ?? 10;
    const totalPersonas = cantidadAdultos + cantidadMenores;
    const sinCupos = cupoDisponible <= 0;

    const handleAgregarAlCarrito = async () => {
        if (!fechaSeleccionada) {
            setMensaje({ tipo: 'danger', texto: 'Por favor seleccioná una fecha para la reserva.' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMensaje({ tipo: 'warning', texto: 'Debés iniciar sesión para reservar una experiencia.' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setAgregando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            await axios.post(
                'http://localhost:3000/api/carrito/items',
                {
                    actividad_id: actividad.id,
                    cantidad: totalPersonas, // Suma total por compatibilidad
                    cantidad_adultos: cantidadAdultos,
                    cantidad_menores: cantidadMenores,
                    fecha_reserva: fechaSeleccionada,
                    turno: turnoSeleccionado
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMensaje({ tipo: 'success', texto: '¡Actividad agregada al carrito con éxito!' });
            setAgregando(false);
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            setMensaje({ 
                tipo: 'danger', 
                texto: error.response?.data?.mensaje || error.response?.data?.error || 'Error al agregar al carrito.' 
            });
            setAgregando(false);
        }
    };

    return (
        <div className="container py-5">
            {/* Botón Volver */}
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-outline-secondary rounded-pill px-4 mb-4 fw-bold shadow-sm"
                style={{ fontSize: '14px' }}
            >
                ❮ Volver
            </button>

            <div className="row g-5 align-items-center">
                {/* Imagen */}
                <div className="col-lg-6">
                    <img 
                        src={actividad.imagen || 'https://via.placeholder.com/600x400?text=Sin+Imagen'} 
                        alt={actividad.titulo} 
                        className="img-fluid rounded-4 shadow-sm w-100" 
                        style={{ maxHeight: '420px', objectFit: 'cover' }}
                    />
                </div>

                {/* Detalles y Formulario de Reserva */}
                <div className="col-lg-6">
                    <h1 className="fw-bold text-dark mb-1">{actividad.titulo}</h1>
                    <p className="text-muted fw-bold mb-3">📍 {actividad.ubicacion || 'Ubicación a coordinar'}</p>

                    <h2 className="text-dark fw-bold fs-2 mb-3">
                        ${Number(actividad.precio).toLocaleString('es-AR')} <span className="fs-6 text-muted font-normal">/ por persona</span>
                    </h2>

                    <p className="text-secondary mb-4" style={{ lineHeight: '1.6' }}>
                        {actividad.descripcion || 'Recorrido guiado por el lago y las sierras.'}
                    </p>

                    {/* SELECTOR DE FECHAS */}
                    <div className="mb-3">
                        <label className="form-label fw-bold text-dark">Fecha de la excursión:</label>
                        {listaFechas.length > 0 ? (
                            <select 
                                className="form-select rounded-3 shadow-sm"
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                            >
                                {listaFechas.map((f, idx) => (
                                    <option key={idx} value={f.fecha || f}>
                                        {f.fecha ? new Date(f.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : f}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="date"
                                className="form-control rounded-3 shadow-sm"
                                min={new Date().toISOString().split('T')[0]}
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                            />
                        )}
                    </div>

                    {/* SELECTOR DE TURNO */}
                    <div className="mb-3">
                        <label className="form-label fw-bold text-dark">Turno / Horario:</label>
                        <select 
                            className="form-select rounded-3 shadow-sm"
                            value={turnoSeleccionado}
                            onChange={(e) => setTurnoSeleccionado(e.target.value)}
                        >
                            <option value="Mañana (09:00 hs)">Mañana (09:00 hs)</option>
                            <option value="Tarde (14:00 hs)">Tarde (14:00 hs)</option>
                            <option value="Atardecer (17:30 hs)">Atardecer (17:30 hs)</option>
                        </select>
                    </div>

                    {/* CANTIDAD DE ADULTOS Y MENORES */}
                    <div className="row g-3 mb-4">
                        {/* ADULTOS */}
                        <div className="col-6">
                            <label className="form-label fw-bold text-dark">Adultos:</label>
                            <div className="d-flex align-items-center gap-2">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-dark rounded-circle fw-bold"
                                    style={{ width: '38px', height: '38px' }}
                                    onClick={() => setCantidadAdultos(Math.max(1, cantidadAdultos - 1))}
                                >
                                    -
                                </button>
                                <span className="fw-bold fs-5 px-2">{cantidadAdultos}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-dark rounded-circle fw-bold"
                                    style={{ width: '38px', height: '38px' }}
                                    onClick={() => setCantidadAdultos(cantidadAdultos + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* MENORES */}
                        <div className="col-6">
                            <label className="form-label fw-bold text-dark">Menores:</label>
                            <div className="d-flex align-items-center gap-2">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-dark rounded-circle fw-bold"
                                    style={{ width: '38px', height: '38px' }}
                                    onClick={() => setCantidadMenores(Math.max(0, cantidadMenores - 1))}
                                >
                                    -
                                </button>
                                <span className="fw-bold fs-5 px-2">{cantidadMenores}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-dark rounded-circle fw-bold"
                                    style={{ width: '38px', height: '38px' }}
                                    onClick={() => setCantidadMenores(cantidadMenores + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MENSAJES DE ESTADO */}
                    {mensaje.texto && (
                        <div className={`alert alert-${mensaje.tipo} py-2 rounded-3 text-center mb-3`} role="alert">
                            {mensaje.texto}
                        </div>
                    )}

                    {/* BOTÓN AGREGAR AL CARRITO */}
                    <button 
                        onClick={handleAgregarAlCarrito}
                        disabled={sinCupos || agregando}
                        className="btn btn-dark btn-lg w-100 fw-bold rounded-pill shadow"
                        style={{ padding: '14px' }}
                    >
                        {agregando ? 'AGREGANDO...' : sinCupos ? 'SIN LUGARES DISPONIBLES' : 'AGREGAR AL CARRITO'}
                    </button>
                </div>
            </div>
        </div>
    );
};