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

    const tarjetasSwitch = document.querySelectorAll('.switch-card');
    
    if (tarjetasSwitch.length >= 2) {
        tarjetasSwitch[0].style.cursor = 'pointer';
        tarjetasSwitch[0].addEventListener('click', () => {
            if (confirm("¿Estás seguro de que deseas apagar todas las luces de este piso?")) {
                cambiarEstadoPiso(1, false);
                const chkGeneral = tarjetasSwitch[1].querySelector('input[type="checkbox"]');
                if (chkGeneral) chkGeneral.checked = false;
            }
        });

        const checkboxGeneral = tarjetasSwitch[1].querySelector('input[type="checkbox"]');
        if (checkboxGeneral) {
            checkboxGeneral.addEventListener('change', (e) => {
                cambiarEstadoPiso(1, e.target.checked);
            });
        }
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
    // 5. LÓGICA DEL MENÚ LATERAL (SIDEBAR)
    // ==========================================================================
    const botonesMenu = document.querySelectorAll('.sidebar-nav .nav-item');
    const tituloPrincipal = document.querySelector('.title-bar h2'); 
    const mapaContenedor = document.querySelector('.office-layout'); 

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', function() {
            // 1. Le quitamos la clase 'active' y 'sub-active' a todos los botones
            botonesMenu.forEach(b => b.classList.remove('active', 'sub-active'));

            // 2. Le ponemos la clase 'active' (azul) al botón presionado
            this.classList.add('active');

            // 3. Leemos qué botón se presionó
            const opcionSeleccionada = this.innerText.trim();
            console.log("Cargando vista para:", opcionSeleccionada);

            // 4. Cambiamos el título de la página para que coincida con el menú
            if (tituloPrincipal) {
                const textoLimpio = opcionSeleccionada.split('\n').pop().trim();
                tituloPrincipal.innerText = textoLimpio;
            }

            // 5. Lógica para ocultar/mostrar los mapas dependiendo del piso
            if (opcionSeleccionada.includes("Piso 3")) {
                // Si es el Piso 3, mostramos el mapa
                if (mapaContenedor) mapaContenedor.style.display = ""; 
            } 
            else if (opcionSeleccionada.includes("Piso 1") || opcionSeleccionada.includes("Piso 2")) {
                // Si es el Piso 1 o 2, ocultamos el mapa
                if (mapaContenedor) mapaContenedor.style.display = "none";
                
                // Limpiamos la lista de personal del panel derecho
                const listaPersonas = document.getElementById('people-list');
                const tituloSidebar = document.getElementById('sidebar-title');
                if (listaPersonas) listaPersonas.innerHTML = '<p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">Mapa en construcción para este piso.</p>';
                if (tituloSidebar) tituloSidebar.innerText = 'Personal del Área';
            }
        });
    });
}); // <-- Esta es la llave final que cierra TODO el evento al cargar la página