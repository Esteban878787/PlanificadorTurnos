"use strict";

// =======================================
// URL DEL EXCEL
// =======================================

const URL_EXCEL =
    "https://dkmvtvikkrhasohnmoxn.supabase.co/storage/v1/object/public/Cuadrantes/INTERCAMBIOS%20Y%20VACACIONES.xlsm";


// =======================================
// LEER EXCEL DESDE SUPABASE
// =======================================

async function cargarExcelServidor() {

    const selectorAno =
        document.getElementById("anos");

    if (selectorAno && selectorAno.value) {
        anoSeleccionado = Number(selectorAno.value);
    }

    console.log("=================================");
    console.log("📅 CARGANDO AÑO:", anoSeleccionado);
    console.log("=================================");

    dias = [];
    empleados = [];
    festivos = [];

    try {

        const respuesta = await fetch(
            URL_EXCEL + "?cache=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        console.log(
            "📥 Respuesta Excel:",
            respuesta.status
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo descargar el Excel."
            );
        }

        const arrayBuffer =
            await respuesta.arrayBuffer();

        console.log(
            "📦 Tamaño Excel:",
            arrayBuffer.byteLength
        );

        // IMPORTANTE:
        // raw:false permite que SheetJS genere
        // el valor formateado "w".
        const workbook =
            XLSX.read(
                arrayBuffer,
                {
                    type: "array",
                    cellDates: true,
                    raw: false
                }
            );

        console.log(
            "📚 HOJAS DEL EXCEL:",
            workbook.SheetNames
        );

        procesarWorkbook(workbook);

    } catch (error) {

        console.error(
            "❌ ERROR CARGANDO EXCEL:",
            error
        );

        alert(error.message);
    }
}


// =======================================
// BUSCAR HOJA DEL CUADRANTE
// =======================================
//
// 2026 -> CUADRANTE
// 2027 -> CUADRANTE2027
// 2028 -> CUADRANTE2028
// etc.
//
// Si no existe CUADRANTE2027, intentamos
// también CUADRANTE como respaldo.
// =======================================

