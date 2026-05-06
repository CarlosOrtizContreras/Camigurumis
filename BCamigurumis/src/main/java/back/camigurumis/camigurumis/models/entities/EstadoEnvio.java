package back.camigurumis.camigurumis.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EstadoEnvio {
    private String idEstadoEnvio;
    private String nombre;
    private String descripcion;
}
