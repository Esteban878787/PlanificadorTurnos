"use strict";

const botonSubirExcel = document.getElementById("btnSubirExcel");
const excelUpload = document.getElementById("excelUpload");


botonSubirExcel.addEventListener("click", () => {
    excelUpload.click();
});

excelUpload.addEventListener("change", async () => {

    const archivo = excelUpload.files[0];

    if (!archivo) return;

    document.getElementById("estado").textContent = "📤 Subiendo Excel...";

    const nombreArchivo = "INTERCAMBIOS Y VACACIONES.xlsm";

    

    const { data, error } = await window.supabaseClient
        .storage
        .from("Cuadrantes")
        .upload(nombreArchivo, archivo, {
            cacheControl: "3600",
            upsert: true
        });



    if (error) {
    console.error(error);

    document.getElementById("estado").textContent =
        "❌ Error: " + error.message;

    return;
}

    document.getElementById("estado").textContent =
    "✅ Excel actualizado correctamente";

});