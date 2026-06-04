package back.camigurumis.camigurumis.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import back.camigurumis.camigurumis.models.dao.ColorDao;
import back.camigurumis.camigurumis.models.entities.Color;

@RestController
@RequestMapping("/color")
public class ColorController {

    private final ColorDao colorDao;

    public ColorController(ColorDao colorDao) {
        this.colorDao = colorDao;
    }

    // ---------------- LISTAR ----------------
    @GetMapping("/listar")
    public ResponseEntity<List<Color>> listarColores() {

        List<Color> lista = colorDao.listarColores();

        if (lista == null || lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(lista);
    }

    // ---------------- BUSCAR ----------------
    @GetMapping("/buscar")
    public ResponseEntity<Color> buscarColor(@RequestParam String id) {

        Color color = colorDao.obtenerColor(id);

        if (color == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(color);
    }

    // ---------------- GUARDAR ----------------
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarColor(@RequestBody Color color) {

        if (color == null || color.getIdColor() == null || color.getIdColor().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        color.setIsActivo(true);
        colorDao.ingresarColor(color);

        return ResponseEntity.ok().build();
    }

    // ---------------- ACTUALIZAR ----------------
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarColor(@RequestBody Color color) {

        if (color == null || color.getIdColor() == null) {
            return ResponseEntity.badRequest().build();
        }

        Color existente = colorDao.obtenerColor(color.getIdColor());

        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        colorDao.ingresarColor(color);

        return ResponseEntity.ok().build();
    }

    // ---------------- ELIMINAR ----------------
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarColor(@PathVariable String id) {

        Color existente = colorDao.obtenerColor(id);

        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        colorDao.borrarColor(id);

        return ResponseEntity.ok().build();
    }
}