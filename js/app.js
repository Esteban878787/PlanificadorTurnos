"use strict";


// ========================================
// SELECTOR DINÁMICO DE AÑOS
// ========================================

function cargarSelectorAnios() {

    const selectorAnos =
        document.getElementById("anos");

    if (!selectorAnos) return;

    const anoActual = 2026;

    const anoInicial = anoActual - 10;
    const anoFinal = anoActual + 10;

    selectorAnos.innerHTML = "";

    for (
        let ano = anoInicial;
        ano <= anoFinal;
        ano++
    ) {

        const option =
            document.createElement("option");

        option.value = String(ano);
// ========================================
// NOMBRE DEL CUADRANTE
// ========================================

option.textContent =
    `CUADRANTE${ano}`;

if (ano === 2026) {
    option.selected = true;
}

        if (ano === 2026) {
            option.selected = true;
        }

        selectorAnos.appendChild(option);
    }
}




// =======================================
// DATOS GLOBALES
// =======================================

let empleados = [];
let dias = [];
let festivos = [];

let mesSeleccionado =
    new Date().getMonth() + 1;

let anoSeleccionado =
    new Date().getFullYear();

let filtroEmpleado = [];


// =======================================
// INICIO
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const selectorMes =
            document.getElementById("meses");

            // ===================================
// CARGAR SELECTOR DE AÑOS
// ===================================

cargarSelectorAnios();

        const selectorAno =
            document.getElementById("anos");

        const buscar =
            document.getElementById("buscar");

        const diaConsulta =
            document.getElementById("diaConsulta");

        const diaDesde =
            document.getElementById("diaDesde");

        const diaHasta =
            document.getElementById("diaHasta");

        const btnConsultar =
            document.getElementById("btnConsultar");

        const btnCerrarConsulta =
            document.getElementById(
                "btnCerrarConsulta"
            );

        const btnActualizar =
            document.getElementById(
                "btnActualizar"
            );

        const resultadoDia =
            document.getElementById(
                "resultadoDia"
            );


        // ===================================
        // ESTABLECER MES
        // ===================================

        if (selectorMes) {

            selectorMes.value =
                String(mesSeleccionado);

        }


        // ===================================
        // ESTABLECER AÑO
        // ===================================

       if (selectorAno) {

    selectorAno.addEventListener(
        "change",
        async () => {

            anoSeleccionado =
                Number(selectorAno.value);

            console.log(
                "📅 Año seleccionado:",
                anoSeleccionado
            );

            console.log(
                "📂 Cuadrante seleccionado:",
                anoSeleccionado === 2026
                    ? "CUADRANTE"
                    : `CUADRANTE${anoSeleccionado}`
            );

            empleados = [];
            dias = [];
            festivos = [];

            if (resultadoDia) {
                resultadoDia.innerHTML = "";
            }

            try {

                await cargarExcelServidor();

            } catch (error) {

                console.error(
                    "❌ Error al cargar el cuadrante:",
                    error
                );

            }

        }
    );

}


        // ===================================
        // CAMBIAR AÑO
        // ===================================

        if (selectorAno) {

            selectorAno.addEventListener(
                "change",
                async () => {

                    anoSeleccionado =
                        Number(
                            selectorAno.value
                        );

                    console.log(
                        "📅 Año cambiado a:",
                        anoSeleccionado
                    );

                    // Limpiar datos actuales
                    empleados = [];
                    dias = [];
                    festivos = [];

                    if (resultadoDia) {

                        resultadoDia.innerHTML =
                            "";

                    }

                    try {

                        await cargarExcelServidor();

                    } catch (error) {

                        console.error(
                            "❌ Error al cargar el año:",
                            error
                        );

                    }

                }
            );

        }


        // ===================================
        // CERRAR CONSULTA
        // ===================================

        if (btnCerrarConsulta) {

            btnCerrarConsulta.style.display =
                "none";

            btnCerrarConsulta.addEventListener(
                "click",
                () => {

                    if (resultadoDia) {

                        resultadoDia.innerHTML =
                            "";

                    }

                    btnCerrarConsulta.style.display =
                        "none";

                }
            );

        }


        // ===================================
        // BOTÓN CONSULTAR
        // ===================================

        if (btnConsultar) {

            btnConsultar.addEventListener(
                "click",
                () => {

                    consultarPersonal();

                    if (btnCerrarConsulta) {

                        btnCerrarConsulta.style.display =
                            "inline-block";

                    }

                }
            );

        }


        // ===================================
        // CAMBIAR DÍA
        // ===================================

        if (diaConsulta) {

            diaConsulta.addEventListener(
                "change",
                () => {

                    consultarPersonal();

                }
            );

        }


        // ===================================
        // CAMBIAR MES
        // ===================================

        if (selectorMes) {

            selectorMes.addEventListener(
                "change",
                () => {

                    mesSeleccionado =
                        Number(
                            selectorMes.value
                        );

                    cargarDiasConsulta();

                    cargarRangoDias();

                    renderTabla();

                    if (resultadoDia) {

                        resultadoDia.innerHTML =
                            "";

                    }

                    if (btnCerrarConsulta) {

                        btnCerrarConsulta.style.display =
                            "none";

                    }

                }
            );

        }


        // ===================================
        // BUSCAR EMPLEADO
        // ===================================

        if (buscar) {

            buscar.addEventListener(
                "input",
                () => {

                    filtroEmpleado =
                        buscar.value
                            .toUpperCase()
                            .split(",")
                            .map(
                                nombre =>
                                    nombre.trim()
                            )
                            .filter(
                                nombre =>
                                    nombre.length > 0
                            );

                    renderTabla();

                }
            );

        }


        // ===================================
        // CAMBIAR DESDE
        // ===================================

        if (diaDesde) {

            diaDesde.addEventListener(
                "change",
                () => {

                    const desde =
                        Number(
                            diaDesde.value
                        );

                    const hasta =
                        Number(
                            diaHasta?.value
                        );

                    if (
                        diaHasta &&
                        desde > hasta
                    ) {

                        diaHasta.value =
                            String(desde);

                    }

                    renderTabla();

                }
            );

        }


        // ===================================
        // CAMBIAR HASTA
        // ===================================

        if (diaHasta) {

            diaHasta.addEventListener(
                "change",
                () => {

                    const desde =
                        Number(
                            diaDesde?.value
                        );

                    const hasta =
                        Number(
                            diaHasta.value
                        );

                    if (
                        diaDesde &&
                        hasta < desde
                    ) {

                        diaDesde.value =
                            String(hasta);

                    }

                    renderTabla();

                }
            );

        }


        // ===================================
        // BOTÓN ACTUALIZAR
        // ===================================

        if (btnActualizar) {

            btnActualizar.addEventListener(
                "click",
                () => {

                    actualizarCuadrante();

                }
            );

        }

    }
);


