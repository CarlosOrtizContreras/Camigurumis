package back.camigurumis.camigurumis.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Color {
    private String idColor;
    private String nombre;
    private String codigoColor;
    private String descripcion; 
    private Boolean isActivo;
}
