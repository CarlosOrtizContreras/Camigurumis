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
import back.camigurumis.camigurumis.models.entities.Color;

@Service
public class ColorDao {
    private final Firestore db;

    public ColorDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarColor(Color color) {
        Map<String, Object> data = new HashMap<>();
        data.put("idColor", color.getIdColor());
        data.put("nombre", color.getNombre());
        data.put("codigoColor", color.getCodigoColor());
        data.put("isActivo", color.getIsActivo());
        data.put("descripcion", color.getDescripcion());
        
        ApiFuture<WriteResult> addedDocRef = db.collection("colores")
                .document(String.valueOf(color.getIdColor())).set(data);

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

    public List<Color> listarColores() {

        List<Color> colores = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("colores").get();

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
                Color color = new Color();
                color.setIdColor(document.getId().toString());
                color.setNombre(document.getData().get("nombre").toString());
                color.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
                color.setDescripcion(document.getData().get("descripcion").toString());
                color.setCodigoColor(document.getData().get("codigoColor").toString());
                colores.add(color);
            }

        }
        return colores;
    }

    public void borrarColor(String idColor) {
        DocumentReference docRef = db.collection("colores").document(String.valueOf(idColor));

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
        Color color = obtenerDatosColor(document);

        color.setIsActivo(false);
        ingresarColor(color);
    }

    public Color obtenerDatosColor(String idColor) {
        DocumentReference docRef = db.collection("colores").document(String.valueOf(idColor));

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
       return obtenerDatosColor(document);
    }

    public Boolean buscarColor(String idColor) {
        DocumentReference docRef = db.collection("colores").document(String.valueOf(idColor));

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
        if(document.exists()){
            return true;
        }else{
            return false;
        }
    }


    private Color obtenerDatosColor(DocumentSnapshot document) {
        Color color = new Color();
        color.setIdColor(document.getId().toString());
        color.setNombre(document.getData().get("nombre").toString());
        color.setIsActivo(Boolean.parseBoolean(document.getData().get("isActivo").toString()));
        color.setDescripcion(document.getData().get("descripcion").toString());
        color.setCodigoColor(document.getData().get("codigoColor").toString());

        return color;
    }
    
}
