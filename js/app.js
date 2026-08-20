"use strict";

let empleados = [];
let dias = [];

// =======================================
// MES Y FILTRO ACTUAL
// =======================================

let mesSeleccionado = new Date().getMonth() + 1;

let filtroEmpleado = [];


// =======================================
// INICIO
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    const selector =
        document.getElementById("meses");

    const buscar =
        document.getElementById("buscar");

    const diaConsulta =
        document.getElementById("diaConsulta");

    const btnConsultar =
        document.getElementById("btnConsultar");

    const diaDesde =
        document.getElementById("diaDesde");

    const diaHasta =
        document.getElementById("diaHasta");

    const btnCerrarConsulta =
        document.getElementById("btnCerrarConsulta");

    const resultadoDia =
        document.getElementById("resultadoDia");


    // ===================================
    // CERRAR CONSULTA
    // ===================================

    if (btnCerrarConsulta) {

        btnCerrarConsulta.addEventListener("click", () => {

            if (resultadoDia) {
                resultadoDia.innerHTML = "";
            }

            btnCerrarConsulta.style.display = "none";

        });

    }


    // ===================================
    // CAMBIAR DESDE
    // ===================================

    if (diaDesde) {

        diaDesde.addEventListener("change", () => {

            const desde =
                Number(diaDesde.value);

            const hasta =
                Number(diaHasta?.value);


            // Si Desde supera Hasta,
            // movemos Hasta al mismo día.

            if (
                diaHasta &&
                desde > hasta
            ) {

                diaHasta.value = desde;

            }


            renderTabla();

        });

    }


    // ===================================
    // CAMBIAR HASTA
    // ===================================

    if (diaHasta) {

        diaHasta.addEventListener("change", () => {

            const desde =
                Number(diaDesde?.value);

            const hasta =
                Number(diaHasta.value);


            // Si Hasta es menor que Desde,
            // movemos Desde al mismo día.

            if (
                diaDesde &&
                hasta < desde
            ) {

                diaDesde.value = hasta;

            }


            renderTabla();

        });

    }


    // ===================================
    // CAMBIAR DÍA DE CONSULTA
    // ===================================

    if (diaConsulta) {

        diaConsulta.addEventListener("change", () => {

            consultarPersonal();

        });

    }


    // ===================================
    // CAMBIAR MES
    // ===================================

    if (selector) {

        selector.addEventListener("change", function () {

            mesSeleccionado =
                Number(this.value);


            // Cargar nuevamente los días
            // del nuevo mes.

            cargarDiasConsulta();


            // Después de cargar los días,
            // dejamos el rango correctamente
            // establecido.

            cargarRangoDias();


            // Pintar tabla.

            renderTabla();


            // Limpiar consulta diaria.

            if (resultadoDia) {
                resultadoDia.innerHTML = "";
            }

        });

    }


    // ===================================
    // BUSCAR EMPLEADO
    // ===================================

    if (buscar) {

        buscar.addEventListener("input", function () {

            filtroEmpleado =
                this.value
                    .toUpperCase()
                    .split(",")
                    .map(nombre =>
                        nombre.trim()
                    )
                    .filter(nombre =>
                        nombre !== ""
                    );


            renderTabla();

        });

    }


    // ===================================
    // CONSULTAR PERSONAL
    // ===================================

    if (btnConsultar) {

        btnConsultar.addEventListener("click", () => {

            consultarPersonal();


            if (btnCerrarConsulta) {
                btnCerrarConsulta.style.display =
                    "inline-block";
            }

        });

    }

});


// =======================================
// CONSULTAR PERSONAL
// =======================================

