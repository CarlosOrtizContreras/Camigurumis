package back.camigurumis.camigurumis.config;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

@Configuration
public class FirestoreConfig {

    @Bean
    public Firestore firestore() {

        try {

            if (FirebaseApp.getApps().isEmpty()) {

                GoogleCredentials credentials;

                String firebaseJson = System.getenv("FIREBASE_CREDENTIALS_JSON");

                if (firebaseJson != null && !firebaseJson.isBlank()) {

                    credentials = GoogleCredentials.fromStream(
                            new ByteArrayInputStream(
                                    firebaseJson.getBytes(StandardCharsets.UTF_8)));

                } else {

                    File archivo = new File(
                            "camigurumis-82d23-firebase-adminsdk-fbsvc-022284bddf.json");

                    credentials = GoogleCredentials.fromStream(
                            new FileInputStream(archivo));
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setProjectId("camigurumis-82d23")
                        .build();

                FirebaseApp.initializeApp(options);
            }

            return FirestoreClient.getFirestore();

        } catch (Exception e) {
            throw new RuntimeException("Error inicializando Firestore", e);
        }
    }
}