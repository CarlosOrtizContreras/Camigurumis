package back.camigurumis.camigurumis.models.entities;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Amigurumi {
    private String idAmigurumi;
    private String nombre;
    private Boolean disponibilidad;
    private Boolean isActivo;
    private String descripcion;
    private LocalDate fechaCreacion;
    private LocalDate fechaModificacion;
    private List<String> partesModificables;
    private int precioBase;
}
