import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reservas = () => {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el formulario de edición
    const [reservaEditando, setReservaEditando] = useState(null);
    const [formEdicion, setFormEdicion] = useState({
        fecha_reserva: '',
        turno: '',
        cantidad_adultos: 1,
        cantidad_menores: 0
    });

    const obtenerReservas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/reservas/mis-reservas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservas(response.data);
            setCargando(false);
        } catch (err) {
            console.error("Error al cargar reservas:", err);
            setError('No se pudieron cargar tus reservas.');
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerReservas();
    }, []);

    const handleCancelar = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/reservas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservas(reservas.filter(reserva => reserva.id !== id));
        } catch (err) {
            console.error("Error al cancelar:", err);
            alert('Hubo un error al cancelar la reserva.');
        }
    };

    const abrirEdicion = (reserva) => {
        setReservaEditando(reserva.id);
        const detalle = reserva.DetalleReservas?.[0] || {};
        setFormEdicion({
            fecha_reserva: detalle.fecha_reserva || '',
            turno: detalle.turno || '',
            cantidad_adultos: detalle.cantidad_adultos || 1,
            cantidad_menores: detalle.cantidad_menores || 0
        });
    };

    const handleGuardarEdicion = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/reservas/${id}`, formEdicion, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservaEditando(null);
            obtenerReservas();
        } catch (err) {
            console.error("Error al actualizar:", err);
            alert('Hubo un error al actualizar la reserva.');
        }
    };

    if (cargando) {
        return <div className="container py-5 text-center fw-semibold text-muted">Cargando tus reservas...</div>;
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger rounded-4 py-3 border-0 shadow-sm" role="alert">{error}</div>
            </div>
        );
    }

    if (reservas.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '600px' }}>
                    <h3 className="fw-bold text-dark mb-2">No tienes reservas registradas</h3>
                    <p className="text-muted mb-4">Explora nuestras excursiones disponibles y comienza a planificar tu próxima aventura.</p>
                    <button onClick={() => navigate('/actividades')} className="btn btn-dark rounded-pill px-4 py-2 fw-semibold shadow-sm">
                        Ver Excursiones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="mb-5 text-center text-md-start">
                <h1 className="fw-bold text-dark">Mis Reservas</h1>
                <p className="text-muted">Administra el estado, fechas y detalles de tus experiencias contratadas.</p>
            </div>

            <div className="row g-4">
                {reservas.map((reserva) => (
                    <div className="col-md-6 col-lg-4" key={reserva.id}>
                        <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column overflow-hidden bg-white">
                            
                            {/* Cabecera de la Tarjeta */}
                            <div className="p-4 pb-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                                <div>
                                    <span className="text-uppercase small fw-bold text-muted tracking-wider">Reserva</span>
                                    <h5 className="fw-bold text-dark mb-0">#{reserva.id}</h5>
                                </div>
                                <span className="badge bg-dark bg-opacity-10 text-dark text-uppercase rounded-pill px-3 py-2 fw-bold small">
                                    {reserva.estado}
                                </span>
                            </div>

                            {/* Cuerpo de la Tarjeta */}
                            <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="mb-3">
                                        <span className="d-block text-muted small fw-semibold text-uppercase">Contacto</span>
                                        <span className="text-dark small fw-medium">{reserva.telefono}</span>
                                        <span className="text-muted small d-block">{reserva.email}</span>
                                    </div>

                                    <hr className="text-muted opacity-25 my-3" />

                                    <span className="d-block text-muted small fw-semibold text-uppercase mb-2">Actividades</span>
                                    {reserva.DetalleReservas?.map((detalle, idx) => (
                                        <div key={idx} className="mb-3">
                                            <h6 className="fw-bold text-dark mb-1">{detalle.Actividad?.titulo || 'Experiencia'}</h6>
                                            <p className="text-muted small mb-1">
                                                Fecha: <span className="fw-semibold text-dark">{detalle.fecha_reserva || 'A confirmar'}</span>
                                            </p>
                                            <p className="text-muted small mb-1">
                                                Turno: <span className="fw-semibold text-dark">{detalle.turno || 'Sin turno'}</span>
                                            </p>
                                            <p className="text-muted small mb-0">
                                                Pasajeros: <span className="fw-semibold text-dark">{detalle.cantidad_adultos} Adulto(s)</span>
                                                {detalle.cantidad_menores > 0 && <span className="fw-semibold text-dark">, {detalle.cantidad_menores} Menor(es)</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="pt-3 border-top d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small fw-semibold">Total</span>
                                        <span className="fw-bold text-dark fs-5">
                                            ${Number(reserva.total || 0).toLocaleString('es-AR')}
                                        </span>
                                    </div>

                                    {/* Botones de Acción */}
                                    {reservaEditando !== reserva.id ? (
                                        <div className="d-grid gap-2">
                                            <button 
                                                className="btn btn-outline-dark btn-sm rounded-pill fw-semibold py-2"
                                                onClick={() => abrirEdicion(reserva)}
                                            >
                                                Modificar Reserva
                                            </button>
                                            <button 
                                                className="btn btn-outline-danger btn-sm rounded-pill fw-semibold py-2 border-0 text-danger"
                                                onClick={() => handleCancelar(reserva.id)}
                                            >
                                                Cancelar Reserva
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Formulario de Edición Desplegable */}
                                {reservaEditando === reserva.id && (
                                    <div className="mt-3 pt-3 border-top bg-white">
                                        <h6 className="fw-bold text-dark mb-3">Modificar Datos</h6>
                                        
                                        <div className="mb-2">
                                            <label className="form-label text-muted small fw-semibold">Nueva Fecha</label>
                                            <input 
                                                type="date" 
                                                className="form-control form-control-sm rounded-3"
                                                value={formEdicion.fecha_reserva} 
                                                onChange={(e) => setFormEdicion({...formEdicion, fecha_reserva: e.target.value})}
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="form-label text-muted small fw-semibold">Nuevo Turno</label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm rounded-3"
                                                value={formEdicion.turno} 
                                                onChange={(e) => setFormEdicion({...formEdicion, turno: e.target.value})}
                                            />
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <label className="form-label text-muted small fw-semibold">Adultos</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-sm rounded-3"
                                                    min="1"
                                                    value={formEdicion.cantidad_adultos} 
                                                    onChange={(e) => setFormEdicion({...formEdicion, cantidad_adultos: e.target.value})}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label text-muted small fw-semibold">Menores</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-sm rounded-3"
                                                    min="0"
                                                    value={formEdicion.cantidad_menores} 
                                                    onChange={(e) => setFormEdicion({...formEdicion, cantidad_menores: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-dark btn-sm rounded-pill w-100 fw-semibold" 
                                                onClick={() => handleGuardarEdicion(reserva.id)}
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary btn-sm rounded-pill w-100 fw-semibold" 
                                                onClick={() => setReservaEditando(null)}
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reservas;