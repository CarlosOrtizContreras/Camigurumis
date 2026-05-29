package back.camigurumis.camigurumis.models.dao;

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
import back.camigurumis.camigurumis.models.entities.EstadoEnvio;

@Service
public class EstadoEnvioDao {

    private final Firestore db;

    public EstadoEnvioDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarEstadoEnvio(EstadoEnvio estadoEnvio) {

        Map<String, Object> data = new HashMap<>();
        data.put("idEstadoEnvio", estadoEnvio.getIdEstadoEnvio());
        data.put("nombre", estadoEnvio.getNombre());
        data.put("descripcion", estadoEnvio.getDescripcion());

        ApiFuture<WriteResult> future = db.collection("estadoEnvio")
                .document(estadoEnvio.getIdEstadoEnvio())
                .set(data);

        try {
            System.out.println("EstadoEnvio guardado en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    public List<EstadoEnvio> listarEstadoEnvio() {

        List<EstadoEnvio> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("estadoEnvio").get();

        try {
            List<QueryDocumentSnapshot> documentos = future.get().getDocuments();

            for (QueryDocumentSnapshot doc : documentos) {
                lista.add(obtenerDatos(doc));
            }

        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        return lista;
    }

    public EstadoEnvio buscarEstadoEnvio(String id) {

        DocumentReference docRef = db.collection("estadoEnvio").document(id);

        try {
            DocumentSnapshot doc = docRef.get().get();
            return obtenerDatos(doc);

        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        return null;
    }

    public void eliminarEstadoEnvio(String id) {

        DocumentReference docRef = db.collection("estadoEnvio").document(id);

        ApiFuture<WriteResult> future = docRef.delete();

        try {
            System.out.println("EstadoEnvio eliminado en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    private EstadoEnvio obtenerDatos(DocumentSnapshot document) {

        EstadoEnvio estado = new EstadoEnvio();

        estado.setIdEstadoEnvio(document.getId());
        estado.setNombre(document.getString("nombre"));
        estado.setDescripcion(document.getString("descripcion"));

        return estado;
    }
}