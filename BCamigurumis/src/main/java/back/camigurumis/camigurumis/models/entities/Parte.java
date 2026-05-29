package back.camigurumis.camigurumis.models.entities;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Parte {
    private String idParte;
    private String nombre;
    private String descripcion;
    private List<String> color;
    private int precioExtra;
    private Boolean isActivo;

}
