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
import back.camigurumis.camigurumis.models.entities.Envio;

@Service
public class EnvioDao {

    private final Firestore db;

    public EnvioDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarEnvio(Envio envio) {

        Map<String, Object> data = new HashMap<>();
        data.put("idEnvio", envio.getIdEnvio());
        data.put("direccion", envio.getDireccion());
        data.put("costoEnvio", envio.getCostoEnvio());

        data.put("estadoEnvio", envio.getEstadoEnvio());

        ApiFuture<WriteResult> future = db.collection("envios")
                .document(envio.getIdEnvio())
                .set(data);

        try {
            System.out.println("Envio guardado: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    @SuppressWarnings({ "null", "unchecked" })
    public List<Envio> listarEnvios() {

        List<Envio> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("envios").get();

        List<QueryDocumentSnapshot> documents = null;

        try {
            documents = future.get().getDocuments();
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        if (!documents.isEmpty()) {
            for (QueryDocumentSnapshot doc : documents) {

                Envio envio = new Envio();

                envio.setIdEnvio(doc.getId().toString());
                envio.setDireccion(doc.getData().get("direccion").toString());
                envio.setCostoEnvio(Integer.parseInt(doc.getData().get("costoEnvio").toString()));

            
                envio.setEstadoEnvio(
                        (List<Map<String, Object>>) doc.getData().get("estadoEnvio"));

                lista.add(envio);
            }
        }

        return lista;
    }

    public Envio buscarEnvio(String idEnvio) {

        DocumentReference docRef = db.collection("envios").document(idEnvio);

        DocumentSnapshot doc = null;

        try {
            doc = docRef.get().get();
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        return obtenerDatosEnvio(doc);
    }

    @SuppressWarnings({ "null", "unchecked" })
    private Envio obtenerDatosEnvio(DocumentSnapshot doc) {

        Envio envio = new Envio();

        envio.setIdEnvio(doc.getId().toString());
        envio.setDireccion(doc.getData().get("direccion").toString());
        envio.setCostoEnvio(Integer.parseInt(doc.getData().get("costoEnvio").toString()));

        envio.setEstadoEnvio(
                (List<Map<String, Object>>) doc.getData().get("estadoEnvio"));

        return envio;
    }
    
    @SuppressWarnings({ "unchecked", "null" })
    public void agregarEstado(String idEnvio, String idEstadoEnvio, String novedad) {

        DocumentReference docRef = db.collection("envios").document(idEnvio);

        try {
            DocumentSnapshot doc = docRef.get().get();

            List<Map<String, Object>> estados = (List<Map<String, Object>>) doc.getData().get("estadoEnvio");

            if (estados == null) {
                estados = new ArrayList<>();
            }

            Map<String, Object> nuevoEstado = new HashMap<>();
            nuevoEstado.put("idEstadoEnvio", idEstadoEnvio);
            nuevoEstado.put("fecha", LocalDate.now().toString());
            nuevoEstado.put("novedad", novedad);

            estados.add(nuevoEstado);

            docRef.update("estadoEnvio", estados);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}