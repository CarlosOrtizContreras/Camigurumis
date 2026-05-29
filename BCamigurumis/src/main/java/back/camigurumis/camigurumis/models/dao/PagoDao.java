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
import back.camigurumis.camigurumis.models.entities.Pago;

@Service
public class PagoDao {

    private final Firestore db;

    public PagoDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarPago(Pago pago) {

        Map<String, Object> data = new HashMap<>();
        data.put("idPago", pago.getIdPago());
        data.put("fechaPago", pago.getFechaPago().toString());
        data.put("idFactura", pago.getIdFactura());
        data.put("estadoPago", pago.getEstadoPago());

        ApiFuture<WriteResult> future = db.collection("pagos")
                .document(pago.getIdPago())
                .set(data);

        try {
            System.out.println("Pago guardado en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    public List<Pago> listarPagos() {

        List<Pago> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("pagos").get();

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

    public Pago buscarPago(String id) {

        DocumentReference docRef = db.collection("pagos").document(id);

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


    public void eliminarPago(String id) {

        DocumentReference docRef = db.collection("pagos").document(id);

        ApiFuture<WriteResult> future = docRef.delete();

        try {
            System.out.println("Pago eliminado en: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo de error: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    private Pago obtenerDatos(DocumentSnapshot document) {

        Pago pago = new Pago();

        pago.setIdPago(document.getId());
        pago.setFechaPago(LocalDate.parse(document.getString("fechaPago")));
        pago.setIdFactura(document.getString("idFactura"));
        pago.setEstadoPago(document.getBoolean("estadoPago"));

        return pago;
    }
}