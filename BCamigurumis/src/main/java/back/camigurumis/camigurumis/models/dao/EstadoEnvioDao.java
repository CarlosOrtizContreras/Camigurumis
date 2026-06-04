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

import back.camigurumis.camigurumis.models.entities.EstadoEnvio;

@Service
public class EstadoEnvioDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public EstadoEnvioDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
    public void ingresarEstadoEnvio(EstadoEnvio estadoEnvio) {

        Map<String, Object> data = new HashMap<>();
        data.put("idEstadoEnvio", estadoEnvio.getIdEstadoEnvio());
        data.put("nombre", estadoEnvio.getNombre());
        data.put("descripcion", estadoEnvio.getDescripcion());

        ApiFuture<WriteResult> future = db.collection("estadoEnvio")
                .document(estadoEnvio.getIdEstadoEnvio())
                .set(data);

        try {
            System.out.println("✔ Guardado en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<EstadoEnvio> listarEstadoEnvio() {

        List<EstadoEnvio> lista = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("estadoEnvio").get();
            List<QueryDocumentSnapshot> documentos = future.get().getDocuments();

            if (documentos == null || documentos.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot doc : documentos) {
                lista.add(convertir(doc));
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public EstadoEnvio buscarEstadoEnvio(String id) {

        try {
            DocumentSnapshot doc = db.collection("estadoEnvio")
                    .document(id)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando: " + e.getMessage());
        }

        return null;
    }

    // ---------------- ELIMINAR ----------------
    public void eliminarEstadoEnvio(String id) {

        try {
            ApiFuture<WriteResult> future = db.collection("estadoEnvio")
                    .document(id)
                    .delete();

            System.out.println("✔ Eliminado en: " + future.get().getUpdateTime());

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error eliminando: " + e.getMessage());
        }
    }

    // ---------------- CONVERTIR ----------------
    private EstadoEnvio convertir(DocumentSnapshot document) {

        if (document == null || !document.exists()) {
            return null;
        }

        EstadoEnvio estado = new EstadoEnvio();

        estado.setIdEstadoEnvio(document.getId());
        estado.setNombre(document.getString("nombre"));
        estado.setDescripcion(document.getString("descripcion"));

        return estado;
    }
}