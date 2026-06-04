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

import back.camigurumis.camigurumis.models.entities.Factura;

@Service
public class FacturaDao {

    private final Firestore db;

    // ✅ INYECCIÓN CORRECTA
    public FacturaDao(Firestore db) {
        this.db = db;
    }

    // ---------------- INGRESAR ----------------
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
            System.out.println("✔ Factura guardada: " + future.get().getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error guardando factura: " + e.getMessage());
        }
    }

    // ---------------- LISTAR ----------------
    public List<Factura> listarFacturas() {

        List<Factura> lista = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("facturas").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (documents == null || documents.isEmpty()) {
                return lista;
            }

            for (QueryDocumentSnapshot doc : documents) {
                Factura factura = convertir(doc);
                if (factura != null)
                    lista.add(factura);
            }

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error listando facturas: " + e.getMessage());
        }

        return lista;
    }

    // ---------------- BUSCAR ----------------
    public Factura buscarFactura(String idFactura) {

        try {
            DocumentSnapshot doc = db.collection("facturas")
                    .document(idFactura)
                    .get()
                    .get();

            if (!doc.exists()) {
                return null;
            }

            return convertir(doc);

        } catch (InterruptedException | ExecutionException e) {
            System.out.println("❌ Error buscando factura: " + e.getMessage());
        }

        return null;
    }

    // ---------------- CONVERTIR ----------------
    private Factura convertir(DocumentSnapshot doc) {

        if (doc == null || !doc.exists() || doc.getData() == null) {
            return null;
        }

        Map<String, Object> data = doc.getData();

        Factura factura = new Factura();

        factura.setIdFactura(doc.getId());
        factura.setTotal(Integer.parseInt(String.valueOf(data.get("total"))));
        factura.setPrecioEnvio(Integer.parseInt(String.valueOf(data.get("precioEnvio"))));
        factura.setFechaCompra(LocalDate.parse(String.valueOf(data.get("fechaCompra"))));
        factura.setIdEnvio(String.valueOf(data.get("idEnvio")));

        // ⚠️ Manejo seguro de estructuras complejas
        Object usuario = data.get("usuario");
        factura.setUsuario(usuario instanceof List ? (List<Map<String, Object>>) usuario : new ArrayList<>());

        Object lista = data.get("listaAmigurumi");
        factura.setListaAmigurumi(lista instanceof List ? (List<Map<String, Object>>) lista : new ArrayList<>());

        return factura;
    }
}