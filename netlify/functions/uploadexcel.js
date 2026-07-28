exports.handler = async (event) => {

    try {

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SECRET = process.env.SUPABASE_SECRET;

        const nombreArchivo = "INTERCAMBIOS Y VACACIONES.xlsm";

        const respuesta = await fetch(
            `${SUPABASE_URL}/storage/v1/object/Cuadrantes/${encodeURIComponent(nombreArchivo)}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SECRET}`,
                    apikey: SUPABASE_SECRET,
                    "Content-Type": "application/vnd.ms-excel.sheet.macroEnabled.12",
                    "x-upsert": "true"
                },
                body: Buffer.from(event.body, "base64")
            }
        );

        if (!respuesta.ok) {
            return {
                statusCode: respuesta.status,
                body: await respuesta.text()
            };
        }

        return {
            statusCode: 200,
            body: "Excel actualizado correctamente"
        };

    } catch (error) {

        return {
            statusCode: 500,
            body: error.message
        };

    }

};