package back.camigurumis.camigurumis.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import back.camigurumis.camigurumis.models.dao.UsuarioDao;
import back.camigurumis.camigurumis.models.entities.Usuario;

@Controller
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioDao usuarioDao;

    @GetMapping("/listarUsarios")
    public ResponseEntity<ArrayList<Usuario>> listarUsuarios() {
        List<Usuario> listaCompleta = usuarioDao.listarUsuarios();
        ArrayList<Usuario> soloUsuario = new ArrayList<>();
        if (listaCompleta.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(soloUsuario);

        }

    }

    @PostMapping("/guardarUsuario")
    public ResponseEntity<Void> guardarUsuario(@RequestBody Usuario usuario) {

        if (usuarioDao.buscarUsuario(usuario.getIdUsuario())) {
            return ResponseEntity.badRequest().build();

        } else {
            usuarioDao.ingresarUsuario(usuario);
            return ResponseEntity.noContent().build();
        }

    }

    @GetMapping("/listarBusquedaUsuario")
    public ResponseEntity<Usuario> listarBusquedaUsuario(@RequestParam String id) {

        if (usuarioDao.buscarUsuario(id)) {

            return ResponseEntity.ok(usuarioDao.buscarDatosUnicoUsuario(id));
        } else {
            return ResponseEntity.notFound().build();
        }

    }

      @DeleteMapping("/eliminacionUsuario{id}")
    public ResponseEntity<Void> eliminacionUsuario(@PathVariable("id") String id) {
            
          if (usuarioDao.buscarUsuario(id)) {
            usuarioDao.borrarUsuario(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/realizarActualizacionContrasenaUsuario")
    public ResponseEntity <Void> realizarActualizacionContrasena(@RequestParam("id") String  id,
            @RequestParam("password") String password) {
        if (usuarioDao.buscarUsuario(id)) {
            Usuario usuario = usuarioDao.buscarDatosUnicoUsuario(id);;
            usuario.setPassword(password);
            usuarioDao.ingresarUsuario(usuario);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    //Se debe enviar la contraseña vacia
    @PutMapping("/realizarActualizacionDatosUsuario")
    public ResponseEntity<Usuario> realizarActualizacionDatosUsuario(@RequestBody Usuario usuario) {
        Usuario usuarioContrasena = usuarioDao.buscarDatosUnicoUsuarioContrasena(usuario.getIdUsuario());
        usuario.setPassword(usuarioContrasena.getPassword());
        usuarioDao.ingresarUsuario(usuario);
        return  ResponseEntity.ok(usuario);

    }


}
