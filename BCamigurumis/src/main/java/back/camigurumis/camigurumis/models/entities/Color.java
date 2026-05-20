package back.camigurumis.camigurumis.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Color {
    private String idColor;
    private String nombre;
    private String codigoColor;
    private String descripcion; 
    private Boolean isActivo;
}
