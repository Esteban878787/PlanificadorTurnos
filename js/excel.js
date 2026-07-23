"use strict";

const URL_EXCEL = "https://dkmvtvikkrhasohnmoxn.supabase.co/storage/v1/object/public/Cuadrantes/INTERCAMBIOS%20Y%20VACACIONES.xlsm";







// =======================================
// LEER EXCEL DESDE SUPABASE
// =======================================

async function cargarExcelServidor() {

    try {

        const respuesta = await fetch(URL_EXCEL + "?v=" + Date.now(), {
            cache: "no-store"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo descargar el Excel.");
        }

        const arrayBuffer = await respuesta.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, {
            type: "array",
            cellDates: true
        });

        procesarWorkbook(workbook);

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}

// =======================================
// PROCESAR EXCEL
// =======================================

function procesarWorkbook(workbook) {

    const hoja = workbook.Sheets["CUADRANTE"];

    if (!hoja) {

        alert("No existe la hoja CUADRANTE");

        return;

    }

    leerDias(hoja);

    leerEmpleados(hoja);

    renderTabla();

    if (typeof cargarDiasConsulta === "function") {
        cargarDiasConsulta();
    }

}

// =======================================
// LEER DÍAS
// =======================================

function leerDias(hoja) {

    dias = [];

    let columna = 7;

    while (true) {

        const direccion = XLSX.utils.encode_cell({
            r: 5,
            c: columna
        });

        const celda = hoja[direccion];

        if (!celda) break;

        let fecha;

        if (celda.v instanceof Date) {

            fecha = celda.v;

        } else {

            const f = XLSX.SSF.parse_date_code(celda.v);

            fecha = new Date(f.y, f.m - 1, f.d);

        }

        dias.push({

            dia: fecha.getDate(),
            mes: fecha.getMonth() + 1,
            anio: fecha.getFullYear()

        });

        columna++;

    }

}

// =======================================
// LEER EMPLEADOS
// =======================================

function leerEmpleados(hoja) {

    empleados = [];

    let fila = 6;

    while (true) {

        const nombre = hoja["A" + (fila + 1)]?.v;

        if (!nombre) break;

        const empleado = {

            nombre,
            turnos: []

        };

        for (let c = 7; c < 7 + dias.length; c++) {

            const direccion = XLSX.utils.encode_cell({
                r: fila,
                c
            });

            empleado.turnos.push(
                hoja[direccion]?.v ?? ""
            );

        }

        empleados.push(empleado);

        fila++;

    }

    console.table(empleados);

}

// =======================================
// CARGA INICIAL
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    cargarExcelServidor();

});

// =======================================
// BOTÓN ACTUALIZAR TURNOS
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    const btnActualizar = document.getElementById("btnActualizar");

    if (!btnActualizar) return;

    btnActualizar.addEventListener("click", async () => {

        btnActualizar.disabled = true;
        btnActualizar.textContent = "⏳ Actualizando...";

        try {

            await cargarExcelServidor();

            alert("✅ Turnos actualizados correctamente");

        } catch (error) {

            console.error(error);
            alert("Error al actualizar los turnos.");

        } finally {

            btnActualizar.disabled = false;
            btnActualizar.textContent = "🔄 Actualizar turnos";

        }

    });

});