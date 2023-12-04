package academic.kme;

import academic.kme.controller.MainController;
import academic.kme.model.Document.Document;
import jakarta.persistence.Query;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.stage.Stage;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import java.util.ArrayList;
import java.util.List;

public class MainApplication extends Application {
    private SessionFactory factory;
    private MainController controller;

    private void handleFatalException(Exception exception) throws Exception {
        throw exception;
        // Alert alert = new Alert(Alert.AlertType.ERROR, exception.getMessage(), ButtonType.OK);
        // alert.setTitle("Fatal Error");
        // alert.show();
    }

    @Override
    public void start(Stage stage) throws Exception {
        try {
            String databasePath = "src/main/java/academic/kme/sandbox/sandbox.db";
            try {
                factory = new Configuration().configure("hibernate.cfg.xml").setProperty("hibernate.connection.url", "jdbc:sqlite:" + databasePath).buildSessionFactory();
            } catch (Throwable ex) {
                System.err.println("Failed to create factory object." + ex);
                throw new ExceptionInInitializerError(ex);
            }
            List<Document> documents = new ArrayList<>();
            try (Session session = factory.openSession()) {
                session.beginTransaction();

                String hql = "FROM Document";
                Query query = session.createQuery(hql, Document.class);
                for (Object object : query.getResultList()) {
                    if (!(object instanceof Document)) {
                        break;
                    }
                    documents.add((Document) object);
                }

                session.getTransaction().commit();
            }
            if (documents.size() > 1) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Corrupt File");
                alert.setContentText("Cannot open file because it is corrupted.");
                alert.show();
                return;
            }
            if (documents.size() == 1) {

            }

            FXMLLoader fxmlLoader = new FXMLLoader(MainApplication.class.getResource("main-view.fxml"));
            Scene scene = new Scene(fxmlLoader.load(), 1280, 720);
            controller = fxmlLoader.getController();
            scene.setOnKeyPressed(controller::onKeyPressed);
            scene.setOnKeyTyped(controller::onKeyTyped);
            controller.setDocument(documents.stream().findFirst().orElse(Document.getDefaultDocument()));
            controller.updatePane();

            stage.setTitle("KME");
            stage.setScene(scene);
            stage.show();
        }
        catch (Exception exception) {
            handleFatalException(exception);
        }
    }

    @Override
    public void stop() throws Exception {
        try {
            try (Session session = factory.openSession()) {
                session.beginTransaction();

                Document document = controller.getDocument();
                if (document != null) {
                    if (session.get(Document.class, document.getId()) != null) {
                        session.merge(document);
                    } else {
                        session.persist(document);
                    }
                }

                session.getTransaction().commit();
            }
            factory.close();
        }
        catch (Exception exception) {
            handleFatalException(exception);
        }
    }

    public static void main(String[] args) {
        launch();
    }
}