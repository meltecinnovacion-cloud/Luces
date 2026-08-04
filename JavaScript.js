// 🛠️ Dirección del servidor Backend Flask
const BASE_URL = "https://ways-poly-gradually-citizen.trycloudflare.com"; // 👈 PON AQUÍ TU ENLACE REAL

// Base de datos de personal por área integrada para evitar cruces de datos
const personalPorArea = {
    "innovacion": [
        { nombre: "Luis", puesto: "Ingeniero", estado: "checked" },
        { nombre: "Lobo", puesto: "Soporte Técnico", estado: "checked" },
        { nombre: "Mario", puesto: "Seguridad", estado: "checked" },
        { nombre: "Inovación 4", puesto: "Implementador", estado: "checked" },
        { nombre: "Sergio", puesto: "Implementador", estado: "checked" },
        { nombre: "Inovación 6", puesto: "Implementador", estado: "checked" },
        { nombre: "Sandra", puesto: "Implementador", estado: "checked" },
        { nombre: "Teran", puesto: "Implementador", estado: "checked" }
    ],
    "compras": [
        { nombre: "Nicolás", puesto: "Compras", estado: "" },
        { nombre: "Julieta", puesto: "Compras", estado: "" },
        { nombre: "Karen", puesto: "Compras", estado: "" },
        { nombre: "Oswaldo", puesto: "Compras", estado: "" },
        { nombre: "Sergio", puesto: "Compras", estado: "" },
        { nombre: "Emilse", puesto: "Compras", estado: "" },
        { nombre: "Juan", puesto: "Compras", estado: "" },
        { nombre: "Princesa", puesto: "Compras", estado: "" }
    ],
    "mercadeo": [
        { nombre: "Camila Ruiz", puesto: "Dev", estado: "" },
        { nombre: "Andrés Gómez", puesto: "Reclutamiento", estado: "" },
        { nombre: "Laura Pineda", puesto: "Analista HR", estado: "" },
        { nombre: "Diego Torres", puesto: "Bienestar", estado: "" },
        { nombre: "Sofía Vargas", puesto: "Nómina", estado: "" },
        { nombre: "Mateo Ríos", puesto: "Capacitación", estado: "" },
        { nombre: "Valentina Castro", puesto: "Psicóloga", estado: "" },
        { nombre: "Felipe Mora", puesto: "Asistente", estado: "" }
    ],
    "huawei": [
        { nombre: "Roberto Silva", puesto: "Director", estado: "" },
        { nombre: "Valeria Rojas", puesto: "Ingeniera de Redes", estado: "" },
        { nombre: "Miguel Ángel", puesto: "Soporte TI", estado: "" },
        { nombre: "Diana Ortiz", puesto: "Gerente de Proyectos", estado: "" },
        { nombre: "Sebastián Cruz", puesto: "Desarrollador", estado: "" },
        { nombre: "Lucía Méndez", puesto: "Analista QA", estado: "" },
        { nombre: "Alejandro Vega", puesto: "Especialista Telecom", estado: "" },
        { nombre: "Natalia Herrera", puesto: "Scrum Master", estado: "" }
    ],
    "aidc": [
        { nombre: "Ana García", puesto: "Recepcionista", estado: "" },
        { nombre: "Carlos López", puesto: "Seguridad", estado: "" },
        { nombre: "Martín Fernández", puesto: "Técnico AIDC", estado: "" },
        { nombre: "Elena Morales", puesto: "Especialista RFID", estado: "" },
        { nombre: "Javier Blanco", puesto: "Ingeniero de Datos", estado: "" },
        { nombre: "Paula Navarro", puesto: "Consultora Logística", estado: "" },
        { nombre: "Tomás Aguilar", puesto: "Soporte Hardware", estado: "" },
        { nombre: "Carmen Ruiz", puesto: "Auditora de Sistemas", estado: "" }
    ],
    "motorola": [
        { nombre: "Ana García", puesto: "Recepcionista", estado: "" },
        { nombre: "Carlos López", puesto: "Seguridad", estado: "" },
        { nombre: "Pedro Gómez", puesto: "Ingeniero RF", estado: "" },
        { nombre: "Sofía Castro", puesto: "Ventas Corporativas", estado: "" },
        { nombre: "Luis Martínez", puesto: "Soporte Técnico", estado: "" },
        { nombre: "Camila Torres", puesto: "Gestor de Cuentas", estado: "" },
        { nombre: "Jorge Silva", puesto: "Técnico de Campo", estado: "" },
        { nombre: "María Fernanda", puesto: "Coordinadora Logística", estado: "" }
    ]
};

