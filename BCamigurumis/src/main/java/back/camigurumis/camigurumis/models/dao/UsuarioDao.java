package back.camigurumis.camigurumis.models.dao;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

import back.camigurumis.camigurumis.models.entities.Usuario;

@Service
public class UsuarioDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public UsuarioDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
    public void ingresarUsuario(Usuario usuario) {

        Map<String, Object> data = Map.of(
                "idUsuario", usuario.getIdUsuario(),
                "nombre", usuario.getNombre(),
                "primerApellido", usuario.getPrimerApellido(),
                "segundoApellido", usuario.getSegundoApellido(),
                "telefono", usuario.getTelefono(),
                "correo", usuario.getCorreo(),
                "fechaCreacion", usuario.getFechaCreacion() != null ? usuario.getFechaCreacion().toString() : null,
                "isAdmin", usuario.getIsAdmin(),
                "isActivo", usuario.getIsActivo(),
                "password", usuario.getPassword());

        try {
            ApiFuture<WriteResult> future = db.collection("usuarios")
                    .document(usuario.getIdUsuario())
                    .set(data);

            System.out.println("✔ Usuario guardado: " + future.get().getUpdateTime());

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando usuario: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Usuario> listarUsuarios() {

        List<Usuario> usuarios = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("usuarios").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (documents == null || documents.isEmpty()) {
                return usuarios;
            }

            for (QueryDocumentSnapshot doc : documents) {
                Usuario usuario = convertir(doc);

                if (usuario != null) {
                    usuario.setPassword(""); // ocultar password
                    usuarios.add(usuario);
                }
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando usuarios: " + e.getMessage());
        }

        return usuarios;
    }

    // ---------------- BUSCAR ----------------
    public Usuario buscarDatosUnicoUsuario(String idUsuario) {

        try {
            DocumentSnapshot doc = db.collection("usuarios")
                    .document(idUsuario)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            Usuario usuario = convertir(doc);

            if (usuario != null) {
                usuario.setPassword(""); // ocultar
            }

            return usuario;

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando usuario: " + e.getMessage());
        }

        return null;
    }

    // ---------------- BUSCAR CON PASSWORD ----------------
    public Usuario buscarDatosUnicoUsuarioContrasena(String idUsuario) {

        try {
            DocumentSnapshot doc = db.collection("usuarios")
                    .document(idUsuario)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando usuario: " + e.getMessage());
        }

        return null;
    }

    // ---------------- EXISTE ----------------
    public Boolean buscarUsuario(String idUsuario) {

        try {
            DocumentSnapshot doc = db.collection("usuarios")
                    .document(idUsuario)
                    .get()
                    .get();

            return doc.exists();

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error verificando usuario: " + e.getMessage());
        }

        return false;
    }

    // ---------------- ELIMINAR (SOFT DELETE) ----------------
    public void borrarUsuario(String idUsuario) {

        Usuario usuario = buscarDatosUnicoUsuarioContrasena(idUsuario);

        if (usuario == null)
            return;

        usuario.setIsActivo(false);

        ingresarUsuario(usuario);
    }

    // ---------------- CONVERTIR ----------------
    private Usuario convertir(DocumentSnapshot document) {

        if (document == null || !document.exists() || document.getData() == null) {
            return null;
        }

        Map<String, Object> data = document.getData();

        Usuario usuario = new Usuario();

        usuario.setIdUsuario(document.getId());
        usuario.setNombre(String.valueOf(data.get("nombre")));
        usuario.setPrimerApellido(String.valueOf(data.get("primerApellido")));
        usuario.setSegundoApellido(String.valueOf(data.get("segundoApellido")));
        usuario.setTelefono(String.valueOf(data.get("telefono")));
        usuario.setCorreo(String.valueOf(data.get("correo")));

        Object fecha = data.get("fechaCreacion");
        usuario.setFechaCreacion(fecha != null ? LocalDate.parse(fecha.toString()) : null);

        usuario.setIsAdmin(Boolean.parseBoolean(String.valueOf(data.get("isAdmin"))));
        usuario.setIsActivo(Boolean.parseBoolean(String.valueOf(data.get("isActivo"))));

        usuario.setPassword(String.valueOf(data.get("password")));

        return usuario;
    }
}