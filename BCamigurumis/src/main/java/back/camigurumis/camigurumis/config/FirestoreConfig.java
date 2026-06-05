package back.camigurumis.camigurumis.config;

import java.io.ByteArrayInputStream;
import java.util.Base64;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirestoreConfig {

    @PostConstruct
    public void initFirebase() {
        try {

            if (FirebaseApp.getApps().isEmpty()) {

                String base64 = System.getenv("FIREBASE_CREDENTIALS_BASE64");

                if (base64 == null || base64.isBlank()) {
                    throw new RuntimeException(
                            "No existe FIREBASE_CREDENTIALS_BASE64");
                }

                byte[] decoded = Base64.getDecoder().decode(base64);

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(
                                GoogleCredentials.fromStream(
                                        new ByteArrayInputStream(decoded)
                                )
                        )
                        .build();

                FirebaseApp.initializeApp(options);
            }

        } catch (Exception e) {
            throw new RuntimeException("Error al inicializar Firebase", e);
        }
    }

    @Bean
    public Firestore firestore() {
        return FirestoreClient.getFirestore();
    }
}