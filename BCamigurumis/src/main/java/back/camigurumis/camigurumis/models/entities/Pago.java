package back.camigurumis.camigurumis.models.entities;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class Pago {
    private String idPago;
    private LocalDate fechaPago;
    private String idFactura;
    private Boolean estadoPago;
}
