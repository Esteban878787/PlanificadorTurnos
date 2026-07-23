"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const btnPDF = document.getElementById("btnPDF");
    const btnPDFMes = document.getElementById("btnPDFMes");

    if (btnPDF) {
        btnPDF.addEventListener("click", exportarPDFPersonal);
    }

    if (btnPDFMes) {
        btnPDFMes.addEventListener("click", exportarPDFCuadrante);
    }

});

//=====================================
// PDF PERSONAL DEL DÍA
//=====================================

async function exportarPDFPersonal() {

    const resultado = document.getElementById("resultadoDia");

    if (!resultado || resultado.innerHTML.trim() === "") {

        alert("Primero consulta un día.");

        return;

    }

    const canvas = await html2canvas(resultado, {
        scale: 2
    });

    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const ancho = 190;
    const alto = canvas.height * ancho / canvas.width;

    pdf.setFontSize(18);
    pdf.text("Personal del día", 15, 15);

    pdf.addImage(img, "PNG", 10, 25, ancho, alto);

    pdf.save("Personal_del_dia.pdf");

}

//=====================================
// PDF CUADRANTE MENSUAL
//=====================================

async function exportarPDFCuadrante() {

    const tabla = document.querySelector(".tabla table");

    if (!tabla) {

        alert("No hay cuadrante cargado.");

        return;

    }

    // Guardamos el estado actual
    const contenedor = document.querySelector(".tabla");

    const altoOriginal = contenedor.style.maxHeight;
    const overflowOriginal = contenedor.style.overflow;

    // Mostramos toda la tabla
    contenedor.style.maxHeight = "none";
    contenedor.style.overflow = "visible";

    // Esperamos un instante para que el navegador la pinte
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(tabla, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true
    });

    // Restauramos el scroll
    contenedor.style.maxHeight = altoOriginal;
    contenedor.style.overflow = overflowOriginal;

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const margen = 8;

    const anchoPagina = pdf.internal.pageSize.getWidth() - margen * 2;
    const altoPagina = pdf.internal.pageSize.getHeight() - margen * 2;

    const escala = Math.min(
        anchoPagina / canvas.width,
        altoPagina / canvas.height
    );

    const anchoImagen = canvas.width * escala;
    const altoImagen = canvas.height * escala;

const selectMes = document.getElementById("meses");

const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const nombreMes = nombresMeses[parseInt(selectMes.value) - 1];

pdf.setFontSize(16);
pdf.text(`Cuadrante - ${nombreMes}`, margen, 10);

    pdf.addImage(
        imgData,
        "PNG",
        margen,
        15,
        anchoImagen,
        altoImagen
    );

    pdf.save("Cuadrante_Mensual.pdf");

}