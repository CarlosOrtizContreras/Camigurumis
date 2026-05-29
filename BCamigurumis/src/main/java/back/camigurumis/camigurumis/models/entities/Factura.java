package back.camigurumis.camigurumis.models.entities;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Factura {
    private String idFactura;
    private List<Map<String,Object>> listaAmigurumi;
    private List<Map<String, Object>> usuario;
    private int total;
    private LocalDate fechaCompra;
    private String idEnvio;
    private int precioEnvio;
}