function consultarPersonal() {

    const diaConsulta =
        document.getElementById("diaConsulta");

    const resultadoDia =
        document.getElementById("resultadoDia");


    const diaSeleccionado =
        Number(diaConsulta?.value);


    // ===================================
    // FILTROS DE TURNO
    // ===================================

    const filtroManana =
        document.getElementById("filtroManana")?.checked ?? true;

    const filtroTarde =
        document.getElementById("filtroTarde")?.checked ?? true;

    const filtroNoche =
        document.getElementById("filtroNoche")?.checked ?? true;


    let manana = [];
    let tarde = [];
    let noche = [];


    // ===================================
    // BUSCAR DÍA
    // ===================================

    const indiceDia =
        dias.findIndex(d =>
            d.dia === diaSeleccionado &&
            d.mes === mesSeleccionado
        );


    if (indiceDia === -1) {

        if (resultadoDia) {

            resultadoDia.innerHTML =
                "<p>No hay datos para ese día.</p>";

        }

        return;

    }


    // ===================================
    // RECORRER EMPLEADOS
    // ===================================

    empleados.forEach(emp => {


        // ---------------------------------
        // FILTRO POR NOMBRE
        // ---------------------------------

        if (
            filtroEmpleado.length > 0 &&
            !filtroEmpleado.some(nombre =>
                emp.nombre
                    .toUpperCase()
                    .includes(nombre)
            )
        ) {

            return;

        }


        // ---------------------------------
        // OBTENER TURNO
        // ---------------------------------

        const turno =
            String(
                emp.turnos[indiceDia] ?? ""
            )
                .trim()
                .toUpperCase();


        // ---------------------------------
        // CLASIFICAR TURNO
        // ---------------------------------

        switch (turno) {

            case "M":

                if (filtroManana) {
                    manana.push(emp.nombre);
                }

                break;


            case "T":

                if (filtroTarde) {
                    tarde.push(emp.nombre);
                }

                break;


            case "N":

                if (filtroNoche) {
                    noche.push(emp.nombre);
                }

                break;

        }

    });


    // ===================================
    // MOSTRAR RESULTADO
    // ===================================

    if (!resultadoDia) {
        return;
    }


    resultadoDia.innerHTML = `

        <div class="turnos-container">


            ${
                filtroManana
                ? `

                <div class="tarjeta-turno manana">

                    <h3>
                        ☀️ Mañana (${manana.length})
                    </h3>

                    <div class="lista-empleados">

                        ${
                            manana.length

                            ? manana.map(nombre =>
                                `<span class="empleado-chip">
                                    ${nombre}
                                </span>`
                            ).join("")

                            : `
                                <span class="sin-personal">
                                    Sin personal
                                </span>
                            `
                        }

                    </div>

                </div>

                `
                : ""
            }


            ${
                filtroTarde
                ? `

                <div class="tarjeta-turno tarde">

                    <h3>
                        🌆 Tarde (${tarde.length})
                    </h3>

                    <div class="lista-empleados">

                        ${
                            tarde.length

                            ? tarde.map(nombre =>
                                `<span class="empleado-chip">
                                    ${nombre}
                                </span>`
                            ).join("")

                            : `
                                <span class="sin-personal">
                                    Sin personal
                                </span>
                            `
                        }

                    </div>

                </div>

                `
                : ""
            }


            ${
                filtroNoche
                ? `

                <div class="tarjeta-turno noche">

                    <h3>
                        🌙 Noche (${noche.length})
                    </h3>

                    <div class="lista-empleados">

                        ${
                            noche.length

                            ? noche.map(nombre =>
                                `<span class="empleado-chip">
                                    ${nombre}
                                </span>`
                            ).join("")

                            : `
                                <span class="sin-personal">
                                    Sin personal
                                </span>
                            `
                        }

                    </div>

                </div>

                `
                : ""
            }


        </div>

    `;

}


// =======================================
// CARGAR DÍAS DEL MES
// =======================================

