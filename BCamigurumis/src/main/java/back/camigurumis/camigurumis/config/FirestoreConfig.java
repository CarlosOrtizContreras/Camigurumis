package back.camigurumis.camigurumis.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class FirestoreConfig {

    private Firestore firestore;

    @PostConstruct
    public void init() {

        try {
            // Cargar archivo desde resources
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase.json");

            if (serviceAccount == null) {
                throw new RuntimeException("No se encontró firebase.json en resources");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            this.firestore = FirestoreOptions.getDefaultInstance()
                    .toBuilder()
                    .setProjectId("camigurumis-82d23") // cambia si aplica
                    .build()
                    .getService();

            System.out.println("✔ Firebase inicializado correctamente");

        } catch (Exception e) {
            throw new RuntimeException("Error al inicializar Firebase", e);
        }
    }

    @Bean
    public Firestore getFirestore() {
        return firestore;
    }
}