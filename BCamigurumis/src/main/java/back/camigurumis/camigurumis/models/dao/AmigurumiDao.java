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

import back.camigurumis.camigurumis.models.entities.Amigurumi;

@Service
public class AmigurumiDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public AmigurumiDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INSERTAR ----------------
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
        data.put("imagen", amigurumi.getImagen());

        ApiFuture<WriteResult> result = db.collection("amigurumis")
                .document(String.valueOf(amigurumi.getIdAmigurumi()))
                .set(data);

        try {
            System.out.println("✔ Documento guardado: " + result.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error al guardar en Firebase: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Amigurumi> listarAmigurumi() {

        List<Amigurumi> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("amigurumis").get();

        try {
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (documents == null || documents.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot document : documents) {
                lista.add(convertir(document));
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error al listar: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public Amigurumi buscarAmigurumi(String idAmigurumi) {

        DocumentReference docRef = db.collection("amigurumis").document(idAmigurumi);
        ApiFuture<DocumentSnapshot> future = docRef.get();

        try {
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                return convertir(document);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error al buscar: " + e.getMessage());
        }

        return null;
    }

    // ---------------- ELIMINAR (SOFT DELETE) ----------------
    public void borrarAmigurumi(String idAmigurumi) {

        Amigurumi amigurumi = buscarAmigurumi(idAmigurumi);

        if (amigurumi == null)
            return;

        amigurumi.setFechaModificacion(LocalDate.now());
        amigurumi.setIsActivo(false);

        ingresarAmigurumi(amigurumi);
    }

    // ---------------- CONVERTIR ----------------
    private Amigurumi convertir(DocumentSnapshot document) {

        Map<String, Object> data = document.getData();
        if (data == null)
            return null;

        Amigurumi a = new Amigurumi();

        a.setIdAmigurumi(document.getId());
        a.setNombre(String.valueOf(data.get("nombre")));
        a.setDisponibilidad(Boolean.parseBoolean(String.valueOf(data.get("disponibilidad"))));
        a.setIsActivo(Boolean.parseBoolean(String.valueOf(data.get("isActivo"))));
        a.setDescripcion(String.valueOf(data.get("descripcion")));

        a.setFechaCreacion(LocalDate.parse(String.valueOf(data.get("fechaCreacion"))));
        a.setFechaModificacion(LocalDate.parse(String.valueOf(data.get("fechaModificacion"))));

        a.setPrecioBase(Integer.parseInt(String.valueOf(data.get("precioBase"))));

        a.setPartesModificables((List<String>) data.get("partesModificables"));

        a.setImagen(String.valueOf(data.get("imagen")));

        return a;
    }
}