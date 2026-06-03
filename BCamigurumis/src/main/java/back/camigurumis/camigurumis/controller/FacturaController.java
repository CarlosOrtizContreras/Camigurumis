package back.camigurumis.camigurumis.controller;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;

import back.camigurumis.camigurumis.models.dao.EnvioDao;
import back.camigurumis.camigurumis.models.dao.FacturaDao;
import back.camigurumis.camigurumis.models.entities.Envio;
import back.camigurumis.camigurumis.models.entities.Factura;

@Controller
@RequestMapping("/factura")
public class FacturaController {

    @Autowired
    private FacturaDao facturaDao;

    @Autowired
    private EnvioDao envioDao;

    // GET /factura/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Factura>> listarFacturas() {
        List<Factura> lista = facturaDao.listarFacturas();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /factura/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Factura> buscarFactura(@RequestParam String id) {
        Factura factura = facturaDao.buscarFactura(id);
        if (factura == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(factura);
    }

    /**
     * POST /factura/guardar
     * FIX: buscarEnvio ahora retorna null correctamente si no existe,
     * evitando el NullPointerException en EnvioDao.obtenerDatosEnvio().
     */
    @PostMapping("/guardar")
    public ResponseEntity<Factura> guardarFactura(@RequestBody Factura factura) {
        if (factura.getIdFactura() == null || factura.getIdFactura().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        factura.setFechaCompra(LocalDate.now());

        // Crear envío asociado si no existe (buscarEnvio ya retorna null correctamente)
        if (factura.getIdEnvio() != null && !factura.getIdEnvio().isBlank()) {
            Envio envioExistente = envioDao.buscarEnvio(factura.getIdEnvio());
            if (envioExistente == null) {
                Envio nuevoEnvio = new Envio();
                nuevoEnvio.setIdEnvio(factura.getIdEnvio());
                nuevoEnvio.setDireccion("");          // se actualiza luego con la dirección
                nuevoEnvio.setCostoEnvio(factura.getPrecioEnvio());
                nuevoEnvio.setEstadoEnvio(new java.util.ArrayList<>());
                envioDao.ingresarEnvio(nuevoEnvio);
            }
        }

        facturaDao.ingresarFactura(factura);
        return ResponseEntity.ok(factura);
    }

    /**
     * GET /factura/pdf?id=xxx
     * Genera y devuelve la factura como PDF descargable / apto para nueva pestaña.
     */
    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generarPdf(@RequestParam String id) {

        Factura factura = facturaDao.buscarFactura(id);
        if (factura == null) {
            return ResponseEntity.notFound().build();
        }

        // Obtener datos del envío para la dirección
        Envio envio = null;
        if (factura.getIdEnvio() != null && !factura.getIdEnvio().isBlank()) {
            envio = envioDao.buscarEnvio(factura.getIdEnvio());
        }
        final String direccionEnvio = (envio != null && envio.getDireccion() != null && !envio.getDireccion().isBlank())
                ? envio.getDireccion()
                : "Por confirmar";

        try {
            byte[] pdfBytes = construirPdf(factura, direccionEnvio);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // inline → abre en el navegador; attachment → fuerza descarga
            headers.setContentDispositionFormData("inline", "factura-" + factura.getIdFactura() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Construcción del PDF con iText 7
    // ─────────────────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private byte[] construirPdf(Factura factura, String direccionEnvio) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);
        doc.setMargins(36, 50, 36, 50);

        // Colores de marca
        DeviceRgb plum      = new DeviceRgb(74, 28, 64);
        DeviceRgb rose      = new DeviceRgb(212, 120, 138);
        DeviceRgb creamDark = new DeviceRgb(245, 233, 213);
        DeviceRgb mutedGray = new DeviceRgb(100, 100, 100);

        // ── ENCABEZADO ────────────────────────────────────────────────────────
        Paragraph empresa = new Paragraph("🧶 Camigurumis")
                .setFontSize(26)
                .setBold()
                .setFontColor(plum)
                .setTextAlignment(TextAlignment.CENTER);
        doc.add(empresa);

        Paragraph slogan = new Paragraph("Amigurumis únicos hechos con amor")
                .setFontSize(10)
                .setFontColor(rose)
                .setTextAlignment(TextAlignment.CENTER);
        doc.add(slogan);

        doc.add(new Paragraph("www.camigurumis.com  ·  contacto@camigurumis.com")
                .setFontSize(9)
                .setFontColor(mutedGray)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new LineSeparator(new SolidLine(1f)).setMarginTop(8).setMarginBottom(8));

        // ── TÍTULO FACTURA ────────────────────────────────────────────────────
        doc.add(new Paragraph("FACTURA DE VENTA")
                .setFontSize(18)
                .setBold()
                .setFontColor(plum)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4));

        // ── META-DATOS: Nº factura y fecha ────────────────────────────────────
        Table metaTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(12);

        metaTable.addCell(styledCell("N° Factura:", true, plum));
        metaTable.addCell(styledCell(factura.getIdFactura().toUpperCase(), false, mutedGray));
        metaTable.addCell(styledCell("Fecha de compra:", true, plum));
        metaTable.addCell(styledCell(factura.getFechaCompra().toString(), false, mutedGray));

        doc.add(metaTable);

        // ── INFORMACIÓN DEL CLIENTE ───────────────────────────────────────────
        doc.add(sectionTitle("Datos del cliente", plum));

        Table clienteTable = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(12);

        List<Map<String, Object>> usuarios = factura.getUsuario();
        if (usuarios != null && !usuarios.isEmpty()) {
            Map<String, Object> u = usuarios.get(0);
            addRow(clienteTable, "ID / Cédula:", safeStr(u, "idUsuario"), plum, mutedGray);
            addRow(clienteTable, "Nombre:", safeStr(u, "nombre"), plum, mutedGray);
            addRow(clienteTable, "Correo:", safeStr(u, "correo"), plum, mutedGray);
        }
        addRow(clienteTable, "Dirección de envío:", direccionEnvio, plum, mutedGray);
        doc.add(clienteTable);

        // ── DETALLE DE PRODUCTOS ──────────────────────────────────────────────
        doc.add(sectionTitle("Detalle de productos", plum));

        // Cabecera tabla productos
        Table prodTable = new Table(UnitValue.createPercentArray(new float[]{30, 15, 20, 20, 15}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(4);

        String[] headers = {"Producto", "Cantidad", "Precio unit.", "Personalización", "Subtotal"};
        for (String h : headers) {
            prodTable.addHeaderCell(
                new Cell().add(new Paragraph(h).setBold().setFontSize(9).setFontColor(ColorConstants.WHITE))
                          .setBackgroundColor(plum)
                          .setPadding(6)
            );
        }

        List<Map<String, Object>> items = factura.getListaAmigurumi();
        int subtotalGeneral = 0;

        if (items != null) {
            for (Map<String, Object> item : items) {
                String nombre     = safeStr(item, "nombre");
                int cantidad      = parseInt(item, "cantidad");
                int precioUnit    = parseInt(item, "precioUnitario");
                int subtotal      = cantidad * precioUnit;
                subtotalGeneral  += subtotal;

                // Personalización: puede ser un Map<String, String>
                String pers = "";
                Object persObj = item.get("personalizacion");
                if (persObj instanceof Map) {
                    Map<String, Object> persMap = (Map<String, Object>) persObj;
                    StringBuilder sb = new StringBuilder();
                    persMap.forEach((k, v) -> {
                        if (v != null && !v.toString().isBlank()) {
                            sb.append(k).append(": ").append(v).append("\n");
                        }
                    });
                    pers = sb.toString().trim();
                }
                if (pers.isBlank()) pers = "—";

                prodTable.addCell(bodyCell(nombre));
                prodTable.addCell(bodyCell(String.valueOf(cantidad)).setTextAlignment(TextAlignment.CENTER));
                prodTable.addCell(bodyCell("$" + String.format("%,d", precioUnit)).setTextAlignment(TextAlignment.RIGHT));
                prodTable.addCell(bodyCell(pers).setFontSize(8));
                prodTable.addCell(bodyCell("$" + String.format("%,d", subtotal))
                        .setTextAlignment(TextAlignment.RIGHT).setBold());

                // Fondo alternado
                int cellCount = prodTable.getNumberOfRows();
                if (cellCount % 2 == 0) {
                    // iText7 no tiene zebra nativo fácil; simplemente dejamos blanco
                }
            }
        }
        doc.add(prodTable);

        // ── TOTALES ───────────────────────────────────────────────────────────
        doc.add(sectionTitle("Resumen de cobro", plum));

        Table totTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(16);

        int precioEnvio = factura.getPrecioEnvio();
        int totalFinal  = factura.getTotal();

        totTable.addCell(labelCell("Subtotal productos:", mutedGray));
        totTable.addCell(valueCell("$" + String.format("%,d", subtotalGeneral)));

        totTable.addCell(labelCell("Costo de envío:", mutedGray));
        totTable.addCell(valueCell("$" + String.format("%,d", precioEnvio)));

        // Fila total con fondo de color
        Cell totalLabel = new Cell().add(new Paragraph("TOTAL A PAGAR").setBold().setFontSize(13).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(plum).setPadding(8).setTextAlignment(TextAlignment.RIGHT);
        Cell totalValue = new Cell().add(new Paragraph("$" + String.format("%,d", totalFinal)).setBold().setFontSize(13).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(rose).setPadding(8).setTextAlignment(TextAlignment.RIGHT);
        totTable.addCell(totalLabel);
        totTable.addCell(totalValue);

        doc.add(totTable);

        // ── PIE ───────────────────────────────────────────────────────────────
        doc.add(new LineSeparator(new SolidLine(1f)).setMarginBottom(8));

        doc.add(new Paragraph("¡Gracias por tu compra! 🎀  Nos pondremos en contacto pronto para coordinar la entrega.")
                .setFontSize(10)
                .setFontColor(rose)
                .setTextAlignment(TextAlignment.CENTER)
                .setItalic());

        doc.add(new Paragraph("Este documento es una factura válida generada electrónicamente por Camigurumis.")
                .setFontSize(8)
                .setFontColor(mutedGray)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(4));

        doc.close();
        return baos.toByteArray();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Paragraph sectionTitle(String text, DeviceRgb color) {
        return new Paragraph(text)
                .setBold()
                .setFontSize(12)
                .setFontColor(color)
                .setMarginTop(8)
                .setMarginBottom(4);
    }

    private Cell styledCell(String text, boolean bold, DeviceRgb color) {
        Paragraph p = new Paragraph(text).setFontSize(10).setFontColor(color);
        if (bold) p.setBold();
        return new Cell().add(p).setBorder(null).setPaddingBottom(4);
    }

    private void addRow(Table table, String label, String value,
                        DeviceRgb labelColor, DeviceRgb valueColor) {
        table.addCell(new Cell().add(new Paragraph(label).setBold().setFontSize(9).setFontColor(labelColor)).setBorder(null).setPaddingBottom(3));
        table.addCell(new Cell().add(new Paragraph(value).setFontSize(9).setFontColor(valueColor)).setBorder(null).setPaddingBottom(3));
    }

    private Cell bodyCell(String text) {
        return new Cell().add(new Paragraph(text).setFontSize(9)).setPadding(5);
    }

    private Cell labelCell(String text, DeviceRgb color) {
        return new Cell().add(new Paragraph(text).setFontSize(10).setFontColor(color).setTextAlignment(TextAlignment.RIGHT))
                .setBorder(null).setPaddingTop(4).setPaddingBottom(4);
    }

    private Cell valueCell(String text) {
        return new Cell().add(new Paragraph(text).setFontSize(10).setBold().setTextAlignment(TextAlignment.RIGHT))
                .setBorder(null).setPaddingTop(4).setPaddingBottom(4);
    }

    private String safeStr(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : "—";
    }

    private int parseInt(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) return 0;
        try { return Integer.parseInt(v.toString()); }
        catch (NumberFormatException e) { return 0; }
    }
}