function buscarHojaCuadrante(workbook, ano) {

    const hojas =
        workbook.SheetNames || [];

    const anio =
        Number(ano);

    console.log("=================================");
    console.log("🔎 BUSCANDO HOJA PARA:", anio);
    console.log("📚 HOJAS DISPONIBLES:", hojas);
    console.log("=================================");


    // ===================================
    // NORMALIZAR NOMBRE
    // ===================================

    function normalizar(nombre) {

        return String(nombre || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");
    }


    const hojasNormalizadas =
        hojas.map(nombre => ({
            original: nombre,
            normalizada: normalizar(nombre)
        }));


    // ===================================
    // 2026
    // ===================================
    //
    // La hoja de 2026 es CUADRANTE.
    //
if (anio === 2026) {

    const encontrada =
        hojasNormalizadas.find(
            hoja =>
                hoja.normalizada === "CUADRANTE2026"
        );

    if (encontrada) {

        console.log(
            "✅ HOJA 2026 ENCONTRADA:",
            encontrada.original
        );

        return workbook.Sheets[
            encontrada.original
        ];
    }

    console.error(
        "❌ NO EXISTE LA HOJA CUADRANTE2026"
    );

    return null;
}


    // ===================================
    // 2027 Y AÑOS POSTERIORES
    // ===================================

    const nombreBuscado =
        "CUADRANTE" + anio;

    const encontrada =
        hojasNormalizadas.find(
            hoja =>
                hoja.normalizada === nombreBuscado
        );

    if (encontrada) {

        console.log(
            "✅ HOJA ENCONTRADA:",
            encontrada.original
        );

        return workbook.Sheets[
            encontrada.original
        ];
    }


    // ===================================
    // RESPALDO:
    // Si por alguna razón 2027 está
    // también en CUADRANTE
    // ===================================

    if (anio === 2027) {

        const respaldo =
            hojasNormalizadas.find(
                hoja =>
                    hoja.normalizada === "CUADRANTE"
            );

        if (respaldo) {

            console.warn(
                "⚠️ NO EXISTE CUADRANTE2027."
            );

            console.warn(
                "⚠️ SE UTILIZARÁ CUADRANTE COMO RESPALDO."
            );

            return workbook.Sheets[
                respaldo.original
            ];
        }
    }


    console.error(
        "❌ NO SE ENCONTRÓ HOJA PARA:",
        anio
    );

    console.error(
        "❌ SE BUSCÓ:",
        nombreBuscado
    );

    return null;
}


// =======================================
// PROCESAR WORKBOOK
// =======================================

function procesarWorkbook(workbook) {

    const selectorAno =
        document.getElementById("anos");

    const ano =
        selectorAno && selectorAno.value
            ? Number(selectorAno.value)
            : Number(anoSeleccionado);

    anoSeleccionado =
        ano;

    console.log("=================================");
    console.log("📅 AÑO SELECCIONADO:", ano);
    console.log("=================================");


    // ===================================
    // BUSCAR CUADRANTE
    // ===================================

    const hoja =
        buscarHojaCuadrante(
            workbook,
            ano
        );


    if (!hoja) {

        console.error(
            "❌ NO SE ENCONTRÓ EL CUADRANTE"
        );

        alert(
            "No se encontró el cuadrante de " +
            ano +
            ".\n\nHojas disponibles:\n" +
            workbook.SheetNames.join("\n")
        );

        return;
    }


    console.log(
        "================================="
    );

    console.log(
        "✅ CUADRANTE ENCONTRADO"
    );

    console.log(
        "📐 RANGO:",
        hoja["!ref"]
    );

    console.log(
        "================================="
    );


    // ===================================
    // DIAGNÓSTICO REAL
    // ===================================

    diagnosticarCabecera(hoja);


    // ===================================
    // LEER DÍAS
    // ===================================

    leerDias(hoja);

    console.log(
        "📅 DÍAS LEÍDOS:",
        dias.length
    );


    // ===================================
    // LEER EMPLEADOS
    // ===================================

    leerEmpleados(hoja);

    console.log(
        "👥 EMPLEADOS LEÍDOS:",
        empleados.length
    );


    // ===================================
    // LEER FESTIVOS
    // ===================================

    leerFestivos(
        workbook,
        ano
    );

    console.log(
        "🔴 FESTIVOS:",
        festivos
    );


    // ===================================
    // COMPROBAR DÍAS
    // ===================================

    if (
        !Array.isArray(dias) ||
        dias.length === 0
    ) {

        console.error(
            "❌ NO SE HAN PODIDO LEER LOS DÍAS DE",
            ano
        );

        alert(
            "El cuadrante de " +
            ano +
            " existe, pero no se han podido leer las fechas."
        );

        return;
    }


    // ===================================
    // COMPROBAR EMPLEADOS
    // ===================================

    if (
        !Array.isArray(empleados) ||
        empleados.length === 0
    ) {

        console.error(
            "❌ NO SE HAN PODIDO LEER LOS EMPLEADOS DE",
            ano
        );

        alert(
            "El cuadrante de " +
            ano +
            " existe, pero no se han podido leer los empleados."
        );

        return;
    }


    // ===================================
    // ACTUALIZAR MESES
    // ===================================

    actualizarSelectorMeses();


    // ===================================
    // MOSTRAR DATOS
    // ===================================

    console.log(
        "📅 DIAS:",
        dias
    );

    console.log(
        "👥 EMPLEADOS:",
        empleados
    );

    console.log(
        "🔴 FESTIVOS:",
        festivos
    );


    // ===================================
    // PINTAR
    // ===================================

    renderTabla();


    if (
        typeof cargarDiasConsulta ===
        "function"
    ) {

        cargarDiasConsulta();
    }


    if (
        typeof cargarRangoDias ===
        "function"
    ) {

        cargarRangoDias();
    }


    if (
        typeof seleccionarDiaActualODisponible ===
        "function"
    ) {

        seleccionarDiaActualODisponible();
    }
}


// =======================================
// DIAGNÓSTICO DE LA FILA 6
// =======================================
//
// Esto NO modifica nada.
// Solo nos enseña exactamente qué
// contiene H6, I6, J6...
//
// =======================================

function diagnosticarCabecera(hoja) {

    console.log("=================================");
    console.log("🔴 DIAGNÓSTICO REAL DEL CUADRANTE");
    console.log("🔴 AÑO:", anoSeleccionado);
    console.log("🔴 REF:", hoja["!ref"]);
    console.log("=================================");


    for (let c = 0; c < 40; c++) {

        const dir =
            XLSX.utils.encode_cell({
                r: 5,
                c: c
            });

        const celda =
            hoja[dir];

        console.log(
            dir,
            celda
                ? {
                    v: celda.v,
                    w: celda.w,
                    t: celda.t,
                    z: celda.z
                }
                : "CELDA VACÍA"
        );
    }

    console.log("=================================");
}


// =======================================
// LEER DÍAS DEL CUADRANTE
// =======================================
//
// FILA 6 DE EXCEL = índice 5
// COLUMNA H = índice 7
//
// NO vamos a suponer que las fechas
// empiezan exactamente en H si existen
// columnas anteriores vacías.
//
// Buscamos todas las fechas de la fila 6.
// =======================================

function leerDias(hoja) {

    dias = [];


    if (!hoja) {

        console.error(
            "❌ leerDias: hoja inexistente"
        );

        return;
    }


    if (!hoja["!ref"]) {

        console.error(
            "❌ leerDias: la hoja no tiene !ref"
        );

        return;
    }


    const rango =
        XLSX.utils.decode_range(
            hoja["!ref"]
        );


    const filaCabecera = 5;

    const columnaInicial = 7;


    console.log("=================================");
    console.log("📅 LEYENDO DÍAS DEL CUADRANTE");
    console.log(
        "📅 AÑO SELECCIONADO:",
        anoSeleccionado
    );
    console.log(
        "📐 RANGO:",
        hoja["!ref"]
    );
    console.log(
        "📍 EMPEZAMOS EN H6"
    );
    console.log("=================================");


    for (
        let col = columnaInicial;
        col <= rango.e.c;
        col++
    ) {

        const direccion =
            XLSX.utils.encode_cell({
                r: filaCabecera,
                c: col
            });


        const celda =
            hoja[direccion];


        if (!celda) {
            continue;
        }


        console.log(
            "🔎",
            direccion,
            "v=",
            celda.v,
            "w=",
            celda.w,
            "t=",
            celda.t,
            "z=",
            celda.z
        );


        const fecha =
            convertirFechaExcel(
                celda
            );


        if (!fecha) {

            console.warn(
                "⚠️ No se pudo convertir:",
                direccion,
                celda
            );

            continue;
        }


        console.log(
            "📅 FECHA DETECTADA:",
            direccion,
            "→",
            fecha.toLocaleDateString("es-ES")
        );


        // ===================================
        // SOLO EL AÑO SELECCIONADO
        // ===================================

        if (
            fecha.getFullYear() !==
            Number(anoSeleccionado)
        ) {

            console.log(
                "⏭️ FECHA FUERA DEL AÑO:",
                direccion,
                fecha.getFullYear()
            );

            continue;
        }


        dias.push({

            dia:
                fecha.getDate(),

            mes:
                fecha.getMonth() + 1,

            anio:
                fecha.getFullYear(),

            fecha:
                fecha,

            col:
                col
        });


        console.log(
            "✅ DÍA LEÍDO:",
            direccion,
            "→",
            fecha.getDate(),
            "/",
            fecha.getMonth() + 1,
            "/",
            fecha.getFullYear()
        );
    }


    // ===================================
    // ORDENAR
    // ===================================

    dias.sort(
        (a, b) =>
            a.col - b.col
    );


    console.log("=================================");
    console.log(
        "📅 TOTAL DÍAS LEÍDOS:",
        dias.length
    );


    if (dias.length > 0) {

        console.log(
            "📅 PRIMER DÍA:",
            dias[0].dia +
            "/" +
            dias[0].mes +
            "/" +
            dias[0].anio
        );

        console.log(
            "📅 ÚLTIMO DÍA:",
            dias[dias.length - 1].dia +
            "/" +
            dias[dias.length - 1].mes +
            "/" +
            dias[dias.length - 1].anio
        );

        console.log(
            "📍 COLUMNA PRIMER DÍA:",
            dias[0].col,
            XLSX.utils.encode_col(
                dias[0].col
            )
        );

        console.log(
            "📍 COLUMNA ÚLTIMO DÍA:",
            dias[dias.length - 1].col,
            XLSX.utils.encode_col(
                dias[dias.length - 1].col
            )
        );
    }


    console.log("=================================");

    console.table(dias);
}


// =======================================
// CONVERTIR FECHA DE EXCEL
// =======================================

function convertirFechaExcel(celda) {

    if (!celda) {
        return null;
    }


    // ===================================
    // 1. LA CELDA YA ES DATE
    // ===================================

    if (
        celda.v instanceof Date
    ) {

        const fecha =
            new Date(
                celda.v.getFullYear(),
                celda.v.getMonth(),
                celda.v.getDate()
            );

        if (
            !isNaN(
                fecha.getTime()
            )
        ) {

            return fecha;
        }
    }


    // ===================================
    // 2. NÚMERO SERIAL DE EXCEL
    // ===================================

    if (
        typeof celda.v === "number"
    ) {

        const partes =
            XLSX.SSF.parse_date_code(
                celda.v
            );


        if (partes) {

            const fecha =
                new Date(
                    partes.y,
                    partes.m - 1,
                    partes.d
                );


            if (
                !isNaN(
                    fecha.getTime()
                )
            ) {

                return fecha;
            }
        }
    }


    // ===================================
    // 3. TEXTO
    // ===================================

    let texto =
        celda.w ??
        celda.v ??
        "";


    texto =
        String(texto)
            .trim();


    if (!texto) {
        return null;
    }


    // ===================================
    // QUITAR HORA
    // ===================================

    texto =
        texto
            .replace(
                /T\d{1,2}:\d{2}(?::\d{2})?.*$/i,
                ""
            )
            .replace(
                /\s+\d{1,2}:\d{2}(?::\d{2})?.*$/i,
                ""
            )
            .trim();


    // ===================================
    // 4. DD/MM/YYYY
    // DD-MM-YYYY
    // DD.MM.YYYY
    // ===================================

    let partes =
        texto.match(
            /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/
        );


    if (partes) {

        const dia =
            Number(partes[1]);

        const mes =
            Number(partes[2]);

        const ano =
            Number(partes[3]);


        const fecha =
            new Date(
                ano,
                mes - 1,
                dia
            );


        if (
            fecha.getFullYear() === ano &&
            fecha.getMonth() === mes - 1 &&
            fecha.getDate() === dia
        ) {

            return fecha;
        }
    }


    // ===================================
    // 5. YYYY-MM-DD
    // YYYY/MM/DD
    // YYYY.MM.DD
    // ===================================

    partes =
        texto.match(
            /^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/
        );


    if (partes) {

        const ano =
            Number(partes[1]);

        const mes =
            Number(partes[2]);

        const dia =
            Number(partes[3]);


        const fecha =
            new Date(
                ano,
                mes - 1,
                dia
            );


        if (
            fecha.getFullYear() === ano &&
            fecha.getMonth() === mes - 1 &&
            fecha.getDate() === dia
        ) {

            return fecha;
        }
    }


    // ===================================
    // 6. TEXTO CON FORMATO ESPAÑOL
    // ===================================
    //
    // Por ejemplo:
    // "1 enero 2027"
    // "01 enero 2027"
    //

    const meses =
        {
            enero: 0,
            febrero: 1,
            marzo: 2,
            abril: 3,
            mayo: 4,
            junio: 5,
            julio: 6,
            agosto: 7,
            septiembre: 8,
            octubre: 9,
            noviembre: 10,
            diciembre: 11
        };


    partes =
        texto
            .toLowerCase()
            .match(
                /^(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{4})$/
            );


    if (partes) {

        const dia =
            Number(partes[1]);

        const nombreMes =
            partes[2];

        const ano =
            Number(partes[3]);

        const mes =
            meses[nombreMes];


        if (
            mes !== undefined
        ) {

            const fecha =
                new Date(
                    ano,
                    mes,
                    dia
                );


            if (
                fecha.getFullYear() === ano &&
                fecha.getMonth() === mes &&
                fecha.getDate() === dia
            ) {

                return fecha;
            }
        }
    }


    // ===================================
    // 7. ÚLTIMO INTENTO
    // ===================================

    const fechaISO =
        new Date(texto);


    if (
        !isNaN(
            fechaISO.getTime()
        ) &&
        fechaISO.getFullYear() >= 1900
    ) {

        return new Date(
            fechaISO.getFullYear(),
            fechaISO.getMonth(),
            fechaISO.getDate()
        );
    }


    console.warn(
        "⚠️ FECHA NO RECONOCIDA:",
        texto,
        celda
    );


    return null;
}


// =======================================
// LEER FESTIVOS
// =======================================
//
// 2026 -> columna B
// 2027 -> columna C
// 2028 -> columna D
// 2029 -> columna E
// etc.
//
// La hoja siempre es FESTIVOS.
// =======================================

function leerFestivos(
    workbook,
    ano
) {

    festivos = [];

    const anio = Number(ano);

    console.log("=================================");
    console.log("🔴 LEYENDO FESTIVOS");
    console.log("🔴 AÑO:", anio);
    console.log("=================================");

    // ===================================
    // BUSCAR HOJA FESTIVOS
    // ===================================

    const nombreHoja =
        (workbook.SheetNames || [])
            .find(
                nombre =>
                    String(nombre)
                        .trim()
                        .toUpperCase() === "FESTIVOS"
            );

    if (!nombreHoja) {

        console.warn(
            '⚠️ No existe la hoja "FESTIVOS"'
        );

        return;
    }

    const hoja =
        workbook.Sheets[nombreHoja];

    if (!hoja) {

        console.warn(
            "⚠️ La hoja FESTIVOS no existe."
        );

        return;
    }

    // ===================================
    // CALCULAR COLUMNA SEGÚN EL AÑO
    // ===================================
    //
    // 2026 = B = índice 1
    // 2027 = C = índice 2
    // 2028 = D = índice 3
    // etc.
    // ===================================

    const columnaFestivos =
        anio - 2025;

    const letraColumna =
        XLSX.utils.encode_col(
            columnaFestivos
        );

    console.log(
        "📍 COLUMNA DE FESTIVOS:",
        letraColumna
    );

    console.log(
        "📍 AÑO",
        anio,
        "→",
        letraColumna
    );

    // ===================================
    // RECORRER TODA LA COLUMNA
    // ===================================
    //
    // NO usamos hoja["!ref"] para decidir
    // hasta dónde leer.
    //
    // Leemos desde la fila 1 hasta la
    // última fila posible de la hoja.
    //
    // Las celdas vacías simplemente se
    // ignoran.
    // ===================================

    const MAX_FILAS = 1000;

    for (
        let fila = 0;
        fila < MAX_FILAS;
        fila++
    ) {

        const direccion =
            XLSX.utils.encode_cell({
                r: fila,
                c: columnaFestivos
            });

        const celda =
            hoja[direccion];

        // =================================
        // CELDA VACÍA
        // =================================

        if (!celda) {
            continue;
        }

        console.log(
            "🔎 FESTIVO:",
            direccion,
            "v=",
            celda.v,
            "w=",
            celda.w,
            "t=",
            celda.t,
            "z=",
            celda.z
        );

        // =================================
        // CONVERTIR FECHA
        // =================================

        const fecha =
            convertirFechaExcel(
                celda
            );

        if (!fecha) {

            console.log(
                "⏭️ No es una fecha:",
                direccion
            );

            continue;
        }

        // =================================
        // COMPROBAR AÑO
        // =================================

        if (
            fecha.getFullYear() !== anio
        ) {

            console.log(
                "⏭️ FESTIVO DE OTRO AÑO:",
                direccion,
                fecha
            );

            continue;
        }

        // =================================
        // GUARDAR FESTIVO
        // =================================

        festivos.push({

            dia:
                fecha.getDate(),

            mes:
                fecha.getMonth() + 1,

            anio:
                fecha.getFullYear(),

            fecha:
                fecha
        });

        console.log(
            "✅ FESTIVO LEÍDO:",
            direccion,
            "→",
            fecha.getDate() +
            "/" +
            (fecha.getMonth() + 1) +
            "/" +
            fecha.getFullYear()
        );
    }

    // ===================================
    // QUITAR DUPLICADOS
    // ===================================

    festivos =
        festivos.filter(
            (
                festivo,
                indice,
                array
            ) =>
                indice ===
                array.findIndex(
                    otro =>
                        otro.dia ===
                            festivo.dia &&
                        otro.mes ===
                            festivo.mes &&
                        otro.anio ===
                            festivo.anio
                )
        );

    // ===================================
    // ORDENAR POR FECHA
    // ===================================

    festivos.sort(
        (a, b) =>
            a.fecha - b.fecha
    );

    // ===================================
    // RESULTADO
    // ===================================

    console.log("=================================");

    console.log(
        "🔴 FESTIVOS " + anio + ":",
        festivos
    );

    console.log(
        "🔴 TOTAL FESTIVOS:",
        festivos.length
    );

    console.log(
        "📍 COLUMNA UTILIZADA:",
        letraColumna
    );

    console.log("=================================");

    console.table(
        festivos
    );
}

// =======================================
// OBTENER MESES DISPONIBLES
// =======================================

function obtenerMesesDisponibles() {

    return [
        ...new Set(
            dias.map(
                d =>
                    Number(d.mes)
            )
        )
    ].sort(
        (a, b) =>
            a - b
    );
}


// =======================================
// ACTUALIZAR SELECTOR DE MESES
// =======================================

function actualizarSelectorMeses() {

    const select =
        document.getElementById(
            "meses"
        );


    if (!select) {
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


    const mesesDisponibles =
        obtenerMesesDisponibles();


    select.innerHTML = "";


    mesesDisponibles.forEach(
        mes => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(mes);


            option.textContent =
                mesesTexto[
                    mes - 1
                ];


            select.appendChild(
                option
            );
        }
    );


    if (
        mesesDisponibles.length === 0
    ) {

        return;
    }


    // ===================================
    // MANTENER MES
    // ===================================

    if (
        mesesDisponibles.includes(
            Number(mesSeleccionado)
        )
    ) {

        select.value =
            String(
                mesSeleccionado
            );

    } else {

        select.value =
            String(
                mesesDisponibles[0]
            );

        mesSeleccionado =
            mesesDisponibles[0];
    }


    // ===================================
    // CAMBIO DE MES
    // ===================================

    select.onchange =
        function () {

            mesSeleccionado =
                Number(
                    this.value
                );


            renderTabla();


            if (
                typeof cargarDiasConsulta ===
                "function"
            ) {

                cargarDiasConsulta();
            }


            if (
                typeof cargarRangoDias ===
                "function"
            ) {

                cargarRangoDias();
            }


            const resultado =
                document.getElementById(
                    "resultadoDia"
                );


            if (resultado) {

                resultado.innerHTML =
                    "";
            }
        };
}


// =======================================
// LEER EMPLEADOS
// =======================================

function leerEmpleados(hoja) {

    empleados = [];


    if (!hoja) {
        return;
    }


    // FILA 7 DE EXCEL
    let fila = 6;


    while (true) {

        const celdaNombre =
            hoja[
                "A" +
                (fila + 1)
            ];


        const nombre =
            celdaNombre?.v;


        if (
            nombre === undefined ||
            nombre === null ||
            String(nombre).trim() === ""
        ) {

            break;
        }


        const empleado = {

            nombre:
                String(
                    nombre
                ).trim(),

            turnos: []
        };


        dias.forEach(
            dia => {

                const direccion =
                    XLSX.utils.encode_cell({

                        r:
                            fila,

                        c:
                            dia.col
                    });


                let valor =
                    hoja[
                        direccion
                    ]?.v ??
                    "";


                valor =
                    String(
                        valor
                    ).trim();


                if (
                    valor === "PENDIENTE" ||
                    valor === "HECHO" ||
                    valor === "NO ES POSIBLE" ||
                    valor === "COMPLETED"
                ) {

                    valor = "";
                }


                empleado.turnos.push(
                    valor
                );
            }
        );


        empleados.push(
            empleado
        );


        fila++;
    }


    console.log(
        "👥 TOTAL EMPLEADOS:",
        empleados.length
    );


    if (
        empleados.length > 0
    ) {

        console.log(
            "👤 PRIMER EMPLEADO:",
            empleados[0]
        );
    }


    console.table(
        empleados
    );
}


// =======================================
// CARGA INICIAL
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const selectorAno =
            document.getElementById(
                "anos"
            );


        if (
            selectorAno &&
            selectorAno.value
        ) {

            anoSeleccionado =
                Number(
                    selectorAno.value
                );
        }


        cargarExcelServidor();
    }
);


// =======================================
// BOTÓN ACTUALIZAR
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnActualizar =
            document.getElementById(
                "btnActualizar"
            );


        if (!btnActualizar) {
            return;
        }


        btnActualizar.addEventListener(
            "click",
            async () => {

                btnActualizar.disabled =
                    true;


                btnActualizar.textContent =
                    "⏳ Actualizando...";


                try {

                    await cargarExcelServidor();


                    alert(
                        "✅ Turnos actualizados correctamente"
                    );

                } catch (error) {

                    console.error(
                        error
                    );


                    alert(
                        "❌ Error al actualizar los turnos."
                    );

                } finally {

                    btnActualizar.disabled =
                        false;


                    btnActualizar.textContent =
                        "🔄 Actualizar turnos";
                }
            }
        );
    }
);
