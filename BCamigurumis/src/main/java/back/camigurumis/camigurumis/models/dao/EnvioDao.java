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
        data.put("estadoEnvio", envio.getEstadoEnvio() != null ? envio.getEstadoEnvio() : new ArrayList<>());

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

        if (documents != null && !documents.isEmpty()) {
            for (QueryDocumentSnapshot doc : documents) {
                Envio envio = obtenerDatosEnvio(doc);
                if (envio != null) lista.add(envio);
            }
        }

        return lista;
    }

    /**
     * Retorna null si el documento NO existe en Firestore.
     * Esto evita el NullPointerException en getData() cuando el doc no existe.
     */
    public Envio buscarEnvio(String idEnvio) {

        DocumentReference docRef = db.collection("envios").document(idEnvio);

        try {
            DocumentSnapshot doc = docRef.get().get();

            // ⚠️ FIX CRÍTICO: verificar existencia antes de leer datos
            if (!doc.exists()) {
                return null;
            }

            return obtenerDatosEnvio(doc);

        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }

        return null;
    }

    @SuppressWarnings({ "unchecked", "null" })
    private Envio obtenerDatosEnvio(DocumentSnapshot doc) {
        if (doc == null || !doc.exists() || doc.getData() == null) {
            return null;
        }

        Envio envio = new Envio();
        envio.setIdEnvio(doc.getId());

        Object direccion = doc.getData().get("direccion");
        envio.setDireccion(direccion != null ? direccion.toString() : "");

        Object costo = doc.getData().get("costoEnvio");
        envio.setCostoEnvio(costo != null ? Integer.parseInt(costo.toString()) : 0);

        Object estados = doc.getData().get("estadoEnvio");
        envio.setEstadoEnvio(estados instanceof List ? (List<Map<String, Object>>) estados : new ArrayList<>());

        return envio;
    }

    @SuppressWarnings({ "unchecked", "null" })
    public void agregarEstado(String idEnvio, String idEstadoEnvio, String novedad) {

        DocumentReference docRef = db.collection("envios").document(idEnvio);

        try {
            DocumentSnapshot doc = docRef.get().get();

            if (!doc.exists()) {
                System.out.println("Envío no encontrado: " + idEnvio);
                return;
            }

            List<Map<String, Object>> estados = (List<Map<String, Object>>) doc.getData().get("estadoEnvio");

            if (estados == null) {
                estados = new ArrayList<>();
            }

            Map<String, Object> nuevoEstado = new HashMap<>();
            nuevoEstado.put("idEstadoEnvio", idEstadoEnvio);
            nuevoEstado.put("fecha", LocalDate.now().toString());
            nuevoEstado.put("novedad", novedad != null ? novedad : "");

            estados.add(nuevoEstado);

            docRef.update("estadoEnvio", estados).get();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
