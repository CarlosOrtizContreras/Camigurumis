package back.camigurumis.camigurumis.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.EstadoEnvioDao;
import back.camigurumis.camigurumis.models.entities.EstadoEnvio;

@Controller
@RequestMapping("/estadoEnvio")
public class EstadoEnvioController {

    @Autowired
    private EstadoEnvioDao estadoEnvioDao;

    // GET /estadoEnvio/listar
    @GetMapping("/listar")
    public ResponseEntity<List<EstadoEnvio>> listarEstadosEnvio() {
        List<EstadoEnvio> lista = estadoEnvioDao.listarEstadoEnvio();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /estadoEnvio/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<EstadoEnvio> buscarEstadoEnvio(@RequestParam String id) {
        EstadoEnvio estado = estadoEnvioDao.buscarEstadoEnvio(id);
        if (estado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(estado);
    }

    // POST /estadoEnvio/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarEstadoEnvio(@RequestBody EstadoEnvio estadoEnvio) {
        if (estadoEnvio.getIdEstadoEnvio() == null || estadoEnvio.getIdEstadoEnvio().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        estadoEnvioDao.ingresarEstadoEnvio(estadoEnvio);
        return ResponseEntity.noContent().build();
    }

    // PUT /estadoEnvio/actualizar
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarEstadoEnvio(@RequestBody EstadoEnvio estadoEnvio) {
        EstadoEnvio existente = estadoEnvioDao.buscarEstadoEnvio(estadoEnvio.getIdEstadoEnvio());
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        estadoEnvioDao.ingresarEstadoEnvio(estadoEnvio);
        return ResponseEntity.noContent().build();
    }

    // DELETE /estadoEnvio/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarEstadoEnvio(@PathVariable String id) {
        EstadoEnvio existente = estadoEnvioDao.buscarEstadoEnvio(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        estadoEnvioDao.eliminarEstadoEnvio(id);
        return ResponseEntity.noContent().build();
    }
}
