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
import back.camigurumis.camigurumis.models.entities.Factura;

@Service
public class FacturaDao {

    private final Firestore db;

    public FacturaDao(FirestoreConfig firestoreConfig) {
        this.db = firestoreConfig.getFirestore();
    }

    public void ingresarFactura(Factura factura) {

        Map<String, Object> data = new HashMap<>();
        data.put("idFactura", factura.getIdFactura());
        data.put("total", factura.getTotal());
        data.put("precioEnvio", factura.getPrecioEnvio()); 
        data.put("fechaCompra", factura.getFechaCompra().toString());
        data.put("idEnvio", factura.getIdEnvio());

        data.put("usuario", factura.getUsuario());
        data.put("listaAmigurumi", factura.getListaAmigurumi());

        ApiFuture<WriteResult> future = db.collection("facturas")
                .document(factura.getIdFactura())
                .set(data);

        try {
            System.out.println("Factura guardada: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            Throwable causa = e.getCause();
            System.out.println("Tipo: " + causa.getClass().getName());
            System.out.println("Mensaje: " + causa.getMessage());
        }
    }

    @SuppressWarnings({ "null", "unchecked" })
    public List<Factura> listarFacturas() {

        List<Factura> lista = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("facturas").get();
        List<QueryDocumentSnapshot> documents = null;

        try {
            documents = future.get().getDocuments();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        if (!documents.isEmpty()) {
            for (QueryDocumentSnapshot doc : documents) {

                Factura factura = new Factura();

                factura.setIdFactura(doc.getId().toString());
                factura.setTotal(Integer.parseInt(doc.getData().get("total").toString()));
                factura.setPrecioEnvio(Integer.parseInt(doc.getData().get("precioEnvio").toString())); 
                factura.setFechaCompra(LocalDate.parse(doc.getData().get("fechaCompra").toString()));
                factura.setIdEnvio(doc.getData().get("idEnvio").toString());

                factura.setUsuario(
                        (List<Map<String, Object>>) doc.getData().get("usuario"));

                factura.setListaAmigurumi(
                        (List<Map<String, Object>>) doc.getData().get("listaAmigurumi"));

                lista.add(factura);
            }
        }

        return lista;
    }

    public Factura buscarFactura(String idFactura) {

        DocumentReference docRef = db.collection("facturas").document(idFactura);

        DocumentSnapshot doc = null;

        try {
            doc = docRef.get().get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        return obtenerDatosFactura(doc);
    }

    @SuppressWarnings({ "null", "unchecked" })
    private Factura obtenerDatosFactura(DocumentSnapshot doc) {

        Factura factura = new Factura();

        factura.setIdFactura(doc.getId().toString());
        factura.setTotal(Integer.parseInt(doc.getData().get("total").toString()));
        factura.setPrecioEnvio(Integer.parseInt(doc.getData().get("precioEnvio").toString())); 
        factura.setFechaCompra(LocalDate.parse(doc.getData().get("fechaCompra").toString()));
        factura.setIdEnvio(doc.getData().get("idEnvio").toString());

        factura.setUsuario(
                (List<Map<String, Object>>) doc.getData().get("usuario"));

        factura.setListaAmigurumi(
                (List<Map<String, Object>>) doc.getData().get("listaAmigurumi"));

        return factura;
    }
}