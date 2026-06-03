package back.camigurumis.camigurumis.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.ParteDao;
import back.camigurumis.camigurumis.models.entities.Parte;

@Controller
@RequestMapping("/parte")
public class ParteController {

    @Autowired
    private ParteDao parteDao;

    // GET /parte/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Parte>> listarPartes() {
        List<Parte> lista = parteDao.listarPartes();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /parte/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Parte> buscarParte(@RequestParam String id) {
        Parte parte = parteDao.buscarParte(id);
        if (parte == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(parte);
    }

    // POST /parte/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarParte(@RequestBody Parte parte) {
        if (parte.getIdParte() == null || parte.getIdParte().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        parte.setIsActivo(true);
        parteDao.ingresarParte(parte);
        return ResponseEntity.noContent().build();
    }

    // PUT /parte/actualizar
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarParte(@RequestBody Parte parte) {
        Parte existente = parteDao.buscarParte(parte.getIdParte());
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        parteDao.ingresarParte(parte);
        return ResponseEntity.noContent().build();
    }

    // DELETE /parte/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarParte(@PathVariable String id) {
        Parte existente = parteDao.buscarParte(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        parteDao.eliminarParte(id);
        return ResponseEntity.noContent().build();
    }
}
