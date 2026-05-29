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
import back.camigurumis.camigurumis.models.entities.Parte;

@Service
public class ParteDao {

    private final Firestore db;

    public ParteDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarParte(Parte parte) {

        Map<String, Object> data = new HashMap<>();
        data.put("idParte", parte.getIdParte());
        data.put("nombre", parte.getNombre());
        data.put("descripcion", parte.getDescripcion());
        data.put("color", parte.getColor());
        data.put("precioExtra", parte.getPrecioExtra());
        data.put("isActivo", parte.getIsActivo());

        ApiFuture<WriteResult> future = db.collection("partes")
                .document(parte.getIdParte())
                .set(data);

        try {
            System.out.println("Parte guardada en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    public List<Parte> listarPartes() {

        List<Parte> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("partes").get();

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

    public Parte buscarParte(String id) {

        DocumentReference docRef = db.collection("partes").document(id);

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

    public void eliminarParte(String id) {

        DocumentReference docRef = db.collection("partes").document(id);

        try {
            DocumentSnapshot doc = docRef.get().get();

            Parte parte = obtenerDatos(doc);
            parte.setIsActivo(false);

            ingresarParte(parte);

        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    @SuppressWarnings({ "unchecked", "null" })
    private Parte obtenerDatos(DocumentSnapshot document) {

        Parte parte = new Parte();

        parte.setIdParte(document.getId());
        parte.setNombre(document.getString("nombre"));
        parte.setDescripcion(document.getString("descripcion"));
        parte.setColor((List<String>) document.get("color"));
        parte.setPrecioExtra(document.getLong("precioExtra").intValue());
        parte.setIsActivo(document.getBoolean("isActivo"));

        return parte;
    }
}