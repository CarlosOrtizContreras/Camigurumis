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

import back.camigurumis.camigurumis.models.entities.Envio;

@Service
public class EnvioDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public EnvioDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
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
            System.out.println("✔ Envío guardado: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando envío: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Envio> listarEnvios() {

        List<Envio> lista = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("envios").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (documents == null || documents.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot doc : documents) {
                Envio envio = convertir(doc);
                if (envio != null)
                    lista.add(envio);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando envíos: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public Envio buscarEnvio(String idEnvio) {

        DocumentReference docRef = db.collection("envios").document(idEnvio);

        try {
            DocumentSnapshot doc = docRef.get().get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando envío: " + e.getMessage());
        }

        return null;
    }

    // ---------------- AGREGAR ESTADO ----------------
    @SuppressWarnings("unchecked")
    public void agregarEstado(String idEnvio, String idEstadoEnvio, String novedad) {

        try {
            DocumentReference docRef = db.collection("envios").document(idEnvio);
            DocumentSnapshot doc = docRef.get().get();

            if (!doc.exists()) {
                System.out.println("❌ Envío no encontrado");
                return;
            }

            Object raw = doc.get("estadoEnvio");

            List<Map<String, Object>> estados = (raw instanceof List)
                    ? (List<Map<String, Object>>) raw
                    : new ArrayList<>();

            Map<String, Object> nuevoEstado = new HashMap<>();
            nuevoEstado.put("idEstadoEnvio", idEstadoEnvio);
            nuevoEstado.put("fecha", LocalDate.now().toString());
            nuevoEstado.put("novedad", novedad != null ? novedad : "");

            estados.add(nuevoEstado);

            docRef.update("estadoEnvio", estados).get();

        } catch (Exception e) {
            System.out.println("❌ Error agregando estado: " + e.getMessage());
        }
    }

    // ---------------- CONVERTIR ----------------
    private Envio convertir(DocumentSnapshot doc) {

        if (doc == null || !doc.exists() || doc.getData() == null) {
            return null;
        }

        Envio envio = new Envio();

        envio.setIdEnvio(doc.getId());
        envio.setDireccion(String.valueOf(doc.get("direccion")));
        envio.setCostoEnvio(Integer.parseInt(String.valueOf(doc.get("costoEnvio"))));

        Object estados = doc.get("estadoEnvio");

        if (estados instanceof List) {
            envio.setEstadoEnvio((List<Map<String, Object>>) estados);
        } else {
            envio.setEstadoEnvio(new ArrayList<>());
        }

        return envio;
    }
}