// =======================================
// CONSULTAR PERSONAL
// =======================================

function consultarPersonal() {

    const selectorDia =
        document.getElementById(
            "diaConsulta"
        );

    const resultadoDia =
        document.getElementById(
            "resultadoDia"
        );


    if (!resultadoDia) {
        return;
    }


    if (
        !Array.isArray(empleados) ||
        empleados.length === 0
    ) {

        resultadoDia.innerHTML = `
            <p>No hay empleados cargados.</p>
        `;

        return;

    }


    const diaSeleccionado =
        Number(
            selectorDia?.value
        );


    if (!diaSeleccionado) {

        resultadoDia.innerHTML = `
            <p>
                No hay ningún día seleccionado.
            </p>
        `;

        return;

    }


    // ===================================
    // FILTROS M / T / N
    // ===================================

    const filtroManana =
        document.getElementById(
            "filtroManana"
        )?.checked ?? true;

    const filtroTarde =
        document.getElementById(
            "filtroTarde"
        )?.checked ?? true;

    const filtroNoche =
        document.getElementById(
            "filtroNoche"
        )?.checked ?? true;


    const manana = [];
    const tarde = [];
    const noche = [];


    // ===================================
    // BUSCAR ÍNDICE DEL DÍA
    // ===================================

    const indiceDia =
        dias.findIndex(
            d =>
                d.dia === diaSeleccionado &&
                d.mes === mesSeleccionado
        );


    if (indiceDia === -1) {

        resultadoDia.innerHTML = `
            <p>
                No hay datos para ese día.
            </p>
        `;

        return;

    }


    // ===================================
    // RECORRER EMPLEADOS
    // ===================================

    empleados.forEach(
        emp => {

            const nombre =
                String(
                    emp.nombre ?? ""
                ).trim();


            // =================================
            // FILTRO NOMBRE
            // =================================

            if (
                filtroEmpleado.length > 0 &&
                !filtroEmpleado.some(
                    nombreBuscado =>
                        nombre
                            .toUpperCase()
                            .includes(
                                nombreBuscado
                            )
                )
            ) {

                return;

            }


            // =================================
            // TURNO
            // =================================

            const turno =
                String(
                    emp.turnos?.[indiceDia] ?? ""
                )
                    .trim()
                    .toUpperCase();


            // =================================
            // CLASIFICAR
            // =================================

            if (
                turno === "M" &&
                filtroManana
            ) {

                manana.push(nombre);

            }


            if (
                turno === "T" &&
                filtroTarde
            ) {

                tarde.push(nombre);

            }


            if (
                turno === "N" &&
                filtroNoche
            ) {

                noche.push(nombre);

            }

        }
    );


    // ===================================
    // GENERAR TARJETAS
    // ===================================

    let html = `
        <div class="turnos-container">
    `;


    if (filtroManana) {

        html += crearTarjetaTurno(
            "manana",
            "☀️",
            "Mañana",
            manana
        );

    }


    if (filtroTarde) {

        html += crearTarjetaTurno(
            "tarde",
            "🌆",
            "Tarde",
            tarde
        );

    }


    if (filtroNoche) {

        html += crearTarjetaTurno(
            "noche",
            "🌙",
            "Noche",
            noche
        );

    }


    html += `
        </div>
    `;


    resultadoDia.innerHTML =
        html;

}


