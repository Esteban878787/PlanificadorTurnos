"use strict";

const URL_EXCEL = "https://dkmvtvikkrhasohnmoxn.supabase.co/storage/v1/object/public/Cuadrantes/INTERCAMBIOS%20Y%20VACACIONES.xlsm";


// =======================================
// LEER EXCEL DESDE SUPABASE
// =======================================

async function cargarExcelServidor() {


    // Limpiar datos antiguos antes de cargar el Excel nuevo

    dias = [];

    empleados = [];


    try {

        const respuesta = await fetch(
    URL_EXCEL + "?cache=" + new Date().getTime(),
    {
            cache: "no-store"
        });


        console.log("Descargando Excel...");
        console.log("Respuesta:", respuesta.status);


        if (!respuesta.ok) {

            throw new Error("No se pudo descargar el Excel.");

        }


        const arrayBuffer = await respuesta.arrayBuffer();


        console.log(
            "Excel descargado:",
            arrayBuffer.byteLength
        );



        const workbook = XLSX.read(arrayBuffer, {

            type: "array",
            cellDates: true,
            raw: false

        });



        console.log(
            "Workbook cargado:",
            workbook.SheetNames
        );



        procesarWorkbook(workbook);



    } catch(error) {

        console.error(error);

        alert(error.message);

    }

}




// =======================================
// PROCESAR WORKBOOK
// =======================================

function procesarWorkbook(workbook) {

    const hoja =
        workbook.Sheets["CUADRANTE"];


    if (!hoja) {

        alert("No existe la hoja CUADRANTE");

        return;

    }


    leerDias(hoja);

    leerEmpleados(hoja);

    // =======================================
    // LEER FESTIVOS
    // =======================================
leerFestivos(workbook);

console.log("=================================");
console.log("🔴 FESTIVOS ANTES DE RENDERIZAR:");
console.table(festivos);
console.log("=================================");

actualizarSelectorMeses();


    console.log("DIAS:", dias);

    console.log("EMPLEADOS:", empleados);

    console.log("FESTIVOS:", festivos);


    renderTabla();

    cargarDiasConsulta();

    cargarRangoDias();

    seleccionarDiaActualODisponible();

}

// =======================================
// LEER FESTIVOS
// HOJA "Festivos"
// COLUMNA B
// SOLO AÑO 2026
// =======================================

function leerFestivos(workbook) {

    festivos = [];

    const hoja =
    workbook.Sheets["FESTIVOS"];

    if (!hoja) {
        console.error('❌ NO EXISTE LA HOJA "Festivos"');
        return;
    }

    console.log("=================================");
    console.log("🔴 LEYENDO COLUMNA B DE FESTIVOS");
    console.log("=================================");

    const rango = XLSX.utils.decode_range(hoja["!ref"]);

    // B = columna 1
    const columnaB = 1;

    for (
        let fila = rango.s.r;
        fila <= rango.e.r;
        fila++
    ) {

        const direccion = XLSX.utils.encode_cell({
            r: fila,
            c: columnaB
        });

        const celda = hoja[direccion];

        if (!celda) {
            continue;
        }

        console.log(
            "CELDA",
            direccion,
            "v=",
            celda.v,
            "w=",
            celda.w,
            "t=",
            celda.t
        );

        let fecha = null;

        // ===================================
        // 1. FECHA REAL
        // ===================================

        if (celda.v instanceof Date) {

            fecha = new Date(
                celda.v.getFullYear(),
                celda.v.getMonth(),
                celda.v.getDate()
            );

        }

        // ===================================
        // 2. NÚMERO DE EXCEL
        // ===================================

        else if (typeof celda.v === "number") {

            const f =
                XLSX.SSF.parse_date_code(celda.v);

            if (f) {

                fecha = new Date(
                    f.y,
                    f.m - 1,
                    f.d
                );

            }

        }

        // ===================================
        // 3. TEXTO
        // ===================================

        else {

            // Primero usamos el valor mostrado por Excel
            const texto =
                String(
                    celda.w ??
                    celda.v ??
                    ""
                ).trim();

            // DD/MM/YYYY
            let partes =
                texto.match(
                    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
                );

            if (partes) {

                const dia =
                    Number(partes[1]);

                const mes =
                    Number(partes[2]);

                const anio =
                    Number(partes[3]);

                fecha = new Date(
                    anio,
                    mes - 1,
                    dia
                );

            }

            // YYYY-MM-DD
            if (!fecha) {

                partes =
                    texto.match(
                        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
                    );

                if (partes) {

                    const anio =
                        Number(partes[1]);

                    const mes =
                        Number(partes[2]);

                    const dia =
                        Number(partes[3]);

                    fecha = new Date(
                        anio,
                        mes - 1,
                        dia
                    );

                }

            }

        }

        // ===================================
        // VALIDAR
        // ===================================

        if (
            !fecha ||
            isNaN(fecha.getTime())
        ) {
            continue;
        }

        // ===================================
        // SOLO 2026
        // ===================================

        if (
            fecha.getFullYear() !== 2026
        ) {
            continue;
        }

        // ===================================
        // GUARDAR
        // ===================================

        festivos.push({

            dia: fecha.getDate(),

            mes: fecha.getMonth() + 1,

            anio: fecha.getFullYear(),

            fecha: fecha

        });

    }

    // ===================================
    // QUITAR DUPLICADOS
    // ===================================

    festivos = festivos.filter(
        (festivo, indice, array) =>
            indice === array.findIndex(
                otro =>
                    otro.dia === festivo.dia &&
                    otro.mes === festivo.mes &&
                    otro.anio === festivo.anio
            )
    );

    console.log(
        "🔴🔴🔴 FESTIVOS 2026:",
        festivos
    );

    console.table(festivos);
}



