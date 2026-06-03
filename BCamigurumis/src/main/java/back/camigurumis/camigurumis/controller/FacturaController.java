package back.camigurumis.camigurumis.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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
     * Guarda la factura y crea automáticamente un Envio asociado.
     */
    @PostMapping("/guardar")
    public ResponseEntity<Factura> guardarFactura(@RequestBody Factura factura) {
        if (factura.getIdFactura() == null || factura.getIdFactura().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        factura.setFechaCompra(LocalDate.now());

        // Crear envío asociado automáticamente si no existe
        if (factura.getIdEnvio() != null && !factura.getIdEnvio().isBlank()) {
            Envio envioExistente = envioDao.buscarEnvio(factura.getIdEnvio());
            if (envioExistente == null) {
                Envio nuevoEnvio = new Envio();
                nuevoEnvio.setIdEnvio(factura.getIdEnvio());
                nuevoEnvio.setDireccion("");
                nuevoEnvio.setCostoEnvio(factura.getPrecioEnvio());
                nuevoEnvio.setEstadoEnvio(new java.util.ArrayList<>());
                envioDao.ingresarEnvio(nuevoEnvio);
            }
        }

        facturaDao.ingresarFactura(factura);
        return ResponseEntity.ok(factura);
    }
}
