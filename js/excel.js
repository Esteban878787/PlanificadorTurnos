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


    const hoja = workbook.Sheets["CUADRANTE"];


    if (!hoja) {

        alert("No existe la hoja CUADRANTE");

        return;

    }



    leerDias(hoja);


    leerEmpleados(hoja);



    actualizarSelectorMeses();



    console.log("DIAS:", dias);

    console.log("EMPLEADOS:", empleados);



renderTabla();

cargarDiasConsulta();

cargarRangoDias();

seleccionarDiaActualODisponible();


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
