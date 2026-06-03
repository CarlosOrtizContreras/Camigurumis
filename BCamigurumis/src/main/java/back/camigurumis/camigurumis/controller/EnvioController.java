package back.camigurumis.camigurumis.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.EnvioDao;
import back.camigurumis.camigurumis.models.entities.Envio;

@Controller
@RequestMapping("/envio")
public class EnvioController {

    @Autowired
    private EnvioDao envioDao;

    // GET /envio/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Envio>> listarEnvios() {
        List<Envio> lista = envioDao.listarEnvios();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /envio/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Envio> buscarEnvio(@RequestParam String id) {
        Envio envio = envioDao.buscarEnvio(id);
        if (envio == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(envio);
    }

    // POST /envio/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarEnvio(@RequestBody Envio envio) {
        if (envio.getIdEnvio() == null || envio.getIdEnvio().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        envioDao.ingresarEnvio(envio);
        return ResponseEntity.noContent().build();
    }

    // PUT /envio/actualizar
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarEnvio(@RequestBody Envio envio) {
        Envio existente = envioDao.buscarEnvio(envio.getIdEnvio());
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        envioDao.ingresarEnvio(envio);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /envio/agregarEstado
     * Body params via query:
     *   ?idEnvio=xxx&idEstadoEnvio=yyy&novedad=zzz
     */
    @PostMapping("/agregarEstado")
    public ResponseEntity<Void> agregarEstado(
            @RequestParam String idEnvio,
            @RequestParam String idEstadoEnvio,
            @RequestParam(required = false, defaultValue = "") String novedad) {

        Envio existente = envioDao.buscarEnvio(idEnvio);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        envioDao.agregarEstado(idEnvio, idEstadoEnvio, novedad);
        return ResponseEntity.noContent().build();
    }
}
