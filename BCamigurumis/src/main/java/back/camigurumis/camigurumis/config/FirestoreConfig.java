package back.camigurumis.camigurumis.config;

import java.io.FileInputStream;
import java.io.IOException;

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
        if (FirebaseApp.getApps().isEmpty()) { // Evita inicialización múltiple
            FileInputStream serviceAccount = new FileInputStream(
                    "camigurumis-82d23-firebase-adminsdk-fbsvc-69322628b2.json");

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))

                    .build();

            FirebaseApp.initializeApp(options);
        }

        return FirestoreClient.getFirestore();
    }
}