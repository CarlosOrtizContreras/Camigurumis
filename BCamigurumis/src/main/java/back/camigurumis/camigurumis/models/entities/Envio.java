package back.camigurumis.camigurumis.models.entities;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Envio {
    private String idEnvio;
    private String direccion;
    private List<Map<String, Object>> estadoEnvio;
    private int costoEnvio;
}
