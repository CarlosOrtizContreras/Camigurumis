package back.camigurumis.camigurumis.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class TasaCambioController {

    @GetMapping("/api/tasa-cambio")
    public String obtenerTasaCambio() {

        RestTemplate restTemplate = new RestTemplate();

        String url =
            "https://api.exchangerate.host/latest?base=COP&symbols=USD";

        return restTemplate.getForObject(url, String.class);
    }
}