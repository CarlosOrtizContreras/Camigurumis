package back.camigurumis.camigurumis.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.ColorDao;
import back.camigurumis.camigurumis.models.entities.Color;

@Controller
@RequestMapping("/color")
public class ColorController {

    @Autowired
    private ColorDao colorDao;

    // GET /color/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Color>> listarColores() {
        List<Color> lista = colorDao.listarColores();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /color/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Color> buscarColor(@RequestParam String id) {
        Color color = colorDao.obtenerDatosColor(id);
        if (color == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(color);
    }

    // POST /color/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarColor(@RequestBody Color color) {
        if (color.getIdColor() == null || color.getIdColor().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        color.setIsActivo(true);
        colorDao.ingresarColor(color);
        return ResponseEntity.noContent().build();
    }

    // PUT /color/actualizar
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarColor(@RequestBody Color color) {
        Color existente = colorDao.obtenerDatosColor(color.getIdColor());
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        colorDao.ingresarColor(color);
        return ResponseEntity.noContent().build();
    }

    // DELETE /color/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarColor(@PathVariable String id) {
        Color existente = colorDao.obtenerDatosColor(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        colorDao.borrarColor(id);
        return ResponseEntity.noContent().build();
    }
}
