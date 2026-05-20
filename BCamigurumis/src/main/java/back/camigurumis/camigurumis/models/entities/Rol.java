package back.camigurumis.camigurumis.models.entities;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class Rol {
    private String idRol;
    private String nombre;
    private String descripcion;
    private List<String> permiso;

    
}
