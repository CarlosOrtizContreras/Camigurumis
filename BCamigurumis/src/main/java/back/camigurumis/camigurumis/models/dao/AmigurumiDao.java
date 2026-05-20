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
import back.camigurumis.camigurumis.models.entities.Amigurumi;

@Service
public class AmigurumiDao {

    private final Firestore db;

    public AmigurumiDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    @SuppressWarnings("null")
    public void ingresarAmigurumi(Amigurumi amigurumi) {
        Map<String, Object> data = new HashMap<>();
        data.put("idAmigurumi", amigurumi.getIdAmigurumi());
        data.put("nombre", amigurumi.getNombre());
        data.put("disponibilidad", amigurumi.getDisponibilidad());
        data.put("isActivo", amigurumi.getIsActivo());
        data.put("descripcion", amigurumi.getDescripcion());
        data.put("fechaCreacion", amigurumi.getFechaCreacion().toString());
        data.put("fechaModificacion", amigurumi.getFechaModificacion().toString());
        data.put("partesModificables", amigurumi.getPartesModificables());
        data.put("precioBase", amigurumi.getPrecioBase());

        ApiFuture<WriteResult> addedDocRef = db.collection("amigurumis")
                .document(String.valueOf(amigurumi.getIdAmigurumi())).set(data);

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

    @SuppressWarnings({ "null", "unchecked" })
    public List<Amigurumi> listarAmigurumi() {

        List<Amigurumi> amigurumis = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("amigurumis").get();

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
                Amigurumi amigurumi = new Amigurumi();
                amigurumi.setIdAmigurumi(document.getId().toString());
                amigurumi.setNombre(document.getData().get("nombre").toString());
                amigurumi.setDisponibilidad(Boolean.parseBoolean(document.getData().get("disponibilidad").toString()));
                amigurumi.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
                amigurumi.setDescripcion(document.getData().get("descripcion").toString());
                amigurumi.setFechaCreacion(LocalDate.parse(document.getData().get("fechaCreacion").toString()));
                amigurumi.setFechaModificacion(LocalDate.parse(document.getData().get("fechaModificacion").toString()));
                amigurumi.setPrecioBase(Integer.parseInt(document.getData().get("precioBase").toString()));
                amigurumi.setPartesModificables((List<String>) document.getData().get("partesModificables"));

                amigurumis.add(amigurumi);
            }

        }
        return amigurumis;
    }

    @SuppressWarnings({ "null" })
    public void borrarAmigurumi(String idAmigurumi) {
        DocumentReference docRef = db.collection("amigurumis").document(String.valueOf(idAmigurumi));

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
        Amigurumi amigurumi = obtenerDatosAmigurumi(document);

        amigurumi.setFechaModificacion(LocalDate.now());
        amigurumi.setIsActivo(false);
        ingresarAmigurumi(amigurumi);
    }

    @SuppressWarnings("null")
    public Amigurumi buscarAmigurumi(String idAmigurumi){
        DocumentReference docRef = db.collection("amigurumis").document(String.valueOf(idAmigurumi));

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
        return obtenerDatosAmigurumi(document);

    }

    @SuppressWarnings({ "null", "unchecked" })
    private Amigurumi obtenerDatosAmigurumi(DocumentSnapshot document){
        Amigurumi amigurumi = new Amigurumi();

        amigurumi.setIdAmigurumi(document.getId().toString());
        amigurumi.setNombre(document.getData().get("nombre").toString());
        amigurumi.setDisponibilidad(Boolean.parseBoolean(document.getData().get("disponibilidad").toString()));
        amigurumi.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
        amigurumi.setDescripcion(document.getData().get("descripcion").toString());
        amigurumi.setFechaCreacion(LocalDate.parse(document.getData().get("fechaCreacion").toString()));
        amigurumi.setFechaModificacion(LocalDate.parse(document.getData().get("fechaModificacion").toString()));
        amigurumi.setPrecioBase(Integer.parseInt(document.getData().get("precioBase").toString()));
        amigurumi.setPartesModificables((List<String>) document.getData().get("partesModificables"));

        return amigurumi;
    }
}