// =======================================
// CREAR TARJETA
// =======================================

function crearTarjetaTurno(
    clase,
    icono,
    nombreTurno,
    empleadosTurno
) {

    return `

        <div class="tarjeta-turno ${clase}">

            <h3>
                ${icono}
                ${nombreTurno}
                (${empleadosTurno.length})
            </h3>

            <div class="lista-empleados">

                ${
                    empleadosTurno.length > 0

                    ? empleadosTurno
                        .map(
                            nombre => `
                                <span
                                    class="empleado-chip">
                                    ${escapeHTML(nombre)}
                                </span>
                            `
                        )
                        .join("")

                    : `
                        <span class="sin-personal">
                            Sin personal
                        </span>
                    `
                }

            </div>

        </div>

    `;

}


// =======================================
// ESCAPE HTML
// =======================================

function escapeHTML(texto) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =======================================
// CARGAR DÍAS DEL MES
// =======================================

function cargarDiasConsulta() {

    const selectorDia =
        document.getElementById(
            "diaConsulta"
        );

    const selectorDesde =
        document.getElementById(
            "diaDesde"
        );

    const selectorHasta =
        document.getElementById(
            "diaHasta"
        );


    const diasMes =
        dias.filter(
            dia =>
                dia.mes === mesSeleccionado
        );


    // ===================================
    // LIMPIAR
    // ===================================

    if (selectorDia) {

        selectorDia.innerHTML =
            "";

    }

    if (selectorDesde) {

        selectorDesde.innerHTML =
            "";

    }

    if (selectorHasta) {

        selectorHasta.innerHTML =
            "";

    }


    // ===================================
    // RELLENAR
    // ===================================

    diasMes.forEach(
        dia => {

            if (selectorDia) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    dia.dia;

                option.textContent =
                    dia.dia;

                selectorDia.appendChild(
                    option
                );

            }


            if (selectorDesde) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    dia.dia;

                option.textContent =
                    dia.dia;

                selectorDesde.appendChild(
                    option
                );

            }


            if (selectorHasta) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    dia.dia;

                option.textContent =
                    dia.dia;

                selectorHasta.appendChild(
                    option
                );

            }

        }
    );


    seleccionarDiaActualODisponible();


    // ===================================
    // RANGO COMPLETO
    // ===================================

    if (diasMes.length > 0) {

        if (selectorDesde) {

            selectorDesde.value =
                String(
                    diasMes[0].dia
                );

        }

        if (selectorHasta) {

            selectorHasta.value =
                String(
                    diasMes[
                        diasMes.length - 1
                    ].dia
                );

        }

    }

}


// =======================================
// SELECCIONAR DÍA ACTUAL
// =======================================

function seleccionarDiaActualODisponible() {

    const selectorDia =
        document.getElementById(
            "diaConsulta"
        );


    if (
        !selectorDia ||
        selectorDia.options.length === 0
    ) {

        return;

    }


    const hoy =
        new Date();

    const diaHoy =
        hoy.getDate();

    const mesHoy =
        hoy.getMonth() + 1;

    const anoHoy =
        hoy.getFullYear();


    // Solo usar el día actual
    // si estamos viendo el año actual

    if (
        anoSeleccionado === anoHoy &&
        mesSeleccionado === mesHoy
    ) {

        const existeHoy =
            [...selectorDia.options]
                .some(
                    option =>
                        Number(
                            option.value
                        ) === diaHoy
                );


        if (existeHoy) {

            selectorDia.value =
                String(diaHoy);

            return;

        }

    }


    selectorDia.selectedIndex = 0;

}


// =======================================
// CARGAR RANGO
// =======================================

function cargarRangoDias() {

    const desde =
        document.getElementById(
            "diaDesde"
        );

    const hasta =
        document.getElementById(
            "diaHasta"
        );


    if (!desde || !hasta) {
        return;
    }


    const diasMes =
        dias.filter(
            d =>
                d.mes === mesSeleccionado
        );


    if (diasMes.length === 0) {

        desde.innerHTML =
            "";

        hasta.innerHTML =
            "";

        return;

    }


    const primerDia =
        diasMes[0].dia;

    const ultimoDia =
        diasMes[
            diasMes.length - 1
        ].dia;


    desde.value =
        String(primerDia);

    hasta.value =
        String(ultimoDia);

}


// =======================================
// ACTUALIZAR CUADRANTE
// =======================================

function actualizarCuadrante() {

    const resultado =
        document.getElementById(
            "resultadoDia"
        );


    if (resultado) {

        resultado.innerHTML =
            "";

    }


    cargarDiasConsulta();

    cargarRangoDias();

    renderTabla();

}
