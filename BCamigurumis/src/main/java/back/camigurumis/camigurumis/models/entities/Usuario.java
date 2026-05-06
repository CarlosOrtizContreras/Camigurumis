package back.camigurumis.camigurumis.models.entities;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class Usuario {
    private String idUsuario;
    private String nombre;
    private String primerApellido, segundoApellido, Telefono, Correo;
    private LocalDate fechaCreacion;
    private Boolean isAdmin;
    private Boolean isActivo;
    private String password;
}
