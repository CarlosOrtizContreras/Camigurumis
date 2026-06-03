package back.camigurumis.camigurumis.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import back.camigurumis.camigurumis.models.dao.AmigurumiDao;
import back.camigurumis.camigurumis.models.entities.Amigurumi;

import java.io.IOException;
import java.nio.file.*;

@Controller
@RequestMapping("/amigurumi")
public class AmigurumiController {

    @Autowired
    private AmigurumiDao amigurumiDao;

    // GET /amigurumi/listar
    @GetMapping("/listar")
    public ResponseEntity<List<Amigurumi>> listarAmigurumis() {
        List<Amigurumi> lista = amigurumiDao.listarAmigurumi();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // GET /amigurumi/buscar?id=xxx
    @GetMapping("/buscar")
    public ResponseEntity<Amigurumi> buscarAmigurumi(@RequestParam String id) {
        Amigurumi amigurumi = amigurumiDao.buscarAmigurumi(id);
        if (amigurumi == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(amigurumi);
    }

    // POST /amigurumi/guardar
    @PostMapping("/guardar")
    public ResponseEntity<Void> guardarAmigurumi(@RequestBody Amigurumi amigurumi) {
        if (amigurumi.getIdAmigurumi() == null || amigurumi.getIdAmigurumi().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        amigurumi.setFechaCreacion(LocalDate.now());
        amigurumi.setFechaModificacion(LocalDate.now());
        amigurumi.setIsActivo(true);
        amigurumiDao.ingresarAmigurumi(amigurumi);
        return ResponseEntity.noContent().build();
    }

    // PUT /amigurumi/actualizar
    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarAmigurumi(@RequestBody Amigurumi amigurumi) {
        Amigurumi existente = amigurumiDao.buscarAmigurumi(amigurumi.getIdAmigurumi());
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        amigurumi.setFechaCreacion(existente.getFechaCreacion());
        amigurumi.setFechaModificacion(LocalDate.now());
        amigurumiDao.ingresarAmigurumi(amigurumi);
        return ResponseEntity.noContent().build();
    }

    // DELETE /amigurumi/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarAmigurumi(@PathVariable String id) {
        Amigurumi existente = amigurumiDao.buscarAmigurumi(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        amigurumiDao.borrarAmigurumi(id);
        return ResponseEntity.noContent().build();
    }

    // POST /amigurumi/subirImagen
    @PostMapping("/subirImagen")
    public ResponseEntity<String> subirImagen(@RequestParam("imagen") MultipartFile archivo,
                                              @RequestParam("id") String id) {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body("No se recibió ningún archivo");
        }

        try {
            String nombreArchivo = id + "_" + archivo.getOriginalFilename();
            Path ruta = Paths.get("uploads/" + nombreArchivo);
            Files.createDirectories(ruta.getParent());
            Files.write(ruta, archivo.getBytes());

            Amigurumi amigurumi = amigurumiDao.buscarAmigurumi(id);
            if (amigurumi != null) {
                amigurumi.setImagen("uploads/" + nombreArchivo);
                amigurumi.setFechaModificacion(LocalDate.now());
                amigurumiDao.ingresarAmigurumi(amigurumi);
            }

            return ResponseEntity.ok("uploads/" + nombreArchivo);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar la imagen");
        }
    }
}
