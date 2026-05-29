package back.camigurumis.camigurumis.models.entities;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EstadoEnvio {
    private String idEstadoEnvio;
    private String nombre;
    private String descripcion;
}
