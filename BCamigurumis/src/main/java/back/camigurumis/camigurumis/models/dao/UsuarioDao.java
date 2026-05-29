package back.camigurumis.camigurumis.models.dao;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
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

import back.camigurumis.camigurumis.config.FirestoreConfig;
import back.camigurumis.camigurumis.models.entities.Usuario;

@Service
public class UsuarioDao {

    private final Firestore db;

    public UsuarioDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarUsuario(Usuario usuario) {

        Map<String, Object> data = new HashMap<>();
        data.put("idUsuario", usuario.getIdUsuario());
        data.put("nombre", usuario.getNombre());
        data.put("primerApellido", usuario.getPrimerApellido());
        data.put("segundoApellido", usuario.getSegundoApellido());
        data.put("Telefono", usuario.getTelefono());
        data.put("Correo", usuario.getCorreo());
        data.put("fechaCreacion", usuario.getFechaCreacion().toString());
        data.put("isAdmin", usuario.getIsAdmin());
        data.put("isActivo", usuario.getIsActivo());
        data.put("password", usuario.getPassword());


        ApiFuture<WriteResult> addedDocRef = db.collection("usuarios")
                .document(String.valueOf(usuario.getIdUsuario()))
                .set(data);

        try {
            System.out.println("Added document with ID: " + addedDocRef.get().getUpdateTime());
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    @SuppressWarnings({ "null" })
    public List<Usuario> listarUsuarios() {

        List<Usuario> usuarios = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("usuarios").get();

        List<QueryDocumentSnapshot> documents = null;

        try {
            documents = future.get().getDocuments();
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        if (!documents.isEmpty()) {
            for (QueryDocumentSnapshot document : documents) {

                Usuario usuario = new Usuario();

                usuario.setIdUsuario(document.getId().toString());
                usuario.setNombre(document.getData().get("nombre").toString());
                usuario.setPrimerApellido(document.getData().get("primerApellido").toString());
                usuario.setSegundoApellido(document.getData().get("segundoApellido").toString());
                usuario.setTelefono(document.getData().get("Telefono").toString());
                usuario.setCorreo(document.getData().get("Correo").toString());
                usuario.setFechaCreacion(LocalDate.parse(document.getData().get("fechaCreacion").toString()));
                usuario.setIsAdmin(Boolean.parseBoolean(document.getData().get("isAdmin").toString()));
                usuario.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
                usuario.setPassword("");


                usuarios.add(usuario);
            }
        }

        return usuarios;
    }

    public void borrarUsuario(String idUsuario) {

        DocumentReference docRef = db.collection("usuarios").document(String.valueOf(idUsuario));

        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;

        try {
            document = future.get();
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        Usuario usuario = obtenerDatosUsuario(document);

        usuario.setIsActivo(false);

        ingresarUsuario(usuario);
    }

    public Usuario buscarDatosUnicoUsuario(String idUsuario) {

        DocumentReference docRef = db.collection("usuarios").document(String.valueOf(idUsuario));

        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;

        try {
            document = future.get();
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

            Usuario usuario = obtenerDatosUsuario(document);
            usuario.setPassword("");
            return usuario;
        

        
    }

    public Usuario buscarDatosUnicoUsuarioContrasena(String idUsuario) {

        DocumentReference docRef = db.collection("usuarios").document(String.valueOf(idUsuario));

        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;

        try {
            document = future.get();
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        
        return obtenerDatosUsuario(document);

    }

    public Boolean buscarUsuario (String idUsuario){
        DocumentReference docRef = db.collection("usuarios").document(String.valueOf(idUsuario));

        ApiFuture<DocumentSnapshot> future = docRef.get();
        
        DocumentSnapshot document = null;

        try {
            document = future.get();
        } catch (InterruptedException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        } catch (ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
        if (document.exists()) {
            return true;
        } else {
            return false;
        }
    }

    @SuppressWarnings({ "null" })
    private Usuario obtenerDatosUsuario(DocumentSnapshot document) {

        Usuario usuario = new Usuario();

        usuario.setIdUsuario(document.getId().toString());
        usuario.setNombre(document.getData().get("nombre").toString());
        usuario.setPrimerApellido(document.getData().get("primerApellido").toString());
        usuario.setSegundoApellido(document.getData().get("segundoApellido").toString());
        usuario.setTelefono(document.getData().get("Telefono").toString());
        usuario.setCorreo(document.getData().get("Correo").toString());
        usuario.setFechaCreacion(LocalDate.parse(document.getData().get("fechaCreacion").toString()));
        usuario.setIsAdmin(Boolean.parseBoolean(document.getData().get("isAdmin").toString()));
        usuario.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
        usuario.setPassword(document.getData().get("password").toString());


        return usuario;
    }

    
}