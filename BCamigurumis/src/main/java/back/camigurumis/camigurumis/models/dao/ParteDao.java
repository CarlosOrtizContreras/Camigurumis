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

import back.camigurumis.camigurumis.models.entities.Parte;

@Service
public class ParteDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public ParteDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
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
            System.out.println("✔ Parte guardada: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando parte: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Parte> listarPartes() {

        List<Parte> lista = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("partes").get();
            List<QueryDocumentSnapshot> documentos = future.get().getDocuments();

            if (documentos == null || documentos.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot doc : documentos) {
                Parte parte = convertir(doc);
                if (parte != null)
                    lista.add(parte);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando partes: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public Parte buscarParte(String id) {

        try {
            DocumentSnapshot doc = db.collection("partes")
                    .document(id)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando parte: " + e.getMessage());
        }

        return null;
    }

    // ---------------- ELIMINAR (SOFT DELETE) ----------------
    public void eliminarParte(String id) {

        try {
            DocumentSnapshot doc = db.collection("partes")
                    .document(id)
                    .get()
                    .get();

            if (!doc.exists()) {
                return;
            }

            Parte parte = convertir(doc);

            if (parte == null)
                return;

            parte.setIsActivo(false);

            ingresarParte(parte);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error eliminando parte: " + e.getMessage());
        }
    }

    // ---------------- CONVERTIR ----------------
    @SuppressWarnings("unchecked")
    private Parte convertir(DocumentSnapshot document) {

        if (document == null || !document.exists() || document.getData() == null) {
            return null;
        }

        Map<String, Object> data = document.getData();

        Parte parte = new Parte();

        parte.setIdParte(document.getId());
        parte.setNombre(String.valueOf(data.get("nombre")));
        parte.setDescripcion(String.valueOf(data.get("descripcion")));

        Object color = data.get("color");
        if (color instanceof List) {
            parte.setColor((List<String>) color);
        } else {
            parte.setColor(new ArrayList<>());
        }

        Object precio = data.get("precioExtra");
        parte.setPrecioExtra(precio != null ? Integer.parseInt(precio.toString()) : 0);

        Object activo = data.get("isActivo");
        parte.setIsActivo(activo != null ? Boolean.parseBoolean(activo.toString()) : false);

        return parte;
    }
}