// Variable global para saber qué área estamos viendo actualmente
let areaActivaGlobal = null;

// ==========================================================================
// 1. INTERRUPTOR INDIVIDUAL (PUESTOS DE TRABAJO)
// ==========================================================================
function controlarLuzIndividual(checkbox) {
    const idLuz = checkbox.getAttribute('data-luz');
    const area = checkbox.getAttribute('data-area'); 
    const estaEncendido = checkbox.checked;
    const iconoFoco = document.getElementById(`foco-${idLuz}`);

    console.log(`Sending to Flask -> Área: ${area} | Luz ID: ${idLuz} | Estado: ${estaEncendido}`);

    fetch(`${BASE_URL}/api/luz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            luz_id: parseInt(idLuz), 
            estado: estaEncendido,
            area: area 
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta de la API");
        console.log(`📡 Sincronización Exitosa -> [${area}] Luz ${idLuz}: ${estaEncendido ? 'ON' : 'OFF'}`);
        
        if (iconoFoco) {
            if (estaEncendido) {
                iconoFoco.className = "icon-green";
                iconoFoco.setAttribute("data-lucide", "lightbulb");
            } else {
                iconoFoco.className = "icon-red";
                iconoFoco.setAttribute("data-lucide", "lightbulb-off");
            }
            lucide.createIcons(); 
        }
    })
    .catch(err => {
        console.error("❌ Fallo crítico comunicando con Flask:", err);
        checkbox.checked = !estaEncendido; 
    });
}

// ==========================================================================
// 2. INTERRUPTOR GRUPAL (PISO ENTIRE / BLOQUES)
// ==========================================================================
function cambiarEstadoPiso(numeroPiso, encender) {
    fetch(`${BASE_URL}/api/luz/piso`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            piso: numeroPiso, 
            estado: encender 
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(`🏢 Sincronización Completa -> Piso ${numeroPiso}`);
        
        const interruptoresVisibles = document.querySelectorAll('.list-item input[type="checkbox"]');
        interruptoresVisibles.forEach(sw => {
            sw.checked = encender;
            const id = sw.getAttribute('data-luz');
            const icono = document.getElementById(`foco-${id}`);
            if (icono) {
                icono.className = encender ? "icon-green" : "icon-red";
                icono.setAttribute("data-lucide", encender ? "lightbulb" : "lightbulb-off");
            }
        });
        lucide.createIcons();
    })
    .catch(err => console.error(`❌ Error en comando masivo del Piso ${numeroPiso}:`, err));
}

window.controlarLuzIndividual = controlarLuzIndividual;
window.cambiarEstadoPiso = cambiarEstadoPiso;

// ==========================================================================
// 3. ENLACE DE EVENTOS Y CONFIGURACIÓN AL CARGAR LA PÁGINA
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // LÓGICA DEL NUEVO BOTÓN PARA APAGAR/ENCENDER ÁREA
    const toggleControlArea = document.getElementById('toggle-control-area');
    if (toggleControlArea) {
        toggleControlArea.addEventListener('change', (e) => {
            if (!areaActivaGlobal) return;
            
            const encender = e.target.checked;
            
            const iconoTarjeta = document.getElementById('icono-control-area');
            iconoTarjeta.className = encender ? "card-icon-green" : "card-icon-red";
            
            const interruptoresArea = document.querySelectorAll(`#people-list input[data-area="${areaActivaGlobal}"]`);
            
            interruptoresArea.forEach(chk => {
                if (chk.checked !== encender) {
                    chk.checked = encender; 
                    controlarLuzIndividual(chk);
                }
            });
        });
    }

    // Configuración del interruptor general (Apagar/Encender todo el piso)
    const toggleGeneral = document.getElementById('toggle-general');
    if (toggleGeneral) {
        toggleGeneral.addEventListener('change', (e) => {
            const encenderTodo = e.target.checked;
            
            if (!encenderTodo) {
                if (!confirm("¿Estás seguro de que deseas APAGAR todas las luces de este piso?")) {
                    e.target.checked = true; 
                    return;
                }
            }
            
            cambiarEstadoPiso(1, encenderTodo);
        });
    }

    // ==========================================================================
    // 4. LÓGICA DE CLICS EN LOS BLOQUES DEL MAPA
    // ==========================================================================
    const bloques = document.querySelectorAll('.block-box');
    const listaPersonas = document.getElementById('people-list');
    const tituloSidebar = document.getElementById('sidebar-title');

    bloques.forEach(bloque => {
        bloque.addEventListener('click', () => {
            const areaSeleccionada = bloque.getAttribute('data-area');
            console.log("-> Clic detectado en área:", areaSeleccionada);

            // Actualizar la tarjeta de control de área
            areaActivaGlobal = areaSeleccionada;
            
            const tarjetaControl = document.getElementById('tarjeta-control-area');
            const tituloControl = document.getElementById('titulo-control-area');
            const subtituloControl = document.getElementById('subtitulo-control-area');
            const toggleControl = document.getElementById('toggle-control-area');
            
            if (tarjetaControl && tituloControl) {
                tarjetaControl.style.opacity = "1";
                tarjetaControl.style.pointerEvents = "auto";
                tituloControl.innerText = `CONTROL: ${areaSeleccionada.toUpperCase()}`;
                subtituloControl.innerText = `Todas las luces de ${areaSeleccionada}`;
                
                toggleControl.checked = true;
                document.getElementById('icono-control-area').className = "card-icon-green";
            }

            const personas = personalPorArea[areaSeleccionada];

            if (personas) {
                tituloSidebar.innerText = `Personal: ${areaSeleccionada.toUpperCase()}`;
                listaPersonas.innerHTML = '';

                personas.forEach((persona, indice) => {
                    const idLuzSimulado = indice + 1; 
                    const iconClass = persona.estado === "checked" ? "icon-green" : "icon-red";
                    const iconType = persona.estado === "checked" ? "lightbulb" : "lightbulb-off";

                    const itemHTML = `
                        <div class="list-item">
                            <div class="item-info">
                                <i data-lucide="${iconType}" class="${iconClass}" id="foco-${idLuzSimulado}"></i>
                                <div>
                                    <h5>${persona.nombre}</h5>
                                    <p>${persona.puesto}</p>
                                </div>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" ${persona.estado} data-luz="${idLuzSimulado}" data-area="${areaSeleccionada}" onchange="controlarLuzIndividual(this)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    `;
                    listaPersonas.insertAdjacentHTML('beforeend', itemHTML);
                });

                if (window.lucide) {
                    lucide.createIcons();
                }
            } else {
                console.warn(`No se encontraron personas registradas para el área: "${areaSeleccionada}"`);
            }
        });
    });

   // ==========================================================================
    // 5. LÓGICA DEL MENÚ LATERAL (SIDEBAR NAVEGACIÓN)
    // ==========================================================================
    const botonesMenu = document.querySelectorAll('.sidebar-nav .nav-item');
    const tituloPrincipal = document.querySelector('.title-bar h2'); 
    const mapaContenedor = document.querySelector('.office-layout'); 

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', function() {
            botonesMenu.forEach(b => b.classList.remove('active', 'sub-active'));
            this.classList.add('active');

            const opcionSeleccionada = this.innerText.trim();
            console.log("Cargando vista para:", opcionSeleccionada);

            // 🌟 AQUÍ ESTÁ LA MAGIA: Actualizamos la variable global dinámicamente
            if (opcionSeleccionada.includes("Piso 1")) {
                pisoActivoGlobal = 1;
            } else if (opcionSeleccionada.includes("Piso 2")) {
                pisoActivoGlobal = 2;
            } else if (opcionSeleccionada.includes("Piso 3")) {
                pisoActivoGlobal = 3;
            }

            // Cambiar el título grande de la página
            if (tituloPrincipal) {
                const textoLimpio = opcionSeleccionada.split('\n').pop().trim();
                tituloPrincipal.innerText = textoLimpio;
            }

            // Ocultar o mostrar el mapa dependiendo del piso
            if (opcionSeleccionada.includes("Piso 3")) {
                if (mapaContenedor) mapaContenedor.style.display = ""; 
            } 
            else if (opcionSeleccionada.includes("Piso 1") || opcionSeleccionada.includes("Piso 2")) {
                if (mapaContenedor) mapaContenedor.style.display = "none";
                
                const listaPersonas = document.getElementById('people-list');
                const tituloSidebar = document.getElementById('sidebar-title');
                if (listaPersonas) listaPersonas.innerHTML = '<p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">Mapa en construcción para este piso.</p>';
                if (tituloSidebar) tituloSidebar.innerText = 'Personal del Área';
            }
            
            // 🌟 FORZAMOS LA ACTUALIZACIÓN: Le pedimos a Flask las luces del nuevo piso que acabas de seleccionar
            cargarEstadoLuces(pisoActivoGlobal);
        });
    });

    // ==========================================================================
    // 6. FUNCIONALIDAD REAL DE LAS PESTAÑAS Y ACTUALIZAR
    // ==========================================================================
    const tabBtns = document.querySelectorAll('.tab-group .tab-btn');
    const workspaceGrid = document.querySelector('.workspace-grid');
    const mapContainer = document.querySelector('.map-container');
    const sidebarContainer = document.querySelector('.blocks-sidebar');

    // Lógica de las pestañas (Tabs)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const textoPestaña = this.innerText.trim();

            if (textoPestaña === 'Vista del piso') {
                workspaceGrid.style.display = 'grid';
                workspaceGrid.style.gridTemplateColumns = '3fr 1fr';
                mapContainer.style.display = 'flex';
                sidebarContainer.style.display = 'flex';

            } else if (textoPestaña === 'Por bloques') {
                workspaceGrid.style.display = 'block'; 
                mapContainer.style.display = 'flex';
                sidebarContainer.style.display = 'none';

            } else if (textoPestaña === 'Por puestos') {
                workspaceGrid.style.display = 'block'; 
                mapContainer.style.display = 'none';
                sidebarContainer.style.display = 'flex';
                
                if (!areaActivaGlobal) {
                    tituloSidebar.innerText = 'Directorio de Puestos';
                    listaPersonas.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                            <i data-lucide="users" style="width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 10px;"></i>
                            <p style="font-size: 14px;">Para ver los puestos aquí, primero vuelve a <b>"Vista del piso"</b> y selecciona un área específica (ej. Mercadeo).</p>
                        </div>
                    `;
                    lucide.createIcons();
                }
            }
        });
    });

    // Lógica del botón Actualizar
    const btnActualizar = document.querySelector('.filter-actions .btn-outline');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', function() {
            const icono = this.querySelector('svg'); 
            
            if (icono) {
                icono.style.transition = "transform 0.5s ease";
                icono.style.transform = "rotate(360deg)";
            }
            
            setTimeout(() => {
                window.location.reload(); 
            }, 500);
        });
    }

});

// ==========================================================================
// 7. LÓGICA DEL MENÚ HAMBURGUESA (A PRUEBA DE FALLOS)
// ==========================================================================
setTimeout(() => {
    const areaLogo = document.querySelector('.logo-area');
    const sidebar = document.querySelector('.sidebar');

    if (areaLogo && sidebar) {
        areaLogo.addEventListener('click', (e) => {
            if (e.target.closest('.icon-btn')) {
                sidebar.classList.toggle('collapsed');
                console.log("Menú hamburguesa presionado");
            }
        });
    }
}, 500);