function cargarDiasConsulta() {

    const selectorDia =
        document.getElementById("diaConsulta");

    const selectorDesde =
        document.getElementById("diaDesde");

    const selectorHasta =
        document.getElementById("diaHasta");


    // =======================================
    // GUARDAR RANGO ACTUAL
    // =======================================

    const rangoAnteriorDesde =
        selectorDesde
            ? Number(selectorDesde.value)
            : null;

    const rangoAnteriorHasta =
        selectorHasta
            ? Number(selectorHasta.value)
            : null;


    // =======================================
    // LIMPIAR SELECTORES
    // =======================================

    if (selectorDia) {
        selectorDia.innerHTML = "";
    }

    if (selectorDesde) {
        selectorDesde.innerHTML = "";
    }

    if (selectorHasta) {
        selectorHasta.innerHTML = "";
    }


    // =======================================
    // DÍAS DEL MES
    // =======================================

    const diasMes =
        dias.filter(dia =>
            dia.mes === mesSeleccionado
        );


    // =======================================
    // RELLENAR SELECTORES
    // =======================================

    diasMes.forEach(dia => {


        // -----------------------------------
        // DÍA PARA CONSULTAR PERSONAL
        // -----------------------------------

        if (selectorDia) {

            const option =
                document.createElement("option");

            option.value =
                dia.dia;

            option.textContent =
                dia.dia;

            selectorDia.appendChild(option);

        }


        // -----------------------------------
        // DESDE
        // -----------------------------------

        if (selectorDesde) {

            const optionDesde =
                document.createElement("option");

            optionDesde.value =
                dia.dia;

            optionDesde.textContent =
                dia.dia;

            selectorDesde.appendChild(
                optionDesde
            );

        }


        // -----------------------------------
        // HASTA
        // -----------------------------------

        if (selectorHasta) {

            const optionHasta =
                document.createElement("option");

            optionHasta.value =
                dia.dia;

            optionHasta.textContent =
                dia.dia;

            selectorHasta.appendChild(
                optionHasta
            );

        }

    });


    // =======================================
    // SELECCIONAR DÍA DE CONSULTA
    // =======================================

    seleccionarDiaActualODisponible();


    // =======================================
    // RESTAURAR RANGO
    // =======================================

    if (diasMes.length > 0) {

        let nuevoDesde =
            rangoAnteriorDesde;

        let nuevoHasta =
            rangoAnteriorHasta;


        // Si no había rango anterior,
        // utilizar el mes completo.

        if (!nuevoDesde) {
            nuevoDesde =
                diasMes[0].dia;
        }


        if (!nuevoHasta) {
            nuevoHasta =
                diasMes[diasMes.length - 1].dia;
        }


        // Asegurarnos de que los días
        // existen en el nuevo mes.

        const existeDesde =
            diasMes.some(d =>
                d.dia === nuevoDesde
            );

        const existeHasta =
            diasMes.some(d =>
                d.dia === nuevoHasta
            );


        if (!existeDesde) {
            nuevoDesde =
                diasMes[0].dia;
        }


        if (!existeHasta) {
            nuevoHasta =
                diasMes[diasMes.length - 1].dia;
        }


        // Si por cualquier motivo
        // el rango queda invertido.

        if (nuevoDesde > nuevoHasta) {

            nuevoHasta =
                nuevoDesde;

        }


        if (selectorDesde) {
            selectorDesde.value =
                nuevoDesde;
        }


        if (selectorHasta) {
            selectorHasta.value =
                nuevoHasta;
        }

    }

}


// =======================================
// SELECCIONAR DÍA ACTUAL
// =======================================

function seleccionarDiaActualODisponible() {

    const selectorDia =
        document.getElementById("diaConsulta");


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


    // ===================================
    // SI ESTAMOS EN EL MES ACTUAL
    // ===================================

    if (mesSeleccionado === mesHoy) {

        const existeHoy =
            [...selectorDia.options]
                .some(option =>
                    Number(option.value) === diaHoy
                );


        if (existeHoy) {

            selectorDia.value =
                diaHoy;

            return;

        }

    }


    // ===================================
    // SI NO EXISTE HOY
    // SELECCIONAR PRIMER DÍA
    // ===================================

    selectorDia.selectedIndex = 0;

}


// =======================================
// ACTUALIZAR CUADRANTE
// =======================================

function actualizarCuadrante() {

    renderTabla();

    cargarDiasConsulta();

    seleccionarDiaActualODisponible();


    const resultado =
        document.getElementById("resultadoDia");


    if (resultado) {
        resultado.innerHTML = "";
    }

}


// =======================================
// FILTROS DE TURNO EN LA TABLA
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const filtros = [
            "filtroManana",
            "filtroTarde",
            "filtroNoche"
        ];


        filtros.forEach(id => {

            const checkbox =
                document.getElementById(id);


            if (!checkbox) return;


            checkbox.addEventListener(
                "change",
                () => {

                    renderTabla();

                }
            );

        });

    }
);


// =======================================
// CARGAR RANGO DE DÍAS
// =======================================

function cargarRangoDias() {

    const desde =
        document.getElementById("diaDesde");

    const hasta =
        document.getElementById("diaHasta");


    if (!desde || !hasta) {
        return;
    }


    const diasMes =
        dias.filter(
            d =>
                d.mes === mesSeleccionado
        );


    if (diasMes.length === 0) {
        return;
    }


    // =======================================
    // SOLO ESTABLECER VALORES SI NO EXISTEN
    // =======================================

    const valorDesde =
        Number(desde.value);

    const valorHasta =
        Number(hasta.value);


    if (!valorDesde) {

        desde.value =
            diasMes[0].dia;

    }


    if (!valorHasta) {

        hasta.value =
            diasMes[diasMes.length - 1].dia;

    }


    // =======================================
    // EVITAR RANGO INVERTIDO
    // =======================================

    if (
        Number(desde.value) >
        Number(hasta.value)
    ) {

        hasta.value =
            desde.value;

    }

}
