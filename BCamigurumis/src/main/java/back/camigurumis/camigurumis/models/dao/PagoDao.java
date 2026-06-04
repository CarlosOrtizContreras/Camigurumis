package back.camigurumis.camigurumis.models.dao;

import java.time.LocalDate;
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

import back.camigurumis.camigurumis.models.entities.Pago;

@Service
public class PagoDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public PagoDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
    public void ingresarPago(Pago pago) {

        Map<String, Object> data = Map.of(
                "idPago", pago.getIdPago(),
                "fechaPago", pago.getFechaPago() != null ? pago.getFechaPago().toString() : null,
                "idFactura", pago.getIdFactura(),
                "estadoPago", pago.getEstadoPago());

        ApiFuture<WriteResult> future = db.collection("pagos")
                .document(pago.getIdPago())
                .set(data);

        try {
            System.out.println("✔ Pago guardado: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando pago: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Pago> listarPagos() {

        List<Pago> lista = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("pagos").get();
            List<QueryDocumentSnapshot> documentos = future.get().getDocuments();

            if (documentos == null || documentos.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot doc : documentos) {
                Pago pago = convertir(doc);
                if (pago != null)
                    lista.add(pago);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando pagos: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public Pago buscarPago(String id) {

        try {
            DocumentSnapshot doc = db.collection("pagos")
                    .document(id)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando pago: " + e.getMessage());
        }

        return null;
    }

    // ---------------- ELIMINAR ----------------
    public void eliminarPago(String id) {

        try {
            ApiFuture<WriteResult> future = db.collection("pagos")
                    .document(id)
                    .delete();

            System.out.println("✔ Pago eliminado: " + future.get().getUpdateTime());

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error eliminando pago: " + e.getMessage());
        }
    }

    // ---------------- CONVERTIR ----------------
    private Pago convertir(DocumentSnapshot document) {

        if (document == null || !document.exists() || document.getData() == null) {
            return null;
        }

        Map<String, Object> data = document.getData();

        Pago pago = new Pago();

        pago.setIdPago(document.getId());

        Object fecha = data.get("fechaPago");
        pago.setFechaPago(fecha != null ? LocalDate.parse(fecha.toString()) : null);

        pago.setIdFactura(String.valueOf(data.get("idFactura")));

        Object estado = data.get("estadoPago");
        pago.setEstadoPago(estado != null ? Boolean.parseBoolean(estado.toString()) : false);

        return pago;
    }
}