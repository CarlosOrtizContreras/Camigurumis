package back.camigurumis.camigurumis.config;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirestoreConfig {
    private Firestore db;

    @PostConstruct
    public void init() {
        try {
            db = iniciarFirebase();
        } catch (IOException e) {
            throw new RuntimeException("Error al inicializar Firebase", e);
        }
    }

    public Firestore getFirestore() {
        return db;
    }

    private Firestore iniciarFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials;

            String firebaseJson = System.getenv("FIREBASE_CREDENTIALS_JSON");

            if (firebaseJson != null && !firebaseJson.isEmpty()) {
                // Render: leer desde variable de entorno
                credentials = GoogleCredentials.fromStream(
                        new ByteArrayInputStream(firebaseJson.getBytes(StandardCharsets.UTF_8)));
            } else {
                // Local: leer desde archivo
                credentials = GoogleCredentials.fromStream(
                        new FileInputStream("camigurumis-82d23-firebase-adminsdk-fbsvc-022284bddf.json"));
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
        }

        return FirestoreClient.getFirestore();
    }
}