package back.camigurumis.camigurumis.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.PagoDao;
import back.camigurumis.camigurumis.models.entities.Pago;

@Controller
@RequestMapping("/pago")
public class PagoController {

    @Autowired
    private PagoDao pagoDao;

    // GET /pago/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Pago>> listarPagos() {
        List<Pago> lista = pagoDao.listarPagos();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /pago/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Pago> buscarPago(@RequestParam String id) {
        Pago pago = pagoDao.buscarPago(id);
        if (pago == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pago);
    }

    // POST /pago/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarPago(@RequestBody Pago pago) {
        if (pago.getIdPago() == null || pago.getIdPago().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        pago.setFechaPago(LocalDate.now());
        pago.setEstadoPago(true);
        pagoDao.ingresarPago(pago);
        return ResponseEntity.noContent().build();
    }

    // PUT /pago/actualizarEstado?id=xxx&estado=false
    @PutMapping("/actualizarEstado")
    public ResponseEntity<Void> actualizarEstadoPago(
            @RequestParam String id,
            @RequestParam Boolean estado) {

        Pago pago = pagoDao.buscarPago(id);
        if (pago == null) {
            return ResponseEntity.notFound().build();
        }
        pago.setEstadoPago(estado);
        pagoDao.ingresarPago(pago);
        return ResponseEntity.noContent().build();
    }

    // DELETE /pago/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarPago(@PathVariable String id) {
        Pago pago = pagoDao.buscarPago(id);
        if (pago == null) {
            return ResponseEntity.notFound().build();
        }
        pagoDao.eliminarPago(id);
        return ResponseEntity.noContent().build();
    }
}
