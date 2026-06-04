package back.camigurumis.camigurumis.models.dao;

import java.util.ArrayList;
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

import back.camigurumis.camigurumis.models.entities.Color;

@Service
public class ColorDao {

    private final Firestore db;

    public ColorDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INSERTAR ----------------
    public void ingresarColor(Color color) {

        Map<String, Object> data = Map.of(
                "idColor", color.getIdColor(),
                "nombre", color.getNombre(),
                "codigoColor", color.getCodigoColor(),
                "isActivo", color.getIsActivo(),
                "descripcion", color.getDescripcion());

        try {
            ApiFuture<WriteResult> result = db.collection("colores")
                    .document(color.getIdColor())
                    .set(data);

            System.out.println("✔ Color guardado: " + result.get().getUpdateTime());

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando color: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Color> listarColores() {

        List<Color> colores = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("colores").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (documents == null || documents.isEmpty()) {
                return colores;
            }

            for (QueryDocumentSnapshot document : documents) {
                Color color = convertir(document);
                if (color != null) {
                    colores.add(color);
                }
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando colores: " + e.getMessage());
        }

        return colores;
    }

    // ---------------- BUSCAR (ESTE ES EL QUE TE FALTABA) ----------------
    public Color obtenerColor(String idColor) {

        try {
            DocumentSnapshot document = db.collection("colores")
                    .document(idColor)
                    .get()
                    .get();

            if (document.exists()) {
                return convertir(document);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando color: " + e.getMessage());
        }

        return null;
    }

    // ---------------- EXISTE ----------------
    public Boolean buscarColor(String idColor) {

        try {
            DocumentSnapshot document = db.collection("colores")
                    .document(idColor)
                    .get()
                    .get();

            return document.exists();

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error verificando color: " + e.getMessage());
        }

        return false;
    }

    // ---------------- ELIMINAR (SOFT DELETE) ----------------
    public void borrarColor(String idColor) {

        Color color = obtenerColor(idColor);

        if (color == null)
            return;

        color.setIsActivo(false);

        ingresarColor(color);
    }

    // ---------------- CONVERTIR ----------------
    private Color convertir(DocumentSnapshot document) {

        if (document == null || !document.exists() || document.getData() == null) {
            return null;
        }

        Map<String, Object> data = document.getData();

        Color color = new Color();

        color.setIdColor(document.getId());
        color.setNombre(String.valueOf(data.get("nombre")));
        color.setCodigoColor(String.valueOf(data.get("codigoColor")));
        color.setIsActivo(Boolean.parseBoolean(String.valueOf(data.get("isActivo"))));
        color.setDescripcion(String.valueOf(data.get("descripcion")));

        return color;
    }
}