// =======================================
// OBTENER MESES DISPONIBLES
// =======================================

function obtenerMesesDisponibles() {


    return [...new Set(dias.map(d => d.mes))]
        .sort((a, b) => a - b);


}




// =======================================
// ACTUALIZAR SELECTOR DE MESES
// =======================================

function actualizarSelectorMeses() {


    const select = document.getElementById("meses");


    if (!select) {

        console.log("No existe el selector de meses");

        return;

    }



    const mesesTexto = [

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

    ];



    select.innerHTML = "";



    obtenerMesesDisponibles().forEach(mes => {



        const option = document.createElement("option");



        option.value = mes;


        option.textContent = mesesTexto[mes - 1];



        select.appendChild(option);



    });



    const mesActual = new Date().getMonth() + 1;



if (obtenerMesesDisponibles().includes(mesActual)) {

    select.value = mesActual;
    mesSeleccionado = mesActual;

} else if (select.options.length > 0) {

    select.value = select.options[0].value;
    mesSeleccionado = Number(select.value);

}


select.onchange = function() {

    mesSeleccionado = Number(this.value);

    renderTabla();

    if (typeof cargarDiasConsulta === "function") {
        cargarDiasConsulta();
    }

    const resultado = document.getElementById("resultadoDia");

    if (resultado) {
        resultado.innerHTML = "";
    }

};



    console.log(

        "MESES EN SELECT:",

        [...select.options].map(o => o.value)

    );


}


// =======================================
// LEER DÍAS
// =======================================

function leerDias(sheet) {


    dias = [];


    const filaCabecera = 5; // fila 6 Excel


    const rango = XLSX.utils.decode_range(sheet["!ref"]);



    for (let col = 7; col <= rango.e.c; col++) {



        const celda = sheet[
            XLSX.utils.encode_cell({
                r: filaCabecera,
                c: col
            })
        ];



        if (!celda) {
            continue;
        }



        let fecha = null;



        // Fecha real Excel

        if (celda.v instanceof Date) {

            fecha = celda.v;

        }



        // Fecha numérica Excel

        else if (typeof celda.v === "number") {


            const f = XLSX.SSF.parse_date_code(celda.v);


            if (f) {

                fecha = new Date(
                    f.y,
                    f.m - 1,
                    f.d
                );

            }

        }



        if (
            fecha &&
            !isNaN(fecha.getTime())
        ) {


            dias.push({

                dia: fecha.getDate(),

                mes: fecha.getMonth() + 1,

                fecha: fecha,

                col: col

            });


        }


    }



    console.log(
        "TOTAL DIAS LEIDOS:",
        dias.length
    );


    console.log(
        "MESES CARGADOS:",
        [...new Set(dias.map(d => d.mes))]
    );


    console.table(dias);


}





// =======================================
// LEER EMPLEADOS
// =======================================

function leerEmpleados(hoja) {


    empleados = [];


    let fila = 6;



    while(true) {


        const nombre = hoja[
            "A" + (fila + 1)
        ]?.v;



        if (!nombre) break;



        const empleado = {


            nombre: String(nombre).trim(),


            turnos: []


        };



       for (
    let i = 0;
    i < dias.length;
    i++
) {


    const c = dias[i].col;



            const direccion =
                XLSX.utils.encode_cell({

                    r: fila,

                    c: c

                });



            let valor =
                hoja[direccion]?.v ?? "";



            // limpiar valores accidentales

            if (

                valor === "PENDIENTE" ||

                valor === "HECHO" ||

                valor === "NO ES POSIBLE" ||

                valor === "COMPLETED"

            ) {

                valor = "";

            }



            empleado.turnos.push(valor);



        }



        empleados.push(empleado);

if (empleados.length === 1) {
    
    console.log(
    "PRIMER EMPLEADO:",
    empleado.nombre,
    empleado.turnos
);

}

        fila++;


    }



    console.table(empleados);


}






// =======================================
// CARGA INICIAL
// =======================================

document.addEventListener(
"DOMContentLoaded",
()=>{


    cargarExcelServidor();


});






// =======================================
// BOTÓN ACTUALIZAR
// =======================================

document.addEventListener(
"DOMContentLoaded",
()=>{


    const btnActualizar =
        document.getElementById("btnActualizar");



    if(!btnActualizar) return;



    btnActualizar.addEventListener(
    "click",
    async()=>{


        btnActualizar.disabled = true;


        btnActualizar.textContent =
            "⏳ Actualizando...";



        try {


            await cargarExcelServidor();



            alert(
                "✅ Turnos actualizados correctamente"
            );



        } catch(error) {


            console.error(error);



            alert(
                "Error al actualizar los turnos."
            );



        } finally {


            btnActualizar.disabled = false;



            btnActualizar.textContent =
                "🔄 Actualizar turnos";


        }



    });


});
